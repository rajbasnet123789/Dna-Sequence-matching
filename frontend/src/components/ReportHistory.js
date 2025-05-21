import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Grid, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:8000/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setReports(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error fetching reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Container maxWidth="lg" className="container">
      <Typography variant="h4" component="h1" gutterBottom>
        DNA Comparison Report History
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            No comparison reports found
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Start comparing DNA sequences to create reports.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Report ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Image 1</TableCell>
                <TableCell>Image 2</TableCell>
                <TableCell>Peak Match</TableCell>
                <TableCell>KMP Match</TableCell>
                <TableCell>Rabin-Karp Match</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow 
                  key={report.id}
                  hover
                  onClick={() => handleViewReport(report.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{formatDate(report.created_at)}</TableCell>
                  <TableCell>{report.image1_name}</TableCell>
                  <TableCell>{report.image2_name}</TableCell>
                  <TableCell>{report.peak_match_percentage.toFixed(2)}%</TableCell>
                  <TableCell>{report.kmp_match_percentage.toFixed(2)}%</TableCell>
                  <TableCell>{report.rabin_karp_match_percentage.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'primary.main'
                      }}
                    >
                      <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                      View Details
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ReportHistory;
