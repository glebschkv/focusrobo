import { createContext, useContext, ReactNode, useMemo } from 'react';

// Theme accent colors that adapt to each background
export interface ThemeColors {
  // Timer ring gradient
  ringStart: string;
  ringMid: string;
  ringEnd: string;
  // Ring track & glow
  ringTrackColor: string;
  ringPulseColor: string;
  // Glow effects
  glow: string;
  glowStrong: string;
  // Text and UI — "text" is the universal base text color
  text: string;
  textSecondary: string;
  // Glass morphism
  glassBg: string;
  glassBorder: string;
  glassBlur: number;
  glassHighlight: string;
  // Button styling
  buttonGradient: string;
  buttonShadowColor: string;
  buttonTextShadow: string;
  // Timer typography
  timerFontWeight: number;
  timerLetterSpacing: string;
  timerTextShadow: string;
  // Status indicators
  activeGlow: string;
  // Particle theming
  particleColor: string;
}

export const themeColorMap: Record<string, ThemeColors> = {
  sky: {
    ringStart: 'hsl(195 65% 55%)',
    ringMid: 'hsl(160 55% 52%)',
    ringEnd: 'hsl(45 75% 62%)',
    ringTrackColor: 'hsl(200 20% 75% / 0.3)',
    ringPulseColor: 'hsl(45 75% 70%)',
    glow: 'hsl(200 60% 60% / 0.4)',
    glowStrong: 'hsl(200 70% 65% / 0.6)',
    text: 'hsl(220 30% 20%)',
    textSecondary: 'hsl(220 20% 40%)',
    glassBg: 'hsl(200 40% 30% / 0.25)',
    glassBorder: 'hsl(200 30% 80% / 0.3)',
    glassBlur: 12,
    glassHighlight: 'hsl(0 0% 100% / 0.15)',
    buttonGradient: 'linear-gradient(135deg, hsl(195 65% 55%), hsl(175 55% 52%))',
    buttonShadowColor: 'hsl(195 60% 50% / 0.4)',
    buttonTextShadow: 'none',
    timerFontWeight: 500,
    timerLetterSpacing: '-0.01em',
    timerTextShadow: 'none',
    activeGlow: 'hsl(200 70% 55%)',
    particleColor: 'hsl(45 50% 90%)',
  },
  night: {
    ringStart: 'hsl(250 55% 68%)',
    ringMid: 'hsl(210 60% 65%)',
    ringEnd: 'hsl(180 50% 62%)',
    ringTrackColor: 'hsl(240 20% 30% / 0.4)',
    ringPulseColor: 'hsl(210 60% 80%)',
    glow: 'hsl(260 50% 70% / 0.5)',
    glowStrong: 'hsl(260 60% 75% / 0.7)',
    text: 'hsl(0 0% 98%)',
    textSecondary: 'hsl(240 20% 80%)',
    glassBg: 'hsl(235 35% 12% / 0.5)',
    glassBorder: 'hsl(260 30% 60% / 0.25)',
    glassBlur: 16,
    glassHighlight: 'hsl(250 30% 60% / 0.1)',
    buttonGradient: 'linear-gradient(135deg, hsl(250 55% 65%), hsl(210 60% 60%))',
    buttonShadowColor: 'hsl(250 50% 60% / 0.4)',
    buttonTextShadow: '0 0 12px hsl(250 60% 80% / 0.3)',
    timerFontWeight: 300,
    timerLetterSpacing: '0.02em',
    timerTextShadow: '0 0 20px hsl(250 60% 80% / 0.25)',
    activeGlow: 'hsl(260 60% 70%)',
    particleColor: 'hsl(180 70% 65%)',
  },
  sunset: {
    ringStart: 'hsl(20 90% 58%)',
    ringMid: 'hsl(345 75% 55%)',
    ringEnd: 'hsl(275 55% 50%)',
    ringTrackColor: 'hsl(280 20% 40% / 0.3)',
    ringPulseColor: 'hsl(40 90% 70%)',
    glow: 'hsl(30 80% 60% / 0.5)',
    glowStrong: 'hsl(25 85% 65% / 0.7)',
    text: 'hsl(0 0% 100%)',
    textSecondary: 'hsl(30 30% 90%)',
    glassBg: 'hsl(280 35% 18% / 0.4)',
    glassBorder: 'hsl(30 50% 70% / 0.25)',
    glassBlur: 14,
    glassHighlight: 'hsl(40 60% 80% / 0.1)',
    buttonGradient: 'linear-gradient(135deg, hsl(20 90% 58%), hsl(345 75% 55%))',
    buttonShadowColor: 'hsl(25 80% 50% / 0.4)',
    buttonTextShadow: '0 1px 3px hsl(25 80% 30% / 0.4)',
    timerFontWeight: 600,
    timerLetterSpacing: '0em',
    timerTextShadow: '0 1px 4px hsl(25 80% 40% / 0.3)',
    activeGlow: 'hsl(30 85% 60%)',
    particleColor: 'hsl(40 80% 75%)',
  },
  snow: {
    ringStart: 'hsl(195 55% 62%)',
    ringMid: 'hsl(170 50% 65%)',
    ringEnd: 'hsl(150 45% 70%)',
    ringTrackColor: 'hsl(210 15% 80% / 0.3)',
    ringPulseColor: 'hsl(170 55% 75%)',
    glow: 'hsl(200 40% 70% / 0.5)',
    glowStrong: 'hsl(200 50% 80% / 0.6)',
    text: 'hsl(210 30% 20%)',
    textSecondary: 'hsl(210 20% 40%)',
    glassBg: 'hsl(210 25% 50% / 0.18)',
    glassBorder: 'hsl(0 0% 100% / 0.45)',
    glassBlur: 14,
    glassHighlight: 'hsl(0 0% 100% / 0.25)',
    buttonGradient: 'linear-gradient(135deg, hsl(195 55% 60%), hsl(170 50% 65%))',
    buttonShadowColor: 'hsl(195 50% 55% / 0.35)',
    buttonTextShadow: 'none',
    timerFontWeight: 400,
    timerLetterSpacing: '0em',
    timerTextShadow: '0 1px 2px hsl(210 20% 80% / 0.2)',
    activeGlow: 'hsl(200 50% 65%)',
    particleColor: 'hsl(0 0% 100%)',
  },
  forest: {
    ringStart: 'hsl(145 55% 48%)',
    ringMid: 'hsl(165 50% 50%)',
    ringEnd: 'hsl(85 55% 52%)',
    ringTrackColor: 'hsl(140 20% 35% / 0.3)',
    ringPulseColor: 'hsl(85 55% 60%)',
    glow: 'hsl(140 45% 55% / 0.5)',
    glowStrong: 'hsl(140 50% 60% / 0.6)',
    text: 'hsl(150 20% 15%)',
    textSecondary: 'hsl(150 15% 35%)',
    glassBg: 'hsl(145 35% 22% / 0.35)',
    glassBorder: 'hsl(140 30% 60% / 0.25)',
    glassBlur: 10,
    glassHighlight: 'hsl(60 40% 80% / 0.1)',
    buttonGradient: 'linear-gradient(135deg, hsl(145 55% 48%), hsl(165 50% 50%))',
    buttonShadowColor: 'hsl(145 50% 40% / 0.4)',
    buttonTextShadow: 'none',
    timerFontWeight: 500,
    timerLetterSpacing: '-0.01em',
    timerTextShadow: 'none',
    activeGlow: 'hsl(140 50% 50%)',
    particleColor: 'hsl(60 100% 75%)',
  },
  city: {
    ringStart: 'hsl(285 65% 62%)',
    ringMid: 'hsl(195 75% 58%)',
    ringEnd: 'hsl(335 65% 58%)',
    ringTrackColor: 'hsl(260 20% 25% / 0.4)',
    ringPulseColor: 'hsl(195 75% 70%)',
    glow: 'hsl(280 50% 65% / 0.5)',
    glowStrong: 'hsl(280 60% 70% / 0.7)',
    text: 'hsl(0 0% 98%)',
    textSecondary: 'hsl(280 20% 75%)',
    glassBg: 'hsl(255 35% 12% / 0.55)',
    glassBorder: 'hsl(280 40% 60% / 0.3)',
    glassBlur: 18,
    glassHighlight: 'hsl(280 40% 60% / 0.08)',
    buttonGradient: 'linear-gradient(135deg, hsl(285 65% 62%), hsl(195 75% 58%))',
    buttonShadowColor: 'hsl(280 60% 55% / 0.4)',
    buttonTextShadow: '0 0 15px hsl(280 60% 70% / 0.5)',
    timerFontWeight: 600,
    timerLetterSpacing: '0.01em',
    timerTextShadow: '0 0 15px hsl(280 60% 70% / 0.35)',
    activeGlow: 'hsl(280 60% 65%)',
    particleColor: 'hsl(280 50% 70%)',
  },
};

interface ThemeContextValue {
  theme: string;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'sky',
  colors: themeColorMap.sky,
});

export const useThemeColors = () => useContext(ThemeContext);

interface ThemeProviderProps {
  theme: string;
  children: ReactNode;
}

export const FocusThemeProvider = ({ theme, children }: ThemeProviderProps) => {
  const value = useMemo(() => ({
    theme,
    colors: themeColorMap[theme] || themeColorMap.sky,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
