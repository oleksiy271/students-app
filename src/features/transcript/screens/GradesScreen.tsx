import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import {
  useGetGrades,
  useGetProvisionalGrades,
} from '../../../core/queries/studentHooks';
import { formatDate } from '../../../utils/dates';
import { formatGrade } from '../../../utils/grades';
import { ProvisionalGradeListItem } from '../components/ProvisionalGradeListItem';

export const GradesScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const gradesQuery = useGetGrades();
  const provisionalGradesQuery = useGetProvisionalGrades();
  const { accessibilityListLabel } = useAccessibility();

  const isOffline = useOfflineDisabled();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          queries={[gradesQuery, provisionalGradesQuery]}
          manual
        />
      }
    >
      <SafeAreaView>
        <Section>
          <SectionHeader
            title={t('transcriptGradesScreen.provisionalTitle')}
            accessibilityLabel={`${t('common.transcript')} ${t(
              'transcriptGradesScreen.total', // TODO SWITCH STRING TO PROVISIONAL
              { total: provisionalGradesQuery.data?.length || 0 },
            )}`}
          />
          <OverviewList
            loading={!isOffline && provisionalGradesQuery.isLoading}
            emptyStateText={
              isOffline && provisionalGradesQuery.isLoading
                ? t('common.cacheMiss')
                : t('transcriptGradesScreen.provisionalEmptyState')
            }
          >
            {provisionalGradesQuery.data?.map(grade => (
              <ProvisionalGradeListItem key={grade.id} grade={grade} />
            ))}
          </OverviewList>
        </Section>
        <Section>
          <SectionHeader
            title={t('transcriptGradesScreen.recordedTitle')}
            accessibilityLabel={`${t('common.transcript')} ${t(
              'transcriptGradesScreen.total',
              { total: gradesQuery.data?.length || 0 },
            )}`}
          />
          <OverviewList
            loading={!isOffline && gradesQuery.isLoading}
            emptyStateText={
              isOffline && gradesQuery.isLoading
                ? t('common.cacheMiss')
                : t('transcriptGradesScreen.emptyState')
            }
          >
            {gradesQuery.data?.map((grade, index) => (
              <ListItem
                key={grade.courseName}
                title={grade.courseName}
                accessibilityLabel={`${t(
                  accessibilityListLabel(index, gradesQuery.data?.length || 0),
                )}. ${grade.courseName}: ${formatDate(grade.date)} ${t(
                  'common.grade',
                )}: ${grade?.grade} - ${t('common.creditsWithUnit', {
                  credits: grade.credits,
                })}`}
                subtitle={`${formatDate(grade.date)} - ${t(
                  'common.creditsWithUnit',
                  { credits: grade.credits },
                )}`}
                trailingItem={
                  <Text
                    variant="title"
                    style={styles.grade}
                    accessibilityLabel={`${t('common.grade')}: ${grade?.grade}`}
                  >
                    {t(formatGrade(grade.grade))}
                  </Text>
                }
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    chartCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    metricsCard: {
      padding: spacing[4],
      marginTop: spacing[2],
    },
    spaceBottom: {
      marginBottom: spacing[2],
    },
    additionalMetric: {
      marginTop: spacing[4],
    },
    grade: {
      marginLeft: spacing[2],
    },
  });
