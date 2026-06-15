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
| Refresh workers / scripts  |
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
- Запускает скрипты актуализации данных по расписанию и по ручному запросу пользователя.
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
- `GET /auth/me` - текущий пользователь, его тип и связанная анкета, если она есть.
- `GET /employees` - список сотрудников.
- `GET /employees/:id` - карточка сотрудника.
- `PUT /employees/:id` - обновление анкеты; разрешено только владельцу этой анкеты.
- `POST /employees/:id/refresh` - поставить задачу актуализации информации по анкете.
- `GET /employees/:id/cv` - генерация CV, если CV будет формироваться на backend.
- `POST /auth/login` и `POST /auth/logout` - если редактирование требует авторизации.

Редактирование данных не стоит оставлять только в `localStorage`. Для официального сайта backend должен быть источником правды.

## Модель Доступа

На первой версии достаточно двух уровней пользователей.

| Уровень | Описание | Просмотр анкет | Редактирование |
| --- | --- | --- | --- |
| Обычный пользователь | Авторизованный пользователь, связанный с конкретной анкетой сотрудника | Может видеть все анкеты | Может редактировать только свою анкету |
| Посетитель | Авторизованный пользователь без связанной анкеты | Может видеть все анкеты | Не может редактировать анкеты |

Правило должно проверяться на backend, а не только в интерфейсе. Frontend может скрывать кнопку редактирования, но API обязан повторно проверять право на каждое изменение.

Рекомендуемая логика:

- У пользователя есть запись в `users`.
- Если пользователь является сотрудником, у него заполнено поле связи `employee_id`.
- Если `employee_id` пустой, пользователь считается посетителем.
- `GET /employees` и `GET /employees/:id` доступны обоим уровням.
- `PUT /employees/:id` разрешен только если `users.employee_id` совпадает с `:id`.
- `POST /employees/:id/refresh` доступен обоим уровням, но backend применяет rate limit по анкете.
- Посетитель при попытке редактирования получает `403 Forbidden`.

## Актуализация Информации

Для каждой анкеты нужен механизм периодического обновления данных. Базовое правило для первой версии: автоматическая актуализация не чаще одного раза в сутки на одну анкету.

Источники запуска:

- Плановая задача backend/scheduler раз в сутки проверяет анкеты, которые нужно обновить.
- Любой авторизованный пользователь видит кнопку "Актуализировать инфо" в интерфейсе.
- Нажатие кнопки вызывает `POST /employees/:id/refresh`.
- Backend не запускает скрипт синхронно в HTTP-запросе, а ставит задачу в очередь.

Ограничения:

- Rate limit считается по анкете, а не только по пользователю.
- Если анкета уже обновлялась за последние 24 часа, API возвращает текущий статус и время следующей доступной актуализации.
- Если задача уже выполняется, повторное нажатие не создает дубль.
- Скрипты актуализации запускаются только на backend-VM, не на frontend-VM.
- Все результаты актуализации пишутся в audit log.

Минимальные статусы задачи:

- `queued` - задача поставлена в очередь.
- `running` - скрипт актуализации выполняется.
- `completed` - данные обновлены.
- `failed` - задача завершилась ошибкой, ошибка сохранена для диагностики.
- `skipped_rate_limited` - обновление не запущено из-за суточного лимита.

Рекомендуемые поля для анкеты:

- `last_refreshed_at`
- `refresh_status`
- `next_refresh_available_at`

Отдельная таблица `refresh_jobs` нужна, чтобы видеть историю запусков, ошибки и пользователя, который запросил ручную актуализацию.

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
- `users` с nullable-связью `employee_id`
- `refresh_jobs`
- `audit_events`

## Безопасность

- Backend не имеет публичного доступа.
- Все внешние запросы идут только через HTTPS на frontend-VM.
- API доступен снаружи только через `/api/*` reverse proxy.
- На backend включить allowlist по private IP frontend-VM.
- Для редактирования данных нужна авторизация.
- Backend должен проверять, что пользователь редактирует только свою анкету.
- Посетители без связанной анкеты получают доступ только на чтение.
- Ручная актуализация доступна всем авторизованным пользователям, но backend обязан применять rate limit и дедупликацию задач.
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
| Пользователи часто нажимают актуализацию и перегружают backend | Rate limit на анкету, очередь задач и дедупликация активных refresh jobs |
| Утечка private IP или секретов в frontend | Использовать относительный `/api`, не собирать secrets во frontend bundle |
| Потеря данных на backend-VM | Ежедневные backup, проверка restore, вынесение DB в managed service |

## Рекомендуемый Порядок Реализации

1. Оставить frontend как static SPA.
2. Добавить reverse proxy `/api/*` на frontend-VM.
3. Поднять backend API во внутренней сети.
4. Перенести mock-данные сотрудников в database.
5. Подключить frontend к `/api`.
6. Добавить авторизацию и связь `user -> employee`.
7. Ограничить редактирование правилом "только своя анкета".
8. Добавить очередь задач и endpoint ручной актуализации.
9. Добавить суточный rate limit актуализации по анкете.
10. Добавить audit log и backup.
11. После стабилизации вынести database в отдельный private managed service.
