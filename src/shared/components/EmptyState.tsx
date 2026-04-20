import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 }, px: 3 }}>
    {/* Icon container with outer dashed ring */}
    <Box
      sx={{
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: '50%',
        mx: 'auto',
        mb: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle, rgba(25,93,230,0.08) 0%, rgba(25,93,230,0.03) 60%, transparent 100%)',
      }}
    >
      {/* Outer dashed ring */}
      <Box
        sx={{
          position: 'absolute',
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: '1.5px dashed rgba(25,93,230,0.15)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      {/* Render the icon */}
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, {
            sx: {
              fontSize: 36,
              color: 'text.disabled',
              ...((icon as React.ReactElement<any>).props?.sx ?? {}),
            },
          })
        : icon}
    </Box>

    <Typography
      variant='h6'
      sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75 }}
    >
      {title}
    </Typography>

    {description && (
      <Typography
        variant='body2'
        sx={{
          color: 'text.disabled',
          lineHeight: 1.8,
          maxWidth: 280,
          mx: 'auto',
        }}
      >
        {description}
      </Typography>
    )}

    {actionLabel && onAction && (
      <Button
        variant='outlined'
        size='small'
        onClick={onAction}
        sx={{ mt: 2.5, borderRadius: 3, fontWeight: 600 }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
