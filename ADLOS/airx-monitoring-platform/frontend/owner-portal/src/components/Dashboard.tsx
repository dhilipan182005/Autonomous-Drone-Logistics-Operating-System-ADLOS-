import { Box, Typography, AppBar, Toolbar, Button, Paper } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Dashboard() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Dummy drone for demonstration
  const dronePosition: [number, number] = [28.6139, 77.2090]; // New Delhi

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ bgcolor: '#1e1e1e' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AIRX My Drones
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', gap: 3, height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Drone List Sidebar */}
          <Box sx={{ width: { xs: '100%', md: '25%' }, height: { xs: 'auto', md: '100%' } }}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>My Fleet</Typography>
              <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>AIRX-IND-TN-000001</Typography>
                <Typography variant="body2" color="text.secondary">Model: DJI Mavic 3</Typography>
                <Typography variant="body2" color="success.main">Status: ACTIVE</Typography>
                <Typography variant="body2">Battery: 85%</Typography>
              </Box>
            </Paper>
          </Box>
          
          {/* Map Area */}
          <Box sx={{ width: { xs: '100%', md: '75%' }, height: '100%' }}>
            <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden' }}>
              <MapContainer center={dronePosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={dronePosition}>
                  <Popup>AIRX-IND-TN-000001 (Active)</Popup>
                </Marker>
              </MapContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
