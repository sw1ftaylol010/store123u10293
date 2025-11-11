import type { Locale } from '@/lib/i18n/config';
import { Card } from '@/components/ui/Card';

export default function RefundPage({ params }: { params: { locale: Locale } }) {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Refund & Replacement Policy
          </h1>
          <p className="text-text-secondary mb-8">
            Last Updated: January 15, 2025
          </p>

          <Card className="p-6 mb-8 bg-error/10 border-error/20">
            <p className="text-sm text-text-secondary">
              <strong className="text-error">IMPORTANT:</strong> Due to the nature of digital products, all sales are final once delivery is complete.
            </p>
          </Card>

          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. NO REFUNDS POLICY
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  All sales of digital gift card codes are final and non-refundable. This policy is in place because:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Digital codes are delivered instantly and electronically</li>
                  <li>Once delivered, codes cannot be "returned" as they may have been viewed or copied</li>
                  <li>We have no way to verify if a code has been used after delivery</li>
                  <li>Digital goods are exempt from standard consumer refund laws in most jurisdictions</li>
                </ul>
                <p className="font-semibold text-white mt-4">
                  By completing your purchase, you acknowledge and accept that no refunds will be provided under any circumstances.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. NON-WORKING CODE REPLACEMENT
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  In the rare event that a delivered code does not work, we may provide a replacement at our sole discretion.
                </p>
                <p className="font-semibold text-white">Requirements for replacement consideration:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Report the issue within 48 hours of delivery</li>
                  <li>Provide your order number</li>
                  <li>Provide a screenshot of the error message from the brand's platform</li>
                  <li>Confirm the code has not been redeemed successfully</li>
                  <li>Demonstrate that the code was used in the correct region</li>
                </ul>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. WHEN REPLACEMENTS ARE NOT PROVIDED
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>We will NOT provide replacements in the following situations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Code was already successfully redeemed</li>
                  <li>Code was used in a different region than specified at purchase</li>
                  <li>Your account with the third-party service is restricted or banned</li>
                  <li>Code expired due to delay in redemption</li>
                  <li>Incorrect email address was provided</li>
                  <li>You changed your mind after purchase</li>
                  <li>You didn't check your email or spam folder</li>
                  <li>Unauthorized access to your email account</li>
                  <li>The claim is submitted more than 48 hours after delivery</li>
                </ul>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. REPLACEMENT PROCESS
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>If you believe you are eligible for a replacement:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact support@lonievegift.com within 48 hours</li>
                  <li>Include your order number and proof of the issue</li>
                  <li>Our team will investigate (typically 24-48 hours)</li>
                  <li>If approved, a replacement code will be sent to your email</li>
                  <li>Replacements are subject to code availability</li>
                </ol>
                <p className="font-semibold text-white mt-4">
                  Our decision on replacement eligibility is final and binding.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. YOUR RESPONSIBILITY
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>
                  Once a digital code is delivered to your email, you assume full responsibility for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Securing the code and preventing unauthorized access</li>
                  <li>Redeeming the code before any expiration date</li>
                  <li>Ensuring you purchased the correct region</li>
                  <li>Following the brand's redemption instructions</li>
                  <li>Maintaining access to the email address provided</li>
                </ul>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. CHARGEBACKS
              </h2>
              <div className="text-text-secondary space-y-4">
                <p className="font-semibold text-error">
                  Initiating a chargeback for a valid delivered code is considered fraud.
                </p>
                <p>
                  If you initiate a chargeback after receiving a working code:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your account will be immediately suspended</li>
                  <li>You will be permanently banned from using our Service</li>
                  <li>We reserve the right to pursue legal action</li>
                  <li>The chargeback will be contested with evidence of delivery</li>
                </ul>
                <p>
                  If you have a legitimate issue, contact us first at support@lonievegift.com.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. CONTACT US
              </h2>
              <div className="text-text-secondary space-y-4">
                <p>For questions about this policy or to report a non-working code:</p>
                <p className="font-semibold text-white">
                  Email: support@lonievegift.com<br />
                  Response Time: Within 24-48 hours
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

