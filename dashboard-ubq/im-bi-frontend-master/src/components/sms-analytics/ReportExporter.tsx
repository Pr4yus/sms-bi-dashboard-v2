import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Box,
  Grid,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  InsertChart,
  Email,
  Schedule,
  FilterList
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  reportType: 'summary' | 'detailed' | 'charts' | 'custom';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  countries: string[];
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeAccountDetails: boolean;
  includePredictions: boolean;
  customFields: string[];
  emailDelivery: boolean;
  emailRecipients: string[];
  scheduledExport: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

interface ReportExporterProps {
  open: boolean;
  onClose: () => void;
  countries: string[];
  onExport: (options: ExportOptions) => Promise<void>;
}

const defaultExportOptions: ExportOptions = {
  format: 'pdf',
  reportType: 'summary',
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  },
  countries: [],
  includeCharts: true,
  includeRecommendations: true,
  includeAccountDetails: false,
  includePredictions: false,
  customFields: [],
  emailDelivery: false,
  emailRecipients: [],
  scheduledExport: false
};

const availableFields = [
  'usage_metrics',
  'classification_distribution',
  'efficiency_scores',
  'cost_analysis',
  'trend_analysis',
  'alerts_summary',
  'business_metrics',
  'account_list'
];

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

export const ReportExporter: React.FC<ReportExporterProps> = ({
  open,
  onClose,
  countries,
  onExport
}) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);
  const [isExporting, setIsExporting] = useState(false);
  const [newEmailRecipient, setNewEmailRecipient] = useState('');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(options);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddEmailRecipient = () => {
    if (newEmailRecipient && newEmailRecipient.includes('@')) {
      setOptions(prev => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, newEmailRecipient]
      }));
      setNewEmailRecipient('');
    }
  };

  const handleRemoveEmailRecipient = (email: string) => {
    setOptions(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter(e => e !== email)
    }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PictureAsPdf />;
      case 'excel': return <TableChart />;
      case 'csv': return <TableChart />;
      case 'json': return <InsertChart />;
      default: return <Download />;
    }
  };

  const getEstimatedSize = () => {
    let baseSize = 0;
    
    // Base size by format
    switch (options.format) {
      case 'pdf': baseSize = 2; break;
      case 'excel': baseSize = 1; break;
      case 'csv': baseSize = 0.5; break;
      case 'json': baseSize = 0.3; break;
    }
    
    // Multiply by countries
    baseSize *= options.countries.length || 1;
    
    // Add for charts and details
    if (options.includeCharts) baseSize *= 1.5;
    if (options.includeAccountDetails) baseSize *= 2;
    if (options.includePredictions) baseSize *= 1.3;
    
    return Math.max(0.1, baseSize).toFixed(1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download color="primary" />
          Exportar Reportes SMS Analytics
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Format Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Formato</InputLabel>
                <Select
                  value={options.format}
                  label="Formato"
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                >
                  <MenuItem value="pdf">
                    <Box display="flex" alignItems="center" gap={1}>
                      <PictureAsPdf color="error" />
                      PDF - Reporte visual completo
                    </Box>
                  </MenuItem>
                  <MenuItem value="excel">
                    <Box display="flex" alignItems="center" gap={1}>
                      <TableChart color="success" />
                      Excel - Datos analizables
                    </Box>
                  </MenuItem>
                  <MenuItem value="csv">
                    <Box display="flex" alignItems="center" gap={1}>
                      <TableChart color="info" />
                      CSV - Datos sin formato
                    </Box>
                  </MenuItem>
                  <MenuItem value="json">
                    <Box display="flex" alignItems="center" gap={1}>
                      <InsertChart color="warning" />
                      JSON - Datos técnicos
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Report Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={options.reportType}
                  label="Tipo de Reporte"
                  onChange={(e) => setOptions(prev => ({ ...prev, reportType: e.target.value as any }))}
                >
                  <MenuItem value="summary">Resumen Ejecutivo</MenuItem>
                  <MenuItem value="detailed">Análisis Detallado</MenuItem>
                  <MenuItem value="charts">Solo Gráficas</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Inicio"
                value={options.dateRange.from}
                onChange={(date) => setOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, from: date }
                }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha Fin"
                value={options.dateRange.to}
                onChange={(date) => setOptions(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, to: date }
                }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            {/* Countries Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Países</InputLabel>
                <Select
                  multiple
                  value={options.countries}
                  label="Países"
                  onChange={(e) => setOptions(prev => ({ ...prev, countries: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={getCountryDisplayName(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="all">
                    <Checkbox checked={options.countries.length === countries.length} />
                    Todos los países
                  </MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      <Checkbox checked={options.countries.indexOf(country) > -1} />
                      {getCountryDisplayName(country)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Content Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contenido del Reporte
              </Typography>
              <FormGroup>
                <Grid container>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={options.includeCharts}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                        />
                      }
                      label="Incluir Gráficas"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={options.includeRecommendations}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                        />
                      }
                      label="Incluir Recomendaciones"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={options.includeAccountDetails}
                          onChange={(e) => setOptions(prev => ({ ...prev, includeAccountDetails: e.target.checked }))}
                        />
                      }
                      label="Detalles de Cuentas"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={options.includePredictions}
                          onChange={(e) => setOptions(prev => ({ ...prev, includePredictions: e.target.checked }))}
                        />
                      }
                      label="Predicciones"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Grid>

            {/* Custom Fields (if custom report type) */}
            {options.reportType === 'custom' && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Campos Personalizados
                </Typography>
                <FormControl fullWidth>
                  <Select
                    multiple
                    value={options.customFields}
                    onChange={(e) => setOptions(prev => ({ ...prev, customFields: e.target.value as string[] }))}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value.replace('_', ' ')} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {availableFields.map((field) => (
                      <MenuItem key={field} value={field}>
                        <Checkbox checked={options.customFields.indexOf(field) > -1} />
                        {field.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Email Delivery */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.emailDelivery}
                    onChange={(e) => setOptions(prev => ({ ...prev, emailDelivery: e.target.checked }))}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email />
                    Enviar por Email
                  </Box>
                }
              />
            </Grid>

            {options.emailDelivery && (
              <Grid item xs={12}>
                <Box>
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email del destinatario"
                      value={newEmailRecipient}
                      onChange={(e) => setNewEmailRecipient(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddEmailRecipient();
                        }
                      }}
                    />
                    <Button onClick={handleAddEmailRecipient} variant="outlined">
                      Agregar
                    </Button>
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {options.emailRecipients.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        onDelete={() => handleRemoveEmailRecipient(email)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Scheduled Export */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.scheduledExport}
                    onChange={(e) => setOptions(prev => ({ ...prev, scheduledExport: e.target.checked }))}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Schedule />
                    Programar Exportación Automática
                  </Box>
                }
              />
            </Grid>

            {options.scheduledExport && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Frecuencia</InputLabel>
                  <Select
                    value={options.frequency || 'weekly'}
                    label="Frecuencia"
                    onChange={(e) => setOptions(prev => ({ ...prev, frequency: e.target.value as any }))}
                  >
                    <MenuItem value="daily">Diario</MenuItem>
                    <MenuItem value="weekly">Semanal</MenuItem>
                    <MenuItem value="monthly">Mensual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Export Summary */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<FilterList />}>
                <Typography variant="subtitle2" gutterBottom>
                  Resumen de Exportación:
                </Typography>
                <Typography variant="body2">
                  • Formato: <strong>{options.format.toUpperCase()}</strong><br/>
                  • Países: <strong>{options.countries.length || 'Todos'}</strong><br/>
                  • Tamaño estimado: <strong>~{getEstimatedSize()} MB</strong><br/>
                  • Entrega: <strong>{options.emailDelivery ? 'Email' : 'Descarga directa'}</strong>
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={isExporting || options.countries.length === 0}
            startIcon={isExporting ? <CircularProgress size={20} /> : getFormatIcon(options.format)}
          >
            {isExporting ? 'Exportando...' : 'Exportar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReportExporter; 