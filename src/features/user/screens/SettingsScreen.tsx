import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { stat, unlink } from 'react-native-fs';

import { faBroom, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

import i18next from 'i18next';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useDeviceLanguage } from '../../../core/hooks/useDeviceLanguage';
import { lightTheme } from '../../../core/themes/light';
import { formatFileSize } from '../../../utils/files';
import { useCoursesFilesCache } from '../../teaching/hooks/useCourseFilesCache';

const CleanCacheListItem = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const filesCache = useCoursesFilesCache();
  const [cacheSize, setCacheSize] = useState<number>(null);
  const confirm = useConfirmationDialog({
    title: t('common.areYouSure?'),
    message: t('settingsScreen.cleanCacheConfirmMessage'),
  });
  const refreshSize = () => {
    if (filesCache) {
      stat(filesCache)
        .then(({ size }) => {
          setCacheSize(size);
        })
        .catch(() => {
          setCacheSize(0);
        });
    }
  };

  useEffect(refreshSize, [filesCache]);
  return (
    <ListItem
      isNavigationAction
      title={t('common.cleanCourseFiles')}
      subtitle={t('coursePreferencesScreen.cleanCourseFilesSubtitle', {
        size: cacheSize == null ? '-- MB' : formatFileSize(cacheSize),
      })}
      disabled={cacheSize === 0}
      leadingItem={<Icon icon={faBroom} size={fontSizes['2xl']} />}
      onPress={async () => {
        if (filesCache && (await confirm())) {
          await unlink(filesCache);
          refreshSize();
        }
      }}
    />
  );
};

const ThemeIcon = () => {
  const colorSchema: Record<string, string> = {
    dark: lightTheme?.colors.darkBlue[900],
    light: lightTheme?.colors.lightBlue[200],
  };
  const { colorScheme } = useContext(PreferencesContext);

  if (colorScheme === 'system') {
    return <Icon icon={faCircleHalfStroke} size={30} />;
  }

  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colorSchema[colorScheme],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

const VisualizationListItem = () => {
  const { t } = useTranslation();
  const { colorScheme, updatePreference } = useContext(PreferencesContext);
  const settingsColorScheme = useColorScheme();

  const colorSchema = {
    dark: lightTheme?.colors.darkBlue[900],
    light: lightTheme?.colors.lightBlue[200],
  };

  const themeColors = [
    {
      colorSchema: 'dark',
      id: 'dark',
      title: 'theme.dark',
      color: colorSchema.dark,
      state: 'dark' === colorScheme,
      image: 'circle.fill',
    },
    {
      colorSchema: 'light',
      id: 'light',
      title: 'theme.light',
      color: colorSchema.light,
      state: 'dark' === colorScheme,
      image: 'circle.fill',
    },
    {
      colorSchema: 'light',
      id: 'system',
      title: 'theme.system',
      color:
        colorScheme === 'dark' ||
        (colorScheme === 'system' && settingsColorScheme === 'dark')
          ? 'white'
          : colorSchema.dark,
      state: colorScheme === 'system',
      image: 'circle.lefthalf.fill',
    },
  ];

  const themeLabel = (cc: string) => {
    return cc === 'system'
      ? `${t(`theme.${cc}`)} (${t(`theme.${settingsColorScheme}`)})`
      : t(`theme.${cc}`);
  };

  return (
    <MenuView
      actions={themeColors.map(cc => {
        return {
          id: cc.id,
          title: themeLabel(cc.id),
          image: cc.image,
          imageColor: cc.color,
          state: cc.id === colorScheme ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        const val = event as 'light' | 'dark' | 'system';
        updatePreference('colorScheme', val);
      }}
    >
      <ListItem
        title={themeLabel(colorScheme)}
        isNavigationAction
        leadingItem={<ThemeIcon />}
      />
    </MenuView>
  );
};
const LanguageListItem = () => {
  const { t } = useTranslation();
  const { language, updatePreference } = useContext(PreferencesContext);
  const deviceLanguage = useDeviceLanguage();

  const languageLabel = (cc: string) => {
    return cc === 'system'
      ? `${t(`common.${cc}`)} (${t(`common.${deviceLanguage}`)})`
      : t(`common.${cc}`);
  };

  return (
    <MenuView
      actions={['it', 'en', 'system'].map(cc => {
        return {
          id: cc,
          title: languageLabel(cc),
          state: cc === language ? 'on' : undefined,
        };
      })}
      onPressAction={({ nativeEvent: { event } }) => {
        const lang = event as 'it' | 'en' | 'system';
        updatePreference('language', lang);
        i18next
          .changeLanguage(lang === 'system' ? deviceLanguage : lang)
          .then(() => console.debug('language changed', lang));
      }}
    >
      <ListItem isNavigationAction title={languageLabel(language)} />
    </MenuView>
  );
};
const NotificationListItem = () => {
  const { t } = useTranslation();
  const { notifications, updatePreference } = useContext(PreferencesContext);

  const onChangeNotification =
    (notificationType: string) => (value: boolean) => {
      updatePreference('notifications', {
        ...notifications,
        [notificationType]: value,
      });
    };

  return (
    <>
      <SwitchListItem
        title={t('notifications.important')}
        value={notifications?.important}
        onChange={onChangeNotification('important')}
      />
      <SwitchListItem
        title={t('notifications.events')}
        value={notifications?.events}
        onChange={onChangeNotification('events')}
      />
      <SwitchListItem
        title={t('notifications.reservationPresence')}
        value={notifications?.presence}
        onChange={onChangeNotification('presence')}
      />
    </>
  );
};

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={bottomBarAwareStyles}
      >
        <View style={styles.container}>
          <Section>
            <SectionHeader title={t('common.visualization')} />
            <SectionList indented>
              <VisualizationListItem />
            </SectionList>
          </Section>
          <Section>
            <SectionHeader title={t('common.language')} />
            <SectionList indented>
              <LanguageListItem />
            </SectionList>
          </Section>
          <Section>
            <SectionHeader title={t('common.notifications')} />
            <SectionList indented>
              <NotificationListItem />
            </SectionList>
          </Section>
          <Section>
            <SectionHeader title={t('common.cache')} />
            <SectionList indented>
              <CleanCacheListItem />
            </SectionList>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
  });
