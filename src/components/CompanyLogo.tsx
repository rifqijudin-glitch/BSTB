import React from 'react';

export const LogoMMP = ({
  className = '',
  variant = 'full',
  size
}: {
  className?: string;
  variant?: 'full' | 'dots';
  size?: number | string;
}) => {
  if (variant === 'dots') {
    const s = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;
    return (
      <svg
        viewBox="0 0 140 140"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{
          display: 'block',
          width: s || undefined,
          height: s || undefined,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <g transform="translate(70, 70)">
          {/* Black: 9 */}
          {[...Array(9)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 9;
            return <circle key={'b' + i} cx={Math.cos(angle) * 13} cy={Math.sin(angle) * 13} r="3" fill="#1b1b1b" />;
          })}
          {/* Yellow: 12 */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 12 + Math.PI / 12;
            return <circle key={'y' + i} cx={Math.cos(angle) * 25} cy={Math.sin(angle) * 25} r="5" fill="#fdec00" />;
          })}
          {/* Purple: 12 */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            return <circle key={'m' + i} cx={Math.cos(angle) * 40} cy={Math.sin(angle) * 40} r="7.5" fill="#e6007e" />;
          })}
          {/* Blue: 12 */}
          {[...Array(12)].map((_, i) => {
            const angle = ((i + 0.5) * Math.PI * 2) / 12;
            return <circle key={'c' + i} cx={Math.cos(angle) * 59} cy={Math.sin(angle) * 59} r="10" fill="#00a8e8" />;
          })}
        </g>
      </svg>
    );
  }

  const h = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;
  return (
    <svg
      viewBox="0 0 570 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'block',
        height: h || undefined,
        width: 'auto',
        maxWidth: '100%'
      }}
    >
      <g transform="translate(60, 70) scale(0.85)">
        {/* Black: 9 */}
        {[...Array(9)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 9;
          return <circle key={'b' + i} cx={Math.cos(angle) * 13} cy={Math.sin(angle) * 13} r="3" fill="#1b1b1b" />;
        })}
        {/* Yellow: 12 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12 + Math.PI / 12;
          return <circle key={'y' + i} cx={Math.cos(angle) * 25} cy={Math.sin(angle) * 25} r="5" fill="#fdec00" />;
        })}
        {/* Purple: 12 */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          return <circle key={'m' + i} cx={Math.cos(angle) * 40} cy={Math.sin(angle) * 40} r="7.5" fill="#e6007e" />;
        })}
        {/* Blue: 12 */}
        {[...Array(12)].map((_, i) => {
          const angle = ((i + 0.5) * Math.PI * 2) / 12;
          return <circle key={'c' + i} cx={Math.cos(angle) * 59} cy={Math.sin(angle) * 59} r="10" fill="#00a8e8" />;
        })}
      </g>
      <text
        x="130"
        y="65"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="44"
        fontWeight="400"
        letterSpacing="-1.2"
        fill="#1b1b1b"
      >
        mitra multi packaging
      </text>
      <text
        x="135"
        y="95"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="16"
        fontWeight="300"
        letterSpacing="4.5"
        fill="#4a4a4a"
      >
        Flexible Packaging Manufacturer
      </text>
    </svg>
  );
};

export const CompanyLogoDots: React.FC<{ size?: number; className?: string }> = ({ size = 78, className = '' }) => {
  return <LogoMMP variant="dots" size={size} className={className} />;
};

export const CompanyLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'sm',
  className = ''
}) => {
  const height = size === 'sm' ? 36 : size === 'lg' ? 56 : 44;
  return <LogoMMP variant="full" size={height} className={className} />;
};
