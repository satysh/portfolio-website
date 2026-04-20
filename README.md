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

## Деплой на сервер Ubuntu (Nginx)

Ниже — пошаговая инструкция для развёртывания production-сборки как статического сайта.

### 1) Подготовить сервер

```bash
sudo apt update
sudo apt install -y nginx ufw
```

Открыть HTTP/HTTPS в firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 2) Скопировать проект на сервер

Варианты:
- через `git clone` прямо на сервере;
- через `scp`/`rsync` с локальной машины.

Пример с git:

```bash
cd /var/www
sudo git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ> portfolio-website
sudo chown -R $USER:$USER /var/www/portfolio-website
cd /var/www/portfolio-website
```

### 3) Установить Node.js и собрать проект на сервере

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

npm install
npm run build
```

После сборки статические файлы будут в `/var/www/portfolio-website/dist`.

### 4) Настроить Nginx

Создайте конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/portfolio-website
```

Вставьте:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name example.com www.example.com;

    root /var/www/portfolio-website/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Активируйте сайт и проверьте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/portfolio-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

> Если включён дефолтный сайт, при необходимости отключите его:
> `sudo rm /etc/nginx/sites-enabled/default && sudo systemctl reload nginx`

### 5) Подключить домен

У регистратора домена добавьте A-запись:
- `@` -> IP вашего сервера
- `www` -> IP вашего сервера

После обновления DNS проверьте, что сайт открывается по домену.

### 6) Включить HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

Проверка автообновления сертификата:

```bash
sudo certbot renew --dry-run
```

### 7) Обновление сайта при новых изменениях

```bash
cd /var/www/portfolio-website
git pull
npm install
npm run build
sudo systemctl reload nginx
```

## Примечания
- Проект фронтенд-only (без backend), все данные сотрудников — mock-данные.
- Для деплоя на сервер публикуется содержимое папки `dist/`.
- Строку `server_name` в Nginx обязательно замените на ваш домен (или IP, если домена пока нет).
