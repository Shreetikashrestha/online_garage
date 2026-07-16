import React from 'react';

export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizeStyles = {
    sm: { width: '1.25rem', height: '1.25rem', borderWidth: '2px' },
    md: { width: '2.5rem', height: '2.5rem', borderWidth: '3px' },
    lg: { width: '4rem', height: '4rem', borderWidth: '4px' },
  };

  const colorStyles = {
    primary: 'var(--accent-primary)',
    secondary: 'var(--accent-secondary)',
    success: 'var(--success)',
    danger: 'var(--danger)',
    white: '#ffffff',
  };

  const style = {
    ...sizeStyles[size],
    borderStyle: 'solid',
    borderColor: `${colorStyles[color]} transparent transparent transparent`,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={style} role="status">
        <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Loading...</span>
      </div>
    </>
  );
}
