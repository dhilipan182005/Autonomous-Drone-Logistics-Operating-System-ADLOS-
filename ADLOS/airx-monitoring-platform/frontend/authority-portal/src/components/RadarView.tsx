
import { Box, Typography } from '@mui/material';

export default function RadarView() {
  return (
    <Box sx={{ height: '100%', bgcolor: '#001a00', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        border: '2px solid #00ff00',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(0,255,0,0.2)',
      }}>
        {/* Radar Rings */}
        <Box sx={{ position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%', border: '1px solid rgba(0,255,0,0.3)', borderRadius: '50%' }} />
        <Box sx={{ position: 'absolute', top: '0', bottom: '0', left: '50%', borderLeft: '1px solid rgba(0,255,0,0.3)' }} />
        <Box sx={{ position: 'absolute', left: '0', right: '0', top: '50%', borderTop: '1px solid rgba(0,255,0,0.3)' }} />
        
        {/* Simulated Radar Sweep */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '400px',
          height: '2px',
          bgcolor: 'rgba(0, 255, 0, 0.5)',
          transformOrigin: '0 50%',
          animation: 'sweep 4s infinite linear',
          boxShadow: '0 0 10px #0f0, 0 0 20px #0f0',
        }} />
      </Box>
      <Typography variant="h6" color="#00ff00" sx={{ position: 'absolute', top: 20, left: 20, fontFamily: 'monospace' }}>
        RADAR MONITORING - AUTHORITY ONLY
      </Typography>
      <style>
        {`
          @keyframes sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}
