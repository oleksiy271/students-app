import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AgendaNavigator } from '../../features/agenda/components/AgendaNavigator';
import { PlacesScreen } from '../../features/places/screens/PlacesScreen';
import { TeachingNavigator } from '../../features/teaching/components/TeachingNavigator';
import { UserNavigator } from '../../features/user/components/UserNavigator';
import { Logo } from './Logo';
import { TranslucentView } from './TranslucentView';

const TabNavigator = createBottomTabNavigator();

export const RootNavigator = () => {
  const { t } = useTranslation();

  const tabBarStyle: any = {
    position: Platform.select({ ios: 'absolute' }),
  };
  if (Platform.OS === 'ios') {
    tabBarStyle.height = 84;
  }

  return (
    <TabNavigator.Navigator
      backBehavior="history"
      screenOptions={{
        tabBarStyle,
        tabBarBackground: Platform.select({
          ios: () => <TranslucentView />,
        }),
        headerShown: false,
      }}
    >
      <TabNavigator.Screen
        name="TeachingTab"
        component={TeachingNavigator}
        options={{
          tabBarLabel: t('Teaching'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="AgendaTab"
        component={AgendaNavigator}
        options={{
          tabBarLabel: t('Agenda'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="PlacesTab"
        component={PlacesScreen}
        options={{
          headerLeft: () => <Logo />,
          tabBarLabel: t('Places'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="location" color={color} size={size} />
          ),
        }}
      />
      <TabNavigator.Screen
        name="ProfileTab"
        component={UserNavigator}
        options={{
          tabBarLabel: t('Profile'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
        }}
      />
    </TabNavigator.Navigator>
  );
};
