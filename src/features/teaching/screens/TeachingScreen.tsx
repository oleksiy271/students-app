import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';

import { Card } from '@lib/ui/components/Card';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import color from 'color';

import { createRefreshControl } from '../../../core/hooks/createRefreshControl';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetCourses } from '../../../core/queries/courseHooks';
import { useGetExams } from '../../../core/queries/examHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import { CourseListItem } from '../components/CourseListItem';
import { ExamListItem } from '../components/ExamListItem';
import { TeachingStackParamList } from '../components/TeachingNavigator';

interface Props {
  navigation: NativeStackNavigationProp<TeachingStackParamList, 'Home'>;
}

export const TeachingScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const coursesQuery = useGetCourses();
  const examsQuery = useGetExams();
  const studentQuery = useGetStudent();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={bottomBarAwareStyles}
      refreshControl={createRefreshControl(
        coursesQuery,
        examsQuery,
        studentQuery,
      )}
    >
      <View style={styles.sectionsContainer}>
        <Section>
          <SectionHeader
            title={t('coursesScreen.title')}
            linkTo={{ screen: 'Courses' }}
          />
          <SectionList loading={coursesQuery.isLoading}>
            {coursesQuery.data?.data.slice(0, 4).map(course => (
              <CourseListItem key={course.shortcode} course={course} />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('examsScreen.title')}
            linkTo={{ screen: 'Exams' }}
          />
          <SectionList loading={examsQuery.isLoading}>
            {examsQuery.data?.data.slice(0, 4).map(exam => (
              <ExamListItem key={exam.id} exam={exam} />
            ))}
          </SectionList>
        </Section>
        <Section>
          <SectionHeader
            title={t('transcriptScreen.title')}
            linkTo={{ screen: 'Transcript' }}
          />

          <Card
            rounded={Platform.select({ android: false })}
            style={styles.sectionContent}
          >
            {studentQuery.isLoading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <TouchableHighlight
                onPress={() => navigation.navigate('Transcript')}
                underlayColor={colors.touchableHighlight}
              >
                <View style={{ padding: spacing[5], flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="headline"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('transcriptScreen.weightedAverageLabel')}:{' '}
                      {studentQuery.data?.data.averageGrade}
                    </Text>
                    <Text
                      variant="secondaryText"
                      style={{ marginBottom: spacing[2] }}
                    >
                      {t('transcriptScreen.finalAverageLabel')}:{' '}
                      {studentQuery.data?.data.averageGradePurged}
                    </Text>
                    <Text variant="secondaryText">
                      {studentQuery.data?.data.totalAcquiredCredits}/
                      {studentQuery.data?.data.totalCredits}{' '}
                      {t('words.credits')}
                    </Text>
                  </View>
                  <ProgressChart
                    data={{
                      labels: ['Test'],
                      data: [
                        studentQuery.data?.data.totalAcquiredCredits /
                          studentQuery.data?.data.totalCredits,
                      ],
                    }}
                    width={90}
                    height={90}
                    hideLegend={true}
                    chartConfig={{
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientToOpacity: 0,
                      color: (opacity = 1) =>
                        color(colors.primary[400]).alpha(opacity).toString(),
                    }}
                  />
                </View>
              </TouchableHighlight>
            )}
          </Card>
        </Section>
      </View>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionsContainer: {
      paddingVertical: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    sectionContent: {
      marginVertical: spacing[2],
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
  });
