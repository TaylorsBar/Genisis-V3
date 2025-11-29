
import React from 'react';

const HederaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 12.5c-1.63 0-3.06.8-3.98 2.03l1.43.95C10.08 14.5 11 14 12 14c1.93 0 3.5 1.57 3.5 3.5S13.93 21 12 21c-1.78 0-3.27-1.34-3.47-3.05H6.54C6.73 19.66 9.11 21 12 21c2.76 0 5-2.24 5-5s-2.24-5-5-5zM12 3c-1.93 0-3.5 1.57-3.5 3.5S10.07 10 12 10s3.5-1.57 3.5-3.5S13.93 3 12 3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

export default HederaIcon;