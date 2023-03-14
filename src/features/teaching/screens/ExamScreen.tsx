import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView } from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { ExamStatusEnum } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useConfirmationDialog } from '../../../core/hooks/useConfirmationDialog';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import {
  useBookExam,
  useCancelExamBooking,
  useGetExams,
} from '../../../core/queries/examHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { formatDate, formatDateTime, formatDateTimeAccessibility } from '../../../utils/dates';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Exam'>;

export const ExamScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const examsQuery = useGetExams();
  const refreshControl = useRefreshControl(examsQuery);
  const exam = examsQuery.data?.find(e => e.id === id);
  const { mutateAsync: bookExam, isLoading: isBooking } = useBookExam(exam?.id);
  const { mutateAsync: cancelBooking, isLoading: isCancelingBooking } =
    useCancelExamBooking(exam?.id);
  const teacherQuery = useGetPerson(exam?.teacherId);
  const confirm = useConfirmationDialog();
  const routes = navigation.getState()?.routes;

  const mutationsLoading = isBooking || isCancelingBooking;
  const examAvailable = exam?.status === ExamStatusEnum.Available;
  const showCta = (
    [ExamStatusEnum.Available, ExamStatusEnum.Booked] as ExamStatusEnum[]
  ).includes(exam?.status);

  useEffect(() => {
    if (routes[routes.length - 2]?.name === 'Course') {
      navigation.setOptions({
        headerBackTitle: t('common.course'),
      });
    }
  }, []);

  const action = async () => {
    if (examAvailable) {
      return bookExam({});
    }
    if (await confirm()) {
      return cancelBooking();
    }
    return Promise.reject();
  };

  const time = useMemo(() => {
    if (exam.isTimeToBeDefined) {
      return `${formatDate(exam.examStartsAt)}, ${t('common.timeToBeDefined')}`;
    }
    return formatDateTime(exam.examStartsAt);
  }, [exam.isTimeToBeDefined, exam.examStartsAt]);

  const examAccessibilityLabel = useMemo(() => {
    const title = exam?.courseName;
    const { date, time } = formatDateTimeAccessibility(exam?.examStartsAt);
    const classrooms =
      exam?.classrooms && exam?.classrooms !== '-'
        ? `${t('examScreen.location')}: ${exam?.classrooms}`
        : '';
    const teacher = teacherQuery.data?.data
      ? `${t('common.teacher')}: ${teacherQuery.data?.data?.firstName} ${
          teacherQuery.data?.data?.lastName
        }`
      : '';

    return `${title}. ${date}. ${t(
      'common.time',
    )} ${time}. ${classrooms} ${teacher}`;
  }, [exam, t, teacherQuery]);

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl {...refreshControl} />}
        contentInsetAdjustmentBehavior="automatic"
      >
        <EventDetails
          title={exam?.courseName}
          accessible={true}
          accessibilityLabel={examAccessibilityLabel}
          type={t('common.examCall')}
          time={time}
        />
        <SectionList loading={teacherQuery.isLoading} indented>
          <ListItem
            leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
            title={exam?.classrooms}
            accessibilityLabel={`${t('examScreen.location')}: ${
              exam?.classrooms === '-'
                ? t('examScreen.noClassroom')
                : exam?.classrooms
            }`}
            subtitle={t('examScreen.location')}
          />
          {teacherQuery.data && (
            <PersonListItem
              person={teacherQuery.data?.data}
              subtitle={t('common.teacher')}
            />
          )}
        </SectionList>
        <CtaButtonSpacer />
      </ScrollView>

      {showCta && (
        <CtaButton
          destructive={!examAvailable}
          title={
            examAvailable ? t('examScreen.ctaBook') : t('examScreen.ctaCancel')
          }
          action={action}
          loading={mutationsLoading}
          successMessage={
            examAvailable
              ? t('examScreen.ctaBookSuccess')
              : t('examScreen.ctaCancelSuccess')
          }
        />
      )}
    </>
  );
};
