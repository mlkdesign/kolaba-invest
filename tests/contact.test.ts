import { describe, expect, it } from 'vitest';
import { validateContact } from '../src/lib/contact';

describe('contact validation', () => {
  it('requires all fields', () => {
    expect(validateContact({ name: ' ', email: '', message: '' })).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
    });
  });
  it('rejects malformed email', () => {
    expect(validateContact({ name: 'A', email: 'investor@', message: 'Hi' })).toEqual({ email: 'invalid' });
  });
  it('accepts a valid enquiry', () => {
    expect(validateContact({ name: 'A', email: 'investor@example.com', message: 'Hi' })).toEqual({});
  });
});
