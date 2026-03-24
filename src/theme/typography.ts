import type { TextStyle } from 'react-native';

type TypographyVariant = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'letterSpacing' | 'textTransform'
>;

export const typography = {
  headingXL: {
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -0.02 * 48,
  } satisfies TypographyVariant,

  headingL: {
    fontFamily: 'Inter',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.02 * 40,
  } satisfies TypographyVariant,

  headingM: {
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.02 * 30,
  } satisfies TypographyVariant,

  headingS: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.02 * 24,
  } satisfies TypographyVariant,

  bodyL: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
  } satisfies TypographyVariant,

  bodyM: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
  } satisfies TypographyVariant,

  bodyS: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
  } satisfies TypographyVariant,

  labelL: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1 * 14,
    textTransform: 'uppercase' as const,
  } satisfies TypographyVariant,

  labelM: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15 * 12,
    textTransform: 'uppercase' as const,
  } satisfies TypographyVariant,

  labelS: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2 * 10,
    textTransform: 'uppercase' as const,
  } satisfies TypographyVariant,
} as const;
