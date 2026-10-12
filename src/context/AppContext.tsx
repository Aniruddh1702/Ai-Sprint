import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PGListing,
  StudentProfile,
  ChecklistItem,
  ChatMessage,
  ComparisonInsight,
} from '@/types/pg';
import {
  ScamAlert,
  ScamCategory,
  TiffinService,
  TransportOption,
} from '@/types/studentCompanion';
import {
  DEFAULT_STUDENT_PROFILE,
  SAMPLE_PG_LISTINGS,
  INITIAL_CHECKLIST,
} from '@/constants/sampleListings';
import { INITIAL_SCAM_ALERTS } from '@/constants/scamData';
import { SAMPLE_TIFFIN_SERVICES } from '@/constants/foodData';
import { CITY_TRANSPORT_OPTIONS } from '@/constants/transportData';
import { compareListings } from '@/utils/comparisonEngine';
import { Platform } from 'react-native';

interface AppContextType {
  // Profile
  profile: StudentProfile;
  updateProfile: (updated: Partial<StudentProfile>) => void;

  // Listings
  listings: PGListing[];
  activeListing: PGListing | null;
  setActiveListing: (listing: PGListing | null) => void;
  saveListing: (listing: PGListing) => void;
  updateListing: (id: string, updated: Partial<PGListing>) => void;
  deleteListing: (id: string) => void;

  // Comparison
  selectedForCompare: string[];
  toggleCompareSelection: (id: string) => void;
  clearCompareSelection: () => void;
  getComparisonInsights: () => ComparisonInsight;

  // Real AI Analysis
  isAnalyzing: boolean;
  analysisError: string | null;
  analyzeListing: (params: { text?: string; imageBase64?: string }) => Promise<PGListing | null>;

  // PG Proof Buddy Chat
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => void;

  // Checklist
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (title: string, category: ChecklistItem['category'], description?: string) => void;
  deleteChecklistItem: (id: string) => void;

  // Scam Alerts
  scamAlerts: ScamAlert[];
  bookmarkedScams: string[];
  toggleBookmarkScam: (id: string) => void;
  reportUserScam: (report: {
    title: string;
    category: ScamCategory;
    city: string;
    whatHappens: string;
    warningSigns: string[];
  }) => void;

  // Food & Transport selection for smart budget integration
  activeFoodPlan: TiffinService | null;
  setActiveFoodPlan: (plan: TiffinService | null) => void;
  activeTransportMode: TransportOption | null;
  setActiveTransportMode: (opt: TransportOption | null) => void;

  // Starter Kit Checklist
  starterChecklistStatus: Record<string, boolean>;
  toggleStarterChecklistItem: (id: string) => void;

  // Backend connection status
  backendStatus: { connected: boolean; aiConfigured: boolean; message: string };
  checkBackendHealth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: '@pg_proof_profile_v1',
  LISTINGS: '@pg_proof_listings_v1',
  CHECKLIST: '@pg_proof_checklist_v1',
  CHAT: '@pg_proof_chat_v1',
  SCAM_BOOKMARKS: '@pg_proof_scam_bookmarks_v1',
  USER_SCAMS: '@pg_proof_user_scams_v1',
  STARTER_KIT: '@pg_proof_starter_kit_v1',
};

