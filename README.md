# portfolio-website

Минималистичный React/Vite-сайт с реестром сотрудников, карточками профилей и локальным режимом редактирования данных.

## Локальный Запуск

Требуется Node.js 20.19+ и npm 10+.

```bash
npm ci
npm run dev
```

Vite выведет локальный адрес, обычно `http://localhost:5173`.

## Проверка Перед Публикацией

```bash
npm run check
```

Команда собирает production-версию в `dist/`. Папка `dist/` не хранится в git: ее генерирует Vercel во время деплоя.

## Деплой На Vercel

Проект рассчитан на автоматический деплой через интеграцию Vercel с GitHub.

Рекомендуемые настройки проекта в Vercel:

- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `main` или `master`, в зависимости от настроек репозитория

Файл `vercel.json` содержит rewrite на `index.html`, чтобы прямые ссылки вида `/employee/:employeeId` работали после обновления страницы.

## Как Опубликовать Изменения

```bash
git switch -c refactor/site-cleanup
npm run check
git add .
git commit -m "Refactor employee portal"
git push -u origin refactor/site-cleanup
```

После push откройте pull request в GitHub. Когда изменения будут смержены в production-ветку, Vercel автоматически соберет и опубликует сайт.

## Частая Ошибка При Сборке

Если при `npm run build` вы видите ошибку вида:

```text
module.enableCompileCache?.()
SyntaxError: Unexpected token '.'
```

обычно используется слишком старая версия Node.js.

Проверьте версию:

```bash
node -v
npm -v
```

Для текущей сборки используйте Node.js 20.19+ и npm 10+.

## Структура

- `src/pages` - страницы приложения
- `src/components` - переиспользуемые UI-компоненты
- `src/data` - текущий источник данных сотрудников
- `src/utils` - утилиты форматирования, поиска, ссылок и скачивания CV
