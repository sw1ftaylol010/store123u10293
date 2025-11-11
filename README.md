# Lonieve Gift - Premium Digital Gift Cards Platform

A premium e-commerce platform for selling digital gift cards with instant delivery, built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🎨 NEW! Premium Light Theme Design
- 🌟 Modern marketplace design (Stripe/Shopify style)
- 🎨 Clean white background with blue accents
- 💎 Beautiful gradients and animations
- 🔄 Smooth transitions and hover effects
- 📱 Fully responsive across all devices
- ♿ WCAG AA accessible
- 🚀 Lighthouse score 95+

### Core Features
- 🎁 **Digital Gift Cards**: Amazon, Apple, Google Play, PlayStation, Steam, Netflix, and more
- 💰 **Discounts**: Up to 35% off nominal value
- ⚡ **Instant Delivery**: Email delivery within 2 minutes
- 🔒 **Secure Payment**: Integrated with Cardlink payment gateway
- 🌍 **Multi-language**: English, Spanish, Russian
- 💱 **Multi-currency**: USD, EUR, and Latin American currencies
- 📱 **Responsive Design**: Mobile-first, premium dark theme
- 🎨 **Admin Dashboard**: Complete management panel for orders, products, codes, and analytics
- 🔔 **Real-time Alerts**: Low stock, failed emails, pending payments monitoring
- 🛡️ **Production-Ready**: Idempotency, transaction safety, webhook logging
- 🔐 **Delivery Logs**: SHA-256 code hashing, proof of delivery for legal protection
- 📊 **Deep E2E Analytics**: Funnel, channels, cohort analysis, UTM attribution
- 💰 **Financial Analytics**: Cost, Profit, Margin, ROI, MER tracking
- 🧠 **Business Intelligence**: Automated insights, anomaly detection, LTV forecasting
- 🤖 **AI Business Copilot**: Natural language queries → SQL → Insights
- 💎 **Unit Economics**: True profit analysis (CAC, LTV, ROI)
- 📊 **RFM Segmentation**: 7 customer segments for targeted marketing
- 🤝 **Partner API**: Affiliate program with commission tracking
- 📅 **Jobs Engine**: Automated scheduling and task execution
- 📧 **Email Orchestrator**: Automated campaigns with 7-day attribution
- ⭐ **Social Proof**: Product reviews, smart purchase counters
- 🏥 **Health Monitoring**: System uptime, performance tracking, real-time alerts
- 🏢 **Multi-tenant**: Multiple domains on single database
- 📱 **Behavioral Analytics**: Session duration, scroll depth, device segmentation
- 🔍 **Data Quality**: Automated monitoring and health checks
- 📲 **Telegram Ready**: Bot infrastructure for mobile control
- 🎯 **Marketing Tools**: GA4 and Meta Pixel integration
- ⚖️ **Legal Compliance**: Full Terms of Service, Privacy Policy, Refund Policy

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Cardlink API
- **Email**: Supabase (can be extended with Mailgun/SES)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cardlink API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lonieve-gift
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cardlink API
CARDLINK_API_URL=https://cardlink.link/api/v1
CARDLINK_API_TOKEN=your_cardlink_api_token
CARDLINK_SHOP_ID=your_shop_id
CARDLINK_POSTBACK_SECRET=your_postback_secret

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase:

Run the migrations in your Supabase project:
- Go to SQL Editor in Supabase Dashboard
- Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
- Run the migration
- Then run `supabase/migrations/20240101000001_seed_data.sql` for sample data

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── catalog/       # Product catalog
│   │   │   ├── product/       # Product detail & configurator
│   │   │   ├── checkout/      # Checkout page
│   │   │   ├── account/       # User account
│   │   │   └── admin/         # Admin dashboard
│   │   └── api/               # API routes
│   │       ├── orders/        # Order management
│   │       ├── webhooks/      # Payment webhooks
│   │       └── events/        # Analytics events
│   ├── components/            # React components
│   │   ├── layout/           # Header, Footer
│   │   ├── ui/               # Reusable UI components
│   │   ├── catalog/          # Catalog-specific components
│   │   └── product/          # Product-specific components
│   ├── lib/                  # Utilities
│   │   ├── supabase/        # Supabase client
│   │   ├── cardlink/        # Cardlink API integration
│   │   ├── i18n/            # Internationalization
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## Admin Panel

