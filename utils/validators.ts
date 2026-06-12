export interface ValidationError {
  field: string;
  message: string;
}

const MAX_NAME_LENGTH = 100;
const MIN_NAME_LENGTH = 1;

export function validateName(name: string | undefined): ValidationError | null {
  if (!name || !name.trim()) {
    return { field: 'name', message: 'Name is required' };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { field: 'name', message: `Name must be ${MAX_NAME_LENGTH} characters or less` };
  }
  return null;
}

export function validateAmount(amount: number | string): ValidationError | null {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return { field: 'amount', message: 'Amount must be a valid number' };
  }
  return null;
}

export function validateCategoryName(name: string | undefined): ValidationError | null {
  return validateName(name);
}
