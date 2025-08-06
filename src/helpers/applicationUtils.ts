// Application-specific utility functions for user and lead management

/**
 * Interface for lead/user details
 */
export interface LeadDetails {
  id?: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the full name of a lead by using its full name field from the database
 * or by combining first and last names, or returns an empty string
 * 
 * @param leadDetails - Lead details object
 * @returns Full name string
 */
export const getFullName = (leadDetails: LeadDetails = {}): string => {
  let fullName: string;
  
  if (leadDetails.name) {
    fullName = leadDetails.name;
  } else {
    const firstName = leadDetails.first_name || '';
    const lastName = leadDetails.last_name || '';
    fullName = `${firstName} ${lastName}`.trim();
  }

  return fullName;
};

/**
 * Get display name with fallback to "Unknown User"
 * 
 * @param leadDetails - Lead details object
 * @param fallback - Fallback text when no name is available
 * @returns Display name string
 */
export const getDisplayName = (
  leadDetails: LeadDetails = {}, 
  fallback: string = 'Unknown User'
): string => {
  const fullName = getFullName(leadDetails);
  return fullName || fallback;
};

/**
 * Get user initials for avatar display
 * 
 * @param leadDetails - Lead details object
 * @param maxInitials - Maximum number of initials (default 2)
 * @returns Initials string (e.g., "JD" for John Doe)
 */
export const getUserInitials = (
  leadDetails: LeadDetails = {}, 
  maxInitials: number = 2
): string => {
  const fullName = getFullName(leadDetails);
  
  if (!fullName) {
    return 'U'; // Default to 'U' for User
  }

  const nameParts = fullName.split(' ').filter(part => part.length > 0);
  const initials = nameParts
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'U';
};

/**
 * Get formatted contact information
 * 
 * @param leadDetails - Lead details object
 * @returns Object with formatted contact info
 */
export const getContactInfo = (leadDetails: LeadDetails = {}) => {
  return {
    email: leadDetails.email || '',
    phone: leadDetails.phone || '',
    location: getFormattedLocation(leadDetails),
    fullName: getFullName(leadDetails),
    displayName: getDisplayName(leadDetails),
    initials: getUserInitials(leadDetails),
  };
};

/**
 * Get formatted location string (city, country)
 * 
 * @param leadDetails - Lead details object
 * @returns Formatted location string
 */
export const getFormattedLocation = (leadDetails: LeadDetails = {}): string => {
  const { city, country } = leadDetails;
  
  if (city && country) {
    return `${city}, ${country}`;
  } else if (city) {
    return city;
  } else if (country) {
    return country;
  }
  
  return '';
};

/**
 * Check if user has complete profile information
 * 
 * @param leadDetails - Lead details object
 * @returns Boolean indicating if profile is complete
 */
export const hasCompleteProfile = (leadDetails: LeadDetails = {}): boolean => {
  const requiredFields = ['first_name', 'last_name', 'email'];
  return requiredFields.every(field => leadDetails[field as keyof LeadDetails]);
};

/**
 * Get missing profile fields
 * 
 * @param leadDetails - Lead details object
 * @returns Array of missing required field names
 */
export const getMissingProfileFields = (leadDetails: LeadDetails = {}): string[] => {
  const requiredFields = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
  ];
  
  return requiredFields
    .filter(field => !leadDetails[field.key as keyof LeadDetails])
    .map(field => field.label);
};

/**
 * Validate email format
 * 
 * @param email - Email string
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 * 
 * @param phone - Phone number string
 * @returns Boolean indicating if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number for display
 * 
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Basic formatting for international numbers
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  return cleaned;
};

/**
 * Get user avatar color based on name
 * 
 * @param leadDetails - Lead details object
 * @returns Hex color string
 */
export const getUserAvatarColor = (leadDetails: LeadDetails = {}): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const name = getFullName(leadDetails);
  if (!name) return colors[0];
  
  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Default export for convenience
export default {
  getFullName,
  getDisplayName,
  getUserInitials,
  getContactInfo,
  getFormattedLocation,
  hasCompleteProfile,
  getMissingProfileFields,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  getUserAvatarColor,
};