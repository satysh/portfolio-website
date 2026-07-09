# Документация Проекта

## 1. Назначение

Проект - внутренний портал сотрудников для организации. Основная задача: хранить и показывать карточки сотрудников, контакты, подразделения, должности, публикации, CV и служебную информацию по актуализации анкет.

Метрики нужны только для технического контроля: сервис работает, не деградирует, не падает и не получает аномальный поток запросов.

Сейчас приложение является статическим React/Vite frontend. Данные в коде представлены демо-массивом `src/data/employees.js`, а реальные исходные данные ожидаются в Excel-таблицах. Редактирование в текущем frontend сохраняется только в `localStorage`; для рабочего варианта нужен backend или другой централизованный слой хранения, чтобы изменения не жили только в браузере пользователя.

## 2. Текущее Состояние

- Frontend: React 18, React Router 6, Vite 5.
- Роуты: `/`, `/employee/:employeeId`.
- Данные в репозитории: 6 демо-анкет сотрудников.
- Реальный источник данных: Excel-таблицы с сотрудниками и связанными данными.
- Сборка: `npm run build`.
- Текущий frontend bundle после сборки:
  - `dist/index.html` - около 0.41 KB.
  - JS bundle - около 189.51 KB, gzip около 61.75 KB.
  - CSS bundle - около 6.42 KB, gzip около 1.91 KB.
- `dist/` - build-артефакт, руками не редактировать.

## 3. Целевая Архитектура Развертывания

Базовая схема берется из `docs/backend-architecture.md`: публична только frontend-VM, backend-VM находится в private network.

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
              | HTTP/TLS, private network
              v
