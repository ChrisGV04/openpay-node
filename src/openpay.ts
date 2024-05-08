import type { FetchOptions } from 'ofetch';
import type { IOpenPay } from './types';

import { ofetch } from 'ofetch';

const OPEN_PAY_MX_BASE_URL = 'https://api.openpay.mx';
const OPEN_PAY_MX_SANDBOX_URL = 'https://sandbox-api.openpay.mx';
const OPEN_PAY_API_VERSION = 'v1';
const OPEN_PAY_SANDBOX_API_VERSION = 'v1';

export { IOpenPay } from './types';

export class OpenPay {
  private merchantId: string;
  private privateKey: string;
  private isSandbox: boolean;
  private timeout = 9000; // 9 seconds in milliseconds

  private baseUrl = OPEN_PAY_MX_BASE_URL;
  private sandboxUrl = OPEN_PAY_MX_SANDBOX_URL;

  constructor(options: IOpenPay.Options) {
    this.merchantId = options.merchantId;
    this.privateKey = options.privateKey;
    this.isSandbox = options.isProductionReady;

    this.setBaseUrl(options.countryCode ?? 'mx');
  }

  private setBaseUrl(countryCode: IOpenPay.Countries) {
    switch (countryCode) {
      case 'pe':
        this.baseUrl = 'https://api.openpay.pe';
        this.sandboxUrl = 'https://sandbox-api.openpay.pe';
        break;
      case 'co':
        this.baseUrl = 'https://api.openpay.co';
        this.sandboxUrl = 'https://sandbox-api.openpay.co';
        break;
      default:
        if (countryCode !== 'mx') console.error('(OpenPay): Invalid country code. Setting MX as default.');
        this.baseUrl = OPEN_PAY_MX_BASE_URL;
        this.sandboxUrl = OPEN_PAY_MX_SANDBOX_URL;
        break;
    }
  }

  private async sendRequest<T>(apiPath: string, options?: FetchOptions<'json'>): Promise<T> {
    const url = this.isSandbox
      ? `${this.sandboxUrl}/${OPEN_PAY_SANDBOX_API_VERSION}/${apiPath}`
      : `${this.baseUrl}/${OPEN_PAY_API_VERSION}/${apiPath}`;

    // TODO: Test requests
    return await ofetch<T>(url, {
      ...options,
      timeout: this.timeout,
      method: options?.method || 'GET',
      headers: {
        Authorization: `Basic ${this.privateKey}:`,
      },
    });
  }

  private async sendStoreRequest<T>(apiPath: string, options: FetchOptions<'json'>): Promise<T> {
    const url = this.isSandbox ? `${this.sandboxUrl}/${apiPath}` : `${this.baseUrl}/${apiPath}`;

    // TODO: Test requests
    return await ofetch(url, {
      ...options,
      timeout: this.timeout,
      method: options.method || 'GET',
      headers: {
        Authorization: `Basic ${this.privateKey}:`,
      },
    });
  }

