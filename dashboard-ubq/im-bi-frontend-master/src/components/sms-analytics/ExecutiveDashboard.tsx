import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Business,
  AccountBalance,
  MonetizationOn,
  Speed,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Timeline,
  Refresh,
  Download,
  Star,
  Phone,
  Language,
  Dashboard as DashboardIcon,
  Analytics,
  Insights,
  BarChart
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart
} from 'recharts';

interface ExecutiveMetrics {
  period: string;
  countries: {
    guatemala: ExecutiveCountryMetrics;
    costa_rica: ExecutiveCountryMetrics;
    el_salvador: ExecutiveCountryMetrics;
    nicaragua: ExecutiveCountryMetrics;
    honduras: ExecutiveCountryMetrics;
    honduras_tigo: ExecutiveCountryMetrics;
  };
  regional_totals: {
    total_sms: number;
    successful_sms: number;
    total_revenue: number;
    total_accounts: number;
    average_success_rate: number;
    growth_rate: number;
  };
  business_insights: string[];
  strategic_recommendations: string[];
  performance_summary: {
    excellent_countries: number;
    good_countries: number;
    warning_countries: number;
    critical_countries: number;
  };
}

interface ExecutiveCountryMetrics {
  country_name: string;
  total_sms: number;
  successful_sms: number;
  success_rate: number;
  total_accounts: number;
  revenue: number;
  growth_rate: number;
  efficiency_score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  key_companies: CompanyMetric[];
  alerts: string[];
  performance_index: number;
}

interface CompanyMetric {
  name: string;
  sms_volume: number;
  success_rate: number;
  revenue_contribution: number;
}

interface TrendData {
  month: string;
  total_sms: number;
  successful_sms: number;
  revenue: number;
  accounts: number;
}

