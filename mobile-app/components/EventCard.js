import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from './CustomButton';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function EventCard({ event, onPressDetails, onPressJoin }) {
  const { scale, isSmall, isLarge } = useResponsive();

  return (
    <View style={[styles.card, { borderRadius: scale(18), marginBottom: scale(12) }]}>
      <ImageBackground
        source={{ uri: event.image }}
        style={[styles.cover, { height: isSmall ? scale(138) : isLarge ? scale(174) : scale(156), padding: scale(10) }]}
        imageStyle={[styles.coverImage, { borderTopLeftRadius: scale(18), borderTopRightRadius: scale(18) }]}
      >
        <View style={[styles.badge, { paddingHorizontal: scale(9), paddingVertical: scale(4) }]}>
          <Text style={[styles.badgeText, { fontSize: scale(10) }]}>{event.category}</Text>
        </View>
      </ImageBackground>

      <View style={[styles.content, { padding: scale(12), gap: scale(6) }]}>
        <Text style={[styles.title, { fontSize: scale(16) }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={[styles.metaRow, { gap: scale(5) }]}>
          <Icon name="calendar-month-outline" size={scale(14)} color={colors.muted} />
          <Text style={[styles.metaText, { fontSize: scale(12) }]}>{event.date}</Text>
        </View>

        <View style={[styles.metaRow, { gap: scale(5) }]}>
          <Icon name="map-marker-outline" size={scale(14)} color={colors.muted} />
          <Text style={[styles.metaText, { fontSize: scale(12) }]}>{event.location}</Text>
        </View>

        <View style={[styles.footer, { marginTop: scale(8), gap: scale(9) }]}>
          <Text style={[styles.price, { fontSize: scale(14) }]}>{event.price}</Text>
          <View style={[styles.actions, { gap: scale(7) }]}>
            <CustomButton title="Details" variant="secondary" onPress={onPressDetails} style={styles.smallBtn} />
            <CustomButton title="Join" onPress={onPressJoin} style={styles.smallBtn} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cover: {
    justifyContent: 'flex-end',
  },
  coverImage: {},
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 24, 40, 0.65)',
    borderRadius: 999,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '700',
  },
  content: {},
  title: {
    fontWeight: '800',
    color: colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.muted,
  },
  footer: {},
  price: {
    color: colors.primary,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
  },
  smallBtn: {
    flex: 1,
  },
});
