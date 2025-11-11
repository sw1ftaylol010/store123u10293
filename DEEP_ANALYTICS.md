# 📊 ГЛУБОКАЯ E2E АНАЛИТИКА - ДОКУМЕНТАЦИЯ

## 🎯 ЧТО ВНЕДРЕНО

Полноценная сквозная аналитика от клика до повторной покупки.

---

## 1. АРХИТЕКТУРА ДАННЫХ

### 1.1. Идентификаторы

**3 уровня tracking:**

1. **`visitor_id`** (cookie, 365 дней)
   - Постоянный ID пользователя
   - Живёт даже после смены session
   - Для long-term анализа

2. **`session_id`** (cookie, 30 дней)
   - ID текущей сессии
   - Обновляется при возврате через 30+ дней
   - Связывает все события в одну цепочку

3. **`user_id`** (Supabase Auth)
   - Для авторизованных пользователей
   - Связывает с email и историей

### 1.2. Таблица events (расширенная)

```sql
events:
  id, created_at
  event_type          -- стандартизированный тип
  session_id          -- обязателен
  visitor_id          -- long-term ID
  user_id             -- если авторизован
  url, referrer       -- откуда пришёл
  utm_source          -- рекламный источник
  utm_medium          -- канал
  utm_campaign        -- кампания
  utm_content         -- креатив
  utm_term            -- ключевое слово
  event_data (JSONB)  -- доп. данные
  ip_address
  user_agent
```

### 1.3. Таблица orders (с UTM)

```sql
orders:
  ...существующие поля...
  session_id          -- связь с events
  utm_source
  utm_medium
  utm_campaign
  utm_content
  utm_term
  referrer
```

---

## 2. TRACKING PLAN (СТАНДАРТИЗИРОВАННЫЕ СОБЫТИЯ)

### 2.1. Navigation Events
- `page_view` - просмотр страницы
- `view_catalog` - просмотр каталога (с фильтрами)
- `view_product` - просмотр продукта

### 2.2. Funnel Events
- `configurator_open` - открыт конфигуратор
- `configurator_change` - изменён номинал/тип доставки
- `add_to_cart` - добавление в корзину (условное)
- `checkout_start` - начало оформления
- `checkout_submit` - отправка формы оплаты
- `payment_redirect` - редирект на Cardlink
- `payment_return` - возврат с Cardlink
- `payment_success` - успешная оплата (server-side)
- `code_sent` - код отправлен (server-side)

### 2.3. Support Events
- `support_open` - открыта страница поддержки
- `support_request` - создан запрос
- `resend_email_request` - переотправка email

### 2.4. Account Events
- `account_login` - вход/регистрация

**Валидация:** Только эти типы принимаются API.

---

## 3. UTM АТРИБУЦИЯ

### 3.1. Capture Logic (Last Non-Direct Click)

```typescript
// При первом заходе
if (URL has UTM params) {
  save to cookie 'lv_utm' (30 days)
}

// При создании заказа
order.utm_* = getCookie('lv_utm') || null
```

**Результат:** Если пользователь пришёл с рекламы, потом вернулся прямым заходом - UTM сохранится.

### 3.2. Cookie Structure

- `lv_sess` - session_id (30 дней)
- `lv_visitor` - visitor_id (365 дней)
- `lv_utm` - JSON с UTM параметрами (30 дней)

---

## 4. КЛИЕНТСКАЯ БИБЛИОТЕКА

### 4.1. Использование

```typescript
import { Analytics } from '@/lib/analytics/tracking';

// Автоматический page view (через Provider)
// ...или вручную
Analytics.pageView();

// Просмотр продукта
Analytics.viewProduct(productId, brand, region);

// Конфигуратор
Analytics.configuratorOpen(productId);
Analytics.configuratorChange(productId, nominal, 'self' | 'gift');

// Checkout
Analytics.checkoutStart();
Analytics.checkoutSubmit(orderId, totalAmount);

// Платёж
Analytics.paymentRedirect(orderId, paymentUrl);
Analytics.paymentReturn(orderId, status);
```

### 4.2. Автоматический tracking

**AnalyticsProvider** обёрнут вокруг всего приложения:
- Auto-captures UTM при первом заходе
- Auto-tracks page views на route changes
- Auto-creates session_id и visitor_id

---

## 5. SERVER-SIDE TRACKING

### 5.1. Создание заказа

```typescript
// В /api/orders/create
const sessionId = getSessionIdFromCookie(request.headers.get('cookie'));
const utm = getUtmFromCookie(request.headers.get('cookie'));

await supabase.from('orders').insert({
  ...orderData,
  session_id: sessionId,
  utm_source: utm.utm_source,
  // ...
});
```

### 5.2. Webhook events

