import { DevtoolsProvider } from "@providers/devtools";
import { GitHubBanner, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { notificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { Metadata } from "next";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { Box, CircularProgress } from '@mui/material'

import { AppIcon } from "@components/app-icon";
import { ColorModeContextProvider } from "@contexts/color-mode";
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] })

// Dynamic imports for client components
const DynamicRefineKbar = dynamic(() => import('@refinedev/kbar').then(mod => mod.RefineKbar), {
  ssr: false,
  loading: () => <CircularProgress />
});

const DynamicDevtoolsPanel = dynamic(() => import('@refinedev/devtools').then(mod => mod.DevtoolsPanel), {
  ssr: false,
  loading: () => null
});

export const metadata: Metadata = {
    title: 'SMS Analytics Dashboard',
    description: 'Sistema de análisis empresarial para comunicaciones SMS en Centroamérica',
    manifest: '/manifest.json',
    themeColor: '#1976d2',
    viewport: 'width=device-width, initial-scale=1',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'SMS Analytics'
    },
    icons: {
        icon: '/icons/icon-192x192.png',
        apple: '/icons/icon-192x192.png',
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = cookies();
    const theme = cookieStore.get("theme");
    const defaultMode = theme?.value === "dark" ? "dark" : "light";

    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#1976d2" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="SMS Analytics" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
            </head>
            <body className={inter.className}>
                <Box sx={{ display: 'flex' }}>
                    <Box component="nav">
                        <Sidebar />
                    </Box>
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Suspense fallback={<CircularProgress />}>
                            <RefineKbarProvider>
                                <ColorModeContextProvider defaultMode={defaultMode}>
                                    <RefineSnackbarProvider>
                                        <DevtoolsProvider>
                                            <Refine
                                                routerProvider={routerProvider}
                                                notificationProvider={notificationProvider}
                                                resources={[
                                                    {
                                                        name: "guatemala",
                                                        list: "/traffic/guatemala/yearly",
                                                        meta: {
                                                            label: "Guatemala",
                                                        },
                                                    },
                                                    {
                                                        name: "guatemala-yearly",
                                                        list: "/traffic/guatemala/yearly",
                                                        parentName: "guatemala",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "guatemala-monthly",
                                                        list: "/traffic/guatemala/monthly",
                                                        parentName: "guatemala",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "guatemala-daily",
                                                        list: "/traffic/guatemala/daily",
                                                        parentName: "guatemala",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "Costa Rica",
                                                        list: "/traffic/cr",
                                                        meta: {
                                                            label: "Costa Rica",
                                                        },
                                                    },
                                                    {
                                                        name: "Costa Rica-yearly",
                                                        list: "/traffic/cr/yearly",
                                                        parentName: "Costa Rica",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "Costa Rica-monthly",
                                                        list: "/traffic/cr/monthly",
                                                        parentName: "Costa Rica",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "Costa Rica-daily",
                                                        list: "/traffic/cr/daily",
                                                        parentName: "Costa Rica",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "Honduras",
                                                        list: "/traffic/honduras",
                                                        meta: {
                                                            label: "Honduras",
                                                        },
                                                    },
                                                    {
                                                        name: "Honduras-yearly",
                                                        list: "/traffic/honduras/yearly",
                                                        parentName: "Honduras",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "Honduras-monthly",
                                                        list: "/traffic/honduras/monthly",
                                                        parentName: "Honduras",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "Honduras-daily",
                                                        list: "/traffic/honduras/daily",
                                                        parentName: "Honduras",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "Nicaragua",
                                                        list: "/traffic/nicaragua",
                                                        meta: {
                                                            label: "Nicaragua",
                                                        },
                                                    },
                                                    {
                                                        name: "Nicaragua-yearly",
                                                        list: "/traffic/nicaragua/yearly",
                                                        parentName: "Nicaragua",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "Nicaragua-monthly",
                                                        list: "/traffic/nicaragua/monthly",
                                                        parentName: "Nicaragua",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "Nicaragua-daily",
                                                        list: "/traffic/nicaragua/daily",
                                                        parentName: "Nicaragua",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "El Salvador",
                                                        list: "/traffic/sv",
                                                        meta: {
                                                            label: "El Salvador",
                                                        },
                                                    },
                                                    {
                                                        name: "El Salvador-yearly",
                                                        list: "/traffic/sv/yearly",
                                                        parentName: "El Salvador",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "El Salvador-monthly",
                                                        list: "/traffic/sv/monthly",
                                                        parentName: "El Salvador",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "El Salvador-daily",
                                                        list: "/traffic/sv/daily",
                                                        parentName: "El Salvador",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "Tigo HN",
                                                        list: "/traffic/tigohn",
                                                        meta: {
                                                            label: "Tigo HN",
                                                        },
                                                    },
                                                    {
                                                        name: "Tigo HN-yearly",
                                                        list: "/traffic/tigohn/yearly",
                                                        parentName: "Tigo HN",
                                                        meta: {
                                                            label: "Yearly",
                                                        },
                                                    },
                                                    {
                                                        name: "Tigo HN-monthly",
                                                        list: "/traffic/tigohn/monthly",
                                                        parentName: "Tigo HN",
                                                        meta: {
                                                            label: "Monthly",
                                                        },
                                                    },
                                                    {
                                                        name: "Tigo HN-daily",
                                                        list: "/traffic/tigohn/daily",
                                                        parentName: "Tigo HN",
                                                        meta: {
                                                            label: "Daily",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-analytics",
                                                        list: "/sms-analytics",
                                                        meta: {
                                                            label: "SMS Analytics",
                                                            icon: "📱"
                                                        },
                                                    },
                                                    {
                                                        name: "sms-dashboard",
                                                        list: "/sms-analytics",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "Dashboard",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-guatemala",
                                                        list: "/sms-analytics/guatemala",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇬🇹 Guatemala",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-costa-rica",
                                                        list: "/sms-analytics/costa-rica",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇨🇷 Costa Rica",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-el-salvador",
                                                        list: "/sms-analytics/el-salvador",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇸🇻 El Salvador",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-nicaragua",
                                                        list: "/sms-analytics/nicaragua",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇳🇮 Nicaragua",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-honduras",
                                                        list: "/sms-analytics/honduras",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇭🇳 Honduras",
                                                        },
                                                    },
                                                    {
                                                        name: "sms-honduras-tigo",
                                                        list: "/sms-analytics/honduras-tigo",
                                                        parentName: "sms-analytics",
                                                        meta: {
                                                            label: "🇭🇳 Honduras Tigo",
                                                        },
                                                    },
                                                ]}
                                                options={{
                                                    syncWithLocation: true,
                                                    warnWhenUnsavedChanges: true,
                                                    useNewQueryKeys: true,
                                                    projectId: "HCc2wL-jg9sHC-sL11n2",
                                                    title: { text: "Data Tools", icon: <AppIcon /> },
                                                }}
                                            >
                                                <Suspense fallback={<CircularProgress />}>
                                                    {children}
                                                </Suspense>
                                                <DynamicRefineKbar />
                                                {process.env.NODE_ENV === 'development' && <DynamicDevtoolsPanel />}
                                            </Refine>
                                        </DevtoolsProvider>
                                    </RefineSnackbarProvider>
                                </ColorModeContextProvider>
                            </RefineKbarProvider>
                        </Suspense>
                    </Box>
                </Box>
                
                {/* Service Worker Registration Script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js')
                                        .then(function(registration) {
                                            console.log('✅ SW registered: ', registration);
                                            
                                            // Listen for updates
                                            registration.addEventListener('updatefound', () => {
                                                const newWorker = registration.installing;
                                                if (newWorker) {
                                                    newWorker.addEventListener('statechange', () => {
                                                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                                            // New version available
                                                            if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                                                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                                                window.location.reload();
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        })
                                        .catch(function(registrationError) {
                                            console.log('❌ SW registration failed: ', registrationError);
                                        });
                                });
                                
                                // Listen for SW messages
                                navigator.serviceWorker.addEventListener('message', event => {
                                    if (event.data && event.data.type === 'SW_UPDATED') {
                                        console.log('🔄 Service Worker updated');
                                    }
                                });
                                
                                // Handle SW controller change
                                navigator.serviceWorker.addEventListener('controllerchange', () => {
                                    console.log('🔄 Service Worker controller changed');
                                    window.location.reload();
                                });
                            } else {
                                console.log('❌ Service Worker not supported');
                            }
                        `,
                    }}
                />
                
                {/* Performance Observer Script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            // Performance monitoring for Step 6
                            if ('PerformanceObserver' in window) {
                                try {
                                    const observer = new PerformanceObserver((list) => {
                                        for (const entry of list.getEntries()) {
                                            if (entry.entryType === 'navigation') {
                                                console.log('📊 Page Load Time:', entry.loadEventEnd - entry.fetchStart, 'ms');
                                            }
                                            if (entry.entryType === 'measure') {
                                                console.log('📊 Custom Measure:', entry.name, entry.duration, 'ms');
                                            }
                                        }
                                    });
                                    
                                    observer.observe({ entryTypes: ['navigation', 'measure'] });
                                } catch (e) {
                                    console.log('Performance Observer not fully supported');
                                }
                            }
                            
                            // Cache warming on load
                            window.addEventListener('load', () => {
                                setTimeout(() => {
                                    if (window.cacheManager) {
                                        window.cacheManager.warmUpCache();
                                    }
                                }, 2000);
                            });
                        `,
                    }}
                />
            </body>
        </html>
    );
}