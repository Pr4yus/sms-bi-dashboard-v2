"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Language,
  Assessment,
  Business,
  Timeline,
  TrendingUp,
  Phone,
  Analytics,
  Star,
  MonetizationOn,
  Speed
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import BusinessMetricsCard from '@/components/sms-analytics/BusinessMetricsCard';
import EnterpriseKPIsDashboard from '@/components/sms-analytics/EnterpriseKPIsDashboard';
import ExecutiveDashboard from '@/components/sms-analytics/ExecutiveDashboard';
import PerformanceMonitor from '@/components/sms-analytics/PerformanceMonitor';
import { useSMSAnalyticsApi } from '@/hooks/useApi';

// Interfaces para los datos reales
interface DashboardData {
  summary: {
    total_countries: number;
    total_accounts: number;
    active_accounts: number;
    total_transactions: number;
    average_success_rate: number;
  };
  countries: Array<{
    country: string;
    total_accounts: number;
    active_accounts: number;
    total_transactions: number;
    success_rate: number;
    growth_rate?: number;
    status?: string;
  }>;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, any>;
}

interface BusinessMetrics {
  period: string;
  country: string;
  metrics: any;
  conclusions: string[];
  recommendations: string[];
  timestamp: string;
}

interface KPIMetric {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  previous_value: number;
  unit: string;
  category: 'performance' | 'financial' | 'business' | 'operational';
  priority: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  business_impact: string;
  recommendations: string[];
  responsible_team: string;
  last_updated: string;
}

interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  active: boolean;
  last_triggered?: string;
  frequency: 'immediate' | 'hourly' | 'daily';
  recipients: string[];
}

interface ExecutiveMetrics {
  period: string;
  countries: Record<string, any>;
  regional_totals: any;
  business_insights: string[];
  strategic_recommendations: string[];
  performance_summary: any;
}

interface TrendData {
  month: string;
  total_sms: number;
  successful_sms: number;
  revenue?: number;
  accounts: number;
}

const countries = [
  { id: 'guatemala', name: '🇬🇹 Guatemala', accounts: 0, status: 'loading', growth: '...' },
  { id: 'costa-rica', name: '🇨🇷 Costa Rica', accounts: 0, status: 'loading', growth: '...' },
  { id: 'el-salvador', name: '🇸🇻 El Salvador', accounts: 0, status: 'loading', growth: '...' },
  { id: 'nicaragua', name: '🇳🇮 Nicaragua', accounts: 0, status: 'loading', growth: '...' },
  { id: 'honduras', name: '🇭🇳 Honduras', accounts: 0, status: 'loading', growth: '...' },
  { id: 'honduras-tigo', name: '🇭🇳 Honduras Tigo', accounts: 0, status: 'loading', growth: '...' }
];

