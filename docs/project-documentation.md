# Документация Проекта

## 1. Назначение

Проект - портал сотрудников с реестром, карточками профилей, публикациями, контактами, научными идентификаторами, CV и будущим механизмом актуализации данных.

Сейчас приложение является статическим React/Vite frontend. Данные лежат в `src/data/employees.js`, редактирование сохраняется только в `localStorage`. Для production-версии нужен backend, база данных, авторизация, аудит изменений, мониторинг и деплой из GitLab.

## 2. Текущее Состояние

- Frontend: React 18, React Router 6, Vite 5.
- Роуты: `/`, `/employee/:employeeId`.
- Данные: 6 демо-анкет сотрудников.
- Сборка: `npm run build`.
- Текущий production bundle после сборки:
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
| PostgreSQL or private DB   |
| Metrics exporters          |
+----------------------------+
```

Главное правило: браузер пользователя не должен обращаться к private IP backend. Frontend вызывает API только по относительным адресам:

```js
fetch('/api/employees')
```

Nginx/Caddy на frontend-VM проксирует `/api/*` на backend-VM.

## 4. Рекомендация По Архитектуре Приложения

Для первой production-версии лучше выбрать модульный монолит.

Причина: проект небольшой, доменная модель пока простая, команда и объем трафика неизвестны. Микросервисы на старте добавят сеть, деплой, observability, версионирование API, распределенные ошибки и более сложную эксплуатацию раньше, чем появится реальная польза.

### Монолит

Плюсы:

- проще разработка и отладка;
- один backend deploy;
- одна база и транзакции без распределенной координации;
- меньше инфраструктуры;
- быстрее выйти в production.

Минусы:

- при росте сложнее независимо масштабировать части системы;
- неудачная внутренняя структура быстро превращается в большой связанный код;
- тяжелые задачи актуализации могут мешать API, если их не вынести хотя бы в worker-процесс.

### Микросервисы

Плюсы:

- независимое масштабирование API, workers, auth, scraping;
- независимые релизы сервисов;
- проще изолировать ресурсоемкую актуализацию данных;
- лучше подходит, если разные команды владеют разными частями.

Минусы:

- сложнее деплой и мониторинг;
- нужны service discovery, контракты API, трассировка, централизованные логи;
- больше сетевых отказов;
- сложнее локальная разработка;
- выше требования к DevOps.

### Предлагаемый Компромисс

Начать с модульного монолита, но физически разделить runtime-процессы:

- `web` - HTTP API.
- `worker` - актуализация анкет, импорт публикаций, фоновые задачи.
- `scheduler` - периодический запуск задач, можно встроить в worker на первом этапе.
- `postgres` - база данных.
- `nginx` или `caddy` - reverse proxy на frontend-VM.

Код backend остается в одном репозитории и одной кодовой базе, но модули должны быть разделены логически:

- `auth` - пользователи, сессии, роли.
- `employees` - анкеты сотрудников.
- `publications` - публикации и DOI.
- `refresh` - задачи актуализации.
- `audit` - журнал изменений.
- `metrics` - технические и продуктовые метрики.
- `admin` - служебные endpoints для диагностики.

Если нагрузка вырастет, первыми кандидатами на выделение в отдельные сервисы будут:

- `refresh-service` - тяжелые задачи актуализации и внешние интеграции;
- `auth-service` - если появится единый SSO для нескольких систем;
- `cv-service` - если генерация CV станет тяжелой или потребует шаблонизации;
- `analytics-service` - если продуктовые метрики станут отдельным направлением.

## 5. Backend API

Минимальный API для первой версии:

- `GET /health` - healthcheck.
- `GET /auth/me` - текущий пользователь.
- `POST /auth/login` - вход.
- `POST /auth/logout` - выход.
- `GET /employees` - список сотрудников.
- `GET /employees/:id` - карточка сотрудника.
- `PUT /employees/:id` - обновление анкеты.
- `POST /employees/:id/refresh` - поставить задачу актуализации.
- `GET /employees/:id/cv` - скачать/сгенерировать CV.
- `GET /metrics` - Prometheus metrics, закрыть от публичного доступа.

Правила доступа:

- просмотр анкет доступен авторизованным пользователям;
- редактирование своей анкеты разрешено пользователю, у которого `users.employee_id = :id`;
- посетитель без связанной анкеты может смотреть, но не редактировать;
- backend обязан проверять права на каждый write-запрос;
- frontend может скрывать кнопки, но не является источником безопасности.

## 6. PostgreSQL И Альтернативы

PostgreSQL подходит как основная БД для проекта.

PostgreSQL бесплатен как open source: официальная лицензия PostgreSQL разрешает использовать, копировать, изменять и распространять ПО без оплаты. Но бесплатно именно ПО; сервер, диски, backup storage, администрирование и managed database у облачного провайдера могут стоить денег.

Рекомендация: начать с PostgreSQL на backend-VM или managed PostgreSQL в private network, если бюджет позволяет.

### Почему PostgreSQL

- зрелая реляционная БД;
- хорошо подходит для анкет, пользователей, публикаций, аудита и задач;
- поддерживает транзакции, индексы, JSONB, полнотекстовый поиск;
- есть хорошие инструменты backup/restore;
- много готовых exporters для мониторинга.

### Альтернативы

| Вариант | Когда подходит | Ограничения |
| --- | --- | --- |
| PostgreSQL self-hosted | Минимальный бюджет, полный контроль | Нужно самим настраивать backup, обновления, мониторинг, восстановление |
| Managed PostgreSQL | Нужно меньше администрирования | Платно, зависит от провайдера |
| SQLite | Очень маленький read-heavy проект, один backend instance | Не лучший выбор для многопользовательского редактирования, фоновых задач и роста |
| MySQL/MariaDB | Если команда лучше знает MySQL-экосистему | Для текущей модели PostgreSQL выглядит гибче |
| MongoDB | Если данные почти полностью документные и часто меняют форму | Права, аудит, связи и отчеты удобнее держать в relational DB |
| Supabase/Neon/Render/Fly managed Postgres | Быстрый старт с managed Postgres | Нужно отдельно проверить тарифы, лимиты, регион и требования к хранению данных |

## 7. Минимальная Модель Данных

Базовые таблицы:

- `users`
- `employees`
- `employee_activity`
- `academic_degrees`
- `supervisors`
- `publications`
- `refresh_jobs`
- `audit_events`
- `sessions` или таблицы auth-провайдера

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

Точные цифры нужно получить до закупки ресурсов. Ниже флоу, по которому команда сможет оценить объем.

### Шаг 1. Посчитать бизнес-сущности

Собрать прогноз на 1, 2 и 3 года:

- количество сотрудников;
- среднее число публикаций на сотрудника;
- максимальное число публикаций на сотрудника;
- среднее число обновлений анкеты в месяц;
- среднее число refresh-запусков в день;
- число пользователей;
- срок хранения audit log;
- срок хранения refresh history;
- срок хранения access logs и metrics.

### Шаг 2. Оценить размер одной записи

После появления реальных данных загрузить тестовый дамп в PostgreSQL и выполнить:

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

Повторить для `publications`, `refresh_jobs`, `audit_events`.

### Шаг 3. Посчитать рост

Формула:

```text
годовой_объем =
  размер_сотрудников
  + размер_публикаций
  + размер_refresh_jobs_за_год
  + размер_audit_events_за_год
  + индексы
  + запас
```

Для PostgreSQL закладывать запас минимум `x2` на индексы, TOAST, bloat, миграции и временные операции. Для диска VM дополнительно заложить место под backups и WAL.

### Шаг 4. Оценить не только БД

Часто бизнес-данные будут маленькими, а больше места займут:

- access logs Nginx;
- application logs;
- metrics storage;
- backups;
- артефакты CI/CD;
- Docker images;
- временные файлы refresh scripts;
- сгенерированные CV, если хранить их как файлы.

### Предварительная Оценка

Для сотен или нескольких тысяч сотрудников сама PostgreSQL-база, скорее всего, будет меньше 1-5 GB даже с публикациями и аудитом. Это не финальная оценка: реальные логи, метрики, retention и backup policy могут занять больше места, чем анкеты.

## 9. Flow Оценки Ресурсов

Нужно отдельно оценивать frontend, API, database, workers, monitoring и CI/CD.

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
- PostgreSQL active connections;
- PostgreSQL slow queries;
- queue length для refresh jobs;
- duration refresh jobs;
- размер logs/metrics в день.

### Шаги Оценки

1. Определить сценарии нагрузки:
   - обычный просмотр списка;
   - открытие карточки;
   - поиск/фильтрация;
   - логин;
   - редактирование анкеты;
   - скачивание CV;
   - запуск актуализации.

2. Оценить пользователей:
   - DAU/MAU;
   - пиковое число одновременных пользователей;
   - ожидаемый RPS;
   - пиковые часы.

3. Поднять staging, близкий к production:
   - frontend-VM;
   - backend-VM;
   - PostgreSQL;
   - monitoring.

4. Провести нагрузочные тесты:
   - `k6`, `autocannon`, `wrk` или GitLab CI job;
   - отдельно read-only сценарии;
   - отдельно write-сценарии;
   - отдельно refresh jobs.

5. Зафиксировать ресурсные пороги:
   - CPU не выше 60-70% на нормальной нагрузке;
   - RAM с запасом минимум 30%;
   - диск не выше 70%;
   - p95 latency в целевом диапазоне;
   - PostgreSQL не упирается в connections и slow queries.

6. Повторить тест после добавления реальных данных.

### GPU

Для текущего проекта GPU не нужен. Он может понадобиться только если актуализация данных будет запускать ML/LLM/OCR/парсинг PDF с тяжелой моделью. До появления такого требования GPU не закладывать в базовую инфраструктуру.

### Предварительная Конфигурация Для Старта

Для первой версии без тяжелых ML-задач:

- Frontend VM: 1 vCPU, 1 GB RAM, 10-20 GB disk.
- Backend VM: 2 vCPU, 2-4 GB RAM, 30-50 GB disk.
- PostgreSQL на backend-VM: допустимо для старта, но backup обязателен.
- Monitoring VM или контейнеры на backend/frontend: 1-2 vCPU, 2 GB RAM, диск зависит от retention.

Если backend, PostgreSQL и monitoring живут на одной VM, лучше начинать с 2-4 vCPU, 4-8 GB RAM и 80+ GB disk.

## 10. Метрики, Логи И Наблюдаемость

Нужно заранее решить, где хранить и где показывать метрики сайта.

### Что Измерять

Технические метрики:

- количество HTTP-запросов по route/status/method;
- latency API;
- объем переданных данных;
- ошибки 4xx/5xx;
- uptime;
- CPU/RAM/disk/network;
- PostgreSQL connections, query duration, locks, cache hit ratio;
- queue length и duration refresh jobs;
- размер логов и скорость их роста.

Продуктовые метрики:

- число открытий списка сотрудников;
- число открытий карточек;
- число скачиваний CV;
- число запусков актуализации;
- число успешных и неуспешных редактирований;
- популярные фильтры поиска.

Важно: продуктовые метрики не должны сохранять лишние персональные данные.

### Рекомендованный Стек

Для self-hosted варианта:

- Prometheus - сбор и хранение числовых time series.
- Grafana OSS или Grafana Enterprise Free binary - dashboards.
- Loki или обычные rotated logs на первом этапе - логи.
- Node Exporter - метрики VM.
- PostgreSQL Exporter - метрики БД.
- Nginx logs plus exporter или парсер access logs - request count, bytes sent, latency.
- Backend `/metrics` endpoint - бизнесовые и API-метрики.

Prometheus бесплатен и open source по Apache 2.0. Grafana core projects перешли на AGPLv3; если код Grafana не модифицировать, self-hosted Grafana обычно можно использовать как готовый продукт. У Grafana Cloud также есть Free tier, но лимиты и условия нужно проверять перед внедрением.

### Альтернативы Grafana

| Вариант | Плюсы | Минусы |
| --- | --- | --- |
| Grafana + Prometheus | Стандартный стек, много dashboard templates | Нужно администрировать или следить за cloud limits |
| Grafana Cloud Free | Быстрый старт, не надо хранить monitoring самому | Лимиты, внешняя зависимость, нужно проверить требования по данным |
| Netdata | Быстрый мониторинг серверов | Меньше гибкости для продуктовых метрик |
| Uptime Kuma | Отлично для uptime checks | Не заменяет полноценные метрики |
| Plausible/Umami | Хороши для web analytics | Не заменяют инфраструктурный мониторинг |
| Самодельная admin-страница | Полный контроль, можно вывести продуктовые KPI | Не стоит делать вместо Prometheus для инфраструктурных метрик |

Рекомендация: не строить самодельный monitoring вместо Prometheus/Grafana. Если нужен внутренний "лендинг" с KPI, сделать его как отдельную admin-страницу, которая читает агрегированные данные из backend/PostgreSQL, а техническую наблюдаемость оставить в Prometheus/Grafana.

### Где Хранить Метрики

Вариант A, простой self-hosted:

- Prometheus хранит metrics на backend-VM или отдельной monitoring-VM.
- Grafana читает Prometheus.
- Retention 14-30 дней на старте.
- Backups dashboards/configs хранить в Git.

Вариант B, облачный:

- Backend и exporters отправляют/отдают metrics в Grafana Cloud или аналог.
- Меньше администрирования.
- Нужно проверить лимиты, регион, стоимость и требования к персональным данным.

Вариант C, гибрид:

- Prometheus локально для оперативной диагностики.
- Долгосрочные агрегаты отправлять наружу или хранить в PostgreSQL/ClickHouse.

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

GitLab CI/CD использует `.gitlab-ci.yml` в корне проекта. Pipeline состоит из stages и jobs, а jobs выполняются GitLab Runner. GitLab Runner может быть hosted или self-managed. Для деплоя на private VM обычно удобнее self-managed runner внутри вашей инфраструктуры или runner с SSH-доступом к deployment target.

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

На коротком этапе можно оставить текущий frontend в корне, а backend добавить в `backend/`, но перед production лучше привести структуру к явной.

### Flow Подключения GitLab

1. Создать GitLab group/project.
2. Перенести текущий репозиторий:

```bash
git remote add gitlab git@gitlab.example.com:group/portfolio-website.git
git push gitlab main
```

3. Включить protected branches:
   - `main` защищена;
   - merge только через merge request;
   - production deploy только из `main`.

4. Настроить GitLab Container Registry, если backend будет деплоиться контейнерами.
5. Создать environments:
   - `staging`;
   - `production`.

6. Установить GitLab Runner:
   - вариант 1: отдельная CI VM с Docker executor;
   - вариант 2: runner на deployment VM с shell executor;
   - вариант 3: GitLab-hosted runner для build, self-managed runner для deploy.

7. Добавить CI/CD variables:
   - `SSH_PRIVATE_KEY`;
   - `DEPLOY_HOST`;
   - `DEPLOY_USER`;
   - `FRONTEND_DEPLOY_PATH`;
   - `BACKEND_DEPLOY_PATH`;
   - `DATABASE_URL`;
   - secrets backend-приложения;
   - registry credentials, если нужны.

8. Настроить pipeline:
   - install;
   - lint/test, когда появятся;
   - build frontend;
   - build backend image;
   - run migrations;
   - deploy staging;
   - manual deploy production.

9. Проверить rollback:
   - хранить предыдущий frontend release;
   - backend images тегировать commit SHA;
   - migrations проектировать обратимо или иметь restore-план.

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

deploy_production_frontend:
  stage: deploy
  needs:
    - build_frontend
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: manual
  environment:
    name: production
    url: https://example.com
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
- запускать migrations;
- делать `docker compose up -d`.

## 13. Рекомендуемый Production Flow

1. Разработчик создает branch.
2. Открывает merge request.
3. GitLab запускает validate/build pipeline.
4. После review merge в `main`.
5. GitLab автоматически деплоит staging.
6. Команда проверяет staging.
7. Production deploy запускается вручную из GitLab environment.
8. После deploy проверяются:
   - `/health`;
   - frontend URL;
   - API smoke tests;
   - Grafana dashboard;
   - error logs.

## 14. Backup И Восстановление

Минимальная политика:

- PostgreSQL backup ежедневно.
- Retention: 7 daily, 4 weekly, 3 monthly backups.
- Backup хранить не только на той же VM.
- Раз в месяц делать restore drill на отдельной VM.
- Перед production deploy с migrations делать backup или snapshot.

Нужно документировать:

- где лежат backups;
- кто имеет доступ;
- как восстановить базу;
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
- Все write-операции логировать в `audit_events`.
- Rate limit на login, refresh и write endpoints.
- HTTPS обязателен.

## 16. Открытые Вопросы

- Сколько реальных сотрудников будет в системе через 1, 2 и 3 года?
- Сколько публикаций в среднем и максимум будет у одного сотрудника?
- Нужна ли интеграция с SSO или достаточно собственного login/password?
- Какие внешние источники будут использоваться для актуализации?
- Будут ли refresh scripts использовать ML/LLM/OCR?
- Какие требования к хранению персональных данных?
- Нужны ли staging и production в разных сетях?
- Какой budget ceiling на VM, managed DB и monitoring?

## 17. Источники И Проверенные Лицензии

- PostgreSQL License: https://www.postgresql.org/about/licence/
- Prometheus overview and Apache 2.0 note: https://prometheus.io/docs/introduction/overview/
- Grafana licensing: https://grafana.com/licensing/
- Grafana Cloud pricing/free tier: https://grafana.com/pricing/
- GitLab CI/CD docs: https://docs.gitlab.com/ci/
- GitLab Runner docs: https://docs.gitlab.com/runner/
- GitLab environments docs: https://docs.gitlab.com/ci/environments/
