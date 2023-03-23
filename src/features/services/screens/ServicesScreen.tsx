import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faBookBookmark,
  faBriefcase,
  faBullhorn,
  faComments,
  faIdCard,
  faMobileScreenButton,
  faPersonCirclePlus,
  faSignsPost,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Grid, auto } from '@lib/ui/components/Grid';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { split } from '../../../utils/reducers';
import { ServiceCard } from '../components/ServiceCard';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const { favoriteServices: favoriteServiceIds, updatePreference } =
    usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const { left, right } = useSafeAreaInsets();
  const services = [
    {
      id: 'tickets',
      name: t('ticketScreen.title'),
      icon: faComments,
      linkTo: { screen: 'Tickets' },
    },
    {
      id: 'appFeedback',
      name: t('common.appFeedback'),
      icon: faMobileScreenButton,
      linkTo: {
        screen: 'CreateTicket',
        params: {
          topicId: 1101,
          subtopicId: 2001,
        },
      },
      additionalContent: <Badge text="BETA" style={styles.betaBadge} />,
    },
    {
      id: 'contacts',
      name: t('contactsScreen.title'),
      icon: faIdCard,
      disabled: true,
    },
    {
      id: 'guides',
      name: t('guidesScreen.title'),
      icon: faSignsPost,
      disabled: true,
    },
    {
      id: 'jobOffers',
      name: t('jobOffersScreen.title'),
      icon: faBriefcase,
      disabled: true,
    },
    {
      id: 'news',
      name: t('newsScreen.title'),
      icon: faBullhorn,
      disabled: true,
    },
    {
      id: 'bookings',
      name: t('bookingsScreen.title'),
      icon: faPersonCirclePlus,
      disabled: true,
    },
    {
      id: 'library',
      name: t('libraryScreen.title'),
      icon: faBookBookmark,
      disabled: true,
    },
  ];

  const [favoriteServices, otherServices] = useMemo(
    () =>
      services.reduce(
        split(s => favoriteServiceIds.includes(s.id)),
        [[], []],
      ),
    [favoriteServiceIds],
  );

  const updateFavorite =
    (service: typeof services[number]) => (favorite: boolean) => {
      const newVal = favorite
        ? [...new Set([...favoriteServiceIds, service.id])]
        : favoriteServiceIds.filter(fs => fs !== service.id);
      updatePreference('favoriteServices', newVal);
    };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingLeft: left, paddingRight: right }}
    >
      {favoriteServices.length > 0 && (
        <Grid
          numColumns={auto}
          minColumnWidth={ServiceCard.minWidth}
          maxColumnWidth={ServiceCard.maxWidth}
          gap={4}
          style={styles.grid}
        >
          {favoriteServices.map(service => (
            <ServiceCard
              key={service.id}
              name={service.name}
              icon={service.icon}
              disabled={service.disabled}
              linkTo={service.linkTo}
              favorite
              onFavoriteChange={updateFavorite(service)}
            >
              {service.additionalContent}
            </ServiceCard>
          ))}
        </Grid>
      )}

      {otherServices.length > 0 && (
        <Grid
          numColumns={auto}
          minColumnWidth={ServiceCard.minWidth}
          maxColumnWidth={ServiceCard.maxWidth}
          gap={4}
          style={styles.grid}
        >
          {otherServices.map(service => (
            <ServiceCard
              key={service.id}
              name={service.name}
              icon={service.icon}
              disabled={service.disabled}
              linkTo={service.linkTo}
              onFavoriteChange={updateFavorite(service)}
            >
              {service.additionalContent}
            </ServiceCard>
          ))}
        </Grid>
      )}
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    grid: {
      margin: spacing[5],
    },
    betaBadge: {
      position: 'absolute',
      top: -spacing[2.5],
      right: -spacing[2],
    },
  });
