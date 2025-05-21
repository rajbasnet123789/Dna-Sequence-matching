import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Grid, Box, CircularProgress, Alert, Button, Divider, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:8000/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error fetching report details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="container">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="container">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="lg" className="container">
        <Alert severity="info">Report not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="container">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          sx={{ mr: 2 }}
        >
          Back to Reports
        </Button>
        <Typography variant="h4" component="h1">
          DNA Comparison Report #{report.id}
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Report ID:</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{report.id}</Typography>
            
            <Typography variant="subtitle1">Date Created:</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(report.created_at)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Image 1:</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{report.image1_name}</Typography>
            
            <Typography variant="subtitle1">Image 2:</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{report.image2_name}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Basic Sequence Comparison
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
          <Box sx={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: 'column',
            backgroundColor: '#e3f2fd',
            border: '4px solid #2196f3'
          }}>
            <Typography variant="h4">
              {report.peak_match_percentage.toFixed(2)}%
            </Typography>
            <Typography variant="body2">
              Match Rate
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Typography variant="subtitle1">
                {report.image1_name} (First 30 bases):
              </Typography>
              <Box className="sequence-display">
                {report.sequence1.slice(0, 30)}...
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Typography variant="subtitle1">
                {report.image2_name} (First 30 bases):
              </Typography>
              <Box className="sequence-display">
                {report.sequence2.slice(0, 30)}...
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                KMP Algorithm Results
              </Typography>
              <Chip 
                label="Complexity: O(n+m)" 
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TimerIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body1">
                Execution Time: <strong>{report.kmp_time.toFixed(6)} seconds</strong>
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SpeedIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="body1">
                Match Percentage: <strong>{report.kmp_match_percentage.toFixed(2)}%</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Rabin-Karp Algorithm Results
              </Typography>
              <Chip 
                label="Complexity: O(n*m) worst case, O(n+m) average" 
                color="secondary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TimerIcon sx={{ color: 'secondary.main', mr: 1 }} />
              <Typography variant="body1">
                Execution Time: <strong>{report.rabin_karp_time.toFixed(6)} seconds</strong>
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SpeedIcon sx={{ color: 'secondary.main', mr: 1 }} />
              <Typography variant="body1">
                Match Percentage: <strong>{report.rabin_karp_match_percentage.toFixed(2)}%</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/compare')}
        >
          Start New Comparison
        </Button>
      </Box>
    </Container>
  );
};

export default ReportDetail;
