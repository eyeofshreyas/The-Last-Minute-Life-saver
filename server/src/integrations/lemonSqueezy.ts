import { createHmac } from 'crypto';
import { config } from '../config';

// VERIFY: Lemon Squeezy API v1 shape — check https://docs.lemonsqueezy.com
export async function createCheckoutUrl(userId: string, userEmail: string): Promise<string> {
  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${config.lemonSqueezy.apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { userId },
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: config.lemonSqueezy.storeId } },
          variant: { data: { type: 'variants', id: config.lemonSqueezy.checkoutVariantId } },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Lemon Squeezy checkout failed: ${res.status}`);
  const json = (await res.json()) as { data: { attributes: { url: string } } };
  return json.data.attributes.url;
}

export function verifyWebhookSignature(body: Buffer, signature: string): boolean {
  const hmac = createHmac('sha256', config.lemonSqueezy.webhookSecret);
  hmac.update(body);
  const computed = hmac.digest('hex');
  return computed === signature;
}
