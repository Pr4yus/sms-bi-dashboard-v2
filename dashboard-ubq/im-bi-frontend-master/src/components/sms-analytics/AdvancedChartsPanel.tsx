import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  PieChart,
  ShowChart,
  Download,
  Refresh,
  Insights
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface MonthlyData {
  month: string;
  usage: number;
  usage_percentage: number;
  predicted_usage?: number;
  bajo: number;
  adecuado: number;
  alto: number;
  critico: number;
  efficiency: number;
  total_accounts: number;
  active_accounts: number;
}

interface PredictionData {
  month: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface AdvancedChartsPanelProps {
  country: string;
  monthlyData: MonthlyData[];
  predictions?: PredictionData[];
  onExportData?: () => void;
  onRefreshData?: () => void;
}

const COLORS = {
  bajo: '#f44336',      // Red
  adecuado: '#2196f3',  // Blue
  alto: '#4caf50',      // Green
  critico: '#ff9800',   // Orange
  efficiency: '#9c27b0', // Purple
  predicted: '#00bcd4'   // Cyan
};

const generatePredictions = (monthlyData: MonthlyData[]): PredictionData[] => {
  if (monthlyData.length < 3) return [];
  
  const lastThreeMonths = monthlyData.slice(-3);
  const trend = calculateTrend(lastThreeMonths);
  const avgGrowth = trend === 'stable' ? 0 : trend === 'increasing' ? 0.15 : -0.12;
  
  return Array.from({ length: 6 }, (_, i) => {
    const lastValue = monthlyData[monthlyData.length - 1]?.usage || 0;
    const predicted = Math.max(0, lastValue * Math.pow(1 + avgGrowth, i + 1));
    const confidence = Math.max(50, 95 - (i * 10)); // Confidence decreases over time
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + i + 1);
    
    return {
      month: futureDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      current: i === 0 ? lastValue : 0,
      predicted,
      confidence,
      trend
    };
  });
};

const calculateTrend = (data: MonthlyData[]): 'increasing' | 'decreasing' | 'stable' => {
  if (data.length < 2) return 'stable';
  
  const first = data[0].usage;
  const last = data[data.length - 1].usage;
  const change = (last - first) / first;
  
  if (change > 0.05) return 'increasing';
  if (change < -0.05) return 'decreasing';
  return 'stable';
};

