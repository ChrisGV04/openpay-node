export namespace IOpenPay {
  export type Countries = 'mx' | 'co' | 'pe';
  export type Currency = 'MXN' | 'USD' | 'COP' | 'PEN';
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
    countryCode?: Countries;
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

  export interface BasicListQuery {
    creation?: string;
    'creation[gte]'?: string;
    'creation[lte]'?: string;
    offset?: number;
    limit?: number;
  }

  export interface Customer {
    id: string;
    creation_date: string;
    name: string;
    last_name: string;
    email: string;
    phone_number: string; // TODO: Check type. Docs have mixed type (string, number)
    status: 'active' | 'deleted';
    balance: number;
    clabe: string; // TODO: Check type. Docs have mixed type (string, number)
    address: Address;
    store: {
      reference: string;
      barcode_url: string;
    };
  }

  export namespace Customer {
    export interface CreateInput {
      external_id?: string;
      name: string;
      last_name?: string;
      email: string;
      requires_account?: string;
      phone_number?: string;
      address?: Address;
    }

    export interface ListQuery extends BasicListQuery {
      external_id?: string;
    }

    export type UpdateInput = Omit<Customer.CreateInput, 'external_id' | 'requires_account'>;
  }

  export interface Card {
    id: string;
    creation_date: string;
    holder_name: string;
    card_number: string; // TODO: Test type. Docs have mixed type (number, string)
    cvv2: string;
    expiration_month: number; // TODO: Test type. Docs have mixed type (number, string)
    expiration_year: number; // TODO: Test type. Docs have mixed type (number, string)
    address: Address;
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
          address: Address;
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

    export type ListQuery = BasicListQuery;
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
    transaction_type: Transaction.TransactionType;
    operation_type: Transaction.OperationType;
    method: Transaction.Method;
    creation_date: string;
    order_id: string | null;
    status: Transaction.Status;
    amount: number;
    description: string;
    error_message: string | null;
    customer_id: string | null;
    currency: Currency;
    bank_account?: any; // TODO: Interface BankAccount
    card?: any; // TODO: Interface Card
    card_points?: CardPoints;
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
      address: Address;
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
      customer: Customer.CreateInput;
    }

    interface CreateFromCard {
      method: 'card';
      source_id: string;
      currency?: Currency;
      device_session_id: string;
      capture?: boolean;
      payment_plan?: { payments: PaymentMonths };
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
      currency?: Currency;
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

    export interface ListQuery extends BasicListQuery {
      order_id?: string;
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

    export interface ListQuery extends BasicListQuery {
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

    export type ListQuery = BasicListQuery;
  }

  export interface Store {
    id_store: string;
    id: string;
    name: string;
    last_update: string;
    geolocation: { lng: number; lat: number; place_id: string };
    address: Address;
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
    event_types: Webhook.EventTypes[];
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

    export type CreateInput = Pick<Webhook, 'url' | 'user' | 'password' | 'event_types'>;
  }

  export interface Plan {
    id: string;
    creation_date: string;
    name: string;
    amount: number;
    currency: Currency;
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

    export type ListQuery = BasicListQuery;
  }

  export namespace Transfers {
    export interface CreateInput {
      customer_id: string;
      amount: number;
      description: string;
      order_id?: string;
    }

    export type ListQuery = BasicListQuery;
  }

  export interface Subscription {
    id: string;
    creation_date: string;
    cancel_at_period_end: boolean; // TODO: Check type. Docs have mixed types (string, boolean)
    charge_date: string; // TODO: Check type. Docs have mixed types (string, number)
    current_period_number: number;
    period_end_date: string; // TODO: Check type. Docs have mixed types (string, number)
    trial_end_date: string; // TODO: Check type. Docs have mixed types (string, number)
    plan_id: string; // TODO: Check type. Docs have mixed types (string, number)
    status: 'active' | 'trial' | 'past_due' | 'unpaid' | 'cancelled';
    customer_id: string;
    card: Card;
  }

  export namespace Subscription {
    export interface CreateInput {
      plan_id: string;
      trial_end_date?: string;
      source_id?: string;
      card?: Card;
      device_session_id?: string;
    }

    export interface UpdateInput {
      cancel_at_period_end?: boolean;
      trial_end_date?: string;
      source_id?: string;
      card?: Card;
    }

    export type ListQuery = BasicListQuery;
  }

  export interface BankAccount {
    id: string;
    holder_name: string;
    alias: string | null;
    clabe: string;
    bank_name: string;
    bank_code: string;
    creation_date: string;
  }

  export namespace BankAccount {
    export interface CreateInput {
      holder_name: string;
      alias?: string;
      clabe: string;
    }

    export type ListQuery = BasicListQuery;
  }

  export namespace Checkout {
    export type Status = 'available' | 'other';

    export interface CreateInput {
      amount: number;
      description: string;
      order_id?: string;
      currency: Currency;
      redirect_url: string;
      expiration_date?: string;
      send_email?: boolean;
      customer: Pick<Customer, 'name' | 'last_name' | 'phone_number' | 'email'>;
    }
  }

  export namespace SDK {
    export interface Charges {
      create(data: Charge.CreateInput): Promise<Transaction>;
      list(query?: Charge.ListQuery): Promise<Transaction[]>;
      get(transactionId: string): Promise<Transaction>;
      capture(transactionId: string, data: Charge.CaptureInput): Promise<Transaction>;
      refund(transactionId: string, data: Charge.RefundInput): Promise<Transaction>;
    }

    export interface Payouts {
      create(data: Payout.CreateInput): Promise<Transaction>;
      list(query?: Payout.ListQuery): Promise<Transaction[]>;
      get(transactionId: string): Promise<Transaction>;
    }

    export interface Fees {
      create(data: Fee.CreateInput): Promise<Transaction>;
      list(query?: Fee.ListQuery): Promise<Transaction[]>;
    }

    export interface Cards {
      create(data: Card.CreateInput): Promise<Card>;
      list(query?: Card.ListQuery): Promise<Card[]>;
      get(cardId: string): Promise<Card>;
      delete(cardId: string): Promise<void>;
      update(cardId: string, data: Card.UpdateInput): Promise<void>;
    }

    export interface Tokens {
      create(data: Token.CreateInput): Promise<Token>;
      get(tokenId: string): Promise<Token>;
    }

    export interface Stores {
      list(query?: Store.ListQuery): Promise<Store>;
    }

    export interface Pse {
      create(data: Charge.CreateInput): Promise<Transaction>;
    }

    export interface Webhooks {
      create(data: Webhook.CreateInput): Promise<Webhook>;
      list(): Promise<Webhook[]>;
      get(webhookId: string): Promise<Webhook>;
      delete(webhookId: string): Promise<void>;
    }

    export interface Plans {
      create(data: Plan.CreateInput): Promise<Plan>;
      list(query?: Plan.ListQuery): Promise<Plan[]>;
      get(planId: string): Promise<Plan>;
      update(planId: string, data: Plan.UpdateInput): Promise<Plan>;
      delete(planId: string): Promise<void>;
    }

    export interface Customers {
      create(data: Customer.CreateInput): Promise<Customer>;
      list(query?: Customer.ListQuery): Promise<Customer[]>;
      get(customerId: string): Promise<Customer>;
      update(customerId: string, data: Customer.UpdateInput): Promise<Customer>;
      delete(customerId: string): Promise<void>;

      charges: {
        create(customerId: string, data: Charge.CreateInput): Promise<Transaction>;
        list(customerId: string, query?: Charge.ListQuery): Promise<Transaction[]>;
        get(customerId: string, transactionId: string): Promise<Transaction>;
        capture(customerId: string, transactionId: string, data: Charge.CaptureInput): Promise<Transaction>;
        refund(customerId: string, transactionId: string, data: Charge.RefundInput): Promise<Transaction>;
      };

      transfers: {
        create(customerId: string, data: Transfers.CreateInput): Promise<Transaction>;
        list(customerId: string, query?: Transfers.ListQuery): Promise<Transaction[]>;
        get(customerId: string, transactionId: string): Promise<Transaction>;
      };

      payouts: {
        create(customerId: string, data: Payout.CreateInput): Promise<Transaction>;
        list(customerId: string, query?: Payout.ListQuery): Promise<Transaction[]>;
        get(customerId: string, transactionId: string): Promise<Transaction>;
      };

      subscriptions: {
        create(customerId: string, data: Subscription.CreateInput): Promise<Subscription>;
        list(customerId: string, query?: Subscription.ListQuery): Promise<Subscription[]>;
        get(customerId: string, subscriptionId: string): Promise<Subscription>;
        update(
          customerId: string,
          subscriptionId: string,
          data: Subscription.UpdateInput,
        ): Promise<Subscription>;
        delete(customerId: string, subscriptionId: string): Promise<void>;
      };

      cards: {
        create(customerId: string, data: Card.CreateInput): Promise<Card>;
        list(customerId: string, query?: Card.ListQuery): Promise<Card[]>;
        get(customerId: string, cardId: string): Promise<Card>;
        delete(customerId: string, cardId: string): Promise<void>;
        update(customerId: string, cardId: string, data: Card.UpdateInput): Promise<Card>;
      };

      bankaccounts: {
        create(customerId: string, data: BankAccount.CreateInput): Promise<BankAccount>;
        list(customerId: string, query?: BankAccount.ListQuery): Promise<BankAccount[]>;
        get(customerId: string, bankId: string): Promise<BankAccount>;
        delete(customerId: string, bankId: string): Promise<void>;
      };

      pse: {
        create(customerId: string, data: Charge.CreateInput): Promise<Transaction>;
      };

      checkouts: {
        // TODO: Find types. Missing in docs
        create(customerId: string, data: Checkout.CreateInput): Promise<any>;
      };
    }

    // TODO: Find types. Missing in docs
    export interface Checkouts {
      create(data: Checkout.CreateInput): Promise<any>;
      list(query?: any): Promise<any[]>;
      get(checkoutId: string): Promise<any>;
      update(checkoutId: string, status: Checkout.Status, data: any): Promise<any>;
    }
  }
}
