// Simple hash function for integrity checking
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Create integrity signature for auth data
export const createAuthSignature = (token, userData, expiry) => {
  const dataString = `${token}|${JSON.stringify(userData)}|${expiry}`;
  return simpleHash(dataString);
};

// Verify auth data integrity
export const verifyAuthSignature = (token, userData, expiry, signature) => {
  const expectedSignature = createAuthSignature(token, userData, expiry);
  return signature === expectedSignature;
};

// Check if localStorage has been tampered with
export const validateAuthData = () => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  const expiry = localStorage.getItem('token_expiry');
  const signature = localStorage.getItem('auth_signature');

  if (!token || !userData || !expiry || !signature) {
    return false;
  }

  try {
    const parsedUserData = JSON.parse(userData);
    return verifyAuthSignature(token, parsedUserData, expiry, signature);
  } catch (error) {
    console.error('Auth data validation failed:', error);
    return false;
  }
};

// Sanitize and validate user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS vectors
  return input
    .replace(/[<>]/g, '')
    .trim();
};

// Check if token is about to expire (within 5 minutes)
export const isTokenExpiringSoon = () => {
  const expiry = localStorage.getItem('token_expiry');
  if (!expiry) return false;
  
  const now = new Date().getTime();
  const expiryTime = parseInt(expiry);
  const fiveMinutes = 5 * 60 * 1000;
  
  return (expiryTime - now) < fiveMinutes && (expiryTime - now) > 0;
};
