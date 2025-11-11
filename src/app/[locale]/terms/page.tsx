import type { Locale } from '@/lib/i18n/config';
import { termsOfServiceContent } from '@/lib/legal/terms-content';
import { Card } from '@/components/ui/Card';

export default function TermsPage({ params }: { params: { locale: Locale } }) {
  const content = termsOfServiceContent[params.locale] || termsOfServiceContent.en;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            {content.title}
          </h1>
          <p className="text-text-secondary mb-8">
            Last Updated: {content.lastUpdated}
          </p>

          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <Card key={index} className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-text-secondary whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 mt-8 bg-primary/10 border-primary/20">
            <p className="text-sm text-text-secondary">
              <strong className="text-white">IMPORTANT NOTICE:</strong> By using Lonieve Gift, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms contain important information about your legal rights, remedies, and obligations, including various limitations and exclusions, and a clause that governs the jurisdiction and venue of disputes.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

