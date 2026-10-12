import { Platform, ViewStyle } from 'react-native';

export const ClayColors = {
  // Base backgrounds
  background: '#F6F8FC', // Calm warm cream/soft sky background
  surface: '#FFFFFF',
  surfaceSoft: '#F8FAFD',
  
  // Pastel Clay Palettes
  blueLight: '#E0F2FE',
  blueSurface: '#F0F9FF',
  bluePrimary: '#0284C7',
  blueDark: '#0369A1',
  blueBorder: '#BAE6FD',
  
  lavenderLight: '#EDE9FE',
  lavenderSurface: '#F5F3FF',
  lavenderPrimary: '#7C3AED',
  lavenderDark: '#6D28D9',
  lavenderBorder: '#DDD6FE',

  mintLight: '#DCFCE7',
  mintSurface: '#F0FDF4',
  mintPrimary: '#16A34A',
  mintDark: '#15803D',
  mintDeep: '#15803D',
  mintBorder: '#BBF7D0',

  peachLight: '#FFEDD5',
  peachSurface: '#FFF7ED',
  peachPrimary: '#EA580C',
  peachDark: '#C2410C',
  peachDeep: '#C2410C',
  peachBorder: '#FED7AA',

  creamLight: '#FEF9C3',
  creamSurface: '#FEFCE8',
  creamPrimary: '#CA8A04',
  creamDark: '#A16207',
  creamBorder: '#FEF08A',

  roseLight: '#FFE4E6',
  roseSurface: '#FFF1F2',
  rosePrimary: '#E11D48',
  roseDark: '#BE123C',
  roseDeep: '#BE123C',
  roseBorder: '#FECDD3',

  blueDeep: '#0369A1',
  lavenderText: '#6D28D9',

  // Neutrals & Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverted: '#FFFFFF',

  // Borders & Highlights
  borderLight: 'rgba(255, 255, 255, 0.85)',
  borderSubtle: '#E2E8F0',
  borderClayOuter: '#D9E2EC',
  borderDark: '#CBD5E1',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Assistant Buddy
  buddyPurple: '#6366F1',
  buddyAccent: '#818CF8',
};

export const ClayRadii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
  button: 20,
  input: 18,
  card: 24,
};

export const ClayTypography = {
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: ClayColors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: ClayColors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: ClayColors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: ClayColors.textSecondary,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ClayColors.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: ClayColors.textMuted,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
};

/**
 * Creates multi-layered clay 3D tactile shadow & highlight styles
 * perfectly calibrated for React Native (iOS, Android, Web)
 */
export const ClayShadows = {
  card: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 12px 28px -4px rgba(100, 116, 139, 0.12), 0 4px 10px -2px rgba(100, 116, 139, 0.08), inset 0 2.5px 0 rgba(255, 255, 255, 0.95), inset 0 -3px 0 rgba(203, 213, 225, 0.4)',
    } as any,
    default: {
      shadowColor: '#475569',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 6,
    },
  }) || {},

  cardElevated: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 20px 40px -6px rgba(99, 102, 241, 0.2), 0 10px 20px -4px rgba(100, 116, 139, 0.12), inset 0 3px 0 rgba(255, 255, 255, 0.95), inset 0 -4px 0 rgba(148, 163, 184, 0.35)',
    } as any,
    default: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 9,
    },
  }) || {},

  pod: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 10px 22px -3px rgba(71, 85, 105, 0.12), 0 4px 8px -2px rgba(71, 85, 105, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -3.5px 0 rgba(0, 0, 0, 0.06)',
    } as any,
    default: {
      shadowColor: '#334155',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },
  }) || {},

  button: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 10px 22px -2px rgba(71, 85, 105, 0.2), 0 4px 8px -1px rgba(71, 85, 105, 0.14), inset 0 2.5px 0 rgba(255, 255, 255, 0.8), inset 0 -3.5px 0 rgba(0, 0, 0, 0.18)',
    } as any,
    default: {
      shadowColor: '#334155',
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 7,
    },
  }) || {},

  buttonPressed: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 2px 4px rgba(71, 85, 105, 0.1), inset 0 2px 5px rgba(0, 0, 0, 0.18)',
      transform: 'translateY(2.5px)',
    } as any,
    default: {
      shadowColor: '#334155',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
  }) || {},

  pill: Platform.select<ViewStyle>({
    web: {
      boxShadow: '0 6px 14px -2px rgba(100, 116, 139, 0.12), inset 0 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -2px 0 rgba(203, 213, 225, 0.45)',
    } as any,
    default: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
  }) || {},

  insetInput: Platform.select<ViewStyle>({
    web: {
      boxShadow: 'inset 0 2px 6px rgba(100, 116, 139, 0.14), 0 1.5px 0 rgba(255, 255, 255, 0.9)',
    } as any,
    default: {
      shadowColor: '#94A3B8',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
  }) || {},
};
