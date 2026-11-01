import React from 'react';

export default function InputCustomizado({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false,
  step = 'any',
  style = {}
}) {
  
  // Garante que valores nulos ou zero inicial apareçam limpos para edição
  const valorExibido = (value === null || value === undefined || (type === 'number' && value === 0)) 
    ? '' 
    : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', ...style }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        step={step}
        placeholder={placeholder}
        required={required}
        value={valorExibido}
        onChange={onChange}
        style={{
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          outline: 'none',
          transition: 'border-color 0.2s',
          width: '100%',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
      />
    </div>
  );
}