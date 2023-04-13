import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';

import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { DateTime } from 'luxon';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { formatDate } from '../../../utils/dates';
import { getHtmlTextContent } from '../../../utils/html';
import { CourseTabProps } from '../screens/CourseScreen';

export const CourseNoticesTab = ({ courseId }: CourseTabProps) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const noticesQuery = useGetCourseNotices(courseId);
  const { accessibilityListLabel } = useAccessibility();
  const notices = useMemo(
    () =>
      noticesQuery.data?.map(notice => ({
        ...notice,
        title: getHtmlTextContent(notice.content),
      })) ?? [],
    [noticesQuery],
  );

  return (
    <FlatList
      style={GlobalStyles.grow}
      refreshControl={<RefreshControl queries={[noticesQuery]} />}
      data={notices}
      renderItem={({ item: notice, index }) => (
        <ListItem
          title={notice.title}
          accessibilityLabel={`${t(
            accessibilityListLabel(index, notices?.length || 0),
          )}. ${DateTime.fromJSDate(notice.publishedAt).toFormat(
            'dd/MM/yyyy',
          )}, ${notice.title}`}
          subtitle={formatDate(notice.publishedAt)}
          linkTo={{
            screen: 'Notice',
            params: { noticeId: notice.id, courseId },
          }}
        />
      )}
      ListHeaderComponent={
        !noticesQuery.isLoading && !noticesQuery.data?.length ? (
          <EmptyState
            icon={faInbox}
            message={t('courseNoticesTab.emptyState')}
          />
        ) : null
      }
      ItemSeparatorComponent={() => <IndentedDivider indent={spacing[5]} />}
    />
  );
};
