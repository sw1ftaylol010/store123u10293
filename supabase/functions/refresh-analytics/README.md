# Refresh Analytics Edge Function

Автоматически обновляет материализованное представление `daily_analytics`.

## Деплой

```bash
supabase functions deploy refresh-analytics
```

## Настройка Cron

В Supabase Dashboard → Database → Cron Jobs:

```sql
-- Запускать каждый день в 00:00 UTC
SELECT cron.schedule(
  'refresh-daily-analytics',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-analytics',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Переменные окружения

Добавить в Supabase Dashboard → Edge Functions → Settings:

```
CRON_SECRET=your_secret_key_here
```

## Ручной запуск

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-analytics \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Проверка

```sql
-- Посмотреть последнее обновление
SELECT MAX(date) FROM daily_analytics;

-- Посмотреть данные за последние 7 дней
SELECT * FROM daily_analytics 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

