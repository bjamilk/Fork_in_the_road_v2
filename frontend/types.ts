
export interface Badge {
  id: string; // e.g., 'TEST_TAKER'
  level: number;
  name: string; // e.g., 'Test Taker II'
  description: string;
  icon: string; // Emoji or icon name
  dateAwarded: string; // ISO Date string
}

export interface UserStats {
  testsCompleted: number;
  questionsCreated: number;
  groupsCreated: number;
  highScoreTests: number; // count of tests >= 80%
  perfectScoreTests: number; // count of tests with 100%
  gamesWon: number;
}

export interface ReminderSettings {
  enabled: boolean;
  lastReminderTimestamp?: number;
}

export interface TestPreset {
    id: string;
    name: string;
    config: Omit<TestConfig, 'questionIds' | 'groupId'>;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  password?: string; // For mock auth only
  phoneNumber?: string;
  points: number;
  badges: Badge[];
  stats: UserStats;
  settings?: {
    reminders: ReminderSettings;
  };
  testPresets?: TestPreset[];
}

export interface Group {
  id: string;
  name: string;
  avatarUrl?: string;
  members: User[];
  description?: string;
  lastMessage?: string; // For display in sidebar
  lastMessageTime?: string; // For display in sidebar
  memberEmails?: string[]; // For invited members not yet registered
  adminIds: string[]; 
  moderatorIds?: string[];
  parentId?: string; // ID of the parent group, if this is a sub-group
  isArchived?: boolean;
  inviteId?: string;
  pendingMembers?: User[];
}

export enum MessageType {
  TEXT = 'TEXT',
  QUESTION = 'QUESTION',
}

export enum QuestionType {
  OPEN_ENDED = 'OPEN_ENDED',
  MULTIPLE_CHOICE_SINGLE = 'MULTIPLE_CHOICE_SINGLE',
  TRUE_FALSE = 'TRUE_FALSE',
  MULTIPLE_CHOICE_MULTIPLE = 'MULTIPLE_CHOICE_MULTIPLE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  MATCHING = 'MATCHING',
  DIAGRAM_LABELING = 'DIAGRAM_LABELING',
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface MatchingItem {
  id: string;
  text: string;
}

export interface DiagramLabel {
  id: string;
  text: string;
  x: number; // as percentage
  y: number; // as percentage
}

export interface Message {
  id: string;
  groupId: string;
  sender: User;
  timestamp: Date;
  type: MessageType;
  text?: string;
  // Question related fields
  questionStem?: string;
  explanation?: string;
  questionType?: QuestionType;
  options?: QuestionOption[]; 
  correctAnswerIds?: string[]; 
  imageUrl?: string; // Can be a URL or a Base64 data URI for offline
  tags?: string[];
  // Voting fields
  upvotes: number;
  downvotes: number;
  // --- Fields for community curation ---
  /** An array of user IDs who have flagged this question as a duplicate/similar. */
  flaggedAsSimilarUserIds?: string[];
  /** Whether the question has been archived by the community and should be hidden. */
  isArchived?: boolean;
  // Fields for new question types
  acceptableAnswers?: string[]; 
  matchingPromptItems?: MatchingItem[]; 
  matchingAnswerItems?: MatchingItem[]; 
  correctMatches?: { promptItemId: string; answerItemId: string }[]; 
  diagramLabels?: DiagramLabel[];
}

// New types for Test/Study Mode
export enum AppMode {
  CHAT = 'CHAT',
  TEST_CONFIG = 'TEST_CONFIG',
  STUDY_CONFIG = 'STUDY_CONFIG',
  TEST_ACTIVE = 'TEST_ACTIVE',
  STUDY_ACTIVE = 'STUDY_ACTIVE',
  TEST_REVIEW = 'TEST_REVIEW',
  DASHBOARD = 'DASHBOARD',
  OFFLINE_MODE = 'OFFLINE_MODE',
  MARKETPLACE = 'MARKETPLACE',
  GAME_ACTIVE = 'GAME_ACTIVE',
  GAME_RESULTS = 'GAME_RESULTS',
  AI_COMPANION = 'AI_COMPANION',
}

export interface TestQuestion extends Message {
  questionNumber: number; 
}

export interface TestConfig {
  groupId: string; 
  numberOfQuestions: number;
  questionIds: string[]; // Stores original IDs for reference, even if questions are embedded in offline bundle
  timerDuration?: number; 
  allowedQuestionTypes: QuestionType[];
  selectedTags?: string[];
}

export type UserAnswerRecord = {
  questionId: string;
  selectedOptionIds?: string[];
  fillText?: string;
  matchingAnswers?: { promptItemId: string; answerItemId: string }[];
  diagramAnswers?: { labelId: string; selectedLabelId: string }[];
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  isBookmarked?: boolean;
};

export interface TestSessionData {
  config: TestConfig;
  questions: TestQuestion[];
  userAnswers: Record<string, UserAnswerRecord>;
  currentQuestionIndex: number;
  startTime: Date;
  endTime?: Date;
  isOffline?: boolean; // New flag
}

export interface GameSession {
    id: string;
    user: User;
    opponent: User;
    questions: TestQuestion[];
    userAnswers: Record<string, UserAnswerRecord>;
    opponentAnswers: Record<string, UserAnswerRecord>; // For simulation
    userScore: number;
    opponentScore: number;
    userTime: number; // in seconds
    opponentTime: number; // in seconds
    isComplete: boolean;
    winnerId?: string;
}

export interface StudySessionData extends TestSessionData {
  // No endTime needed for study mode unless explicitly set
  // isOffline flag inherited
}

export interface TestResult {
  session: TestSessionData; // TestSessionData now includes isOffline
  score: number; 
  totalQuestions: number;
  correctAnswersCount: number;
  // id?: string; // Optional: if we need a unique ID for each result, esp. for pending sync
}

// Spaced Repetition Types
export interface UserQuestionStat {
  correctAttempts: number;
  incorrectAttempts: number;

