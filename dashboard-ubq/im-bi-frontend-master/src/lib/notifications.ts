export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface SubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  priority: 'low' | 'normal' | 'high';
  frequency: 'immediate' | 'hourly' | 'daily';
  lastTriggered?: number;
  recipients: string[];
}

class NotificationManager {
  private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // This would come from environment
  private subscription: PushSubscription | null = null;
  private alertRules: AlertRule[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeNotifications();
  }

  // Initialize notification system
  async initializeNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      this.subscription = await registration.pushManager.getSubscription();
      
      if (!this.subscription) {
        console.log('No existing push subscription found');
      } else {
        console.log('Existing push subscription found');
        await this.syncSubscriptionWithServer();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request permission and subscribe to push notifications
  async subscribeToNotifications(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeNotifications();
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey).buffer
      });

      await this.syncSubscriptionWithServer();
      
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromNotifications(): Promise<boolean> {
    if (!this.subscription) return true;

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer();
      this.subscription = null;
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  }

  // Check notification permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Check if subscribed to push notifications
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Show local notification (fallback for browsers that don't support push)
  async showLocalNotification(config: NotificationConfig): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    try {
      const options: NotificationOptions = {
        body: config.body,
        icon: config.icon || '/icons/icon-192x192.png',
        badge: config.badge || '/icons/icon-72x72.png',
        tag: config.tag,
        requireInteraction: config.requireInteraction || false,
        silent: config.silent || false,
        data: config.data
      };

      // Add image if supported
      if (config.image && 'image' in Notification.prototype) {
        (options as any).image = config.image;
      }

      const notification = new Notification(config.title, options);

      // Handle click events
      notification.onclick = () => {
        window.focus();
        if (config.data?.url) {
          window.location.href = config.data.url;
        }
        notification.close();
      };

      // Auto-close after 10 seconds for non-critical notifications
      if (config.priority !== 'high') {
        setTimeout(() => notification.close(), 10000);
      }
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }

  // Send push notification via server
  async sendPushNotification(config: NotificationConfig, targetUsers?: string[]): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification: config,
          targetUsers
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // Configure alert rules
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
    this.saveAlertRules();
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.alertRules[index] = { ...this.alertRules[index], ...updates };
      this.saveAlertRules();
    }
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId);
    this.saveAlertRules();
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  // Check alert conditions and trigger notifications
  async checkAlerts(data: any): Promise<void> {
    const currentTime = Date.now();

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check frequency constraints
      if (rule.lastTriggered && rule.frequency !== 'immediate') {
        const timeSinceLastTrigger = currentTime - rule.lastTriggered;
        const minInterval = this.getFrequencyInterval(rule.frequency);
        
        if (timeSinceLastTrigger < minInterval) {
          continue;
        }
      }

      // Evaluate condition
      if (this.evaluateCondition(rule, data)) {
        await this.triggerAlert(rule, data);
        rule.lastTriggered = currentTime;
        this.saveAlertRules();
      }
    }
  }

  // Predefined alert templates for SMS Analytics
  createSMSVolumeAlert(threshold: number): AlertRule {
    return {
      id: `sms-volume-${Date.now()}`,
      name: 'Alto Volumen SMS',
      condition: 'sms_per_hour > threshold',
      threshold,
      enabled: true,
      priority: 'high',
      frequency: 'immediate',
      recipients: ['operations@company.com']
    };
  }

  createSuccessRateAlert(threshold: number): AlertRule {
    return {
      id: `success-rate-${Date.now()}`,
      name: 'Baja Tasa de Éxito',
      condition: 'success_rate < threshold',
      threshold,
      enabled: true,
      priority: 'high',
      frequency: 'hourly',
      recipients: ['technical@company.com']
    };
  }

  createRevenueAlert(threshold: number): AlertRule {
    return {
      id: `revenue-${Date.now()}`,
      name: 'Meta de Ingresos',
      condition: 'monthly_revenue < threshold',
      threshold,
      enabled: true,
      priority: 'normal',
      frequency: 'daily',
      recipients: ['sales@company.com', 'finance@company.com']
    };
  }

  createAccountCriticalAlert(): AlertRule {
    return {
      id: `account-critical-${Date.now()}`,
      name: 'Cuentas en Estado Crítico',
      condition: 'critical_accounts > 0',
      threshold: 0,
      enabled: true,
      priority: 'high',
      frequency: 'immediate',
      recipients: ['support@company.com']
    };
  }

  // Private helper methods
  private async syncSubscriptionWithServer(): Promise<void> {
    if (!this.subscription) return;

    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.subscription.toJSON(),
          userId: this.getCurrentUserId()
        })
      });
    } catch (error) {
      console.error('Failed to sync subscription with server:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.getCurrentUserId()
        })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getCurrentUserId(): string {
    // This would typically come from your authentication system
    return localStorage.getItem('userId') || 'anonymous';
  }

  private saveAlertRules(): void {
    localStorage.setItem('sms-analytics-alerts', JSON.stringify(this.alertRules));
  }

  private loadAlertRules(): void {
    const saved = localStorage.getItem('sms-analytics-alerts');
    if (saved) {
      this.alertRules = JSON.parse(saved);
    }
  }

  private getFrequencyInterval(frequency: string): number {
    switch (frequency) {
      case 'hourly': return 60 * 60 * 1000; // 1 hour
      case 'daily': return 24 * 60 * 60 * 1000; // 24 hours
      default: return 0; // immediate
    }
  }

  private evaluateCondition(rule: AlertRule, data: any): boolean {
    try {
      // Simple condition evaluation (in production, use a proper expression parser)
      switch (rule.condition) {
        case 'sms_per_hour > threshold':
          return data.sms_per_hour > rule.threshold;
        case 'success_rate < threshold':
          return data.success_rate < rule.threshold;
        case 'monthly_revenue < threshold':
          return data.monthly_revenue < rule.threshold;
        case 'critical_accounts > 0':
          return data.critical_accounts > 0;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  private async triggerAlert(rule: AlertRule, data: any): Promise<void> {
    const notification: NotificationConfig = {
      title: `🚨 ${rule.name}`,
      body: this.generateAlertMessage(rule, data),
      tag: rule.id,
      priority: rule.priority,
      requireInteraction: rule.priority === 'high',
      actions: [
        { action: 'view', title: 'Ver Dashboard' },
        { action: 'dismiss', title: 'Descartar' }
      ],
      data: {
        url: '/sms-analytics',
        ruleId: rule.id,
        timestamp: Date.now()
      }
    };

    // Try push notification first, fallback to local
    const pushSent = await this.sendPushNotification(notification, rule.recipients);
    
    if (!pushSent) {
      await this.showLocalNotification(notification);
    }
  }

  private generateAlertMessage(rule: AlertRule, data: any): string {
    switch (rule.condition) {
      case 'sms_per_hour > threshold':
        return `Volumen SMS alto: ${data.sms_per_hour} SMS/hora (límite: ${rule.threshold})`;
      case 'success_rate < threshold':
        return `Tasa de éxito baja: ${data.success_rate}% (mínimo: ${rule.threshold}%)`;
      case 'monthly_revenue < threshold':
        return `Ingresos bajo meta: Q${data.monthly_revenue} (objetivo: Q${rule.threshold})`;
      case 'critical_accounts > 0':
        return `${data.critical_accounts} cuenta(s) en estado crítico requieren atención`;
      default:
        return 'Alerta activada en SMS Analytics';
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Initialize alert rules on startup
if (typeof window !== 'undefined') {
  notificationManager['loadAlertRules']();
}

// Utility functions for React components
export const useNotifications = () => {
  const subscribe = () => notificationManager.subscribeToNotifications();
  const unsubscribe = () => notificationManager.unsubscribeFromNotifications();
  const getPermission = () => notificationManager.getPermissionStatus();
  const isSubscribed = () => notificationManager.isSubscribed();
  const showNotification = (config: NotificationConfig) => 
    notificationManager.showLocalNotification(config);

  return {
    subscribe,
    unsubscribe,
    getPermission,
    isSubscribed,
    showNotification,
    manager: notificationManager
  };
};

// Analytics-specific notification helpers
export const showSMSAlert = async (type: 'volume' | 'success_rate' | 'revenue' | 'critical', data: any) => {
  const notifications = {
    volume: {
      title: '🚨 Alto Volumen SMS',
      body: `Volumen actual: ${data.volume} SMS/hora`,
      priority: 'high' as const
    },
    success_rate: {
      title: '⚠️ Baja Tasa de Éxito',
      body: `Tasa actual: ${data.rate}% (objetivo: ${data.target}%)`,
      priority: 'high' as const
    },
    revenue: {
      title: '💰 Meta de Ingresos',
      body: `Ingresos: Q${data.current} (objetivo: Q${data.target})`,
      priority: 'normal' as const
    },
    critical: {
      title: '🔴 Cuentas Críticas',
      body: `${data.count} cuenta(s) requieren atención inmediata`,
      priority: 'high' as const
    }
  };

  const config = notifications[type];
  if (config) {
    await notificationManager.showLocalNotification({
      ...config,
      icon: '/icons/icon-192x192.png',
      data: { url: '/sms-analytics' }
    });
  }
}; 