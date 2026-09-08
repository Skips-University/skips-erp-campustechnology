import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const MathKeyboardds = ({ onSymbolClick }) => {
  const symbols = [
    ['∫', 'Σ', 'π', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'ω'],
    ['√', '∛', '²', '³', 'ⁿ', '₁', '₂', '₃', 'ₙ'],
    ['≤', '≥', '≠', '≈', '∞', '±', '∓', '×', '÷'],
    ['∠', '°', '′', '″', '∥', '⊥', '∴', '∵'],
    ['∈', '∉', '⊂', '⊃', '∪', '∩', '∅', '⊆', '⊇'],
    ['←', '→', '↑', '↓', '↔', '⇒', '⇔'],
  ];

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Math Symbols Keyboard
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {symbols.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {row.map((symbol) => (
              <Button
                key={symbol}
                variant="outlined"
                size="small"
                onClick={() => onSymbolClick(symbol)}
                sx={{ minWidth: '40px', height: '40px' }}
              >
                {symbol}
              </Button>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MathKeyboardds;
