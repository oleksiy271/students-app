import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  faCalendar,
  faClock,
  faFrown,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHourglassEnd,
  faHourglassStart,
} from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { ModalContent } from '@lib/ui/components/ModalContent';
import { Row } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { inRange } from 'lodash';
import { DateTime } from 'luxon';

import { isSlotFull } from '../../../utils/bookings';
import { BookingCalendarEvent } from '../screens/BookingSlotScreen';
import { BookingField } from './BookingField';
import { BookingSeatsCta } from './BookingSeatsCta';

type Props = {
  close: () => void;
  item: BookingCalendarEvent;
  topicId: string;
};

export const BookingSlotModal = ({ close, item }: Props) => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { fontSizes } = useTheme();
  const now = DateTime.now().toJSDate();

  const isFull = isSlotFull(item);
  const bookingNotYetOpen = !!(
    item?.bookingStartsAt && item?.bookingStartsAt > now
  );

  const canBeBooked = item.canBeBooked && item.start > DateTime.now();
  const startHour = item.start.toFormat('HH:mm');
  const endHour = item.end.toFormat('HH:mm');
  const day = item.start.toFormat('d MMMM');

  const NotBookableMessage = () => {
    if (
      !item.canBeBooked &&
      inRange(
        DateTime.now().valueOf(),
        item.bookingStartsAt.valueOf(),
        item.bookingEndsAt.valueOf(),
      ) &&
      !isFull
    ) {
      return (
        <EmptyState
          icon={faHourglassEnd}
          iconSize={fontSizes['4xl']}
          message={item.feedback}
        />
      );
    }
    return isFull ? (
      <EmptyState
        icon={faFrown}
        iconSize={fontSizes['4xl']}
        message={t('bookingSeatScreen.noSeatsAvailable')}
      />
    ) : bookingNotYetOpen ? (
      <EmptyState
        icon={faHourglassStart}
        iconSize={fontSizes['4xl']}
        message={[
          t('bookingSeatScreen.slotBookableFrom'),
          item?.bookingStartsAt
            ? DateTime.fromJSDate(item?.bookingStartsAt).toFormat('d MMMM yyyy')
            : ' - ',
        ].join(' ')}
      />
    ) : (
      <EmptyState
        icon={faHourglassEnd}
        iconSize={fontSizes['4xl']}
        message={t('bookingSeatScreen.deadlineExpired')}
      />
    );
  };

  return (
    <ModalContent close={close} title={t('common.booking')}>
      {canBeBooked && item.id ? (
        <>
          <View style={styles.spacer} />
          <BookingSeatsCta
            slotId={item.id?.toString()}
            hasSeatSelection={item.hasSeatSelection}
            absolute={false}
            modal={true}
            onCloseModal={close}
          >
            <Row gap={4} style={styles.recapContainer}>
              <BookingField
                icon={faClock}
                label={t('common.hour')}
                value={`${startHour} - ${endHour}`}
              />
              <BookingField
                icon={faCalendar}
                value={day}
                label={t('common.day')}
              />
            </Row>
          </BookingSeatsCta>
        </>
      ) : (
        <NotBookableMessage />
      )}
    </ModalContent>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    spacer: {
      height: spacing[6],
    },
    recapContainer: {
      marginHorizontal: spacing[4],
    },
  });
