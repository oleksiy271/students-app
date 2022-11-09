import {
  faCalendar,
  faCalendarCheck,
} from '@fortawesome/pro-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Exam, ExamStatusEnum } from '@polito/api-client';

interface Props {
  exam: Exam;
}

export const ExamListItem = ({ exam }: Props) => {
  const { colors, fontSizes } = useTheme();

  return (
    <ListItem
      linkTo={{
        screen: 'Exam',
        params: { id: exam.id },
      }}
      title={exam.courseName}
      subtitle={`${exam.examStartsAt.toLocaleString()} - ${exam.classrooms}`}
      leadingItem={
        exam.status === ExamStatusEnum.Booked ? (
          <Icon
            icon={faCalendarCheck}
            size={fontSizes['2xl']}
            color={colors.secondaryText}
          />
        ) : (
          <Icon
            icon={faCalendar}
            size={fontSizes['2xl']}
            color={colors.secondaryText}
          />
        )
      }
    />
  );
};
