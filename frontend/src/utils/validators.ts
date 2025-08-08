/**
 * Validation utilities for Pokemon TODO application
 */

// Type definitions
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

// Pokemon types enum
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

// Validation functions

/**
 * Validate Pokemon name
 */
export const validatePokemonName = (name: string): ValidationResult => {
  // Remove leading/trailing whitespace
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Pokemon name is required' };
  }
  
  if (trimmedName.length < 1) {
    return { isValid: false, error: 'Pokemon name must be at least 1 character' };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Pokemon name cannot exceed 100 characters' };
  }
  
  // Allow any characters including Japanese, emoji, etc.
  // Just ensure it's not empty (already checked above)
  
  return { isValid: true };
};

/**
 * Validate Pokemon type
 */
export const validatePokemonType = (type: string): ValidationResult => {
  if (!type) {
    return { isValid: false, error: 'Pokemon type is required' };
  }
  
  if (!POKEMON_TYPES.includes(type as PokemonType)) {
    return { isValid: false, error: `Invalid Pokemon type. Must be one of: ${POKEMON_TYPES.join(', ')}` };
  }
  
  return { isValid: true };
};

/**
 * Validate Move/Task name
 */
export const validateMoveName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Move name is required' };
  }
  
  if (trimmedName.length < 1) {
    return { isValid: false, error: 'Move name must be at least 1 character' };
  }
  
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Move name cannot exceed 100 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate Move description
 */
export const validateMoveDescription = (description: string | undefined): ValidationResult => {
  if (!description) {
    return { isValid: true }; // Description is optional
  }
  
  const trimmedDesc = description.trim();
  
  if (trimmedDesc.length > 500) {
    return { isValid: false, error: 'Description cannot exceed 500 characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate Move power
 */
export const validateMovePower = (power: number | string): ValidationResult => {
  const numPower = typeof power === 'string' ? parseInt(power, 10) : power;
  
  if (isNaN(numPower)) {
    return { isValid: false, error: 'Power must be a valid number' };
  }
  
  if (numPower < 1) {
    return { isValid: false, error: 'Power must be at least 1' };
  }
  
  if (numPower > 100) {
    return { isValid: false, error: 'Power cannot exceed 100' };
  }
  
  return { isValid: true };
};

/**
 * Validate email (for future user features)
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string = 'Field'): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string = 'Field'): ValidationResult => {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string = 'Field'): ValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Validate number range
 */
export const validateRange = (
  value: number | string, 
  min: number, 
  max: number, 
  fieldName: string = 'Value'
): ValidationResult => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (numValue < min || numValue > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true };
};

/**
 * Combine multiple validators
 */
export const combineValidators = (
  ...validators: Array<() => ValidationResult>
): ValidationResult => {
  for (const validator of validators) {
    const result = validator();
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

/**
 * Create custom validator
 */
export const createValidator = (
  rules: ValidationRule[]
) => (value: any): ValidationResult => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true };
};

/**
 * Sanitize input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
};

/**
 * Format Pokemon name
 */
export const formatPokemonName = (name: string): string => {
  // Just trim and normalize spaces
  // Don't change case for non-Latin characters
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Validate form data
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = <T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationResult>
): FormValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [field, validator] of Object.entries(validators) as [keyof T, (value: any) => ValidationResult][]) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors[field as string] = result.error || 'Invalid value';
      isValid = false;
    }
  }
  
  return { isValid, errors };
};