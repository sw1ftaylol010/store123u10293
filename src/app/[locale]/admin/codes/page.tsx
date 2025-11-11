'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Papa from 'papaparse';

export default function AdminCodesPage({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          // Expected CSV format: product_id, code, nominal, expires_at (optional)
          const codes = results.data.filter((row: any) => row.product_id && row.code);

          const response = await fetch('/api/admin/codes/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codes }),
          });

          if (response.ok) {
            const data = await response.json();
            setUploadResult(`Successfully imported ${data.count} codes`);
          } else {
            throw new Error('Failed to import codes');
          }
          
          setIsUploading(false);
        },
        error: (error) => {
          setUploadResult(`Error: ${error.message}`);
          setIsUploading(false);
        },
      });
    } catch (error) {
      setUploadResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          {t.admin.codes}
        </h1>
      </div>

      {/* Import Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {t.admin.importCodes}
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-secondary mb-2">
              Upload CSV file with columns: product_id, code, nominal, expires_at (optional)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background file:font-medium hover:file:bg-primary-dark file:cursor-pointer"
            />
          </div>

          {uploadResult && (
            <div className={`p-4 rounded-lg ${uploadResult.startsWith('Error') ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
              {uploadResult}
            </div>
          )}
        </div>
      </Card>

      {/* CSV Template */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-3">CSV Template</h3>
        <pre className="text-xs text-text-secondary bg-background p-4 rounded-lg overflow-x-auto">
{`product_id,code,nominal,expires_at
550e8400-e29b-41d4-a716-446655440000,XXXX-XXXX-XXXX-XXXX,50,
550e8400-e29b-41d4-a716-446655440000,YYYY-YYYY-YYYY-YYYY,100,2025-12-31`}
        </pre>
        <p className="text-sm text-text-secondary mt-3">
          Download this template and fill it with your gift codes. The expires_at field is optional.
        </p>
      </Card>
    </div>
  );
}

