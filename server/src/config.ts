import dotenv from 'dotenv';
import path from 'path';
// __dirname = server/src/, so ../../.env = project root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  demoMode: process.env.DEMO_MODE === 'true',

  gemini: {
    apiKey: requireEnv('GEMINI_API_KEY'),
    // VERIFY: confirm current model names at https://ai.google.dev before deploying
    modelPlanner: requireEnv('MODEL_PLANNER'),
    modelExecutor: requireEnv('MODEL_EXECUTOR'),
    modelVision: requireEnv('MODEL_VISION'),
  },

  google: {
    oauthClientId: requireEnv('GOOGLE_OAUTH_CLIENT_ID'),
    oauthClientSecret: requireEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
    oauthRedirectUri: requireEnv('GOOGLE_OAUTH_REDIRECT_URI'),
    tokenEncryptionKey: requireEnv('TOKEN_ENCRYPTION_KEY'),
  },

  firebase: {
    projectId: requireEnv('FIREBASE_PROJECT_ID'),
    serviceAccountJson: requireEnv('FIREBASE_SERVICE_ACCOUNT_JSON'),
  },

  lemonSqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? '',
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? '',
    checkoutVariantId: process.env.LEMONSQUEEZY_CHECKOUT_VARIANT_ID ?? '',
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '',
  },
};
