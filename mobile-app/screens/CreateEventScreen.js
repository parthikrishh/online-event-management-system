import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { colors } from '../constants/theme';

export default function CreateEventScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <HeaderBar title="Create Event" subtitle="Publish a new experience" onBack={() => navigation.goBack()} />

      <View style={styles.formCard}>
        <InputField label="Event Title" icon="format-title" placeholder="Ex: Design Meet 2026" value={title} onChangeText={setTitle} />
        <InputField label="Category" icon="shape-outline" placeholder="Music, Tech, Sports" value={category} onChangeText={setCategory} />
        <InputField label="Date & Time" icon="calendar-clock" placeholder="25 Apr 2026, 8:00 PM" value={date} onChangeText={setDate} />
        <InputField label="Location" icon="map-marker-radius-outline" placeholder="Venue and city" value={location} onChangeText={setLocation} />
        <InputField label="Price" icon="currency-inr" placeholder="INR 999" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <InputField
          label="Description"
          icon="text-box-outline"
          placeholder="Tell attendees what to expect"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <CustomButton title="Create Event" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 14,
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
});
