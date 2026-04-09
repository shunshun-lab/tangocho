export default function Button({ variant = 'primary', disabled, style, ...props }) {
  const base = {
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 0.15s ease',
  };

  const variants = {
    primary: { background: '#3B82F6', color: '#fff' },
    secondary: { background: '#334155', color: '#E2E8F0', borderColor: '#475569' },
    ghost: { background: 'transparent', color: '#E2E8F0', borderColor: '#334155' },
    danger: { background: '#EF4444', color: '#fff' },
  };

  return <button disabled={disabled} style={{ ...base, ...(variants[variant] || variants.primary), ...style }} {...props} />;
}

