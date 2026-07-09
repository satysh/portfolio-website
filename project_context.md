# Project Context

## Назначение

Проект `portfolio-website` - минималистичный портал сотрудников на React/Vite. Сейчас приложение работает как статический frontend: показывает реестр сотрудников, карточки профилей, публикации, контактные данные, научные идентификаторы и позволяет локально редактировать данные профиля.

Целевой продукт выглядит как административный портал/реестр, а не маркетинговый сайт. Визуальные решения должны оставаться спокойными, плотными и удобными для регулярной работы с таблицами и анкетами.

## Текущий Стек

- React 18.
- React Router 6.
- Vite 5.
- npm, Node.js `>=20.19.0`, npm `>=10`.
- Без TypeScript, без UI-kit, без state management библиотек.
- Основной язык интерфейса и документации - русский.

## Основные Команды

```bash
npm ci
npm run dev
npm run build
npm run check
npm run preview
```

`npm run check` сейчас просто запускает production-сборку через `npm run build`.

## Структура

- `src/main.jsx` - точка входа, подключает `BrowserRouter` и глобальные стили.
- `src/App.jsx` - маршруты приложения.
- `src/pages/HomePage.jsx` - главная страница с фильтрами и таблицей сотрудников.
- `src/pages/EmployeePage.jsx` - страница анкеты сотрудника с вкладками и локальным редактированием.
- `src/components/` - переиспользуемые UI-компоненты.
- `src/data/employees.js` - текущий статический источник данных.
- `src/utils/employees.js` - поиск, форматирование дат, возраст, ссылки на профили, mailto/tel.
- `src/utils/cv.js` - генерация и скачивание CV в Markdown.
- `src/styles.css` - вся стилизация приложения.
- `docs/backend-architecture.md` - целевая архитектура frontend/backend на двух VM.
- `vercel.json` - rewrite всех маршрутов на `index.html` для SPA.
- `.github/workflows/build.yml` - CI-сборка на push/PR в `main`/`master`.

## Маршруты

- `/` - список сотрудников.
- `/employee/:employeeId` - карточка сотрудника.
- `*` - redirect на `/`.

На Vercel все прямые переходы должны работать за счет rewrite в `vercel.json`.

## Данные

Источник правды сейчас - массив `employees` в `src/data/employees.js`. В нем 6 демо-записей. Каждая запись строится через `buildEmployee(data)` и имеет примерно такую форму:

- `id`, `shortName`, `fullName`
- `position`, `email`, `phone`, `laboratory`, `birthDate`
- `scopusId`, `wosId`, `orcidId`
- `academicDegree`: `degree`, `year`, `defensePlace`
- `activity`: `skills`, `experience`, `startDate`, `projects`
- `admin`: `contractType`, `contractEndDate`
- `jinrActivity`, `kazakhstanActivity`
- `supervisors.jinr` и `supervisors.kazakhstan`
- `publications`

`basePublications` сейчас переиспользуется для всех сотрудников. При изменении модели данных нужно проверить все компоненты, потому что многие поля читаются напрямую без optional chaining.

## Поведение Приложения

Главная страница:

- Хранит фильтры в локальном `useState`.
- Фильтрует сотрудников через `employeeMatchesFilters`.
- Фильтры: ФИО, должность, лаборатория, год окончания контракта.
- Поиск регистронезависимый с `toLocaleLowerCase('ru-RU')`.

Страница сотрудника:

- Находит сотрудника по `employeeId`.
- Поддерживает вкладки: анкета, публикации, деятельность в ОИЯИ, деятельность в Казахстане.
- Для каждой вкладки есть отдельный edit mode.
- Изменения сохраняются в `localStorage` под ключом `employee-profile-${employeeId}`.
- `localStorage` - временное best-effort решение до появления backend.
- CV скачивается как Markdown-файл `${employee.id}-cv.md`.

## UI И Стили

Стили глобальные в `src/styles.css`. Используется административный визуальный язык:

- светлый фон страницы;
- белые поверхности с тонкой рамкой;
- радиус 8px;
- зеленый accent;
- таблицы на desktop;
- карточное представление строк таблицы на mobile;
- доступные focus states;
- вкладки с клавиатурной навигацией.

При frontend-изменениях лучше сохранять текущий стиль: плотная информационная верстка, минимум декоративности, предсказуемые формы и таблицы.

## Компоненты

- `Header` - шапка и ссылка на главную.
- `SearchBar` - форма фильтров.
- `EmployeeTable` - таблица сотрудников, ссылки на карточку, email и телефон.
- `EmployeeProfile` - основная карточка анкеты, редактируемые поля, ссылки на Scopus/WoS/ORCID, скачивание CV.
- `InfoSection` - секции detail-list с редактируемыми значениями.
- `PublicationsTable` - таблица публикаций, DOI-ссылки, редактируемые ячейки.
- `Tabs` - tablist с поддержкой ArrowLeft/ArrowRight/Home/End.

## Утилиты

`src/utils/employees.js`:

- `normalizeSearchValue`
- `getContractEndYear`
- `hasActiveFilters`
- `employeeMatchesFilters`
- `calculateAge`
- `formatDate`
- `buildProfileLink`
- `buildMailTo`
- `buildTelLink`
- `getInitials`

`src/utils/cv.js`:

- `buildCvMarkdown`
- `downloadTextFile`
- `downloadEmployeeCv`

## Backend: Целевое Направление

Backend еще не реализован. Документ `docs/backend-architecture.md` описывает целевую схему:

- публична только frontend-VM;
- frontend-VM отдает SPA и проксирует `/api/*`;
- backend-VM доступна только по private IP;
- браузер не должен обращаться к private IP напрямую;
- API вызывается из frontend только относительными URL вида `/api/employees`;
- backend должен стать источником правды вместо `localStorage`;
- права редактирования обязательно проверяются на backend.

Предложенные API в документе:

- `GET /health`
- `GET /auth/me`
- `GET /employees`
- `GET /employees/:id`
- `PUT /employees/:id`
- `POST /employees/:id/refresh`
- `GET /employees/:id/cv`
- `POST /auth/login`
- `POST /auth/logout`

## Деплой И CI

README описывает деплой на Vercel:

- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

GitHub Actions выполняет `npm ci` и `npm run build` на Node 20.

`dist/` находится в `.gitignore`, но в текущем рабочем каталоге папка присутствует как локальный build-артефакт. Не нужно редактировать `dist/` вручную.

## Инженерные Замечания

- В проекте нет тестов, линтера и форматтера.
- Любые изменения поведения стоит проверять через `npm run check`.
- При добавлении backend/API слоя нужно аккуратно заменить импорт `employees` на клиент данных, но сохранить относительные API URL.
- При усложнении редактирования лучше вынести работу с draft-состоянием и сохранением из `EmployeePage.jsx`.
- Перед изменением схемы сотрудника нужно проверить таблицу, профиль, секции, публикации, фильтрацию и генерацию CV.
- Не коммитить `node_modules/`, `dist/`, `.env*`, `.vercel/`.
