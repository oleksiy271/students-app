import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';

import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Metric } from '@lib/ui/components/Metric';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { TicketOverview, TicketStatus } from '@polito/api-client';

import { GlobalStyles } from '../../../core/styles/globalStyles';
import { formatDate, formatDateTime } from '../../../utils/dates';

interface TicketStatusProps {
  ticket: TicketOverview;
  loading?: boolean;
  refetching?: boolean;
}

export const TicketStatusInfo = ({
  ticket,
  loading,
  refetching,
}: TicketStatusProps) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const isClosed = ticket.status === TicketStatus.Closed;

  if (loading) {
    return (
      <Col>
        <ActivityIndicator />
      </Col>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="title" style={styles.row}>
        {ticket.subject}
      </Text>
      <Row style={styles.row}>
        <Metric
          title={t('ticketScreen.ticketNumber')}
          value={ticket.id}
          style={GlobalStyles.grow}
        />
        <Metric
          title={t('common.createdAt')}
          value={formatDate(ticket.createdAt)}
          style={GlobalStyles.grow}
        />
      </Row>
      <Row style={styles.row}>
        <Metric
          title={t('common.updatedAt')}
          value={formatDateTime(ticket.updatedAt)}
          style={GlobalStyles.grow}
        />
        <Metric
          title={t('common.status')}
          value={ticket.status}
          style={GlobalStyles.grow}
          valueStyle={{ textTransform: 'uppercase' }}
        />
        {/* TODO colors? */}
      </Row>
      {refetching ? (
        <ActivityIndicator />
      ) : (
        <>
          {isClosed && (
            <Row>
              <Icon
                icon={faInfoCircle}
                color={colors.secondaryText}
                style={styles.infoIcon}
              />
              <Text variant="secondaryText" style={GlobalStyles.grow}>
                {t('ticketScreen.youCanReopenTheTicket')}
              </Text>
            </Row>
          )}
        </>
      )}
    </Card>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    infoIcon: {
      marginTop: spacing[0.5],
      marginRight: spacing[2],
    },
    card: {
      marginHorizontal: Platform.select({ ios: spacing[3] }),
      marginVertical: Platform.select({ ios: spacing[3] }),
      padding: spacing[4],
    },
    row: {
      marginBottom: spacing[4],
    },
  });
