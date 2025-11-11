# Deployment Guide - Lonieve Gift

## Варианты деплоя

### 1. Vercel (Рекомендуется для Next.js)

**Плюсы:**
- Бесплатный тариф для небольших проектов
- Автоматический CI/CD
- Глобальная CDN
- Оптимизирован для Next.js

**Шаги:**

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Авторизуйтесь:
```bash
vercel login
```

3. Деплой:
```bash
vercel --prod
```

4. Настройте переменные окружения в Vercel Dashboard:
   - Settings → Environment Variables
   - Добавьте все переменные из `.env.local`

5. Настройте Cardlink webhook URL:
   - `https://your-domain.vercel.app/api/webhooks/cardlink`

### 2. Railway

**Плюсы:**
- Простой деплой из GitHub
- Автоматический SSL
- Базы данных встроены

**Шаги:**

1. Подключите GitHub репозиторий
2. Выберите Next.js template
3. Добавьте переменные окружения
4. Deploy

Build Command: `npm run build`
Start Command: `npm start`

### 3. Netlify

**Шаги:**

1. Установите Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Деплой:
```bash
netlify deploy --prod
```

3. Настройте переменные окружения в Netlify Dashboard

### 4. DigitalOcean App Platform

**Плюсы:**
- Хорошая производительность
- Предсказуемая цена

**Шаги:**

1. Создайте App на DigitalOcean
2. Подключите GitHub
3. Настройте Build:
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. Добавьте переменные окружения

### 5. Docker (Self-hosted)

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - CARDLINK_API_URL=${CARDLINK_API_URL}
      - CARDLINK_API_TOKEN=${CARDLINK_API_TOKEN}
      - CARDLINK_SHOP_ID=${CARDLINK_SHOP_ID}
      - CARDLINK_POSTBACK_SECRET=${CARDLINK_POSTBACK_SECRET}
    restart: unless-stopped
```

**Деплой:**

```bash
docker-compose up -d
```

### 6. VPS (Ubuntu)

**Требования:**
- Ubuntu 20.04+
- Node.js 18+
- Nginx
- PM2

**Установка:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd lonieve-gift

# Install dependencies
npm ci

# Build
npm run build

# Start with PM2
pm2 start npm --name "lonieve-gift" -- start
pm2 save
pm2 startup
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**SSL с Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Checklist

- [ ] Все environment variables установлены
- [ ] Supabase подключён и миграции выполнены
- [ ] Cardlink webhook URL настроен и работает
- [ ] SSL сертификат установлен
- [ ] Email отправка работает
- [ ] Тестовый заказ проходит успешно
- [ ] Админка доступна
- [ ] Логи проверены
- [ ] Мониторинг настроен

## Мониторинг

### Vercel Analytics
Встроенная аналитика доступна в Dashboard

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Logs

**PM2:**
```bash
pm2 logs lonieve-gift
```

**Docker:**
```bash
docker-compose logs -f
```

## Backup Strategy

### Supabase
- Автоматические бэкапы включены в Supabase
- Дополнительно можно настроить регулярный экспорт

### Database Backup Script

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgresql://user:pass@host:port/db" > backup_$DATE.sql
```

## Scaling

### Горизонтальное масштабирование
- Vercel автоматически масштабирует
- Docker: используйте Docker Swarm или Kubernetes

### Вертикальное масштабирование
- Увеличьте ресурсы сервера
- Оптимизируйте запросы к БД
- Добавьте Redis для кеширования

## Troubleshooting

### Build fails
```bash
# Clear cache
rm -rf .next
npm run build
```

### API routes не работают
- Проверьте environment variables
- Проверьте Supabase connection
- Проверьте логи

### Webhook не срабатывает
- Проверьте URL в Cardlink
- Проверьте логи webhook endpoint
- Тестируйте через Postman

## Security Best Practices

- ✅ Используйте HTTPS
- ✅ Храните секреты в environment variables
- ✅ Настройте CORS если нужно
- ✅ Включите rate limiting
- ✅ Регулярно обновляйте зависимости
- ✅ Мониторьте логи на подозрительную активность

## Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Restart (PM2)
pm2 restart lonieve-gift

# Or Docker
docker-compose up -d --build
```

