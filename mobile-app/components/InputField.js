import { StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon = 'text-box-outline',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
}) {
  const { scale } = useResponsive();

  return (
    <View style={[styles.container, { gap: scale(8) }]}>
      {!!label && <Text style={[styles.label, { fontSize: scale(12) }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          { borderRadius: scale(14), minHeight: scale(50), paddingHorizontal: scale(11) },
          multiline && [styles.inputWrapMulti, { minHeight: scale(108), paddingTop: scale(9) }],
        ]}
      >
        <Icon name={icon} size={scale(17)} color={colors.muted} style={[styles.icon, { marginRight: scale(7), marginTop: scale(2) }]} />
        <TextInput
          style={[styles.input, { fontSize: scale(14) }, multiline && [styles.inputMulti, { minHeight: scale(92) }]]}
          placeholder={placeholder}
          placeholderTextColor="#98A2B3"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    color: colors.muted,
    fontWeight: '600',
  },
  inputWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapMulti: {
    alignItems: 'flex-start',
  },
  icon: {},
  input: {
    flex: 1,
    color: colors.black,
  },
  inputMulti: {
    textAlignVertical: 'top',
  },
});
