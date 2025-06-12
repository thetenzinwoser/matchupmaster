import React from 'react';
import { Dialog, DialogContent, DialogTitle, Typography, Grid, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UnitData } from '../types/unit';

interface UnitDetailsProps {
    open: boolean;
    onClose: () => void;
    name: string;
    data: UnitData;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ open, onClose, name, data }) => {
    const UnitImage = ({ unitName, size }: { unitName: string, size: number }) => (
        <Box sx={{ 
            position: 'relative',
            width: size,
            height: size,
            backgroundColor: '#f5f5f5',
            borderRadius: 1
        }}>
            <Box
                component="img"
                src={`/unit_images/${unitName.toLowerCase().replace(/\s+/g, '_')}.png`}
                alt={unitName}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    padding: '8%',
                    borderRadius: 1
                }}
            />
        </Box>
    );

    const UnitListItem = ({ unitName }: { unitName: string }) => (
        <Box
            component="li"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                width: 80,
                mb: 1
            }}
        >
            <UnitImage unitName={unitName} size={60} />
            <Typography 
                variant="body2" 
                align="center"
                sx={{
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                    maxWidth: '100%',
                    wordWrap: 'break-word'
                }}
            >
                {unitName}
            </Typography>
        </Box>
    );

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                pr: 6 // Make room for close button
            }}>
                <UnitImage unitName={name} size={60} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {name}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Good Against:
                        </Typography>
                        {data.good_against.length > 0 ? (
                            <Box
                                component="ul"
                                sx={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                {data.good_against.map((unit) => (
                                    <UnitListItem key={unit} unitName={unit} />
                                ))}
                            </Box>
                        ) : (
                            <Typography>None</Typography>
                        )}
                    </Box>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Countered By:
                        </Typography>
                        {data.countered_by.length > 0 ? (
                            <Box
                                component="ul"
                                sx={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                {data.countered_by.map((unit) => (
                                    <UnitListItem key={unit} unitName={unit} />
                                ))}
                            </Box>
                        ) : (
                            <Typography>None</Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default UnitDetails; 