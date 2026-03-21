import { StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';

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
  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, multiline && styles.inputWrapMulti]}>
        <Icon name={icon} size={18} color={colors.muted} style={styles.icon} />
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
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
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  inputWrap: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  inputWrapMulti: {
    alignItems: 'flex-start',
    paddingTop: 10,
    minHeight: 110,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
  },
  inputMulti: {
    textAlignVertical: 'top',
    minHeight: 95,
  },
});
