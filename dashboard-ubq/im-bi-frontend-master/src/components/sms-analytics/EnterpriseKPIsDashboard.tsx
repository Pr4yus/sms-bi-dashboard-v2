import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
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
  Info,
  Timeline,
  Refresh,
  Download,
  Notifications,
  Star,
  LocalAtm,
  ShowChart,
  BarChart,
  PieChart,
  Settings
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
  Bar
} from 'recharts';

interface KPIMetric {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  previous_value: number;
  unit: string;
  category: 'performance' | 'business' | 'operational' | 'financial';
  priority: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  business_impact: string;
  recommendations?: string[];
  responsible_team: string;
  last_updated: string;
}

interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  active: boolean;
  last_triggered?: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  recipients: string[];
}

interface EnterpriseKPIsDashboardProps {
  country: string;
  period: string;
  kpis: KPIMetric[];
  alerts: AlertConfig[];
  onRefresh?: () => void;
  onExport?: () => void;
  onConfigureAlert?: (alertId: string) => void;
}

const COLORS = {
  performance: '#1976d2',
  business: '#2e7d32',
  operational: '#ed6c02',
  financial: '#9c27b0'
};

const STATUS_COLORS = {
  excellent: '#4caf50',
  good: '#2196f3',
  warning: '#ff9800',
  critical: '#f44336'
};

const formatNumber = (num: number, unit: string): string => {
  if (unit === '%') {
    return `${num.toFixed(1)}%`;
  }
  if (unit === 'SMS') {
    return new Intl.NumberFormat('es-GT').format(num);
  }
  if (unit === 'Q') {
    return `Q${new Intl.NumberFormat('es-GT').format(num)}`;
  }
  return new Intl.NumberFormat('es-GT').format(num);
};

const getKPIIcon = (category: string) => {
  switch (category) {
    case 'performance': return <Assessment />;
    case 'business': return <Business />;
    case 'operational': return <Speed />;
    case 'financial': return <MonetizationOn />;
    default: return <Info />;
  }
};

const getTrendIcon = (trend: string, changePercentage: number) => {
  if (trend === 'up') {
    return <TrendingUp color={changePercentage > 0 ? 'success' : 'error'} fontSize="small" />;
  } else if (trend === 'down') {
    return <TrendingDown color={changePercentage < 0 ? 'error' : 'success'} fontSize="small" />;
  }
  return <CheckCircle color="info" fontSize="small" />;
};

const getStatusChip = (status: string) => {
  const colors = {
    excellent: { color: 'success', label: 'Excelente' },
    good: { color: 'info', label: 'Bueno' },
    warning: { color: 'warning', label: 'Atención' },
    critical: { color: 'error', label: 'Crítico' }
  };
  
  const config = colors[status as keyof typeof colors] || colors.good;
  return <Chip label={config.label} color={config.color as any} size="small" />;
};