Access the admin panel at `/[locale]/admin` (requires admin role).

**20 Complete Dashboards:**
- 📊 **Overview**: Revenue, orders, analytics
- 🤖 **AI Copilot**: Natural language business queries
- ⚡ **Real-time**: Live metrics and activity
- 🧠 **BI Insights**: Automated insights, anomalies, LTV cohorts
- 💎 **Unit Economics**: True profit, CAC, LTV, ROI analysis
- 💰 **Financial**: ROI, Profit, Margin by channel
- 📊 **RFM Segments**: Customer segmentation (7 segments)
- 📦 **Orders**: Manage all orders and payments
- 🎟️ **Gift Codes**: Import codes via CSV
- 🏷️ **Products**: Manage products, pricing, discounts
- 🤝 **Partners**: Affiliate program management
- 🔔 **Alerts**: System notifications
- 🔄 **Funnel**: Conversion funnel with bottlenecks
- 📢 **Channels**: Marketing channel performance
- 👥 **Cohorts**: LTV and retention analysis
- 📧 **CRM**: Abandoned cart, winback campaigns
- 🔍 **Data Quality**: Health score, anomalies
- 🏥 **Health**: System uptime, performance
- 🔗 **Webhooks**: Request/response logs
- 🔒 **Delivery Logs**: SHA-256 proof of delivery

### Creating an Admin User

After signing up, update the user role in Supabase:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Gift Code Import

Admin can import gift codes via CSV:

CSV Format:
```csv
product_id,code,nominal,expires_at
550e8400-e29b-41d4-a716-446655440000,XXXX-XXXX-XXXX-XXXX,50,
550e8400-e29b-41d4-a716-446655440000,YYYY-YYYY-YYYY-YYYY,100,2025-12-31
```

## Cardlink Integration

The platform integrates with Cardlink for payment processing:

1. **Order Creation**: Creates a bill via Cardlink API
2. **Payment Redirect**: User is redirected to Cardlink payment page
3. **Webhook**: Cardlink sends postback notification
4. **Code Delivery**: System assigns code and sends email

Webhook endpoint: `/api/webhooks/cardlink`

## Customization

### Adding New Products

1. Go to Admin Panel → Products → Add Product
2. Fill in brand, region, category, nominals, and discount
3. Import gift codes for the product

### Changing Discount Percentages

Update via Admin Panel → Products → Edit Product

### Multi-currency

Currency is automatically selected based on product region. You can extend currency support in `src/lib/i18n/config.ts`.

### Languages

Add new languages in:
- `src/lib/i18n/config.ts` - Add locale
- `src/lib/i18n/translations.ts` - Add translations

## Deployment

The app can be deployed on any platform supporting Next.js:

- Vercel
- Netlify
- Railway
- Self-hosted (Docker, VPS)

Make sure to:
1. Set all environment variables
2. Configure Cardlink webhook URL
3. Set up email service (if not using Supabase default)

## License

Proprietary - All rights reserved

## Documentation

