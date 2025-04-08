import Link from 'next/link';

export default function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  full = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center transition-colors duration-200 font-semibold';
  const sizeStyles = 'px-8 py-4 text-lg';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    outline: 'bg-transparent text-gray-600 border-2 border-gray-300 hover:border-primary-600 hover:text-primary-600',
    ghost: 'bg-transparent text-gray-600 hover:text-primary-600',
  };

  const classes = `${baseStyles} ${sizeStyles} ${variants[variant]} rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${full ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 