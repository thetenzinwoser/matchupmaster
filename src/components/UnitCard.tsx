import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import { UnitData } from '../types/unit';

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

interface UnitCardProps {
    name: string;
    data: UnitData;
    onClick: () => void;
    isSelected?: boolean;
    compact?: boolean;
}

const UnitCard: React.FC<UnitCardProps> = ({ name, data, onClick, isSelected = false, compact = false }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        console.error(`Failed to load image for ${name}`);
        setImageError(true);
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: isSelected ? brandColors.accentPrimary + '20' : brandColors.surface,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: isSelected 
                    ? `0 0 0 3px ${brandColors.accentPrimary}, 0 8px 24px ${brandColors.accentPrimary}40` 
                    : `0 4px 12px ${brandColors.bgBase}60`,
                border: isSelected 
                    ? `2px solid ${brandColors.accentPrimary}` 
                    : `1px solid ${brandColors.neutralMid}40`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                    transform: isSelected ? 'scale(1.02)' : 'translateY(-2px)',
                    boxShadow: isSelected 
                        ? `0 0 0 3px ${brandColors.accentPrimary}, 0 12px 32px ${brandColors.accentPrimary}60`
                        : `0 8px 20px ${brandColors.bgBase}80`,
                    borderColor: isSelected ? brandColors.accentPrimary : brandColors.neutralLight + '60'
                }
            }}
            onClick={onClick}
        >
            <Box sx={{ 
                position: 'relative',
                paddingTop: compact ? '70%' : '100%', // Aspect ratio (smaller for compact)
                backgroundColor: brandColors.bgBase,
                width: '100%',
                borderBottom: `1px solid ${brandColors.neutralMid}40`
            }}>
                <Box
                    component="img"
                    src={`/unit_images/${name.toLowerCase().replace(/\s+/g, '_')}.png`}
                    alt={name}
                    onError={handleImageError}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isSelected ? 'brightness(1.1) saturate(1.2)' : 'none'
                    }}
                />
                {isSelected && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: brandColors.accentPrimary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 2px 8px ${brandColors.bgBase}80`
                        }}
                    >
                        <Typography
                            sx={{
                                color: brandColors.bgBase,
                                fontSize: '14px',
                                fontWeight: 'bold',
                                lineHeight: 1
                            }}
                        >
                            ✓
                        </Typography>
                    </Box>
                )}
            </Box>
            <CardContent 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: compact ? '8px !important' : '16px !important', // Smaller padding for compact mode
                    backgroundColor: isSelected ? brandColors.accentPrimary + '20' : brandColors.surface
                }}
            >
                <Typography 
                    variant={compact ? "body2" : "h6"} 
                    component="div" 
                    align="center"
                    sx={{
                        fontSize: compact ? '0.8rem' : '1.1rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? brandColors.accentPrimary : brandColors.neutralLight,
                        lineHeight: 1.2,
                        fontFamily: '"Inter", sans-serif'
                    }}
                >
                    {name}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default UnitCard; 