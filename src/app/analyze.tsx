import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_LISTING_SNIPPETS = [
  {
    title: 'Koramangala Flatmate PG',
    snippet: `Twin sharing PG in Koramangala 5th Block. Rent 14000/pm, Deposit 28000. Food not included (Mess tie-up available ₹3500). Electricity commercial submeter ₹12/unit. 3 months lock-in. 10 PM gate closure. High speed wifi and housekeeping included.`,
  },
  {
    title: 'Hinjewadi IT Co-Living',
    snippet: `Single and Double room in Hinjewadi Phase 1, Pune. Rent ₹10,500 includes 3 meals breakfast, lunch, dinner. Deposit ₹15,000 refundable. Electricity 100 units free then ₹8/unit. 24x7 biometric entry. No lockin, 30 days notice.`,
  },
  {
    title: 'North Campus Delhi Student PG',
    snippet: `Luxury PG near Kamla Nagar, Delhi. Rent ₹11000 with meals. Deposit ₹20000 (₹5000 non-refundable maintenance on exit). AC charges separate ₹10/unit. Strict curfew 9:30 PM. No male visitors allowed.`,
  },
];

export default function AnalyzeScreen() {
  const router = useRouter();
  const { analyzeListing, isAnalyzing, analysisError } = useApp();

  const [inputMode, setInputMode] = useState<'text' | 'image' | 'manual'>('text');
  const [adText, setAdText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Manual entry fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualRent, setManualRent] = useState('');
  const [manualDeposit, setManualDeposit] = useState('');
  const [manualFood, setManualFood] = useState('yes');
  const [manualElectricity, setManualElectricity] = useState('₹10/unit');

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Needed', 'Permission to access photos is needed to analyze listing screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : null);
      }
    } catch (err) {
      console.warn('Error picking image:', err);
    }
  };

  const handleAnalyze = async () => {
    let payloadText = adText;

    if (inputMode === 'manual') {
      if (!manualTitle || !manualRent) {
        Alert.alert('Missing Details', 'Please enter at least PG name and monthly rent.');
        return;
      }
      payloadText = `${manualTitle}. Rent ₹${manualRent} per month. Deposit ₹${manualDeposit || '0'}. Food included: ${manualFood}. Electricity: ${manualElectricity}.`;
    }

    if (inputMode === 'image' && !selectedImage) {
      Alert.alert('No Image Selected', 'Please choose or take a screenshot of the PG ad first.');
      return;
    }

    if (inputMode === 'text' && !adText.trim()) {
      Alert.alert('Empty Listing', 'Please paste the advertisement text or select a sample snippet below.');
      return;
    }

    const result = await analyzeListing({
      text: payloadText,
      imageBase64: inputMode === 'image' && imageBase64 ? imageBase64 : undefined,
    });

    if (result) {
      router.push('/report');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <ClayCard variant="lavender" padding={18} radius={ClayRadii.xl} style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>AI Listing Analyzer</Text>
            <Text style={styles.pageSubtitle}>
              Paste a WhatsApp ad, upload a magicbricks/nobroker screenshot, or enter details manually.
            </Text>
          </View>
          <ClayBuddyAvatar mood="thinking" size={64} />
        </View>
      </ClayCard>

      {/* Mode Selector Tabs */}
      <View style={styles.modeTabsRow}>
        <Pressable
          onPress={() => setInputMode('text')}
          style={[
            styles.modeTab,
            inputMode === 'text' && styles.modeTabActive,
          ]}
        >
          <Ionicons
            name="document-text"
            size={16}
            color={inputMode === 'text' ? '#FFFFFF' : ClayColors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              inputMode === 'text' && styles.modeTabTextActive,
            ]}
          >
            Paste Text
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setInputMode('image')}
          style={[
            styles.modeTab,
            inputMode === 'image' && styles.modeTabActive,
          ]}
        >
          <Ionicons
            name="image"
            size={16}
            color={inputMode === 'image' ? '#FFFFFF' : ClayColors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              inputMode === 'image' && styles.modeTabTextActive,
            ]}
          >
            Screenshot
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setInputMode('manual')}
          style={[
            styles.modeTab,
            inputMode === 'manual' && styles.modeTabActive,
          ]}
        >
          <Ionicons
            name="create"
            size={16}
            color={inputMode === 'manual' ? '#FFFFFF' : ClayColors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              inputMode === 'manual' && styles.modeTabTextActive,
            ]}
          >
            Manual Entry
          </Text>
        </Pressable>
      </View>

      {/* Input Mode 1: Text */}
      {inputMode === 'text' && (
        <ClayCard variant="default" padding={16} radius={ClayRadii.lg} style={styles.inputCard}>
          <Text style={styles.inputCardLabel}>Paste Advertisement Text</Text>
          <ClayInput
            placeholder="e.g. 2 sharing room available in Koramangala. Rent 12,000, 2 months deposit. Food 3 times, wifi, washing machine. Electricity extra on meter..."
            multiline
            numberOfLines={5}
            value={adText}
            onChangeText={setAdText}
            inputStyle={{ minHeight: 110, textAlignVertical: 'top' }}
          />

          {/* Quick Sample Selector */}
          <Text style={styles.samplesHeading}>Or try with a real student ad sample:</Text>
          <View style={styles.samplesList}>
            {SAMPLE_LISTING_SNIPPETS.map((sample, idx) => (
              <Pressable
                key={idx}
                onPress={() => setAdText(sample.snippet)}
                style={({ pressed }) => [
                  styles.sampleSnippetBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="flash" size={14} color={ClayColors.buddyPurple} />
                <Text style={styles.sampleSnippetText}>{sample.title}</Text>
              </Pressable>
            ))}
          </View>
        </ClayCard>
      )}

      {/* Input Mode 2: Screenshot */}
      {inputMode === 'image' && (
        <ClayCard variant="default" padding={18} radius={ClayRadii.lg} style={styles.inputCard}>
          <Text style={styles.inputCardLabel}>Upload Listing Screenshot</Text>
          <Text style={styles.inputCardHint}>
            Screenshot of a WhatsApp listing, broker message, OLX, NoBroker, or brochure.
          </Text>

          {selectedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="contain" />
              <Pressable onPress={() => setSelectedImage(null)} style={styles.removeImageBtn}>
                <Ionicons name="trash" size={16} color="#DC2626" />
                <Text style={styles.removeImageText}>Remove Screenshot</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickImage}
              style={[styles.uploadBox, ClayShadows.pill]}
            >
              <View style={styles.uploadIconBlob}>
                <Ionicons name="cloud-upload" size={28} color={ClayColors.buddyPurple} />
              </View>
              <Text style={styles.uploadTitle}>Tap to select screenshot</Text>
              <Text style={styles.uploadSubtitle}>PNG, JPG from your photo library</Text>
            </Pressable>
          )}
        </ClayCard>
      )}

      {/* Input Mode 3: Manual Entry */}
      {inputMode === 'manual' && (
        <ClayCard variant="default" padding={18} radius={ClayRadii.lg} style={styles.inputCard}>
          <Text style={styles.inputCardLabel}>Enter Listing Details</Text>
          <ClayInput
            label="PG / Property Name *"
            placeholder="e.g. Royal Comforts PG for Gents"
            value={manualTitle}
            onChangeText={setManualTitle}
          />
          <ClayInput
            label="Monthly Rent (₹) *"
            placeholder="e.g. 11000"
            keyboardType="numeric"
            value={manualRent}
            onChangeText={setManualRent}
          />
          <ClayInput
            label="Security Deposit (₹)"
            placeholder="e.g. 22000"
            keyboardType="numeric"
            value={manualDeposit}
            onChangeText={setManualDeposit}
          />
          <ClayInput
            label="Electricity Tariff / Submeter"
            placeholder="e.g. ₹10/unit or Included in rent"
            value={manualElectricity}
            onChangeText={setManualElectricity}
          />
        </ClayCard>
      )}

      {/* Analysis Error State */}
      {analysisError && (
        <ClayCard variant="rose" padding={14} radius={ClayRadii.md} style={styles.errorCard}>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={20} color={ClayColors.roseDark} />
            <Text style={styles.errorText}>{analysisError}</Text>
          </View>
        </ClayCard>
      )}

      {/* Loading Progress State */}
      {isAnalyzing && (
        <ClayCard variant="blue" padding={20} radius={ClayRadii.lg} style={styles.loadingCard}>
          <ClayBuddyAvatar mood="thinking" size={72} animate />
          <ActivityIndicator size="large" color={ClayColors.buddyPurple} style={{ marginVertical: 12 }} />
          <Text style={styles.loadingTitle}>Analyzing Listing with AI...</Text>
          <Text style={styles.loadingSubtitle}>
            Extracting rent, deposit, lock-in clauses, unit tariffs, and checking against student safety guidelines.
          </Text>
        </ClayCard>
      )}

      {/* Submit Action */}
      {!isAnalyzing && (
        <ClayButton
          title="Run PG Proof Analysis"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleAnalyze}
          icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
          style={{ marginTop: 14 }}
        />
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 320,
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modeTabActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
    marginLeft: 6,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  inputCard: {
    marginBottom: 14,
  },
  inputCardLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 4,
  },
  inputCardHint: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginBottom: 12,
  },
  samplesHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textMuted,
    marginTop: 12,
    marginBottom: 8,
  },
  samplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleSnippetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleSnippetText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textPrimary,
    marginLeft: 4,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: ClayRadii.lg,
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadIconBlob: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  previewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: ClayRadii.md,
    backgroundColor: '#F1F5F9',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF1F2',
    borderRadius: ClayRadii.pill,
  },
  removeImageText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    marginLeft: 4,
  },
  errorCard: {
    marginBottom: 14,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: ClayColors.roseDark,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginVertical: 14,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
});