const KPICard: React.FC<{ kpi: KPIMetric }> = ({ kpi }) => {
  const progressValue = Math.min((kpi.current_value / kpi.target_value) * 100, 100);
  const isOnTarget = kpi.current_value >= kpi.target_value;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: COLORS[kpi.category], 
                mr: 1,
                width: 32,
                height: 32
              }}
            >
              {getKPIIcon(kpi.category)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontSize="0.9rem" fontWeight="bold">
                {kpi.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpi.category.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          {getStatusChip(kpi.status)}
        </Box>
        
        <Box mb={2}>
          <Box display="flex" alignItems="baseline" mb={1}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {formatNumber(kpi.current_value, kpi.unit)}
            </Typography>
            <Box display="flex" alignItems="center" ml={1}>
              {getTrendIcon(kpi.trend, kpi.change_percentage)}
              <Typography 
                variant="body2" 
                color={kpi.change_percentage >= 0 ? 'success.main' : 'error.main'}
                ml={0.5}
              >
                {kpi.change_percentage >= 0 ? '+' : ''}{kpi.change_percentage.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Objetivo: {formatNumber(kpi.target_value, kpi.unit)}
          </Typography>
        </Box>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progreso
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {progressValue.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color={isOnTarget ? 'success' : progressValue > 80 ? 'warning' : 'error'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Descripción:</strong> {kpi.description}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Impacto:</strong> {kpi.business_impact}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Responsable: {kpi.responsible_team} | 
          Actualizado: {new Date(kpi.last_updated).toLocaleDateString('es-ES')}
        </Typography>
        
        {kpi.recommendations && kpi.recommendations.length > 0 && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary" display="block">
              Recomendaciones:
            </Typography>
            {kpi.recommendations.slice(0, 2).map((rec, index) => (
              <Typography key={index} variant="caption" display="block" sx={{ ml: 1 }}>
                • {rec}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AlertsPanel: React.FC<{ 
  alerts: AlertConfig[]; 
  onConfigure?: (alertId: string) => void; 
}> = ({ alerts, onConfigure }) => {
  const activeAlerts = alerts.filter(alert => alert.active);
  const triggeredAlerts = alerts.filter(alert => alert.last_triggered);
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notifications color="primary" />
          Sistema de Alertas Inteligentes ({activeAlerts.length} activas)
        </Typography>
        
        {triggeredAlerts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {triggeredAlerts.length} alertas activadas recientemente
            </Typography>
          </Alert>
        )}
        
        <List dense>
          {alerts.map((alert) => (
            <ListItem 
              key={alert.id}
              sx={{ 
                bgcolor: alert.active ? 'action.hover' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                <Chip
                  label={alert.frequency.toUpperCase()}
                  color={alert.active ? 'primary' : 'default'}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={alert.name}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      Condición: {alert.condition} (Umbral: {alert.threshold})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Destinatarios: {alert.recipients.join(', ')}
                    </Typography>
                    {alert.last_triggered && (
                      <Typography variant="caption" color="warning.main" display="block">
                        Última activación: {new Date(alert.last_triggered).toLocaleString('es-ES')}
                      </Typography>
                    )}
                  </Box>
                }
              />
              {onConfigure && (
                <IconButton 
                  size="small" 
                  onClick={() => onConfigure(alert.id)}
                >
                  <Settings fontSize="small" />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export const EnterpriseKPIsDashboard: React.FC<EnterpriseKPIsDashboardProps> = ({
  country,
  period,
  kpis,
  alerts,
  onRefresh,
  onExport,
  onConfigureAlert
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredKPIs = useMemo(() => {
    return kpis.filter(kpi => {
      const categoryMatch = categoryFilter === 'all' || kpi.category === categoryFilter;
      const priorityMatch = priorityFilter === 'all' || kpi.priority === priorityFilter;
      return categoryMatch && priorityMatch;
    });
  }, [kpis, categoryFilter, priorityFilter]);

  const kpiSummary = useMemo(() => {
    const summary = {
      total: kpis.length,
      excellent: kpis.filter(k => k.status === 'excellent').length,
      good: kpis.filter(k => k.status === 'good').length,
      warning: kpis.filter(k => k.status === 'warning').length,
      critical: kpis.filter(k => k.status === 'critical').length,
      onTarget: kpis.filter(k => k.current_value >= k.target_value).length
    };
    
    summary.performance = ((summary.excellent + summary.good) / summary.total * 100);
    return summary;
  }, [kpis]);

  const chartData = useMemo(() => {
    return [
      { name: 'Excelente', value: kpiSummary.excellent, color: STATUS_COLORS.excellent },
      { name: 'Bueno', value: kpiSummary.good, color: STATUS_COLORS.good },
      { name: 'Atención', value: kpiSummary.warning, color: STATUS_COLORS.warning },
      { name: 'Crítico', value: kpiSummary.critical, color: STATUS_COLORS.critical }
    ];
  }, [kpiSummary]);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Enterprise KPIs Dashboard - {country}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Período: {period} | Performance General: {kpiSummary.performance.toFixed(1)}%
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
              Exportar
            </Button>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {kpiSummary.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              KPIs Totales
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {kpiSummary.onTarget}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              En Objetivo
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {kpiSummary.warning}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atención
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="error.main" fontWeight="bold">
              {kpiSummary.critical}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Críticos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">
              {kpiSummary.performance.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Performance General
            </Typography>
            <LinearProgress
              variant="determinate"
              value={kpiSummary.performance}
              color={kpiSummary.performance > 80 ? 'success' : 'warning'}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="KPIs Dashboard" icon={<BarChart />} />
          <Tab label="Alertas Inteligentes" icon={<Notifications />} />
          <Tab label="Análisis Visual" icon={<ShowChart />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Box display="flex" gap={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryFilter}
                label="Categoría"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="operational">Operacional</MenuItem>
                <MenuItem value="financial">Financiero</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={priorityFilter}
                label="Prioridad"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="low">Baja</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* KPIs Grid */}
          <Grid container spacing={3}>
            {filteredKPIs.map((kpi) => (
              <Grid item xs={12} sm={6} md={4} key={kpi.id}>
                <KPICard kpi={kpi} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <AlertsPanel 
          alerts={alerts} 
          onConfigure={onConfigureAlert}
        />
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de KPIs por Estado
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  KPIs por Categoría
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart
                    data={[
                      { name: 'Performance', value: kpis.filter(k => k.category === 'performance').length },
                      { name: 'Business', value: kpis.filter(k => k.category === 'business').length },
                      { name: 'Operational', value: kpis.filter(k => k.category === 'operational').length },
                      { name: 'Financial', value: kpis.filter(k => k.category === 'financial').length }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#1976d2" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EnterpriseKPIsDashboard; 