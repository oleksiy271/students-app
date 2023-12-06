import { PropsWithChildren, useMemo } from 'react';
import {
  StyleProp,
  TextStyle,
  TouchableHighlightProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { UnreadBadge } from '@lib/ui/components/UnreadBadge';

import color from 'color';

import { useTheme } from '../hooks/useTheme';
import { Text } from './Text';

export interface Props {
  selected?: boolean;
  textStyle?: StyleProp<TextStyle>;
  badge?: number | string;
}

/**
 * A tab component to be used with Tabs
 */
export const Tab = ({
  children,
  style,
  selected = false,
  textStyle,
  badge,
  ...rest
}: PropsWithChildren<TouchableHighlightProps & Props>) => {
  const { dark, palettes, spacing, fontWeights } = useTheme();
  const backgroundColor = useMemo(
    () =>
      selected
        ? palettes.primary[500]
        : color(palettes.primary[dark ? 600 : 50])
            .alpha(0.4)
            .toString(),
    [selected, dark, palettes],
  );

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessible={true}
      accessibilityState={{
        selected,
      }}
      style={[
        {
          backgroundColor,
          borderRadius: 10,
          paddingHorizontal: spacing[2.5],
          paddingVertical: spacing[1.5],
        },
        style,
      ]}
      {...rest}
    >
      <View style={{ position: 'relative' }}>
        <Text
          style={[
            {
              color: selected
                ? palettes.text[50]
                : dark
                ? palettes.primary[400]
                : palettes.primary[500],
              fontWeight: fontWeights.medium,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
        {badge && (
          <UnreadBadge
            text={badge}
            style={{
              position: 'absolute',
              right: -15,
              top: -12,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
