
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Map, Activity, ShieldAlert, Settings, Radar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Airspace Map', icon: <Map />, path: '/dashboard' },
    { text: 'Radar View', icon: <Radar />, path: '/radar' },
    { text: 'Analytics', icon: <Activity />, path: '/analytics' },
    { text: 'Alerts', icon: <ShieldAlert />, path: '/alerts' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#121212', color: 'white' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1e1e1e',
            color: 'white',
            borderRight: '1px solid #333'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #333' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>AIRX CMD CENTER</Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem disablePadding key={item.text}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                sx={{ bgcolor: location.pathname === item.path ? '#333' : 'transparent' }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0, height: '100vh', overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
}
