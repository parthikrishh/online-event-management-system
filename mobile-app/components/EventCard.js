import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from './CustomButton';
import { colors } from '../constants/theme';

export default function EventCard({ event, onPressDetails, onPressJoin }) {
  return (
    <View style={styles.card}>
      <ImageBackground source={{ uri: event.image }} style={styles.cover} imageStyle={styles.coverImage}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event.category}</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Icon name="calendar-month-outline" size={15} color={colors.muted} />
          <Text style={styles.metaText}>{event.date}</Text>
        </View>

        <View style={styles.metaRow}>
          <Icon name="map-marker-outline" size={15} color={colors.muted} />
          <Text style={styles.metaText}>{event.location}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{event.price}</Text>
          <View style={styles.actions}>
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
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cover: {
    height: 160,
    justifyContent: 'flex-end',
    padding: 12,
  },
  coverImage: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 24, 40, 0.65)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
    gap: 7,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  price: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    flex: 1,
  },
});
