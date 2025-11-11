import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

interface FunnelStep {
  step: string;
  sessions_count: number;
  conversion_rate: number;
}

export default async function AdminFunnelPage({ 
  params,
  searchParams 
}: { 
  params: { locale: Locale };
  searchParams: { days?: string; utm_source?: string; utm_campaign?: string };
}) {
  const supabase = await createClient();
  
  const days = parseInt(searchParams.days || '7');
  const utmSource = searchParams.utm_source || null;
  const utmCampaign = searchParams.utm_campaign || null;
  
  // Call funnel function
  const { data: funnelData } = await supabase.rpc('get_funnel_stats', {
    start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    filter_utm_source: utmSource,
    filter_utm_campaign: utmCampaign,
  }) as { data: FunnelStep[] | null };

  const steps = funnelData || [];
  const maxSessions = steps[0]?.sessions_count || 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Conversion Funnel
        </h1>
        
        {/* Filters */}
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 bg-background-card border border-white/10 rounded-lg text-white"
            defaultValue={days}
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {steps.map((step, index) => {
            const width = (step.sessions_count / maxSessions) * 100;
            const dropoff = index > 0 
              ? ((steps[index - 1].sessions_count - step.sessions_count) / steps[index - 1].sessions_count * 100).toFixed(1)
              : null;
            
            return (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{step.step}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-text-secondary">
                      {step.sessions_count.toLocaleString()} sessions
                    </span>
                    <span className="text-primary font-semibold w-16 text-right">
                      {step.conversion_rate.toFixed(1)}%
                    </span>
                    {dropoff && (
                      <span className="text-error text-xs w-20 text-right">
                        ↓ {dropoff}% drop
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative h-12 bg-background-lighter rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center transition-all duration-500"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-white font-semibold text-sm">
                      {step.sessions_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-text-secondary text-sm mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-white">
                {steps[0]?.sessions_count.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Paid Orders</p>
              <p className="text-2xl font-bold text-white">
                {steps[steps.length - 1]?.sessions_count.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Overall Conversion</p>
              <p className="text-2xl font-bold text-primary">
                {steps[steps.length - 1]?.conversion_rate.toFixed(2) || 0}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottlenecks */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Biggest Bottlenecks</h2>
        <div className="space-y-3">
          {steps.slice(1).map((step, index) => {
            const prevStep = steps[index];
            const dropRate = ((prevStep.sessions_count - step.sessions_count) / prevStep.sessions_count * 100);
            
            return {
              from: prevStep.step,
              to: step.step,
              dropRate,
              lost: prevStep.sessions_count - step.sessions_count,
            };
          })
          .sort((a, b) => b.dropRate - a.dropRate)
          .slice(0, 3)
          .map((bottleneck, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-background-lighter rounded-lg">
              <div>
                <p className="text-white font-medium">
                  {bottleneck.from} → {bottleneck.to}
                </p>
                <p className="text-text-secondary text-sm">
                  Lost {bottleneck.lost.toLocaleString()} sessions
                </p>
              </div>
              <span className="text-error font-bold text-lg">
                -{bottleneck.dropRate.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

