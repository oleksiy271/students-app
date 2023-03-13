import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { faAngleDown, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@lib/ui/components/Badge';
import { Icon } from '@lib/ui/components/Icon';
import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { Student } from '@polito/api-client';
import {
  MenuAction,
  MenuView,
  NativeActionEvent,
} from '@react-native-menu/menu';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { IS_ANDROID } from '../../../core/constants';
import { useRefreshControl } from '../../../core/hooks/useRefreshControl';
import { useLogout, useSwitchCareer } from '../../../core/queries/authHooks';
import { useGetStudent } from '../../../core/queries/studentHooks';
import {
  ProfileNotificationItem,
  ProfileSettingItem,
} from '../components/ProfileItems';
import { UserStackParamList } from '../components/UserNavigator';

interface Props {
  navigation: NativeStackNavigationProp<UserStackParamList, 'Profile'>;
}

const HeaderRightDropdown = ({ student }: { student?: Student }) => {
  const { mutate } = useSwitchCareer();
  const { colors } = useTheme();
  const username = student?.username || '';
  const allCareerIds = (student?.allCareerIds || []).map(id => `s${id}`);
  const canSwitchCareer = allCareerIds.length > 1;

  const actions = useMemo((): MenuAction[] => {
    if (!canSwitchCareer) return [];

    return allCareerIds.map(careerId => {
      return {
        id: careerId,
        title: careerId,
        state: careerId === username ? 'on' : undefined,
      };
    });
  }, [allCareerIds, username]);

  const onPressAction = ({ nativeEvent: { event } }: NativeActionEvent) => {
    mutate({ username: event });
  };

  return (
    <MenuView actions={actions} onPressAction={onPressAction}>
      <Row>
        <Text variant={'link'} style={{ marginRight: 5 }}>
          {username}
        </Text>
        {canSwitchCareer && (
          <Icon icon={faAngleDown} color={colors.primary[500]} />
        )}
      </Row>
    </MenuView>
  );
};

export const ProfileScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const { mutate: handleLogout } = useLogout();
  const useGetMeQuery = useGetStudent();
  const student = useGetMeQuery?.data?.data;

  const styles = useStylesheet(createStyles);
  const refreshControl = useRefreshControl(useGetMeQuery);
  const firstEnrollmentYear = student?.firstEnrollmentYear;
  const enrollmentYear = student
    ? `${firstEnrollmentYear - 1}/${firstEnrollmentYear}`
    : '...';

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRightDropdown student={student} />,
    });
  }, [student]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl {...refreshControl} />}
    >
      <Section>
        <Text weight={'bold'} variant={'title'} style={styles.title}>
          {student?.firstName} {student?.lastName}
        </Text>
      </Section>
      <Section>
        <SectionHeader title={t('profileScreen.smartCard')} />
        <ImageLoader
          imageStyle={styles.smartCard}
          source={{ uri: student?.smartCardPicture }}
          containerStyle={styles.smartCardContainer}
        />
      </Section>
      <Section>
        <SectionHeader
          title={t('profileScreen.course')}
          /* trailingItem={
                                                                    <Text variant="link">{t('profileScreen.trainingOffer')}</Text>
                                                                  }*/
          trailingItem={<Badge text={t('common.comingSoon')} />}
        />
        <SectionList>
          <ListItem
            title={student?.degreeName}
            subtitle={t('profileScreen.enrollmentYear', { enrollmentYear })}
            // linkTo={'TODO'}
          />
        </SectionList>
        <SectionList>
          <ProfileSettingItem />
          <ProfileNotificationItem />
        </SectionList>
        <SectionList>
          <ListItem
            title={t('common.logout')}
            onPress={() => handleLogout()}
            leadingItem={
              <Icon
                icon={faSignOut}
                color={colors.text[500]}
                size={fontSizes.xl}
              />
            }
          />
        </SectionList>
      </Section>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['3xl'],
      paddingHorizontal: spacing[5],
      paddingTop: spacing[IS_ANDROID ? 4 : 1],
    },
    smartCard: {
      aspectRatio: 1.586,
      height: null,
    },
    smartCardContainer: {
      marginVertical: spacing[2],
      marginHorizontal: spacing[5],
      maxWidth: 540, // width of a physical card in dp
    },
  });
