import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

function require(name: string): string {
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
    apiKey: require('GEMINI_API_KEY'),
    // VERIFY: confirm current model names at https://ai.google.dev before deploying
    modelPlanner: require('MODEL_PLANNER'),
    modelExecutor: require('MODEL_EXECUTOR'),
    modelVision: require('MODEL_VISION'),
  },

  google: {
    oauthClientId: require('GOOGLE_OAUTH_CLIENT_ID'),
    oauthClientSecret: require('GOOGLE_OAUTH_CLIENT_SECRET'),
    oauthRedirectUri: require('GOOGLE_OAUTH_REDIRECT_URI'),
    tokenEncryptionKey: require('TOKEN_ENCRYPTION_KEY'),
  },

  firebase: {
    projectId: require('FIREBASE_PROJECT_ID'),
    serviceAccountJson: require('FIREBASE_SERVICE_ACCOUNT_JSON'),
  },

  lemonSqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? '',
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? '',
    checkoutVariantId: process.env.LEMONSQUEEZY_CHECKOUT_VARIANT_ID ?? '',
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '',
  },
};
