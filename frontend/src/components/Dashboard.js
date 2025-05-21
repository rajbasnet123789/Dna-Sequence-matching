import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Grid, Button, Box } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import HistoryIcon from '@mui/icons-material/History';
import DnaIcon from '@mui/icons-material/Biotech';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="lg" className="container">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user?.username || 'User'}!
      </Typography>
      
      <Typography variant="body1" paragraph>
        This application allows you to compare DNA sequences from fluorescent chromatogram images.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/compare')}
          >
            <CompareIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Compare DNA Sequences
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Upload two DNA chromatogram images and compare their sequences using peak intensity analysis, KMP, and Rabin-Karp algorithms.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              startIcon={<CompareIcon />}
              onClick={() => navigate('/compare')}
            >
              Start Comparison
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                cursor: 'pointer'
              }
            }}
            onClick={() => navigate('/reports')}
          >
            <HistoryIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              View Report History
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Access your previous DNA comparison reports and analysis results.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/reports')}
            >
              View History
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DnaIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              DNA Analysis Features
            </Typography>
            <Box sx={{ textAlign: 'left', width: '100%' }}>
              <Typography variant="body2" paragraph>
                • Peak intensity-based sequence extraction
              </Typography>
              <Typography variant="body2" paragraph>
                • Chromatogram visualization
              </Typography>
              <Typography variant="body2" paragraph>
                • KMP pattern matching algorithm
              </Typography>
              <Typography variant="body2" paragraph>
                • Rabin-Karp pattern matching algorithm
              </Typography>
              <Typography variant="body2" paragraph>
                • Performance metrics and comparison
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
