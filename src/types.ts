export namespace IOpenPay {
  export type Countries = 'mx' | 'co' | 'pe';
  export type Currency = 'MXN' | 'USD';
  export type PaymentMonths = 3 | 6 | 9 | 12 | 18;

  export interface Error {
    category: 'request' | 'internal' | 'gateway';
    error_code: number;
    description: string;
    http_code: string; // TODO: Check type. Docs have mixed type (string, number)
    request_id: string;
    fraud_rules: string[]; // TODO: Check if it ever returns null
  }

  export interface Options {
    merchantId: string;
    privateKey: string;
    isProductionReady: boolean;
    countryCode?: IOpenPay.Countries;
  }

  export interface Address {
    line1: string;
    line2: string | null;
    line3: string | null;
    postal_code: string;
    state: string;
    city: string;
    country_code: string;
  }

  export namespace Customer {
    export interface CreateInput {
      external_id?: string;
      name: string;
      last_name?: string;
      email: string;
      requires_account?: string;
      phone_number?: string;
      address?: IOpenPay.Address;
    }
  }

  export interface Card {
    id: string;
    creation_date: string;
    holder_name: string;
    card_number: string; // TODO: Test type. Docs have mixed type (number, string)
    cvv2: string;
    expiration_month: number; // TODO: Test type. Docs have mixed type (number, string)
    expiration_year: number; // TODO: Test type. Docs have mixed type (number, string)
    address: IOpenPay.Address;
    allows_charges: boolean;
    allows_payouts: boolean;
    brand: string;
    type: string;
    bank_name: string;
    bank_code: string;
    customer_id: string;
    points_card: boolean;
  }

  export namespace Card {
    export type CreateInput =
      | {
          holder_name: string;
          card_number: string; // TODO: Test type. Docs have mixed type (number, string)
          cvv2: string;
          expiration_month: string; // TODO: Test type. Docs have mixed type (number, string)
          expiration_year: string; // TODO: Test type. Docs have mixed type (number, string)
          device_session_id?: string;
          address: IOpenPay.Address;
        }
      | {
          token_id: string;
          device_session_id: string;
        };

    export interface UpdateInput {
      holder_name?: string;
      cvv2?: string;
      expiration_month?: string; // TODO: Test type. Docs have mixed type (number, string)
      expiration_year?: string; // TODO: Test type. Docs have mixed type (number, string)
      merchant_id?: string;
    }

    export interface ListQuery {
      creation?: string;
      'creation[gte]'?: string;
      'creation[lte]'?: string;
      offset?: number;
      limit?: number;
    }
  }

  export namespace Transaction {
    export type Method = 'card' | 'bank' | 'customer' | 'store';
    export type TransactionType = 'fee' | 'charge' | 'payout' | 'transfer';
    export type OperationType = 'in' | 'out';
    export type Status = 'completed' | 'in_progress' | 'failed';
  }

  export interface Transaction {
    id: string;
    authorization: string | null;
    transaction_type: IOpenPay.Transaction.TransactionType;
    operation_type: IOpenPay.Transaction.OperationType;
    method: IOpenPay.Transaction.Method;
    creation_date: string;
    order_id: string | null;
    status: IOpenPay.Transaction.Status;
    amount: number;
    description: string;
    error_message: string | null;
    customer_id: string | null;
    currency: IOpenPay.Currency;
    bank_account?: any; // TODO: Interface BankAccount
    card?: any; // TODO: Interface Card
    card_points?: IOpenPay.CardPoints;
  }

  export interface Token {
    id: string;
    card: Card;
  }

  export namespace Token {
    export interface CreateInput {
      holder_name: string;
      card_number: string; // TODO: Test type. Docs have mixed type (number, string)
      cvv2: string;
      expiration_month: string; // TODO: Test type. Docs have mixed type (number, string)
      expiration_year: string; // TODO: Test type. Docs have mixed type (number, string)
      address: IOpenPay.Address;
    }
  }

  export interface CardPoints {
    used: number;
    remaining: number;
    amount: number;
    caption?: string;
  }

  export namespace Charge {
    interface CreateBase {
      amount: number;
      description: string;
      order_id?: string;
      customer: IOpenPay.Customer.CreateInput;
    }

    interface CreateFromCard {
      method: 'card';
      source_id: string;
      currency?: IOpenPay.Currency;
      device_session_id: string;
      capture?: boolean;
      payment_plan?: { payments: IOpenPay.PaymentMonths };
      metadata?: Record<string, any>;
      use_card_points?: 'NONE' | 'MIXED' | 'ONLY_POINTS';
      confirm?: boolean;
      send_email?: boolean;
      redirect_url?: string;
      use_3d_secure?: boolean;
    }

    interface CreateFromStore {
      method: 'store';
      due_date?: string;
    }

    interface CreateFromBank {
      method: 'bank_account';
      due_date?: string;
    }

    interface CreateFromAlipay {
      method: 'alipay';
      due_date?: string;
      redirect_url: string;
    }

    interface CreateFromIVR {
      method: 'card';
      confirm: 'ivr';
      currency?: IOpenPay.Currency;
      metadata?: Record<string, any>;
      send_email?: boolean;
    }

    export type CreateInput = CreateBase &
      (CreateFromCard | CreateFromStore | CreateFromBank | CreateFromAlipay | CreateFromIVR);

    export interface CaptureInput {
      amount?: number;
    }

    export interface RefundInput {
      description?: string;
      amount?: number;
    }

    export interface ListQuery {
      order_id?: string;
      creation?: string;
      'creation[gte]'?: string;
      'creation[lte]'?: string;
      offset?: number;
      limit?: number;
      amount?: number;
      'amount[gte]'?: number;
      'amount[lte]'?: number;
      status?:
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'REFUNDED'
        | 'CHARGEBACK_PENDING'
        | 'CHARGEBACK_ACCEPTED'
        | 'CHARGEBACK_ADJUSTMENT'
        | 'CHARGE_PENDING'
        | 'CANCELLED'
        | 'FAILED';
    }
  }

  export namespace Payout {
    export interface CreateInput {
      method: 'bank_account';
      amount: number;
      description: string;
      order_id?: string;
      destination_id?: string;
      bank_account?: {
        clabe: string;
        holder_name: string;
      };
    }

    export interface ListQuery {
      creation?: string;
      'creation[gte]'?: string;
      'creation[lte]'?: string;
      offset?: number;
      limit?: number;
      amount?: number;
      'amount[gte]'?: number;
      'amount[lte]'?: number;
      payout_type?: 'ALL' | 'AUTOMATIC' | 'MANUAL';
    }
  }

  export namespace Fee {
    export interface CreateInput {
      customer_id: string;
      amount: number;
      description: string;
      order_id?: string;
    }

    export interface ListQuery {
      creation?: string;
      'creation[gte]'?: string;
      'creation[lte]'?: string;
      offset?: number;
      limit?: number;
    }
  }

  export interface Store {
    id_store: string;
    id: string;
    name: string;
    last_update: string;
    geolocation: { lng: number; lat: number; place_id: string };
    address: IOpenPay.Address;
    paynet_chain: {
      name: string;
      logo: string;
      thumb: string;
      max_amount: number;
    }; // TODO: Check if this can be null
  }

  export namespace Store {
    export interface ListQuery {
      latitud: number;
      longitud: number;
      kilometers: number;
      amount: number;
    }
  }

  export interface Webhook {
    id: string;
    url: string;
    user: string;
    password: string;
    event_types: IOpenPay.Webhook.EventTypes[];
    status: 'verified' | 'unverified';
  }

  export namespace Webhook {
    export type EventTypes =
      | 'charge.refunded'
      | 'charge.failed'
      | 'charge.cancelled'
      | 'charge.created'
      | 'charge.succeeded'
      | 'charge.rescored.to.decline'
      | 'subscription.charge.failed'
      | 'payout.created'
      | 'payout.succeeded'
      | 'payout.failed'
      | 'transfer.succeeded'
      | 'fee.succeeded'
      | 'fee.refund.succeeded'
      | 'spei.received'
      | 'chargeback.created'
      | 'chargeback.rejected'
      | 'chargeback.accepted'
      | 'order.created'
      | 'order.activated'
      | 'order.payment.received'
      | 'order.completed'
      | 'order.expired'
      | 'order.cancelled'
      | 'order.payment.cancelled';

    export type CreateInput = Pick<IOpenPay.Webhook, 'url' | 'user' | 'password' | 'event_types'>;
  }

  export interface Plan {
    id: string;
    creation_date: string;
    name: string;
    amount: number;
    currency: IOpenPay.Currency;
    repeat_every: number;
    repeat_unit: 'week' | 'month' | 'year';
    retry_times: number;
    status: 'active' | 'deleted';
    status_after_retry: 'unpaid' | 'cancelled';
    trial_days: number;
  }

  export namespace Plan {
    export interface CreateInput {
      name: string;
      amount: number;
      repeat_every: number;
      repeat_unit: 'week' | 'month' | 'year';
      retry_times?: number;
      status_after_retry: 'unpaid' | 'cancelled';
      trial_days: number;
    }

    export interface UpdateInput {
      name?: string;
      trial_days?: number;
    }

    export interface ListQuery {
      creation?: string;
      'creation[gte]'?: string;
      'creation[lte]'?: string;
      offset?: number;
      limit?: number;
    }
  }

  export namespace SDK {
    export interface Charges {
      create(data: IOpenPay.Charge.CreateInput): Promise<IOpenPay.Transaction>;
      list(query?: IOpenPay.Charge.ListQuery): Promise<IOpenPay.Transaction[]>;
      get(transactionId: string): Promise<IOpenPay.Transaction>;
      capture(transactionId: string, data: IOpenPay.Charge.CaptureInput): Promise<IOpenPay.Transaction>;
      refund(transactionId: string, data: IOpenPay.Charge.RefundInput): Promise<IOpenPay.Transaction>;
    }

    export interface Payouts {
      create(data: IOpenPay.Payout.CreateInput): Promise<IOpenPay.Transaction>;
      list(query?: IOpenPay.Payout.ListQuery): Promise<IOpenPay.Transaction[]>;
      get(transactionId: string): Promise<IOpenPay.Transaction>;
    }

    export interface Fees {
      create(data: IOpenPay.Fee.CreateInput): Promise<IOpenPay.Transaction>;
      list(query?: IOpenPay.Fee.ListQuery): Promise<IOpenPay.Transaction[]>;
    }

    export interface Cards {
      create(data: IOpenPay.Card.CreateInput): Promise<IOpenPay.Card>;
      list(query?: IOpenPay.Card.ListQuery): Promise<IOpenPay.Card[]>;
      get(cardId: string): Promise<IOpenPay.Card>;
      delete(cardId: string): Promise<void>;
      update(cardId: string, data: IOpenPay.Card.UpdateInput): Promise<void>;
    }

    export interface Tokens {
      create(data: IOpenPay.Token.CreateInput): Promise<IOpenPay.Token>;
      get(tokenId: string): Promise<IOpenPay.Token>;
    }

    export interface Stores {
      list(query?: IOpenPay.Store.ListQuery): Promise<IOpenPay.Store>;
    }

    export interface Pse {
      create(data: IOpenPay.Charge.CreateInput): Promise<IOpenPay.Transaction>;
    }

    export interface Webhooks {
      create(data: IOpenPay.Webhook.CreateInput): Promise<IOpenPay.Webhook>;
      list(): Promise<IOpenPay.Webhook[]>;
      get(webhookId: string): Promise<IOpenPay.Webhook>;
      delete(webhookId: string): Promise<void>;
    }

    export interface Plans {
      create(data: IOpenPay.Plan.CreateInput): Promise<IOpenPay.Plan>;
      list(query?: IOpenPay.Plan.ListQuery): Promise<IOpenPay.Plan[]>;
      get(planId: string): Promise<IOpenPay.Plan>;
      update(planId: string, data: IOpenPay.Plan.UpdateInput): Promise<IOpenPay.Plan>;
      delete(planId: string): Promise<void>;
    }
  }
}
