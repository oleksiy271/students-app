import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  EditablePreferenceKeys,
  PreferencesContext,
  PreferencesContextProps,
  editablePreferenceKeys,
  objectPreferenceKeys,
} from '../contexts/PreferencesContext';

export const PreferencesProvider = ({ children }: PropsWithChildren) => {
  const [preferencesContext, setPreferencesContext] =
    useState<PreferencesContextProps>({
      colorScheme: 'system',
      courses: {},
      language: 'system',
      updatePreference: () => {},
    });

  const preferencesInitialized = useRef<boolean>(false);

  const updatePreference = (key: EditablePreferenceKeys, value: unknown) => {
    const stringKey = key.toString();
    if (value === null) {
      AsyncStorage.removeItem(stringKey).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [stringKey]: value,
        })),
      );
    } else {
      let storageValue: string;

      if (objectPreferenceKeys.includes(key)) {
        storageValue = JSON.stringify(value);
      } else {
        storageValue = value as string;
      }

      AsyncStorage.setItem(stringKey, storageValue).then(() =>
        setPreferencesContext(oldP => ({
          ...oldP,
          [stringKey]: value,
        })),
      );
    }
  };

  // Initialize preferences from AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet(editablePreferenceKeys).then(storagePreferences => {
      const preferences: Partial<PreferencesContextProps> = {
        updatePreference,
      };
      storagePreferences.map(([key, value]) => {
        if (value === null) return;

        const typedKey = key as EditablePreferenceKeys;

        if (objectPreferenceKeys.includes(key)) {
          preferences[typedKey] = JSON.parse(value) ?? {};
        } else {
          preferences[typedKey] = value as any;
        }
      });

      setPreferencesContext(oldP => {
        return { ...oldP, ...preferences };
      });
    });
  }, []);

  // Preferences are loaded
  useEffect(() => {
    preferencesInitialized.current = true;
  }, [preferencesContext]);

  return (
    <PreferencesContext.Provider value={preferencesContext}>
      {preferencesInitialized.current && children}
    </PreferencesContext.Provider>
  );
};
