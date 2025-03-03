// src/components/ui/Button.tsx
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'slim' | 'danger' | 'success' | 'warning' | 'info' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const baseClasses = 'button';
  const variantClass = `button-${variant}`;
  const sizeClass = `button-${size}`;
  const fullWidthClass = fullWidth ? 'button-full-width' : '';
  const loadingClass = loading ? 'button-loading' : '';
  
  const combinedClassName = [
    baseClasses,
    variantClass,
    sizeClass,
    fullWidthClass,
    loadingClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={combinedClassName} 
      disabled={loading || disabled} 
      {...rest}
    >
      {loading ? (
        <span className="button-loader">
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
        </span>
      ) : null}
      <span className={loading ? 'button-content-loading' : ''}>{children}</span>
    </button>
  );
};

export default Button;