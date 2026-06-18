
import { Box, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center: [number, number] = [28.5562, 77.1000]; // Delhi Airport

export default function Dashboard() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: '75%', width: '100%', position: 'relative' }}>
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%', backgroundColor: '#242f3e' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          {/* Airport Rings */}
          <Circle center={center} radius={5000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />
          <Circle center={center} radius={12000} pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.1 }} />
          
          <Marker position={[28.58, 77.15]}>
            <Popup>AIRX-IND-TN-000001 <br/> Altitude: 120m <br/> Speed: 15m/s</Popup>
          </Marker>
        </MapContainer>
      </Box>
      <Box sx={{ height: '25%', bgcolor: '#121212', p: 2, borderTop: '2px solid #333' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333' }}>
              <Typography variant="subtitle2" color="text.secondary">Active Drones</Typography>
              <Typography variant="h4">124</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333' }}>
              <Typography variant="subtitle2" color="text.secondary">Critical Alerts</Typography>
              <Typography variant="h4" color="error">2</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333' }}>
              <Typography variant="subtitle2" color="text.secondary">Zone Violations</Typography>
              <Typography variant="h4" color="warning.main">5</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333' }}>
              <Typography variant="subtitle2" color="text.secondary">System Status</Typography>
              <Typography variant="h4" color="success.main">OPERATIONAL</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
