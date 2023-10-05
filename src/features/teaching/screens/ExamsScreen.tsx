import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetExams } from '../../../core/queries/examHooks';
import { ExamListItem } from '../components/ExamListItem';

export const ExamsScreen = () => {
  const { t } = useTranslation();
  const examsQuery = useGetExams();
  const { accessibilityListLabel } = useAccessibility();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      accessibilityRole="list"
      accessibilityLabel={t('examsScreen.total', {
        total: examsQuery.data?.length ?? 0,
      })}
      refreshControl={<RefreshControl queries={[examsQuery]} manual />}
    >
      <SafeAreaView>
        <Section>
          <OverviewList
            emptyStateText={
              examsQuery.data && examsQuery.data.length === 0
                ? t('examsScreen.emptyState')
                : undefined
            }
            indented
            loading={examsQuery.isLoading}
          >
            {examsQuery.data?.map((exam, index) => (
              <ExamListItem
                key={exam.id}
                exam={exam}
                accessible={true}
                accessibilityLabel={accessibilityListLabel(
                  index,
                  examsQuery.data.length,
                )}
              />
            ))}
          </OverviewList>
        </Section>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
