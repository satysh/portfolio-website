# Архитектура Backend И Frontend На Двух VM

## Цель

Развернуть сайт так, чтобы публично доступна была только frontend-VM, а backend-VM оставалась доступной только из внутренней сети. Пользователь открывает сайт снаружи, но API-запросы идут через публичную frontend-VM, которая проксирует их на backend по private IP.

Главное ограничение: браузер внешнего пользователя не должен обращаться к private IP backend напрямую. Такой адрес недоступен из интернета и не должен быть публичным.

## Схема

```text
Internet
   |
   | HTTPS 443
   v
+----------------------------+
| Frontend VM                |
| Public IP                  |
| Nginx / Caddy              |
| Static SPA: dist/          |
| Reverse proxy: /api/*      |
+-------------+--------------+
              |
              | HTTP/TLS, private subnet only
              v
+----------------------------+
| Backend VM                 |
| Private IP only            |
| API service                |
| Database / local storage   |
| Backups / migrations       |
+----------------------------+
```

## Компоненты

### Frontend VM

- Имеет public IP и домен сайта.
- Принимает только `80/443` из интернета.
- Отдает production-сборку React/Vite из `dist/`.
- Делает SPA fallback на `index.html`.
- Проксирует `/api/*` на backend-VM по private IP.
- Завершает внешний TLS через Let's Encrypt или managed certificate.

### Backend VM

- Не имеет public IP или закрыта firewall/security group от внешнего доступа.
- Принимает API-запросы только от private IP frontend-VM.
- Слушает private interface, например `10.0.1.20:8080`.
- Хранит бизнес-логику, данные сотрудников, авторизацию, аудит изменений.
- На первой версии база может жить на этой же VM; позже ее лучше вынести в отдельный managed/private database.

## Поток Запроса

1. Пользователь открывает `https://example.com`.
2. Frontend VM отдает React-приложение.
3. Приложение вызывает API по относительному адресу: `/api/employees`.
4. Nginx на frontend-VM проксирует запрос на `http://10.0.1.20:8080/employees`.
5. Backend отвечает frontend-VM.
6. Frontend-VM возвращает ответ браузеру.

Такой подход убирает CORS-сложность и не раскрывает backend наружу.

## Сетевые Правила

| Узел | Входящие правила | Исходящие правила |
| --- | --- | --- |
| Frontend VM | `80/tcp` и `443/tcp` из интернета; `22/tcp` только с админского IP/VPN | Backend private IP на API-порт; package registry; monitoring |
| Backend VM | API-порт только с private IP frontend-VM; `22/tcp` только с админского IP/VPN/bastion | Package registry; backup storage; monitoring |
| Database, если отдельно | DB-порт только с backend-VM | Backup storage |

Backend API-порт не должен быть открыт в интернет.

## Nginx На Frontend VM

Пример для SPA и reverse proxy:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    root /var/www/portfolio-website/dist;
    index index.html;

    location /api/ {
        proxy_pass http://10.0.1.20:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Frontend-код должен обращаться к API как к относительному URL:

```js
fetch('/api/employees')
```

Не нужно зашивать private IP backend в frontend bundle.

## Backend API

Минимальный набор модулей для первой версии:

- `GET /health` - healthcheck для proxy/monitoring.
- `GET /employees` - список сотрудников.
- `GET /employees/:id` - карточка сотрудника.
- `PUT /employees/:id` - обновление анкеты.
- `GET /employees/:id/cv` - генерация CV, если CV будет формироваться на backend.
- `POST /auth/login` и `POST /auth/logout` - если редактирование требует авторизации.

Редактирование данных не стоит оставлять только в `localStorage`. Для официального сайта backend должен быть источником правды.

## Хранение Данных

Для первой версии:

- PostgreSQL на backend-VM или managed PostgreSQL в private network.
- Миграции через backend-приложение.
- Ежедневный backup базы.
- Отдельная таблица audit log для изменений анкет.

Минимальные сущности:

- `employees`
- `publications`
- `supervisors`
- `employee_activity`
- `users`
- `audit_events`

## Безопасность

- Backend не имеет публичного доступа.
- Все внешние запросы идут только через HTTPS на frontend-VM.
- API доступен снаружи только через `/api/*` reverse proxy.
- На backend включить allowlist по private IP frontend-VM.
- Для редактирования данных нужна авторизация.
- Для админ-доступа использовать VPN, bastion host или SSH allowlist по IP.
- Секреты хранить в env-файлах или secret manager, не в репозитории.
- Логи не должны содержать персональные данные без необходимости.

## Деплой

### Frontend

1. Собрать приложение:

```bash
npm ci
npm run build
```

2. Скопировать `dist/` на frontend-VM.
3. Перезагрузить Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Backend

Рекомендуемый вариант для первой версии - Docker Compose на backend-VM:

```text
backend/
  docker-compose.yml
  .env
  migrations/
```

Деплой:

```bash
docker compose pull
docker compose up -d
docker compose run --rm api npm run migrate
```

Команды зависят от выбранного backend-стека.

## Мониторинг И Эксплуатация

Минимум для production:

- `/health` endpoint на backend.
- Проверка `https://example.com` снаружи.
- Логи Nginx на frontend-VM.
- Логи backend-приложения.
- Метрики CPU/RAM/disk.
- Backup базы и регулярная проверка восстановления.
- Alert на недоступность frontend, backend healthcheck и заполнение диска.

## Риски И Решения

| Риск | Решение |
| --- | --- |
| Frontend VM становится единой точкой отказа | На первой версии принять риск; позже добавить второй frontend instance и load balancer |
| Backend недоступен из-за firewall | Зафиксировать security group rules и healthcheck из frontend-VM |
| Данные редактируются только локально | Перенести сохранение в backend API |
| Утечка private IP или секретов в frontend | Использовать относительный `/api`, не собирать secrets во frontend bundle |
| Потеря данных на backend-VM | Ежедневные backup, проверка restore, вынесение DB в managed service |

## Рекомендуемый Порядок Реализации

1. Оставить frontend как static SPA.
2. Добавить reverse proxy `/api/*` на frontend-VM.
3. Поднять backend API во внутренней сети.
4. Перенести mock-данные сотрудников в database.
5. Подключить frontend к `/api`.
6. Добавить авторизацию для редактирования.
7. Добавить audit log и backup.
8. После стабилизации вынести database в отдельный private managed service.