// In Expo Web / Android / iOS, determine backend URL
const getBackendUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // In production on Render or other web hosts, use current origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }
  return 'http://localhost:3001';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [listings, setListings] = useState<PGListing[]>(SAMPLE_PG_LISTINGS);
  const [activeListing, setActiveListing] = useState<PGListing | null>(SAMPLE_PG_LISTINGS[0]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([
    SAMPLE_PG_LISTINGS[0].id,
    SAMPLE_PG_LISTINGS[1].id,
  ]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [scamAlerts, setScamAlerts] = useState<ScamAlert[]>(INITIAL_SCAM_ALERTS);
  const [bookmarkedScams, setBookmarkedScams] = useState<string[]>([]);
  const [starterChecklistStatus, setStarterChecklistStatus] = useState<Record<string, boolean>>({
    'kit-1': true,
    'kit-6': true,
  });

  const [activeFoodPlan, setActiveFoodPlan] = useState<TiffinService | null>(SAMPLE_TIFFIN_SERVICES[0]);
  const [activeTransportMode, setActiveTransportMode] = useState<TransportOption | null>(
    CITY_TRANSPORT_OPTIONS['Bengaluru'] ? CITY_TRANSPORT_OPTIONS['Bengaluru'][0] : null
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        'Namaste Aarav! 🙏 Main hoon aapka PG Proof Buddy. Welcome to your city move!\n\nAsk me anything about:\n1. PG listings, rent & hidden deposit traps\n2. Real student scam alerts in your city (UPI traps, fake gates)\n3. Affordable tiffin & food services\n4. Local metro, bus & auto route fares\n5. Complete monthly budget planning',
      timestamp: new Date().toISOString(),
      quickReplies: [
        'Check fake owner QR code scams in Bangalore',
        'Suggest budget veg tiffin under ₹3,500/mo',
        'Compare Metro vs Bus fare in Bangalore',
        'Draft a rent negotiation WhatsApp message',
      ],
    },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    aiConfigured: false,
    message: 'Checking AI gateway...',
  });

  // Load persisted state
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        let activeCity = DEFAULT_STUDENT_PROFILE.city;
        if (storedProfile) {
          const parsedProf = JSON.parse(storedProfile);
          setProfile(parsedProf);
          if (parsedProf.city) activeCity = parsedProf.city;
        }

        const storedListings = await AsyncStorage.getItem(STORAGE_KEYS.LISTINGS);
        let combinedListings: PGListing[] = SAMPLE_PG_LISTINGS;
        if (storedListings) {
          const parsed = JSON.parse(storedListings);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge sample listings that might not be in parsed storage yet (like Indore listings)
            const existingIds = new Set(parsed.map((p: PGListing) => p.id));
            const missingSamples = SAMPLE_PG_LISTINGS.filter((p) => !existingIds.has(p.id));
            combinedListings = [...parsed, ...missingSamples];
          }
        }
        setListings(combinedListings);

        const initialListing =
          combinedListings.find((p) => p.city.toLowerCase() === activeCity.toLowerCase()) ||
          combinedListings[0];
        setActiveListing(initialListing || null);

        // Sync initial transport and food for active city
        const initialTransports =
          CITY_TRANSPORT_OPTIONS[activeCity] ||
          Object.entries(CITY_TRANSPORT_OPTIONS).find(([k]) =>
            k.toLowerCase() === activeCity.toLowerCase()
          )?.[1];
        if (initialTransports && initialTransports.length > 0) {
          setActiveTransportMode(initialTransports[0]);
        }
        const initialTiffin = SAMPLE_TIFFIN_SERVICES.find(
          (t) => t.city.toLowerCase() === activeCity.toLowerCase()
        );
        if (initialTiffin) {
          setActiveFoodPlan(initialTiffin);
        }

        const storedChecklist = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST);
        if (storedChecklist) setChecklist(JSON.parse(storedChecklist));

        const storedChat = await AsyncStorage.getItem(STORAGE_KEYS.CHAT);
        if (storedChat) {
          const parsedChat = JSON.parse(storedChat);
          if (Array.isArray(parsedChat) && parsedChat.length > 0) {
            setChatMessages(parsedChat);
          }
        }

        const storedBookmarks = await AsyncStorage.getItem(STORAGE_KEYS.SCAM_BOOKMARKS);
        if (storedBookmarks) setBookmarkedScams(JSON.parse(storedBookmarks));

        const storedUserScams = await AsyncStorage.getItem(STORAGE_KEYS.USER_SCAMS);
        if (storedUserScams) {
          const parsedUserScams = JSON.parse(storedUserScams);
          if (Array.isArray(parsedUserScams)) {
            setScamAlerts((prev) => [...parsedUserScams, ...prev]);
          }
        }

        const storedStarterKit = await AsyncStorage.getItem(STORAGE_KEYS.STARTER_KIT);
        if (storedStarterKit) setStarterChecklistStatus(JSON.parse(storedStarterKit));
      } catch (err) {
        console.warn('Failed to load local storage:', err);
      }
    };
    loadState();
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({
          connected: true,
          aiConfigured: Boolean(data.aiConfigured),
          message: data.instructions || 'Backend active',
        });
      } else {
        setBackendStatus({
          connected: false,
          aiConfigured: false,
          message: 'Backend server not responding. Fallbacks active.',
        });
      }
    } catch {
      setBackendStatus({
        connected: false,
        aiConfigured: false,
        message: 'Running in offline/client mode. Start server for live AI inference.',
      });
    }
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));

      // If city changed, sync active listing, transport, and food plan
      if (updated.city && updated.city.trim() && updated.city.toLowerCase() !== prev.city.toLowerCase()) {
        const targetCity = updated.city.trim().toLowerCase();
        
        // Find best matching listing for the new city
        const matchingListing = listings.find((p) => p.city.toLowerCase() === targetCity);
        if (matchingListing) {
          setActiveListing(matchingListing);
        }

        // Sync transport mode
        const cityTransports =
          CITY_TRANSPORT_OPTIONS[updated.city] ||
          Object.entries(CITY_TRANSPORT_OPTIONS).find(([k]) =>
            k.toLowerCase() === targetCity
          )?.[1];
        if (cityTransports && cityTransports.length > 0) {
          setActiveTransportMode(cityTransports[0]);
        }

        // Sync food plan
        const cityTiffins = SAMPLE_TIFFIN_SERVICES.filter(
          (t) => t.city.toLowerCase() === targetCity
        );
        if (cityTiffins.length > 0) {
          setActiveFoodPlan(cityTiffins[0]);
        }
      }

      return next;
    });
  };

  const saveListing = (listing: PGListing) => {
    setListings((prev) => {
      const filtered = prev.filter((p) => p.id !== listing.id);
      const next = [listing, ...filtered];
      AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(next));
      return next;
    });
    setActiveListing(listing);
  };

  const updateListing = (id: string, updated: Partial<PGListing>) => {
    setListings((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, ...updated, isUserCorrected: true, updatedAt: new Date().toISOString() } : p
      );
      AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(next));
      return next;
    });
    if (activeListing && activeListing.id === id) {
      setActiveListing((prev) =>
        prev ? { ...prev, ...updated, isUserCorrected: true, updatedAt: new Date().toISOString() } : null
      );
    }
  };

  const deleteListing = (id: string) => {
    setListings((prev) => {
      const next = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(next));
      return next;
    });
    if (activeListing && activeListing.id === id) {
      setActiveListing(listings.find((p) => p.id !== id) || null);
    }
    setSelectedForCompare((prev) => prev.filter((item) => item !== id));
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const clearCompareSelection = () => {
    setSelectedForCompare([]);
  };

  const getComparisonInsights = (): ComparisonInsight => {
    const list = listings.filter((l) => selectedForCompare.includes(l.id));
    return compareListings(list.length > 0 ? list : listings.slice(0, 2), profile);
  };

  const analyzeListing = async (params: { text?: string; imageBase64?: string }): Promise<PGListing | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch(`${getBackendUrl()}/api/analyze-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          userBudget: profile.monthlyBudget,
          targetCity: profile.city,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.listing) {
        const newListing: PGListing = data.listing;
        saveListing(newListing);
        setActiveListing(newListing);
        return newListing;
      }
      throw new Error('Analysis payload was missing listing data.');
    } catch (err: any) {
      console.warn('Network error during analysis:', err);
      setAnalysisError(err.message || 'Unable to connect to AI gateway. Check network connection.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const newChatList = [...chatMessages, userMsg];
    setChatMessages(newChatList);
    setIsChatLoading(true);

    try {
      const res = await fetch(`${getBackendUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newChatList.map((m) => ({ role: m.role, content: m.content })),
          context: {
            activeListing,
            budget: profile.monthlyBudget,
            city: profile.city,
            activeFoodPlan,
            activeTransportMode,
            scamAlertsCount: scamAlerts.length,
          },
        }),
      });

      let reply = "I'm having trouble connecting right now, but always check your submeter reading before signing!";
      if (res.ok) {
        const data = await res.json();
        if (data.reply) reply = data.reply;
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      const finalChat = [...newChatList, assistantMsg];
      setChatMessages(finalChat);
      AsyncStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(finalChat));
    } catch (err) {
      console.warn('Chat error:', err);
      const cityTransportTip =
        profile.city.toLowerCase() === 'indore'
          ? 'iBus BRTS (AiCTSL Chalo card) offers ~₹300/mo passes for students in Indore.'
          : `${profile.city} public transit offers discounted monthly student passes.`;
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: `Dost, server connection issue hai, but here's essential ${profile.city} advice:\n• Never scan a QR code or pay token advances before seeing the room.\n• ${cityTransportTip}\n• Security deposit should not exceed 1–2 months rent and have a written refund clause.`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages([...newChatList, assistantMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    const fresh: ChatMessage[] = [
      {
        id: `fresh-${Date.now()}`,
        role: 'assistant',
        content: `Chat cleared! How can I help you analyze PGs, prevent student scams, find affordable tiffins, or plan transit?`,
        timestamp: new Date().toISOString(),
      },
    ];
    setChatMessages(fresh);
    AsyncStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(fresh));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(next));
      return next;
    });
  };

  const addChecklistItem = (
    title: string,
    category: ChecklistItem['category'],
    description: string = 'Personal verification note'
  ) => {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title,
      description,
      category,
      completed: false,
    };
    setChecklist((prev) => {
      const next = [newItem, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(next));
      return next;
    });
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist((prev) => {
      const next = prev.filter((item) => item.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(next));
      return next;
    });
  };

  // Scam Alert actions
  const toggleBookmarkScam = (id: string) => {
    setBookmarkedScams((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEYS.SCAM_BOOKMARKS, JSON.stringify(next));
      return next;
    });
  };

  const reportUserScam = (report: {
    title: string;
    category: ScamCategory;
    city: string;
    whatHappens: string;
    warningSigns: string[];
  }) => {
    const newScam: ScamAlert = {
      id: `user-scam-${Date.now()}`,
      title: report.title,
      city: report.city,
      category: report.category,
      whatHappens: report.whatHappens,
      warningSigns: report.warningSigns,
      preventionTips: ['Verify independent reviews and contact local campus helpline.'],
      recoverySteps: ['Lodge an official report at cybercrime.gov.in or helpline 1930.'],
      verificationStatus: 'user_report',
      reportedCount: 1,
      sourceName: 'Student Community Report (Pending Moderator Review)',
      sourceDate: new Date().toISOString().split('T')[0],
    };

    setScamAlerts((prev) => [newScam, ...prev]);
    AsyncStorage.getItem(STORAGE_KEYS.USER_SCAMS).then((existing) => {
      const list = existing ? JSON.parse(existing) : [];
      AsyncStorage.setItem(STORAGE_KEYS.USER_SCAMS, JSON.stringify([newScam, ...list]));
    });
  };

  // Starter Kit actions
  const toggleStarterChecklistItem = (id: string) => {
    setStarterChecklistStatus((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      AsyncStorage.setItem(STORAGE_KEYS.STARTER_KIT, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        listings,
        activeListing,
        setActiveListing,
        saveListing,
        updateListing,
        deleteListing,
        selectedForCompare,
        toggleCompareSelection,
        clearCompareSelection,
        getComparisonInsights,
        isAnalyzing,
        analysisError,
        analyzeListing,
        chatMessages,
        isChatLoading,
        sendChatMessage,
        clearChat,
        checklist,
        toggleChecklistItem,
        addChecklistItem,
        deleteChecklistItem,
        scamAlerts,
        bookmarkedScams,
        toggleBookmarkScam,
        reportUserScam,
        activeFoodPlan,
        setActiveFoodPlan,
        activeTransportMode,
        setActiveTransportMode,
        starterChecklistStatus,
        toggleStarterChecklistItem,
        backendStatus,
        checkBackendHealth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
