import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';

interface AccountInfo {
  id: string;
  name: string;
  status: string;
  classification: {
    level: 'BAJO' | 'ADECUADO' | 'ALTO' | 'CRÍTICO';
    color: 'danger' | 'info' | 'success' | 'warning';
    recommendation: string;
    priority: number;
  };
  usage_metrics: {
    currentUsagePercentage: number;
    currentUsage: number;
    currentBalance: number;
    averageMonthlyUsage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    efficiency: number;
  };
  package_info?: {
    id: string | number;
    name: string;
    credit_limit: number;
    price?: number;
  };
  last_updated: string;
}

interface AccountsTableProps {
  accounts: AccountInfo[];
  loading?: boolean;
  onAccountClick?: (accountId: string) => void;
}

const getClassificationColor = (level: string) => {
  switch (level) {
    case 'BAJO': return 'error';
    case 'ADECUADO': return 'info';
    case 'ALTO': return 'success';
    case 'CRÍTICO': return 'warning';
    default: return 'default';
  }
};

const getClassificationIcon = (level: string) => {
  switch (level) {
    case 'BAJO': return <ErrorIcon fontSize="small" />;
    case 'ADECUADO': return <Info fontSize="small" />;
    case 'ALTO': return <CheckCircle fontSize="small" />;
    case 'CRÍTICO': return <Warning fontSize="small" />;
    default: return <Info fontSize="small" />;
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return <TrendingUp color="success" fontSize="small" />;
    case 'decreasing': return <TrendingDown color="error" fontSize="small" />;
    case 'stable': return <Remove color="info" fontSize="small" />;
    default: return <Remove color="info" fontSize="small" />;
  }
};

const getUsageProgressColor = (percentage: number): 'primary' | 'warning' | 'error' | 'success' => {
  if (percentage <= 30) return 'error';      // BAJO
  if (percentage <= 70) return 'primary';    // ADECUADO
  if (percentage <= 90) return 'success';    // ALTO
  return 'warning';                          // CRÍTICO
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-GT').format(num);
};

const AccountRow: React.FC<{
  account: AccountInfo;
  onAccountClick?: (accountId: string) => void;
}> = ({ account, onAccountClick }) => {
  return (
    <TableRow 
      hover 
      sx={{ 
        cursor: onAccountClick ? 'pointer' : 'default',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
      onClick={() => onAccountClick?.(account.id)}
    >
      {/* Account Info */}
      <TableCell>
        <Box display="flex" alignItems="center">
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 2,
              bgcolor: `${getClassificationColor(account.classification.level)}.main`
            }}
          >
            {getClassificationIcon(account.classification.level)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {account.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              ID: {account.id.substring(0, 8)}...
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Classification */}
      <TableCell>
        <Tooltip title={account.classification.recommendation}>
          <Chip
            icon={getClassificationIcon(account.classification.level)}
            label={account.classification.level}
            color={getClassificationColor(account.classification.level) as any}
            size="small"
            variant="filled"
          />
        </Tooltip>
      </TableCell>

      {/* Usage Percentage */}
      <TableCell align="right">
        <Box sx={{ minWidth: 100 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="bold">
              {account.usage_metrics.currentUsagePercentage}%
            </Typography>
            <Box display="flex" alignItems="center">
              {getTrendIcon(account.usage_metrics.trend)}
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(account.usage_metrics.currentUsagePercentage, 100)}
            color={getUsageProgressColor(account.usage_metrics.currentUsagePercentage)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </TableCell>

      {/* Current Usage */}
      <TableCell align="right">
        <Typography variant="body2" fontWeight="bold">
          {formatNumber(account.usage_metrics.currentUsage)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          SMS usados
        </Typography>
      </TableCell>

      {/* Balance */}
      <TableCell align="right">
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={account.usage_metrics.currentBalance >= 0 ? 'success.main' : 'error.main'}
        >
          {formatNumber(account.usage_metrics.currentBalance)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Balance
        </Typography>
      </TableCell>

      {/* Package Info */}
      <TableCell>
        {account.package_info ? (
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {account.package_info.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatNumber(account.package_info.credit_limit)} SMS
              {account.package_info.price && ` - Q${account.package_info.price}`}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sin paquete
          </Typography>
        )}
      </TableCell>

      {/* Monthly Average */}
      <TableCell align="right">
        <Typography variant="body2">
          {formatNumber(account.usage_metrics.averageMonthlyUsage)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Promedio/mes
        </Typography>
      </TableCell>

      {/* Efficiency */}
      <TableCell align="right">
        <Typography 
          variant="body2" 
          fontWeight="bold"
          color={account.usage_metrics.efficiency >= 70 ? 'success.main' : 
                 account.usage_metrics.efficiency >= 50 ? 'warning.main' : 'error.main'}
        >
          {account.usage_metrics.efficiency.toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Eficiencia
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          label={account.status}
          color={account.status === 'ACTIVE' ? 'success' : 'default'}
          variant="outlined"
          size="small"
        />
      </TableCell>
    </TableRow>
  );
};

export const AccountsTable: React.FC<AccountsTableProps> = ({ 
  accounts, 
  loading = false, 
  onAccountClick 
}) => {
  if (loading) {
    return (
      <Paper>
        <Box p={4} textAlign="center">
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Cargando cuentas...</Typography>
        </Box>
      </Paper>
    );
  }

  if (accounts.length === 0) {
    return (
      <Paper>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            No se encontraron cuentas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Cuenta
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Clasificación
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Uso %
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              SMS Actuales
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Balance
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Paquete
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Promedio Mensual
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Eficiencia
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
              Estado
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onAccountClick={onAccountClick}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountsTable; 