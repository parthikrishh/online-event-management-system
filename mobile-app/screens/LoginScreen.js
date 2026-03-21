import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/theme';
import { useResponsive } from '../constants/responsive';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { scale } = useResponsive();

  return (
    <KeyboardAvoidingView style={[styles.screen, { padding: scale(14) }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.card, { borderRadius: scale(20), padding: scale(16), gap: scale(12) }]}>
        <View style={[styles.headRow, { gap: scale(9) }]}>
          <Icon name="calendar-month" size={scale(28)} color={colors.primary} />
          <Text style={[styles.title, { fontSize: scale(24) }]}>Welcome Back</Text>
        </View>

        <Text style={[styles.subtext, { lineHeight: scale(19), fontSize: scale(13) }]}>Sign in to continue exploring and managing your events.</Text>

        <View style={[styles.form, { gap: scale(11) }]}>
          <InputField
            label="Email"
            icon="email-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            icon="lock-outline"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomButton title="Login" onPress={() => navigation.replace('MainTabs')} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.footerText, { marginTop: scale(5), fontSize: scale(13) }]}>
            New user? <Text style={styles.link}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    color: colors.accent,
  },
  subtext: {
    color: colors.muted,
  },
  form: {},
  footerText: {
    textAlign: 'center',
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
