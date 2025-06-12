import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Paper, Button, Divider, Tooltip, TextField, Chip, GlobalStyles, Tabs, Tab, Autocomplete } from '@mui/material';
import UnitCard from './components/UnitCard';
import UnitDetails from './components/UnitDetails';
import StrategyDisplay from './components/StrategyDisplay';
import { UnitsData } from './types/unit';

// MatchupMaster Brand Colors
const brandColors = {
  bgBase: '#0B1120',
  surface: '#151D2E',
  accentPrimary: '#1DF0CF',
  accentSecondary: '#8A2BE2',
  neutralLight: '#E2E8F0',
  neutralMid: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B'
};

// Unit stats for breakpoint analysis
const unitStats: Record<string, { hp: number; damage: number }> = {
  'Crawler': { hp: 277, damage: 79 },
  'Factory': { hp: 146782, damage: 28736 },
  'Rhino': { hp: 19297, damage: 3560 },
  'Mountain': { hp: 180763, damage: 22472 },
  'Sabertooth': { hp: 15541, damage: 7858 },
  'Ray': { hp: 3159, damage: 2174 },
  'Hacker': { hp: 3249, damage: 585 },
  'Stormcaller': { hp: 1149, damage: 3184 },
  'Phoenix': { hp: 1420, damage: 2892 },
  'Wasp': { hp: 311, damage: 202 },
  'Fort': { hp: 43938, damage: 6177 },
  'Overlord': { hp: 22054, damage: 19420 },
  'Sandworm': { hp: 48645, damage: 8324 },
  'Scorpion': { hp: 18632, damage: 10650 },
  'Void Eye': { hp: 1371, damage: 917 },
  'Marksman': { hp: 1622, damage: 2329 },
  'Fang': { hp: 117, damage: 61 },
  'Mustang': { hp: 343, damage: 36 },
  'Hound': { hp: 897, damage: 246 },
  'Farseer': { hp: 11991, damage: 2228 },
  'Tarantula': { hp: 14404, damage: 534 },
  'Fire Badger': { hp: 5184, damage: 28 },
  'Arclight': { hp: 4204, damage: 347 },
  'Sledgehammer': { hp: 3478, damage: 608 },
  'Wraith': { hp: 15001, damage: 1620 },
  'Typhoon': { hp: 9529, damage: 88 },
  'Raiden': { hp: 17476, damage: 5304 },
  'Vulcan': { hp: 35332, damage: 90 }
};

