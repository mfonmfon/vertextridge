/**
 * Avatar utility functions for generating initials-based avatars
 */

/**
 * Get initials from a full name
 * @param {string} name - Full name (e.g., "John Doe")
 * @returns {string} - Initials (e.g., "JD")
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  
  // Get first letter of first name and first letter of last name
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
};

/**
 * Generate a consistent color based on the user's name
 * @param {string} name - User's name
 * @returns {string} - CSS color value
 */
export const getAvatarColor = (name) => {
  if (!name) return '#056dff'; // Default primary color
  
  const colors = [
    '#056dff', // Primary blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ];
  
  // Generate a consistent index based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Generate SVG avatar with initials
 * @param {string} name - User's name
 * @param {number} size - Avatar size in pixels (default: 40)
 * @returns {string} - Data URL for SVG avatar
 */
export const generateAvatarSVG = (name, size = 40) => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  const fontSize = Math.round(size * 0.4); // 40% of avatar size
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text 
        x="${size/2}" 
        y="${size/2}" 
        text-anchor="middle" 
        dominant-baseline="central" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${fontSize}" 
        font-weight="600" 
        fill="white"
      >${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Check if a URL is a valid image URL (not a placeholder)
 * @param {string} url - Image URL to check
 * @returns {boolean} - True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for placeholder URLs
  const placeholderPatterns = [
    'pravatar.cc',
    'placeholder',
    'example.com',
    'via.placeholder',
    'picsum.photos',
    'lorempixel',
    'dummyimage'
  ];
  
  return !placeholderPatterns.some(pattern => url.includes(pattern));
};

/**
 * Get the appropriate avatar source (image URL or generated SVG)
 * @param {Object} user - User object with name and avatar_url
 * @param {number} size - Avatar size in pixels
 * @returns {string} - Avatar source URL
 */
export const getAvatarSrc = (user, size = 40) => {
  if (!user) return generateAvatarSVG('User', size);
  
  const { name, avatar_url } = user;
  
  // If we have a valid avatar URL, use it
  if (avatar_url && isValidImageUrl(avatar_url)) {
    return avatar_url;
  }
  
  // Otherwise, generate initials avatar
  return generateAvatarSVG(name || user.email || 'User', size);
};