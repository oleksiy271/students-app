import { Dimensions, Platform } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const IS_ANDROID = Platform.OS === 'android';
export const IS_IOS = Platform.OS === 'ios';

export const courseColors = [
  { name: 'colors.red', color: '#DC2626' },
  { name: 'colors.orange', color: '#EA580C' },
  { name: 'colors.amber', color: '#D97706' },
  { name: 'colors.yellow', color: '#CA8A04' },
  { name: 'colors.lime', color: '#65A30D' },
  { name: 'colors.green', color: '#16A34A' },
  { name: 'colors.emerald', color: '#059669' },
  { name: 'colors.teal', color: '#0D9488' },
  { name: 'colors.cyan', color: '#0891B2' },
  { name: 'colors.lightBlue', color: '#0284C7' },
  { name: 'colors.blue', color: '#2563EB' },
  { name: 'colors.indigo', color: '#4F46E5' },
  { name: 'colors.violet', color: '#7C3AED' },
  { name: 'colors.purple', color: '#9333EA' },
  { name: 'colors.fuchsia', color: '#C026D3' },
  { name: 'colors.pink', color: '#DB2777' },
  { name: 'colors.rose', color: '#E11D48' },
];
