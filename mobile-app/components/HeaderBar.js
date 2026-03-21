import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function HeaderBar({ title, subtitle, onBack, rightAction }) {
  const { scale } = useResponsive();

  return (
    <View style={[styles.header, { marginBottom: scale(14) }]}>
      <View style={[styles.leftWrap, { gap: scale(9) }]}>
        {onBack ? (
          <TouchableOpacity style={[styles.backBtn, { width: scale(38), height: scale(38), borderRadius: scale(11) }]} onPress={onBack}>
            <Icon name="arrow-left" size={scale(18)} color={colors.accent} />
          </TouchableOpacity>
        ) : null}
        <View>
          <Text style={[styles.title, { fontSize: scale(21) }]}>{title}</Text>
          {!!subtitle && <Text style={[styles.subtitle, { fontSize: scale(12) }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.accent,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
  },
});
