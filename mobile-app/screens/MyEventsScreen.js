import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import EventCard from '../components/EventCard';
import { colors } from '../constants/theme';
import { mockEvents } from '../services/mockEvents';

export default function MyEventsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={mockEvents.slice(0, 2)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <HeaderBar title="My Events" subtitle="Events you created or joined" />
            <Text style={styles.helper}>You can manage event status, tickets, and updates from this section.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPressDetails={() => navigation.navigate('EventDetails', { event: item })}
            onPressJoin={() => navigation.navigate('EventDetails', { event: item })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 14,
    paddingBottom: 90,
  },
  headerBlock: {
    marginBottom: 8,
  },
  helper: {
    color: colors.muted,
    marginBottom: 10,
    lineHeight: 20,
  },
});
