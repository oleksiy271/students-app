import { PropsWithChildren } from 'react';
import { Platform, View, ViewProps } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export type Props = PropsWithChildren<
  ViewProps & {
    /**
     * Toggles the rounded corners
     */
    rounded?: boolean;

    /**
     * Toggles the outer spacing
     */
    spaced?: boolean;
  }
>;

/**
 * Renders an elevated surface on Android and a
 * flat card on iOS
 */
export const Card = ({
  children,
  style,
  spaced = Platform.select({ ios: true, android: false }),
  rounded = Platform.select({ ios: true, android: false }),
  ...rest
}: Props) => {
  const { colors, shapes, spacing } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: rounded ? shapes.lg : undefined,
          backgroundColor: colors.surface,
          elevation: 2,
          overflow: rounded ? 'hidden' : undefined,
          marginHorizontal: spaced ? spacing[5] : undefined,
          marginVertical: spaced ? spacing[2] : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
