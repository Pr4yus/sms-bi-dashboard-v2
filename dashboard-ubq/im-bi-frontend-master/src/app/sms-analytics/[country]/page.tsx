"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  Phone,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Search,
  FilterList,
  Menu as MenuIcon,
  Language,
  AccountBalance,
  Analytics,
  Business
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import AdvancedChartsPanel from '@/components/sms-analytics/AdvancedChartsPanel';
import RecommendationsEngine from '@/components/sms-analytics/RecommendationsEngine';
import ReportExporter from '@/components/sms-analytics/ReportExporter';

interface AccountInfo {
  id: string;
  name: string;
  status: string;
  classification: {
    level: 'BAJO' | 'ADECUADO' | 'ALTO' | 'CRÍTICO';
    color: 'danger' | 'info' | 'success' | 'warning';
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

interface CountryAnalysis {
  country: string;
  total_accounts: number;
  classifications: {
    BAJO: number;
    ADECUADO: number;
    ALTO: number;
    CRÍTICO: number;
  };
  summary: {
    total_usage: number;
    average_usage_percentage: number;
    active_accounts: number;
    needs_attention: number;
  };
  trends: {
    usage_trend: 'increasing' | 'decreasing' | 'stable';
    efficiency_score: number;
  };
  alerts: string[];
}

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
const DRAWER_WIDTH = 280;

const getCountryDisplayName = (country: string) => {
  const displayNames: Record<string, string> = {
    'guatemala': '🇬🇹 Guatemala',
    'costa-rica': '🇨🇷 Costa Rica',
    'el-salvador': '🇸🇻 El Salvador',
    'nicaragua': '🇳🇮 Nicaragua',
    'honduras': '🇭🇳 Honduras',
    'honduras-tigo': '🇭🇳 Honduras Tigo',
  };
  return displayNames[country] || country;
};

const getClassificationColor = (level: string) => {
  switch (level) {
    case 'BAJO': return 'error';
    case 'ADECUADO': return 'info';
    case 'ALTO': return 'success';
    case 'CRÍTICO': return 'warning';
    default: return 'default';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return <TrendingUp color="success" />;
    case 'decreasing': return <TrendingDown color="error" />;
    default: return <CheckCircle color="info" />;
  }
};

export default function CountryAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const country = params.country as string;
  
  const [analysis, setAnalysis] = useState<CountryAnalysis | null>(null);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [classification, setClassification] = useState('');
  const [search, setSearch] = useState('');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const countriesList = [
    'guatemala',
    'costa-rica',
    'el-salvador',
    'nicaragua',
    'honduras',
    'honduras-tigo'
  ];

  const fetchCountryAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/sms-analytics/${country}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching country analysis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchAccounts = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(classification && { classification }),
        ...(search && { search })
      });
      
      const response = await fetch(`${BACKEND_URL}/sms-analytics/${country}/accounts?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAccounts(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err instanceof Error ? err.message : 'Error cargando cuentas');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/sms-analytics/${country}/monthly-trends`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data);
      } else {
        // Sin datos mock - solo mostrar mensaje informativo
        console.warn(`No monthly trends data available for ${country}`);
        setMonthlyData([]);
      }
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      // Sin datos mock - solo mostrar error
      setMonthlyData([]);
    }
  };

  useEffect(() => {
    if (country) {
      fetchCountryAnalysis();
      fetchAccounts();
      fetchMonthlyData();
    }
  }, [country, page, classification, search]);

  const handleCountryClick = (newCountry: string) => {
    router.push(`/sms-analytics/${newCountry}`);
  };

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleExportReport = async (options: any) => {
    // Simulate export functionality
    console.log('Exporting report with options:', options);
    
    // In a real implementation, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, just show a success message
    alert('Reporte exportado exitosamente!');
  };

  const handleImplementRecommendation = (recommendationId: string) => {
    console.log('Implementing recommendation:', recommendationId);
    alert(`Implementando recomendación: ${recommendationId}`);
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone color="primary" />
          SMS Analytics
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Navegación por países
        </Typography>
      </Box>
      
      <List>
        {countriesList.map((countryItem) => (
          <ListItem key={countryItem} disablePadding>
            <ListItemButton
              selected={countryItem === country}
              onClick={() => handleCountryClick(countryItem)}
            >
              <ListItemIcon>
                <Language />
              </ListItemIcon>
              <ListItemText 
                primary={getCountryDisplayName(countryItem)}
                secondary={countryItem === country ? 'Actual' : ''}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/sms-analytics')}
          fullWidth
        >
          Dashboard Principal
        </Button>
      </Box>
    </Box>
  );

  if (loading && !analysis) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando análisis de {getCountryDisplayName(country)}...
        </Typography>
      </Container>
    );
  }

  if (error && !analysis) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchCountryAnalysis}>
              Reintentar
            </Button>
          }
        >
          <strong>Error:</strong> {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {getCountryDisplayName(country)}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            ...(isMobile && { zIndex: theme.zIndex.appBar - 1 })
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          ...(isMobile && { mt: 8 }),
          ...(isMobile && sidebarOpen && { ml: 0 })
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={() => router.push('/sms-analytics')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Phone fontSize="small" />
            SMS Analytics
          </Link>
          <Typography color="text.primary">
            {getCountryDisplayName(country)}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getCountryDisplayName(country)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Análisis detallado de cuentas SMS empresariales
          </Typography>
        </Box>

        {analysis && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Cuentas
                    </Typography>
                    <Typography variant="h4">
                      {analysis.total_accounts}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <AccountBalance fontSize="small" color="primary" />
                      <Typography variant="body2" color="primary" ml={1}>
                        Registradas
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Cuentas Activas
                    </Typography>
                    <Typography variant="h4">
                      {analysis.summary.active_accounts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {((analysis.summary.active_accounts / analysis.total_accounts) * 100).toFixed(1)}% del total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Uso Promedio
                    </Typography>
                    <Typography variant="h4">
                      {analysis.summary.average_usage_percentage}%
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {getTrendIcon(analysis.trends.usage_trend)}
                      <Typography variant="body2" ml={1}>
                        {analysis.trends.usage_trend}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Requieren Atención
                    </Typography>
                    <Typography variant="h4">
                      {analysis.summary.needs_attention}
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {((analysis.summary.needs_attention / analysis.total_accounts) * 100).toFixed(1)}% críticas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Classifications */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución de Clasificaciones
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Chip 
                        label="BAJO" 
                        color="error" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h5">
                        {analysis.classifications.BAJO}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ≤30% uso
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Chip 
                        label="ADECUADO" 
                        color="info" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h5">
                        {analysis.classifications.ADECUADO}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        31-70% uso
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Chip 
                        label="ALTO" 
                        color="success" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h5">
                        {analysis.classifications.ALTO}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        71-110% uso
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Chip 
                        label="CRÍTICO" 
                        color="warning" 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h5">
                        {analysis.classifications.CRÍTICO}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <30% o inactivo
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Alerts */}
            {analysis.alerts.length > 0 && (
              <Alert severity="warning" sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Alertas del Sistema:
                </Typography>
                {analysis.alerts.map((alert, index) => (
                  <Typography key={index} variant="body2">
                    • {alert}
                  </Typography>
                ))}
              </Alert>
            )}
          </>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Cuentas SMS" icon={<AccountBalance />} />
            <Tab label="Análisis Avanzado" icon={<Analytics />} />
            <Tab label="Recomendaciones IA" icon={<Business />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Buscar cuentas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Clasificación</InputLabel>
                <Select
                  value={classification}
                  label="Clasificación"
                  onChange={(e) => setClassification(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="BAJO">BAJO</MenuItem>
                  <MenuItem value="ADECUADO">ADECUADO</MenuItem>
                  <MenuItem value="ALTO">ALTO</MenuItem>
                  <MenuItem value="CRÍTICO">CRÍTICO</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Accounts Table */}
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cuenta</TableCell>
                      <TableCell>Clasificación</TableCell>
                      <TableCell align="right">Uso Actual</TableCell>
                      <TableCell align="right">Tendencia</TableCell>
                      <TableCell>Paquete</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress size={40} />
                        </TableCell>
                      </TableRow>
                    ) : accounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No se encontraron cuentas
                        </TableCell>
                      </TableRow>
                    ) : (
                      accounts.map((account) => (
                        <TableRow key={account.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {account.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {account.id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={account.classification.level}
                              color={getClassificationColor(account.classification.level) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {account.usage_metrics.currentUsagePercentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {account.usage_metrics.currentUsage.toLocaleString()} SMS
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              {getTrendIcon(account.usage_metrics.trend)}
                              <Typography variant="caption" ml={1}>
                                {account.usage_metrics.trend}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {account.package_info ? (
                              <Box>
                                <Typography variant="body2">
                                  {account.package_info.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {account.package_info.credit_limit.toLocaleString()} SMS
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Sin paquete
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={account.status}
                              color={account.status === 'ACTIVE' ? 'success' : 'default'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" p={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Card>
          </>
        )}

        {activeTab === 1 && (
          <>
            <AdvancedChartsPanel
              country={getCountryDisplayName(country)}
              monthlyData={monthlyData}
              onRefreshData={fetchMonthlyData}
              onExportData={() => setShowExportDialog(true)}
            />
          </>
        )}

        {activeTab === 2 && (
          <>
            <RecommendationsEngine
              country={getCountryDisplayName(country)}
              accounts={accounts}
              onImplementRecommendation={handleImplementRecommendation}
            />
          </>
        )}

        {/* Export Dialog */}
        <ReportExporter
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          countries={[country]}
          onExport={handleExportReport}
        />
      </Box>
    </Box>
  );
} 