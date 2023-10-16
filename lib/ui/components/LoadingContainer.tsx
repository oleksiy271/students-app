import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useScreenReader } from '../../../src/core/hooks/useScreenReader';

type Props = PropsWithChildren<{
  loading: boolean;
}>;
export const LoadingContainer = ({ children, loading, ...rest }: Props) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isEnabled, announce } = useScreenReader();

  return (
    <View
      accessible={false}
      onAccessibilityTap={() => {
        if (loading && isEnabled) {
          announce(t('common.loading'));
        }
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          style={{
            marginVertical: spacing[8],
          }}
        />
      ) : (
        children
      )}
    </View>
  );
};
