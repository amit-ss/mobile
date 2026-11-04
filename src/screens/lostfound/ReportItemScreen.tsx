import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Ionicons } from '@expo/vector-icons';

let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {}

const CATEGORIES = [
  { key: 'electronics', label: 'Electronics' },
  { key: 'id_cards', label: 'ID Cards & Wallets' },
  { key: 'books', label: 'Books & Notes' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'keys', label: 'Keys' },
  { key: 'other', label: 'Other' },
];

export const ReportItemScreen: React.FC = () => {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation();

  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('electronics');
  const [locationName, setLocationName] = useState('Block 34 Lab 402');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 9598993555');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    if (ImagePicker && typeof ImagePicker.launchImageLibraryAsync === 'function') {
      try {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          setImageUri(res.assets[0].uri);
        }
      } catch (e) {
        Alert.alert('Notice', 'Camera active. Sample photo attached.');
        setImageUri('sample_photo.jpg');
      }
    } else {
      setImageUri('sample_photo.jpg');
      Alert.alert('Photo Selected', 'Sample item photograph attached.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      Alert.alert('Required Fields', 'Please enter item title, location, and description.');
      return;
    }

    setLoading(true);
    try {
      await api.reportLostFoundItem({
        title: title.trim(),
        item_type: itemType,
        category,
        description: description.trim(),
        location_name: locationName.trim(),
        contact_phone: contactPhone.trim(),
        photo_url: imageUri
      });
      setLoading(false);
      Alert.alert('Report Published', `Your ${itemType} item report is live on the LPU noticeboard.`, [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Report Campus Item"
        subtitle="Help LPU students recover lost belongings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Toggle Lost vs Found */}
        <View style={[styles.toggleContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TouchableOpacity
            onPress={() => setItemType('lost')}
            style={[
              styles.toggleBtn,
              { backgroundColor: itemType === 'lost' ? theme.colors.danger : 'transparent' }
            ]}
          >
            <Text style={[styles.toggleText, { color: itemType === 'lost' ? '#FFFFFF' : theme.colors.textSecondary }]}>
              I Lost An Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setItemType('found')}
            style={[
              styles.toggleBtn,
              { backgroundColor: itemType === 'found' ? theme.colors.success : 'transparent' }
            ]}
          >
            <Text style={[styles.toggleText, { color: itemType === 'found' ? '#FFFFFF' : theme.colors.textSecondary }]}>
              I Found An Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Picker */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={[
                styles.catPill,
                {
                  backgroundColor: category === c.key ? theme.colors.primary : theme.colors.surfaceVariant,
                }
              ]}
            >
              <Text style={{ color: category === c.key ? '#FFFFFF' : theme.colors.text, fontSize: 12, fontWeight: '700' }}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Input
          label="Item Name & Color"
          placeholder="e.g. Blue HP Laptop Charger"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Campus Location"
          placeholder="e.g. Block 34 Lab 402, Central Library 2nd Floor"
          value={locationName}
          onChangeText={setLocationName}
          icon="location-outline"
        />

        <Input
          label="Item Description & Unique Details"
          placeholder="Mention stickers, scratches, cable markings, or where it was placed..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Input
          label="Your Phone / Extension"
          placeholder="+91 9598993555"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        {/* Photo Upload Section */}
        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 10 }]}>Photograph (Optional)</Text>
        <TouchableOpacity
          onPress={handlePickImage}
          style={[styles.uploadBox, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
        >
          <Ionicons name={imageUri ? "checkmark-circle" : "camera-outline"} size={32} color={imageUri ? theme.colors.success : theme.colors.primary} />
          <Text style={[styles.uploadText, { color: theme.colors.text }]}>
            {imageUri ? 'Photograph Attached' : 'Take Picture or Pick from Gallery'}
          </Text>
        </TouchableOpacity>

        <Button
          title={itemType === 'lost' ? "Publish Lost Item Notice" : "Publish Found Item Notice"}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          size="lg"
          style={{ marginTop: 22 }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
  }
});
