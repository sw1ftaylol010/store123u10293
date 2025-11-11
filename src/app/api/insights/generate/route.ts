import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get automated insights
    const { data: anomalies } = await supabase.rpc('detect_anomalies') as { data: any[] | null };

    // Get channel stats
    const { data: channels } = await supabase.rpc('get_channel_stats_financial', {
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString(),
      filter_tenant_id: null,
    });

    // Generate insights summary
    const insights = {
      generated_at: new Date().toISOString(),
      period: 'last_7_days',
      anomalies: anomalies || [],
      summary: generateSummary(channels, anomalies || []),
      recommendations: generateRecommendations(channels, anomalies || []),
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function generateSummary(channels: any[], anomalies: any[]): string {
  if (!channels || channels.length === 0) {
    return 'No data available for analysis.';
  }

  const bestChannel = channels[0];
  const totalRevenue = channels.reduce((sum, ch) => sum + Number(ch.revenue || 0), 0);
  const totalProfit = channels.reduce((sum, ch) => sum + Number(ch.profit || 0), 0);
  const avgROI = channels.reduce((sum, ch) => sum + Number(ch.roi_percentage || 0), 0) / channels.length;

  let summary = `📊 **Weekly Performance Summary**\n\n`;
  summary += `• Total Revenue: $${totalRevenue.toFixed(0)}\n`;
  summary += `• Total Profit: $${totalProfit.toFixed(0)}\n`;
  summary += `• Average ROI: ${avgROI.toFixed(0)}%\n\n`;
  
  summary += `🏆 **Best Performing Channel**\n`;
  summary += `${bestChannel.utm_source} / ${bestChannel.utm_campaign}\n`;
  summary += `• Revenue: $${Number(bestChannel.revenue).toFixed(0)}\n`;
  summary += `• Profit: $${Number(bestChannel.profit).toFixed(0)}\n`;
  summary += `• ROI: ${Number(bestChannel.roi_percentage || 0).toFixed(0)}%\n\n`;

  if (anomalies && anomalies.length > 0) {
    summary += `⚠️ **Alerts**\n`;
    anomalies.forEach(a => {
      summary += `• ${a.title}: ${a.description}\n`;
    });
  }

  return summary;
}

function generateRecommendations(channels: any[], anomalies: any[]): string[] {
  const recommendations: string[] = [];

  if (!channels || channels.length === 0) {
    return recommendations;
  }

  // Best channel recommendation
  const bestChannel = channels[0];
  if (Number(bestChannel.roi_percentage || 0) > 100) {
    recommendations.push(
      `Scale ${bestChannel.utm_source} / ${bestChannel.utm_campaign} - delivering +${Number(bestChannel.roi_percentage).toFixed(0)}% ROI`
    );
  }

  // Worst channel warning
  const worstChannel = channels[channels.length - 1];
  if (Number(worstChannel.roi_percentage || 0) < 0) {
    recommendations.push(
      `Consider pausing ${worstChannel.utm_source} / ${worstChannel.utm_campaign} - ROI is negative (${Number(worstChannel.roi_percentage).toFixed(0)}%)`
    );
  }

  // Anomaly recommendations
  if (anomalies && anomalies.length > 0) {
    anomalies.forEach(a => {
      if (a.recommendation) {
        recommendations.push(a.recommendation);
      }
    });
  }

  return recommendations;
}

