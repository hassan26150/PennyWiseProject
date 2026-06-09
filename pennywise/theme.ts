/**
 * PennyWise Design System — Single Source of Truth
 * ──────────────────────────────────────────────────
 * Official palette extracted from AuthScreen + BuyerHome.
 * Every screen MUST import colors/spacing from here.
 */

export const COLORS = {
  // ── Brand Palette (teal family) ──
  primary:       '#005461',   // deep teal  — headers, nav active, primary buttons
  secondary:     '#018790',   // medium teal — secondary elements, icons
  accent:        '#00B7B5',   // bright teal — highlights, gradients end

  // ── Semantic Colors ──
  success:       '#10B981',   // emerald — positive indicators, discounts
  warning:       '#F59E0B',   // amber — warnings (used sparingly)
  error:         '#EF4444',   // red — destructive actions, errors
  star:          '#FBBF24',   // amber — star ratings only

  // ── Backgrounds ──
  background:    '#f0fdfd',   // light teal tint — screen backgrounds
  card:          '#FFFFFF',   // white — card surfaces
  inputBg:       '#f9f9f9',   // light gray — input backgrounds
  authBg:        '#E0F2F1',   // auth screen background

  // ── Text ──
  textPrimary:   '#111827',   // near-black
  textSecondary: '#6B7280',   // gray
  textMuted:     '#9CA3AF',   // lighter gray
  textOnPrimary: '#FFFFFF',   // white on colored backgrounds

  // ── Borders & Dividers ──
  border:        '#E5E7EB',   // standard border
  borderLight:   '#F3F4F6',   // subtle border

  // ── Tinted Surfaces (for badges, tinted cards) ──
  primaryTint:   'rgba(0,84,97,0.08)',
  secondaryTint: 'rgba(1,135,144,0.10)',
  accentTint:    'rgba(0,183,181,0.10)',
  successTint:   'rgba(16,185,129,0.10)',
  errorTint:     'rgba(239,68,68,0.10)',

  // ── Gradients ──
  gradientPrimary:   ['#005461', '#018790'] as [string, string],
  gradientFull:      ['#005461', '#018790', '#00B7B5'] as [string, string, string],
  gradientAccent:    ['#018790', '#00B7B5'] as [string, string],
  gradientSuccess:   ['#10B981', '#059669'] as [string, string],

  // ── Bottom Nav ──
  navInactive:   '#9CA3AF',
  navActive:     '#005461',

  // ── Misc ──
  overlay:       'rgba(0,0,0,0.5)',
  white:         '#FFFFFF',
  black:         '#000000',
  transparent:   'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 50,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  hero: 28,
  display: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
