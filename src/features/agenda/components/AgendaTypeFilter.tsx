import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { PillDropdownActivator } from '@lib/ui/components/PillDropdownActivator';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuAction, MenuView } from '@react-native-menu/menu';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { ALL_AGENDA_TYPES, AgendaItemType } from '../types/AgendaItem';

export const AgendaTypeFilter = () => {
  const { t } = useTranslation();
  const getLocalizedType = useCallback(
    (type: AgendaItemType) => {
      return t(
        `common.` + (type === 'exam' ? 'examCall_plural' : `${type}_plural`),
      );
    },
    [t],
  );

  const { agendaScreen, updatePreference } = usePreferencesContext();

  const filters = useMemo(() => {
    return { ...agendaScreen.filters };
  }, [agendaScreen]);

  const toggleFilter = (type: AgendaItemType) => {
    const newVal = {
      ...agendaScreen,
      filters: { ...filters, [type]: !filters[type] },
    };
    updatePreference('agendaScreen', newVal);
  };

  const { colors } = useTheme();

  const colorsMap: Record<AgendaItemType, string | null> = useMemo(() => {
    return {
      booking: colors.bookingCardBorder,
      deadline: colors.deadlineCardBorder,
      exam: colors.examCardBorder,
      lecture: null,
    };
  }, [
    colors.bookingCardBorder,
    colors.deadlineCardBorder,
    colors.examCardBorder,
  ]);

  const styles = useStylesheet(createStyles);

  // Update the pill content when the state changes
  const pillContent = useMemo(() => {
    const selectedTypes: AgendaItemType[] = [];
    Object.entries(filters).forEach(([type, enabled]) => {
      if (enabled) selectedTypes.push(type as AgendaItemType);
    });

    if (selectedTypes.length === 0 || selectedTypes.length === 4) {
      return <Text>{t('common.all')}</Text>;
    } else {
      return selectedTypes.map(type => (
        <View key={type} style={styles.buttonType}>
          <Icon icon={faCircle} color={colorsMap[type] ?? undefined} />
          <Text>{getLocalizedType(type)}</Text>
        </View>
      ));
    }
  }, [filters, colorsMap, getLocalizedType, styles.buttonType, t]);

  const typeActions = useMemo(() => {
    return ALL_AGENDA_TYPES.map(eventType => {
      const typedEventType = eventType as AgendaItemType;
      const title = getLocalizedType(typedEventType);

      return {
        id: eventType,
        title,
        state: (filters[typedEventType] ? 'on' : 'off') as MenuAction['state'],
        imageColor: colorsMap[typedEventType] ?? undefined,
        image: Platform.select({
          ios: 'circle',
          android: 'circle',
        }),
      };
    });
  }, [filters, colorsMap, getLocalizedType]);

  return (
    <MenuView
      actions={typeActions}
      onPressAction={({ nativeEvent: { event } }) => {
        const type = event as AgendaItemType;
        toggleFilter(type);
      }}
    >
      <PillDropdownActivator variant="neutral">
        <View style={styles.typeFilter}>
          <Text key="events">{t('common.event_plural')}:</Text>
          {pillContent}
        </View>
      </PillDropdownActivator>
    </MenuView>
  );
};

const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    typeFilter: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing[2],
      alignItems: 'center',
    },
    buttonType: {
      display: 'flex',
      flexDirection: 'row',
      gap: spacing[1],
      alignItems: 'center',
    },
    tabBooking: {
      borderColor: colors.bookingCardBorder,
    },
    tabDeadline: {
      borderColor: colors.deadlineCardBorder,
    },
    tabExam: {
      borderColor: colors.examCardBorder,
    },
  });
