import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function CustomButton({ title, onPress, icon, variant = 'primary', loading = false, style }) {
  const isPrimary = variant === 'primary';
  const { scale } = useResponsive();

  if (isPrimary) {
    return (
      <Pressable onPress={onPress} style={[styles.buttonWrap, style]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryBtn, { minHeight: scale(50), borderRadius: scale(14), gap: scale(8), paddingHorizontal: scale(14) }]}
        >
          {loading ? <ActivityIndicator color={colors.white} /> : icon}
          {!loading && <Text style={[styles.primaryText, { fontSize: scale(14) }]}>{title}</Text>}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.secondaryBtn,
        { minHeight: scale(50), borderRadius: scale(14), gap: scale(7), paddingHorizontal: scale(13) },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.secondaryText, { fontSize: scale(14) }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryText: {
    color: colors.white,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryText: {
    color: colors.accent,
    fontWeight: '700',
  },
});
