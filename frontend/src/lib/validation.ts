const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_PATTERN.test(value.trim());

/** Errors keyed by field name; empty object means the form is valid. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;
