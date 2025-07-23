

import React, { useState, useEffect, useCallback } from 'react';
import { User, Group, Message, MessageType, QuestionType, QuestionOption, AppMode, TestConfig, TestQuestion, UserAnswerRecord, TestSessionData, StudySessionData, TestResult, MatchingItem, OfflineSessionBundle, OfflineQuestion, UserQuestionStats, DiagramLabel, Badge, UserStats, TestPreset, GameSession, TextbookListing, StudyGroupListing, TutorListing, LostAndFoundItem, PeerReviewServiceListing, ThesisSupportListing, ClubProfile, EventTicketListing, MerchandiseItem, CampusHustleListing, RentalListing, RideShareListing, BikeScooterListing, SubletListing, RoommateListing, FoodListing, SecondHandGood, PastQuestionListing, LectureNoteListing, ProjectMaterialListing, DataCollectionGig, AsoEbiListing } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import QuestionModal from './components/QuestionModal';
import CreateGroupModal from './components/CreateGroupModal';
import GroupInfoModal from './components/GroupInfoModal';
import TestConfigModal from './components/TestConfigModal';
import { TestTakingScreen } from './components/TestTakingScreen';
import TestReviewScreen from './components/TestReviewScreen';
import DashboardScreen from './components/DashboardScreen'; 
import OfflineModeScreen from './components/OfflineModeScreen';
import { MarketplaceScreen } from './components/MarketplaceScreen';
import AuthScreen from './components/AuthScreen';
import SettingsModal from './components/SettingsModal';
import { GameScreen } from './components/GameScreen';
import GameResultScreen from './components/GameResultScreen';
import DuplicateQuestionModal from './components/DuplicateQuestionModal';
import AiCompanionScreen from './components/AiCompanionScreen';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';
import { AcademicCapIcon, ExclamationTriangleIcon, ArrowPathIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { BADGE_DEFINITIONS } from './gamification';


// --- MOCK DATA ---
const initialUserStats: UserStats = {
    testsCompleted: 0,
    questionsCreated: 0,
    groupsCreated: 0,
    highScoreTests: 0,
    perfectScoreTests: 0,
    gamesWon: 0,
};

// Represents all users who have "registered".
const MOCK_ALL_USERS: User[] = [
  { 
    id: 'user1', 
    name: 'Demo User', 
    email: 'user@example.com', 
    password: 'password123', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=random&color=fff&size=100', 
    phoneNumber: '08012345678',
    points: 85,
    badges: [
      { id: 'GROUP_FOUNDER', level: 1, name: 'Group Founder I', description: 'Created 1 study group.', icon: '🚀', dateAwarded: new Date().toISOString() },
      { id: 'TEST_TAKER', level: 1, name: 'Test Taker I', description: 'Completed 1 test.', icon: '📝', dateAwarded: new Date().toISOString() },
       { id: 'HIGH_SCORER', level: 1, name: 'High Scorer I', description: 'Scored 80% or higher on 1 test.', icon: '🎯', dateAwarded: new Date().toISOString() }
    ],
    stats: {
        testsCompleted: 1,
        questionsCreated: 5,
        groupsCreated: 1,
        highScoreTests: 1,
        perfectScoreTests: 0,
        gamesWon: 0,
    },
    settings: { reminders: { enabled: true, lastReminderTimestamp: Date.now() - (25*60*60*1000) } }, // has been more than 24h
    testPresets: [
        { id: 'preset1', name: 'Quick 10 MCQs', config: { numberOfQuestions: 10, allowedQuestionTypes: [QuestionType.MULTIPLE_CHOICE_SINGLE], selectedTags: [] } },
        { id: 'preset2', name: 'Full Review (15 min)', config: { numberOfQuestions: 20, allowedQuestionTypes: Object.values(QuestionType).filter(qt => qt !== QuestionType.OPEN_ENDED), selectedTags: [], timerDuration: 15 * 60 } }
    ],
  },
  { 
    id: 'user2', 
    name: 'Alice Wonderland', 
    email: 'alice@example.com', 
    password: 'password123', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Wonderland&background=random&color=fff&size=100', 
    phoneNumber: '08023456789',
    points: 0,
    badges: [],
    stats: { ...initialUserStats },
    settings: { reminders: { enabled: true } },
    testPresets: [],
  },
  { 
    id: 'user3', 
    name: 'Bob The Builder', 
    email: 'bob@example.com', 
    password: 'password123', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Builder&background=random&color=fff&size=100', 
    phoneNumber: '08034567890',
    points: 0,
    badges: [],
    stats: { ...initialUserStats },
    settings: { reminders: { enabled: false } },
    testPresets: [],
  },
];

const MOCK_GROUPS_INITIAL: Group[] = [
  { 
    id: 'group1', 
    name: 'BIO101 Study Group', 
    avatarUrl: 'https://ui-avatars.com/api/?name=BIO101&background=random&color=fff&size=200', 
    members: [MOCK_ALL_USERS[0], MOCK_ALL_USERS[1], MOCK_ALL_USERS[2]],
    memberEmails: ['alice@example.com', 'user@example.com', 'bob@example.com'],
    adminIds: [MOCK_ALL_USERS[0].id],
    description: "Discussion and Q&A for Biology 101.",
    lastMessage: "Let's review mitosis.",
    lastMessageTime: "10:30 AM",
    isArchived: false,
    inviteId: uuidv4(),
    pendingMembers: [],
  },
  { 
    id: 'group2', 
    name: 'MCAT Prep Squad', 
    avatarUrl: 'https://ui-avatars.com/api/?name=MCAT+Prep&background=random&color=fff&size=200', 
    members: MOCK_ALL_USERS,
    memberEmails: ['alice@example.com', 'bob@example.com', 'user@example.com'],
    adminIds: [MOCK_ALL_USERS[0].id],
    description: "Preparing for the MCAT exam together.",
    lastMessage: "New practice question posted!",
    lastMessageTime: "Yesterday",
    isArchived: false,
    inviteId: uuidv4(),
    pendingMembers: [],
  },
  { 
    id: 'group3', 
    name: 'Physics Club', 
    avatarUrl: 'https://ui-avatars.com/api/?name=Physics+Club&background=random&color=fff&size=200', 
    members: [MOCK_ALL_USERS[0], MOCK_ALL_USERS[2]],
    memberEmails: ['bob@example.com', 'user@example.com'],
    adminIds: [MOCK_ALL_USERS[0].id],
    description: "Exploring the wonders of physics.",
    lastMessage: "Anyone understand quantum entanglement?",
    lastMessageTime: "Mon",
    isArchived: true,
    inviteId: uuidv4(),
    pendingMembers: [],
  },
];

const MOCK_MESSAGES_INITIAL: Record<string, Message[]> = {
  group1: [
    { id: 'msg1-1', groupId: 'group1', sender: MOCK_ALL_USERS[1], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), type: MessageType.TEXT, text: "Hey everyone! Ready for tomorrow's class?", upvotes: 0, downvotes: 0 },
    { id: 'msg1-2', groupId: 'group1', sender: MOCK_ALL_USERS[0], timestamp: new Date(Date.now() - 1000 * 60 * 50), type: MessageType.TEXT, text: "Yep, just reviewing chapter 3.", upvotes: 0, downvotes: 0 },
    { id: 'msg1-3', groupId: 'group1', sender: MOCK_ALL_USERS[1], timestamp: new Date(Date.now() - 1000 * 60 * 30), type: MessageType.QUESTION, questionType: QuestionType.OPEN_ENDED, questionStem: "What are the main phases of mitosis?", explanation: "Prophase, Metaphase, Anaphase, Telophase. Each phase has distinct chromosomal events.", upvotes: 5, downvotes: 1, tags: ["cell biology", "mitosis"] },
    { id: 'msg1-4', groupId: 'group1', sender: MOCK_ALL_USERS[0], timestamp: new Date(Date.now() - 1000 * 60 * 25), type: MessageType.QUESTION, questionType: QuestionType.MULTIPLE_CHOICE_SINGLE, questionStem: "Which organelle is known as the powerhouse of the cell?", options: [{id: 'opt1', text: 'Nucleus'}, {id: 'opt2', text: 'Mitochondria'}, {id: 'opt3', text: 'Ribosome'}], correctAnswerIds: ['opt2'], explanation: "Mitochondria are responsible for generating most of the cell's supply of ATP through cellular respiration.", upvotes: 10, downvotes: 0, imageUrl: 'https://picsum.photos/seed/mito/300/200', tags: ["organelles", "ATP"] },
     { id: 'msg1-5', groupId: 'group1', sender: MOCK_ALL_USERS[2], timestamp: new Date(Date.now() - 1000 * 60 * 20), type: MessageType.QUESTION, questionType: QuestionType.FILL_IN_THE_BLANK, questionStem: "The capital of France is ___.", acceptableAnswers: ["Paris"], explanation: "Paris is the capital and most populous city of France.", upvotes: 12, downvotes: 0, tags: ["geography", "europe"] },
  ],
  group2: [
    { id: 'msg2-1', groupId: 'group2', sender: MOCK_ALL_USERS[2], timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), type: MessageType.TEXT, text: "Found a great resource for organic chemistry review.", upvotes: 0, downvotes: 0 },
    { id: 'msg2-2', groupId: 'group2', sender: MOCK_ALL_USERS[0], timestamp: new Date(Date.now() - 1000 * 60 * 15), type: MessageType.QUESTION, questionType: QuestionType.MULTIPLE_CHOICE_SINGLE, questionStem: "What is the general formula for an alkane?", options: [{id: 'optA', text: 'CnH2n'}, {id: 'optB', text: 'CnH2n+2'}, {id: 'optC', text: 'CnH2n-2'}], correctAnswerIds: ['optB'], explanation: "Alkanes are saturated hydrocarbons with the general formula CnH2n+2.", upvotes: 7, downvotes: 0, tags: ["organic chemistry", "alkanes"] },
    { id: 'msg2-3', groupId: 'group2', sender: MOCK_ALL_USERS[1], timestamp: new Date(Date.now() - 1000 * 60 * 10), type: MessageType.QUESTION, questionType: QuestionType.MULTIPLE_CHOICE_MULTIPLE, questionStem: "Which of the following are noble gases?", options: [{id: 'optD', text: 'Helium'}, {id: 'optE', text: 'Nitrogen'}, {id: 'optF', text: 'Neon'}, {id: 'optG', text: 'Oxygen'}], correctAnswerIds: ['optD', 'optF'], explanation: "Helium (He) and Neon (Ne) are both in Group 18 of the periodic table, known as the noble gases. They are characterized by their full valence electron shells, making them very stable and non-reactive.", upvotes: 8, downvotes: 0, tags: ["chemistry", "periodic table"] },
  ],
  group3: [],
};

