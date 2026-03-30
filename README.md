# portfolio-website
Тестовый сайт для инфы о сотрудниках.

## Запуск и сборка на Ubuntu / Debian

Ниже команды для Ubuntu 22.04+ / Debian 12+.

### 1) Установить Node.js и npm
Рекомендуется Node.js 20 LTS.

```bash
sudo apt update
sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверить версии:

```bash
node -v
npm -v
```

### 2) Установить зависимости проекта
В корне репозитория:

```bash
npm install
```

### 3) Запуск в режиме разработки

```bash
npm run dev
```

После запуска Vite выведет локальный адрес (обычно `http://localhost:5173`).

### 4) Сборка production-версии

```bash
npm run build
```

Готовые статические файлы будут в папке `dist/`.

### 5) Локальная проверка production-сборки

```bash
npm run preview
```

## Примечания
- Проект фронтенд-only (без backend), все данные сотрудников — mock-данные.
- Если нужен деплой на Nginx/Apache, публикуется содержимое папки `dist/`.
