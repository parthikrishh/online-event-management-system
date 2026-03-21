import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import EventCard from '../components/EventCard';
import { colors } from '../constants/theme';
import { mockEvents } from '../services/mockEvents';
import { useResponsive } from '../constants/responsive';

export default function MyEventsScreen({ navigation }) {
  const { width, scale } = useResponsive();
  const numColumns = width >= 430 ? 2 : 1;

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={mockEvents.slice(0, 2)}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={numColumns > 1 ? { gap: scale(10) } : undefined}
        contentContainerStyle={[styles.content, { padding: scale(12), paddingBottom: scale(90) }]}
        ListHeaderComponent={
          <View style={[styles.headerBlock, { marginBottom: scale(8) }]}>
            <HeaderBar title="My Events" subtitle="Events you created or joined" />
            <Text style={[styles.helper, { marginBottom: scale(10), lineHeight: scale(19), fontSize: scale(13) }]}>You can manage event status, tickets, and updates from this section.</Text>
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
  content: {},
  headerBlock: {},
  helper: {
    color: colors.muted,
  },
});
