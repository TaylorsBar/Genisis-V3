
import React from 'react';

const ARIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.792V7.423a2.25 2.25 0 00-1.24-2.012L13.5 2.25a2.25 2.25 0 00-2.004 0L5.244 5.41A2.25 2.25 0 004 7.423v5.369a2.25 2.25 0 001.24 2.012l6.256 3.159a2.25 2.25 0 002.004 0l1.791-.904M21 12.792L13.5 16.5M4 12.792L10.5 9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21V12.75M13.5 16.5L10.5 9" />
  </svg>
);

export default ARIcon;
