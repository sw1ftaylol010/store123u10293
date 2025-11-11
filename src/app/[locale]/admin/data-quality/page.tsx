import type { Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface QualityCheck {
  check_name: string;
  check_type: string;
  severity: string;
  current_value: number;
  threshold: number;
  status: string;
  message: string;
}

export const revalidate = 0; // Always fresh

export default async function AdminDataQualityPage({ 
  params 
}: { 
  params: { locale: Locale };
}) {
  const supabase = await createClient();

  // Run data quality checks
  const { data: checks } = await supabase.rpc('check_data_quality') as { data: QualityCheck[] | null };

  // Get recent data quality issues
  const { data: issues } = await supabase
    .from('data_quality_checks')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  // Calculate health score
  const passingChecks = checks?.filter(c => c.status === 'passing').length || 0;
  const totalChecks = checks?.length || 1;
  const healthScore = (passingChecks / totalChecks) * 100;

  // Count by severity
  const criticalCount = checks?.filter(c => c.severity === 'critical' && c.status === 'failing').length || 0;
  const warningCount = checks?.filter(c => c.severity === 'warning' && c.status === 'failing').length || 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          🔍 Data Quality Monitoring
        </h1>
        <Badge 
          variant={healthScore === 100 ? 'success' : healthScore > 70 ? 'warning' : 'error'}
        >
          Health: {healthScore.toFixed(0)}%
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Health Score</p>
          <p className={`text-4xl font-bold ${
            healthScore === 100 ? 'text-success' : 
            healthScore > 70 ? 'text-warning' : 
            'text-error'
          }`}>
            {healthScore.toFixed(0)}%
          </p>
          <p className="text-xs text-text-muted mt-1">
            {passingChecks} / {totalChecks} checks passing
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Critical Issues</p>
          <p className={`text-4xl font-bold ${criticalCount > 0 ? 'text-error' : 'text-success'}`}>
            {criticalCount}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Needs immediate attention
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Warnings</p>
          <p className={`text-4xl font-bold ${warningCount > 0 ? 'text-warning' : 'text-success'}`}>
            {warningCount}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Monitor closely
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-text-secondary text-sm mb-2">Total Checks</p>
          <p className="text-4xl font-bold text-white">
            {totalChecks}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Automated monitoring
          </p>
        </Card>
      </div>

      {/* Current Checks */}
      <Card className="mb-6">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Current Quality Checks
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-card border-b border-white/10">
              <tr>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Check
                </th>
                <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                  Type
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Current
                </th>
                <th className="text-right text-sm text-text-secondary font-medium py-4 px-6">
                  Threshold
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Severity
                </th>
                <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {checks && checks.length > 0 ? (
                checks.map((check, index) => {
                  const isFailing = check.status === 'failing';
                  const isCritical = check.severity === 'critical';
                  
                  return (
                    <tr key={index} className={`border-b border-white/10 hover:bg-white/5 ${
                      isFailing ? 'bg-error/5' : ''
                    }`}>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white font-medium">
                          {check.check_name.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          {check.message}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-text-secondary">
                        {check.check_type}
                      </td>
                      <td className="py-4 px-6 text-sm text-white text-right font-mono">
                        {check.current_value.toFixed(check.current_value < 10 ? 2 : 0)}
                      </td>
                      <td className="py-4 px-6 text-sm text-text-muted text-right font-mono">
                        {check.threshold.toFixed(0)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge 
                          variant={
                            check.severity === 'critical' ? 'error' :
                            check.severity === 'warning' ? 'warning' :
                            'default'
                          }
                        >
                          {check.severity}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={isFailing ? 'error' : 'success'}>
                          {isFailing ? '❌ FAILING' : '✓ PASSING'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No quality checks available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations */}
      {criticalCount > 0 && (
        <Card className="p-6 bg-error/10 border-error/20 mb-6">
          <h2 className="text-xl font-semibold text-error mb-4">
            ⚠️ Critical Issues Detected
          </h2>
          <div className="space-y-3">
            {checks
              ?.filter(c => c.severity === 'critical' && c.status === 'failing')
              .map((check, index) => (
                <div key={index} className="p-4 bg-background rounded-lg">
                  <p className="text-white font-medium mb-1">
                    {check.check_name.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-text-secondary text-sm mb-2">
                    {check.message}
                  </p>
                  <p className="text-error text-sm font-semibold">
                    Action required: Review and fix immediately
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Recent Issues Log */}
      {issues && issues.length > 0 && (
        <Card>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Recent Issues Log
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-card border-b border-white/10">
                <tr>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Check
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Type
                  </th>
                  <th className="text-left text-sm text-text-secondary font-medium py-4 px-6">
                    Detected
                  </th>
                  <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                    Severity
                  </th>
                  <th className="text-center text-sm text-text-secondary font-medium py-4 px-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-6 text-sm text-white font-medium">
                      {issue.check_name}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary">
                      {issue.check_type}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted">
                      {new Date(issue.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge 
                        variant={
                          issue.severity === 'critical' ? 'error' :
                          issue.severity === 'warning' ? 'warning' :
                          'default'
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={issue.status === 'resolved' ? 'success' : 'warning'}>
                        {issue.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">ℹ️ About Data Quality Monitoring</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>• Automated checks run continuously to ensure data integrity</p>
          <p>• Critical issues require immediate attention to prevent business impact</p>
          <p>• Warnings should be monitored and addressed during maintenance windows</p>
          <p>• Health score reflects overall system data quality</p>
        </div>
      </Card>
    </div>
  );
}

