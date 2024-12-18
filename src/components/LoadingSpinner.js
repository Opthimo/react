import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  variant = 'spinner',
  text = '',
  fullScreen = false 
}) => {
  // Größen-Mapping
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Farben-Mapping
  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500'
  };

  // Basis-Spinner-Klassen
  const baseSpinnerClasses = `inline-block rounded-full border-4 border-t-transparent animate-spin ${sizeClasses[size]} ${colorClasses[color]}`;

  // Varianten
  const spinnerVariants = {
    spinner: baseSpinnerClasses,
    dots: `flex space-x-2 ${sizeClasses[size]}`,
    pulse: `relative ${sizeClasses[size]} bg-current rounded-full animate-pulse ${colorClasses[color]}`
  };

  // Container-Klassen basierend auf fullScreen
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50' 
    : 'flex items-center justify-center';

  // Dots-Animation Komponente
  const DotsSpinner = () => (
    <div className={spinnerVariants.dots}>
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={`w-3 h-3 rounded-full ${colorClasses[color].replace('border-', 'bg-')} animate-bounce`}
          style={{ animationDelay: `${dot * 0.1}s` }}
        />
      ))}
    </div>
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {variant === 'dots' ? (
          <DotsSpinner />
        ) : variant === 'pulse' ? (
          <div className={spinnerVariants.pulse} />
        ) : (
          <div className={spinnerVariants.spinner} />
        )}
        {text && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;