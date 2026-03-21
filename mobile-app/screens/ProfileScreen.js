import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function ProfileScreen({ navigation }) {
  const { scale } = useResponsive();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.content, { padding: scale(12), gap: scale(12) }]}>
        <HeaderBar title="Profile" subtitle="Your account and preferences" />

        <View style={[styles.profileCard, { borderRadius: scale(20), padding: scale(16) }]}>
          <View style={[styles.avatar, { width: scale(84), height: scale(84), borderRadius: scale(42) }]}>
            <Icon name="account" size={scale(42)} color={colors.white} />
          </View>

          <Text style={[styles.name, { marginTop: scale(11), fontSize: scale(21) }]}>Parthik User</Text>
          <Text style={[styles.email, { marginTop: scale(4), fontSize: scale(13) }]}>parthik@example.com</Text>

          <View style={[styles.statsRow, { marginTop: scale(16) }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: scale(20) }]}>12</Text>
              <Text style={[styles.statLabel, { marginTop: scale(4), fontSize: scale(11) }]}>Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: scale(20) }]}>4</Text>
              <Text style={[styles.statLabel, { marginTop: scale(4), fontSize: scale(11) }]}>Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: scale(20) }]}>3</Text>
              <Text style={[styles.statLabel, { marginTop: scale(4), fontSize: scale(11) }]}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={[styles.actions, { gap: scale(9) }]}>
          <CustomButton title="Create New Event" onPress={() => navigation.navigate('CreateEvent')} />
          <CustomButton title="Logout" variant="secondary" onPress={() => navigation.replace('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {},
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.accent,
    fontWeight: '800',
  },
  email: {
    color: colors.muted,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
  },
  actions: {},
});
