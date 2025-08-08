import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card = ({ children, className, hoverable = false }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-2xl p-6',
        'shadow-neo-light dark:shadow-neo-dark',
        'transition-all duration-300',
        hoverable && 'hover:scale-[1.02] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;