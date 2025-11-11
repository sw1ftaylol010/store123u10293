import type { Locale } from '@/lib/i18n/config';
import { privacyPolicyContent } from '@/lib/legal/privacy-content';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage({ params }: { params: { locale: Locale } }) {
  const content = privacyPolicyContent[params.locale as keyof typeof privacyPolicyContent] || privacyPolicyContent.en;

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

          <Card className="p-6 mb-8 bg-primary/10 border-primary/20">
            <p className="text-sm text-text-secondary">
              <strong className="text-white">Your Privacy Matters:</strong> This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this privacy policy carefully.
            </p>
          </Card>

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
        </div>
      </div>
    </div>
  );
}