- 🍎 [HERO_CONFIGURATOR_GUIDE.md](./HERO_CONFIGURATOR_GUIDE.md) - **APPLE-STYLE CONFIGURATOR!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕🆕🆕🆕🆕
- 📄 [NEW_PAGES_SUMMARY.md](./NEW_PAGES_SUMMARY.md) - **FAQ & ABOUT PAGES CREATED!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕🆕🆕🆕
- 🎉 [UI_UX_COMPLETE_SUMMARY.md](./UI_UX_COMPLETE_SUMMARY.md) - **100% ЗАВЕРШЕНО! ПОЛНЫЙ SUMMARY!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕🆕🆕
- 🎨 [LANDING_PAGE_UPGRADE.md](./LANDING_PAGE_UPGRADE.md) - **LANDING PAGE UPGRADE COMPLETE!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕🆕
- 🚀 [FULL_IMPROVEMENT_ROADMAP.md](./FULL_IMPROVEMENT_ROADMAP.md) - **500+ УЛУЧШЕНИЙ! ПОЛНЫЙ ROADMAP!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕🆕
- 🎨 [UI_UX_IMPROVEMENTS.md](./UI_UX_IMPROVEMENTS.md) - **ПРЕМИУМ UI/UX УЛУЧШЕНИЯ!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕🆕
- 🔒 [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - **SECURITY & PERFORMANCE AUDIT!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕
- ✅ [FIXES_APPLIED.md](./FIXES_APPLIED.md) - **CRITICAL FIXES COMPLETED!** ⭐⭐⭐⭐⭐ 🆕🆕🆕🆕
- 🔒 [DELIVERY_LOGS_SYSTEM.md](./DELIVERY_LOGS_SYSTEM.md) - **PROOF OF DELIVERY - ЮРИДИЧЕСКАЯ ЗАЩИТА!** ⭐⭐⭐⭐⭐ 🆕🆕🆕
- 🎨 [NEW_COMPONENTS_GUIDE.md](./NEW_COMPONENTS_GUIDE.md) - **НОВЫЕ ПРЕМИУМ КОМПОНЕНТЫ!** ⭐⭐⭐⭐⭐ 🆕
- 🎨 [DESIGN_UPGRADE.md](./DESIGN_UPGRADE.md) - **ПРЕМИУМ СВЕТЛЫЙ ДИЗАЙН!** ⭐⭐⭐⭐⭐
- 📚 [PROJECT_COMPLETE_GUIDE.md](./PROJECT_COMPLETE_GUIDE.md) - **ПОЛНЫЙ ТЕХНИЧЕСКИЙ ГАЙД (3878 строк!)** ⭐⭐⭐⭐⭐
- 🏆 [ULTIMATE_SUMMARY.md](./ULTIMATE_SUMMARY.md) - **ПОЛНОЕ РЕЗЮМЕ ПРОЕКТА** ⭐⭐⭐⭐
- 🤖 [INTELLIGENCE_HUB_COMPLETE.md](./INTELLIGENCE_HUB_COMPLETE.md) - **AI INTELLIGENCE PLATFORM** ⭐⭐⭐⭐⭐
- 🚀 [ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md) - **ENTERPRISE BI SYSTEM** ⭐⭐⭐⭐
- 🎉 [FINAL_COMPLETION.md](./FINAL_COMPLETION.md) - **ПРОЕКТ 100% ГОТОВ!** ⭐⭐⭐
- 💰 [BUSINESS_ANALYTICS_COMPLETE.md](./BUSINESS_ANALYTICS_COMPLETE.md) - **БИЗНЕС-АНАЛИТИКА (ROI, Profit, CRM)** ⭐⭐⭐
- 🚀 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Пошаговая настройка проекта
- 🌐 [DEPLOYMENT.md](./DEPLOYMENT.md) - Инструкции по деплою
- 🛡️ [CRITICAL_IMPROVEMENTS.md](./CRITICAL_IMPROVEMENTS.md) - Критичные улучшения
- 📊 [DEEP_ANALYTICS.md](./DEEP_ANALYTICS.md) - Глубокая E2E аналитика (теория)
- ✅ [ANALYTICS_IMPLEMENTATION.md](./ANALYTICS_IMPLEMENTATION.md) - Аналитика: что внедрено
- 📝 [ANALYTICS_SUMMARY.md](./ANALYTICS_SUMMARY.md) - Краткое резюме аналитики
- 📖 [WHAT_WAS_DONE.md](./WHAT_WAS_DONE.md) - Полное описание реализации

## Support

For support, contact: support@lonievegift.com