  public charges: IOpenPay.SDK.Charges = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/charges`, {
        method: 'POST',
        body: data,
      }),

    capture: async (txnId, data) =>
      await this.sendRequest(`${this.merchantId}/charges/${txnId}/capture`, {
        method: 'POST',
        body: data,
      }),

    get: async (txnId) => await this.sendRequest(`${this.merchantId}/charges/${txnId}`),

    list: async (query) => await this.sendRequest(`${this.merchantId}/charges`, { query }),

    refund: async (txnId, data) =>
      await this.sendRequest(`${this.merchantId}/charges/${txnId}/refund`, {
        method: 'POST',
        body: data,
      }),
  };

  public payouts: IOpenPay.SDK.Payouts = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/payouts`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/payouts`, { query }),

    get: async (txnId) => await this.sendRequest(`${this.merchantId}/payouts/${txnId}`),
  };

  public fees: IOpenPay.SDK.Fees = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/fees`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/fees`, { query }),
  };

  public customers: IOpenPay.SDK.Customers = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/customers`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/customers`, { query }),

    get: async (customerId) => await this.sendRequest(`${this.merchantId}/customers/${customerId}`),

    delete: async (customerId) =>
      await this.sendRequest(`${this.merchantId}/customers/${customerId}`, { method: 'DELETE' }),

    update: async (customerId, data) =>
      await this.sendRequest(`${this.merchantId}/customers/${customerId}`, {
        method: 'PUT',
        body: data,
      }),

    charges: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges`, {
          method: 'POST',
          body: data,
        }),

      capture: async (customerId, txnId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges/${txnId}/capture`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, txnId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges/${txnId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges`, { query }),

      refund: async (customerId, txnId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges/${txnId}/refund`, {
          method: 'POST',
          body: data,
        }),
    },

    transfers: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/transfers`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, txnId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/transfers/${txnId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/transfers`, { query }),
    },

    payouts: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/payouts`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, txnId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/payouts/${txnId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/payouts`, { query }),
    },

    subscriptions: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/subscriptions`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, subId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/subscriptions/${subId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/subscriptions`, { query }),

      update: async (customerId, subId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/subscriptions/${subId}`, {
          method: 'PUT',
          body: data,
        }),

      delete: async (customerId, subId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/subscriptions/${subId}`, {
          method: 'DELETE',
        }),
    },

    cards: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/cards`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, cardId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/cards/${cardId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/cards`, { query }),

      update: async (customerId, cardId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/cards/${cardId}`, {
          method: 'PUT',
          body: data,
        }),

      delete: async (customerId, cardId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/cards/${cardId}`, {
          method: 'DELETE',
        }),
    },

    bankaccounts: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/bankaccounts`, {
          method: 'POST',
          body: data,
        }),

      get: async (customerId, bankId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/bankaccounts/${bankId}`),

      list: async (customerId, query) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/bankaccounts`, { query }),

      delete: async (customerId, bankId) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/bankaccounts/${bankId}`, {
          method: 'DELETE',
        }),
    },

    pse: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/charges`, {
          method: 'POST',
          body: data,
        }),
    },

    checkouts: {
      create: async (customerId, data) =>
        await this.sendRequest(`${this.merchantId}/customers/${customerId}/checkouts`, {
          method: 'POST',
          body: data,
        }),
    },
  };

  public cards: IOpenPay.SDK.Cards = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/cards`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/cards`, { query }),

    get: async (cardId) => await this.sendRequest(`${this.merchantId}/cards/${cardId}`),

    delete: async (cardId) =>
      await this.sendRequest(`${this.merchantId}/cards/${cardId}`, { method: 'DELETE' }),

    update: async (cardId, data) =>
      await this.sendRequest(`${this.merchantId}/cards/${cardId}`, {
        method: 'PUT',
        body: data,
      }),
  };

  public plans: IOpenPay.SDK.Plans = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/plans`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/plans`, { query }),

    get: async (planId) => await this.sendRequest(`${this.merchantId}/plans/${planId}`),

    delete: async (planId) =>
      await this.sendRequest(`${this.merchantId}/plans/${planId}`, { method: 'DELETE' }),

    update: async (planId, data) =>
      await this.sendRequest(`${this.merchantId}/plans/${planId}`, {
        method: 'PUT',
        body: data,
      }),
  };

  public webhooks: IOpenPay.SDK.Webhooks = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/webhooks`, {
        method: 'POST',
        body: data,
      }),

    list: async () => await this.sendRequest(`${this.merchantId}/webhooks`),

    get: async (webhookId) => await this.sendRequest(`${this.merchantId}/webhooks/${webhookId}`),

    delete: async (webhookId) =>
      await this.sendRequest(`${this.merchantId}/webhooks/${webhookId}`, { method: 'DELETE' }),
  };

  public tokens: IOpenPay.SDK.Tokens = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/tokens`, {
        method: 'POST',
        body: data,
      }),

    get: async (tokenId) => await this.sendRequest(`${this.merchantId}/tokens/${tokenId}`),
  };

  public stores: IOpenPay.SDK.Stores = {
    list: async (query) => await this.sendStoreRequest('stores', { query }),
  };

  public pse: IOpenPay.SDK.Pse = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/charges`, {
        method: 'POST',
        body: data,
      }),
  };

  public checkouts: IOpenPay.SDK.Checkouts = {
    create: async (data) =>
      await this.sendRequest(`${this.merchantId}/checkouts`, {
        method: 'POST',
        body: data,
      }),

    list: async (query) => await this.sendRequest(`${this.merchantId}/checkouts`, { query }),

    get: async (checkoutId) => await this.sendRequest(`${this.merchantId}/checkouts/${checkoutId}`),

    update: async (checkoutId, status, data) =>
      await this.sendRequest(`${this.merchantId}/checkouts/${checkoutId}`, {
        method: 'PUT',
        body: data,
        query: { status },
      }),
  };
}

// TODO: Remove. Only used to test IDE intellisense
async function main() {
  const client = new OpenPay({ isProductionReady: false, merchantId: '', privateKey: '', countryCode: 'mx' });
}
