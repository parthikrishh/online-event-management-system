import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import CustomButton from '../components/CustomButton';
import { colors, gradients } from '../constants/theme';

export default function EventDetailsScreen({ route, navigation }) {
  const event = route.params?.event;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <HeaderBar title="Event Details" onBack={() => navigation.goBack()} />

      <LinearGradient colors={gradients.primary} style={styles.banner}>
        <Text style={styles.bannerTag}>{event?.category || 'Event'}</Text>
        <Text style={styles.bannerTitle}>{event?.title || 'Untitled Event'}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="calendar-month-outline" size={18} color={colors.muted} />
          <Text style={styles.info}>{event?.date || 'Date TBD'}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="map-marker-outline" size={18} color={colors.muted} />
          <Text style={styles.info}>{event?.location || 'Location TBD'}</Text>
        </View>

        <View style={styles.row}>
          <Icon name="currency-inr" size={18} color={colors.muted} />
          <Text style={styles.info}>{event?.price || 'Free'}</Text>
        </View>

        <Text style={styles.descTitle}>About this event</Text>
        <Text style={styles.desc}>{event?.description || 'Detailed description will be available soon.'}</Text>
      </View>

      <CustomButton title="Join / Register" onPress={() => {}} />
    </ScrollView>
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
    paddingBottom: 40,
  },
  banner: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    color: '#FFF3E8',
    fontWeight: '700',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  info: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  descTitle: {
    marginTop: 6,
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  desc: {
    color: colors.muted,
    lineHeight: 22,
    fontSize: 14,
  },
});
