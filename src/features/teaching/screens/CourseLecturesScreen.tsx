import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  faChalkboardTeacher,
  faChevronDown,
  faChevronUp,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { TranslucentView } from '../../../core/components/TranslucentView';
import { useSafeAreaSpacing } from '../../../core/hooks/useSafeAreaSpacing';
import { useGetCourseLectures } from '../../../core/queries/courseHooks';
import { useGetPerson } from '../../../core/queries/peopleHooks';
import { formatDate } from '../../../utils/dates';
import { CourseContext } from '../contexts/CourseContext';
import {
  CourseLecture,
  CourseLectureSection,
} from '../types/CourseLectureSections';

export const CourseLecturesScreen = () => {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const courseId = useContext(CourseContext)!;
  const { spacing, colors, fontSizes } = useTheme();
  const scrollPosition = useRef(new Animated.Value(0));
  const courseLecturesQuery = useGetCourseLectures(courseId);
  const [lectures, setLectures] = useState<CourseLectureSection[]>([]);
  const sectionListRef =
    useRef<SectionList<CourseLecture, CourseLectureSection>>(null);
  const { marginHorizontal } = useSafeAreaSpacing();

  useEffect(() => {
    if (!courseLecturesQuery.data) return;

    const nextLectures = [...courseLecturesQuery.data];
    setLectures(prev => {
      const isFirstRender = !prev.length;
      return nextLectures.map((section, index) => {
        if (isFirstRender) {
          if (index === 0) {
            return { ...section, isExpanded: true };
          }
        } else if (prev?.[index]?.isExpanded) {
          return { ...section, isExpanded: true };
        }

        return { ...section, isExpanded: false, data: [] };
      });
    });
  }, [courseLecturesQuery.isLoading, courseLecturesQuery.data]);

  const toggleSection = (sectionTitle: string) => {
    setLectures(oldS => {
      return oldS.map((section, index) => {
        let isExpanded = false;
        let data: unknown = [];
        if (section.title === sectionTitle) {
          isExpanded = !section.isExpanded;
        }

        if (isExpanded && !section.data.length) {
          data = courseLecturesQuery.data?.[index].data ?? [];
        }

        return {
          ...section,
          isExpanded,
          data,
        } as CourseLectureSection;
      });
    });
  };

  return (
    <SectionList
      ref={sectionListRef}
      contentInsetAdjustmentBehavior="automatic"
      sections={lectures}
      refreshControl={<RefreshControl queries={[courseLecturesQuery]} />}
      stickySectionHeadersEnabled={true}
      ListEmptyComponent={
        !courseLecturesQuery.isLoading ? (
          <EmptyState
            message={t('courseLecturesTab.emptyState')}
            icon={faChalkboardTeacher}
          />
        ) : null
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollPosition.current } } }],
        { useNativeDriver: false },
      )}
      ItemSeparatorComponent={Platform.select({
        ios: () => (
          <IndentedDivider
            indent={safeAreaInsets.left + 56}
            style={{ marginRight: safeAreaInsets.right }}
          />
        ),
      })}
      renderSectionHeader={({ section: { title, isExpanded } }) => (
        <Pressable
          onPress={() => toggleSection(title)}
          accessibilityLabel={`${title}. ${t(
            `common.openedStatus.${isExpanded}`,
          )}. ${t(`common.openedStatusAction.${isExpanded}`)}`}
        >
          <View
            style={{
              paddingLeft: safeAreaInsets.left,
              paddingRight: safeAreaInsets.right,
              paddingVertical: spacing[3],
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: colors.divider,
              borderTopWidth: StyleSheet.hairlineWidth,
            }}
          >
            <TranslucentView />
            <SectionHeader
              title={title}
              separator={false}
              trailingItem={
                <Icon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  color={colors.secondaryText}
                />
              }
            />
          </View>
        </Pressable>
      )}
      renderItem={({ section, item: lecture }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { data: teacher } = useGetPerson(lecture.teacherId);
        return (
          <ListItem
            title={lecture.title}
            subtitle={[
              formatDate(lecture.createdAt),
              lecture.duration,
              teacher && `${teacher.firstName} ${teacher.lastName}`,
            ]
              .filter(i => !!i)
              .join(' - ')}
            accessibilityLabel={[
              lecture.title,
              lecture.duration
                .replace('m', t('common.minutes'))
                .replace('h', t('common.hours')),
              teacher && `${teacher.firstName} ${teacher.lastName}`,
            ]
              .filter(i => !!i)
              .join(' - ')}
            leadingItem={
              <Icon
                icon={
                  section.type === 'VideoLecture'
                    ? faVideo
                    : faChalkboardTeacher
                }
                size={fontSizes['2xl']}
              />
            }
            linkTo={{
              screen:
                section.type === 'VideoLecture'
                  ? 'CourseVideolecture'
                  : 'CourseVirtualClassroom',
              params: {
                courseId,
                lectureId: lecture.id,
                teacherId: lecture.teacherId,
              },
            }}
            containerStyle={marginHorizontal}
          />
        );
      }}
      ListFooterComponent={<BottomBarSpacer />}
    />
  );
};