// Global Styles for Fonts
const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': [
        "url('https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;600;700;800&display=swap')",
        "url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap')"
      ],
      body: {
        backgroundColor: brandColors.bgBase,
        color: brandColors.neutralLight,
        fontFamily: '"Inter", sans-serif',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${brandColors.accentPrimary} ${brandColors.surface}`,
      },
      '*::-webkit-scrollbar': {
        width: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: brandColors.surface,
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: brandColors.accentPrimary,
        borderRadius: '4px',
      },
    }}
  />
);

function App() {
  const [unitsData, setUnitsData] = useState<UnitsData>({});
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [opponentUnits, setOpponentUnits] = useState<Set<string>>(new Set());
  const [userUnits, setUserUnits] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState(0);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'ground' | 'air'>('all');
  const [selectedBreakpointUnit, setSelectedBreakpointUnit] = useState<string | null>(null);

  // Ref for scrolling to strategy section
  const strategyRef = useRef<HTMLDivElement>(null);

  // Define air units based on Mechabellum classifications
  const airUnits = new Set([
    'Phoenix', 'Wasp', 'Phantom Ray', 'Wraith', 'Raiden', 'Overlord', 'Abyss'
  ]);

  // Function to categorize units
  const categorizeUnits = (units: UnitsData) => {
    const groundUnits: UnitsData = {};
    const airUnitsData: UnitsData = {};

    Object.entries(units).forEach(([name, data]) => {
      if (airUnits.has(name)) {
        airUnitsData[name] = data;
      } else {
        groundUnits[name] = data;
      }
    });

    return { groundUnits, airUnits: airUnitsData };
  };

  // Function to filter units based on search term and filter
  const filterUnits = (units: UnitsData) => {
    let filteredUnits = { ...units };

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredUnits = Object.fromEntries(
        Object.entries(filteredUnits).filter(([name]) =>
          name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by unit type
    if (unitFilter === 'ground') {
      filteredUnits = Object.fromEntries(
        Object.entries(filteredUnits).filter(([name]) => !airUnits.has(name))
      );
    } else if (unitFilter === 'air') {
      filteredUnits = Object.fromEntries(
        Object.entries(filteredUnits).filter(([name]) => airUnits.has(name))
      );
    }

    return filteredUnits;
  };

  useEffect(() => {
    // Add debugging log for API key
    console.log('Environment variables:', {
      apiKey: process.env.REACT_APP_OPENAI_API_KEY ? 'Present' : 'Missing',
      allEnvs: process.env
    });

    // Load the units data
    fetch('/units.json')
      .then(response => response.json())
      .then(data => {
        setUnitsData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading units data:', error);
        setLoading(false);
      });
  }, []);

  const handleOpponentUnitClick = (unitName: string) => {
    setOpponentUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitName)) {
        newSet.delete(unitName);
      } else {
        newSet.add(unitName);
      }
      return newSet;
    });
  };

  const handleUserUnitClick = (unitName: string) => {
    setUserUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitName)) {
        newSet.delete(unitName);
      } else {
        newSet.add(unitName);
      }
      return newSet;
    });
  };

  const handleCloseDetails = () => {
    setSelectedUnit(null);
  };

  const generateStrategy = async () => {
    if (opponentUnits.size === 0 || userUnits.size === 0) {
      setError('Please select at least one unit for both you and your opponent');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStrategy(null);

    // Scroll to strategy section
    setTimeout(() => {
      strategyRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);

    try {
      // Fetch the strategy data
      const strategyResponse = await fetch('/merged_strategies.txt');
      if (!strategyResponse.ok) {
        throw new Error('Failed to load strategy data');
      }
      const strategyData = await strategyResponse.text();

      console.log('Sending request to server...');
      const response = await fetch('http://localhost:3001/api/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedUnits: Array.from(opponentUnits),
          userUnits: Array.from(userUnits),
          strategyData
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server Error Response:', data);
        throw new Error(data.error || 'Failed to generate strategy');
      }

      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from server');
      }

      setStrategy(data.content[0].text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate strategy';
      setError(`${errorMessage}. Please try again.`);
      console.error('Error generating strategy:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setStrategy(null);
    setError(null);
  };

  if (loading) {
    return (
      <>
        {globalStyles}
        <Box sx={{ 
          minHeight: '100vh',
          backgroundColor: brandColors.bgBase,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: brandColors.neutralLight,
              fontFamily: '"Saira Condensed", sans-serif',
              fontWeight: 700
            }}
          >
            Loading...
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      {globalStyles}
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: brandColors.bgBase,
        color: brandColors.neutralLight
      }}>
        {/* Header with Brand */}
        <Box sx={{ 
          backgroundColor: brandColors.surface,
          borderBottom: `1px solid ${brandColors.accentPrimary}`,
          py: 2
        }}>
          <Container maxWidth="xl">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography 
                variant="h1"
                sx={{
                  fontFamily: '"Saira Condensed", sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '32px', md: '40px' },
                  lineHeight: { xs: '40px', md: '48px' },
                  color: brandColors.accentPrimary,
                  letterSpacing: '0.02em'
                }}
              >
                MatchupMaster
              </Typography>
              <Typography 
                variant="body1"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: brandColors.neutralMid,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Know the match up. Win the round.
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, pb: { xs: 6, md: 10 } }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4, md: 5 },
              backgroundColor: brandColors.surface,
              borderRadius: 2,
              border: `1px solid ${brandColors.accentPrimary}20`,
              boxShadow: `0 8px 32px ${brandColors.bgBase}80`
            }}
          >
            <Box sx={{ borderBottom: `1px solid ${brandColors.accentPrimary}40`, mb: 4 }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTab-root': {
                    color: brandColors.neutralMid,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                    fontSize: '16px',
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: brandColors.accentPrimary,
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: brandColors.accentPrimary,
                    height: '2px'
                  }
                }}
              >
                <Tab label="Unit Selection" />
                <Tab label="Unit Breakpoints" />
              </Tabs>
            </Box>

            {currentTab === 0 && (
              <>
                {/* Search and Filter Controls */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    alignItems: { xs: 'stretch', sm: 'center' }
                  }}>
                    <TextField
                      placeholder="Search units..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="small"
                      sx={{ 
                        flex: 1,
                        maxWidth: { xs: '100%', sm: '320px' },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: brandColors.bgBase,
                          color: brandColors.neutralLight,
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: brandColors.accentPrimary + '40',
                          },
                          '&:hover fieldset': {
                            borderColor: brandColors.accentPrimary + '60',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: brandColors.accentPrimary,
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: brandColors.neutralMid
                        }
                      }}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}>
                      <Chip
                        label="All"
                        onClick={() => setUnitFilter('all')}
                        variant={unitFilter === 'all' ? 'filled' : 'outlined'}
                        clickable
                        sx={{
                          backgroundColor: unitFilter === 'all' ? brandColors.accentPrimary : 'transparent',
                          color: unitFilter === 'all' ? brandColors.bgBase : brandColors.neutralLight,
                          borderColor: brandColors.accentPrimary,
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: unitFilter === 'all' ? brandColors.accentPrimary : brandColors.accentPrimary + '20'
                          }
                        }}
                      />
                      <Chip
                        label="Ground"
                        onClick={() => setUnitFilter('ground')}
                        variant={unitFilter === 'ground' ? 'filled' : 'outlined'}
                        clickable
                        sx={{
                          backgroundColor: unitFilter === 'ground' ? brandColors.warning : 'transparent',
                          color: unitFilter === 'ground' ? brandColors.bgBase : brandColors.neutralLight,
                          borderColor: brandColors.warning,
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: unitFilter === 'ground' ? brandColors.warning : brandColors.warning + '20'
                          }
                        }}
                      />
                      <Chip
                        label="Air"
                        onClick={() => setUnitFilter('air')}
                        variant={unitFilter === 'air' ? 'filled' : 'outlined'}
                        clickable
                        sx={{
                          backgroundColor: unitFilter === 'air' ? brandColors.accentSecondary : 'transparent',
                          color: unitFilter === 'air' ? brandColors.neutralLight : brandColors.neutralLight,
                          borderColor: brandColors.accentSecondary,
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: unitFilter === 'air' ? brandColors.accentSecondary : brandColors.accentSecondary + '20'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', lg: 'row' },
                  gap: 4
                }}>
                  {/* Your Units (Left Side) */}
                  <Box sx={{ flex: 1 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        backgroundColor: brandColors.bgBase,
                        borderRadius: 2,
                        border: `1px solid ${brandColors.success}40`,
                        height: '100%'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3 
                      }}>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            fontFamily: '"Saira Condensed", sans-serif',
                            fontWeight: 700,
                            fontSize: '24px',
                            lineHeight: '32px',
                            color: brandColors.success,
                            textTransform: 'uppercase'
                          }}
                        >
                          Your Units
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontFamily: '"Inter", sans-serif',
                              fontWeight: 500,
                              color: brandColors.neutralMid
                            }}
                          >
                            {userUnits.size} selected
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => setUserUnits(new Set())}
                            disabled={userUnits.size === 0}
                            size="small"
                            sx={{
                              borderColor: brandColors.success,
                              color: brandColors.success,
                              fontFamily: '"Inter", sans-serif',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: brandColors.success,
                                backgroundColor: brandColors.success + '20'
                              }
                            }}
                          >
                            Clear
                          </Button>
                        </Box>
                      </Box>
                      
                      <Box>
                        {unitFilter === 'all' ? (
                          <>
                            {/* Ground Units Section */}
                            {Object.keys(categorizeUnits(filterUnits(unitsData)).groundUnits).length > 0 && (
                              <Box sx={{ mb: 4 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontFamily: '"Saira Condensed", sans-serif',
                                    fontWeight: 600, 
                                    mb: 2,
                                    color: brandColors.warning,
                                    borderBottom: `2px solid ${brandColors.warning}`,
                                    pb: 1,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  Ground Units
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                      sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                                    },
                                    gap: 2
                                  }}
                                >
                                  {Object.entries(categorizeUnits(filterUnits(unitsData)).groundUnits).map(([name, data]) => (
                                    <Box key={name}>
                                      <UnitCard
                                        name={name}
                                        data={data}
                                        onClick={() => handleUserUnitClick(name)}
                                        isSelected={userUnits.has(name)}
                                        compact={true}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Air Units Section */}
                            {Object.keys(categorizeUnits(filterUnits(unitsData)).airUnits).length > 0 && (
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontFamily: '"Saira Condensed", sans-serif',
                                    fontWeight: 600, 
                                    mb: 2,
                                    color: brandColors.accentSecondary,
                                    borderBottom: `2px solid ${brandColors.accentSecondary}`,
                                    pb: 1,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  Air Units
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                      sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                                    },
                                    gap: 2
                                  }}
                                >
                                  {Object.entries(categorizeUnits(filterUnits(unitsData)).airUnits).map(([name, data]) => (
                                    <Box key={name}>
                                      <UnitCard
                                        name={name}
                                        data={data}
                                        onClick={() => handleUserUnitClick(name)}
                                        isSelected={userUnits.has(name)}
                                        compact={true}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </>
                        ) : (
                          /* Filtered view - single grid */
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                              },
                              gap: 2
                            }}
                          >
                            {Object.entries(filterUnits(unitsData)).map(([name, data]) => (
                              <Box key={name}>
                                <UnitCard
                                  name={name}
                                  data={data}
                                  onClick={() => handleUserUnitClick(name)}
                                  isSelected={userUnits.has(name)}
                                  compact={true}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>

                  {/* Opponent Units (Right Side) */}
                  <Box sx={{ flex: 1 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        backgroundColor: brandColors.bgBase,
                        borderRadius: 2,
                        border: `1px solid ${brandColors.error}40`,
                        height: '100%'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3 
                      }}>
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            fontFamily: '"Saira Condensed", sans-serif',
                            fontWeight: 700,
                            fontSize: '24px',
                            lineHeight: '32px',
                            color: brandColors.error,
                            textTransform: 'uppercase'
                          }}
                        >
                          Opponent's Units
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontFamily: '"Inter", sans-serif',
                              fontWeight: 500,
                              color: brandColors.neutralMid
                            }}
                          >
                            {opponentUnits.size} selected
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => setOpponentUnits(new Set())}
                            disabled={opponentUnits.size === 0}
                            size="small"
                            sx={{
                              borderColor: brandColors.error,
                              color: brandColors.error,
                              fontFamily: '"Inter", sans-serif',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: brandColors.error,
                                backgroundColor: brandColors.error + '20'
                              }
                            }}
                          >
                            Clear
                          </Button>
                        </Box>
                      </Box>
                      
                      <Box>
                        {unitFilter === 'all' ? (
                          <>
                            {/* Ground Units Section */}
                            {Object.keys(categorizeUnits(filterUnits(unitsData)).groundUnits).length > 0 && (
                              <Box sx={{ mb: 4 }}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontFamily: '"Saira Condensed", sans-serif',
                                    fontWeight: 600, 
                                    mb: 2,
                                    color: brandColors.warning,
                                    borderBottom: `2px solid ${brandColors.warning}`,
                                    pb: 1,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  Ground Units
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                      sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                                    },
                                    gap: 2
                                  }}
                                >
                                  {Object.entries(categorizeUnits(filterUnits(unitsData)).groundUnits).map(([name, data]) => (
                                    <Box key={name}>
                                      <UnitCard
                                        name={name}
                                        data={data}
                                        onClick={() => handleOpponentUnitClick(name)}
                                        isSelected={opponentUnits.has(name)}
                                        compact={true}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {/* Air Units Section */}
                            {Object.keys(categorizeUnits(filterUnits(unitsData)).airUnits).length > 0 && (
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontFamily: '"Saira Condensed", sans-serif',
                                    fontWeight: 600, 
                                    mb: 2,
                                    color: brandColors.accentSecondary,
                                    borderBottom: `2px solid ${brandColors.accentSecondary}`,
                                    pb: 1,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  Air Units
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                      sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                                    },
                                    gap: 2
                                  }}
                                >
                                  {Object.entries(categorizeUnits(filterUnits(unitsData)).airUnits).map(([name, data]) => (
                                    <Box key={name}>
                                      <UnitCard
                                        name={name}
                                        data={data}
                                        onClick={() => handleOpponentUnitClick(name)}
                                        isSelected={opponentUnits.has(name)}
                                        compact={true}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </>
                        ) : (
                          /* Filtered view - single grid */
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: 'repeat(auto-fill, minmax(100px, 1fr))',
                                sm: 'repeat(auto-fill, minmax(90px, 1fr))'
                              },
                              gap: 2
                            }}
                          >
                            {Object.entries(filterUnits(unitsData)).map(([name, data]) => (
                              <Box key={name}>
                                <UnitCard
                                  name={name}
                                  data={data}
                                  onClick={() => handleOpponentUnitClick(name)}
                                  isSelected={opponentUnits.has(name)}
                                  compact={true}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Box>

                {/* Generate Strategy Button - Now at the bottom */}
                <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
                  <Tooltip 
                    title="Select at least 1 unit on both sides"
                    disableHoverListener={!(opponentUnits.size === 0 || userUnits.size === 0)}
                    disableFocusListener={!(opponentUnits.size === 0 || userUnits.size === 0)}
                    disableTouchListener={!(opponentUnits.size === 0 || userUnits.size === 0)}
                  >
                    <span>
                      <Button
                        variant="contained"
                        onClick={generateStrategy}
                        disabled={isGenerating || opponentUnits.size === 0 || userUnits.size === 0}
                        sx={{ 
                          minWidth: 200,
                          height: 48,
                          backgroundColor: brandColors.accentPrimary,
                          color: brandColors.bgBase,
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: brandColors.accentPrimary,
                            filter: 'brightness(1.1)'
                          },
                          '&:disabled': {
                            backgroundColor: brandColors.neutralMid,
                            color: brandColors.bgBase
                          }
                        }}
                      >
                        {isGenerating ? 'Generating Strategy...' : 'Generate Strategy'}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </>
            )}

            {currentTab === 1 && (
              <>
                {/* Unit Breakpoints Content */}
                <Typography 
                  variant="h2" 
                  sx={{
                    fontFamily: '"Saira Condensed", sans-serif',
                    fontWeight: 700,
                    fontSize: '32px',
                    lineHeight: '40px',
                    color: brandColors.accentPrimary,
                    textAlign: 'center',
                    mb: 4
                  }}
                >
                  Unit Breakpoints Analysis
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: brandColors.neutralMid,
                    textAlign: 'center',
                    mb: 6
                  }}
                >
                  Select a unit to see what can one-shot it and analyze damage thresholds
                </Typography>

                {/* Unit Selector */}
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                  <Autocomplete
                    options={Object.keys(unitStats)}
                    value={selectedBreakpointUnit}
                    onChange={(event, newValue) => setSelectedBreakpointUnit(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select a unit to analyze..."
                        sx={{ 
                          width: '400px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: brandColors.bgBase,
                            color: brandColors.neutralLight,
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: brandColors.accentPrimary + '40',
                            },
                            '&:hover fieldset': {
                              borderColor: brandColors.accentPrimary + '60',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: brandColors.accentPrimary,
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: brandColors.neutralMid
                          }
                        }}
                      />
                    )}
                    sx={{
                      '& .MuiAutocomplete-paper': {
                        backgroundColor: brandColors.surface,
                        color: brandColors.neutralLight,
                      },
                      '& .MuiAutocomplete-option': {
                        color: brandColors.neutralLight,
                        '&:hover': {
                          backgroundColor: brandColors.accentPrimary + '20',
                        },
                        '&.Mui-focused': {
                          backgroundColor: brandColors.accentPrimary + '30',
                        }
                      }
                    }}
                  />
                </Box>

                {/* Selected Unit Analysis */}
                {selectedBreakpointUnit && (
                  <Box sx={{ mb: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        backgroundColor: brandColors.surface,
                        borderRadius: 2,
                        border: `2px solid ${brandColors.accentPrimary}`,
                        mb: 4
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          fontFamily: '"Saira Condensed", sans-serif',
                          fontWeight: 700,
                          fontSize: '28px',
                          color: brandColors.accentPrimary,
                          mb: 3,
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}
                      >
                        {selectedBreakpointUnit} Analysis
                      </Typography>
                      
                      {/* Unit Stats */}
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap: 3,
                        mb: 4
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ 
                            color: brandColors.neutralLight, 
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '24px',
                            mb: 1
                          }}>
                            {unitStats[selectedBreakpointUnit].hp.toLocaleString()}
                          </Typography>
                          <Typography sx={{ 
                            color: brandColors.neutralMid, 
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '14px'
                          }}>
                            Health Points
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ 
                            color: brandColors.warning, 
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '24px',
                            mb: 1
                          }}>
                            {unitStats[selectedBreakpointUnit].damage.toLocaleString()}
                          </Typography>
                          <Typography sx={{ 
                            color: brandColors.neutralMid, 
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '14px'
                          }}>
                            Damage Output
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ 
                            color: brandColors.accentSecondary, 
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '24px',
                            mb: 1
                          }}>
                            {(unitStats[selectedBreakpointUnit].damage / unitStats[selectedBreakpointUnit].hp).toFixed(2)}
                          </Typography>
                          <Typography sx={{ 
                            color: brandColors.neutralMid, 
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '14px'
                          }}>
                            Damage/HP Ratio
                          </Typography>
                        </Box>
                      </Box>

                      {/* What can one-shot this unit */}
                      <Box sx={{ mb: 4 }}>
                        <Typography 
                          variant="h4"
                          sx={{ 
                            color: brandColors.error, 
                            fontFamily: '"Saira Condensed", sans-serif',
                            fontWeight: 600,
                            fontSize: '20px',
                            mb: 2,
                            textTransform: 'uppercase'
                          }}
                        >
                          Units that can one-shot {selectedBreakpointUnit}:
                        </Typography>
                        
                        {(() => {
                          const canBeOneShotBy = Object.entries(unitStats)
                            .filter(([attackerName, attackerStats]) => 
                              attackerName !== selectedBreakpointUnit && attackerStats.damage >= unitStats[selectedBreakpointUnit].hp
                            );

                          return canBeOneShotBy.length > 0 ? (
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              p: 2,
                              border: `1px solid ${brandColors.error}40`,
                              borderRadius: 2,
                              backgroundColor: brandColors.error + '05'
                            }}>
                              {canBeOneShotBy.map(([attackerName, attackerStats]) => (
                                <Chip
                                  key={attackerName}
                                  label={`${attackerName} (${attackerStats.damage.toLocaleString()} dmg)`}
                                  sx={{
                                    backgroundColor: brandColors.error + '20',
                                    color: brandColors.error,
                                    fontSize: '12px',
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: brandColors.error + '30'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography sx={{ 
                              color: brandColors.success, 
                              fontFamily: '"Inter", sans-serif',
                              fontSize: '16px',
                              fontWeight: 500,
                              p: 2,
                              backgroundColor: brandColors.success + '10',
                              borderRadius: 2,
                              border: `1px solid ${brandColors.success}40`
                            }}>
                              🛡️ This unit cannot be one-shot by any other unit!
                            </Typography>
                          );
                        })()}
                      </Box>

                      {/* What this unit can one-shot */}
                      <Box>
                        <Typography 
                          variant="h4"
                          sx={{ 
                            color: brandColors.success, 
                            fontFamily: '"Saira Condensed", sans-serif',
                            fontWeight: 600,
                            fontSize: '20px',
                            mb: 2,
                            textTransform: 'uppercase'
                          }}
                        >
                          Units that {selectedBreakpointUnit} can one-shot:
                        </Typography>
                        
                        {(() => {
                          const canOneShot = Object.entries(unitStats)
                            .filter(([targetName, targetStats]) => 
                              targetName !== selectedBreakpointUnit && unitStats[selectedBreakpointUnit].damage >= targetStats.hp
                            );

                          return canOneShot.length > 0 ? (
                            <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: 1,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              p: 2,
                              border: `1px solid ${brandColors.success}40`,
                              borderRadius: 2,
                              backgroundColor: brandColors.success + '05'
                            }}>
                              {canOneShot.map(([targetName, targetStats]) => (
                                <Chip
                                  key={targetName}
                                  label={`${targetName} (${targetStats.hp.toLocaleString()} hp)`}
                                  sx={{
                                    backgroundColor: brandColors.success + '20',
                                    color: brandColors.success,
                                    fontSize: '12px',
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 500,
                                    '&:hover': {
                                      backgroundColor: brandColors.success + '30'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography sx={{ 
                              color: brandColors.neutralMid, 
                              fontFamily: '"Inter", sans-serif',
                              fontSize: '16px',
                              fontStyle: 'italic',
                              p: 2,
                              backgroundColor: brandColors.neutralMid + '10',
                              borderRadius: 2,
                              border: `1px solid ${brandColors.neutralMid}40`
                            }}>
                              This unit cannot one-shot any other units.
                            </Typography>
                          );
                        })()}
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* All Units Overview - Only show when no unit is selected */}
                {!selectedBreakpointUnit && (
                  <>
                    {/* Search for Breakpoints */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                      <TextField
                        placeholder="Search units for breakpoint analysis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ 
                          maxWidth: '400px',
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: brandColors.bgBase,
                            color: brandColors.neutralLight,
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: brandColors.accentPrimary + '40',
                            },
                            '&:hover fieldset': {
                              borderColor: brandColors.accentPrimary + '60',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: brandColors.accentPrimary,
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: brandColors.neutralMid
                          }
                        }}
                      />
                    </Box>

                    {/* Unit Stats Table */}
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                      gap: 3,
                      mb: 4
                    }}>
                      {Object.entries(unitStats)
                        .filter(([unitName]) => 
                          searchTerm.trim() === '' || 
                          unitName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .sort(([, a], [, b]) => b.damage - a.damage) // Sort by damage descending
                        .map(([unitName, stats]) => {
                          const canOneShot = Object.entries(unitStats)
                            .filter(([targetName, targetStats]) => 
                              targetName !== unitName && stats.damage >= targetStats.hp
                            );
                          
                          const canBeOneShotBy = Object.entries(unitStats)
                            .filter(([attackerName, attackerStats]) => 
                              attackerName !== unitName && attackerStats.damage >= stats.hp
                            );

                          const damageEfficiency = (stats.damage / stats.hp).toFixed(2);

                          return (
                            <Paper
                              key={unitName}
                              elevation={0}
                              sx={{
                                p: 3,
                                backgroundColor: brandColors.bgBase,
                                borderRadius: 2,
                                border: `1px solid ${brandColors.neutralMid}40`,
                                cursor: 'pointer',
                                '&:hover': {
                                  borderColor: brandColors.accentPrimary + '60',
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease-in-out'
                                }
                              }}
                              onClick={() => setSelectedBreakpointUnit(unitName)}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: '"Saira Condensed", sans-serif',
                                  fontWeight: 600,
                                  fontSize: '20px',
                                  color: brandColors.accentPrimary,
                                  mb: 2,
                                  textTransform: 'uppercase'
                                }}
                              >
                                {unitName}
                              </Typography>
                              
                              {/* Basic Stats */}
                              <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography sx={{ color: brandColors.neutralMid, fontFamily: '"Inter", sans-serif' }}>
                                    HP:
                                  </Typography>
                                  <Typography sx={{ color: brandColors.neutralLight, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
                                    {stats.hp.toLocaleString()}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography sx={{ color: brandColors.neutralMid, fontFamily: '"Inter", sans-serif' }}>
                                    Damage:
                                  </Typography>
                                  <Typography sx={{ color: brandColors.warning, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
                                    {stats.damage.toLocaleString()}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                  <Typography sx={{ color: brandColors.neutralMid, fontFamily: '"Inter", sans-serif' }}>
                                    Damage/HP Ratio:
                                  </Typography>
                                  <Typography sx={{ color: brandColors.accentSecondary, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
                                    {damageEfficiency}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* One-shot potential */}
                              <Box sx={{ mb: 3 }}>
                                <Typography 
                                  sx={{ 
                                    color: brandColors.success, 
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    mb: 1
                                  }}
                                >
                                  Can One-Shot ({canOneShot.length} units):
                                </Typography>
                                {canOneShot.length > 0 ? (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 1, 
                                    mb: 2,
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    p: 1,
                                    border: `1px solid ${brandColors.success}20`,
                                    borderRadius: 1,
                                    backgroundColor: brandColors.success + '05'
                                  }}>
                                    {canOneShot.map(([targetName]) => (
                                      <Chip
                                        key={targetName}
                                        label={targetName}
                                        size="small"
                                        sx={{
                                          backgroundColor: brandColors.success + '20',
                                          color: brandColors.success,
                                          fontSize: '11px',
                                          fontFamily: '"Inter", sans-serif',
                                          '&:hover': {
                                            backgroundColor: brandColors.success + '30'
                                          }
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography sx={{ 
                                    color: brandColors.neutralMid, 
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: '12px',
                                    fontStyle: 'italic',
                                    mb: 2
                                  }}>
                                    Cannot one-shot any units
                                  </Typography>
                                )}
                              </Box>

                              {/* Vulnerable to */}
                              <Box>
                                <Typography 
                                  sx={{ 
                                    color: brandColors.error, 
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    mb: 1
                                  }}
                                >
                                  Vulnerable to ({canBeOneShotBy.length} units):
                                </Typography>
                                {canBeOneShotBy.length > 0 ? (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: 1,
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    p: 1,
                                    border: `1px solid ${brandColors.error}20`,
                                    borderRadius: 1,
                                    backgroundColor: brandColors.error + '05'
                                  }}>
                                    {canBeOneShotBy.map(([attackerName]) => (
                                      <Chip
                                        key={attackerName}
                                        label={attackerName}
                                        size="small"
                                        sx={{
                                          backgroundColor: brandColors.error + '20',
                                          color: brandColors.error,
                                          fontSize: '11px',
                                          fontFamily: '"Inter", sans-serif',
                                          '&:hover': {
                                            backgroundColor: brandColors.error + '30'
                                          }
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography sx={{ 
                                    color: brandColors.neutralMid, 
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: '12px',
                                    fontStyle: 'italic'
                                  }}>
                                    Cannot be one-shot by any unit
                                  </Typography>
                                )}
                              </Box>

                              {/* Click hint */}
                              <Box sx={{ 
                                mt: 2, 
                                pt: 2, 
                                borderTop: `1px solid ${brandColors.neutralMid}20`,
                                textAlign: 'center'
                              }}>
                                <Typography sx={{ 
                                  color: brandColors.accentPrimary, 
                                  fontFamily: '"Inter", sans-serif',
                                  fontSize: '12px',
                                  fontStyle: 'italic'
                                }}>
                                  Click to analyze in detail
                                </Typography>
                              </Box>
                            </Paper>
                          );
                        })}
                    </Box>
                  </>
                )}
              </>
            )}
          </Paper>

          {/* Strategy Display - Only show on Unit Selection tab */}
          {currentTab === 0 && (
            <div ref={strategyRef}>
              <StrategyDisplay
                strategy={strategy}
                isLoading={isGenerating}
                error={error}
              />
            </div>
          )}
        </Container>

        {selectedUnit && (
          <UnitDetails
            open={!!selectedUnit}
            onClose={handleCloseDetails}
            name={selectedUnit}
            data={unitsData[selectedUnit]}
          />
        )}
      </Box>
    </>
  );
}

export default App;