+----------------------------+
| Backend VM                 |
| Private IP only            |
| API service                |
| Worker / scheduler         |
| Storage layer              |
| Metrics exporters          |
+----------------------------+
```

Главное правило: браузер пользователя не должен обращаться к private IP backend. Frontend вызывает API только по относительным адресам:

```js
fetch('/api/employees')
```

Nginx/Caddy на frontend-VM проксирует `/api/*` на backend-VM.

## 4. Рекомендация По Архитектуре Приложения

Для первой рабочей версии лучше выбрать модульный монолит.

Причина: проект небольшой, доменная модель простая, объем трафика неизвестен. Микросервисы на старте добавят сеть, деплой, observability, версионирование API, распределенные ошибки и более сложную эксплуатацию раньше, чем появится реальная польза.

### Монолит

Плюсы:

- проще разработка и отладка;
- один backend deploy;
- проще хранить и обновлять связанные данные;
- меньше инфраструктуры;
- быстрее получить рабочую систему.

Минусы:

- при росте сложнее независимо масштабировать части системы;
- неудачная внутренняя структура быстро превращается в большой связанный код;
- тяжелые задачи импорта и актуализации могут мешать API, если их не вынести хотя бы в отдельный worker-процесс.

### Микросервисы

Плюсы:

- независимое масштабирование API, workers и импорта;
- независимые релизы отдельных сервисов;
- проще изолировать ресурсоемкую актуализацию данных.

Минусы:

- сложнее деплой и мониторинг;
- нужны service discovery, контракты API, трассировка, централизованные логи;
- больше сетевых отказов;
- сложнее локальная разработка;
- выше требования к администрированию.

### Предлагаемый Компромисс

Начать с модульного монолита, но физически разделить runtime-процессы:

- `web` - HTTP API.
- `worker` - импорт Excel, актуализация анкет, фоновые задачи.
- `scheduler` - периодический запуск задач, можно встроить в worker на первом этапе.
- `storage` - выбранный слой хранения данных.
- `nginx` или `caddy` - reverse proxy на frontend-VM.

Код backend остается в одном репозитории и одной кодовой базе, но модули должны быть разделены логически:

- `auth` - пользователи, сессии, простая авторизация.
- `employees` - анкеты сотрудников.
- `publications` - публикации и внешние ссылки.
- `import` - загрузка и валидация Excel-таблиц.
- `refresh` - задачи актуализации.
- `audit` - журнал изменений.
- `metrics` - только технические метрики сервиса.
- `admin` - служебные endpoints для диагностики.

Если нагрузка вырастет, первыми кандидатами на выделение в отдельные сервисы будут:

- `import-service` - импорт Excel и валидация данных;
- `refresh-service` - тяжелые задачи актуализации и внешние интеграции;
- `cv-service` - если генерация CV станет тяжелой или потребует шаблонизации.

## 5. Backend API

Минимальный API для первой версии:

- `GET /health` - healthcheck.
- `GET /auth/me` - текущий пользователь.
- `POST /auth/login` - вход.
- `POST /auth/logout` - выход.
- `GET /employees` - список сотрудников.
- `GET /employees/:id` - карточка сотрудника.
- `PUT /employees/:id` - обновление анкеты.
- `POST /employees/import` - загрузка или запуск импорта Excel.
- `POST /employees/:id/refresh` - поставить задачу актуализации.
- `GET /employees/:id/cv` - скачать/сгенерировать CV.
- `GET /metrics` - Prometheus metrics, закрыть от публичного доступа.

Правила доступа:

- просмотр анкет доступен авторизованным пользователям;
- редактирование своей анкеты разрешено пользователю, связанному с этой анкетой;
- посетитель без связанной анкеты может смотреть, но не редактировать;
- backend обязан проверять права на каждый write-запрос;
- frontend может скрывать кнопки, но не является источником безопасности;
- достаточно простой авторизации или заранее заведенных учетных записей.

## 6. Хранение Данных: Excel Сейчас, БД Как Возможный Следующий Шаг

Сейчас исходный источник данных - Excel-таблицы. Это важно учитывать в оценке объема, импорте, валидации и резервном копировании.

Варианты хранения:

| Вариант | Когда подходит | Ограничения |
| --- | --- | --- |
| Excel как источник правды + импорт в frontend/backend | Быстрый старт, данные уже ведутся в таблицах | Сложнее контролировать версии, права, одновременные изменения и аудит |
| Excel-файлы + backend-кеш в JSON | Очень простая read-only версия | Плохо подходит для редактирования и истории изменений |
| SQLite | Небольшая система, один backend instance, минимум администрирования | Не лучший выбор при одновременном редактировании и фоновых задачах |
| PostgreSQL self-hosted | Нужны права, аудит, история, поиск и надежное хранение | Нужно администрировать backup, обновления, мониторинг |
| Managed PostgreSQL | Нужна БД без ручного администрирования | Платно, зависит от провайдера |
| MySQL/MariaDB | Если команда лучше знает эту экосистему | Для текущей модели PostgreSQL выглядит гибче |

PostgreSQL бесплатен как open source: официальная лицензия PostgreSQL разрешает использовать, копировать, изменять и распространять ПО без оплаты. Но бесплатно именно ПО; сервер, диски, backup storage, администрирование и managed database у облачного провайдера могут стоить денег.

Рекомендация: на первом этапе описать и нормализовать Excel-источник, затем выбрать один из двух путей:

- read-only портал: Excel импортируется в JSON/SQLite, редактирование остается вне портала;
- портал с редактированием и аудитом: Excel используется как первичный импорт, а рабочее хранение переносится в PostgreSQL или аналогичную БД.

## 7. Минимальная Модель Данных

Если появится централизованное хранение, базовые сущности:

- `users`
- `employees`
- `employee_activity`
- `academic_degrees`
- `supervisors`
- `publications`
- `import_batches`
- `refresh_jobs`
- `audit_events`
- `sessions`

Рекомендуемые поля для `employees`:

- `id`
- `full_name`
- `short_name`
- `position`
- `email`
- `phone`
- `laboratory`
- `birth_date`
- `scopus_id`
- `wos_id`
- `orcid_id`
- `jinr_activity`
- `kazakhstan_activity`
- `contract_type`
- `contract_end_date`
- `last_refreshed_at`
- `refresh_status`
- `next_refresh_available_at`
- `created_at`
- `updated_at`

`audit_events` должен хранить:

- кто изменил данные;
- какую сущность изменили;
- какие поля изменились;
- старое и новое значение, если это допустимо по политике персональных данных;
- IP/request id;
- время события.

## 8. Flow Оценки Объема Данных

Точные цифры нужно получить до закупки ресурсов и выбора хранилища. Так как исходные данные лежат в Excel, оценку нужно начинать с инвентаризации файлов.

### Шаг 1. Инвентаризировать Excel-Файлы

Составить таблицу по каждому файлу:

- имя файла;
- назначение файла;
- размер файла;
- количество листов;
- количество строк на листе;
- количество колонок на листе;
- есть ли формулы;
- есть ли объединенные ячейки;
- есть ли вложенные файлы/изображения;
- кто обновляет файл;
- как часто обновляется файл;
- где хранится оригинал.

### Шаг 2. Посчитать Разделы Данных

Собрать прогноз на 1, 2 и 3 года:

- количество сотрудников;
- среднее число публикаций на сотрудника;
- максимальное число публикаций на сотрудника;
- среднее число обновлений анкеты в месяц;
- среднее число refresh-запусков в день;
- число пользователей;
- срок хранения audit log, если редактирование будет внутри портала;
- срок хранения refresh history;
- срок хранения access logs и metrics.

### Шаг 3. Сделать Тестовый Импорт

Подготовить скрипт, который читает Excel и выводит:

- число строк по каждому листу;
- число непустых строк;
- список колонок;
- число пустых обязательных полей;
- число дублей по ФИО/email/id;
- размер нормализованного JSON;
- предупреждения по некорректным датам, телефонам и email.

Минимальный результат оценки:

```text
excel_files_total_size_mb =
json_export_total_size_mb =
employees_count =
publications_count =
invalid_rows_count =
duplicate_rows_count =
```

### Шаг 4. Если Выбирается PostgreSQL

После тестового импорта загрузить данные в тестовую PostgreSQL-БД и выполнить:

```sql
select pg_size_pretty(pg_total_relation_size('employees')) as employees_total;
select pg_size_pretty(pg_total_relation_size('publications')) as publications_total;
select pg_size_pretty(pg_total_relation_size('audit_events')) as audit_total;
select pg_size_pretty(pg_database_size(current_database())) as database_total;
```

Для оценки средней строки:

```sql
select avg(pg_column_size(t)) as avg_employee_row_bytes
from employees t;
```

Повторить для `publications`, `import_batches`, `refresh_jobs`, `audit_events`.

### Шаг 5. Посчитать Рост

Формула:

```text
годовой_объем =
  размер_excel_оригиналов
  + размер_нормализованных_данных
  + размер_import_history
  + размер_refresh_jobs_за_год
  + размер_audit_events_за_год
  + логи
  + метрики
  + backups
  + запас
```

Для диска VM закладывать запас минимум `x2`. Если используется PostgreSQL, дополнительно заложить место под индексы, WAL, bloat, миграции и временные операции.

### Предварительная Оценка

Для сотен или нескольких тысяч сотрудников сами анкеты, скорее всего, будут занимать мало места. На практике больше места могут занять:

- оригинальные Excel-файлы;
- backup-копии;
- access logs Nginx/Caddy;
- application logs;
- metrics storage;
- Docker images;
- временные файлы импорта;
- сгенерированные CV, если хранить их как файлы.

## 9. Flow Оценки Ресурсов

Нужно отдельно оценивать frontend, API, storage, workers, monitoring и CI/CD.

### Метрики Для Сбора

Минимальный набор:

- RPS: запросы в секунду;
- p50/p95/p99 latency;
- error rate;
- CPU usage;
- RAM usage;
- disk usage;
- disk IOPS;
- network in/out;
- storage connections, если используется БД;
- slow queries, если используется БД;
- queue length для import/refresh jobs;
- duration import/refresh jobs;
- размер logs/metrics в день.

### Шаги Оценки

1. Определить сценарии нагрузки:
   - открытие списка сотрудников;
   - открытие карточки;
   - поиск/фильтрация;
   - логин;
   - редактирование анкеты;
   - скачивание CV;
   - импорт Excel;
   - запуск актуализации.

2. Оценить пользователей:
   - ожидаемое число пользователей в день;
   - пиковое число одновременных пользователей;
   - ожидаемый RPS;
   - пиковые часы.

3. Поднять тестовый контур, близкий к рабочему серверу:
   - frontend-VM;
   - backend-VM;
   - выбранное хранилище;
   - monitoring.

4. Провести нагрузочные тесты:
   - `k6`, `autocannon`, `wrk` или GitLab CI job;
   - отдельно read-only сценарии;
   - отдельно write-сценарии, если редактирование будет в портале;
   - отдельно импорт Excel;
   - отдельно refresh jobs.

5. Зафиксировать ресурсные пороги:
   - CPU не выше 60-70% на нормальной нагрузке;
   - RAM с запасом минимум 30%;
   - диск не выше 70%;
   - p95 latency в целевом диапазоне;
   - хранилище не упирается в connections, locks или slow queries.

6. Повторить тест после загрузки реальных Excel-данных.

### GPU

Для текущего проекта GPU не нужен. Он может понадобиться только если актуализация данных будет запускать ML/LLM/OCR/парсинг PDF с тяжелой моделью. До появления такого требования GPU не закладывать в базовую инфраструктуру.

### Предварительная Конфигурация Для Старта

Для первой версии без тяжелых ML-задач:

- Frontend VM: 1 vCPU, 1 GB RAM, 10-20 GB disk.
- Backend VM: 2 vCPU, 2-4 GB RAM, 30-50 GB disk.
- Storage на backend-VM: допустимо для старта, но backup обязателен.
- Monitoring VM или контейнеры на backend/frontend: 1-2 vCPU, 2 GB RAM, диск зависит от retention.

Если backend, storage и monitoring живут на одной VM, лучше начинать с 2-4 vCPU, 4-8 GB RAM и 80+ GB disk.

## 10. Метрики, Логи И Наблюдаемость

Нужно заранее решить, где хранить и где показывать технические метрики сайта.

### Что Измерять

Технические метрики:

- количество HTTP-запросов по route/status/method;
- latency API;
- объем переданных данных;
- ошибки 4xx/5xx;
- uptime;
- CPU/RAM/disk/network;
- connections, query duration, locks, cache hit ratio, если используется БД;
- queue length и duration import/refresh jobs;
- размер логов и скорость их роста;
- аномалии запросов: резкие всплески RPS, 404/401/403/500, необычные user agents, частые запросы к одному endpoint.

Не собирать лишние персональные данные и поведенческую аналитику, которая не нужна для контроля работоспособности сервиса.

### Рекомендованный Стек

Для self-hosted варианта:

- Prometheus - сбор и хранение числовых time series.
- Grafana OSS или Grafana Enterprise Free binary - dashboards.
- Loki или обычные rotated logs на первом этапе - логи.
- Node Exporter - метрики VM.
- PostgreSQL Exporter - только если используется PostgreSQL.
- Nginx/Caddy logs plus exporter или парсер access logs - request count, bytes sent, latency.
- Backend `/metrics` endpoint - только технические API-метрики.

Prometheus бесплатен и open source по Apache 2.0. Grafana core projects перешли на AGPLv3; если код Grafana не модифицировать, self-hosted Grafana обычно можно использовать как готовое ПО. У Grafana Cloud также есть Free tier, но лимиты и условия нужно проверять перед внедрением.

### Альтернативы Grafana

| Вариант | Плюсы | Минусы |
| --- | --- | --- |
| Grafana + Prometheus | Стандартный стек, много dashboard templates | Нужно администрировать или следить за cloud limits |
| Grafana Cloud Free | Быстрый старт, не надо хранить monitoring самому | Лимиты, внешняя зависимость, нужно проверить требования по данным |
| Netdata | Быстрый мониторинг серверов | Меньше гибкости для API-метрик |
| Uptime Kuma | Отлично для uptime checks | Не заменяет полноценные метрики |
| Самодельная admin-страница | Полный контроль над простым техническим экраном | Не стоит делать вместо Prometheus для инфраструктурных метрик |

Рекомендация: не строить самодельный monitoring вместо Prometheus/Grafana. Если нужен внутренний технический экран, сделать его как отдельную admin-страницу с коротким статусом: uptime, healthcheck, ошибки, latency, место на диске, статус импорта. Техническую наблюдаемость оставить в Prometheus/Grafana или аналогичном готовом инструменте.

### Где Хранить Метрики

Вариант A, простой self-hosted:

- Prometheus хранит metrics на backend-VM или отдельной monitoring-VM.
- Grafana читает Prometheus.
- Retention 14-30 дней на старте.
- Backups dashboards/configs хранить в Git.

Вариант B, облачный:

- Backend и exporters отправляют/отдают metrics в Grafana Cloud или аналог.
- Меньше администрирования.
- Нужно проверить лимиты, регион, стоимость и требования к данным.

Вариант C, гибрид:

- Prometheus локально для оперативной диагностики.
- Долгосрочные технические агрегаты хранить отдельно, если понадобится история за месяцы или годы.

## 11. Логи И Access Logs

Nginx/Caddy должен логировать:

- timestamp;
- method;
- path без секретов;
- status;
- request time;
- upstream response time;
- bytes sent;
- user agent;
- request id;
- remote address, если политика данных это разрешает.

Пример Nginx log format:

```nginx
log_format main_ext '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time urt=$upstream_response_time '
                    'rid=$request_id';
```

Логи нужно ротировать, например через `logrotate`, и ограничить retention.

## 12. GitLab: Репозиторий И Деплой

GitLab CI/CD использует `.gitlab-ci.yml` в корне проекта. Pipeline состоит из stages и jobs, а jobs выполняются GitLab Runner. GitLab Runner может быть hosted или self-managed. Для деплоя на private VM обычно удобнее self-managed runner внутри вашей инфраструктуры или runner с SSH-доступом к рабочему серверу.

Нужен один рабочий контур и, при необходимости, локальная или временная тестовая проверка до деплоя.

### Рекомендуемая Структура Репозитория

Если backend появится в этом же репозитории, лучше перейти к monorepo:

```text
portfolio-website/
  frontend/
    package.json
    src/
  backend/
    package.json
    src/
    migrations/
  deploy/
    docker-compose.yml
    nginx/
    prometheus/
    grafana/
  docs/
  .gitlab-ci.yml
```

На коротком этапе можно оставить текущий frontend в корне, а backend добавить в `backend/`, но перед рабочим запуском лучше привести структуру к явной.

### Flow Подключения GitLab

1. Создать GitLab group/project.
2. Перенести текущий репозиторий:

```bash
git remote add gitlab git@gitlab.example.com:group/portfolio-website.git
git push gitlab main
```

3. Включить protected branch для `main`:
   - `main` защищена;
   - merge только через merge request или по согласованному правилу команды;
   - деплой идет только из `main`.

4. Настроить GitLab Container Registry, если backend будет деплоиться контейнерами.
5. Установить GitLab Runner:
   - вариант 1: отдельная CI VM с Docker executor;
   - вариант 2: runner на deployment VM с shell executor;
   - вариант 3: GitLab-hosted runner для build, self-managed runner для deploy.

6. Добавить CI/CD variables:
   - `SSH_PRIVATE_KEY`;
   - `DEPLOY_HOST`;
   - `DEPLOY_USER`;
   - `FRONTEND_DEPLOY_PATH`;
   - `BACKEND_DEPLOY_PATH`;
   - storage/backend secrets, если нужны;
   - registry credentials, если нужны.

7. Настроить pipeline:
   - install;
   - lint/test, когда появятся;
   - build frontend;
   - build backend image, если backend контейнеризован;
   - run migrations, только если выбрана БД;
   - deploy на рабочий сервер.

8. Проверить rollback:
   - хранить предыдущий frontend release;
   - backend images тегировать commit SHA;
   - если используется БД, migrations проектировать обратимо или иметь restore-план.

### Пример `.gitlab-ci.yml` Для Текущего Frontend

```yaml
stages:
  - validate
  - build
  - deploy

image: node:20

cache:
  key:
    files:
      - package-lock.json
  paths:
    - .npm/

validate_frontend:
  stage: validate
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run check

build_frontend:
  stage: build
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 7 days

deploy_frontend:
  stage: deploy
  needs:
    - build_frontend
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: manual
  before_script:
    - eval "$(ssh-agent -s)"
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan "$DEPLOY_HOST" >> ~/.ssh/known_hosts
  script:
    - rsync -az --delete dist/ "$DEPLOY_USER@$DEPLOY_HOST:$FRONTEND_DEPLOY_PATH/"
    - ssh "$DEPLOY_USER@$DEPLOY_HOST" "sudo nginx -t && sudo systemctl reload nginx"
```

Для backend через Docker лучше:

- собирать image в GitLab CI;
- пушить в GitLab Container Registry;
- на backend-VM делать `docker compose pull`;
- запускать migrations только если выбрана БД;
- делать `docker compose up -d`.

## 13. Рекомендуемый Deploy Flow

1. Разработчик создает branch.
2. Открывает merge request или согласует прямой merge по правилам команды.
3. GitLab запускает validate/build pipeline.
4. После review merge в `main`.
5. Деплой на рабочий сервер запускается вручную из GitLab job.
6. После deploy проверяются:
   - `/health`;
   - frontend URL;
   - API smoke tests;
   - Grafana dashboard или другой технический мониторинг;
   - error logs.

## 14. Backup И Восстановление

Минимальная политика:

- Оригинальные Excel-файлы хранить отдельно от сервера приложения.
- Перед каждым импортом сохранять копию исходного Excel.
- Хранить историю импортов: файл, время, кто загрузил, результат валидации.
- Если используется PostgreSQL или другая БД, делать backup ежедневно.
- Backup хранить не только на той же VM.
- Раз в месяц делать restore drill на отдельной VM или временном сервере.
- Перед деплоем с migrations делать backup или snapshot, если используется БД.

Нужно документировать:

- где лежат Excel-оригиналы;
- где лежат backups;
- кто имеет доступ;
- как восстановить данные;
- сколько времени занимает restore;
- какая допустимая потеря данных: RPO;
- какое допустимое время восстановления: RTO.

## 15. Безопасность

- Backend API-порт не открывать в интернет.
- Внешний доступ только `80/443` на frontend-VM.
- SSH ограничить VPN, bastion или allowlist IP.
- Secrets хранить в GitLab CI/CD variables или secret manager, не в git.
- `/metrics` закрыть firewall/basic auth/private network.
- В logs не писать пароли, токены, лишние персональные данные.
- Все write-операции логировать в `audit_events`, если редактирование будет внутри портала.
- Rate limit на login, import, refresh и write endpoints.
- HTTPS обязателен.

## 16. Открытые Вопросы

- Сколько реальных сотрудников будет в системе через 1, 2 и 3 года?
- Сколько Excel-файлов является источником данных?
- Какие листы и колонки в этих файлах являются обязательными?
- Кто отвечает за обновление Excel-файлов?
- Нужно ли редактирование внутри портала или портал только отображает импортированные Excel-данные?
- Сколько публикаций в среднем и максимум будет у одного сотрудника?
- Какие внешние источники будут использоваться для актуализации?
- Будут ли refresh scripts использовать ML/LLM/OCR?
- Какие требования к хранению персональных данных?
- Какой budget ceiling на VM, storage и monitoring?

## 17. Источники И Проверенные Лицензии

- PostgreSQL License: https://www.postgresql.org/about/licence/
- Prometheus overview and Apache 2.0 note: https://prometheus.io/docs/introduction/overview/
- Grafana licensing: https://grafana.com/licensing/
- Grafana Cloud pricing/free tier: https://grafana.com/pricing/
- GitLab CI/CD docs: https://docs.gitlab.com/ci/
- GitLab Runner docs: https://docs.gitlab.com/runner/
