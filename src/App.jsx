import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, IconButton, Tooltip, TextField, ToggleButton, ToggleButtonGroup, Divider
} from '@mui/material';
import { Search, DarkMode, LightMode, Clear, CheckCircle, Star, TrendingUp, ViewList, ViewModule } from '@mui/icons-material';
import { products } from './data/products';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';

function App() {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    const saved = localStorage.getItem('compareProducts');
    if (saved) setSelected(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('compareProducts', JSON.stringify(selected));
  }, [selected]);

  const toggleSelect = useCallback((product) => {
    setSelected(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const getMaxValue = (featureIndex) => {
    if (selected.length === 0) return 0;
    return Math.max(...selected.map(p => {
      const match = p.features[featureIndex] ? p.features[featureIndex].match(/[\d.]+/) : null;
      const val = match ? parseFloat(match[0]) : 0;
      return isNaN(val) ? 0 : val;
    }));
  };

  const getMinPrice = () => {
    return selected.length > 0 ? Math.min(...selected.map(p => p.price)) : 0;
  };

  const getMaxPrice = () => {
    return selected.length > 0 ? Math.max(...selected.map(p => p.price)) : 0;
  };

  const compareValues = (featureIndex) => {
    const values = selected.map(p => {
      const match = p.features[featureIndex] ? p.features[featureIndex].match(/[\d.]+/) : null;
      return match ? parseFloat(match[0]) : 0;
    });
    const max = Math.max(...values.filter(v => !isNaN(v)));
    const min = Math.min(...values.filter(v => !isNaN(v)));
    return { max, min, values };
  };

  const theme = createTheme({
    palette: { mode: darkMode ? 'dark' : 'light' }
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3">Smartphone Comparison</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
              }}
            />
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                color="primary"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: 1,
                }}
                aria-label="toggle theme"
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredProducts.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer', 
                  ...(selected.find(p => p.id === product.id) && { border: '2px solid #1976d2' }) 
                }}
                role="button" 
                tabIndex={0} 
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleSelect(product)}
                onClick={() => toggleSelect(product)} 
                aria-label={`Select ${product.name}`}
              >
                <CardMedia component="img" height="200" image={product.image} alt={product.name} />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.brand} {product.name}
                  </Typography>
                  <Typography variant="h5" color="primary">
                    ₹{product.price}
                  </Typography>
                  {product.features.map((feature, i) => (
                    <Chip key={i} label={feature} size="small" sx={{ m: 0.5 }} />
                  ))}
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={selected.find(p => p.id === product.id) ? <Clear /> : <Search />} 
                    sx={{ mt: 2 }}
                  >
                    {selected.find(p => p.id === product.id) ? 'Remove' : 'Add to Compare'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selected.length >= 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">Comparison View</Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="table" aria-label="table view">
                  <ViewList sx={{ mr: 1 }} /> Table
                </ToggleButton>
                <ToggleButton value="cards" aria-label="card view">
                  <ViewModule sx={{ mr: 1 }} /> Cards
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Attribute</TableCell>
                      {selected.map(p => (
                        <TableCell key={p.id} align="center" sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <CardMedia 
                              component="img" 
                              sx={{ width: 80, height: 100, objectFit: 'contain' }} 
                              image={p.image} 
                              alt={p.name} 
                            />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {p.brand}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {p.name}
                            </Typography>
                            <Chip 
                              label={`₹${p.price}`} 
                              color={p.price === getMinPrice() ? 'success' : p.price === getMaxPrice() ? 'default' : 'primary'}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                      {selected.map(p => {
                        const isBest = p.price === getMinPrice();
                        const isWorst = p.price === getMaxPrice();
                        return (
                          <TableCell 
                            key={p.id} 
                            align="center"
                            sx={{
                              bgcolor: isBest ? 'success.light' : isWorst ? 'error.light' : 'background.paper',
                              position: 'relative'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Typography variant="h6" color={isBest ? 'success.dark' : 'text.primary'}>
                                ₹{p.price}
                              </Typography>
                              {isBest && <CheckCircle color="success" fontSize="small" />}
                              {isWorst && selected.length > 2 && <Star color="error" fontSize="small" />}
                            </Box>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {['Screen', 'Camera', 'Battery'].map((attr, i) => {
                      const comparison = compareValues(i);
                      return (
                        <TableRow key={attr}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{attr}</TableCell>
                          {selected.map((p, idx) => {
                            const match = p.features[i] ? p.features[i].match(/[\d.]+/) : null;
                            const val = match ? parseFloat(match[0]) : 0;
                            const isMax = !isNaN(val) && val === comparison.max && comparison.max !== comparison.min;
                            const isMin = !isNaN(val) && val === comparison.min && comparison.max !== comparison.min && selected.length > 2;
                            return (
                              <TableCell 
                                key={p.id} 
                                align="center"
                                sx={{
                                  bgcolor: isMax ? 'success.light' : isMin ? 'error.light' : 'background.paper',
                                  fontWeight: isMax ? 'bold' : 'normal'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <Typography>{p.features[i]}</Typography>
                                  {isMax && <CheckCircle color="success" fontSize="small" />}
                                  {isMax && <TrendingUp color="success" fontSize="small" />}
                                  {isMin && selected.length > 2 && <Star color="error" fontSize="small" />}
                                </Box>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {selected.map(product => (
                  <Grid item xs={12} md={6} lg={12 / selected.length} key={product.id}>
                    <Card sx={{ height: '100%', position: 'relative' }}>
                      <CardMedia 
                        component="img" 
                        height="250" 
                        image={product.image} 
                        alt={product.name}
                        sx={{ objectFit: 'contain', p: 2 }}
                      />
                      <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {product.brand} {product.name}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={`₹${product.price}`} 
                            color={product.price === getMinPrice() ? 'success' : product.price === getMaxPrice() ? 'default' : 'primary'}
                            icon={product.price === getMinPrice() ? <CheckCircle /> : undefined}
                            sx={{ fontSize: '1.1rem', height: 32 }}
                          />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {['Screen', 'Camera', 'Battery'].map((attr, i) => {
                          const match = product.features[i] ? product.features[i].match(/[\d.]+/) : null;
                          const val = match ? parseFloat(match[0]) : 0;
                          const comparison = compareValues(i);
                          const isMax = !isNaN(val) && val === comparison.max && comparison.max !== comparison.min;
                          const isMin = !isNaN(val) && val === comparison.min && comparison.max !== comparison.min && selected.length > 2;
                          return (
                            <Box 
                              key={attr}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: isMax ? 'success.light' : isMin ? 'error.light' : 'action.hover',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {attr}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: isMax ? 'bold' : 'normal' }}>
                                  {product.features[i]}
                                </Typography>
                              </Box>
                              {isMax && (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <CheckCircle color="success" fontSize="small" />
                                  <TrendingUp color="success" fontSize="small" />
                                </Box>
                              )}
                              {isMin && selected.length > 2 && (
                                <Star color="error" fontSize="small" />
                              )}
                            </Box>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Button 
              variant="contained" 
              onClick={() => setSelected([])} 
              startIcon={<Clear />} 
              sx={{ mt: 2 }}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
