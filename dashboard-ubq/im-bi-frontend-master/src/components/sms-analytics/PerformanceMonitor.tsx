import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Speed,
  Memory,
  Storage,
  Timeline,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
  Settings,
  ExpandMore,
  Wifi,
  Phone,
  Analytics,
  ClearAll,
  CloudSync,
  Notifications
} from '@mui/icons-material';
import { cacheManager, CacheStats } from '@/lib/cache';
import { useNotifications } from '@/lib/useNotifications';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiResponseTime: number;
  errorRate: number;
  offlineMode: boolean;
  serviceWorkerStatus: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'not_supported';
}

interface SystemHealth {
  overall: number;
  cache: number;
  network: number;
  performance: number;
  notifications: number;
}

// Component is now self-contained without external props
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    apiResponseTime: 0,
    errorRate: 0,
    offlineMode: false,
    serviceWorkerStatus: 'not_supported'
  });

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 0,
    cache: 0,
    network: 0,
    performance: 0,
    notifications: 0
  });

  const [optimizationsEnabled, setOptimizationsEnabled] = useState({
    cache: true,
    preload: true,
    compression: true,
    lazy: true,
    prefetch: true
  });

  const { getPermission, isSubscribed } = useNotifications();

  // Internal refresh function
  const handleRefreshData = () => {
    // Refresh cache stats
    setCacheStats(cacheManager.getStats());
    
    // Re-measure performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.round(loadTime),
      offlineMode: !navigator.onLine
    }));
  };

  // Performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      // Measure load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

      // Measure memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100 : 0;

      // Check service worker status
      let swStatus: PerformanceMetrics['serviceWorkerStatus'] = 'not_supported';
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            if (registration.installing) swStatus = 'installing';
            else if (registration.waiting) swStatus = 'installed';
            else if (registration.active) swStatus = 'activated';
          }
        });
      }

      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime),
        memoryUsage: Math.round(memoryUsage),
        serviceWorkerStatus: swStatus,
        offlineMode: !navigator.onLine
      }));
    };

    measurePerformance();

    // Update every 5 seconds
    const interval = setInterval(measurePerformance, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cache monitoring
  useEffect(() => {
    const updateCacheStats = () => {
      const stats = cacheManager.getStats();
      setCacheStats(stats);
    };

    updateCacheStats();
    
    // Update every 10 seconds
    const interval = setInterval(updateCacheStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate system health
  useEffect(() => {
    const calculateHealth = () => {
      const cacheHitRatio = cacheManager.getCacheHitRatio();
      const isOnline = navigator.onLine;
      const performanceScore = metrics.loadTime > 0 ? Math.max(0, 100 - (metrics.loadTime / 50)) : 0;
      const notificationPermission = getPermission();

      const health: SystemHealth = {
        cache: cacheHitRatio,
        network: isOnline ? 100 : 0,
        performance: performanceScore,
        notifications: notificationPermission === 'granted' ? 100 : notificationPermission === 'denied' ? 0 : 50,
        overall: 0
      };

      health.overall = (health.cache + health.network + health.performance + health.notifications) / 4;
      setSystemHealth(health);
    };

    calculateHealth();
  }, [metrics, cacheStats, getPermission]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle color="success" />;
    if (score >= 60) return <Warning color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const handleCacheClear = () => {
    cacheManager.invalidateAll();
    setCacheStats(cacheManager.getStats());
  };

  const handleOptimizationToggle = (key: keyof typeof optimizationsEnabled) => {
    setOptimizationsEnabled(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cacheHitRatio = cacheStats ? cacheManager.getCacheHitRatio() : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed color="primary" />
        Performance Monitor - Paso 6 Optimizaciones
      </Typography>

      {/* System Health Overview */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          🎯 System Health Score
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h2" fontWeight="bold" mr={2}>
                {Math.round(systemHealth.overall)}%
              </Typography>
              {getHealthIcon(systemHealth.overall)}
            </Box>
            <LinearProgress
              variant="determinate"
              value={systemHealth.overall}
              color={systemHealth.overall >= 80 ? 'success' : 'warning'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cache: {Math.round(systemHealth.cache)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Network: {Math.round(systemHealth.network)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Performance: {Math.round(systemHealth.performance)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Notifications: {Math.round(systemHealth.notifications)}%
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Load Time</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {metrics.loadTime}ms
              </Typography>
              <Chip
                label={metrics.loadTime < 2000 ? 'Excelente' : metrics.loadTime < 4000 ? 'Bueno' : 'Necesita mejora'}
                color={metrics.loadTime < 2000 ? 'success' : metrics.loadTime < 4000 ? 'warning' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Memory color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {metrics.memoryUsage.toFixed(1)}%
              </Typography>
              <Chip
                label={metrics.memoryUsage < 70 ? 'Normal' : metrics.memoryUsage < 85 ? 'Alto' : 'Crítico'}
                color={metrics.memoryUsage < 70 ? 'success' : metrics.memoryUsage < 85 ? 'warning' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Storage color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Cache Hit Ratio</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {cacheHitRatio.toFixed(1)}%
              </Typography>
              <Chip
                label={cacheHitRatio > 80 ? 'Excelente' : cacheHitRatio > 60 ? 'Bueno' : 'Bajo'}
                color={cacheHitRatio > 80 ? 'success' : cacheHitRatio > 60 ? 'warning' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Wifi color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Connection</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {metrics.offlineMode ? 'Offline' : 'Online'}
              </Typography>
              <Chip
                label={metrics.offlineMode ? 'Modo Offline' : 'Conectado'}
                color={metrics.offlineMode ? 'warning' : 'success'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cache Statistics */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">📦 Cache Performance (Paso 6)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {cacheStats && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cache Type</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Hits</TableCell>
                    <TableCell align="right">Misses</TableCell>
                    <TableCell align="right">Hit Ratio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(cacheStats).map(([type, stats]) => {
                    const hitRatio = stats.hits + stats.misses > 0 
                      ? (stats.hits / (stats.hits + stats.misses)) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell align="right">{stats.size}</TableCell>
                        <TableCell align="right">{stats.hits}</TableCell>
                        <TableCell align="right">{stats.misses}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${hitRatio.toFixed(1)}%`}
                            color={hitRatio > 80 ? 'success' : hitRatio > 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box mt={2} display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={handleRefreshData}
            >
              Refresh Stats
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearAll />}
              color="warning"
              onClick={handleCacheClear}
            >
              Clear All Cache
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Performance Optimizations */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">⚡ Performance Optimizations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Intelligent Caching"
                    secondary="LRU cache con TTL diferenciado por tipo de datos"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizationsEnabled.cache}
                        onChange={() => handleOptimizationToggle('cache')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Preloading"
                    secondary="Precarga de datos críticos en background"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizationsEnabled.preload}
                        onChange={() => handleOptimizationToggle('preload')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CloudSync />
                  </ListItemIcon>
                  <ListItemText
                    primary="Asset Compression"
                    secondary="Compresión gzip/brotli de recursos estáticos"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizationsEnabled.compression}
                        onChange={() => handleOptimizationToggle('compression')}
                      />
                    }
                    label=""
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Analytics />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lazy Loading"
                    secondary="Carga diferida de componentes no críticos"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizationsEnabled.lazy}
                        onChange={() => handleOptimizationToggle('lazy')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Resource Prefetching"
                    secondary="Prefetch de recursos para navegación anticipada"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optimizationsEnabled.prefetch}
                        onChange={() => handleOptimizationToggle('prefetch')}
                      />
                    }
                    label=""
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="PWA & Notifications"
                    secondary="Progressive Web App con notificaciones push"
                  />
                  <Chip
                    label={isSubscribed ? 'Activo' : 'Inactivo'}
                    color={isSubscribed ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Service Worker Status */}
      <Box mt={3}>
        <Alert 
          severity={
            metrics.serviceWorkerStatus === 'activated' ? 'success' :
            metrics.serviceWorkerStatus === 'not_supported' ? 'error' : 'info'
          }
          action={
            <Button color="inherit" size="small" onClick={handleRefreshData}>
              Refresh
            </Button>
          }
        >
          <Typography variant="subtitle1">
            Service Worker Status: {metrics.serviceWorkerStatus}
          </Typography>
          <Typography variant="body2">
            {metrics.serviceWorkerStatus === 'activated' && 'PWA funcionando correctamente con cache offline'}
            {metrics.serviceWorkerStatus === 'installing' && 'Instalando Service Worker...'}
            {metrics.serviceWorkerStatus === 'not_supported' && 'Service Worker no soportado en este navegador'}
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default PerformanceMonitor; 