  lastAttempted: string; // ISO string date
}

export interface UserQuestionStats {
  [questionId: string]: UserQuestionStat;
}


// Types for Offline Functionality
export interface OfflineQuestion extends Message {
  // Inherits all Message properties. imageUrl here could be a Base64 string.
  // We don't need to redefine, just ensure imageUrl can hold Base64.
}

export interface OfflineSessionBundle {
  bundleId: string;
  config: TestConfig; // The config used to generate this bundle
  questions: OfflineQuestion[]; // The actual question data, with images potentially as Base64
  downloadedAt: Date;
  groupName: string; // Store group name for display
}

// Marketplace General Types
export enum MarketplaceListingType {
  OFFERING = 'Offering Service/Item',
  REQUESTING = 'Requesting Service/Item',
}

export enum MarketplaceRateType {
  PER_HOUR = 'Per Hour',
  PER_SESSION = 'Per Session',
  PER_ITEM = 'Per Item/Task',
  PER_DAY = 'Per Day',
  PER_WEEK = 'Per Week',
  PER_PROJECT = 'Per Project',
  FIXED_PRICE = 'Fixed Price',
  NEGOTIABLE = 'Negotiable',
  FREE = 'Free',
}

export interface MarketplaceReview {
    id: string;
    listingId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    rating: number; // 1-5
    comment: string;
    date: Date;
}

export enum ReportReason {
    INACCURATE = 'Inaccurate Information / Wrong Category',
    SCAM = 'Scam or Fraudulent Listing',
    INAPPROPRIATE = 'Inappropriate Content (e.g., offensive, explicit)',
    SOLD = 'Item is Sold / No Longer Available',
    SPAM = 'Spam / Repetitive Listing',
    OTHER = 'Other (Please specify)',
}


// Marketplace - Textbook Types
export enum TextbookCondition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
}

export interface TextbookListing {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  course?: string; // e.g., "BIO101"
  price: number;
  condition: TextbookCondition;
  sellerName: string; // Could be User.name
  sellerId: string; // User.id
  imageUrl?: string; 
  description?: string;
  listedDate: Date;
  isSold?: boolean;
  contactInfo?: string;
  reviews?: MarketplaceReview[];
  rating?: number;
  isReported?: boolean;
}

