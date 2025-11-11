interface CreateBillParams {
  amount: number;
  order_id: string;
  description: string;
  currency_in?: string;
  shop_id?: string;
  custom?: Record<string, any>;
  payer_pays_commission?: boolean;
}

interface CreateBillResponse {
  id: string;
  payment_url: string;
  status: string;
  amount: number;
  currency: string;
}

interface BillStatusResponse {
  id: string;
  status: 'PAID' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
  amount: number;
  paid_at?: string;
}

export class CardlinkAPI {
  private apiUrl: string;
  private apiToken: string;
  private shopId: string;

  constructor() {
    this.apiUrl = process.env.CARDLINK_API_URL || 'https://cardlink.link/api/v1';
    this.apiToken = process.env.CARDLINK_API_TOKEN!;
    this.shopId = process.env.CARDLINK_SHOP_ID!;
  }

  async createBill(params: CreateBillParams): Promise<CreateBillResponse> {
    const response = await fetch(`${this.apiUrl}/bill/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        shop_id: params.shop_id || this.shopId,
        currency_in: params.currency_in || 'USD',
        type: 'normal',
        payer_pays_commission: params.payer_pays_commission ?? true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cardlink API error: ${error}`);
    }

    return response.json();
  }

  async getBillStatus(billId: string): Promise<BillStatusResponse> {
    const response = await fetch(`${this.apiUrl}/bill/status?id=${billId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cardlink API error: ${error}`);
    }

    return response.json();
  }

  async searchBills(orderId: string) {
    const response = await fetch(`${this.apiUrl}/bill/search?order_id=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cardlink API error: ${error}`);
    }

    return response.json();
  }

  verifyPostbackSignature(signature: string, data: any): boolean {
    // Implement signature verification based on Cardlink documentation
    // This is a placeholder - adjust according to actual Cardlink implementation
    const secret = process.env.CARDLINK_POSTBACK_SECRET!;
    // Add your signature verification logic here
    return true;
  }
}

export const cardlinkAPI = new CardlinkAPI();

