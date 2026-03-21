import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import CustomButton from '../components/CustomButton';
import { colors, gradients } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function EventDetailsScreen({ route, navigation }) {
  const event = route.params?.event;
  const { scale } = useResponsive();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { padding: scale(12), gap: scale(12), paddingBottom: scale(34) }]}>
      <HeaderBar title="Event Details" onBack={() => navigation.goBack()} />

      <LinearGradient colors={gradients.primary} style={[styles.banner, { borderRadius: scale(16), padding: scale(14), gap: scale(6) }]}>
        <Text style={[styles.bannerTag, { fontSize: scale(11), paddingHorizontal: scale(9), paddingVertical: scale(4) }]}>{event?.category || 'Event'}</Text>
        <Text style={[styles.bannerTitle, { fontSize: scale(22) }]}>{event?.title || 'Untitled Event'}</Text>
      </LinearGradient>

      <View style={[styles.card, { borderRadius: scale(16), padding: scale(12), gap: scale(9) }]}>
        <View style={[styles.row, { gap: scale(7) }]}>
          <Icon name="calendar-month-outline" size={scale(17)} color={colors.muted} />
          <Text style={[styles.info, { fontSize: scale(13) }]}>{event?.date || 'Date TBD'}</Text>
        </View>

        <View style={[styles.row, { gap: scale(7) }]}>
          <Icon name="map-marker-outline" size={scale(17)} color={colors.muted} />
          <Text style={[styles.info, { fontSize: scale(13) }]}>{event?.location || 'Location TBD'}</Text>
        </View>

        <View style={[styles.row, { gap: scale(7) }]}>
          <Icon name="currency-inr" size={scale(17)} color={colors.muted} />
          <Text style={[styles.info, { fontSize: scale(13) }]}>{event?.price || 'Free'}</Text>
        </View>

        <Text style={[styles.descTitle, { marginTop: scale(5), fontSize: scale(15) }]}>About this event</Text>
        <Text style={[styles.desc, { lineHeight: scale(20), fontSize: scale(13) }]}>{event?.description || 'Detailed description will be available soon.'}</Text>
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
  content: {},
  banner: {},
  bannerTag: {
    alignSelf: 'flex-start',
    color: '#FFF3E8',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
  },
  bannerTitle: {
    color: colors.white,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    color: colors.accent,
    fontWeight: '600',
  },
  descTitle: {
    color: colors.accent,
    fontWeight: '800',
  },
  desc: {
    color: colors.muted,
  },
});
