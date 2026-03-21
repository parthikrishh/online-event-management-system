import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import MyEventsScreen from '../screens/MyEventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { scale } = useResponsive();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8E98A8',
        tabBarStyle: {
          height: scale(62),
          paddingTop: scale(6),
          paddingBottom: scale(7),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: scale(11),
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            HomeTab: 'home-variant-outline',
            MyEventsTab: 'ticket-confirmation-outline',
            ProfileTab: 'account-circle-outline',
          };

          return <Icon name={iconMap[route.name]} color={color} size={scale(size)} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MyEventsTab" component={MyEventsScreen} options={{ title: 'My Events' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