interface ExecutiveDashboardProps {
  metrics: ExecutiveMetrics;
  trends: TrendData[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onDrillDown?: (country: string) => void;
}

const COUNTRY_COLORS = {
  guatemala: '#1976d2',
  costa_rica: '#2e7d32',
  el_salvador: '#d32f2f',
  nicaragua: '#ed6c02',
  honduras: '#9c27b0',
  honduras_tigo: '#00695c'
};

const STATUS_COLORS = {
  excellent: '#4caf50',
  good: '#2196f3',
  warning: '#ff9800',
  critical: '#f44336'
};

const formatNumber = (num: number, type: 'sms' | 'revenue' | 'percentage' | 'number' = 'number'): string => {
  switch (type) {
    case 'sms':
      return new Intl.NumberFormat('es-GT').format(num);
    case 'revenue':
      return `Q${new Intl.NumberFormat('es-GT').format(num)}`;
    case 'percentage':
      return `${num.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('es-GT').format(num);
  }
};

const getCountryDisplayName = (country: string): string => {
  const names: Record<string, string> = {
    guatemala: '🇬🇹 Guatemala',
    costa_rica: '🇨🇷 Costa Rica',
    el_salvador: '🇸🇻 El Salvador',
    nicaragua: '🇳🇮 Nicaragua',
    honduras: '🇭🇳 Honduras',
    honduras_tigo: '🇭🇳 Honduras Tigo'
  };
  return names[country] || country;
};

const getStatusChip = (status: string) => {
  const configs = {
    excellent: { color: 'success', label: 'Excelente' },
    good: { color: 'info', label: 'Bueno' },
    warning: { color: 'warning', label: 'Atención' },
    critical: { color: 'error', label: 'Crítico' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.good;
  return <Chip label={config.label} color={config.color as any} size="small" />;
};

const getTrendIcon = (trend: string, growthRate: number) => {
  if (trend === 'increasing') {
    return <TrendingUp color="success" fontSize="small" />;
  } else if (trend === 'decreasing') {
    return <TrendingDown color="error" fontSize="small" />;
  }
  return <CheckCircle color="info" fontSize="small" />;
};

const CountryCard: React.FC<{ 
  country: string; 
  metrics: ExecutiveCountryMetrics; 
  onDrillDown?: (country: string) => void;
}> = ({ country, metrics, onDrillDown }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onDrillDown ? 'pointer' : 'default',
        '&:hover': onDrillDown ? { boxShadow: 3 } : {}
      }}
      onClick={() => onDrillDown?.(country)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: COUNTRY_COLORS[country as keyof typeof COUNTRY_COLORS], 
                mr: 1,
                width: 32,
                height: 32
              }}
            >
              <Language />
            </Avatar>
            <Box>
              <Typography variant="h6" fontSize="0.9rem" fontWeight="bold">
                {getCountryDisplayName(country)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {metrics.total_accounts} cuentas activas
              </Typography>
            </Box>
          </Box>
          
          {getStatusChip(metrics.status)}
        </Box>
        
        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              SMS Mensuales
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatNumber(metrics.total_sms, 'sms')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Tasa de Éxito
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {formatNumber(metrics.success_rate, 'percentage')}
              </Typography>
              {getTrendIcon(metrics.trend, metrics.growth_rate)}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Ingresos
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {formatNumber(metrics.revenue, 'revenue')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Crecimiento
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight="bold"
              color={metrics.growth_rate >= 0 ? 'success.main' : 'error.main'}
            >
              {metrics.growth_rate >= 0 ? '+' : ''}{formatNumber(metrics.growth_rate, 'percentage')}
            </Typography>
          </Grid>
        </Grid>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Índice de Performance: {metrics.performance_index}/100
          </Typography>
          <LinearProgress
            variant="determinate"
            value={metrics.performance_index}
            color={metrics.performance_index > 80 ? 'success' : metrics.performance_index > 60 ? 'warning' : 'error'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        {metrics.key_companies.length > 0 && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Principales Clientes:
            </Typography>
            {metrics.key_companies.slice(0, 2).map((company, index) => (
              <Typography key={index} variant="caption" display="block">
                • {company.name}: {formatNumber(company.sms_volume, 'sms')} SMS
              </Typography>
            ))}
          </Box>
        )}
        
        {metrics.alerts.length > 0 && (
          <Alert severity="warning">
            <Typography variant="caption">
              {metrics.alerts.length} alerta{metrics.alerts.length > 1 ? 's' : ''} pendiente{metrics.alerts.length > 1 ? 's' : ''}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const RegionalSummary: React.FC<{ metrics: ExecutiveMetrics }> = ({ metrics }) => {
  // Safe destructuring with default values
  const totals = metrics.regional_totals || {
    total_sms: 0,
    successful_sms: 0,
    total_revenue: 0,
    total_accounts: 0,
    average_success_rate: 0,
    growth_rate: 0
  };
  
  const performance_summary = metrics.performance_summary || {
    excellent_countries: 0,
    good_countries: 0,
    warning_countries: 0,
    critical_countries: 0
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DashboardIcon />
        Resumen Regional SMS Analytics
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, opacity: 0.9 }}>
        Período: {metrics.period || 'No disponible'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={6} sm={3}>
          <Typography variant="h3" fontWeight="bold">
            {formatNumber(totals.total_sms, 'sms')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            SMS Totales
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {formatNumber(totals.average_success_rate, 'percentage')} éxito promedio
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Typography variant="h3" fontWeight="bold">
            {formatNumber(totals.total_revenue, 'revenue')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Ingresos Totales
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {formatNumber(totals.growth_rate, 'percentage')} crecimiento
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Typography variant="h3" fontWeight="bold">
            {totals.total_accounts}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Cuentas Activas
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            En 6 países
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Typography variant="h3" fontWeight="bold">
            {performance_summary.excellent_countries}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Países Excelentes
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {performance_summary.warning_countries + performance_summary.critical_countries} requieren atención
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  metrics,
  trends,
  loading = false,
  error,
  onRefresh,
  onExport,
  onDrillDown
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const chartData = useMemo(() => {
    if (!metrics?.countries) return [];
    
    return Object.entries(metrics.countries).map(([key, country]) => ({
      name: getCountryDisplayName(key),
      sms: country?.total_sms || 0,
      revenue: country?.revenue || 0,
      success_rate: country?.success_rate || 0,
      performance: country?.performance_index || 0,
      color: COUNTRY_COLORS[key as keyof typeof COUNTRY_COLORS]
    }));
  }, [metrics?.countries]);

  const trendChartData = useMemo(() => {
    if (!trends || !Array.isArray(trends)) return [];
    
    return trends.map(trend => ({
      ...trend,
      success_rate: trend.total_sms > 0 ? (trend.successful_sms / trend.total_sms) * 100 : 0
    }));
  }, [trends]);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando Dashboard Ejecutivo...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          onRefresh && (
            <Button color="inherit" size="small" onClick={onRefresh}>
              Reintentar
            </Button>
          )
        }
      >
        <Typography variant="h6">Error al cargar Dashboard Ejecutivo</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  // Check if we have valid metrics data
  if (!metrics) {
    return (
      <Alert severity="warning">
        <Typography variant="h6">No hay datos disponibles</Typography>
        <Typography variant="body2">No se pudieron cargar las métricas ejecutivas.</Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Executive Dashboard SMS Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Vista consolidada regional - Última actualización: {new Date().toLocaleString('es-ES')}
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          {onRefresh && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
            >
              Actualizar
            </Button>
          )}
          {onExport && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={onExport}
            >
              Exportar Ejecutivo
            </Button>
          )}
        </Box>
      </Box>

      {/* Regional Summary */}
      <RegionalSummary metrics={metrics} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Vista por Países" icon={<Language />} />
          <Tab label="Tendencias Regionales" icon={<Timeline />} />
          <Tab label="Análisis Estratégico" icon={<Analytics />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {metrics.countries && Object.entries(metrics.countries).map(([country, countryMetrics]) => (
            <Grid item xs={12} sm={6} md={4} key={country}>
              <CountryCard
                country={country}
                metrics={countryMetrics}
                onDrillDown={onDrillDown}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tendencia de SMS Mensual
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_sms" 
                      stroke="#1976d2" 
                      strokeWidth={3}
                      name="SMS Totales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="successful_sms" 
                      stroke="#4caf50" 
                      strokeWidth={3}
                      name="SMS Exitosos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ingresos y Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2e7d32" name="Ingresos" />
                    <Line 
                      type="monotone" 
                      dataKey="success_rate" 
                      stroke="#ff9800" 
                      strokeWidth={3}
                      name="Tasa de Éxito %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comparativo por País
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="sms" fill="#1976d2" name="SMS Mensuales" />
                    <Bar dataKey="performance" fill="#4caf50" name="Performance Index" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Insights color="primary" />
                  Business Insights
                </Typography>
                <List dense>
                  {(metrics.business_insights || []).map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Star color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment color="warning" />
                  Recomendaciones Estratégicas
                </Typography>
                <List dense>
                  {(metrics.strategic_recommendations || []).map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={recommendation}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Performance Distribution */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de Performance por País
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="performance"
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, performance }: any) => `${name}: ${performance}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ExecutiveDashboard; 