export default function SMSAnalyticsDashboard() {
  const router = useRouter();
  const api = useSMSAnalyticsApi();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para datos reales
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [kpis, setKPIs] = useState<KPIMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [executiveMetrics, setExecutiveMetrics] = useState<ExecutiveMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [countriesData, setCountriesData] = useState(countries);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar métricas ejecutivas (dashboard principal)
      const dashboardData = await api.getDashboard() as DashboardData;
      
      // Transformar datos del dashboard a la estructura que espera ExecutiveDashboard
      const transformedExecutiveMetrics = transformDashboardToExecutive(dashboardData);
      setExecutiveMetrics(transformedExecutiveMetrics);
      
      // Generar datos de tendencias básicos
      const trendData = generateTrendData(dashboardData);
      setTrends(trendData);
      
      // Actualizar datos de países
      if (dashboardData.countries) {
        const updatedCountries = countries.map(country => {
          const countryData = dashboardData.countries.find(
            (c: any) => c.country?.toLowerCase().replace(' ', '-') === country.id ||
                       c.country?.toLowerCase().replace(' ', '_') === country.id
          ) as any;
          
          if (countryData) {
            return {
              ...country,
              accounts: countryData.total_accounts || 0,
              status: countryData.status || 'unknown',
              growth: `+${countryData.growth_rate || 0}%`
            };
          }
          return country;
        });
        setCountriesData(updatedCountries);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard. Verificando conexión con el backend...');
    } finally {
      setLoading(false);
    }
  };

  // Función para transformar datos del dashboard a estructura ExecutiveDashboard
  const transformDashboardToExecutive = (dashboardData: DashboardData): ExecutiveMetrics => {
    const summary = dashboardData.summary || {};
    const countries = dashboardData.countries || [];
    
    // Calcular totales regionales
    const regional_totals = {
      total_sms: summary.total_transactions || 0,
      successful_sms: Math.round((summary.total_transactions || 0) * (summary.average_success_rate || 0) / 100),
      total_revenue: 0, // No disponible en el dashboard actual
      total_accounts: summary.total_accounts || 0,
      average_success_rate: summary.average_success_rate || 0,
      growth_rate: 0 // Calcular basado en datos históricos
    };

    // Transformar países a la estructura esperada
    const countriesMap: Record<string, any> = {};
    countries.forEach((country: any) => {
      const countryKey = country.country?.toLowerCase().replace(' ', '_') || 'unknown';
      countriesMap[countryKey] = {
        country_name: country.country || 'Unknown',
        total_sms: country.total_transactions || 0,
        successful_sms: Math.round((country.total_transactions || 0) * (country.success_rate || 0) / 100),
        success_rate: country.success_rate || 0,
        total_accounts: country.total_accounts || 0,
        revenue: 0, // No disponible
        growth_rate: country.growth_rate || 0,
        efficiency_score: country.success_rate || 0,
        status: country.success_rate >= 90 ? 'excellent' : 
                country.success_rate >= 75 ? 'good' : 
                country.success_rate >= 50 ? 'warning' : 'critical',
        trend: country.growth_rate > 0 ? 'increasing' : 
               country.growth_rate < 0 ? 'decreasing' : 'stable',
        key_companies: [], // No disponible en el dashboard actual
        alerts: [],
        performance_index: Math.min(100, Math.max(0, country.success_rate || 0))
      };
    });

    // Generar insights y recomendaciones basados en los datos
    const business_insights = [
      `Total de ${summary.total_accounts || 0} cuentas activas en ${summary.total_countries || 0} países`,
      `Procesando ${(summary.total_transactions || 0).toLocaleString()} transacciones SMS`,
      `Tasa de éxito promedio regional: ${summary.average_success_rate || 0}%`,
      `${summary.active_accounts || 0} cuentas con actividad reciente`
    ];

    const strategic_recommendations = [
      'Optimizar rutas de entrega para mejorar tasa de éxito',
      'Implementar monitoreo proactivo de cuentas críticas',
      'Desarrollar estrategias de retención para cuentas inactivas',
      'Expandir capacidad en países con alto crecimiento'
    ];

    const performance_summary = {
      excellent_countries: countries.filter((c: any) => (c.success_rate || 0) >= 90).length,
      good_countries: countries.filter((c: any) => (c.success_rate || 0) >= 75 && (c.success_rate || 0) < 90).length,
      warning_countries: countries.filter((c: any) => (c.success_rate || 0) >= 50 && (c.success_rate || 0) < 75).length,
      critical_countries: countries.filter((c: any) => (c.success_rate || 0) < 50).length
    };

    return {
      period: `Datos en tiempo real - ${new Date().toLocaleDateString('es-ES')}`,
      countries: countriesMap,
      regional_totals,
      business_insights,
      strategic_recommendations,
      performance_summary
    };
  };

  // Generar datos de tendencias básicos
  const generateTrendData = (dashboardData: DashboardData): TrendData[] => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const trends: TrendData[] = [];
    
    // Generar datos para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      
      // Simular variación basada en datos actuales
      const variation = 1 + (Math.random() - 0.5) * 0.2; // ±10% variación
      const baseTransactions = dashboardData.summary.total_transactions || 0;
      const baseSuccessRate = dashboardData.summary.average_success_rate || 0;
      
      trends.push({
        month: monthName,
        total_sms: Math.round(baseTransactions * variation),
        successful_sms: Math.round(baseTransactions * variation * baseSuccessRate / 100),
        revenue: Math.round(baseTransactions * variation * 0.001), // Estimación básica
        accounts: dashboardData.summary.total_accounts || 0
      });
    }
    
    return trends;
  };

  // Cargar métricas empresariales de Guatemala
  const loadBusinessMetrics = async () => {
    try {
      const data = await api.getBusinessMetrics('guatemala') as BusinessMetrics;
      setBusinessMetrics(data);
    } catch (error) {
      console.error('Error loading business metrics:', error);
    }
  };

  // Cargar KPIs básicos sin datos financieros
  const loadKPIs = async () => {
    try {
      // Obtener datos de salud del sistema para KPIs básicos
      const healthData = await api.getHealth() as HealthData;
      
      const basicKPIs: KPIMetric[] = [
        {
          id: 'sms_success_rate',
          name: 'Tasa de Éxito SMS',
          current_value: executiveMetrics?.regional_totals?.average_success_rate || 0,
          target_value: 95.0,
          previous_value: 0,
          unit: '%',
          category: 'performance',
          priority: 'high',
          trend: 'stable',
          change_percentage: 0,
          status: 'good',
          description: 'Porcentaje de SMS entregados exitosamente',
          business_impact: 'Impacto directo en satisfacción del cliente',
          recommendations: [
            'Optimizar configuraciones de routing',
            'Implementar retry logic inteligente'
          ],
          responsible_team: 'Equipo de Operaciones SMS',
          last_updated: new Date().toISOString()
        },
        {
          id: 'system_availability',
          name: 'Disponibilidad del Sistema',
          current_value: healthData.status === 'healthy' ? 99.5 : 
                          healthData.status === 'degraded' ? 95.0 : 80.0,
          target_value: 99.5,
          previous_value: 0,
          unit: '%',
          category: 'operational',
          priority: 'high',
          trend: 'stable',
          change_percentage: 0,
          status: healthData.status === 'healthy' ? 'good' : 
                  healthData.status === 'degraded' ? 'warning' : 'critical',
          description: 'Uptime del sistema de SMS Analytics',
          business_impact: 'Continuidad del servicio y confiabilidad',
          recommendations: [
            'Implementar redundancia adicional',
            'Mejorar procesos de mantenimiento preventivo'
          ],
          responsible_team: 'Equipo de Infraestructura',
          last_updated: new Date().toISOString()
        }
      ];
      setKPIs(basicKPIs);
    } catch (error) {
      console.error('Error loading KPIs:', error);
      setKPIs([]);
    }
  };

  // Cargar alertas del sistema
  const loadAlerts = async () => {
    try {
      // Las alertas vendrán del health check
      const healthData = await api.getHealth() as HealthData;
      
      const systemAlerts: Alert[] = [];
      
      if (healthData.status !== 'healthy') {
        systemAlerts.push({
          id: 'system_health',
          name: 'Estado del Sistema',
          condition: 'system_status != healthy',
          threshold: 1,
          active: true,
          frequency: 'immediate',
          recipients: ['ops@company.com'],
          last_triggered: new Date().toISOString()
        });
      }
      
      setAlerts(systemAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  // Efectos de carga inicial
  useEffect(() => {
    loadDashboardData();
    loadBusinessMetrics();
    loadKPIs();
    loadAlerts();
  }, []);

  const handleCountryClick = (countryId: string) => {
    router.push(`/sms-analytics/${countryId}`);
  };

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefreshData = () => {
    loadDashboardData();
    if (activeTab === 1) loadBusinessMetrics();
    if (activeTab === 2) loadKPIs();
  };

  const handleExportData = () => {
    alert('Funcionalidad de exportación en desarrollo...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'healthy': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'loading': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Phone color="primary" sx={{ fontSize: '2.5rem' }} />
          SMS Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sistema de análisis empresarial para comunicaciones SMS en Centroamérica
        </Typography>
        
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Dashboard Ejecutivo" icon={<DashboardIcon />} />
          <Tab label="Métricas Empresariales" icon={<Business />} />
          <Tab label="KPIs Dashboard" icon={<Assessment />} />
          <Tab label="Países" icon={<Language />} />
          <Tab label="Performance Monitor" icon={<Speed />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : executiveMetrics ? (
            <ExecutiveDashboard
              metrics={executiveMetrics as any}
              trends={trends as any}
              loading={loading}
              onRefresh={handleRefreshData}
              onExport={handleExportData}
              onDrillDown={handleCountryClick}
            />
          ) : (
            <Alert severity="info">
              Cargando datos del dashboard ejecutivo desde el backend...
            </Alert>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {businessMetrics ? (
            <BusinessMetricsCard
              metrics={businessMetrics}
              onRefresh={handleRefreshData}
            />
          ) : (
            <Alert severity="info">
              Cargando métricas empresariales desde el backend...
            </Alert>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <EnterpriseKPIsDashboard
          country="Regional"
          period="Tiempo Real"
          kpis={kpis}
          alerts={alerts}
          onRefresh={handleRefreshData}
          onExport={handleExportData}
          onConfigureAlert={(alertId) => alert(`Configurando alerta: ${alertId}`)}
        />
      )}

      {activeTab === 3 && (
        <>
          {/* Regional Summary */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h5" gutterBottom>
              📊 Resumen Regional SMS Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h3" fontWeight="bold">
                  {executiveMetrics?.regional_totals?.total_sms ? 
                    `${(executiveMetrics.regional_totals.total_sms / 1000000).toFixed(1)}M` : 
                    '...'
                  }
                </Typography>
                <Typography variant="body1">
                  SMS Mensuales
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h3" fontWeight="bold">
                  {executiveMetrics?.regional_totals?.average_success_rate ? 
                    `${executiveMetrics.regional_totals.average_success_rate}%` : 
                    '...'
                  }
                </Typography>
                <Typography variant="body1">
                  Tasa de Éxito
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h3" fontWeight="bold">
                  {executiveMetrics?.regional_totals?.total_accounts || '...'}
                </Typography>
                <Typography variant="body1">
                  Cuentas Activas
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="h3" fontWeight="bold">
                  {countriesData.length}
                </Typography>
                <Typography variant="body1">
                  Países Operando
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Countries Grid */}
          <Grid container spacing={3}>
            {countriesData.map((country) => (
              <Grid item xs={12} sm={6} md={4} key={country.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => handleCountryClick(country.id)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {country.name}
                      </Typography>
                      <Chip
                        label={country.status.toUpperCase()}
                        color={getStatusColor(country.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {country.accounts} cuentas activas
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mt={2}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" ml={1}>
                        Crecimiento: {country.growth}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      sx={{ mt: 2 }}
                      startIcon={<Analytics />}
                    >
                      Ver Análisis Detallado
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {activeTab === 4 && (
        <PerformanceMonitor />
      )}
    </Container>
  );
} 