```typescript
// После успешной оплаты в webhook
await supabase.from('events').insert({
  event_type: 'payment_success',
  session_id: order.session_id,  // берём из order
  user_id: order.user_id,
  data: { order_id, amount }
});

// После отправки кода
await supabase.from('events').insert({
  event_type: 'code_sent',
  session_id: order.session_id,
  data: { order_id, codes_count }
});
```

---

## 6. SQL ФУНКЦИИ (АНАЛИТИКА)

### 6.1. Funnel (`get_funnel_stats`)

**Параметры:**
- `start_date`, `end_date`
- `filter_utm_source` (optional)
- `filter_utm_campaign` (optional)

**Возвращает:**
```
step                | sessions_count | conversion_rate
Total Sessions      | 10000          | 100.0
View Product        | 8500           | 85.0
Configurator Open   | 5000           | 50.0
Checkout Start      | 2000           | 20.0
Payment Redirect    | 1800           | 18.0
Paid                | 1500           | 15.0
```

### 6.2. Channels (`get_channel_stats`)

**Параметры:** `start_date`, `end_date`

**Возвращает:**
```
utm_source | utm_campaign | sessions | paid_orders | revenue | CR% | AOV
google     | search_brand | 5000     | 750         | 75000   | 15  | 100
facebook   | retargeting  | 3000     | 300         | 30000   | 10  | 100
```

### 6.3. Brands (`get_brand_stats`)

**Параметры:** `start_date`, `end_date`

**Возвращает:**
```
brand    | region | orders | revenue | avg_discount
Amazon   | USA    | 500    | 50000   | 25.5
Steam    | EU     | 300    | 30000   | 28.0
```

### 6.4. Cohorts (`get_cohort_analysis`)

**Параметры:** `cohort_period`, `min_date`

**Возвращает:**
```
user_id          | first_purchase | orders | LTV   | days_between | is_repeat
user@email.com   | 2025-01-01     | 3      | 300   | 15           | true
```

---

## 7. АДМИН ДАШБОРДЫ

### 7.1. Funnel (`/admin/funnel`)

**Показывает:**
- Визуализация воронки (бары с шириной пропорциональной кол-ву)
- Conversion rate на каждом шаге
- Drop-off между шагами
- **Biggest Bottlenecks** - топ-3 мест с наибольшим отвалом

**Фильтры:**
- Last 1/7/30/90 days
- По UTM source/campaign (TODO)

### 7.2. Channels (`/admin/channels`)

**Показывает:**
- Таблица всех каналов (utm_source + utm_campaign)
- Sessions, Orders, Paid, Revenue
- Conversion Rate, AOV
- Сортировка по Revenue DESC

**Summary cards:**
- Total Revenue
- Total Sessions
- Paid Orders
- Overall CR

### 7.3. Cohorts (`/admin/cohorts`)

**Показывает:**
- Таблица всех клиентов с LTV
- Repeat vs New customers
- Average LTV
- Avg Days Between Purchases
- Repeat Rate %

**Insights:**
- Сравнение с industry benchmarks
- Рекомендации по retention

### 7.4. Webhooks (`/admin/webhooks`)

**Показывает:**
- Все webhook logs
- Status (processed/failed)
- Response codes
- Для troubleshooting

---

## 8. ВОРОНКА (ПРИМЕР ЗАПРОСА)

```sql
WITH sessions_base AS (
  SELECT DISTINCT session_id
  FROM events
  WHERE created_at >= NOW() - INTERVAL '7 days'
    AND utm_source = 'google'  -- фильтр
),
funnel AS (
  SELECT
    COUNT(DISTINCT s.session_id) AS total,
    COUNT(DISTINCT CASE WHEN e.event_type = 'view_product' THEN e.session_id END) AS view_product,
    COUNT(DISTINCT CASE WHEN e.event_type = 'configurator_open' THEN e.session_id END) AS configurator,
    COUNT(DISTINCT CASE WHEN e.event_type = 'checkout_start' THEN e.session_id END) AS checkout,
    COUNT(DISTINCT o.session_id) FILTER (WHERE o.status = 'paid') AS paid
  FROM sessions_base s
  LEFT JOIN events e ON e.session_id = s.session_id
  LEFT JOIN orders o ON o.session_id = s.session_id
)
SELECT * FROM funnel;
```

---

## 9. КАЧЕСТВО ДАННЫХ

### 9.1. Валидация

**API `/api/events`** использует Zod schema:
```typescript
eventSchema = z.object({
  event_type: z.string().min(1).max(100),
  session_id: z.string().min(1),
  visitor_id: z.string().optional(),
  ...
})
```

Только валидные event_type принимаются.

### 9.2. Idempotency

**Events** не дедуплицируются (каждый клик = новый event).

