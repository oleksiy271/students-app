import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { Icon } from '@lib/ui/components/Icon';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = Omit<FAProps, 'style'> &
  TouchableOpacityProps & {
    iconStyle?: FAProps['style'];
    adjustSpacing?: 'left' | 'right';
    loading?: boolean;
  };

export const IconButton = ({
  iconStyle,
  loading,
  adjustSpacing,
  ...rest
}: Props) => {
  const { spacing } = useTheme();
  const {
    icon,
    height,
    width,
    size,
    color,
    secondaryColor,
    secondaryOpacity,
    mask,
    maskId,
    transform,
    testID,
    ...buttonProps
  } = rest;
  const { style, ...otherButtonProps } = buttonProps;
  const iconProps = {
    icon,
    height,
    width,
    size,
    color,
    secondaryColor,
    secondaryOpacity,
    mask,
    maskId,
    transform,
    testID,
  };
  const padding = spacing[3] as number;
  return (
    <TouchableOpacity
      hitSlop={{
        left: adjustSpacing === 'left' ? padding : undefined,
        right: adjustSpacing === 'right' ? padding : undefined,
      }}
      {...otherButtonProps}
      style={[{ padding }, style]}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Icon
          style={[
            {
              marginLeft: adjustSpacing === 'left' ? -padding : undefined,
              marginRight: adjustSpacing === 'right' ? -padding : undefined,
              opacity: otherButtonProps.disabled ? 0.5 : undefined,
            },
            iconStyle,
          ]}
          {...iconProps}
        />
      )}
    </TouchableOpacity>
  );
};
