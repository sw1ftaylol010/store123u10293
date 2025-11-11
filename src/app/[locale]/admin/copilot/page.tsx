'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CopilotResult {
  query: string;
  intent: string;
  result: any;
  responseTime: number;
}

export default function AdminCopilotPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CopilotResult[]>([]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResults([data, ...results]);
      setQuery('');
    } catch (error) {
      console.error('Copilot error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    'Show me revenue for last 7 days',
    'What\'s our profit this week?',
    'Show top 10 products',
    'Who are our best customers?',
    'What are the top performing channels?',
    'Show me current alerts',
    'What\'s our unit economics?',
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          🤖 AI Business Copilot
        </h1>
        <p className="text-text-secondary">
          Ask questions about your business in natural language
        </p>
      </div>

      {/* Query Input */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleQuery}>
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your business..."
              className="flex-1 px-4 py-3 bg-background-lighter border border-white/10 rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Thinking...' : 'Ask'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <p className="text-sm text-text-muted mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-xs px-3 py-1 bg-background-lighter border border-white/10 rounded-full text-text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-white font-medium mb-1">{result.query}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{result.intent}</Badge>
                  <span className="text-xs text-text-muted">
                    {result.responseTime}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Render result based on type */}
            {result.result.type === 'metric' && (
              <div className="p-4 bg-background-lighter rounded-lg">
                <p className="text-text-secondary text-sm mb-1">{result.result.metric}</p>
                <p className="text-3xl font-bold text-primary">{result.result.formatted}</p>
                <p className="text-xs text-text-muted mt-1">{result.result.period}</p>
              </div>
            )}

            {result.result.type === 'table' && (
              <div className="overflow-x-auto">
                <h3 className="text-white font-semibold mb-3">{result.result.title}</h3>
                <table className="w-full">
                  <thead className="bg-background-card border-b border-white/10">
                    <tr>
                      {result.result.columns.map((col: string, i: number) => (
                        <th key={i} className="text-left text-sm text-text-secondary font-medium py-3 px-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.result.rows.map((row: any[], i: number) => (
                      <tr key={i} className="border-b border-white/10">
                        {row.map((cell: any, j: number) => (
                          <td key={j} className="py-3 px-4 text-sm text-white">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.result.type === 'alerts' && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold mb-3">{result.result.title}</h3>
                {result.result.alerts.length > 0 ? (
                  result.result.alerts.map((alert: any, i: number) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical'
                          ? 'bg-error/10 border-error/20'
                          : alert.severity === 'warning'
                          ? 'bg-warning/10 border-warning/20'
                          : 'bg-success/10 border-success/20'
                      }`}
                    >
                      <p className="text-white font-medium mb-1">{alert.title}</p>
                      <p className="text-sm text-text-secondary mb-2">{alert.description}</p>
                      {alert.recommendation && (
                        <p className="text-sm text-primary">💡 {alert.recommendation}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary">No alerts at this time</p>
                )}
              </div>
            )}

            {result.result.type === 'metrics_list' && (
              <div>
                <h3 className="text-white font-semibold mb-3">{result.result.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {result.result.metrics.map((metric: any, i: number) => (
                    <div key={i} className="p-4 bg-background-lighter rounded-lg">
                      <p className="text-text-secondary text-sm mb-1">{metric.name}</p>
                      <p className="text-xl font-bold text-white">{metric.formatted}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.result.type === 'text' && (
              <div className="p-4 bg-background-lighter rounded-lg">
                <pre className="text-sm text-text-secondary whitespace-pre-wrap">
                  {result.result.message}
                </pre>
              </div>
            )}
          </Card>
        ))}

        {results.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to help!
            </h3>
            <p className="text-text-secondary">
              Ask me anything about your business metrics, customers, or performance
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

