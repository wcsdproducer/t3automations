import * as React from 'react';

export const T3Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="40"
    height="40"
    {...props}
  >
    <path
      d="M20 25h60v10H20zM45 25v50h10V25zM35 75h30"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
    />
    <path d="M50 75l-5-5h10z" fill="currentColor" />
    <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="5" rx="10" />
  </svg>
);

export const T3LogoText = ({ className }: { className?: string }) => (
    <span className={`font-bold text-2xl tracking-wider ${className}`}>
        T3 AUTOMATIONS
    </span>
);
