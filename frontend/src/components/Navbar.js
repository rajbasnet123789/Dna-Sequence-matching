import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
            DNA Sequence Comparison
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{ 
                mx: 1,
                fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/dashboard' ? '2px solid white' : 'none'
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/compare"
              startIcon={<CompareIcon />}
              sx={{ 
                mx: 1,
                fontWeight: location.pathname === '/compare' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/compare' ? '2px solid white' : 'none'
              }}
            >
              Compare
            </Button>
            
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/reports"
              startIcon={<HistoryIcon />}
              sx={{ 
                mx: 1,
                fontWeight: location.pathname === '/reports' ? 'bold' : 'normal',
                borderBottom: location.pathname === '/reports' ? '2px solid white' : 'none'
              }}
            >
              History
            </Button>
            
            <Box sx={{ borderLeft: '1px solid rgba(255,255,255,0.5)', height: '24px', mx: 2 }} />
            
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.username || ''}
            </Typography>
            
            <Button 
              color="inherit" 
              onClick={onLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