// Marketplace - Past Questions (PQ) Bank
export interface PastQuestionListing {
  id: string;
  title: string; // e.g., "MTH101 Final Exam"
  courseCode: string; // "MTH101"
  university?: string; // "University of Lagos"
  faculty?: string;
  department?: string;
  year: number;
  price: number;
  fileUrl?: string; // For a real backend. For mock, we might not use this.
  fileBase64?: string; // For offline/mock storage
  sellerName: string;
  sellerId: string;
  listedDate: Date;
  isSold?: boolean;
  reviewCount?: number;
  rating?: number;
  description?: string;
  contactInfo?: string;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Lecture Note Exchange
export interface LectureNoteListing {
  id: string;
  title: string; // e.g., "EEC321 - Digital Signal Processing Notes"
  courseCode: string;
  lecturerName?: string;
  description: string;
  price: number;
  fileUrl?: string;
  fileBase64?: string;
  sellerName: string;
  sellerId: string;
  listedDate: Date;
  isSold?: boolean;
  rating?: number;
  contactInfo?: string;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}


// Marketplace - Project & Thesis Hub
export interface ProjectMaterialListing {
    id: string;
    projectTitle: string;
    fieldOfStudy: string; // e.g., "Computer Engineering"
    abstract: string;
    price: number; // for the full material reference
    sellerName: string;
    sellerId: string;
    listedDate: Date;
    isSold?: boolean;
    tags?: string[];
    fileUrl?: string;
    fileBase64?: string;
    contactInfo?: string;
    reviews?: MarketplaceReview[];
    rating?: number;
    isReported?: boolean;
}

export interface DataCollectionGig {
    id: string;
    title: string;
    description: string;
    location: string; // "Unilag Campus", "Online Survey"
    compensation: string; // "₦5000", "₦100 per completed survey", "Volunteer"
    requiredParticipants?: number;
    deadline?: Date;
    listerName: string;
    listerId: string;
    listedDate: Date;
    isClosed?: boolean;
    contactInfo?: string;
    isReported?: boolean;
}


// Marketplace - Study Group Types
export enum MeetingPreference {
  ONLINE = 'Online',
  OFFLINE = 'In-Person',
  HYBRID = 'Hybrid (Online & In-Person)',
}

export interface StudyGroupListing {
  id: string;
  groupName: string;
  course: string;
  topic: string;
  description: string;
  meetingPreference: MeetingPreference;
  contactInfo?: string;
  maxSize?: number;
  currentSize?: number; 
  listedBy: string; // User's name
  listedById: string; // User's ID
  listedDate: Date;
  tags?: string[];
  meetingTime?: string; 
  location?: string; 
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Tutoring Types
export enum TutoringSubjectProficiency {
  BEGINNER = 'Beginner Friendly',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert Level',
  ALL_LEVELS = 'All Levels',
}

export enum TutoringDeliveryMethod {
  ONLINE = 'Online',
  IN_PERSON = 'In-Person',
  HYBRID = 'Hybrid (Online & In-Person)',
}

export interface TutorListing {
  id: string;
  tutorName: string;
  tutorId: string; // User.id
  subjects: string[]; // List of subjects tutor can teach
  courses?: string[]; // Specific course codes, e.g., "CS101", "MATH203"
  overallProficiency: TutoringSubjectProficiency; // Tutor's general proficiency level
  rate: number; // Rate 
  rateType: MarketplaceRateType; // Using the more generic MarketplaceRateType
  deliveryMethod: TutoringDeliveryMethod;
  availability?: string; // e.g., "Mon, Wed 5-7 PM", "Flexible weekends"
  bio?: string; // Short biography or qualifications
  contactInfo?: string; // Preferred contact method (e.g., email, platform DM)
  listedDate: Date;
  avatarUrl?: string;
  location?: string; // For in-person/hybrid: "Campus Library", "City Center", "Lagos"
  schoolOfStudy?: string; // Optional: "University of Example - Computer Science", "Unilag"
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Lost and Found Types
export enum LostAndFoundCategory {
  ELECTRONICS = 'Electronics',
  BOOKS_NOTES = 'Books/Notes',
  CLOTHING_ACCESSORIES = 'Clothing/Accessories',
  KEYS = 'Keys',
  ID_CARDS_WALLETS = 'ID Cards/Wallets',
  BAGS_BACKPACKS = 'Bags/Backpacks',
  JEWELRY_WATCHES = 'Jewelry/Watches',
  SPORTS_EQUIPMENT = 'Sports Equipment',
  OTHER = 'Other',
}

export enum LostAndFoundStatus {
  LOST = 'Lost',
  FOUND = 'Found',
}

export interface LostAndFoundItem {
  id: string;
  itemName: string;
  description: string;
  category: LostAndFoundCategory;
  status: LostAndFoundStatus;
  dateLostOrFound: Date; 
  locationLostOrFound: string; 
  imageUrl?: string; 
  contactInfo: string; 
  postedByUserId: string; 
  postedByUserName: string; 
  postedDate: Date;
  isResolved?: boolean; 
  isReported?: boolean;
}

// Marketplace - Peer Review/Editing Service Types
export enum PeerReviewServiceType {
  PROOFREADING = 'Proofreading (Typos, Grammar, Punctuation)',
  COPY_EDITING = 'Copy Editing (Clarity, Conciseness, Style)',
  CONTENT_REVIEW = 'Content Review (Structure, Argument, Coherence)',
  FORMATTING_CITATION = 'Formatting & Citation (APA, MLA, etc.)',
  GENERAL_FEEDBACK = 'General Feedback & Suggestions',
  OTHER = 'Other (Specify in Description)',
}

export interface PeerReviewServiceListing {
  id: string;
  listingType: MarketplaceListingType; // Offering or Requesting
  serviceType: PeerReviewServiceType;
  title: string; // e.g., "Expert APA Formatting for Theses" or "Need Proofreader for English Essay"
  description: string;
  subjectsOrSkills: string[]; // e.g., "History Essays", "Scientific Papers", "APA 7th Ed."
  rate?: number; // Optional
  rateType?: MarketplaceRateType; // Optional, use if rate is set
  turnaroundTime?: string; // e.g., "24 hours", "3 business days", "Flexible"
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Thesis/Dissertation Support Types
export enum ThesisSupportType {
  TOPIC_DEVELOPMENT_PROPOSAL = 'Topic Development & Proposal Writing',
  RESEARCH_DESIGN_METHODOLOGY = 'Research Design & Methodology Consulting',
  LITERATURE_REVIEW = 'Literature Review Assistance',
  DATA_COLLECTION_SUPPORT = 'Data Collection Support & Advice',
  DATA_ANALYSIS_INTERPRETATION = 'Data Analysis & Interpretation (e.g., SPSS, R, NVivo)',
  WRITING_COACHING_EDITING = 'Writing Coaching, Editing & Proofreading',
  PRESENTATION_DEFENSE_PREP = 'Presentation & Defense Preparation',
  GRANT_PROPOSAL_ASSISTANCE = 'Grant Proposal Assistance',
  STATISTICAL_CONSULTING = 'Statistical Consulting',
  ETHICS_APPROVAL_GUIDANCE = 'Ethics Approval Guidance',
  OTHER = 'Other (Specify in Description)',
}

export interface ThesisSupportListing {
  id: string;
  listingType: MarketplaceListingType; // Offering or Requesting
  supportType: ThesisSupportType;
  title: string; // e.g., "PhD Thesis Editing (Humanities)" or "Seeking SPSS Expert for Master's Thesis"
  description: string;
  fieldOfStudy: string[]; // e.g., "Computer Science", "Sociology", "Biochemistry"
  specificSkills?: string[]; // e.g., "SPSS", "Qualitative Analysis", "NVivo", "LaTeX"
  rate?: number; // Optional
  rateType?: MarketplaceRateType; // Optional, use if rate is set
  availability?: string; // e.g., "Evenings", "Weekends", "Project-based"
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Club Profiles
export enum ClubType {
  ACADEMIC = 'Academic & Educational',
  ARTS_CULTURE = 'Arts & Culture',
  SPORTS_RECREATION = 'Sports & Recreation',
  SOCIAL_INTEREST = 'Social & Special Interest',
  VOLUNTEERING_SERVICE = 'Volunteering & Service',
  POLITICAL_ADVOCACY = 'Political & Advocacy',
  TECHNOLOGY_INNOVATION = 'Technology & Innovation',
  RELIGIOUS_SPIRITUAL = 'Religious & Spiritual',
  INTERNATIONAL_MULTICULTURAL = 'International & Multicultural',
  OTHER = 'Other',
}

export interface MembershipTier {
  id: string;
  name: string; // e.g., "Basic", "Premium", "Gold Member"
  price: number; // 0 for free
  duration: 'Semester' | 'Annual' | 'Monthly' | 'One-Time';
  benefits: string[]; // List of benefits like "Access to all events", "Exclusive workshops"
}

export interface ClubProfile {
  id: string;
  clubName: string;
  clubType: ClubType;
  description: string;
  contactEmail: string;
  logoUrl?: string; // Base64 or external URL
  meetingInfo?: string; // e.g., "Tuesdays 7 PM, Student Union Room 201"
  socialMediaLinks?: { platform: string; url: string }[];
  membershipTiers?: MembershipTier[];
  listedByUserId: string;
  listedByUserName: string;
  listedDate: Date;
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}

// Marketplace - Event Tickets
export enum CampusEventType {
  CONCERT_PERFORMANCE = 'Concert / Performance',
  WORKSHOP_SEMINAR = 'Workshop / Seminar',
  SPORTS_GAME = 'Sports Game / Tournament',
  SOCIAL_GATHERING_PARTY = 'Social Gathering / Party',
  FUNDRAISER_CHARITY = 'Fundraiser / Charity Event',
  CONFERENCE_SYMPOSIUM = 'Conference / Symposium',
  GUEST_LECTURE = 'Guest Lecture / Talk',
  MOVIE_SCREENING = 'Movie Screening',
  CULTURAL_FESTIVAL = 'Cultural Festival',
  OTHER = 'Other Campus Event',
}

export interface EventTicketListing {
  id: string;
  eventName: string;
  eventType: CampusEventType;
  eventDate: Date; // Includes time
  location: string;
  description: string;
  originalPrice?: number; // Price if sold by official organizer
  sellingPrice: number;
  quantityAvailable: number;
  ticketType?: string; // e.g., "General Admission", "VIP", "Early Bird"
  isResale: boolean;
  sellerContact: string; // How to contact the seller
  sellerName: string;
  sellerId: string;
  postedDate: Date;
  eventImageUrl?: string; // Optional image for the event
  isSold?: boolean;
  isReported?: boolean;
}

// Marketplace - Merchandise
export enum MerchandiseCategory {
  APPAREL = 'Apparel (Hoodies, T-Shirts, etc.)',
  ACCESSORIES = 'Accessories (Caps, Bags, Keychains)',
  STATIONERY_SUPPLIES = 'Stationery & Office Supplies',
  TECH_GADGETS_ACCESSORIES = 'Tech Gadgets & Accessories',
  HOME_DECOR_DORM = 'Home Decor & Dorm Essentials',
  BOOKS_MAGAZINES_NOT_TEXTBOOKS = 'Books & Magazines (Non-Textbook)',
  ART_CRAFTS = 'Art & Crafts',
  SPORTS_FITNESS_GEAR = 'Sports & Fitness Gear (Non-Equipment)',
  OTHER = 'Other Merchandise',
}

export interface MerchandiseItem {
  id: string;
  itemName: string;
  category: MerchandiseCategory;
  description: string;
  price: number;
  sellerInfo: string; // e.g., "Drama Club", "John D. (Student)"
  images: string[]; // Array of Base64 or external URLs, first is primary
  availableSizes?: string[]; // e.g., ["S", "M", "L", "XL"]
  stockQuantity?: number;
  contactForPurchase: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  rating?: number;
  reviews?: MarketplaceReview[];
  isSold?: boolean;
  isReported?: boolean;
}

// Marketplace - Campus Hustles & Services
export enum CampusHustleCategory {
  PERSONAL_CARE = 'Personal Care (Hair, Makeup, Nails)',
  CRAFTS_FASHION = 'Crafts & Fashion (Baking, Tailoring)',
  TECH_REPAIRS = 'Tech & Repairs (Phone, Laptop)',
  EVENT_SERVICES = 'Event Services (DJ, MC, Ushering)',
  ACADEMIC_GIGS = 'Academic Gigs (Typing, Formatting)',
  DELIVERY_ERRANDS = 'Delivery & Errand Services',
  SKILL_TUTORING = 'Skill Tutoring (Music, Art, Coding)',
  OTHER = 'Other Gigs & Services',
}

export interface CampusHustleListing {
  id: string;
  listingType: MarketplaceListingType; // Offering or Requesting
  title: string;
  category: CampusHustleCategory;
  description: string;
  skills: string[]; // e.g., ["Event Photography", "Hair Braiding"]
  portfolioLink?: string; // URL to portfolio or samples
  rate?: number;
  rateType?: MarketplaceRateType;
  availability?: string; // e.g., "Weekends", "Project-based"
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  rating?: number;
  reviews?: MarketplaceReview[];
  isReported?: boolean;
}


// Marketplace - Equipment Rental/Sharing
export enum EquipmentCategory {
  SPORTS_RECREATION_EQUIPMENT = 'Sports & Recreation Equipment',
  MUSICAL_INSTRUMENTS_GEAR = 'Musical Instruments & Gear',
  CAMERA_VIDEO_PHOTO_GEAR = 'Camera, Video & Photo Gear',
  EVENT_SUPPLIES_PARTY_RENTALS = 'Event Supplies & Party Rentals (Speakers, Lights)',
  TOOLS_HARDWARE_DIY = 'Tools, Hardware & DIY Equipment',
  GAMING_CONSOLE_VR_EQUIPMENT = 'Gaming Consoles & VR Equipment',
  KITCHEN_APPLIANCES_SMALL = 'Small Kitchen Appliances & Cookware',
  PROJECTORS_PRESENTATION_EQUIPMENT = 'Projectors & Presentation Equipment',
  CAMPING_OUTDOOR_GEAR = 'Camping & Outdoor Gear',
  BOOKS_NON_TEXTBOOK_ACADEMIC = 'Books (Non-Textbook, for leisure/specific interests)',
  FASHION_ACCESSORIES_SPECIAL_OCCASION = 'Fashion & Accessories (for special occasions)',
  OTHER_RENTALS = 'Other Equipment & Items for Rent/Share',
}

export interface RentalListing {
  id: string;
  itemName: string;
  category: EquipmentCategory;
  description: string;
  images: string[]; // Array of Base64 or external URLs, first is primary
  rentalRate: number;
  rentalRateType: MarketplaceRateType; // PER_HOUR, PER_DAY, PER_WEEK, PER_ITEM (for project based one-time rental)
  depositRequired?: number;
  availabilityInfo?: string; // e.g., "Available on weekends", "Check calendar link"
  pickupLocation: string;
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isSold?: boolean; // Using 'isSold' to mean 'isRentedOut'
  isReported?: boolean;
}

// Marketplace - Campus Ride Share
export enum RideShareType {
  OFFERING_RIDE = 'Offering a Ride',
  REQUESTING_RIDE = 'Requesting a Ride',
}

export enum RideRecurrence {
  ONE_TIME = 'One-Time',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  CUSTOM = 'Custom (Specify in Notes)',
}

export interface RideShareListing {
  id: string;
  listingType: RideShareType;
  departureLocation: string;
  destinationLocation: string;
  departureDateTime: Date;
  availableSeats?: number; // For ride offers
  passengersNeeded?: number; // For ride requests
  recurrence: RideRecurrence;
  customRecurrenceDetails?: string; // If recurrence is CUSTOM
  costContribution?: number; // Optional, per person or total trip
  vehicleInfo?: string; // e.g., "Toyota Camry, Blue", "Comfortable Sedan"
  luggageSpace?: 'None' | 'Small' | 'Medium' | 'Large';
  notes?: string; // e.g., "Female driver/passengers preferred", "No pets"
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isReported?: boolean;
}

// Marketplace - Bicycle/Scooter Exchange
export enum BikeScooterListingType {
  FOR_SALE = 'For Sale',
  FOR_RENT = 'For Rent',
  WANTED_TO_BUY = 'Wanted to Buy',
  WANTED_TO_RENT = 'Wanted to Rent',
}

export enum BikeScooterType {
  BICYCLE_ROAD = 'Road Bike',
  BICYCLE_MOUNTAIN = 'Mountain Bike (MTB)',
  BICYCLE_HYBRID_COMMUTER = 'Hybrid/Commuter Bike',
  BICYCLE_EBIKE = 'E-Bike (Electric Bicycle)',
  BICYCLE_CRUISER = 'Cruiser Bike',
  BICYCLE_BMX = 'BMX Bike',
  BICYCLE_OTHER = 'Other Bicycle',
  SCOOTER_KICK = 'Kick Scooter',
  SCOOTER_E = 'E-Scooter (Electric)',
  SCOOTER_OTHER = 'Other Scooter',
}

export enum BikeScooterCondition {
  NEW = 'New (Unused)',
  LIKE_NEW = 'Like New (Used a few times, no visible wear)',
  GOOD = 'Good (Some signs of use, fully functional)',
  FAIR = 'Fair (Visible wear, may need minor repairs/tuning)',
  POOR = 'Poor (Needs significant repair, for parts)',
}

export interface BikeScooterListing {
  id: string;
  listingType: BikeScooterListingType;
  itemType: BikeScooterType;
  brandModel?: string; // e.g., "Trek FX2", "Xiaomi M365"
  condition: BikeScooterCondition;
  description: string; // Include frame size, color, features, issues for "Wanted"
  price?: number; // For Sale or Wanted to Buy (budget)
  rentalRate?: number; // For Rent or Wanted to Rent (budget)
  rentalRateType?: MarketplaceRateType; // e.g., PER_DAY, PER_WEEK
  images?: string[]; // Array of Base64 or external URLs
  location: string; // Pickup location or area for viewing
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isSold?: boolean;
  isReported?: boolean;
}

// Marketplace - Housing & Accommodation
export enum FurnishedStatus {
  FURNISHED = 'Furnished',
  UNFURNISHED = 'Unfurnished',
  PARTIALLY_FURNISHED = 'Partially Furnished',
}

export interface AccommodationReview {
    powerRating: number; // 1-5
    waterRating: number; // 1-5
    securityRating: number; // 1-5
    landlordRating: number; // 1-5
    comment: string;
    reviewerName: string;
    date: Date;
}

export interface SubletListing {
  id: string;
  title: string;
  location: string;
  rent: number;
  rentFrequency: 'per month' | 'per week' | 'total for period';
  availableFrom: Date;
  availableTo: Date;
  bedrooms: number;
  bathrooms: number;
  furnishedStatus: FurnishedStatus;
  description: string;
  images: string[];
  amenities: string[];
  contactInfo: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isSold?: boolean;
  reviews?: AccommodationReview[];
  isReported?: boolean;
}

export enum RoommateListingType {
  SEEKING_ROOMMATE = 'Have a Room, Seeking Roommate',
  SEEKING_PLACE = 'Need a Room & Roommate(s)',
}

export interface RoommateListing {
  id: string;
  listingType: RoommateListingType;
  title: string;
  postedByUserId: string;
  postedByUserName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
  schoolProgram: string;
  bio: string;
  habits: string[];
  lookingFor: string;
  contactInfo: string;
  postedDate: Date;
  profileImageUrl?: string;
  location?: string;
  rent?: number;
  moveInDate?: Date;
  leaseLength?: string;
  isReported?: boolean;
}

// Marketplace - Personal Services & Exchange
export enum FoodCategory {
  HOMEMADE_MEAL = 'Homemade Meal',
  MEAL_SWIPE_EXCHANGE = 'Meal Swipe Exchange',
  BAKED_GOODS = 'Baked Goods',
  GROCERIES = 'Groceries',
  OTHER = 'Other',
}

export enum DietaryInfo {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten-Free',
  HALAL = 'Halal',
  KOSHER = 'Kosher',
  DAIRY_FREE = 'Dairy-Free',
  NUT_FREE = 'Nut-Free',
}

export interface FoodListing {
  id: string;
  title: string;
  description: string;
  category: FoodCategory;
  price?: number; // For cash
  swipeEquivalent?: number; // For meal swipes
  portionsAvailable: number;
  dietaryInfo?: DietaryInfo[];
  pickupDetails: string;
  images?: string[];
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isSold?: boolean;
  contactInfo?: string;
  isReported?: boolean;
}

export enum SecondHandCategory {
  FURNITURE = 'Furniture',
  ELECTRONICS = 'Electronics',
  CLOTHING_ACCESSORIES = 'Clothing & Accessories',
  KITCHENWARE = 'Kitchenware',
  HOME_DECOR_DORM = 'Home Decor / Dorm',
  BOOKS_NON_TEXTBOOK = 'Books (Non-Textbook)',
  OTHER = 'Other',
}

export interface SecondHandGood {
  id: string;
  itemName: string;
  description: string;
  category: SecondHandCategory;
  condition: TextbookCondition; // Reusing this enum
  price: number;
  images: string[];
  location: string;
  postedByUserId: string;
  postedByUserName: string;
  postedDate: Date;
  isSold?: boolean;
  contactInfo?: string;
  isReported?: boolean;
}

// New for Nigerian Marketplace
export interface AsoEbiListing {
    id: string;
    eventName: string;
    description: string;
    listingType: 'Fabric' | 'Outfit';
    price: number;
    images: string[];
    sellerId: string;
    sellerName: string;
    postedDate: Date;
    isSold?: boolean;
    size?: string; // For outfits
    yards?: number; // For fabric
    contactInfo?: string;
    reviews?: MarketplaceReview[];
    rating?: number;
    isReported?: boolean;
}

// AI Companion Types
export interface AIChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}