import { describe, expect, it } from 'vitest';
import { OpenPay } from '../dist/openpay';

describe('Get all transfers with creation filter', () => {
  const openpay = new OpenPay({
    merchantId: process.env.OPENPAY_MERCHANT_ID ?? '',
    privateKey: process.env.OPENPAY_PRIVATE_KEY ?? '',
    isProductionReady: false,
    countryCode: 'mx',
  });
  openpay.setTimeout(3000);

  it('should return statusCode 200', async () => {
    const customer = await openpay.customers.create({
      name: 'Juan',
      email: 'juan@example.com',
    });
    expect(customer).toBeTruthy();

    const transfers = await openpay.customers.transfers.list(customer.id, {
      'creation[lte]': '2024-01-01',
      limit: 10,
    });
    expect(transfers).toBeTruthy();

    await openpay.customers.delete(customer.id);

    console.log({ transfers, type: typeof transfers });
  });
});
