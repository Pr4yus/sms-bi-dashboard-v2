'use client';

import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  Speed as SpeedIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: string;
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard Ejecutivo',
    icon: <DashboardIcon />,
    path: '/sms-analytics?tab=0',
    description: 'Vista consolidada regional'
  },
  {
    text: 'Métricas Empresariales',
    icon: <BusinessIcon />,
    path: '/sms-analytics?tab=1',
    description: 'Análisis por empresa'
  },
  {
    text: 'KPIs Dashboard',
    icon: <TrendingUpIcon />,
    path: '/sms-analytics?tab=2',
    description: 'Indicadores clave'
  },
  {
    text: 'Análisis por Países',
    icon: <PublicIcon />,
    path: '/sms-analytics?tab=3',
    description: 'Vista geográfica'
  },
  {
    text: 'Performance Monitor',
    icon: <SpeedIcon />,
    path: '/sms-analytics?tab=4',
    badge: 'PWA',
    description: 'Optimizaciones en tiempo real'
  },
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const drawerContent = (
    <Box sx={{ width: collapsed ? 80 : drawerWidth, transition: 'width 0.3s' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          minHeight: 80,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
              <AnalyticsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                SMS Analytics
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Enterprise Dashboard
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
            <AnalyticsIcon />
          </Avatar>
        )}
        <IconButton
          onClick={toggleCollapsed}
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = pathname.includes('/sms-analytics') && 
                          item.path.includes(`tab=${index}`);
          
          return (
            <ListItem key={item.text} sx={{ px: collapsed ? 1 : 2, py: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                  },
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1 : 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'primary.main',
                    minWidth: collapsed ? 'unset' : 40,
                    mr: collapsed ? 0 : 1,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={item.text}
                      secondary={item.description}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? 'white' : 'inherit',
                        },
                        '& .MuiListItemText-secondary': {
                          color: isActive ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'secondary.main',
                          color: isActive ? 'white' : 'white',
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Secondary Actions */}
      <List sx={{ px: collapsed ? 1 : 2 }}>
        <ListItem sx={{ px: 0, py: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              justifyContent: collapsed ? 'center' : 'initial',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                color: 'text.secondary',
                minWidth: collapsed ? 'unset' : 40,
                mr: collapsed ? 0 : 1,
              }}
            >
              <NotificationsIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Notificaciones"
                secondary="Configurar alertas"
                sx={{
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        <ListItem sx={{ px: 0, py: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              justifyContent: collapsed ? 'center' : 'initial',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                color: 'text.secondary',
                minWidth: collapsed ? 'unset' : 40,
                mr: collapsed ? 0 : 1,
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Configuración"
                secondary="Preferencias del sistema"
                sx={{
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        <ListItem sx={{ px: 0, py: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 2,
              justifyContent: collapsed ? 'center' : 'initial',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                color: 'text.secondary',
                minWidth: collapsed ? 'unset' : 40,
                mr: collapsed ? 0 : 1,
              }}
            >
              <HelpIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Ayuda"
                secondary="Documentación y soporte"
                sx={{
                  '& .MuiListItemText-secondary': {
                    fontSize: '0.75rem',
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      {!collapsed && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            SMS Analytics v2.0
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            PWA Enterprise Dashboard
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={false} // This would be controlled by a state from parent
        onClose={() => {}} // This would be handled by parent
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 80 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 80 : drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          position: 'relative',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 