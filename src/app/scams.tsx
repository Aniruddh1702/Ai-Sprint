import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Modal,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayInput } from '@/components/clay/ClayInput';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { SCAM_CATEGORIES } from '@/constants/scamData';
import { ScamCategory, ScamVerificationStatus } from '@/types/studentCompanion';
import { Ionicons } from '@expo/vector-icons';

export default function ScamAlertsScreen() {
  const {
    profile,
    scamAlerts,
    bookmarkedScams,
    toggleBookmarkScam,
    reportUserScam,
  } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>(profile.city || 'Indore');
  const [selectedCategory, setSelectedCategory] = useState<ScamCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScamId, setExpandedScamId] = useState<string | null>(null);

  // Sync selectedCity when profile.city changes
  React.useEffect(() => {
    if (profile.city) {
      setSelectedCity(profile.city);
    }
  }, [profile.city]);

  // Report Modal states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<ScamCategory>('fake_listings');
  const [reportWhatHappens, setReportWhatHappens] = useState('');
  const [reportWarningSign, setReportWarningSign] = useState('');
  const [reportSubmittedToast, setReportSubmittedToast] = useState(false);

  // Filter scams
  const filteredAlerts = scamAlerts.filter((item) => {
    // City filter
    const matchesCity =
      selectedCity === 'All Cities' ||
      item.city === 'All Cities' ||
      item.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
      selectedCity.toLowerCase().includes(item.city.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    // Search query
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatHappens.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  const getVerificationBadge = (status: ScamVerificationStatus) => {
    switch (status) {
      case 'official_advisory':
        return <ClayBadge label="OFFICIAL ADVISORY" type="verified" />;
      case 'verified_incident':
        return <ClayBadge label="VERIFIED INCIDENT" type="redflag" />;
      case 'general_warning':
        return <ClayBadge label="SAFETY WARNING" type="estimate" />;
      case 'user_report':
      default:
        return <ClayBadge label="COMMUNITY REPORT (UNVERIFIED)" type="neutral" />;
    }
  };

  const handleOpenSource = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.warn('Cannot open url:', err));
  };

  const handleSubmitUserReport = () => {
    if (!reportTitle.trim() || !reportWhatHappens.trim()) {
      alert('Please enter a title and description of the incident.');
      return;
    }

    reportUserScam({
      title: reportTitle.trim(),
      category: reportCategory,
      city: selectedCity === 'All Cities' ? profile.city : selectedCity,
      whatHappens: reportWhatHappens.trim(),
      warningSigns: reportWarningSign.trim() ? [reportWarningSign.trim()] : ['Suspicious prepayment request'],
    });

    setReportModalVisible(false);
    setReportTitle('');
    setReportWhatHappens('');
    setReportWarningSign('');
    setReportSubmittedToast(true);
    setTimeout(() => setReportSubmittedToast(false), 4000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Advisory Banner */}
      <ClayCard variant="rose" padding={18} radius={ClayRadii.xl} style={styles.topBanner}>
        <View style={styles.topBannerRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.emergencyPill}>
              <Ionicons name="shield-checkmark" size={13} color="#BE123C" />
              <Text style={styles.emergencyPillText}>Cyber Helpline: Dial 1930</Text>
            </View>
            <Text style={styles.bannerTitle}>City Student Scam Alerts</Text>
            <Text style={styles.bannerSubtitle}>
              Verified police advisories, fake deposit warnings, and QR code traps targeting college freshers.
            </Text>
          </View>
          <ClayBuddyAvatar mood="alert" size={60} />
        </View>

        {/* Quick Report CTA */}
        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => setReportModalVisible(true)}
            style={({ pressed }) => [
              styles.reportCtaBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="megaphone" size={14} color="#BE123C" />
            <Text style={styles.reportCtaText}>Report a Suspicious Incident</Text>
          </Pressable>
        </View>
      </ClayCard>

      {reportSubmittedToast && (
        <ClayCard variant="mint" padding={12} radius={ClayRadii.md} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: ClayColors.mintDeep, fontWeight: '700' }}>
            ✓ Your incident report was submitted for review and tagged as unverified community feedback.
          </Text>
        </ClayCard>
      )}

      {/* City Selector Pills */}
      <View style={styles.cityPillsRow}>
        {Array.from(new Set(['Indore', profile.city || 'Indore', 'Bengaluru', 'Pune', 'Delhi NCR', 'All Cities'])).map((city) => (
          <Pressable
            key={city}
            onPress={() => setSelectedCity(city)}
            style={[
              styles.cityPill,
              selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillActive,
            ]}
          >
            <Text
              style={[
                styles.cityPillText,
                selectedCity.toLowerCase() === city.toLowerCase() && styles.cityPillTextActive,
              ]}
            >
              {city === 'All Cities' ? '🌐 All Cities' : `📍 ${city}`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Search Input */}
      <ClayInput
        placeholder="Search keywords (e.g. QR code, army, deposit, gate pass)..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        iconLeft={<Ionicons name="search" size={18} color={ClayColors.textMuted} />}
        containerStyle={{ marginVertical: 8 }}
      />

      {/* Category Filter Pills Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <Pressable
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.categoryPill,
            selectedCategory === 'all' && styles.categoryPillActive,
          ]}
        >
          <Text
            style={[
              styles.categoryPillText,
              selectedCategory === 'all' && styles.categoryPillTextActive,
            ]}
          >
            All Categories
          </Text>
        </Pressable>

        {SCAM_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryPill,
              selectedCategory === cat.id && styles.categoryPillActive,
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === cat.id && styles.categoryPillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Active Advisories ({filteredAlerts.length})
        </Text>
        <Text style={styles.locationNote}>Location: {selectedCity}</Text>
      </View>

      {/* Scam Cards List */}
      {filteredAlerts.length === 0 ? (
        <ClayCard variant="default" padding={20} radius={ClayRadii.lg} style={{ alignItems: 'center' }}>
          <ClayBuddyAvatar mood="happy" size={60} />
          <Text style={styles.noScamsTitle}>Zero Specific Alerts for this Filter</Text>
          <Text style={styles.noScamsSub}>
            City-specific incident data could not be verified for this exact filter. Always follow general safety education before sending advance payments.
          </Text>
        </ClayCard>
      ) : (
        filteredAlerts.map((scam) => {
          const isExpanded = expandedScamId === scam.id;
          const isBookmarked = bookmarkedScams.includes(scam.id);

          return (
            <ClayCard
              key={scam.id}
              variant={scam.verificationStatus === 'official_advisory' ? 'cream' : 'default'}
              padding={16}
              radius={ClayRadii.lg}
              style={styles.scamCard}
            >
              {/* Header Badges */}
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  {getVerificationBadge(scam.verificationStatus)}
                  <ClayBadge label={`📍 ${scam.city}`} type="fact" />
                </View>

                <Pressable
                  onPress={() => toggleBookmarkScam(scam.id)}
                  style={styles.bookmarkBtn}
                >
                  <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={isBookmarked ? ClayColors.buddyPurple : ClayColors.textMuted}
                  />
                </Pressable>
              </View>

              {/* Title & Modus Operandi */}
              <Text style={styles.scamTitle}>{scam.title}</Text>
              <Text style={styles.scamWhatHappens}>{scam.whatHappens}</Text>

              {/* Warning Signs */}
              <View style={styles.warningSignsBox}>
                <Text style={styles.warningSignsHeading}>⚠️ Common Warning Signs:</Text>
                {scam.warningSigns.map((sign, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Ionicons name="alert-circle" size={13} color="#EA580C" style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{sign}</Text>
                  </View>
                ))}
              </View>

              {/* Expandable Prevention & Recovery Section */}
              {isExpanded ? (
                <View style={styles.expandedSection}>
                  <Text style={styles.preventionHeading}>🛡️ How to Protect Yourself:</Text>
                  {scam.preventionTips.map((tip, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#15803D" style={{ marginTop: 2 }} />
                      <Text style={styles.bulletText}>{tip}</Text>
                    </View>
                  ))}

                  <Text style={[styles.preventionHeading, { color: '#BE123C', marginTop: 10 }]}>
                    🚨 If Money or Details Already Lost:
                  </Text>
                  {scam.recoverySteps.map((step, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <Ionicons name="flame" size={14} color="#BE123C" style={{ marginTop: 2 }} />
                      <Text style={[styles.bulletText, { fontWeight: '600' }]}>{step}</Text>
                    </View>
                  ))}

                  {/* Sources & Citations */}
                  {scam.sourceName && (
                    <View style={styles.sourceBox}>
                      <Text style={styles.sourceLabel}>
                        Verified Authority / Source: <Text style={{ fontWeight: '700' }}>{scam.sourceName}</Text>
                      </Text>
                      {scam.sourceDate && (
                        <Text style={styles.sourceDate}>Advisory Date: {scam.sourceDate}</Text>
                      )}
                      {scam.sourceLink && (
                        <Pressable onPress={() => handleOpenSource(scam.sourceLink)}>
                          <Text style={styles.sourceLinkText}>Open Official Portal →</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              ) : null}

              {/* Action buttons */}
              <View style={styles.cardActionsRow}>
                <Pressable
                  onPress={() => setExpandedScamId(isExpanded ? null : scam.id)}
                  style={styles.expandBtn}
                >
                  <Text style={styles.expandBtnText}>
                    {isExpanded ? 'Hide Prevention Guide ▲' : 'View Safety & Recovery Guide ▼'}
                  </Text>
                </Pressable>

                <View style={styles.reportedCountPill}>
                  <Text style={styles.reportedCountText}>
                    {scam.reportedCount} Students Alerted
                  </Text>
                </View>
              </View>
            </ClayCard>
          );
        })
      )}

      {/* Report Incident Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard variant="default" padding={20} radius={ClayRadii.xl} style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report a Student Scam</Text>
              <Pressable onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={ClayColors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.modalSub}>
              Share a suspicious listing or fraud attempt you experienced. Student privacy is strictly protected; no personal numbers are published.
            </Text>

            <ScrollView style={{ maxHeight: 340 }}>
              <ClayInput
                label="Scam Title *"
                placeholder="e.g. Fake Army officer advance token in HSR Layout"
                value={reportTitle}
                onChangeText={setReportTitle}
              />

              <ClayInput
                label="What Happened / Modus Operandi *"
                placeholder="Explain what the fraudster asked you to do..."
                multiline
                numberOfLines={4}
                value={reportWhatHappens}
                onChangeText={setReportWhatHappens}
                inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
              />

              <ClayInput
                label="Key Warning Sign"
                placeholder="e.g. Sent QR code to 'receive' ₹2,000 token"
                value={reportWarningSign}
                onChangeText={setReportWarningSign}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <ClayButton
                title="Cancel"
                variant="secondary"
                onPress={() => setReportModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <ClayButton
                title="Submit for Review"
                variant="primary"
                onPress={handleSubmitUserReport}
                style={{ flex: 1.4, marginLeft: 8 }}
              />
            </View>
          </ClayCard>
        </View>
      </Modal>

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
  topBanner: {
    marginBottom: 14,
  },
  topBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  emergencyPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE123C',
    marginLeft: 4,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: ClayColors.textPrimary,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    lineHeight: 17,
    marginTop: 4,
  },
  ctaRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(190, 18, 60, 0.15)',
    paddingTop: 10,
  },
  reportCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    alignSelf: 'flex-start',
    borderWidth: 1.2,
    borderColor: '#FECDD3',
  },
  reportCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE123C',
    marginLeft: 6,
  },
  cityPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  cityPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cityPillActive: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
  },
  cityPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  cityPillTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: ClayColors.buddyPurple,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textSecondary,
  },
  categoryPillTextActive: {
    color: ClayColors.buddyPurple,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  locationNote: {
    fontSize: 12,
    color: ClayColors.textMuted,
  },
  noScamsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginTop: 10,
  },
  noScamsSub: {
    fontSize: 12,
    color: ClayColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },
  scamCard: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bookmarkBtn: {
    padding: 4,
  },
  scamTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: ClayColors.textPrimary,
    marginBottom: 4,
  },
  scamWhatHappens: {
    fontSize: 13,
    color: ClayColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  warningSignsBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: ClayRadii.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 10,
    marginBottom: 8,
  },
  warningSignsHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  bulletText: {
    fontSize: 12,
    color: ClayColors.textSecondary,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 6,
  },
  preventionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 4,
  },
  sourceBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: ClayRadii.sm,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceLabel: {
    fontSize: 11,
    color: ClayColors.textSecondary,
  },
  sourceDate: {
    fontSize: 10,
    color: ClayColors.textMuted,
    marginTop: 2,
  },
  sourceLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
    marginTop: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  expandBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  expandBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: ClayColors.buddyPurple,
  },
  reportedCountPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: ClayRadii.pill,
  },
  reportedCountText: {
    fontSize: 10,
    color: ClayColors.textMuted,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginVertical: 8,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
});
