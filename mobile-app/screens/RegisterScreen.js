import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import HeaderBar from '../components/HeaderBar';
import { colors } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <HeaderBar title="Create Account" subtitle="Join EventX community" onBack={() => navigation.goBack()} />

        <View style={styles.form}>
          <InputField label="Full Name" icon="account-outline" placeholder="John Doe" value={name} onChangeText={setName} />
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
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <CustomButton title="Register" onPress={() => navigation.replace('MainTabs')} />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.link}>Login</Text>
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
    gap: 8,
  },
  form: {
    gap: 12,
  },
  footerText: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 10,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
