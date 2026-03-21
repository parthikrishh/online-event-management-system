import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={['#1D3557', '#D7263D']} style={styles.container}>
      <View style={styles.logoWrap}>
        <Icon name="calendar-star" size={54} color="#fff" />
      </View>
      <Text style={styles.title}>EventX</Text>
      <Text style={styles.subtitle}>Manage, Discover, and Join Events</Text>
      <Text style={styles.loading}>Loading...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#F6F7FB',
    fontSize: 14,
    marginTop: 8,
  },
  loading: {
    position: 'absolute',
    bottom: 48,
    color: '#F5F7FF',
    fontSize: 13,
  },
});