const MAX_GROUP_MEMBERS = 200;

const TESTABLE_QUESTION_TYPES: QuestionType[] = [
  QuestionType.MULTIPLE_CHOICE_SINGLE,
  QuestionType.MULTIPLE_CHOICE_MULTIPLE,
  QuestionType.TRUE_FALSE,
  QuestionType.FILL_IN_THE_BLANK,
  QuestionType.MATCHING,
  QuestionType.DIAGRAM_LABELING,
];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};


export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
        const savedUsers = localStorage.getItem('studyCollabUsers');
        if (savedUsers) {
            return JSON.parse(savedUsers).map((u: User) => ({
                ...u,
                stats: u.stats || { ...initialUserStats },
                settings: u.settings || { reminders: { enabled: true } },
                testPresets: u.testPresets || [],
            }));
        }
    } catch (e) { console.error("Error loading users", e); }
    return MOCK_ALL_USERS.map(u => ({
        ...u,
        settings: u.settings || { reminders: { enabled: true } },
        testPresets: u.testPresets || []
    }));
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      const savedGroups = localStorage.getItem('studyCollabGroups');
      if (savedGroups) {
        return JSON.parse(savedGroups).map((g: Group) => ({
          ...g,
          adminIds: g.adminIds || [g.members[0]?.id].filter(Boolean), 
          parentId: g.parentId || undefined,
          isArchived: g.isArchived || false,
          inviteId: g.inviteId || uuidv4(),
          pendingMembers: g.pendingMembers || [],
        }));
      }
    } catch (error) {
      console.error("Failed to load groups from localStorage:", error);
    }
    return MOCK_GROUPS_INITIAL;
  });

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
        const savedMessages = localStorage.getItem('studyCollabMessages');
        if (savedMessages) {
            const parsed = JSON.parse(savedMessages);
            Object.keys(parsed).forEach(key => {
                parsed[key] = parsed[key].map((msg: Message) => ({...msg, timestamp: new Date(msg.timestamp)}));
            });
            return parsed;
        }
    } catch (e) { console.error("Error loading messages", e); }
    return MOCK_MESSAGES_INITIAL;
  });
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [duplicateQuestionInfo, setDuplicateQuestionInfo] = useState<{ newQuestionData: Omit<Message, 'id' | 'timestamp' | 'sender' | 'upvotes' | 'downvotes'>, existingQuestion: Message } | null>(null);
  
  const [createGroupModalConfig, setCreateGroupModalConfig] = useState<{ isOpen: boolean; parentId?: string }>({ isOpen: false });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [appMode, setAppMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isTestConfigModal, setIsTestConfigModal] = useState(false);
  const [configTargetMode, setConfigTargetMode] = useState<AppMode.TEST_CONFIG | AppMode.STUDY_CONFIG | 'game' | null>(null);
  
  const [currentTestConfig, setCurrentTestConfig] = useState<TestConfig | null>(null);
  const [currentTestSession, setCurrentTestSession] = useState<TestSessionData | null>(null);
  const [currentGameSession, setCurrentGameSession] = useState<GameSession | null>(null);
  const [challengeOpponent, setChallengeOpponent] = useState<User | null>(null);
  
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    try {
      const savedResults = localStorage.getItem('studyCollabTestResults');
      if (savedResults) {
        const parsedResults: any[] = JSON.parse(savedResults);
        return parsedResults.map((result: any): TestResult => ({
          ...result,
          session: {
            ...result.session,
            startTime: new Date(result.session.startTime),
            endTime: result.session.endTime ? new Date(result.session.endTime) : undefined,
            questions: result.session.questions.map((q: any) => ({
                ...q,
                timestamp: new Date(q.timestamp),
            })),
            userAnswers: result.session.userAnswers, 
            config: { 
                ...result.session.config,
                selectedTags: result.session.config.selectedTags || [], 
            },
            isOffline: result.session.isOffline || false,
          }
        }));
      }
    } catch (error) {
      console.error("Failed to load test results from localStorage:", error);
    }
    return [];
  });

  const [currentStudyConfig, setCurrentStudyConfig] = useState<TestConfig | null>(null); 
  const [currentStudySession, setCurrentStudySession] = useState<StudySessionData | null>(null);

  const [userQuestionStats, setUserQuestionStats] = useState<UserQuestionStats>({});

  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | undefined>>({});

  const [offlineBundles, setOfflineBundles] = useState<OfflineSessionBundle[]>(() => {
    try {
      const savedBundles = localStorage.getItem('studyCollabOfflineBundles');
      return savedBundles ? JSON.parse(savedBundles).map((b: OfflineSessionBundle) => ({
        ...b,
        downloadedAt: new Date(b.downloadedAt),
        questions: b.questions.map((q: OfflineQuestion) => ({
          ...q,
          timestamp: new Date(q.timestamp),
        }))
      })) : [];
    } catch (e) { console.error("Error loading offline bundles:", e); return []; }
  });

  const [pendingSyncResults, setPendingSyncResults] = useState<TestResult[]>(() => {
    try {
      const savedPending = localStorage.getItem('studyCollabPendingSyncResults');
      if (savedPending) {
         const parsedPending: any[] = JSON.parse(savedPending);
         return parsedPending.map((result: any): TestResult => ({
            ...result,
            session: {
                ...result.session,
                startTime: new Date(result.session.startTime),
                endTime: result.session.endTime ? new Date(result.session.endTime) : undefined,
                questions: result.session.questions.map((q: any) => ({
                    ...q,
                    timestamp: new Date(q.timestamp),
                })),
                config: {
                    ...result.session.config,
                    selectedTags: result.session.config.selectedTags || [],
                },
                isOffline: true, 
            }
         }));
      }
      return [];
    } catch (e) { console.error("Error loading pending sync results:", e); return []; }
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasNewQuestionNotification, setHasNewQuestionNotification] = useState<boolean>(() => {
    try {
      const savedNotificationState = localStorage.getItem('studyCollabNewQuestionNotification');
      return savedNotificationState === 'true';
    } catch (error) {
      console.error("Failed to load notification state from localStorage:", error);
      return false;
    }
  });


  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('studyCollabTheme') as 'light' | 'dark' | null;
    if (storedTheme) {
      return storedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [toast, setToast] = useState<{message: string, icon: string, action?: { label: string, onClick: () => void } } | null>(null);

  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 5000); // Increased toast time for actions
        return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    try { localStorage.setItem('studyCollabUsers', JSON.stringify(allUsers)); }
    catch (e) { console.error("Error saving users:", e); }
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
        try {
            const savedStats = localStorage.getItem(`studyCollabUserStats_${currentUser.id}`);
            setUserQuestionStats(savedStats ? JSON.parse(savedStats) : {});
        } catch (e) {
            console.error("Error loading user question stats:", e);
            setUserQuestionStats({});
        }
    } else {
        setUserQuestionStats({});
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && Object.keys(userQuestionStats).length > 0) {
        try {
            localStorage.setItem(`studyCollabUserStats_${currentUser.id}`, JSON.stringify(userQuestionStats));
        } catch (e) {
            console.error("Error saving user question stats:", e);
        }
    }
  }, [userQuestionStats, currentUser]);

  useEffect(() => {
    if (currentUser) {
        try {
            const savedVotes = localStorage.getItem(`studyCollabUserVotes_${currentUser.id}`);
            setUserVotes(savedVotes ? JSON.parse(savedVotes) : {});
        } catch (e) {
            console.error("Error loading user votes:", e);
            setUserVotes({});
        }
    } else {
        setUserVotes({});
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
        try {
            localStorage.setItem(`studyCollabUserVotes_${currentUser.id}`, JSON.stringify(userVotes));
        } catch (e) {
            console.error("Error saving user votes:", e);
        }
    }
  }, [userVotes, currentUser]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('studyCollabTheme', theme);
    } catch (error) {
        console.error("Failed to save theme to localStorage:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('studyCollabOfflineBundles', JSON.stringify(offlineBundles)); }
    catch (e) { console.error("Error saving offline bundles:", e); }
  }, [offlineBundles]);
  
  useEffect(() => {
    try { localStorage.setItem('studyCollabPendingSyncResults', JSON.stringify(pendingSyncResults)); }
    catch (e) { console.error("Error saving pending sync results:", e); }
  }, [pendingSyncResults]);

  useEffect(() => {
    try {
      localStorage.setItem('studyCollabTestResults', JSON.stringify(testResults));
    } catch (error) {
      console.error("Failed to save test results from localStorage:", error);
    }
  }, [testResults]);
  
  useEffect(() => {
    try {
        localStorage.setItem('studyCollabGroups', JSON.stringify(groups));
    } catch (error) {
        console.error("Failed to save groups to localStorage:", error);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem('studyCollabNewQuestionNotification', String(hasNewQuestionNotification));
    } catch (error) {
      console.error("Failed to save notification state from localStorage:", error);
    }
  }, [hasNewQuestionNotification]);


  useEffect(() => {
    if (currentUser && appMode === AppMode.CHAT && groups.length > 0 && !selectedGroup) {
      const firstTopLevelGroup = groups.find(g => !g.parentId && !g.isArchived);
      if (firstTopLevelGroup) {
        setSelectedGroup(firstTopLevelGroup);
      } else if (groups.length > 0 && !groups.some(g => !g.parentId && !g.isArchived)) {
          const firstArchivedOrSub = groups.find(g => !g.parentId) || groups[0];
          if(firstArchivedOrSub) setSelectedGroup(firstArchivedOrSub);
      }
    }
  }, [currentUser, appMode, groups, selectedGroup]);
  
  useEffect(() => {
    if (currentUser) {
        const reminderSettings = currentUser.settings?.reminders || { enabled: true };
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (reminderSettings.enabled && (now - (reminderSettings.lastReminderTimestamp || 0) > oneDay)) {
            const mostActiveGroup = groups.find(g => !g.isArchived && !g.parentId) || groups[0];
            if (mostActiveGroup) {
                 setToast({
                    message: `Time for a quiz? Sharpen your skills in ${mostActiveGroup.name}!`,
                    icon: '🧠',
                    action: {
                        label: 'Start Test',
                        onClick: () => {
                            setSelectedGroup(mostActiveGroup);
                            handleOpenTestConfigModal();
                        }
                    }
                });
                
                const updatedUser = {
                    ...currentUser,
                    settings: {
                        ...currentUser.settings,
                        reminders: {
                            ...reminderSettings,
                            lastReminderTimestamp: now
                        }
                    }
                };
                setCurrentUser(updatedUser);
                setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }
        }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const urlParams = new URLSearchParams(window.location.search);
    const inviteId = urlParams.get('inviteId');

    if (inviteId) {
        const groupToJoin = groups.find(g => g.inviteId === inviteId);
        if (groupToJoin) {
            if (groupToJoin.members.length >= MAX_GROUP_MEMBERS) {
                setToast({ message: `Cannot join "${groupToJoin.name}". The group is full (${MAX_GROUP_MEMBERS} members).`, icon: '🚫' });
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            const isAlreadyMember = groupToJoin.members.some(m => m.id === currentUser.id);
            const isAlreadyPending = groupToJoin.pendingMembers?.some(m => m.id === currentUser.id);

            if (!isAlreadyMember && !isAlreadyPending) {
                const updatedGroup = {
                    ...groupToJoin,
                    pendingMembers: [...(groupToJoin.pendingMembers || []), currentUser],
                };
                setGroups(prevGroups => prevGroups.map(g => g.id === groupToJoin.id ? updatedGroup : g));
                setToast({ message: `Your request to join "${groupToJoin.name}" has been sent for admin approval.`, icon: '✉️' });
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                 setToast({ message: `You are already a member or have a pending request for "${groupToJoin.name}".`, icon: '👍' });
                 window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
             setToast({ message: `Invalid invite link.`, icon: '❌' });
             window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [currentUser, groups]);

  // --- Gamification Logic ---
  const updateStatsAndCheckBadges = (userId: string, statsToUpdate: Partial<UserStats>) => {
      let totalPointsAwarded = 0;
      let lastAwardedBadgeInfo: { name: string; icon: string; } | null = null;
  
      const userUpdater = (u: User): User => {
          if (u.id !== userId) return u;
  
          // 1. Create a copy of the user to modify, ensuring badges is also copied.
          let userToUpdate = { ...u, stats: { ...u.stats }, badges: [...u.badges] };
  
          // 2. Increment all specified stats
          for (const key in statsToUpdate) {
              const metric = key as keyof UserStats;
              userToUpdate.stats[metric] = (userToUpdate.stats[metric] || 0) + (statsToUpdate[metric] || 0);
          }
  
          // 3. Check all relevant badges against the new stats
          const relevantMetrics = Object.keys(statsToUpdate) as (keyof UserStats)[];
          const badgeDefsToCheck = Object.values(BADGE_DEFINITIONS).filter(def => relevantMetrics.includes(def.metric as keyof UserStats));
          
          for (const badgeDef of badgeDefsToCheck) {
              // eslint-disable-next-line no-constant-condition
              while (true) {
                const currentBadgeLevel = userToUpdate.badges
                    .filter(b => b.id === badgeDef.id)
                    .reduce((max, b) => Math.max(max, b.level), 0);
                
                const nextLevel = badgeDef.levels.find(l => l.level === currentBadgeLevel + 1);
    
                if (nextLevel && userToUpdate.stats[badgeDef.metric as keyof UserStats] >= nextLevel.threshold) {
                    const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
                    const newBadge: Badge = {
                        id: badgeDef.id,
                        level: nextLevel.level,
                        name: `${badgeDef.baseName} ${romanNumerals[nextLevel.level - 1] || nextLevel.level}`,
                        description: badgeDef.baseDescription(nextLevel.threshold),
                        icon: badgeDef.icon,
                        dateAwarded: new Date().toISOString(),
                    };
                    
                    userToUpdate.points += nextLevel.points;
                    userToUpdate.badges.push(newBadge);
                    
                    totalPointsAwarded += nextLevel.points;
                    lastAwardedBadgeInfo = { name: newBadge.name, icon: newBadge.icon };
                } else {
                    break;
                }
              }
          }
          return userToUpdate;
      };
  
      setAllUsers(prev => prev.map(userUpdater));
      setCurrentUser(prev => prev ? userUpdater(prev) : null);
  
      if (lastAwardedBadgeInfo) {
          setToast({ message: `+${totalPointsAwarded} points & Badge Unlocked: ${lastAwardedBadgeInfo.name}`, icon: lastAwardedBadgeInfo.icon });
      }
  };
  
  const checkAndAwardUpvoteBadge = (userId: string, upvoteCount: number) => {
      const badgeDef = BADGE_DEFINITIONS.RISING_STAR;
      let totalPointsAwarded = 0;
      let lastAwardedBadgeInfo: { name: string; icon: string; } | null = null;
  
      const userUpdater = (u: User): User => {
          if (u.id !== userId) return u;
  
          let userToUpdate = { ...u, badges: [...u.badges] };
  
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const currentBadgeLevel = userToUpdate.badges
                .filter(b => b.id === badgeDef.id)
                .reduce((max, b) => Math.max(max, b.level), 0);
            
            const nextLevel = badgeDef.levels.find(l => l.level === currentBadgeLevel + 1);
            
            if (nextLevel && upvoteCount >= nextLevel.threshold) {
                const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];
                const newBadge: Badge = {
                    id: badgeDef.id,
                    level: nextLevel.level,
                    name: `${badgeDef.baseName} ${romanNumerals[nextLevel.level - 1] || nextLevel.level}`,
                    description: badgeDef.baseDescription(nextLevel.threshold),
                    icon: badgeDef.icon,
                    dateAwarded: new Date().toISOString(),
                };
                
                userToUpdate.points += nextLevel.points;
                userToUpdate.badges.push(newBadge);
                
                totalPointsAwarded += nextLevel.points;
                lastAwardedBadgeInfo = { name: newBadge.name, icon: newBadge.icon };
            } else {
                break;
            }
          }
          return userToUpdate;
      };
  
      setAllUsers(prev => prev.map(userUpdater));
      setCurrentUser(prev => prev ? userUpdater(prev) : null);
  
      if (lastAwardedBadgeInfo) {
          setToast({ message: `+${totalPointsAwarded} points & Badge Unlocked: ${lastAwardedBadgeInfo.name}`, icon: lastAwardedBadgeInfo.icon });
      }
  };

  // --- Settings and Presets Handlers ---
    const handleUpdateSettings = (newSettings: User['settings']) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, settings: newSettings };
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };
  
    const handleSaveTestPreset = (name: string, config: Omit<TestConfig, 'questionIds' | 'groupId'>) => {
        if (!currentUser) return;
        const newPreset: TestPreset = { id: uuidv4(), name, config };
        const updatedPresets = [...(currentUser.testPresets || []), newPreset];
        const updatedUser = { ...currentUser, testPresets: updatedPresets };
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        setToast({ message: `Preset "${name}" saved!`, icon: '💾' });
    };
  
    const handleDeleteTestPreset = (presetId: string) => {
        if (!currentUser) return;
        const updatedPresets = (currentUser.testPresets || []).filter(p => p.id !== presetId);
        const updatedUser = { ...currentUser, testPresets: updatedPresets };
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

  // --- Authentication Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (groups.length > 0) {
      const firstActiveGroup = groups.find(g => !g.isArchived) || groups[0];
      setSelectedGroup(firstActiveGroup);
      setAppMode(AppMode.CHAT);
    } else {
      setAppMode(AppMode.DASHBOARD);
    }
  };

  const handleRegister = (name: string, email: string, password: string, phoneNumber: string) => {
    const newUser: User = {
      id: `user-${uuidv4()}`,
      name,
      email,
      password,
      phoneNumber,
      avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=random&color=fff&size=100`,
      points: 0,
      badges: [],
      stats: { ...initialUserStats },
      settings: { reminders: { enabled: true } },
      testPresets: [],
    };
    setAllUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setAppMode(AppMode.DASHBOARD);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // --- Group and Chat Handlers ---
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setAppMode(AppMode.CHAT);
  };

  const handleSendMessage = (text: string) => {
    if (!currentUser || !selectedGroup) return;
    const newMessage: Message = {
      id: uuidv4(),
      groupId: selectedGroup.id,
      sender: currentUser,
      timestamp: new Date(),
      type: MessageType.TEXT,
      text,
      upvotes: 0,
      downvotes: 0,
    };
    setMessages(prev => ({
      ...prev,
      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage],
    }));
  };
  
  // --- Test & Study Session Logic ---
    const isAnswerCorrect = (question: TestQuestion, answer?: UserAnswerRecord): boolean => {
    if (!answer) return false;

    switch (question.questionType) {
        case QuestionType.MULTIPLE_CHOICE_SINGLE:
        case QuestionType.TRUE_FALSE: {
            if (!answer.selectedOptionIds || answer.selectedOptionIds.length !== 1) return false;
            return question.correctAnswerIds?.includes(answer.selectedOptionIds[0]) || false;
        }

        case QuestionType.MULTIPLE_CHOICE_MULTIPLE: {
            if (!answer.selectedOptionIds || !question.correctAnswerIds) return false;
            const userAnswerSet = new Set(answer.selectedOptionIds);
            const correctAnswerSet = new Set(question.correctAnswerIds);
            if (userAnswerSet.size !== correctAnswerSet.size) return false;
            for (const id of userAnswerSet) {
                if (!correctAnswerSet.has(id)) return false;
            }
            return true;
        }

        case QuestionType.FILL_IN_THE_BLANK: {
            if (!answer.fillText || !question.acceptableAnswers) return false;
            const userAnswer = answer.fillText.trim().toLowerCase();
            return question.acceptableAnswers.some(correct => correct.trim().toLowerCase() === userAnswer);
        }
        
        case QuestionType.MATCHING: {
            if (!answer.matchingAnswers || !question.correctMatches) return false;
            if (answer.matchingAnswers.length !== question.correctMatches.length) return false;

            const correctMatchesSet = new Set(question.correctMatches.map(m => `${m.promptItemId}-${m.answerItemId}`).sort());
            const userMatchesSet = new Set(answer.matchingAnswers.map(m => `${m.promptItemId}-${m.answerItemId}`).sort());
            
            if (correctMatchesSet.size !== userMatchesSet.size) return false;
            
            const correctArr = Array.from(correctMatchesSet);
            const userArr = Array.from(userMatchesSet);

            for(let i = 0; i < correctArr.length; i++){
                if(correctArr[i] !== userArr[i]) return false;
            }
            return true;
        }

        case QuestionType.DIAGRAM_LABELING: {
            if (!answer.diagramAnswers || !question.diagramLabels) return false;
            if (answer.diagramAnswers.length !== question.diagramLabels.length) return false;

            for(const userAnswer of answer.diagramAnswers) {
                if(userAnswer.labelId !== userAnswer.selectedLabelId) {
                    return false;
                }
            }
            return true;
        }

        default:
            return false;
    }
  };

  const calculateTestResults = (session: TestSessionData): TestResult => {
    let correctAnswersCount = 0;
    const updatedUserAnswers = { ...session.userAnswers };

    session.questions.forEach(question => {
        const answer = updatedUserAnswers[question.id];
        const correct = isAnswerCorrect(question, answer);
        
        if (answer) {
            updatedUserAnswers[question.id] = { ...answer, isCorrect: correct };
        } else {
            updatedUserAnswers[question.id] = { questionId: question.id, isCorrect: false };
        }
        
        if (correct) {
            correctAnswersCount++;
        }
    });

    const totalQuestions = session.questions.length;
    const score = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    
    const updatedSession = {
        ...session,
        userAnswers: updatedUserAnswers
    };

    return {
        session: updatedSession,
        score,
        totalQuestions,
        correctAnswersCount,
    };
  };

  const updateUserStatsFromSession = (session: TestSessionData | StudySessionData) => {
    if (!currentUser) return;

    setUserQuestionStats(prevStats => {
      const newStats = { ...prevStats };
      Object.values(session.userAnswers).forEach(answer => {
        const questionId = answer.questionId;
        const stat = newStats[questionId] || { correctAttempts: 0, incorrectAttempts: 0, lastAttempted: '' };
        
        if (answer.isCorrect) {
          stat.correctAttempts++;
        } else {
          stat.incorrectAttempts++;
        }
        stat.lastAttempted = new Date().toISOString();
        newStats[questionId] = stat;
      });
      return newStats;
    });
  };

  const handleRetakeTest = (config: TestConfig) => {
    startTestOrStudySession(
      {
        numberOfQuestions: config.numberOfQuestions,
        allowedQuestionTypes: config.allowedQuestionTypes,
        selectedTags: config.selectedTags,
        timerDuration: config.timerDuration,
      },
      'test',
      false, // useSpacedRepetition
      { groupId: config.groupId, selectedSubgroupIDs: [] } // Cannot retake with subgroups automatically, user must re-select
    );
  };

  const handlePracticeFailedQuestions = (failedQuestions: TestQuestion[]) => {
    if (failedQuestions.length === 0) return;
    const firstQuestion = failedQuestions[0];
    const config: Omit<TestConfig, 'questionIds' | 'groupId'> = {
      numberOfQuestions: failedQuestions.length,
      allowedQuestionTypes: [...new Set(failedQuestions.map(q => q.questionType!))],
      selectedTags: [],
      timerDuration: undefined,
    };
    startTestOrStudySession(config, 'study', false, {
      customQuestions: failedQuestions,
      groupId: firstQuestion.groupId,
    });
  };

  const handleStartFromModal = (
    config: Omit<TestConfig, 'questionIds' | 'groupId'>,
    mode: 'test' | 'study' | 'game',
    useSpacedRepetition: boolean,
    selectedSubgroupIDs: string[]
  ) => {
      if(mode === 'game') {
          handleStartGame(config);
      } else {
        startTestOrStudySession(config, mode, useSpacedRepetition, { selectedSubgroupIDs });
      }
  };
  
  const getSubgroupIDsRecursive = (parentId: string, allGroups: Group[]): string[] => {
    const subgroupIds: string[] = [];
    const directSubgroups = allGroups.filter(g => g.parentId === parentId);

    for (const subgroup of directSubgroups) {
        subgroupIds.push(subgroup.id);
        subgroupIds.push(...getSubgroupIDsRecursive(subgroup.id, allGroups));
    }
    return subgroupIds;
  };

  const startTestOrStudySession = (
    config: Omit<TestConfig, 'questionIds' | 'groupId'>, 
    mode: 'test' | 'study', 
    useSpacedRepetition: boolean,
    options?: { customQuestions?: Message[], groupId?: string, selectedSubgroupIDs?: string[] }
  ) => {
    const targetGroupId = options?.groupId || selectedGroup?.id;
    if (!targetGroupId) {
        console.error("No group selected or provided for starting session.");
        alert("Could not determine the group for this session. Please select a group first.");
        return;
    }
    
    let candidateQuestions: Message[];

    if (options?.customQuestions) {
        candidateQuestions = options.customQuestions;
    } else {
        const groupIdsToInclude = [targetGroupId];
        if (options?.selectedSubgroupIDs && options.selectedSubgroupIDs.length > 0 && !useSpacedRepetition) {
            groupIdsToInclude.push(...options.selectedSubgroupIDs);
        }

        const allGroupMessages = [...new Set(groupIdsToInclude)].flatMap(id => messages[id] || []);
        
        if (useSpacedRepetition && currentUser) {
            const testableQuestions = allGroupMessages.filter(msg => msg.type === MessageType.QUESTION && TESTABLE_QUESTION_TYPES.includes(msg.questionType!));
            candidateQuestions = testableQuestions.filter(q => {
                const stats = userQuestionStats[q.id];
                return stats && (stats.incorrectAttempts > stats.correctAttempts);
            });
        } else {
            candidateQuestions = allGroupMessages.filter(msg => {
                if (msg.isArchived) return false;
                if (msg.type !== MessageType.QUESTION || !msg.questionType) return false;
                if (!config.allowedQuestionTypes.includes(msg.questionType)) return false;
                
                // New voting strategy
                const questionGroup = groups.find(g => g.id === msg.groupId);
                if (!questionGroup) return false; // Question must belong to a valid group.
                
                const memberCount = questionGroup.members.length;
                if (memberCount === 0) return false; // Cannot be a valid question if group has no members.
                
                const totalVotes = (msg.upvotes || 0) + (msg.downvotes || 0);
                const hasEnoughVotes = (totalVotes / memberCount) > 0.20;
                const isApproved = (msg.upvotes || 0) > (msg.downvotes || 0);

                if (!hasEnoughVotes || !isApproved) return false;

                if (config.selectedTags && config.selectedTags.length > 0) {
                    if (!msg.tags || !config.selectedTags.some(tag => msg.tags!.includes(tag))) {
                        return false;
                    }
                }

                switch(msg.questionType) {
                    case QuestionType.MULTIPLE_CHOICE_SINGLE:
                    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
                    case QuestionType.TRUE_FALSE:
                        return !!(msg.questionStem && msg.options && msg.options.length > 0 && msg.correctAnswerIds && msg.correctAnswerIds.length > 0);
                    case QuestionType.FILL_IN_THE_BLANK:
                        return !!(msg.questionStem?.includes('___') && msg.acceptableAnswers && msg.acceptableAnswers.length > 0);
                    case QuestionType.MATCHING:
                        return !!(msg.matchingPromptItems && msg.matchingPromptItems.length > 0 &&
                                msg.matchingAnswerItems && msg.matchingAnswerItems.length > 0 &&
                                msg.correctMatches && msg.correctMatches.length > 0 &&
                                msg.correctMatches.length === msg.matchingPromptItems.length);
                    case QuestionType.DIAGRAM_LABELING:
                        return !!(msg.imageUrl && msg.diagramLabels && msg.diagramLabels.length > 0);
                    default:
                        return false;
                }
            });
        }
    }

    let finalSelectedQuestions: Message[];

    // Special modes like Spaced Repetition or Custom Question sets bypass the "new first" logic.
    if (useSpacedRepetition || options?.customQuestions) {
        if (candidateQuestions.length < config.numberOfQuestions || config.numberOfQuestions === 0) {
            const modeName = useSpacedRepetition ? "Spaced Repetition" : "custom question";
            alert(`Not enough matching questions for this ${modeName} session. Found ${candidateQuestions.length}, need ${config.numberOfQuestions}.`);
            setIsTestConfigModal(false);
            return;
        }
        finalSelectedQuestions = shuffleArray(candidateQuestions).slice(0, config.numberOfQuestions);
    } else {
        // Normal mode: Prioritize new, unseen questions.
        const newQuestions: Message[] = [];
        const seenQuestions: Message[] = [];

        candidateQuestions.forEach(q => {
            if (currentUser && userQuestionStats[q.id]) {
                seenQuestions.push(q);
            } else {
                newQuestions.push(q);
            }
        });

        if (newQuestions.length + seenQuestions.length < config.numberOfQuestions || config.numberOfQuestions === 0) {
            alert(`Not enough matching questions available. Found ${newQuestions.length + seenQuestions.length} total (${newQuestions.length} new), need ${config.numberOfQuestions}. Please adjust criteria or add/upvote more questions.`);
            setIsTestConfigModal(false);
            return;
        }

        const shuffledNew = shuffleArray(newQuestions);
        const shuffledSeen = shuffleArray(seenQuestions);

        if (shuffledNew.length >= config.numberOfQuestions) {
            finalSelectedQuestions = shuffledNew.slice(0, config.numberOfQuestions);
        } else {
            const remainingNeeded = config.numberOfQuestions - shuffledNew.length;
            finalSelectedQuestions = [...shuffledNew, ...shuffledSeen.slice(0, remainingNeeded)];
        }
    }
    
    const testQuestions = finalSelectedQuestions.map((q, index) => ({
      ...(q as Message),
      questionNumber: index + 1,
    }));

    const finalConfig: TestConfig = {
      ...config,
      groupId: targetGroupId,
      questionIds: testQuestions.map(q => q.id),
    };

    const newSessionData: TestSessionData = {
      config: finalConfig,
      questions: testQuestions as TestQuestion[],
      userAnswers: {},
      currentQuestionIndex: 0,
      startTime: new Date(),
      isOffline: !isOnline,
    };
    
    setIsTestConfigModal(false);

    if (mode === 'test') {
        if (config.timerDuration && config.timerDuration > 0) {
            newSessionData.endTime = new Date(Date.now() + config.timerDuration * 1000);
        }
        setCurrentTestSession(newSessionData);
        setAppMode(AppMode.TEST_ACTIVE);
    } else {
        setCurrentStudySession(newSessionData as StudySessionData);
        setAppMode(AppMode.STUDY_ACTIVE);
    }
  };
  
  const handleUpdateAnswer = (questionId: string, answerData: Partial<Omit<UserAnswerRecord, 'questionId'>>) => {
    const updateSession = (session: TestSessionData | StudySessionData | null): TestSessionData | StudySessionData | null => {
      if (!session) return null;

      const existingAnswer = session.userAnswers[questionId] || { questionId };
      const updatedAnswer = { ...existingAnswer, ...answerData };
      
      const newSession = {
        ...session,
        userAnswers: {
          ...session.userAnswers,
          [questionId]: updatedAnswer,
        },
      };

      if (appMode === AppMode.STUDY_ACTIVE && (
          answerData.selectedOptionIds !== undefined || 
          answerData.fillText !== undefined ||
          answerData.matchingAnswers !== undefined ||
          answerData.diagramAnswers !== undefined)
      ) {
         const question = session.questions.find(q => q.id === questionId);
         if (question) {
            const isCorrect = isAnswerCorrect(question, updatedAnswer);
            newSession.userAnswers[questionId].isCorrect = isCorrect;
         }
      }
      return newSession;
    };

    if (appMode === AppMode.TEST_ACTIVE) {
      setCurrentTestSession(prev => updateSession(prev) as TestSessionData | null);
    } else if (appMode === AppMode.STUDY_ACTIVE) {
      setCurrentStudySession(prev => updateSession(prev) as StudySessionData | null);
    }
  };

  const handleChangeQuestion = (newIndex: number) => {
    const updateSessionIndex = (session: TestSessionData | StudySessionData | null): TestSessionData | StudySessionData | null => {
        if (!session) return null;
        if (newIndex >= 0 && newIndex < session.questions.length) {
            return {
                ...session,
                currentQuestionIndex: newIndex
            };
        }
        return session;
    };
    if (appMode === AppMode.TEST_ACTIVE) {
      setCurrentTestSession(prev => updateSessionIndex(prev) as TestSessionData | null);
    } else if (appMode === AppMode.STUDY_ACTIVE) {
      setCurrentStudySession(prev => updateSessionIndex(prev) as StudySessionData | null);
    }
  };

  const handleToggleBookmark = (questionId: string) => {
     const updateBookmark = (session: TestSessionData | StudySessionData | null): TestSessionData | StudySessionData | null => {
        if (!session) return null;
        const answer = session.userAnswers[questionId] || { questionId };
        const newSession = {
            ...session,
            userAnswers: {
                ...session.userAnswers,
                [questionId]: {
                    ...answer,
                    isBookmarked: !answer.isBookmarked,
                }
            }
        };
        return newSession;
     };

     if (appMode === AppMode.TEST_ACTIVE) {
      setCurrentTestSession(prev => updateBookmark(prev) as TestSessionData | null);
    } else if (appMode === AppMode.STUDY_ACTIVE) {
      setCurrentStudySession(prev => updateBookmark(prev) as StudySessionData | null);
    }
  };

  const handleSubmitTest = () => {
    if (!currentTestSession || !currentUser) return;

    const finalSessionState: TestSessionData = {
        ...currentTestSession,
        endTime: new Date(),
    };

    const results = calculateTestResults(finalSessionState);
    
    // Award points and badges
    const statsToUpdate: Partial<UserStats> = { testsCompleted: 1 };
    if (results.score >= 80) {
        statsToUpdate.highScoreTests = 1;
    }
    if (results.score === 100) {
        statsToUpdate.perfectScoreTests = 1;
    }
    updateStatsAndCheckBadges(currentUser.id, statsToUpdate);
    
    setCurrentTestSession(results.session);
    setTestResults(prev => [results, ...prev]);
    updateUserStatsFromSession(results.session);
    setAppMode(AppMode.TEST_REVIEW);
  };

  const handleSubmitOfflineTest = () => {
    if (!currentTestSession) return;

    const finalSessionState: TestSessionData = {
        ...currentTestSession,
        endTime: new Date(),
    };
    
    const results = calculateTestResults(finalSessionState);
    setCurrentTestSession(results.session);
    setPendingSyncResults(prev => [results, ...prev]);
    setAppMode(AppMode.TEST_REVIEW);
  };

  const handleEndStudySession = () => {
    if (!currentStudySession) return;
    updateUserStatsFromSession(currentStudySession);
    setCurrentStudySession(null);
    setAppMode(AppMode.CHAT);
  };
  
  const handleOpenTestConfigModal = () => { setConfigTargetMode(AppMode.TEST_CONFIG); setIsTestConfigModal(true); };
  const handleOpenStudyConfigModal = () => { setConfigTargetMode(AppMode.STUDY_CONFIG); setIsTestConfigModal(true); };
  
  // --- Game Mode Handlers ---
  const handleChallengeUser = (opponent: User) => {
    setChallengeOpponent(opponent);
    setConfigTargetMode('game');
    setIsTestConfigModal(true);
    setIsGroupInfoModalOpen(false);
  };

  const handleStartGame = (config: Omit<TestConfig, 'questionIds' | 'groupId'>) => {
    if (!currentUser || !challengeOpponent || !selectedGroup) return;

    // Reuse question fetching logic from `startTestOrStudySession` but simplified for games
    const allGroupMessages = messages[selectedGroup.id] || [];
    const candidateQuestions = allGroupMessages.filter(msg => {
      if (msg.isArchived) return false;
      if (msg.type !== MessageType.QUESTION || !msg.questionType) return false;
      if (!config.allowedQuestionTypes.includes(msg.questionType)) return false;
       if ((msg.upvotes || 0) <= (msg.downvotes || 0)) return false;
       return true; // Simplified validation for now
    });
    
    if (candidateQuestions.length < config.numberOfQuestions) {
      alert(`Not enough matching questions for a game. Found ${candidateQuestions.length}, need ${config.numberOfQuestions}.`);
      return;
    }

    const gameQuestions = shuffleArray(candidateQuestions)
      .slice(0, config.numberOfQuestions)
      .map((q, i) => ({ ...q, questionNumber: i + 1 }));

    const newGame: GameSession = {
      id: uuidv4(),
      user: currentUser,
      opponent: challengeOpponent,
      questions: gameQuestions as TestQuestion[],
      userAnswers: {},
      opponentAnswers: {},
      userScore: 0,
      opponentScore: 0,
      userTime: 0,
      opponentTime: 0,
      isComplete: false,
    };
    
    setCurrentGameSession(newGame);
    setAppMode(AppMode.GAME_ACTIVE);
    setIsTestConfigModal(false);
    setChallengeOpponent(null);

    // Simulate opponent playing
    simulateOpponent(newGame.id, gameQuestions);
  };

  const simulateOpponent = (gameId: string, questions: TestQuestion[]) => {
    questions.forEach((q, index) => {
        const delay = (index * 4000) + (Math.random() * 3000) + 1000; // Variable delay per question
        setTimeout(() => {
            setCurrentGameSession(prev => {
                if (!prev || prev.id !== gameId || prev.isComplete) return prev;

                const isCorrect = Math.random() > 0.3; // 70% chance of being correct
                const timeTaken = (delay / 1000) % 4; // Use a fraction of the delay as time

                const newOpponentAnswers = {
                    ...prev.opponentAnswers,
                    [q.id]: { questionId: q.id, isCorrect, timeSpentSeconds: timeTaken }
                };
                
                const newOpponentScore = prev.opponentScore + (isCorrect ? 1 : 0);
                const newOpponentTime = prev.opponentTime + timeTaken;

                const updatedSession = { 
                    ...prev, 
                    opponentAnswers: newOpponentAnswers,
                    opponentScore: newOpponentScore,
                    opponentTime: newOpponentTime,
                };

                // Check for game completion
                if (Object.keys(updatedSession.userAnswers).length === questions.length && Object.keys(updatedSession.opponentAnswers).length === questions.length) {
                    return finalizeGame(updatedSession);
                }

                return updatedSession;
            });
        }, delay);
    });
  };

  const handleGameAnswer = (questionId: string, answerData: Partial<Omit<UserAnswerRecord, 'questionId'>>, timeTaken: number) => {
    if (!currentGameSession || !currentUser) return;

    const question = currentGameSession.questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = isAnswerCorrect(question, { ...answerData, questionId });

    setCurrentGameSession(prev => {
        if(!prev) return null;
        
        const newUserAnswers = { ...prev.userAnswers, [questionId]: { ...answerData, questionId, isCorrect, timeSpentSeconds: timeTaken }};
        const newUserScore = prev.userScore + (isCorrect ? 1 : 0);
        const newUserTime = prev.userTime + timeTaken;
        
        const updatedSession = {
            ...prev,
            userAnswers: newUserAnswers,
            userScore: newUserScore,
            userTime: newUserTime,
        };
        
        // Check for game completion
        if (Object.keys(updatedSession.userAnswers).length === currentGameSession.questions.length && Object.keys(updatedSession.opponentAnswers).length === currentGameSession.questions.length) {
            return finalizeGame(updatedSession);
        }

        return updatedSession;
    });
  };

  const finalizeGame = (session: GameSession): GameSession => {
      let winnerId: string | undefined;
      if (session.userScore > session.opponentScore) {
          winnerId = session.user.id;
      } else if (session.opponentScore > session.userScore) {
          winnerId = session.opponent.id;
      } else { // Scores are equal, check time
          if (session.userTime < session.opponentTime) {
              winnerId = session.user.id;
          } else if (session.opponentTime < session.userTime) {
              winnerId = session.opponent.id;
          } else {
              winnerId = undefined; // Draw
          }
      }

      if(winnerId) {
          updateStatsAndCheckBadges(winnerId, { gamesWon: 1 });
      }

      setTimeout(() => setAppMode(AppMode.GAME_RESULTS), 500); // Short delay to show final progress bar update

      return { ...session, isComplete: true, winnerId };
  };

  const handleRematch = (opponent: User) => {
      handleChallengeUser(opponent);
  };

  // --- Modal Handlers ---

  const handleQuestionSubmit = (
    stem: string, 
    explanation: string, 
    questionType: QuestionType, 
    options?: QuestionOption[], 
    correctAnswerIds?: string[], 
    imageUrl?: string,
    tags?: string[],
    acceptableAnswers?: string[], 
    matchingPromptItems?: MatchingItem[],
    matchingAnswerItems?: MatchingItem[],
    correctMatches?: { promptItemId: string; answerItemId: string }[],
    diagramLabels?: DiagramLabel[]
  ) => {
    if (!currentUser || !selectedGroup) return;

    setIsSubmittingQuestion(true);
    // Exact match check
    const currentGroupMessages = messages[selectedGroup.id] || [];
    const existingQuestion = currentGroupMessages.find(msg => 
        msg.type === MessageType.QUESTION &&
        !msg.isArchived &&
        msg.questionStem?.trim().toLowerCase() === stem.trim().toLowerCase()
    );

    const newQuestionData = {
        groupId: selectedGroup.id,
        type: MessageType.QUESTION,
        questionStem: stem,
        explanation: explanation,
        questionType: questionType,
        options,
        correctAnswerIds,
        imageUrl,
        tags,
        acceptableAnswers,
        matchingPromptItems,
        matchingAnswerItems,
        correctMatches,
        diagramLabels,
    };
    
    if (existingQuestion) {
        setDuplicateQuestionInfo({
            newQuestionData,
            existingQuestion
        });
        setIsSubmittingQuestion(false);
        setIsQuestionModalOpen(false); // Close the question modal
        return;
    }


    const newMessage: Message = {
      ...newQuestionData,
      id: uuidv4(),
      sender: currentUser,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
    };

    setMessages(prev => {
      const newMessagesForGroup = [...(prev[selectedGroup.id] || []), newMessage];
      return {
        ...prev,
        [selectedGroup.id]: newMessagesForGroup,
      };
    });

    updateStatsAndCheckBadges(currentUser.id, { questionsCreated: 1 });
    setHasNewQuestionNotification(true);
    setIsSubmittingQuestion(false);
    setIsQuestionModalOpen(false);
  };
  
  const handleUpvoteExistingAndClose = (existingQuestionId: string) => {
    if (!currentUser || !selectedGroup) return;

    // Upvote the question (only if not already upvoted by user)
    const currentVote = userVotes[existingQuestionId];
    if (currentVote !== 'up') {
        handleVoteQuestion(existingQuestionId, 'up');
    }

    // Award points
    const updatedUser = { ...currentUser, points: currentUser.points + 5 };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    setToast({ message: `+5 points! Thanks for helping keep the question bank clean.`, icon: '✨' });

    setDuplicateQuestionInfo(null);
  };

  const handleCreateGroup = (name: string, description: string, memberEmailsStr: string, parentId?: string) => {
    if (!currentUser) return;

    const invitedEmails = memberEmailsStr
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email !== '');

    const emailSet = new Set(invitedEmails);
    if (currentUser.email) {
      emailSet.add(currentUser.email.toLowerCase());
    }

    const uniqueEmails = Array.from(emailSet);

    if (uniqueEmails.length > MAX_GROUP_MEMBERS) {
      setToast({ message: `A group cannot have more than ${MAX_GROUP_MEMBERS} members. You tried to create a group with ${uniqueEmails.length}.`, icon: '🚫' });
      return;
    }

    const groupMembers = allUsers.filter(user => 
      user.email && uniqueEmails.includes(user.email.toLowerCase())
    );

    if (!groupMembers.some(m => m.id === currentUser.id)) {
        groupMembers.push(currentUser);
    }
    
    const newGroup: Group = {
      id: uuidv4(),
      name,
      description,
      members: groupMembers,
      adminIds: [currentUser.id],
      memberEmails: uniqueEmails,
      parentId,
      isArchived: false,
      avatarUrl: `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=random&color=fff&size=200`,
      lastMessage: "Group created!",
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inviteId: uuidv4(),
      pendingMembers: [],
    };

    setGroups(prevGroups => [...prevGroups, newGroup]);
    setMessages(prevMessages => ({
      ...prevMessages,
      [newGroup.id]: [],
    }));
    
    updateStatsAndCheckBadges(currentUser.id, { groupsCreated: 1 });

    setCreateGroupModalConfig({ isOpen: false });
    setSelectedGroup(newGroup);
    setAppMode(AppMode.CHAT);
  };

  const handleUpdateGroupDetails = (groupId: string, name: string, description: string) => {
    setGroups(prevGroups =>
      prevGroups.map(g => (g.id === groupId ? { ...g, name, description } : g))
    );
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(prev => (prev ? { ...prev, name, description } : null));
    }
  };

  const handleAddMembers = (groupId: string, memberEmailsStr: string) => {
    const emailsToAdd = memberEmailsStr
      .split(',').map(email => email.trim().toLowerCase()).filter(email => email !== '');
    if (emailsToAdd.length === 0) return;

    setGroups(prevGroups => {
      const newGroups = [...prevGroups];
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return prevGroups;

      const group = { ...newGroups[groupIndex] };
      const existingEmails = new Set(group.memberEmails?.map(e => e.toLowerCase()));
      const newUniqueEmails = emailsToAdd.filter(e => !existingEmails.has(e));
      
      if (existingEmails.size + newUniqueEmails.length > MAX_GROUP_MEMBERS) {
          setToast({ message: `A group cannot have more than ${MAX_GROUP_MEMBERS} members. This group has ${existingEmails.size} and you tried to add ${newUniqueEmails.length}.`, icon: '🚫' });
          return prevGroups;
      }
      
      if(newUniqueEmails.length === 0) {
        setToast({ message: 'All invited members are already in the group.', icon: '👍' });
        return prevGroups;
      };
      
      group.memberEmails = [...(group.memberEmails || []), ...newUniqueEmails];
      
      const newUsersToAdd = allUsers.filter(user => user.email && newUniqueEmails.includes(user.email.toLowerCase()));
      const existingMemberIds = new Set(group.members.map(m => m.id));
      const finalNewMembers = newUsersToAdd.filter(u => !existingMemberIds.has(u.id));

      group.members = [...group.members, ...finalNewMembers];
      newGroups[groupIndex] = group;
      setToast({ message: `${newUniqueEmails.length} member(s) invited successfully.`, icon: '✉️' });
      
      if (selectedGroup?.id === groupId) setSelectedGroup(group);
      return newGroups;
    });
  };

  const handleApproveMember = (groupId: string, userId: string) => {
    setGroups(prevGroups => {
        const groupIndex = prevGroups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) return prevGroups;

        const groupToUpdate = { ...prevGroups[groupIndex] };

        if (groupToUpdate.members.length >= MAX_GROUP_MEMBERS) {
             setToast({ message: `Cannot approve member. The group has reached the maximum size of ${MAX_GROUP_MEMBERS}.`, icon: '🚫' });
             // Automatically reject the request to prevent it from being stuck
             groupToUpdate.pendingMembers = (groupToUpdate.pendingMembers || []).filter(m => m.id !== userId);
             const newGroups = [...prevGroups];
             newGroups[groupIndex] = groupToUpdate;
             if (selectedGroup?.id === groupId) {
                setSelectedGroup(groupToUpdate);
             }
             return newGroups;
        }

        const memberToApprove = groupToUpdate.pendingMembers?.find(m => m.id === userId);

        if (!memberToApprove) return prevGroups;

        groupToUpdate.pendingMembers = (groupToUpdate.pendingMembers || []).filter(m => m.id !== userId);
        groupToUpdate.members = [...groupToUpdate.members, memberToApprove];
        
        const newGroups = [...prevGroups];
        newGroups[groupIndex] = groupToUpdate;

        if (selectedGroup?.id === groupId) {
            setSelectedGroup(groupToUpdate);
        }

        return newGroups;
    });
  };

  const handleRejectMember = (groupId: string, userId: string) => {
    setGroups(prevGroups => {
        const groupIndex = prevGroups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) return prevGroups;

        const groupToUpdate = { ...prevGroups[groupIndex] };
        groupToUpdate.pendingMembers = (groupToUpdate.pendingMembers || []).filter(m => m.id !== userId);
        
        const newGroups = [...prevGroups];
        newGroups[groupIndex] = groupToUpdate;

        if (selectedGroup?.id === groupId) {
            setSelectedGroup(groupToUpdate);
        }
        
        return newGroups;
    });
  };

  const handleUpdateGroupAvatar = (groupId: string, avatarUrl: string) => {
    setGroups(prevGroups => prevGroups.map(g => (g.id === groupId ? { ...g, avatarUrl } : g)));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(prev => (prev ? { ...prev, avatarUrl } : null));
    }
  };

  const handlePromoteToAdmin = (groupId: string, userId: string) => {
    setGroups(prevGroups =>
      prevGroups.map(g => {
        if (g.id === groupId && !g.adminIds.includes(userId)) {
          const updatedGroup = { ...g, adminIds: [...g.adminIds, userId] };
          if (selectedGroup?.id === groupId) setSelectedGroup(updatedGroup);
          return updatedGroup;
        }
        return g;
      })
    );
  };

  const handleDemoteAdmin = (groupId: string, userId: string) => {
     setGroups(prevGroups =>
      prevGroups.map(g => {
        if (g.id === groupId && g.adminIds.includes(userId)) {
          if (g.adminIds.length <= 1) {
            alert("Cannot demote the last admin.");
            return g;
          }
          const updatedGroup = { ...g, adminIds: g.adminIds.filter(id => id !== userId) };
          if (selectedGroup?.id === groupId) setSelectedGroup(updatedGroup);
          return updatedGroup;
        }
        return g;
      })
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupToDelete = groups.find(g => g.id === groupId);
    if (!groupToDelete) return;

    const allGroupsAndSubgroupsToDelete = new Set<string>([groupId]);
    const findSubgroupsRecursive = (parentId: string) => {
      groups.forEach(g => {
        if (g.parentId === parentId) {
          allGroupsAndSubgroupsToDelete.add(g.id);
          findSubgroupsRecursive(g.id);
        }
      });
    };
    findSubgroupsRecursive(groupId);

    const remainingGroups = groups.filter(g => !allGroupsAndSubgroupsToDelete.has(g.id));
    setGroups(remainingGroups);

    const newMessages = { ...messages };
    allGroupsAndSubgroupsToDelete.forEach(id => { delete newMessages[id]; });
    setMessages(newMessages);

    if (selectedGroup && allGroupsAndSubgroupsToDelete.has(selectedGroup.id)) {
      const nextGroupToSelect = remainingGroups.find(g => !g.isArchived && !g.parentId) || null;
      setSelectedGroup(nextGroupToSelect);
      if(!nextGroupToSelect) setAppMode(AppMode.DASHBOARD);
    }
  };

  const handleToggleArchiveGroup = (groupId: string) => {
    let unarchived = false;
    const newGroups = groups.map(g => {
        if (g.id === groupId) {
            unarchived = !!g.isArchived;
            return { ...g, isArchived: !g.isArchived };
        }
        return g;
    });
    setGroups(newGroups);

    if (selectedGroup?.id === groupId && !unarchived) {
        const firstActiveGroup = newGroups.find(g => !g.isArchived && !g.parentId);
        setSelectedGroup(firstActiveGroup || null);
        if (!firstActiveGroup) setAppMode(AppMode.DASHBOARD);
    }
  };
  
  const handleDownloadForOffline = (config: Omit<TestConfig, 'questionIds' | 'groupId'>, useSpacedRepetition: boolean, selectedSubgroupIDs: string[]) => {
    setIsDownloading(true);
    setTimeout(() => { // Simulate network delay
        const targetGroupId = selectedGroup?.id;
        if (!targetGroupId) {
            alert("No group selected.");
            setIsDownloading(false);
            return;
        }

        const groupIdsToInclude = [targetGroupId];
        if (selectedSubgroupIDs && selectedSubgroupIDs.length > 0 && !useSpacedRepetition) {
            groupIdsToInclude.push(...selectedSubgroupIDs);
        }
        const allGroupMessages = [...new Set(groupIdsToInclude)].flatMap(id => messages[id] || []);

        let candidateQuestions: Message[];

        if (useSpacedRepetition && currentUser) {
            const testableQuestions = allGroupMessages.filter(msg => msg.type === MessageType.QUESTION && TESTABLE_QUESTION_TYPES.includes(msg.questionType!));
            candidateQuestions = testableQuestions.filter(q => {
                const stats = userQuestionStats[q.id];
                return stats && (stats.incorrectAttempts > stats.correctAttempts);
            });
        } else {
            candidateQuestions = allGroupMessages.filter(msg => {
                if(msg.isArchived) return false;
                if (msg.type !== MessageType.QUESTION || !msg.questionType) return false;
                if (!config.allowedQuestionTypes.includes(msg.questionType)) return false;
                
                // New voting strategy
                const questionGroup = groups.find(g => g.id === msg.groupId);
                if (!questionGroup) return false;
                
                const memberCount = questionGroup.members.length;
                if (memberCount === 0) return false;
                
                const totalVotes = (msg.upvotes || 0) + (msg.downvotes || 0);
                const hasEnoughVotes = (totalVotes / memberCount) > 0.20;
                const isApproved = (msg.upvotes || 0) > (msg.downvotes || 0);

                if (!hasEnoughVotes || !isApproved) return false;

                if (config.selectedTags && config.selectedTags.length > 0) {
                    return msg.tags ? config.selectedTags.some(tag => msg.tags!.includes(tag)) : false;
                }
                return true;
            });
        }

        if (candidateQuestions.length < config.numberOfQuestions || config.numberOfQuestions === 0) {
            alert(`Not enough matching questions available to download. Found ${candidateQuestions.length}, need ${config.numberOfQuestions}.`);
            setIsDownloading(false);
            return;
        }

        const shuffledQuestions = shuffleArray(candidateQuestions).slice(0, config.numberOfQuestions);

        const offlineQuestions: OfflineQuestion[] = shuffledQuestions.map(q => ({ ...q }));

        const finalConfig: TestConfig = {
            ...config,
            groupId: targetGroupId,
            questionIds: offlineQuestions.map(q => q.id),
        };

        const newBundle: OfflineSessionBundle = {
            bundleId: uuidv4(),
            config: finalConfig,
            questions: offlineQuestions,
            downloadedAt: new Date(),
            groupName: selectedGroup?.name || 'Unknown Group',
        };

        setOfflineBundles(prev => [...prev, newBundle]);
        alert(`${config.numberOfQuestions} questions downloaded successfully for offline use.`);
        setIsDownloading(false);
        setIsTestConfigModal(false);
    }, 1000);
  };
  
  const handleVoteQuestion = (messageId: string, voteType: 'up' | 'down') => {
    if (!selectedGroup || !currentUser) return;

    const groupMessages = messages[selectedGroup.id];
    if (!groupMessages) return;
    
    const messageIndex = groupMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
        console.error("Message not found in the selected group's messages.");
        return;
    }

    const updatedMessages = [...groupMessages];
    const messageToUpdate = { ...updatedMessages[messageIndex] };

    // Questions are the only thing that can be voted on.
    if (messageToUpdate.type !== MessageType.QUESTION) return;

    const currentVote = userVotes[messageId];

    let upvoteChange = 0;
    let downvoteChange = 0;
    
    // Revert previous vote if it exists
    if (currentVote === 'up') upvoteChange = -1;
    if (currentVote === 'down') downvoteChange = -1;

    // If new vote is different from old vote, apply new vote
    if (currentVote !== voteType) {
        if (voteType === 'up') upvoteChange += 1;
        if (voteType === 'down') downvoteChange += 1;
    }
    
    messageToUpdate.upvotes = (messageToUpdate.upvotes || 0) + upvoteChange;
    messageToUpdate.downvotes = (messageToUpdate.downvotes || 0) + downvoteChange;

    if (messageToUpdate.upvotes < 0) messageToUpdate.upvotes = 0;
    if (messageToUpdate.downvotes < 0) messageToUpdate.downvotes = 0;

    updatedMessages[messageIndex] = messageToUpdate;

    setMessages(prev => ({
        ...prev,
        [selectedGroup.id]: updatedMessages,
    }));

    if (messageToUpdate.sender.id !== currentUser.id && voteType === 'up') {
      checkAndAwardUpvoteBadge(messageToUpdate.sender.id, messageToUpdate.upvotes);
    }

    setUserVotes(prev => {
        const newVotes = { ...prev };
        if (currentVote === voteType) {
            // Toggling off the vote
            delete newVotes[messageId];
        } else {
            // Setting a new vote or changing vote
            newVotes[messageId] = voteType;
        }
        return newVotes;
    });
  };

  const handleFlagAsSimilar = (messageId: string) => {
    if (!currentUser || !selectedGroup) return;

    setMessages(prev => {
        const groupMessages = [...(prev[selectedGroup.id] || [])];
        const messageIndex = groupMessages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return prev;

        const messageToUpdate = { ...groupMessages[messageIndex] };
        
        if (messageToUpdate.sender.id === currentUser.id) {
            setToast({ message: "You cannot flag your own question.", icon: "🚫"});
            return prev;
        }

        const flaggedIds = messageToUpdate.flaggedAsSimilarUserIds || [];
        if (flaggedIds.includes(currentUser.id)) {
             setToast({ message: "You have already flagged this question.", icon: "🚩"});
             return prev;
        }

        const newFlaggedIds = [...flaggedIds, currentUser.id];
        messageToUpdate.flaggedAsSimilarUserIds = newFlaggedIds;

        const groupMemberCount = selectedGroup.members.length;
        const flagThreshold = 0.3; 

        if (groupMemberCount > 0 && (newFlaggedIds.length / groupMemberCount) > flagThreshold) {
            messageToUpdate.isArchived = true;
            setToast({ message: "Question archived due to multiple flags.", icon: "🗃️"});
        } else {
             setToast({ message: "Question flagged as similar.", icon: "🚩"});
        }

        groupMessages[messageIndex] = messageToUpdate;

        return { ...prev, [selectedGroup.id]: groupMessages };
    });
  };

  const onUpdateCurrentUserAvatar = () => {};
  const onSyncPendingResults = () => {};
  const handleStartOfflineSession = () => {};
  const handleDeleteBundle = () => {};
  const handleExitTestReview = () => { setAppMode(AppMode.CHAT); setCurrentTestSession(null); };

  if (!currentUser) {
    return <AuthScreen users={allUsers} onLogin={handleLogin} onRegister={handleRegister} />;
  }
  
  const currentEditingGroupData = editingGroup ? groups.find(g => g.id === editingGroup.id) : null;

  return (
    <div className="flex h-screen w-screen text-gray-800 dark:text-gray-100">
      {toast && (
        <div className="animate-fade-in-out absolute top-5 right-5 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-[100]">
            <span className="text-2xl mr-3">{toast.icon}</span>
             <div className="flex flex-col">
                <span className="font-semibold">{toast.message}</span>
                {toast.action && (
                    <button 
                        onClick={() => {
                            toast.action?.onClick();
                            setToast(null);
                        }}
                        className="mt-2 text-sm text-white font-bold underline hover:no-underline self-start bg-green-600 px-2 py-1 rounded-md"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
        </div>
      )}
      <Sidebar
        currentUser={currentUser}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onOpenCreateGroupModal={() => setCreateGroupModalConfig({ isOpen: true })}
        onNavigateToDashboard={() => setAppMode(AppMode.DASHBOARD)}
        onNavigateToOfflineMode={() => setAppMode(AppMode.OFFLINE_MODE)}
        onNavigateToMarketplace={() => setAppMode(AppMode.MARKETPLACE)}
        onNavigateToAiCompanion={() => setAppMode(AppMode.AI_COMPANION)}
        pendingSyncCount={pendingSyncResults.length}
        isOnline={isOnline}
        onSyncPendingResults={onSyncPendingResults}
        onUpdateCurrentUserAvatar={onUpdateCurrentUserAvatar}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        currentAppMode={appMode}
        theme={theme}
        toggleTheme={toggleTheme}
        hasNewQuestionNotification={hasNewQuestionNotification}
        onClearNewQuestionNotification={() => setHasNewQuestionNotification(false)}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col bg-inherit">
        {
          {
            [AppMode.CHAT]: <ChatWindow
                group={selectedGroup}
                messages={selectedGroup ? messages[selectedGroup.id] || [] : []}
                currentUser={currentUser}
                userVotes={userVotes}
                onSendMessage={handleSendMessage}
                onOpenQuestionModal={() => setIsQuestionModalOpen(true)}
                onOpenGroupInfoModal={(group) => { setEditingGroup(group); setIsGroupInfoModalOpen(true); }}
                onOpenTestConfigModal={handleOpenTestConfigModal}
                onOpenStudyConfigModal={handleOpenStudyConfigModal}
                onVoteQuestion={handleVoteQuestion}
                onFlagAsSimilar={handleFlagAsSimilar}
                onOpenCreateSubGroupModal={(parentId) => setCreateGroupModalConfig({ isOpen: true, parentId })}
                groups={groups}
                onToggleArchiveGroup={handleToggleArchiveGroup}
            />,
            [AppMode.DASHBOARD]: <DashboardScreen 
                testResults={testResults} 
                groups={groups} 
                currentUser={currentUser} 
                onNavigateToChat={() => setAppMode(AppMode.CHAT)} 
                theme={theme}
                allMessages={messages}
                userQuestionStats={userQuestionStats}
            />,
            [AppMode.OFFLINE_MODE]: <OfflineModeScreen offlineBundles={offlineBundles} pendingSyncResultsCount={pendingSyncResults.length} onStartOfflineSession={handleStartOfflineSession} onDeleteBundle={handleDeleteBundle} onSyncPendingResults={onSyncPendingResults} isOnline={isOnline} />,
            [AppMode.MARKETPLACE]: <MarketplaceScreen currentUser={currentUser} />,
            [AppMode.AI_COMPANION]: <AiCompanionScreen currentUser={currentUser} />,
            [AppMode.TEST_ACTIVE]: currentTestSession && <TestTakingScreen mode="test" session={currentTestSession} onUpdateAnswer={handleUpdateAnswer} onChangeQuestion={handleChangeQuestion} onToggleBookmark={handleToggleBookmark} onSubmitTest={handleSubmitTest} onSubmitOfflineTest={handleSubmitOfflineTest} />,
            [AppMode.STUDY_ACTIVE]: currentStudySession && <TestTakingScreen mode="study" session={currentStudySession} onUpdateAnswer={handleUpdateAnswer} onChangeQuestion={handleChangeQuestion} onToggleBookmark={handleToggleBookmark} onEndSession={handleEndStudySession} />,
            [AppMode.GAME_ACTIVE]: currentGameSession && <GameScreen session={currentGameSession} onUpdateAnswer={handleGameAnswer} />,
            [AppMode.GAME_RESULTS]: currentGameSession && <GameResultScreen session={currentGameSession} currentUser={currentUser} onRematch={handleRematch} onExit={() => setAppMode(AppMode.CHAT)} />,
            [AppMode.TEST_REVIEW]: currentTestSession && (
              <TestReviewScreen
                results={calculateTestResults(currentTestSession)}
                onExit={handleExitTestReview}
                onNavigateToDashboard={() => setAppMode(AppMode.DASHBOARD)}
                onRetakeTest={handleRetakeTest}
                onPracticeFailedQuestions={handlePracticeFailedQuestions}
              />
            ),
          }[appMode] || (selectedGroup ? <ChatWindow 
                group={selectedGroup}
                messages={selectedGroup ? messages[selectedGroup.id] || [] : []}
                currentUser={currentUser}
                userVotes={userVotes}
                onSendMessage={handleSendMessage}
                onOpenQuestionModal={() => setIsQuestionModalOpen(true)}
                onOpenGroupInfoModal={(group) => { setEditingGroup(group); setIsGroupInfoModalOpen(true); }}
                onOpenTestConfigModal={handleOpenTestConfigModal}
                onOpenStudyConfigModal={handleOpenStudyConfigModal}
                onVoteQuestion={handleVoteQuestion}
                onFlagAsSimilar={handleFlagAsSimilar}
                onOpenCreateSubGroupModal={(parentId) => setCreateGroupModalConfig({ isOpen: true, parentId })}
                groups={groups}
                onToggleArchiveGroup={handleToggleArchiveGroup}
          /> : <DashboardScreen 
                testResults={testResults} 
                groups={groups} 
                currentUser={currentUser} 
                onNavigateToChat={() => setAppMode(AppMode.CHAT)} 
                theme={theme} 
                allMessages={messages}
                userQuestionStats={userQuestionStats}
              />)
        }
      </main>
      {isQuestionModalOpen && selectedGroup && (
        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onSubmit={handleQuestionSubmit}
          groupName={selectedGroup.name}
          isSubmitting={isSubmittingQuestion}
        />
      )}
      {duplicateQuestionInfo && (
        <DuplicateQuestionModal
          isOpen={!!duplicateQuestionInfo}
          onClose={() => setDuplicateQuestionInfo(null)}
          duplicateInfo={duplicateQuestionInfo}
          onUpvoteAndClose={handleUpvoteExistingAndClose}
        />
      )}
      {createGroupModalConfig.isOpen && (
        <CreateGroupModal
          isOpen={createGroupModalConfig.isOpen}
          onClose={() => setCreateGroupModalConfig({ isOpen: false })}
          onSubmit={handleCreateGroup}
          parentId={createGroupModalConfig.parentId}
          allGroups={groups}
        />
      )}
      {isGroupInfoModalOpen && currentEditingGroupData && (
        <GroupInfoModal
          isOpen={isGroupInfoModalOpen}
          onClose={() => setIsGroupInfoModalOpen(false)}
          group={currentEditingGroupData}
          currentUser={currentUser}
          onUpdateDetails={handleUpdateGroupDetails}
          onAddMembers={handleAddMembers}
          onUpdateGroupAvatar={handleUpdateGroupAvatar}
          onPromoteToAdmin={handlePromoteToAdmin}
          onDemoteAdmin={handleDemoteAdmin}
          onDeleteGroup={handleDeleteGroup}
          onToggleArchiveGroup={handleToggleArchiveGroup}
          onChallengeUser={handleChallengeUser}
          onApproveMember={handleApproveMember}
          onRejectMember={handleRejectMember}
        />
      )}
      {isTestConfigModal && selectedGroup && configTargetMode && (
        <TestConfigModal
            isOpen={isTestConfigModal}
            onClose={() => setIsTestConfigModal(false)}
            group={selectedGroup}
            allGroups={groups}
            mode={configTargetMode === 'game' ? 'game' : (configTargetMode === AppMode.TEST_CONFIG ? 'test' : 'study')}
            allMessages={messages}
            userQuestionStats={userQuestionStats}
            testPresets={currentUser.testPresets || []}
            challengeOpponent={challengeOpponent}
            onSavePreset={handleSaveTestPreset}
            onDeletePreset={handleDeleteTestPreset}
            onSubmit={handleStartFromModal}
            onDownloadForOffline={handleDownloadForOffline}
            isDownloading={isDownloading}
        />
      )}
      {isSettingsModalOpen && currentUser && (
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            settings={currentUser.settings}
            onUpdateSettings={handleUpdateSettings}
        />
      )}
    </div>
  );
};