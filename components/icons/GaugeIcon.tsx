
import React from 'react';

const GaugeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 0V4m0 4l2.5 2.5M6 14h2m6 0h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.515 17.5a9 9 0 0116.97 0" />
  </svg>
);

export default GaugeIcon;
