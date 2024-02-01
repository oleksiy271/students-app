import { useCallback, useMemo } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { HtmlView } from '../../../core/components/HtmlView';
import { useNotifications } from '../../../core/hooks/useNotifications';
import { useGetCourseNotices } from '../../../core/queries/courseHooks';
import { linkUrls, sanitizeHtml } from '../../../utils/html';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<TeachingStackParamList, 'Notice'>;

export const NoticeScreen = ({ route }: Props) => {
  const { noticeId, courseId } = route.params;
  const { spacing } = useTheme();
  const { clearNotificationScope } = useNotifications();
  const noticesQuery = useGetCourseNotices(courseId);
  const html = useMemo(
    () =>
      linkUrls(
        sanitizeHtml(
          noticesQuery.data?.find(notice => notice.id === noticeId)?.content ??
            '',
        ),
      ),
    [noticesQuery, noticeId],
  );

  useFocusEffect(
    useCallback(() => {
      clearNotificationScope([
        'teaching',
        'courses',
        courseId.toString(),
        'notices',
        noticeId,
      ]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[noticesQuery]} manual />}
    >
      <SafeAreaView>
        <HtmlView
          source={{ html }}
          baseStyle={{
            paddingTop: 0,
            paddingHorizontal: spacing[5],
          }}
        />
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
