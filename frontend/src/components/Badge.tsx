import React from 'react';

type Props = {
  children: React.ReactNode;
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
};

const COLORS: Record<NonNullable<Props['color']>, string> = {
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const Badge: React.FC<Props> = ({ children, color = 'gray' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${COLORS[color]}`}
    >
      {children}
    </span>
  );
};