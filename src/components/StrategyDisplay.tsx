import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

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

interface StrategyDisplayProps {
    strategy: string | null;
    isLoading: boolean;
    error: string | null;
}

// Function to parse and render strategy text with nested bullets
const renderStrategyContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
            // Empty line - add spacing
            elements.push(<Box key={index} sx={{ height: '8px' }} />);
        } else if (trimmedLine.startsWith('- ')) {
            // Main bullet point
            const content = trimmedLine.substring(2);
            elements.push(
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                        sx={{
                            color: brandColors.accentPrimary,
                            fontWeight: 'bold',
                            fontSize: '16px',
                            lineHeight: '24px',
                            mr: 1,
                            mt: 0
                        }}
                    >
                        •
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: brandColors.neutralLight,
                            flex: 1
                        }}
                    >
                        {content}
                    </Typography>
                </Box>
            );
        } else if (line.match(/^  +- /)) {
            // Nested bullet point (starts with spaces then dash)
            const content = line.replace(/^  +- /, '');
            elements.push(
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, ml: 3 }}>
                    <Typography
                        sx={{
                            color: brandColors.neutralMid,
                            fontWeight: 'bold',
                            fontSize: '14px',
                            lineHeight: '22px',
                            mr: 1,
                            mt: 0
                        }}
                    >
                        ◦
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '15px',
                            lineHeight: '22px',
                            color: brandColors.neutralLight,
                            flex: 1
                        }}
                    >
                        {content}
                    </Typography>
                </Box>
            );
        } else if (trimmedLine.startsWith('• ')) {
            // Handle bullet points that start with bullet symbol
            const content = trimmedLine.substring(2);
            elements.push(
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography
                        sx={{
                            color: brandColors.accentPrimary,
                            fontWeight: 'bold',
                            fontSize: '16px',
                            lineHeight: '24px',
                            mr: 1,
                            mt: 0
                        }}
                    >
                        •
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '16px',
                            lineHeight: '24px',
                            color: brandColors.neutralLight,
                            flex: 1,
                            fontWeight: 600
                        }}
                    >
                        {content}
                    </Typography>
                </Box>
            );
        } else {
            // Regular text
            elements.push(
                <Typography
                    key={index}
                    sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        color: brandColors.neutralLight,
                        mb: 1
                    }}
                >
                    {trimmedLine}
                </Typography>
            );
        }
    });
    
    return elements;
};

const StrategyDisplay: React.FC<StrategyDisplayProps> = ({ strategy, isLoading, error }) => {
    const hasContent = isLoading || error || strategy;
    
    return (
        <Box
          sx={{
            maxHeight: hasContent ? '1000px' : '0px',
            opacity: hasContent ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 300ms ease-out, opacity 300ms ease-out',
            mt: hasContent ? 4 : 0,
            mb: hasContent ? 4 : 0
          }}
        >
          <Box
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              backgroundColor: brandColors.surface,
              borderRadius: 2,
              border: `1px solid ${brandColors.accentPrimary}20`,
              boxShadow: `0 8px 32px ${brandColors.bgBase}80`
            }}
          >
            {isLoading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 6,
                gap: 2
              }}>
                  <CircularProgress 
                    sx={{ 
                      color: brandColors.accentPrimary 
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 500,
                      color: brandColors.neutralMid 
                    }}
                  >
                    Generating strategy...
                  </Typography>
              </Box>
            )}

            {error && (
              <Box sx={{ p: 4 }}>
                  <Typography 
                    sx={{ 
                      color: brandColors.error,
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 500
                    }}
                  >
                    {error}
                  </Typography>
              </Box>
            )}

            {strategy && !isLoading && !error && (
              <Box sx={{ p: 4, pb: 6 }}>
                  <Typography 
                    variant="h2" 
                    sx={{
                      fontFamily: '"Saira Condensed", sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '32px',
                      color: brandColors.accentPrimary,
                      textTransform: 'uppercase',
                      mb: 3
                    }}
                  >
                      Recommended Strategy
                  </Typography>
                  <Box>
                      {renderStrategyContent(strategy)}
                  </Box>
              </Box>
            )}
          </Box>
        </Box>
    );
};

export default StrategyDisplay; 