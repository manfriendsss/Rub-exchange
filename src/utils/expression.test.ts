import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './expression';

describe('evaluateExpression', () => {
  it('respects operator precedence', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
  });

  it('handles decimals', () => {
    expect(evaluateExpression('10.5/2')).toBe(5.25);
  });

  it('returns 0 on divide by zero', () => {
    expect(evaluateExpression('8/0')).toBe(0);
  });

  it('strips unsupported characters safely', () => {
    expect(evaluateExpression('1+2abc')).toBe(3);
  });
});
