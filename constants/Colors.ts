
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF6B35';
const tintColorDark = '#FFA45B';

export const Colors = {
  light: {
    text: '#2D3436',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Background colors for IconCircle component
export const backgroundColors = [
  '#FF6B35', // Primary orange
  '#FFA45B', // Secondary orange
  '#FF8C42', // Accent orange
  '#00B894', // Success green
  '#E17055', // Error red
  '#74B9FF', // Blue
  '#A29BFE', // Purple
  '#FD79A8', // Pink
  '#FDCB6E', // Yellow
  '#6C5CE7', // Violet
];
