import React from 'react';
import { getAvatarSrc, getInitials, getAvatarColor } from '../utils/avatarUtils';

const Avatar = ({ 
  user, 
  size = 40, 
  className = '', 
  showFallback = true,
  onClick = null 
}) => {
  const avatarSrc = getAvatarSrc(user, size);
  const initials = getInitials(user?.name || user?.email || 'User');
  const backgroundColor = getAvatarColor(user?.name || user?.email || 'User');

  const baseClasses = `
    inline-flex items-center justify-center 
    rounded-full overflow-hidden 
    bg-gray-100 text-white font-semibold
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    fontSize: Math.round(size * 0.4),
    backgroundColor: backgroundColor
  };

  // If we have a valid image URL, show image with fallback
  if (avatarSrc.startsWith('http')) {
    return (
      <div 
        className={baseClasses}
        style={style}
        onClick={onClick}
      >
        <img
          src={avatarSrc}
          alt={user?.name || 'User'}
          className="w-full h-full object-cover"
          onError={(e) => {
            if (showFallback) {
              // Replace with initials on error
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ display: 'none' }}
        >
          {initials}
        </div>
      </div>
    );
  }

  // For SVG data URLs or fallback, show initials
  if (avatarSrc.startsWith('data:image/svg')) {
    return (
      <img
        src={avatarSrc}
        alt={user?.name || 'User'}
        className={`${baseClasses} bg-transparent`}
        style={{ width: size, height: size }}
        onClick={onClick}
      />
    );
  }

  // Final fallback - pure CSS initials
  return (
    <div 
      className={baseClasses}
      style={style}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};

export default Avatar;