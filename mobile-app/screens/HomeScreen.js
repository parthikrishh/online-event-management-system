import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import EventCard from '../components/EventCard';
import CustomButton from '../components/CustomButton';
import { colors, gradients } from '../constants/theme';
import { mockEvents } from '../services/mockEvents';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={mockEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <HeaderBar
              title="Explore Events"
              subtitle="Find concerts, workshops, and meetups"
              rightAction={
                <CustomButton
                  title="Create"
                  onPress={() => navigation.navigate('CreateEvent')}
                  style={styles.createBtn}
                  icon={<Icon name="plus" size={18} color="#fff" />}
                />
              }
            />

            <LinearGradient colors={gradients.hero} style={styles.heroCard}>
              <Text style={styles.heroTitle}>Weekend Picks</Text>
              <Text style={styles.heroSubtitle}>Curated events near you with fast booking experience.</Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPressDetails={() => navigation.navigate('EventDetails', { event: item })}
            onPressJoin={() => navigation.navigate('EventDetails', { event: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 14,
    paddingBottom: 90,
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#E7EEFF',
    marginTop: 6,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  createBtn: {
    minWidth: 104,
  },
});
