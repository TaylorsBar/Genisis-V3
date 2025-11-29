
import React from 'react';

interface FullScreenIconProps extends React.SVGProps<SVGSVGElement> {
    isFullscreen?: boolean;
}

const FullScreenIcon: React.FC<FullScreenIconProps> = ({ isFullscreen, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
     {isFullscreen ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9l-6-6M15 9h4.5M15 9V4.5M15 9l6-6M9 15v4.5M9 15H4.5M9 15l-6 6M15 15h4.5M15 15v4.5M15 15l6 6" />
     ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
     )}
  </svg>
);

export default FullScreenIcon;
