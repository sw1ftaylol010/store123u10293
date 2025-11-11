# Lonieve Gift - Setup Guide

Пошаговая инструкция по настройке проекта.

## 1. Установка зависимостей

```bash
npm install
```

## 2. Настройка Supabase

### 2.1. Создание проекта

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Сохраните URL и API ключи

### 2.2. Запуск миграций

1. Откройте SQL Editor в Supabase Dashboard
2. Скопируйте содержимое `supabase/migrations/20240101000000_initial_schema.sql`
3. Выполните SQL
4. Затем выполните `supabase/migrations/20240101000001_seed_data.sql`

### 2.3. Проверка таблиц

После миграций должны быть созданы таблицы:
- `products` - продукты (подарочные карты)
- `gift_codes` - коды карт
- `user_profiles` - профили пользователей
- `orders` - заказы
- `order_items` - элементы заказов
- `payments` - платежи
- `events` - события аналитики

## 3. Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Supabase (получите в Settings → API вашего проекта)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cardlink API
CARDLINK_API_URL=https://cardlink.link/api/v1
CARDLINK_API_TOKEN=your_cardlink_api_token
CARDLINK_SHOP_ID=your_shop_id
CARDLINK_POSTBACK_SECRET=your_postback_secret

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Lonieve Gift
```

## 4. Настройка Cardlink

### 4.1. Получение API ключей

1. Зарегистрируйтесь на [cardlink.link](https://cardlink.link)
2. Получите API Token и Shop ID
3. Настройте Postback URL: `https://your-domain.com/api/webhooks/cardlink`

### 4.2. Тестирование

Для тестирования используйте тестовый режим Cardlink (если доступен).

## 5. Создание админа

После первого входа/регистрации сделайте пользователя админом:

```sql
-- В SQL Editor Supabase
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'ваш-email@example.com';
```

## 6. Импорт кодов подарочных карт

### 6.1. Подготовка CSV

Создайте CSV файл с кодами:

```csv
product_id,code,nominal,expires_at
uuid-продукта,XXXX-XXXX-XXXX-XXXX,50,
uuid-продукта,YYYY-YYYY-YYYY-YYYY,100,2025-12-31
```

**Как получить product_id:**
1. Откройте Supabase → Table Editor → products
2. Скопируйте UUID нужного продукта

### 6.2. Импорт через админку

1. Зайдите в `/admin/codes`
2. Загрузите CSV файл
3. Дождитесь подтверждения импорта

## 7. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 8. Проверка функциональности

### Чек-лист:

- [ ] Главная страница загружается
- [ ] Видны продукты в каталоге
- [ ] Можно зайти на страницу продукта
- [ ] Конфигуратор работает
- [ ] Checkout создаёт заказ
- [ ] Личный кабинет показывает заказы
- [ ] Админка доступна (если роль admin)
- [ ] Импорт кодов работает

## 9. Email (опционально)

По умолчанию используется Supabase Email. Для production рекомендуется:

### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-user
SMTP_PASSWORD=your-mailgun-password
```

### AWS SES:
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-user
SMTP_PASSWORD=your-ses-password
```

## 10. Деплой

### Vercel:
```bash
vercel --prod
```

### Railway:
1. Подключите GitHub репозиторий
2. Установите переменные окружения
3. Deploy

### Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Проблема: Supabase таблицы не создаются
**Решение**: Проверьте, что вы выполнили SQL в правильном порядке (сначала schema, потом seed)

### Проблема: Cardlink webhook не срабатывает
**Решение**: 
1. Проверьте URL webhook в настройках Cardlink
2. Убедитесь, что домен доступен публично (не localhost)
3. Проверьте логи в `/api/webhooks/cardlink`

### Проблема: Коды не импортируются
**Решение**: Проверьте формат CSV и валидность product_id

### Проблема: Админка недоступна
**Решение**: Проверьте роль пользователя в таблице `user_profiles`

## Поддержка

При возникновении проблем:
1. Проверьте логи в консоли браузера
2. Проверьте логи в Supabase Dashboard → Logs
3. Проверьте переменные окружения

---

**Важно**: Не комитьте `.env.local` в Git!

