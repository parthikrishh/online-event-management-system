import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../constants/theme';

export default function CustomButton({ title, onPress, icon, variant = 'primary', loading = false, style }) {
  const isPrimary = variant === 'primary';

  if (isPrimary) {
    return (
      <Pressable onPress={onPress} style={[styles.buttonWrap, style]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
          {loading ? <ActivityIndicator color={colors.white} /> : icon}
          {!loading && <Text style={styles.primaryText}>{title}</Text>}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.secondaryBtn, style]}>
      {icon}
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
});