export const AdvancedChartsPanel: React.FC<AdvancedChartsPanelProps> = ({
  country,
  monthlyData,
  predictions: propPredictions,
  onExportData,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('12');
  const [chartType, setChartType] = useState('line');

  const predictions = useMemo(() => 
    propPredictions || generatePredictions(monthlyData), 
    [propPredictions, monthlyData]
  );

  const filteredData = useMemo(() => {
    const months = parseInt(timeRange);
    return monthlyData.slice(-months);
  }, [monthlyData, timeRange]);

  const classificationData = useMemo(() => {
    const latest = monthlyData[monthlyData.length - 1];
    if (!latest) return [];
    
    return [
      { name: 'BAJO (≤30%)', value: latest.bajo, color: COLORS.bajo },
      { name: 'ADECUADO (31-70%)', value: latest.adecuado, color: COLORS.adecuado },
      { name: 'ALTO (71-90%)', value: latest.alto, color: COLORS.alto },
      { name: 'CRÍTICO (>90%)', value: latest.critico, color: COLORS.critico },
    ];
  }, [monthlyData]);

  const combinedData = useMemo(() => {
    return [...filteredData, ...predictions.slice(0, 3)];
  }, [filteredData, predictions]);

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartsTooltip 
          labelStyle={{ color: '#333' }}
          contentStyle={{ borderRadius: 8, border: '1px solid #ccc' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="usage" 
          stroke="#2196f3" 
          strokeWidth={3}
          name="Uso Real"
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="predicted_usage" 
          stroke={COLORS.predicted}
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Predicción"
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="efficiency" 
          stroke={COLORS.efficiency}
          strokeWidth={2}
          name="Eficiencia %"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartsTooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="bajo" 
          stackId="1" 
          stroke={COLORS.bajo} 
          fill={COLORS.bajo}
          name="BAJO"
        />
        <Area 
          type="monotone" 
          dataKey="adecuado" 
          stackId="1" 
          stroke={COLORS.adecuado} 
          fill={COLORS.adecuado}
          name="ADECUADO"
        />
        <Area 
          type="monotone" 
          dataKey="alto" 
          stackId="1" 
          stroke={COLORS.alto} 
          fill={COLORS.alto}
          name="ALTO"
        />
        <Area 
          type="monotone" 
          dataKey="critico" 
          stackId="1" 
          stroke={COLORS.critico} 
          fill={COLORS.critico}
          name="CRÍTICO"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart>
        <Pie
          dataKey="value"
          data={classificationData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
        >
          {classificationData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  const renderPredictionChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={predictions}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartsTooltip />
        <Legend />
        <Bar dataKey="confidence" fill="#e0e0e0" name="Confianza %" />
        <Line 
          type="monotone" 
          dataKey="predicted" 
          stroke={COLORS.predicted}
          strokeWidth={3}
          name="Predicción SMS"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const getInsights = () => {
    if (monthlyData.length < 2) return [];
    
    const insights = [];
    const latest = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    
    // Tendencia de uso
    if (latest && previous) {
      const change = ((latest.usage - previous.usage) / previous.usage) * 100;
      if (change > 10) {
        insights.push({
          type: 'warning',
          message: `Aumento significativo del ${change.toFixed(1)}% en el uso SMS este mes`
        });
      } else if (change < -10) {
        insights.push({
          type: 'info',
          message: `Disminución del ${Math.abs(change).toFixed(1)}% en el uso SMS este mes`
        });
      }
    }
    
    // Cuentas críticas
    if (latest && latest.critico > latest.total_accounts * 0.15) {
      insights.push({
        type: 'error',
        message: `${latest.critico} cuentas en estado CRÍTICO requieren atención inmediata`
      });
    }
    
    // Eficiencia
    if (latest && latest.efficiency < 60) {
      insights.push({
        type: 'warning',
        message: `Eficiencia baja (${latest.efficiency}%) - considerar optimización`
      });
    }
    
    return insights;
  };

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analytics color="primary" />
            Análisis Avanzado - {country}
          </Typography>
          
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={timeRange}
                label="Período"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="6">6 meses</MenuItem>
                <MenuItem value="12">12 meses</MenuItem>
                <MenuItem value="24">24 meses</MenuItem>
              </Select>
            </FormControl>
            
            {onRefreshData && (
              <Button
                startIcon={<Refresh />}
                onClick={onRefreshData}
                variant="outlined"
                size="small"
              >
                Actualizar
              </Button>
            )}
            
            {onExportData && (
              <Button
                startIcon={<Download />}
                onClick={onExportData}
                variant="contained"
                size="small"
              >
                Exportar
              </Button>
            )}
          </Box>
        </Box>

        {/* Insights Panel */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Insights color="primary" />
            Insights Automáticos
          </Typography>
          <Grid container spacing={1}>
            {getInsights().map((insight, index) => (
              <Grid item xs={12} key={index}>
                <Alert severity={insight.type as any}>
                  {insight.message}
                </Alert>
              </Grid>
            ))}
            {getInsights().length === 0 && (
              <Grid item xs={12}>
                <Alert severity="success">
                  No hay alertas. El sistema funciona dentro de los parámetros normales.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Chart Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Tendencias" 
              icon={<ShowChart />}
              iconPosition="start"
            />
            <Tab 
              label="Distribución" 
              icon={<PieChart />}
              iconPosition="start"
            />
            <Tab 
              label="Clasificaciones" 
              icon={<Analytics />}
              iconPosition="start"
            />
            <Tab 
              label="Predicciones" 
              icon={<TrendingUp />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Chart Content */}
        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Tendencias de Uso SMS</Typography>
              <FormControl size="small">
                <Select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="line">Líneas</MenuItem>
                  <MenuItem value="area">Área</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {chartType === 'line' ? renderLineChart() : renderAreaChart()}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Distribución Actual de Clasificaciones
            </Typography>
            {renderPieChart()}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Evolución de Clasificaciones por Mes
            </Typography>
            {renderAreaChart()}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Predicciones de Uso (Próximos 6 meses)
            </Typography>
            {renderPredictionChart()}
            
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Predicciones Detalladas:
              </Typography>
              <Grid container spacing={1}>
                {predictions.slice(0, 3).map((pred, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{pred.month}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Predicción: {pred.predicted.toLocaleString()} SMS
                        </Typography>
                        <Chip 
                          label={`${pred.confidence}% confianza`}
                          color={pred.confidence > 80 ? 'success' : pred.confidence > 60 ? 'warning' : 'error'}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedChartsPanel; 