import React, { useState } from 'react';
import { Container, Typography, Paper, Grid, Button, Box, CircularProgress, Alert, Divider, Chip } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';

const ComparisonPage = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('upload'); // upload, peak_intensity, algorithms
  const [comparisonResult, setComparisonResult] = useState(null);
  const [algorithmResult, setAlgorithmResult] = useState(null);

  const handleFileChange = (e, fileNum) => {
    if (e.target.files.length > 0) {
      if (fileNum === 1) {
        setFile1(e.target.files[0]);
      } else {
        setFile2(e.target.files[0]);
      }
    }
  };

  const handlePeakIntensityComparison = async () => {
    if (!file1 || !file2) {
      setError('Please select two DNA chromatogram images to compare');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);

      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8000/dna/compare', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setComparisonResult(response.data);
      setStage('peak_intensity');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error comparing DNA sequences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAlgorithmComparison = async () => {
    if (!comparisonResult) {
      setError('Please perform peak intensity comparison first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('seq1', comparisonResult.image1.dna_sequence);
      formData.append('seq2', comparisonResult.image2.dna_sequence);
      formData.append('image1_name', comparisonResult.image1.filename);
      formData.append('image2_name', comparisonResult.image2.filename);

      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8000/dna/compare/algorithms', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAlgorithmResult(response.data);
      setStage('algorithms');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error comparing DNA sequences with algorithms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadStage = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Upload First DNA Chromatogram
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="file1-upload"
              type="file"
              onChange={(e) => handleFileChange(e, 1)}
            />
            <label htmlFor="file1-upload">
              <Button variant="contained" component="span">
                Select Image 1
              </Button>
            </label>
            {file1 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected: {file1.name}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Upload Second DNA Chromatogram
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="file2-upload"
              type="file"
              onChange={(e) => handleFileChange(e, 2)}
            />
            <label htmlFor="file2-upload">
              <Button variant="contained" component="span">
                Select Image 2
              </Button>
            </label>
            {file2 && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected: {file2.name}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CompareIcon />}
            onClick={handlePeakIntensityComparison}
            disabled={!file1 || !file2 || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Compare DNA Sequences'}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );

  const renderPeakIntensityStage = () => {
    if (!comparisonResult) return null;
    
    const { image1, image2 } = comparisonResult;
    
    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Peak Intensity Comparison Results
          </Typography>
          <Typography variant="body1">
            Below are the results of the peak intensity-based DNA sequence extraction from both chromatograms.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {image1.filename}
              </Typography>
              
              <img 
                src={`data:image/png;base64,${image1.chromatogram}`} 
                alt="Chromatogram 1" 
                className="chromatogram-image" 
              />
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                DNA Sequence (First 50 bases):
              </Typography>
              <Box className="sequence-display">
                {image1.dna_sequence.slice(0, 50)}...
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Nucleotide Counts:
              </Typography>
              <Box className="nucleotide-counts">
                <Box className="count-box adenine">
                  <Typography variant="h6">{image1.nucleotide_counts.A}</Typography>
                  <Typography variant="body2">Adenine (A)</Typography>
                </Box>
                <Box className="count-box thymine">
                  <Typography variant="h6">{image1.nucleotide_counts.T}</Typography>
                  <Typography variant="body2">Thymine (T)</Typography>
                </Box>
                <Box className="count-box cytosine">
                  <Typography variant="h6">{image1.nucleotide_counts.C}</Typography>
                  <Typography variant="body2">Cytosine (C)</Typography>
                </Box>
                <Box className="count-box guanine">
                  <Typography variant="h6">{image1.nucleotide_counts.G}</Typography>
                  <Typography variant="body2">Guanine (G)</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {image2.filename}
              </Typography>
              
              <img 
                src={`data:image/png;base64,${image2.chromatogram}`} 
                alt="Chromatogram 2" 
                className="chromatogram-image" 
              />
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                DNA Sequence (First 50 bases):
              </Typography>
              <Box className="sequence-display">
                {image2.dna_sequence.slice(0, 50)}...
              </Box>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Nucleotide Counts:
              </Typography>
              <Box className="nucleotide-counts">
                <Box className="count-box adenine">
                  <Typography variant="h6">{image2.nucleotide_counts.A}</Typography>
                  <Typography variant="body2">Adenine (A)</Typography>
                </Box>
                <Box className="count-box thymine">
                  <Typography variant="h6">{image2.nucleotide_counts.T}</Typography>
                  <Typography variant="body2">Thymine (T)</Typography>
                </Box>
                <Box className="count-box cytosine">
                  <Typography variant="h6">{image2.nucleotide_counts.C}</Typography>
                  <Typography variant="body2">Cytosine (C)</Typography>
                </Box>
                <Box className="count-box guanine">
                  <Typography variant="h6">{image2.nucleotide_counts.G}</Typography>
                  <Typography variant="body2">Guanine (G)</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<CompareIcon />}
                onClick={handleAlgorithmComparison}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Compare Using KMP and Rabin-Karp Algorithms'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderAlgorithmStage = () => {
    if (!algorithmResult || !comparisonResult) return null;
    
    const { comparison } = algorithmResult;
    const { image1, image2 } = comparisonResult;
    
    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Algorithm Comparison Results
          </Typography>
          <Typography variant="body1">
            Below are the results of comparing the DNA sequences using KMP and Rabin-Karp algorithms.
          </Typography>
        </Box>
        
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
                {comparison.basic_match_percentage.toFixed(2)}%
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
                  {image1.filename} (First 30 bases):
                </Typography>
                <Box className="sequence-display">
                  {comparisonResult.image1.dna_sequence.slice(0, 30)}...
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="subtitle1">
                  {image2.filename} (First 30 bases):
                </Typography>
                <Box className="sequence-display">
                  {comparisonResult.image2.dna_sequence.slice(0, 30)}...
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
                  label={`Complexity: ${comparison.kmp.complexity}`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimerIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Execution Time: <strong>{comparison.kmp.time_taken.toFixed(6)} seconds</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SpeedIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body1">
                  Match Percentage: <strong>{comparison.kmp.match_percentage.toFixed(2)}%</strong>
                </Typography>
              </Box>
              
              <Typography variant="subtitle1">
                Pattern Matches Found: {comparison.kmp.matches.length}
              </Typography>
              
              {comparison.kmp.matches.length > 0 ? (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '150px', overflow: 'auto' }}>
                  <Typography variant="body2">
                    Match positions: {comparison.kmp.matches.slice(0, 10).join(', ')}
                    {comparison.kmp.matches.length > 10 ? '...' : ''}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>No pattern matches found</Alert>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Rabin-Karp Algorithm Results
                </Typography>
                <Chip 
                  label={`Complexity: ${comparison.rabin_karp.complexity}`} 
                  color="secondary" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimerIcon sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="body1">
                  Execution Time: <strong>{comparison.rabin_karp.time_taken.toFixed(6)} seconds</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SpeedIcon sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="body1">
                  Match Percentage: <strong>{comparison.rabin_karp.match_percentage.toFixed(2)}%</strong>
                </Typography>
              </Box>
              
              <Typography variant="subtitle1">
                Pattern Matches Found: {comparison.rabin_karp.matches.length}
              </Typography>
              
              {comparison.rabin_karp.matches.length > 0 ? (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: '4px', maxHeight: '150px', overflow: 'auto' }}>
                  <Typography variant="body2">
                    Match positions: {comparison.rabin_karp.matches.slice(0, 10).join(', ')}
                    {comparison.rabin_karp.matches.length > 10 ? '...' : ''}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>No pattern matches found</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setStage('upload');
              setFile1(null);
              setFile2(null);
              setComparisonResult(null);
              setAlgorithmResult(null);
            }}
          >
            Start New Comparison
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="lg" className="container">
      <Typography variant="h4" component="h1" gutterBottom>
        DNA Sequence Comparison
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {stage === 'upload' && renderUploadStage()}
      {stage === 'peak_intensity' && renderPeakIntensityStage()}
      {stage === 'algorithms' && renderAlgorithmStage()}
    </Container>
  );
};

export default ComparisonPage;
