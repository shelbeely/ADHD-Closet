/**
 * Application Configuration
 * 
 * Centralized configuration for deployment modes, feature flags,
 * and environment-specific settings.
 */

export type DeploymentMode = 'self_hosted' | 'hosted';

export const config = {
  // Deployment Mode
  deploymentMode: (process.env.DEPLOYMENT_MODE || 'self_hosted') as DeploymentMode,
  
  // Authentication
  auth: {
    enabled: process.env.DEPLOYMENT_MODE === 'hosted',
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || process.env.PUBLIC_BASE_URL,
  },
  
  // Analytics & Data Collection
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    anonymizeIp: process.env.ANONYMIZE_IP !== 'false',
  },
  
  // Subscription & Billing
  subscription: {
    enabled: process.env.SUBSCRIPTION_ENABLED === 'true',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  // Advertising
  ads: {
    enabled: process.env.AD_NETWORK_ENABLED === 'true',
    networkId: process.env.AD_NETWORK_ID,
    publisherId: process.env.AD_PUBLISHER_ID,
  },
  
  // Privacy Defaults
  privacy: {
    defaultAnalyticsOptIn: process.env.DEFAULT_ANALYTICS_OPT_IN === 'true',
    defaultDataSharing: process.env.DEFAULT_DATA_SHARING || 'opt_out',
    defaultAdConsent: process.env.DEFAULT_AD_CONSENT === 'true',
  },
  
  // Feature Flags
  features: {
    userRegistration: process.env.ENABLE_USER_REGISTRATION === 'true',
    dataExport: process.env.ENABLE_DATA_EXPORT !== 'false', // Default true for GDPR
    accountDeletion: process.env.ENABLE_ACCOUNT_DELETION !== 'false', // Default true for GDPR
  },
  
  // Helper methods
  isHosted: () => config.deploymentMode === 'hosted',
  isSelfHosted: () => config.deploymentMode === 'self_hosted',
  requiresAuth: () => config.isHosted() && config.auth.enabled,
} as const;

// Validation on startup
if (config.isHosted() && !config.auth.nextAuthSecret) {
  console.warn('⚠️  NEXTAUTH_SECRET is not set. Authentication will not work in hosted mode.');
}

if (config.subscription.enabled && !config.subscription.stripeSecretKey) {
  console.warn('⚠️  Subscription enabled but Stripe keys not configured.');
}

if (config.ads.enabled && !config.ads.networkId) {
  console.warn('⚠️  Ads enabled but ad network not configured.');
}

// Log deployment mode on startup
console.log(`🚀 Twin Style running in ${config.deploymentMode.toUpperCase()} mode`);
if (config.isHosted()) {
  console.log(`   - Authentication: ${config.auth.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - Analytics: ${config.analytics.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - Subscriptions: ${config.subscription.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - Ads: ${config.ads.enabled ? 'ENABLED' : 'DISABLED'}`);
}