**Server-side events** (payment_success, code_sent) создаются один раз:
- payment_success - только при первом webhook processed
- code_sent - только при успешной отправке

### 9.3. Time Sync

Все timestamps в **UTC**.

---

## 10. ИСПОЛЬЗОВАНИЕ

### 10.1. Setup

1. **Выполнить миграцию:**
```sql
-- В Supabase SQL Editor
supabase/migrations/20240103000000_deep_analytics.sql
```

2. **Проверить:**
- Таблица events расширена
- Функции созданы (get_funnel_stats, get_channel_stats, etc.)

3. **Проверить tracking:**
```sql
SELECT * FROM events 
ORDER BY created_at DESC 
LIMIT 10;
```

### 10.2. Добавить tracking на новую страницу

```typescript
'use client';

import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics/tracking';

export function MyPage() {
  useEffect(() => {
    // Track custom event
    Analytics.trackEvent('my_custom_event', {
      custom_data: 'value'
    });
  }, []);

  return <div>...</div>;
}
```

### 10.3. Проверить UTM атрибуцию

1. Откройте сайт с UTM:
```
https://your-site.com/?utm_source=test&utm_campaign=analytics_test
```

2. Создайте заказ

3. Проверьте в БД:
```sql
SELECT utm_source, utm_campaign, session_id
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

---

## 11. РАСШИРЕНИЕ

### 11.1. Добавить новый event type

1. Добавить в `EventTypes`:
```typescript
export const EventTypes = {
  ...
  MY_NEW_EVENT: 'my_new_event',
}
```

2. Использовать:
```typescript
Analytics.trackEvent(EventTypes.MY_NEW_EVENT, { ... });
```

### 11.2. Добавить новую метрику в админку

1. Создать SQL функцию:
```sql
CREATE FUNCTION get_my_metric() RETURNS ...
```

2. Создать страницу:
```typescript
// /admin/my-metric/page.tsx
const { data } = await supabase.rpc('get_my_metric');
```

### 11.3. Multi-domain tracking

**Текущая реализация:** session_id и UTM в cookie.

**Для multi-domain:**
- Передавать session_id в URL при переходе между доменами
- Сохранять в cookie на новом домене

---

## 12. PERFORMANCE

### 12.1. Индексы

Созданы индексы на:
- `events.session_id`
- `events.visitor_id`
- `events.utm_source`
- `events.utm_campaign`
- `events.event_type, created_at`
- `orders.session_id`
- `orders.utm_source`

### 12.2. Материализованное представление

**`daily_analytics`** - предагрегированные данные:
```sql
SELECT * FROM daily_analytics
WHERE date >= NOW() - INTERVAL '30 days';
```

**Обновление:**
```sql
SELECT refresh_daily_analytics();
```

Рекомендуется запускать через cron ежедневно.

---

## 13. МЕТРИКИ

### 13.1. Основные KPI

**CR по шагам:**
- Landing → Product: ~85%
- Product → Configurator: ~60%
- Configurator → Checkout: ~40%
- Checkout → Redirect: ~90%
- Redirect → Paid: ~85%

**Overall CR:** ~15-20% (от session до paid)

**По каналам:**
- Branded search: 20-30% CR
- Generic search: 10-15% CR
- Retargeting: 5-10% CR
- Cold traffic: 2-5% CR

**Cohort:**
- Repeat rate: 20-30% (good)
- LTV: $100-200 (зависит от AOV)
- Days between: 15-30

### 13.2. Alerts

**Настроить если:**
- Overall CR < 10% → проблема с траффиком или сайтом
- Checkout → Paid < 70% → проблема с платежами
- Repeat rate < 15% → проблема с retention

---

## ✅ ГОТОВНОСТЬ

### Что работает:
- ✅ Auto-tracking всех page views
- ✅ UTM capture и атрибуция
- ✅ Session и visitor tracking
- ✅ Воронка конверсии
- ✅ Аналитика по каналам
- ✅ Cohort analysis
- ✅ Админ дашборды

### Что нужно сделать:
- [ ] Настроить cron для refresh_daily_analytics (ежедневно)
- [ ] Добавить GA4/Meta events на ключевых точках (опционально)
- [ ] Настроить alerts на падение CR (опционально)

---

## 🎯 ИТОГ

**Теперь вы можете отвечать на вопросы:**
- ✅ Какой канал приносит деньги? (Channels)
- ✅ Где отваливаются пользователи? (Funnel + Bottlenecks)
- ✅ Какие продукты популярны? (Brand stats)
- ✅ Кто повторные клиенты? (Cohorts)
- ✅ Какой LTV по каналам? (Channels + Cohorts)
- ✅ Работает ли Cardlink? (Webhooks)

**Сквозная аналитика от клика до повторной покупки готова!** 📊

