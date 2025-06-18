import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  LightbulbOutlined,
  Timeline,
  MonetizationOn,
  Speed,
  ExpandMore,
  Star,
  ThumbUp,
  ThumbDown,
  Info
} from '@mui/icons-material';

interface AccountInfo {
  id: string;
  name: string;
  classification: {
    level: 'BAJO' | 'ADECUADO' | 'ALTO' | 'CRÍTICO';
    recommendation: string;
  };
  usage_metrics: {
    currentUsagePercentage: number;
    currentUsage: number;
    averageMonthlyUsage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    efficiency: number;
  };
  package_info?: {
    name: string;
    credit_limit: number;
    price?: number;
  };
}

interface Recommendation {
  id: string;
  type: 'optimization' | 'cost_saving' | 'performance' | 'scaling' | 'critical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  potential_savings?: number;
  affected_accounts: string[];
  implementation_steps: string[];
  confidence_score: number;
  category: 'cost' | 'performance' | 'capacity' | 'efficiency';
}

interface RecommendationsEngineProps {
  country: string;
  accounts: AccountInfo[];
  onImplementRecommendation?: (recommendationId: string) => void;
  onDismissRecommendation?: (recommendationId: string) => void;
}

const generateRecommendations = (accounts: AccountInfo[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  // Análisis de cuentas con uso bajo
  const lowUsageAccounts = accounts.filter(acc => acc.classification.level === 'BAJO');
  if (lowUsageAccounts.length > 0) {
    recommendations.push({
      id: 'low-usage-optimization',
      type: 'cost_saving',
      priority: 'high',
      title: 'Optimización de Cuentas de Bajo Uso',
      description: `${lowUsageAccounts.length} cuentas están utilizando menos del 30% de su capacidad.`,
      impact: 'Reducción de costos del 15-25% sin afectar el servicio',
      effort: 'low',
      potential_savings: lowUsageAccounts.length * 150, // Estimado
      affected_accounts: lowUsageAccounts.map(acc => acc.id),
      implementation_steps: [
        'Revisar paquetes actuales de las cuentas identificadas',
        'Proponer downgrade a paquetes más pequeños',
        'Monitorear uso durante 2 meses después del cambio',
        'Ajustar si es necesario'
      ],
      confidence_score: 85,
      category: 'cost'
    });
  }

  // Análisis de cuentas críticas
  const criticalAccounts = accounts.filter(acc => acc.classification.level === 'CRÍTICO');
  if (criticalAccounts.length > 0) {
    recommendations.push({
      id: 'critical-accounts-scaling',
      type: 'critical',
      priority: 'high',
      title: 'Expansión Urgente de Capacidad',
      description: `${criticalAccounts.length} cuentas están usando más del 90% de su capacidad.`,
      impact: 'Prevención de interrupciones de servicio y pérdida de mensajes',
      effort: 'medium',
      affected_accounts: criticalAccounts.map(acc => acc.id),
      implementation_steps: [
        'Upgrade inmediato a paquetes superiores',
        'Configurar alertas automáticas en 80% de uso',
        'Implementar escalado automático si está disponible',
        'Revisar patrones de uso para optimización futura'
      ],
      confidence_score: 95,
      category: 'capacity'
    });
  }

  // Análisis de eficiencia
  const inefficientAccounts = accounts.filter(acc => acc.usage_metrics.efficiency < 60);
  if (inefficientAccounts.length > 0) {
    recommendations.push({
      id: 'efficiency-improvement',
      type: 'performance',
      priority: 'medium',
      title: 'Mejora de Eficiencia Operacional',
      description: `${inefficientAccounts.length} cuentas tienen eficiencia menor al 60%.`,
      impact: 'Mejora en la entrega de mensajes y reducción de fallos',
      effort: 'medium',
      affected_accounts: inefficientAccounts.map(acc => acc.id),
      implementation_steps: [
        'Auditar configuraciones de las cuentas afectadas',
        'Optimizar templates y contenido de mensajes',
        'Revisar horarios de envío',
        'Implementar retry logic mejorado'
      ],
      confidence_score: 75,
      category: 'performance'
    });
  }

  // Análisis de tendencias
  const decliningAccounts = accounts.filter(acc => acc.usage_metrics.trend === 'decreasing');
  if (decliningAccounts.length > accounts.length * 0.3) {
    recommendations.push({
      id: 'trend-analysis',
      type: 'optimization',
      priority: 'medium',
      title: 'Análisis de Tendencia Descendente',
      description: `${decliningAccounts.length} cuentas muestran tendencia a la baja en el uso.`,
      impact: 'Identificación temprana de problemas potenciales',
      effort: 'low',
      affected_accounts: decliningAccounts.map(acc => acc.id),
      implementation_steps: [
        'Investigar causas de la disminución',
        'Contactar con propietarios de las cuentas',
        'Revisar cambios recientes en aplicaciones',
        'Proponer estrategias de re-engagement'
      ],
      confidence_score: 70,
      category: 'efficiency'
    });
  }

  // Recomendación de consolidación
  const redundantAccounts = accounts.filter(acc => 
    acc.usage_metrics.currentUsagePercentage < 20 && 
    acc.usage_metrics.averageMonthlyUsage < 1000
  );
  if (redundantAccounts.length >= 3) {
    recommendations.push({
      id: 'account-consolidation',
      type: 'cost_saving',
      priority: 'low',
      title: 'Consolidación de Cuentas Subutilizadas',
      description: `${redundantAccounts.length} cuentas podrían consolidarse para reducir costos.`,
      impact: 'Simplificación de gestión y reducción de costos administrativos',
      effort: 'high',
      potential_savings: redundantAccounts.length * 80,
      affected_accounts: redundantAccounts.map(acc => acc.id),
      implementation_steps: [
        'Evaluar viabilidad técnica de consolidación',
        'Mapear dependencias entre aplicaciones',
        'Crear plan de migración gradual',
        'Ejecutar consolidación en fases'
      ],
      confidence_score: 60,
      category: 'cost'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'optimization': return <Speed color="primary" />;
    case 'cost_saving': return <MonetizationOn color="success" />;
    case 'performance': return <Timeline color="info" />;
    case 'scaling': return <TrendingUp color="warning" />;
    case 'critical': return <Warning color="error" />;
    default: return <LightbulbOutlined color="primary" />;
  }
};

const getEffortColor = (effort: string) => {
  switch (effort) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'error';
    default: return 'default';
  }
};

export const RecommendationsEngine: React.FC<RecommendationsEngineProps> = ({
  country,
  accounts,
  onImplementRecommendation,
  onDismissRecommendation
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | false>(false);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  const recommendations = useMemo(() => 
    generateRecommendations(accounts).filter(rec => !dismissedRecommendations.has(rec.id)),
    [accounts, dismissedRecommendations]
  );

  const handleAccordionChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpandedRecommendation(isExpanded ? panel : false);
  };

  const handleDismiss = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set(Array.from(prev).concat(recommendationId)));
    onDismissRecommendation?.(recommendationId);
  };

  const getOverallScore = () => {
    const totalAccounts = accounts.length;
    const criticalAccounts = accounts.filter(acc => acc.classification.level === 'CRÍTICO').length;
    const lowUsageAccounts = accounts.filter(acc => acc.classification.level === 'BAJO').length;
    const avgEfficiency = accounts.reduce((sum, acc) => sum + acc.usage_metrics.efficiency, 0) / totalAccounts;
    
    let score = 100;
    score -= (criticalAccounts / totalAccounts) * 30; // Penalizar cuentas críticas
    score -= (lowUsageAccounts / totalAccounts) * 20; // Penalizar subutilización
    score -= (100 - avgEfficiency) * 0.5; // Penalizar baja eficiencia
    
    return Math.max(0, Math.round(score));
  };

  const overallScore = getOverallScore();

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology color="primary" />
            Recomendaciones IA - {country}
          </Typography>
          
          <Chip
            icon={<Star />}
            label={`Score: ${overallScore}/100`}
            color={overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error'}
            variant="filled"
          />
        </Box>

        {/* Overall Health Score */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Salud General del Sistema
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={overallScore} 
                  color={overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                {overallScore}%
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {overallScore >= 80 && "Sistema funcionando óptimamente"}
              {overallScore >= 60 && overallScore < 80 && "Sistema estable con oportunidades de mejora"}
              {overallScore < 60 && "Sistema requiere atención inmediata"}
            </Typography>
          </CardContent>
        </Card>

        {/* Recommendations Summary */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {recommendations.filter(r => r.priority === 'high').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alta Prioridad
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {recommendations.filter(r => r.priority === 'medium').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Media Prioridad
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  Q{recommendations.reduce((sum, r) => sum + (r.potential_savings || 0), 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ahorro Potencial
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {recommendations.reduce((sum, r) => sum + r.affected_accounts.length, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cuentas Afectadas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recommendations List */}
        {recommendations.length === 0 ? (
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="h6">¡Excelente!</Typography>
            <Typography>
              No hay recomendaciones pendientes. El sistema está funcionando óptimamente.
            </Typography>
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recomendaciones Activas ({recommendations.length})
            </Typography>
            
            {recommendations.map((recommendation) => (
              <Accordion
                key={recommendation.id}
                expanded={expandedRecommendation === recommendation.id}
                onChange={handleAccordionChange(recommendation.id)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Box mr={2}>
                      {getTypeIcon(recommendation.type)}
                    </Box>
                    
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {recommendation.description}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1} ml={2}>
                      <Chip
                        label={recommendation.priority.toUpperCase()}
                        color={getPriorityColor(recommendation.priority) as any}
                        size="small"
                      />
                      <Chip
                        label={`${recommendation.confidence_score}% confianza`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        Impacto Esperado
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {recommendation.impact}
                      </Typography>
                      
                      <Typography variant="h6" gutterBottom>
                        Plan de Implementación
                      </Typography>
                      <List dense>
                        {recommendation.implementation_steps.map((step, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Typography variant="body2" fontWeight="bold">
                                {index + 1}.
                              </Typography>
                            </ListItemIcon>
                            <ListItemText primary={step} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Métricas
                          </Typography>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Esfuerzo requerido
                            </Typography>
                            <Chip
                              label={recommendation.effort.toUpperCase()}
                              color={getEffortColor(recommendation.effort) as any}
                              size="small"
                            />
                          </Box>
                          
                          {recommendation.potential_savings && (
                            <Box mb={2}>
                              <Typography variant="body2" color="text.secondary">
                                Ahorro potencial
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                Q{recommendation.potential_savings.toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Cuentas afectadas
                            </Typography>
                            <Typography variant="h6">
                              {recommendation.affected_accounts.length}
                            </Typography>
                          </Box>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Categoría
                            </Typography>
                            <Chip
                              label={recommendation.category.toUpperCase()}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={1}>
                      <Tooltip title="Marcar como útil">
                        <IconButton color="primary">
                          <ThumbUp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="No útil">
                        <IconButton color="default">
                          <ThumbDown />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Más información">
                        <IconButton color="info">
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDismiss(recommendation.id)}
                      >
                        Descartar
                      </Button>
                      {onImplementRecommendation && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onImplementRecommendation(recommendation.id)}
                        >
                          Implementar
                        </Button>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsEngine; 