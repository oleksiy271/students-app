import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import Barcode from 'react-native-barcode-svg';

import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { Separator } from '@lib/ui/components/Separator';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { Booking } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useDeleteBooking,
  useGetBookings,
} from '../../../core/queries/bookingHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { formatDateTime, formatTime } from '../../../utils/dates';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Booking'>;

export const BookingScreen = ({ navigation, route }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const bookingsQuery = useGetBookings();
  const bookingMutation = useDeleteBooking(id);
  const studentQuery = useGetStudent();
  const styles = useStylesheet(createStyles);
  const booking = bookingsQuery.data?.data.find((e: Booking) => e.id === id);
  const title = booking?.topic?.title;
  const timeLabel = useMemo(() => {
    const fromDate = formatDateTime(booking?.startsAt);
    const toTime = formatTime(booking?.endsAt);
    return `${fromDate} - ${toTime}`;
  }, [booking]);

  const onPressLocation = () => {};

  const onPressDelete = () => {
    // TODO ADD FEEDBACK
    bookingMutation.mutateAsync().then(() => navigation.goBack());
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.wrapper}
        {...useRefreshControl(bookingsQuery)}
      >
        <EventDetails title={title} type={t('Booking')} time={timeLabel} />
        {booking?.location?.name && (
          <SectionList>
            <ListItem
              leadingItem={
                <Icon
                  icon={faLocation}
                  size={20}
                  color={colors.secondaryText}
                  style={{ marginRight: spacing[2] }}
                />
              }
              title={booking.location.name}
              subtitle={booking.location?.type}
              onPress={onPressLocation}
            />
          </SectionList>
        )}
        <Section style={styles.sectionSeparator}>
          <Separator />
          <Text variant={'caption'}>{t('Barcode')}</Text>
        </Section>
        <Section style={styles.sectionContainer}>
          <Card style={styles.barCodeCard} rounded>
            <Barcode
              value={studentQuery.data.data.username}
              format="CODE128"
              height={85}
              lineColor={colors.primary[800]}
              singleBarWidth={1.8}
              backgroundColor={'white'}
            />
          </Card>
        </Section>
        <CtaButtonSpacer />
      </ScrollView>
      {/* {bookingMutation.isIdle && (*/}
      {booking.canBeCancelled && (
        <CtaButton
          icon={'close'}
          title={t('Delete Booking')}
          action={onPressDelete}
          destructive={true}
          loading={bookingMutation.isLoading}
          successMessage={t('Exam booked')}
          // onSuccess={() => navigation.goBack()}
        />
      )}
    </>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
  StyleSheet.create({
    barCodeCard: {
      width: '100%',
      padding: fontSizes.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: fontSizes.md,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    sectionSeparator: {
      paddingHorizontal: fontSizes.lg,
      marginTop: fontSizes.xs,
    },
    sectionContainer: {
      paddingHorizontal: fontSizes.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: fontSizes.xs,
      // padding: fontSizes.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: fontSizes.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
