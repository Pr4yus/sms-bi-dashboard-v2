import { useState, useEffect, useCallback } from 'react';

// Simplified notification types for the hook
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
  data?: any;
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

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if already subscribed to push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Mock VAPID key for development
      const vapidPublicKey = 'BJ_mock_key_for_development_purposes_only';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setIsSubscribed(true);
      
      // Here you would normally send the subscription to your server
      console.log('Push subscription:', subscription);
      
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }, [isSupported, permission]);

  const showNotification = useCallback(async (config: NotificationConfig): Promise<void> => {
    if (permission !== 'granted') {
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
      console.error('Failed to show notification:', error);
    }
  }, [permission]);

  const showSMSAlert = useCallback((type: 'volume' | 'success_rate' | 'revenue' | 'critical', data: any) => {
    const notifications = {
      volume: {
        title: '📊 SMS Volume Alert',
        body: `Volumen inusual detectado: ${data.volume} SMS en la última hora`,
        priority: 'normal' as const,
        icon: '/icons/icon-192x192.png',
        data: { url: '/sms-analytics?tab=2' }
      },
      success_rate: {
        title: '⚠️ Success Rate Alert',
        body: `Tasa de éxito cayó a ${data.rate}% (objetivo: 95%)`,
        priority: 'high' as const,
        icon: '/icons/icon-192x192.png',
        requireInteraction: true,
        data: { url: '/sms-analytics?tab=2' }
      },
      revenue: {
        title: '💰 Revenue Alert',
        body: `Ingresos mensuales: Q${data.amount} (${data.percentage}% del objetivo)`,
        priority: 'normal' as const,
        icon: '/icons/icon-192x192.png',
        data: { url: '/sms-analytics?tab=0' }
      },
      critical: {
        title: '🚨 Critical System Alert',
        body: `${data.message} - Requiere atención inmediata`,
        priority: 'high' as const,
        icon: '/icons/icon-192x192.png',
        requireInteraction: true,
        data: { url: '/sms-analytics?tab=4' }
      }
    };

    const config = notifications[type];
    if (config) {
      showNotification(config);
    }
  }, [showNotification]);

  const getPermission = useCallback(() => permission, [permission]);

  const isSubscribedToNotifications = useCallback(() => isSubscribed, [isSubscribed]);

  return {
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    subscribeToPush,
    showNotification,
    showSMSAlert,
    getPermission,
    isSubscribedToNotifications
  };
};

export default useNotifications; 