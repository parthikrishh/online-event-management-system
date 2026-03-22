import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderBar from '../components/HeaderBar';
import EventCard from '../components/EventCard';
import CustomButton from '../components/CustomButton';
import { colors, gradients } from '../constants/theme';
import { mockEvents } from '../services/mockEvents';
import { useResponsive } from '../constants/responsive';

export default function HomeScreen({ navigation }) {
  const { width, scale } = useResponsive();
  const numColumns = width >= 430 ? 2 : 1;

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={mockEvents}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={numColumns > 1 ? { gap: scale(10) } : undefined}
        contentContainerStyle={[styles.listContent, { padding: scale(12), paddingBottom: scale(90) }]}
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

            <LinearGradient colors={gradients.hero} style={[styles.heroCard, { borderRadius: scale(16), padding: scale(14), marginBottom: scale(14) }]}>
              <Text style={[styles.heroTitle, { fontSize: scale(20) }]}>Weekend Picks</Text>
              <Text style={[styles.heroSubtitle, { marginTop: scale(6), lineHeight: scale(19), fontSize: scale(13) }]}>Curated events near you with fast booking experience.</Text>
            </LinearGradient>

            <Text style={[styles.sectionTitle, { fontSize: scale(15), marginBottom: scale(10) }]}>Trending Now</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={numColumns > 1 ? { flex: 1 / numColumns } : undefined}>
            <EventCard
              event={item}
              onPressDetails={() => navigation.navigate('EventDetails', { event: item })}
              onPressJoin={() => navigation.navigate('EventDetails', { event: item })}
            />
          </View>
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
  listContent: {},
  heroCard: {
    overflow: 'hidden',
  },
  heroTitle: {
    color: colors.white,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#E7EEFF',
  },
  sectionTitle: {
    color: colors.accent,
    fontWeight: '800',
  },
  createBtn: {
    minWidth: 104,
  },
});
