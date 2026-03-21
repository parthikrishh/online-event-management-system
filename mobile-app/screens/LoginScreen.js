import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.headRow}>
          <Icon name="calendar-month" size={30} color={colors.primary} />
          <Text style={styles.title}>Welcome Back</Text>
        </View>

        <Text style={styles.subtext}>Sign in to continue exploring and managing your events.</Text>

        <View style={styles.form}>
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
          <Text style={styles.footerText}>
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
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accent,
  },
  subtext: {
    color: colors.muted,
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  footerText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 6,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
