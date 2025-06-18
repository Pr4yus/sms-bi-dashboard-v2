import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Button
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
  Info
} from '@mui/icons-material';

interface BusinessMetricDetail {
  total_sms: number;
  successful_sms: number;
  accounts_count: number;
  success_rate: number;
  objective?: number;
  deviation?: number;
  deviation_percentage?: number;
  analysis?: string;
  proposed_actions?: string[];
  responsible?: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  monthly_growth?: number;
}

interface BusinessMetrics {
  period: string;
  country: string;
  metrics: {
    bac_gt_sms?: BusinessMetricDetail;
    nexa_banco?: BusinessMetricDetail;
    csms_claro_regional?: BusinessMetricDetail;
    ec_tipo_hn?: BusinessMetricDetail;
    mensajes_generales?: BusinessMetricDetail;
    total_guatemala?: BusinessMetricDetail;
  };
  conclusions: string[];
  recommendations: string[];
  timestamp: string;
  error?: string;
}

interface BusinessMetricsCardProps {
  metrics: BusinessMetrics;
  onRefresh?: () => void;
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-GT').format(num);
};

const getSuccessRateColor = (rate: number): 'success' | 'warning' | 'error' => {
  if (rate >= 95) return 'success';
  if (rate >= 85) return 'warning';
  return 'error';
};

const getProgressValue = (current: number, objective?: number): number => {
  if (!objective) return Math.min(current, 100);
  return Math.min((current / objective) * 100, 100);
};

const getTrendIcon = (trend?: string, growth?: number) => {
  if (!trend) return null;
  
  switch (trend) {
    case 'increasing':
      return <TrendingUp color="success" fontSize="small" />;
    case 'decreasing':
      return <TrendingDown color="error" fontSize="small" />;
    default:
      return <CheckCircle color="info" fontSize="small" />;
  }
};

const getCompanyAvatar = (company: string) => {
  const avatars: Record<string, { color: string; icon: React.ReactNode; name: string }> = {
    bac_gt_sms: { 
      color: '#1976d2', 
      icon: <AccountBalance />, 
      name: 'BAC GT SMS' 
    },
    nexa_banco: { 
      color: '#2e7d32', 
      icon: <Business />, 
      name: 'Nexa Banco' 
    },
    csms_claro_regional: { 
      color: '#d32f2f', 
      icon: <Assessment />, 
      name: 'CSMS Claro Regional' 
    },
    ec_tipo_hn: { 
      color: '#ed6c02', 
      icon: <Speed />, 
      name: 'EC Tipo HN' 
    },
    mensajes_generales: { 
      color: '#9c27b0', 
      icon: <Info />, 
      name: 'Mensajes Generales' 
    },
    total_guatemala: { 
      color: '#00695c', 
      icon: <MonetizationOn />, 
      name: 'Total Guatemala' 
    }
  };
  
  return avatars[company] || { 
    color: '#757575', 
    icon: <Business />, 
    name: company 
  };
};

const MetricItem: React.FC<{ 
  id: string;
  metric: BusinessMetricDetail; 
}> = ({ id, metric }) => {
  const company = getCompanyAvatar(id);
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: company.color, 
              mr: 2,
              width: 40,
              height: 40
            }}
          >
            {company.icon}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6">
              {company.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {metric.accounts_count} cuentas activas
            </Typography>
          </Box>
          <Chip
            label={`${metric.success_rate.toFixed(1)}%`}
            color={getSuccessRateColor(metric.success_rate)}
            variant="filled"
          />
        </Box>
        
        <Grid container spacing={2} mb={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              SMS Enviados
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatNumber(metric.total_sms)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              SMS Exitosos
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {formatNumber(metric.successful_sms)}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="text.secondary">
              Tasa de Éxito
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {metric.success_rate.toFixed(1)}%
              </Typography>
              {getTrendIcon(metric.trend, metric.monthly_growth)}
            </Box>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Rendimiento
          </Typography>
          <LinearProgress
            variant="determinate"
            value={metric.success_rate}
            color={getSuccessRateColor(metric.success_rate)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Analysis and Actions */}
        {metric.analysis && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Análisis:</strong> {metric.analysis}
          </Typography>
        )}

        {metric.proposed_actions && metric.proposed_actions.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Acciones Propuestas:
            </Typography>
            <List dense>
              {metric.proposed_actions.map((action, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {index + 1}.
                    </Typography>
                  </ListItemIcon>
                  <ListItemText 
                    primary={action}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {metric.responsible && (
          <Typography variant="caption" color="text.secondary">
            Responsable: {metric.responsible}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const BusinessMetricsCard: React.FC<BusinessMetricsCardProps> = ({ 
  metrics, 
  onRefresh 
}) => {
  if (metrics.error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            onRefresh && (
              <Button color="inherit" size="small" onClick={onRefresh}>
                Reintentar
              </Button>
            )
          }>
            <Typography variant="h6">Error al cargar métricas empresariales</Typography>
            <Typography variant="body2">{metrics.error}</Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              Métricas Empresariales - {metrics.country}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Período: {metrics.period} | Actualizado: {new Date(metrics.timestamp).toLocaleString('es-ES')}
            </Typography>
          </Box>
          
          {onRefresh && (
            <Button
              variant="outlined"
              size="small"
              onClick={onRefresh}
              startIcon={<Assessment />}
            >
              Actualizar
            </Button>
          )}
        </Box>

        {/* Summary Section */}
        {metrics.metrics.total_guatemala && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              📊 Resumen General Guatemala
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total SMS
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatNumber(metrics.metrics.total_guatemala.total_sms)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  SMS Exitosos
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatNumber(metrics.metrics.total_guatemala.successful_sms)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tasa de Éxito
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {metrics.metrics.total_guatemala.success_rate.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cuentas Activas
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {metrics.metrics.total_guatemala.accounts_count}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Individual Metrics */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Empresas Específicas
          </Typography>
          
          {Object.entries(metrics.metrics).map(([key, metric]) => {
            if (!metric || key === 'total_guatemala') return null;
            
            return (
              <MetricItem
                key={key}
                id={key}
                metric={metric}
              />
            );
          })}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Conclusions */}
        {metrics.conclusions.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="info" />
              Conclusiones
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              {metrics.conclusions.map((conclusion, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  • {conclusion}
                </Typography>
              ))}
            </Paper>
          </Box>
        )}

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="warning" />
              Recomendaciones Estratégicas
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              {metrics.recommendations.map((recommendation, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  • {recommendation}
                </Typography>
              ))}
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessMetricsCard; 