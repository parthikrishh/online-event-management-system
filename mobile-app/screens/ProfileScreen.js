import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <HeaderBar title="Profile" subtitle="Your account and preferences" />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="account" size={44} color={colors.white} />
          </View>

          <Text style={styles.name}>Parthik User</Text>
          <Text style={styles.email}>parthik@example.com</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
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
  content: {
    padding: 14,
    gap: 14,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    padding: 18,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 12,
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
  },
  statsRow: {
    marginTop: 18,
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
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  actions: {
    gap: 10,
  },
});
