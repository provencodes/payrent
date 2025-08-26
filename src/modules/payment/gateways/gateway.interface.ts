export type CreatePlanType = {
  name: string;
  amount: number;
  interval: string;
  description?: string;
  send_invoices?: boolean;
  send_sms?: boolean;
  currency?: string | 'NGN';
  invoice_limit?: number;
};

export interface TransferRecipient {
  name: string;
  bankCode: string;
  accountNumber: string;
  description: string;
}

export interface InitiateTransfer {
  amount: number;
  recipient: string;
  reference: string;
  reason: string;
}
