interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  items: Array<{
    brand: string;
    nominal: number;
    code: string;
    currency: string;
  }>;
  totalAmount: number;
  currency: string;
}

export function generateOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <h3 style="color: #D4A574; margin: 0 0 10px 0;">${item.brand} Gift Card</h3>
        <p style="color: #a0a0a0; margin: 0 0 5px 0;">Amount: ${item.currency} ${item.nominal}</p>
        <div style="background: #0a0a0a; padding: 15px; border-radius: 6px; margin-top: 10px;">
          <p style="color: #666; margin: 0 0 5px 0; font-size: 12px;">Your Code:</p>
          <code style="color: #D4A574; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${item.code}</code>
        </div>
      </div>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gift Card Codes - Lonieve Gift</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #121212; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">
                <span style="color: #D4A574;">Lonieve</span> Gift
              </h1>
              <p style="margin: 15px 0 0 0; color: #a0a0a0; font-size: 16px;">Thank you for your purchase!</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td align="center" style="padding: 30px;">
              <div style="width: 80px; height: 80px; background: #D4A574; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 40px;">
                ✓
              </div>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="color: #a0a0a0; margin: 0 0 5px 0; font-size: 14px;">Order Number</p>
              <p style="color: #ffffff; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">#${data.orderNumber}</p>
            </td>
          </tr>

          <!-- Gift Card Codes -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px;">Your Gift Cards</h2>
              ${itemsHtml}
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #a0a0a0; font-size: 16px;">Total Paid</span>
                <span style="color: #D4A574; font-size: 24px; font-weight: bold;">${data.currency} ${data.totalAmount.toFixed(2)}</span>
              </div>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #D4A574;">
                <h3 style="color: #D4A574; margin: 0 0 10px 0; font-size: 16px;">Important Notes</h3>
                <ul style="color: #a0a0a0; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>Keep your codes safe and secure</li>
                  <li>Codes are valid for single use only</li>
                  <li>Contact support within 48 hours if code doesn't work</li>
                  <li>You can access your codes anytime in your account</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Need help?</p>
              <a href="mailto:support@lonievegift.com" style="color: #D4A574; text-decoration: none; font-size: 14px;">support@lonievegift.com</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="color: #666; margin: 0 0 5px 0; font-size: 12px;">© 2025 Lonieve Gift. All rights reserved.</p>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">Premium digital gift cards with instant delivery</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateGiftEmail(data: OrderEmailData & { recipientName?: string; message?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You Received a Gift Card! - Lonieve Gift</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #121212; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 20px;">🎁</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">You received a gift!</h1>
              ${data.recipientName ? `<p style="margin: 15px 0 0 0; color: #a0a0a0; font-size: 16px;">Hi ${data.recipientName},</p>` : ''}
            </td>
          </tr>

          ${data.message ? `
          <tr>
            <td style="padding: 30px;">
              <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #D4A574;">
                <p style="color: #a0a0a0; margin: 0; font-style: italic;">"${data.message}"</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Gift Card Codes -->
          <tr>
            <td style="padding: 30px;">
              ${data.items.map(item => `
                <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                  <h3 style="color: #D4A574; margin: 0 0 10px 0;">${item.brand} Gift Card</h3>
                  <p style="color: #a0a0a0; margin: 0 0 5px 0;">Amount: ${item.currency} ${item.nominal}</p>
                  <div style="background: #0a0a0a; padding: 15px; border-radius: 6px; margin-top: 10px;">
                    <p style="color: #666; margin: 0 0 5px 0; font-size: 12px;">Your Code:</p>
                    <code style="color: #D4A574; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${item.code}</code>
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="color: #666; margin: 0 0 5px 0; font-size: 12px;">Sent via Lonieve Gift</p>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">© 2025 Lonieve Gift. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

