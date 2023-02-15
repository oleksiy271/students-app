import { createContext, useContext } from 'react';

export const editablePreferenceKeys = [
  'clientId',
  'colorScheme',
  'courses',
  'language',
  'notifications',
] as const;

export type EditablePreferenceKeys = typeof editablePreferenceKeys[number];

// Specify here complex keys, that require serialization/deserialization
export const objectPreferenceKeys = ['courses', 'notifications'];

export type PreferencesContextProps = {
  clientId?: string;
  colorScheme?: 'light' | 'dark' | 'system';
  courses: {
    [courseId: number]: CoursePreferencesProps;
  };
  language?: 'it' | 'en' | 'system';
  notifications?: {
    important: boolean;
    events: boolean;
    presence: boolean;
  };
  updatePreference: (key: EditablePreferenceKeys, value: unknown) => void;
};

export interface CoursePreferencesProps {
  color: string;
  icon: string;
  isHidden: boolean;
  order?: number;
}

export const PreferencesContext = createContext<
  PreferencesContextProps | undefined
>(undefined);

export const usePreferencesContext = () => {
  const preferencesContext = useContext(PreferencesContext);
  if (!preferencesContext)
    throw new Error(
      'No PreferencesContext.Provider found when calling usePreferencesContext.',
    );
  return preferencesContext;
};
