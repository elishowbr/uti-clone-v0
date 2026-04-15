import { calculateAge } from '../app/dashboard/[bedId]/calculateAge';

describe('calculateAge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-31'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "Idade n/a" for null', () => {
    expect(calculateAge(null)).toBe('Idade n/a');
  });

  it('should return "Idade n/a" for undefined', () => {
    expect(calculateAge(undefined)).toBe('Idade n/a');
  });

  it('should calculate age correctly for a string date (birthday today)', () => {
    expect(calculateAge('1996-03-31')).toBe('30 anos');
  });

  it('should calculate age correctly for a Date object', () => {
    const birthDate = new Date('1996-03-31');
    expect(calculateAge(birthDate)).toBe('30 anos');
  });

  it('should decrement age when birthday has not yet occurred this year', () => {
    // Born on April 1 — birthday still hasn't happened in 2026
    expect(calculateAge('1996-04-01')).toBe('29 anos');
  });

  it('should have correct age when birthday is on same month but later day', () => {
    // March 31 system date, born March 30 — birthday already passed
    expect(calculateAge('1996-03-30')).toBe('30 anos');
  });

  it('should handle leap year birth date (Feb 29)', () => {
    // Treating Feb 29 birthday: in non-leap year 2026, March 31 is past Feb 28
    expect(calculateAge('2000-02-29')).toBe('26 anos');
  });

  it('should return "0 anos" for a newborn (born today)', () => {
    expect(calculateAge('2026-03-31')).toBe('0 anos');
  });

  it('should return correct age for an elderly patient', () => {
    expect(calculateAge('1940-01-01')).toBe('86 anos');
  });

  it('should handle ISO timestamp strings', () => {
    expect(calculateAge('1996-03-31T00:00:00.000Z')).toBe('30 anos');
  });
});
