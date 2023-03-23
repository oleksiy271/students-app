import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
} from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { Col } from '@lib/ui/components/Col';
import { Divider } from '@lib/ui/components/Divider';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  IS_ANDROID,
  IS_IOS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '../../../src/core/constants';
import { GlobalStyles } from '../../../src/core/styles/globalStyles';

interface ActionSheetOption {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  titleAndroid: string;
  titleAndroidStyle?: StyleProp<TextStyle>;
  subtitle?: string;
  subtitleStyle?: StyleProp<TextStyle>;
  icon: any;
  iconStyle?: FAProps['style'];
  onPress: () => void;
}

interface ActionSheetProps {
  options: ActionSheetOption[];
}
export const BUTTON_HEIGHT = IS_IOS ? 50 : 100;

export const ActionSheet = forwardRef(({ options }: ActionSheetProps, ref) => {
  const modalRef = useRef<Modal>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const styles = createStyles(theme);
  const bottomBarHeight = useBottomTabBarHeight();
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const height = useMemo(() => {
    if (IS_IOS) {
      return (options.length + 1) * BUTTON_HEIGHT + bottomBarHeight + 60;
    }
    if (IS_ANDROID) {
      return (
        Math.ceil(options.length / 3) * BUTTON_HEIGHT + bottomBarHeight + 60
      );
    }
    return 0;
  }, [options, bottomBarHeight]);

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const close = (callback?: any) => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setVisible(() => false);
      setTimeout(() => {
        if (!!callback && typeof callback === 'function') {
          callback();
        }
      }, 100);
    });
  };

  useImperativeHandle(ref, () => ({
    show,
    close,
  }));

  const CancelButtonIOS = () => {
    return (
      <Pressable onPress={close} style={styles.cancelButtonIOS}>
        <Text>{t('common.cancel')}</Text>
      </Pressable>
    );
  };

  const onPressOption = (option: ActionSheetOption) => {
    close(option?.onPress || undefined);
  };

  return (
    <Modal
      ref={modalRef}
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={close}
    >
      <Animated.View style={[styles.background, { opacity }]}>
        <Pressable onPress={close} style={GlobalStyles.grow} />
      </Animated.View>
      <Animated.View
        style={[
          styles.container,
          { paddingBottom: 60 },
          { height: translateY, opacity },
        ]}
      >
        <Animated.View style={[styles.optionContainer, { opacity }]}>
          {options.map((option, index) => {
            return (
              <Col key={index}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => onPressOption(option)}
                >
                  <Animated.View
                    style={[IS_ANDROID && styles.iconContainer, { opacity }]}
                  >
                    <Icon
                      icon={option.icon}
                      style={option.iconStyle}
                      color={IS_ANDROID ? colors.surface : undefined}
                      size={IS_ANDROID ? 22 : 20}
                    />
                  </Animated.View>
                  <Col style={styles.optionRow}>
                    <Text
                      numberOfLines={1}
                      style={[
                        IS_IOS && option.titleStyle,
                        IS_ANDROID && option.titleAndroidStyle,
                      ]}
                    >
                      {IS_ANDROID ? option.titleAndroid : option.title}
                    </Text>
                    {IS_IOS && (
                      <Text numberOfLines={1} style={styles.subtitle}>
                        {option.subtitle}
                      </Text>
                    )}
                  </Col>
                </TouchableOpacity>
                {index < options.length - 1 && IS_IOS && (
                  <Divider style={{ width: SCREEN_WIDTH * 0.8 }} />
                )}
              </Col>
            );
          })}
        </Animated.View>
        {IS_IOS && <CancelButtonIOS />}
      </Animated.View>
    </Modal>
  );
});

const createStyles = ({ spacing, colors, fontSizes, shapes }: Theme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      width: SCREEN_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: BUTTON_HEIGHT * 0.7,
      height: BUTTON_HEIGHT * 0.7,
      borderRadius: BUTTON_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary[500],
    },
    optionRow: {
      paddingHorizontal: Platform.select({
        ios: spacing[3],
      }),
    },
    optionContainer: {
      elevation: 12,
      backgroundColor: colors.surface,
      width: SCREEN_WIDTH * 0.95,
      marginBottom: spacing[2],
      borderRadius: shapes.lg,
      flexDirection: Platform.select({
        ios: 'column',
        android: 'row',
      }),
      paddingVertical: Platform.select({
        android: spacing[5],
      }),
      flexWrap: Platform.select({
        android: 'wrap',
      }),
    },
    iconStyleIOS: {
      paddingRight: spacing[5],
    },
    subtitle: {
      fontSize: fontSizes.xs,
      color: colors.text[400],
    },
    background: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      top: 0,
    },
    cancelButtonIOS: {
      width: SCREEN_WIDTH * 0.95,
      height: BUTTON_HEIGHT,
      backgroundColor: colors.surface,
      borderRadius: shapes.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    option: {
      height: BUTTON_HEIGHT,
      paddingHorizontal: spacing[5],
      justifyContent: Platform.select({
        ios: 'flex-start',
        android: 'space-between',
      }),
      alignItems: 'center',
      flexDirection: Platform.select({
        android: 'column',
        ios: 'row',
      }),
      width: IS_IOS ? '100%' : (SCREEN_WIDTH * 0.95) / 3,
    },
  });
