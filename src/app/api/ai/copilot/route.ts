import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// AI Copilot - Business Intelligence Assistant
// Парсит естественные запросы и выполняет SQL

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Parse query intent
    const intent = detectQueryIntent(query.toLowerCase());
    let result: any = null;
    let sqlExecuted = '';

    // Execute appropriate SQL function based on intent
    switch (intent) {
      case 'revenue':
        const days = extractDays(query) || 7;
        sqlExecuted = `SELECT ai_get_revenue_last_n_days(${days})`;
        const { data: revenueData } = await supabase.rpc('ai_get_revenue_last_n_days', { days });
        result = {
          type: 'metric',
          metric: 'Revenue',
          value: revenueData,
          period: `Last ${days} days`,
          formatted: `$${Number(revenueData || 0).toFixed(2)}`,
        };
        break;

      case 'profit':
        const profitDays = extractDays(query) || 7;
        sqlExecuted = `SELECT ai_get_profit_last_n_days(${profitDays})`;
        const { data: profitData } = await supabase.rpc('ai_get_profit_last_n_days', { days: profitDays });
        result = {
          type: 'metric',
          metric: 'Profit',
          value: profitData,
          period: `Last ${profitDays} days`,
          formatted: `$${Number(profitData || 0).toFixed(2)}`,
        };
        break;

      case 'top_products':
        sqlExecuted = `SELECT * FROM ai_get_top_products(10)`;
        const { data: productsData } = await supabase.rpc('ai_get_top_products', { limit_count: 10 });
        result = {
          type: 'table',
          title: 'Top 10 Products',
          columns: ['Product', 'Brand', 'Orders', 'Revenue'],
          rows: productsData?.map((p: any) => [
            p.product_name,
            p.brand,
            p.orders_count,
            `$${Number(p.revenue).toFixed(0)}`,
          ]) || [],
        };
        break;

      case 'top_customers':
        sqlExecuted = `SELECT * FROM get_rfm_segments() WHERE segment = 'VIP Champions' LIMIT 10`;
        const { data: customersData } = await supabase.rpc('get_rfm_segments');
        const vipCustomers = customersData?.filter((c: any) => c.segment === 'VIP Champions').slice(0, 10);
        result = {
          type: 'table',
          title: 'Top 10 VIP Customers',
          columns: ['Email', 'Orders', 'Total Spent', 'Segment'],
          rows: vipCustomers?.map((c: any) => [
            c.customer_email,
            c.frequency,
            `$${Number(c.monetary).toFixed(0)}`,
            c.segment,
          ]) || [],
        };
        break;

      case 'channels':
        sqlExecuted = `SELECT * FROM get_channel_stats_financial()`;
        const { data: channelsData } = await supabase.rpc('get_channel_stats_financial', {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
          filter_tenant_id: null,
        });
        result = {
          type: 'table',
          title: 'Marketing Channels Performance',
          columns: ['Source', 'Campaign', 'Revenue', 'Profit', 'ROI'],
          rows: channelsData?.slice(0, 10).map((ch: any) => [
            ch.utm_source || 'Direct',
            ch.utm_campaign || 'N/A',
            `$${Number(ch.revenue || 0).toFixed(0)}`,
            `$${Number(ch.profit || 0).toFixed(0)}`,
            `${Number(ch.roi_percentage || 0).toFixed(0)}%`,
          ]) || [],
        };
        break;

      case 'alerts':
        sqlExecuted = `SELECT * FROM detect_anomalies()`;
        const { data: alertsData } = await supabase.rpc('detect_anomalies');
        result = {
          type: 'alerts',
          title: 'Active Anomalies & Alerts',
          alerts: alertsData?.map((a: any) => ({
            severity: a.severity,
            title: a.title,
            description: a.description,
            recommendation: a.recommendation,
          })) || [],
        };
        break;

      case 'unit_economics':
        sqlExecuted = `SELECT * FROM get_unit_economics()`;
        const { data: economicsData } = await supabase.rpc('get_unit_economics', {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
        });
        result = {
          type: 'metrics_list',
          title: 'Unit Economics (Last 30 Days)',
          metrics: economicsData?.map((m: any) => ({
            name: m.metric_name,
            value: m.metric_value,
            formatted: formatMetric(m.metric_name, m.metric_value),
          })) || [],
        };
        break;

      default:
        result = {
          type: 'text',
          message: `I understand you're asking about "${query}", but I need more specific information. Try asking:
          
• "Show me revenue for last 7 days"
• "What's our profit this week?"
• "Show top 10 products"
• "Who are our best customers?"
• "What are the top performing channels?"
• "Show me current alerts"
• "What's our unit economics?"`,
        };
    }

    const responseTime = Date.now() - startTime;

    // Log query
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('ai_queries').insert({
      user_id: user?.user?.id,
      query_text: query,
      query_intent: intent,
      sql_executed: sqlExecuted,
      response: JSON.stringify(result),
      response_time_ms: responseTime,
    });

    return NextResponse.json({
      query,
      intent,
      result,
      responseTime,
    });
  } catch (error) {
    console.error('AI Copilot error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

function detectQueryIntent(query: string): string {
  if (query.includes('revenue') || query.includes('sales') || query.includes('earned')) {
    return 'revenue';
  }
  if (query.includes('profit') || query.includes('margin')) {
    return 'profit';
  }
  if (query.includes('product') || query.includes('selling') || query.includes('popular')) {
    return 'top_products';
  }
  if (query.includes('customer') || query.includes('client') || query.includes('vip') || query.includes('best buyer')) {
    return 'top_customers';
  }
  if (query.includes('channel') || query.includes('source') || query.includes('campaign') || query.includes('marketing')) {
    return 'channels';
  }
  if (query.includes('alert') || query.includes('issue') || query.includes('problem') || query.includes('anomaly')) {
    return 'alerts';
  }
  if (query.includes('unit') || query.includes('economics') || query.includes('cac') || query.includes('ltv')) {
    return 'unit_economics';
  }
  return 'unknown';
}

function extractDays(query: string): number | null {
  const match = query.match(/(\d+)\s*(day|days|д|дня|дней)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  if (query.includes('week') || query.includes('неделю')) return 7;
  if (query.includes('month') || query.includes('месяц')) return 30;
  if (query.includes('today') || query.includes('сегодня')) return 1;
  if (query.includes('yesterday') || query.includes('вчера')) return 2;
  
  return null;
}

function formatMetric(name: string, value: number): string {
  if (name.toLowerCase().includes('ratio') || name.toLowerCase().includes('rate')) {
    return `${value.toFixed(2)}x`;
  }
  if (name.toLowerCase().includes('orders') || name.toLowerCase().includes('count')) {
    return value.toFixed(0);
  }
  return `$${value.toFixed(2)}`;
}

