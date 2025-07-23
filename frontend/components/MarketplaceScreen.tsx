

import React, { useState, useMemo, useEffect } from 'react';
import {
  BuildingStorefrontIcon, AcademicCapIcon, BookOpenIcon, UsersIcon, ComputerDesktopIcon, DocumentMagnifyingGlassIcon,
  MegaphoneIcon, TicketIcon, ShoppingBagIcon, SparklesIcon, TruckIcon, HomeIcon, CurrencyDollarIcon,
  WrenchScrewdriverIcon, MusicalNoteIcon, VideoCameraIcon, ShareIcon, LightBulbIcon, ChatBubbleLeftRightIcon,
  ShieldCheckIcon, AdjustmentsHorizontalIcon, BellAlertIcon, HeartIcon, MagnifyingGlassIcon, MapPinIcon,
  CreditCardIcon, LifebuoyIcon, PuzzlePieceIcon, ArrowTrendingUpIcon, IdentificationIcon, GlobeAltIcon,
  BriefcaseIcon, SwatchIcon, TableCellsIcon, ClipboardDocumentListIcon, ArrowPathIcon, BanknotesIcon, CameraIcon, PaintBrushIcon, PlayCircleIcon, SignalIcon, UserCircleIcon, CakeIcon, DevicePhoneMobileIcon, TvIcon, ArchiveBoxIcon, PlusCircleIcon, TagIcon, ArrowUturnLeftIcon, InformationCircleIcon, FunnelIcon, XMarkIcon, CalendarDaysIcon, ClockIcon, CheckBadgeIcon, QuestionMarkCircleIcon, ChatBubbleLeftEllipsisIcon, PencilSquareIcon, ChatBubbleBottomCenterTextIcon, BoltIcon, FlagIcon, LinkIcon, UserPlusIcon, HomeModernIcon, DocumentTextIcon, UserGroupIcon as UserGroupIconOutline, EyeIcon, DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid, NoSymbolIcon, BellAlertIcon as BellAlertIconSolid, FlagIcon as FlagIconSolid } from '@heroicons/react/24/solid';
import { 
    TextbookListing, TextbookCondition, 
    StudyGroupListing, MeetingPreference, 
    TutorListing, TutoringSubjectProficiency, TutoringDeliveryMethod, MarketplaceRateType,
    LostAndFoundItem, LostAndFoundCategory, LostAndFoundStatus, 
    PeerReviewServiceListing, PeerReviewServiceType, MarketplaceListingType,
    ThesisSupportListing, ThesisSupportType,
    ClubProfile, ClubType, MembershipTier,
    EventTicketListing, CampusEventType,
    MerchandiseItem, MerchandiseCategory,
    CampusHustleListing, CampusHustleCategory,
    RentalListing, EquipmentCategory,
    RideShareListing, RideShareType, RideRecurrence,
    BikeScooterListing, BikeScooterListingType, BikeScooterType, BikeScooterCondition,
    SubletListing, FurnishedStatus, 
    RoommateListing, RoommateListingType,
    FoodListing, FoodCategory, DietaryInfo,
    SecondHandGood, SecondHandCategory,
    User,
    PastQuestionListing,
    LectureNoteListing,
    ProjectMaterialListing,
    DataCollectionGig,
    MarketplaceReview,
    AsoEbiListing,
    ReportReason
} from '../types'; 
import ListTextbookModal from './ListTextbookModal';
import ListStudyGroupModal from './ListStudyGroupModal'; 
import ListTutorModal from './ListTutorModal'; 
import ListLostAndFoundItemModal from './ListLostAndFoundItemModal';
import ListPeerReviewModal from './ListPeerReviewModal'; 
import ListThesisSupportModal from './ListThesisSupportModal'; 
import ListClubProfileModal from './ListClubProfileModal';
import ListEventTicketModal from './ListEventTicketModal';
import ListMerchandiseItemModal from './ListMerchandiseItemModal';
import ListCampusHustleModal from './ListCampusHustleModal';
import ListRentalItemModal from './ListRentalItemModal';
import ListRideShareModal from './ListRideShareModal';
import ListBikeScooterModal from './ListBikeScooterModal';
import ListSubletModal from './ListSubletModal';
import ListRoommateModal from './ListRoommateModal';
import ListFoodModal from './ListFoodModal';
import ListSecondHandGoodModal from './ListSecondHandGoodModal';
import ListPastQuestionModal from './ListPastQuestionModal';
import ListLectureNoteModal from './ListLectureNoteModal';
import ListProjectMaterialModal from './ListProjectMaterialModal';
import ListDataCollectionGigModal from './ListDataCollectionGigModal';
import ListAsoEbiModal from './ListAsoEbiModal';
import ListingPreviewModal from './ListingPreviewModal';
import ReportListingModal from './ReportListingModal';
import { v4 as uuidv4 } from 'https://esm.sh/uuid';


interface MarketplaceScreenProps {
  currentUser: User;
}

const MOCK_CURRENT_USER_MARKETPLACE: Pick<User, 'id' | 'name' | 'avatarUrl'> = {
  id: 'user1',
  name: 'You',
  avatarUrl: `https://ui-avatars.com/api/?name=You&background=random&color=fff&size=40`,
};


interface Feature {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  action?: () => void; 
}

interface Section {
  id: string;
  title: string;
  features: Feature[];
}

const MOCK_REVIEWS_INITIAL: MarketplaceReview[] = [
  { id: 'pq1rev1', listingId: 'pq1', reviewerId: 'user3', reviewerName: 'Bob B.', rating: 5, comment: "This was a lifesaver! Very accurate questions.", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 'pq1rev2', listingId: 'pq1', reviewerId: 'user4', reviewerName: 'Charlie D.', rating: 4, comment: "Good stuff, helped me pass.", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
];


const MOCK_TEXTBOOKS_INITIAL: TextbookListing[] = [
  { id: 'tb1', title: 'Organic Chemistry, 10th Edition', author: 'Paula Yurkanis Bruice', isbn: '978-0134042282', course: 'CHEM201', price: 7500, condition: TextbookCondition.GOOD, sellerName: 'Alice W.', sellerId: 'user2', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), imageUrl: 'https://picsum.photos/seed/book1/200/300', contactInfo: 'alice.w@example.com' },
  { id: 'tb2', title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', course: 'MATH150', price: 9000, condition: TextbookCondition.LIKE_NEW, sellerName: 'Bob B.', sellerId: 'user3', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), imageUrl: 'https://picsum.photos/seed/book2/200/300', contactInfo: 'bob.b@example.com' },
  { id: 'tb3', title: 'Biology, 12th Edition', author: 'Sylvia Mader, Michael Windelspecht', isbn: '978-1259824906', course: 'BIO101', price: 6000, condition: TextbookCondition.FAIR, sellerName: 'Alice W.', sellerId: 'user2', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), description: 'Some highlighting in first few chapters.', contactInfo: 'alice.w@example.com' },
  { id: 'tb4', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', course: 'CS310', price: 11000, condition: TextbookCondition.NEW, sellerName: 'You', sellerId: 'user1', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), imageUrl: 'https://picsum.photos/seed/book3/200/300', contactInfo: 'you@example.com' },
];

const MOCK_PAST_QUESTIONS_INITIAL: PastQuestionListing[] = [
  { id: 'pq1', title: 'MTH101 Final Exam Questions', courseCode: 'MTH101', university: 'University of Lagos', year: 2022, price: 500, sellerName: 'Alice W.', sellerId: 'user2', listedDate: new Date('2023-10-25T10:00:00Z'), rating: 4.5, reviewCount: 2, description: 'Complete paper with solutions.', contactInfo: 'alice.w@example.com', reviews: MOCK_REVIEWS_INITIAL },
  { id: 'pq2', title: 'PHY101 Mid-Semester Test', courseCode: 'PHY101', university: 'OAU', year: 2023, price: 300, sellerName: 'You', sellerId: 'user1', listedDate: new Date('2023-10-28T14:30:00Z'), rating: 4.5, reviewCount: 8, isSold: true, contactInfo: 'you@example.com' },
  { id: 'pq3', title: 'EEC321 Digital Signal Processing Exam', courseCode: 'EEC321', university: 'FUTA', department: 'Electrical Engineering', year: 2021, price: 400, sellerName: 'Bob B.', sellerId: 'user3', listedDate: new Date('2023-10-22T12:00:00Z'), rating: 4.7, reviewCount: 12, contactInfo: 'bob.b@example.com' },
];

const MOCK_LECTURE_NOTES_INITIAL: LectureNoteListing[] = [
  { id: 'ln1', title: 'Advanced Electromagnetism Notes', courseCode: 'EEC421', lecturerName: 'Prof. Adebayo', description: 'Comprehensive, handwritten notes covering the entire syllabus. Scanned to high-quality PDF.', price: 1500, sellerName: 'You', sellerId: 'user1', listedDate: new Date('2023-10-20T09:00:00Z'), rating: 5.0, contactInfo: 'you@example.com' },
  { id: 'ln2', title: 'Data Structures and Algorithms', courseCode: 'CSC202', lecturerName: 'Dr. Okoro', description: 'Typed notes with code examples in Python.', price: 1000, sellerName: 'Alice W.', sellerId: 'user2', listedDate: new Date('2023-10-26T15:00:00Z'), rating: 4.6, isSold: true, contactInfo: 'alice.w@example.com' },
];

const MOCK_PROJECT_MATERIALS_INITIAL: ProjectMaterialListing[] = [
  { id: 'pm1', projectTitle: 'Design and Implementation of a Student Marketplace App', fieldOfStudy: 'Computer Science', abstract: 'This project focuses on the design of a web-based marketplace for students... It utilizes a React frontend and a Node.js backend to facilitate peer-to-peer transactions.', price: 5000, sellerName: 'Bob B.', sellerId: 'user3', listedDate: new Date('2023-09-15T11:00:00Z'), tags: ['React', 'TypeScript', 'Node.js'], contactInfo: 'bob.b@example.com' },
  { id: 'pm2', projectTitle: 'The Impact of Social Media on Youth Political Participation', fieldOfStudy: 'Sociology', abstract: 'A qualitative study exploring the ways Nigerian youth engage with political content on social media platforms like Twitter and Instagram.', price: 3500, sellerName: 'You', sellerId: 'user1', listedDate: new Date('2023-08-20T16:00:00Z'), tags: ['Social Media', 'Politics', 'Qualitative Research'], contactInfo: 'you@example.com' },
];

const MOCK_DATA_GIGS_INITIAL: DataCollectionGig[] = [
  { id: 'dg1', title: 'Survey Participants Needed for Psychology Study', description: 'Seeking 50 undergraduate students to complete a 15-minute online survey about study habits.', location: 'Online Survey', compensation: '₦500 Jumia Voucher', requiredParticipants: 50, listerName: 'Alice W.', listerId: 'user2', listedDate: new Date('2023-10-29T18:00:00Z'), contactInfo: 'alice.w@example.com' },
  { id: 'dg2', title: 'Interviewees for Final Year Project on Campus Life', description: 'Looking for 10 students to conduct a short 20-minute interview about their off-campus living experiences. Must be a 300 or 400 level student.', location: 'Unilag Campus', compensation: '₦1000 Airtime', listerName: 'Bob B.', listerId: 'user3', listedDate: new Date('2023-10-27T09:30:00Z'), deadline: new Date('2023-11-10T00:00:00Z'), isClosed: false, contactInfo: 'bob.b@example.com' },
];

const MOCK_STUDY_GROUPS_INITIAL: StudyGroupListing[] = [
  { id: 'sg1', groupName: 'CS101 Midterm Cram', course: 'CS101', topic: 'Midterm Exam Prep', description: 'Intensive review sessions for the upcoming CS101 midterm. Covering all topics from week 1-7.', meetingPreference: MeetingPreference.ONLINE, contactInfo: 'Discord: CS101Cram#1234', maxSize: 10, currentSize: 3, listedBy: 'Alice W.', listedById: 'user2', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), tags: ['midterm', 'exam review', 'programming'], meetingTime: "Mon & Wed 7-9 PM", rating: 4.8 },
  { id: 'sg2', groupName: 'BIO202 Photosynthesis Experts', course: 'BIO202', topic: 'Photosynthesis Deep Dive', description: 'Weekly discussions and problem-solving focused on understanding photosynthesis mechanisms.', meetingPreference: MeetingPreference.OFFLINE, contactInfo: 'Meet at Library Room 3B', maxSize: 5, currentSize: 5, listedBy: 'Bob B.', listedById: 'user3', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), tags: ['biology', 'photosynthesis', 'problem-solving'], location: "Library Room 3B", meetingTime: "Thursdays 3 PM", rating: 5.0},
  { id: 'sg3', groupName: 'Calculus Study Buddies', course: 'MATH150', topic: 'Homework & Concepts', description: 'Casual group to work on homework problems and clarify calculus concepts together.', meetingPreference: MeetingPreference.HYBRID, contactInfo: 'GroupMe link available on request', listedBy: 'You', listedById: 'user1', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 2), tags: ['homework help', 'calculus', 'peer learning'], meetingTime: "Flexible / Online Check-ins", rating: 4.5 },
];

const MOCK_TUTORS_INITIAL: TutorListing[] = [
    { id: 'tutor1', tutorName: 'Dr. Emily Carter', tutorId: 'user4', subjects: ['Physics I & II', 'Advanced Mechanics'], courses: ['PHYS101', 'PHYS102', 'PHYS301'], overallProficiency: TutoringSubjectProficiency.EXPERT, rate: 45000, rateType: MarketplaceRateType.PER_HOUR, deliveryMethod: TutoringDeliveryMethod.ONLINE, availability: 'Mon, Wed 6-9 PM ET', bio: 'PhD in Physics with 5+ years of teaching experience. Passionate about making physics understandable.', contactInfo: 'emily.carter.tutor@example.com', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), avatarUrl: 'https://picsum.photos/seed/tutor1/100/100', schoolOfStudy: 'MIT', rating: 4.9 },
    { id: 'tutor2', tutorName: 'John Davis', tutorId: 'user5', subjects: ['Calculus I', 'Linear Algebra', 'Statistics'], courses: ['MATH150', 'MATH220', 'STAT200'], overallProficiency: TutoringSubjectProficiency.ADVANCED, rate: 30000, rateType: MarketplaceRateType.PER_HOUR, deliveryMethod: TutoringDeliveryMethod.IN_PERSON, availability: 'Tues, Thurs afternoons; Sat mornings', bio: 'Math Masters student, A+ in all listed courses. Friendly and patient.', contactInfo: 'Text (555) 123-4567', listedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), avatarUrl: 'https://picsum.photos/seed/tutor2/100/100', location: "Campus Library Study Rooms, Unilag", schoolOfStudy: "University of Lagos", rating: 4.7 },
];

const MOCK_LOST_FOUND_ITEMS_INITIAL: LostAndFoundItem[] = [
  { id: 'lf1', itemName: 'Black iPhone 12', description: 'Lost near the main library entrance. Has a small scratch on the top right corner. Lock screen is a picture of a cat.', category: LostAndFoundCategory.ELECTRONICS, status: LostAndFoundStatus.LOST, dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 48), locationLostOrFound: 'Main Library Entrance', contactInfo: 'you@example.com (Poster)', postedByUserId: 'user1', postedByUserName: 'You', postedDate: new Date(Date.now() - 1000 * 60 * 60 * 47), imageUrl: 'https://picsum.photos/seed/iphone/200/200', isResolved: false },
  { id: 'lf2', itemName: 'Found: Set of Keys', description: 'Found a set of keys on a blue lanyard in the Student Union cafeteria. Has a small Eiffel Tower keychain.', category: LostAndFoundCategory.KEYS, status: LostAndFoundStatus.FOUND, dateLostOrFound: new Date(Date.now() - 1000 * 60 * 60 * 24), locationLostOrFound: 'Student Union Cafeteria', contactInfo: 'Contact Admin Office, Ref #F102', postedByUserId: 'user2', postedByUserName: 'Alice W.', postedDate: new Date(Date.now() - 1000 * 60 * 60 * 23), isResolved: false },
];

const MOCK_PEER_REVIEW_LISTINGS_INITIAL: PeerReviewServiceListing[] = [
    { id: 'pr1', listingType: MarketplaceListingType.OFFERING, serviceType: PeerReviewServiceType.PROOFREADING, title: "Quick Proofreading for Essays (Humanities)", description: "Offering proofreading services for humanities essays up to 3000 words. Focus on grammar, spelling, and punctuation. Quick turnaround.", subjectsOrSkills: ["Essay Writing", "Humanities", "English", "History"], rate: 5000, rateType: MarketplaceRateType.PER_ITEM, turnaroundTime: "24-48 hours", contactInfo: "you@example.com", postedByUserId: "user1", postedByUserName: "You", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), rating: 5.0 },
    { id: 'pr2', listingType: MarketplaceListingType.REQUESTING, serviceType: PeerReviewServiceType.CONTENT_REVIEW, title: "Need Content Review for CS Project Report", description: "Looking for someone to review my final year project report (Computer Science) for clarity, structure, and completeness of arguments. Approx 20 pages.", subjectsOrSkills: ["Computer Science", "Technical Writing", "Software Engineering"], rateType: MarketplaceRateType.NEGOTIABLE, contactInfo: "alice.w@example.com", postedByUserId: "user2", postedByUserName: "Alice W.", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
];

const MOCK_THESIS_SUPPORT_LISTINGS_INITIAL: ThesisSupportListing[] = [
    { id: 'ts1', listingType: MarketplaceListingType.OFFERING, supportType: ThesisSupportType.DATA_ANALYSIS_INTERPRETATION, title: "SPSS & R Data Analysis for Social Sciences Thesis", description: "Experienced in quantitative data analysis using SPSS and R. Can help with study design, analysis, and interpretation of results for undergraduate or Master's theses.", fieldOfStudy: ["Sociology", "Psychology", "Political Science"], specificSkills: ["SPSS", "R", "Quantitative Analysis", "Survey Design"], rate: 15000, rateType: MarketplaceRateType.PER_HOUR, availability: "Evenings and Weekends", contactInfo: "bob.b.consult@example.com", postedByUserId: "user3", postedByUserName: "Bob B.", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), rating: 4.8 },
    { id: 'ts2', listingType: MarketplaceListingType.REQUESTING, supportType: ThesisSupportType.LITERATURE_REVIEW, title: "Help Needed: Literature Review for Biology Thesis", description: "Struggling to find and synthesize literature for my honors biology thesis on marine plastic pollution. Need guidance on search strategies and structuring the review. ", fieldOfStudy: ["Biology", "Marine Science", "Environmental Science"], rateType: MarketplaceRateType.PER_SESSION, contactInfo: "you.student@example.com", postedByUserId: "user1", postedByUserName: "You", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 3) },
];

const MOCK_CLUB_PROFILES_INITIAL: ClubProfile[] = [
  { id: 'club1', clubName: 'Tech Innovators Club', clubType: ClubType.TECHNOLOGY_INNOVATION, description: 'Exploring new tech, coding workshops, and guest speakers from the industry.', contactEmail: 'techclub@campus.edu', logoUrl: 'https://picsum.photos/seed/techclub/100/100', meetingInfo: 'Wednesdays 6 PM, Eng. Building Rm 101', membershipTiers: [{ id: 't1', name: 'Annual Member', price: 2000, duration: 'Annual', benefits: ['Full access to workshops', 'Voting rights', 'Club T-shirt'] }], listedByUserId: 'user2', listedByUserName: 'Alice W.', listedDate: new Date(Date.now() - 1000*60*60*24*7), rating: 4.6 },
  { id: 'club2', clubName: 'Campus Film Society', clubType: ClubType.ARTS_CULTURE, description: 'Weekly movie screenings, discussions, and filmmaking workshops.', contactEmail: 'filmsoc@campus.edu', logoUrl: 'https://picsum.photos/seed/filmclub/100/100', meetingInfo: 'Fridays 7 PM, Arts Hall Theatre', membershipTiers: [{id: 't2a', name: 'Semester Pass', price: 1000, duration: 'Semester', benefits: ['Free entry to all screenings', 'Workshop discounts']}, {id: 't2b', name: 'Day Pass (Non-member)', price: 200, duration: 'One-Time', benefits: ['Entry to one screening']}], listedByUserId: 'user3', listedByUserName: 'Bob B.', listedDate: new Date(Date.now() - 1000*60*60*24*3), rating: 4.8 },
];

const MOCK_EVENT_TICKETS_INITIAL: EventTicketListing[] = [
  { id: 'evt1', eventName: 'Spring Music Fest', eventType: CampusEventType.CONCERT_PERFORMANCE, eventDate: new Date(new Date().setDate(new Date().getDate() + 14)), location: 'Main Campus Green', description: 'Annual music festival featuring local bands and student performers.', sellingPrice: 1500, quantityAvailable: 50, ticketType: 'General Admission', isResale: false, sellerName: 'Student Union Board', sellerId: 'club_SUB', sellerContact: 'sub_events@campus.edu', postedDate: new Date(Date.now() - 1000*60*60*24*2), eventImageUrl: 'https://picsum.photos/seed/musicfest/300/200' },
  { id: 'evt2', eventName: 'Resale: Guest Lecture Ticket - Dr. Anya Sharma', eventType: CampusEventType.GUEST_LECTURE, eventDate: new Date(new Date().setDate(new Date().getDate() + 5)), location: 'Science Auditorium', description: 'Unable to attend. Selling one ticket to the talk by renowned astrophysicist Dr. Anya Sharma.', originalPrice: 500, sellingPrice: 400, quantityAvailable: 1, ticketType: 'Student Ticket', isResale: true, sellerName: 'You', sellerId: 'user1', sellerContact: 'you@example.com', postedDate: new Date(Date.now() - 1000*60*30), eventImageUrl: 'https://picsum.photos/seed/lecture/300/200' },
];

const MOCK_MERCHANDISE_ITEMS_INITIAL: MerchandiseItem[] = [
  { id: 'merch1', itemName: 'Official Campus Hoodie (Blue)', category: MerchandiseCategory.APPAREL, description: 'Comfortable cotton-blend hoodie with official campus logo. Available in various sizes.', price: 3500, sellerInfo: 'Campus Bookstore', images: ['https://picsum.photos/seed/hoodie1/200/200', 'https://picsum.photos/seed/hoodie2/200/200'], availableSizes: ['S', 'M', 'L', 'XL'], stockQuantity: 100, contactForPurchase: 'Visit Campus Bookstore or online store.', postedByUserId: 'dept_Bookstore', postedByUserName: 'Bookstore Admin', postedDate: new Date(Date.now() - 1000*60*60*24*10), rating: 4.5 },
  { id: 'merch2', itemName: 'Debate Club Limited Edition Mug', category: MerchandiseCategory.HOME_DECOR_DORM, description: 'Collector\'s edition mug for the Debate Club. Great for coffee or tea!', price: 1200, sellerInfo: 'Debate Club', images: ['https://picsum.photos/seed/mug1/200/200'], stockQuantity: 25, contactForPurchase: 'DM @DebateClub on CampusNet', postedByUserId: 'club_Debate', postedByUserName: 'Debate Club Admin', postedDate: new Date(Date.now() - 1000*60*60*24*1), rating: 4.9 },
];

const MOCK_CAMPUS_HUSTLES_INITIAL: CampusHustleListing[] = [
  { id: 'ch1', listingType: MarketplaceListingType.OFFERING, title: "Professional Hair Braiding", category: CampusHustleCategory.PERSONAL_CARE, description: "Expert in all types of braids (box braids, knotless, cornrows). Book me for a neat and long-lasting style. Price varies by style.", skills: ["Hair Braiding", "Knotless Braids", "Cornrows"], portfolioLink: "https://instagram.com/alice_braids", rate: 8000, rateType: MarketplaceRateType.PER_ITEM, availability: "Weekends, Weekday evenings", contactInfo: "WhatsApp: 08012345678", postedByUserId: "user2", postedByUserName: "Alice W.", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), rating: 4.9 },
  { id: 'ch2', listingType: MarketplaceListingType.OFFERING, title: "Urgent Assignment & Report Typing", category: CampusHustleCategory.ACADEMIC_GIGS, description: "Fast and accurate typing services for your assignments, reports, and projects. Formatting also available.", skills: ["Fast Typing", "MS Word", "Report Formatting"], rate: 100, rateType: MarketplaceRateType.PER_ITEM, availability: "Flexible", contactInfo: "bob.typist@example.com", postedByUserId: "user3", postedByUserName: "Bob B.", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 4) },
];

const MOCK_ASO_EBI_INITIAL: AsoEbiListing[] = [
    { id: 'ae1', eventName: 'Engineering Dinner Night', description: 'Original Aso-Ebi fabric for the upcoming dinner. Royal blue lace.', listingType: 'Fabric', price: 4500, images: ['https://picsum.photos/seed/asoebi1/200/200'], sellerId: 'user2', sellerName: 'Alice W.', postedDate: new Date(Date.now() - 1000*60*60*24*1), yards: 5, contactInfo: 'alice.w@example.com' },
    { id: 'ae2', eventName: 'Law Society Ball', description: 'Barely worn gown made from the official fabric. Size 10. Perfect condition.', listingType: 'Outfit', price: 9000, images: ['https://picsum.photos/seed/asoebi2/200/200'], sellerId: 'user3', sellerName: 'Bob B.', postedDate: new Date(Date.now() - 1000*60*60*2), size: '10', contactInfo: 'bob.b@example.com' },
];

const MOCK_RENTAL_LISTINGS_INITIAL: RentalListing[] = [
  { id: 'rl1', itemName: "DJ Controller - Pioneer DDJ-400", category: EquipmentCategory.EVENT_SUPPLIES_PARTY_RENTALS, description: "Pioneer DDJ-400 DJ controller for rent. Perfect for parties and small events. Comes with USB cable. Rekordbox compatible.", images: ["https://picsum.photos/seed/djcontroller/200/200"], rentalRate: 5000, rentalRateType: MarketplaceRateType.PER_DAY, depositRequired: 10000, availabilityInfo: "Most weekends, book in advance.", pickupLocation: "Hall 3, Room B05", contactInfo: "you@example.com", postedByUserId: "user1", postedByUserName: "You", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
  { id: 'rl2', itemName: "Professional DSLR Camera - Canon 5D Mark IV", category: EquipmentCategory.CAMERA_VIDEO_PHOTO_GEAR, description: "Canon 5D Mark IV with 24-70mm f/2.8L lens for rent. Ideal for professional photography or videography projects. Includes 2 batteries and charger.", images: ["https://picsum.photos/seed/canon5d/200/200"], rentalRate: 15000, rentalRateType: MarketplaceRateType.PER_DAY, depositRequired: 50000, availabilityInfo: "Check calendar: link.to.calendar", pickupLocation: "Photography Department Office", contactInfo: "photodept@campus.edu", postedByUserId: "dept_Photo", postedByUserName: "Photography Dept.", postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8) },
];

const MOCK_RIDE_SHARE_LISTINGS_INITIAL: RideShareListing[] = [
  { id: 'rs1', listingType: RideShareType.OFFERING_RIDE, departureLocation: 'Campus Main Gate', destinationLocation: 'Downtown City Center', departureDateTime: new Date(new Date().setDate(new Date().getDate() + 2)), availableSeats: 3, recurrence: RideRecurrence.ONE_TIME, costContribution: 2000, vehicleInfo: 'Toyota Camry, Blue', contactInfo: 'You@example.com', postedByUserId: 'user1', postedByUserName: 'You', postedDate: new Date(Date.now() - 1000 * 60 * 30), luggageSpace: 'Medium' },
  { id: 'rs2', listingType: RideShareType.REQUESTING_RIDE, departureLocation: 'Campus Library', destinationLocation: 'Airport (LOS)', departureDateTime: new Date(new Date().setDate(new Date().getDate() + 7)), passengersNeeded: 1, recurrence: RideRecurrence.ONE_TIME, contactInfo: 'alice.w@example.com', postedByUserId: 'user2', postedByUserName: 'Alice W.', postedDate: new Date(Date.now() - 1000 * 60 * 60 * 5), notes: "Need to arrive by 3 PM for flight." },
];

const MOCK_BIKE_SCOOTER_LISTINGS_INITIAL: BikeScooterListing[] = [
  { id: 'bs1', listingType: BikeScooterListingType.FOR_SALE, itemType: BikeScooterType.BICYCLE_HYBRID_COMMUTER, brandModel: 'Giant Escape 3', condition: BikeScooterCondition.GOOD, description: 'Well-maintained hybrid bike, perfect for campus commuting. Size M. Recently serviced.', price: 35000, images: ['https://picsum.photos/seed/bike1/200/200'], location: 'Student Hostel B', contactInfo: 'bob.b@example.com', postedByUserId: 'user3', postedByUserName: 'Bob B.', postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
  { id: 'bs2', listingType: BikeScooterListingType.FOR_RENT, itemType: BikeScooterType.SCOOTER_E, brandModel: 'Xiaomi M365', condition: BikeScooterCondition.LIKE_NEW, description: 'Electric scooter for daily or weekly rental. Comes with charger. Good battery life.', rentalRate: 1000, rentalRateType: MarketplaceRateType.PER_DAY, images: ['https://picsum.photos/seed/scooter1/200/200'], location: 'Tech Hub (Basement)', contactInfo: 'you@example.com', postedByUserId: 'user1', postedByUserName: 'You', postedDate: new Date(Date.now() - 1000 * 60 * 60 * 2) },
];

const MOCK_SUBLET_LISTINGS_INITIAL: SubletListing[] = [
  { id: 'sub1', title: 'Self-Contained Room near North Campus', location: '123 University Ave, Al-Ameen Hostel', rent: 250000, rentFrequency: 'per month', availableFrom: new Date('2024-06-01'), availableTo: new Date('2024-08-31'), bedrooms: 1, bathrooms: 1, furnishedStatus: FurnishedStatus.FURNISHED, description: 'Clean self-contained room in a popular off-campus hostel. Has its own kitchen and bathroom. Good security.', images: ['https://picsum.photos/seed/sublet1/400/300', 'https://picsum.photos/seed/sublet2/400/300'], amenities: ['Private Kitchen', 'Generator', 'Security Guard', 'A/C'], contactInfo: 'bob.b@example.com', postedByUserId: 'user3', postedByUserName: 'Bob B.', postedDate: new Date(Date.now() - 1000*60*60*24*6), reviews: [ { powerRating: 3, waterRating: 4, securityRating: 5, landlordRating: 4, comment: 'Great place, constant light and water.', reviewerName: 'Tunde', date: new Date() } ], isReported: false },
  { id: 'sub2', title: 'Room in a 3BR Flat (Female only)', location: '456 College Town Rd', rent: 120000, rentFrequency: 'per month', availableFrom: new Date('2024-12-01'), availableTo: new Date('2024-12-31'), bedrooms: 1, bathrooms: 1, furnishedStatus: FurnishedStatus.FURNISHED, description: 'One room available in a clean and quiet 3-bedroom flat. Looking for a female student. All utilities included.', images: ['https://picsum.photos/seed/sublet3/400/300'], amenities: ['Wifi included', 'Full Kitchen', '24/7 Power'], contactInfo: 'alice.w@example.com', postedByUserId: 'user2', postedByUserName: 'Alice W.', postedDate: new Date(Date.now() - 1000*60*60*24*1), isSold: true },
];

const MOCK_ROOMMATE_LISTINGS_INITIAL: RoommateListing[] = [
  { id: 'rm1', listingType: RoommateListingType.SEEKING_PLACE, title: 'Quiet CS student looking for a room', postedByUserId: 'user1', postedByUserName: 'You', age: 21, gender: 'Male', schoolProgram: 'Computer Science, 3rd Year', bio: 'I am a quiet and focused student looking for a room for the next academic year. I enjoy gaming and hiking in my free time.', habits: ['Quiet', 'Clean', 'Non-smoker', 'Early bird'], location: 'Within 15-min walk to campus', rent: 75000, moveInDate: new Date('2024-09-01'), leaseLength: '1 Year', lookingFor: 'Looking for other clean and respectful students. Preferably undergraduates or grad students.', contactInfo: 'you@example.com', postedDate: new Date(Date.now() - 1000*60*60*24*2), profileImageUrl: 'https://ui-avatars.com/api/?name=You&background=random&color=fff&size=100' },
  { id: 'rm2', listingType: RoommateListingType.SEEKING_ROOMMATE, title: 'One room available in 3BR house', postedByUserId: 'user3', postedByUserName: 'Bob B.', age: 22, gender: 'Male', schoolProgram: 'Business, 4th Year', bio: 'We are two friendly business students looking for a third roommate for our house. We enjoy watching sports and are pretty social on weekends.', habits: ['Social', 'Average cleanliness', 'Okay with smokers'], location: '789 Fraternity Row', rent: 65000, moveInDate: new Date('2024-08-15'), leaseLength: '1 Year', lookingFor: 'Looking for a social and easygoing roommate. Must be okay with occasional guests.', contactInfo: 'bob.b@example.com', postedDate: new Date(Date.now() - 1000*60*60*24*8), profileImageUrl: 'https://ui-avatars.com/api/?name=Bob+B&background=random&color=fff&size=100' },
];

const MOCK_FOOD_LISTINGS_INITIAL: FoodListing[] = [
  { id: 'food1', title: 'Homemade Jollof Rice (Large Portion)', description: 'Delicious party-style jollof rice with chicken. Made it for a party and have extra!', category: FoodCategory.HOMEMADE_MEAL, price: 1500, portionsAvailable: 4, dietaryInfo: [DietaryInfo.HALAL], pickupDetails: 'Pickup from Hall C Lobby, 6-8 PM tonight.', images: ['https://picsum.photos/seed/jollof/200/200'], postedByUserId: 'user2', postedByUserName: 'Alice W.', postedDate: new Date(Date.now() - 1000*60*60*3), contactInfo: 'alice.w@example.com' },
  { id: 'food2', title: '2 Meal Swipes for Trade', description: 'I have 2 extra meal swipes for this week. Looking to trade for cash or snacks.', category: FoodCategory.MEAL_SWIPE_EXCHANGE, swipeEquivalent: 2, price: 1000, portionsAvailable: 1, pickupDetails: 'Meet at Main Cafeteria entrance.', postedByUserId: 'user3', postedByUserName: 'Bob B.', postedDate: new Date(Date.now() - 1000*60*60*24*1), contactInfo: 'bob.b@example.com' },
];

const MOCK_SECOND_HAND_GOODS_INITIAL: SecondHandGood[] = [
  { id: 'shg1', itemName: 'Mini Fridge - Perfect for Dorms', description: 'Used for one year, works perfectly. A few minor scratches on the side. Cleaned and ready to go.', category: SecondHandCategory.ELECTRONICS, condition: TextbookCondition.GOOD, price: 12000, images: ['https://picsum.photos/seed/fridge/200/200'], location: 'Hall A, Room 201', postedByUserId: 'user1', postedByUserName: 'You', postedDate: new Date(Date.now() - 1000*60*60*24*5), contactInfo: 'you@example.com' },
  { id: 'shg2', itemName: 'Barely Used IKEA Desk', description: 'LAGKAPTEN / ADILS desk, white, 120x60 cm. Like new, no scratches. Assembled but can be disassembled for pickup.', category: SecondHandCategory.FURNITURE, condition: TextbookCondition.LIKE_NEW, price: 8000, images: ['https://picsum.photos/seed/desk/200/200'], location: 'Off-campus, 5-min walk from main gate', postedByUserId: 'user2', postedByUserName: 'Alice W.', postedDate: new Date(Date.now() - 1000*60*60*24*2), contactInfo: 'alice.w@example.com' },
];

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'academic' | 'studentLife'>('academic');
  const [activeSubFeature, setActiveSubFeature] = useState<{ sectionId: string; featureId: string } | null>(null);
  
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => ({
    'tutor1': true, 'merch2': true, 'sg1': true, 'pr1': true, 'club2': true, 'bs2': true, 'rl2': true, 'sub1': true, 'rm2': true, 'food1': true, 'shg2': true,
  }));
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string, icon: string } | null>(null);
  
  const [previewingItem, setPreviewingItem] = useState<{item: any; itemType: string} | null>(null);
  const [reportingItem, setReportingItem] = useState<{item: any; itemType: string} | null>(null);


  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }
  }, [toast]);


  const toggleFavorite = (itemId: string) => setFavorites(prev => ({ ...prev, [itemId]: !prev[itemId] }));

  const handleMessageSeller = (item: { contactInfo?: string, sellerContact?: string, contactForPurchase?: string, title?: string, eventName?: string, itemName?: string }) => {
    const contact = item.contactInfo || item.sellerContact || item.contactForPurchase || 'No contact info provided.';
    const itemTitle = item.title || item.eventName || item.itemName || 'this item';
    alert(`To contact the seller for "${itemTitle}", please use the following information: ${contact}`);
  };

  const handleShare = async (item: { id: string, title?: string, eventName?: string, itemName?: string, description?: string }) => {
    const itemTitle = item.title || item.eventName || item.itemName || 'Check out this item!';
    const itemDescription = item.description || `Found something interesting on the Student Marketplace.`;
    const shareUrl = `${window.location.href.split('?')[0]}?itemId=${item.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: itemTitle,
          text: itemDescription,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`Check out "${itemTitle}" on the Student Marketplace: ${shareUrl}`);
        setToast({message: 'Link copied to clipboard!', icon: '🔗'});
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link to clipboard.');
      }
    }
  };
  
  const handleSetAlert = (itemId: string) => {
    const isAlertCurrentlySet = !!alerts[itemId];
    setAlerts(prev => ({ ...prev, [itemId]: !isAlertCurrentlySet }));
    setToast({ message: isAlertCurrentlySet ? 'Alert removed for this item.' : 'Alert set! You will be notified of updates.', icon: '🔔' });
  };

  // State for all listings
  const [textbookListings, setTextbookListings] = useState<TextbookListing[]>(MOCK_TEXTBOOKS_INITIAL);
  const [studyGroupListings, setStudyGroupListings] = useState<StudyGroupListing[]>(MOCK_STUDY_GROUPS_INITIAL);
  const [tutorListings, setTutorListings] = useState<TutorListing[]>(MOCK_TUTORS_INITIAL);
  const [lostAndFoundItems, setLostAndFoundItems] = useState<LostAndFoundItem[]>(MOCK_LOST_FOUND_ITEMS_INITIAL);
  const [peerReviewListings, setPeerReviewListings] = useState<PeerReviewServiceListing[]>(MOCK_PEER_REVIEW_LISTINGS_INITIAL);
  const [thesisSupportListings, setThesisSupportListings] = useState<ThesisSupportListing[]>(MOCK_THESIS_SUPPORT_LISTINGS_INITIAL);
  const [clubProfiles, setClubProfiles] = useState<ClubProfile[]>(MOCK_CLUB_PROFILES_INITIAL);
  const [eventTicketListings, setEventTicketListings] = useState<EventTicketListing[]>(MOCK_EVENT_TICKETS_INITIAL);
  const [merchandiseItems, setMerchandiseItems] = useState<MerchandiseItem[]>(MOCK_MERCHANDISE_ITEMS_INITIAL);
  const [campusHustleListings, setCampusHustleListings] = useState<CampusHustleListing[]>(MOCK_CAMPUS_HUSTLES_INITIAL);
  const [rentalListings, setRentalListings] = useState<RentalListing[]>(MOCK_RENTAL_LISTINGS_INITIAL);
  const [rideShareListings, setRideShareListings] = useState<RideShareListing[]>(MOCK_RIDE_SHARE_LISTINGS_INITIAL);
  const [bikeScooterListings, setBikeScooterListings] = useState<BikeScooterListing[]>(MOCK_BIKE_SCOOTER_LISTINGS_INITIAL);
  const [subletListings, setSubletListings] = useState<SubletListing[]>(MOCK_SUBLET_LISTINGS_INITIAL);
  const [roommateListings, setRoommateListings] = useState<RoommateListing[]>(MOCK_ROOMMATE_LISTINGS_INITIAL);
  const [foodListings, setFoodListings] = useState<FoodListing[]>(MOCK_FOOD_LISTINGS_INITIAL);
  const [secondHandGoods, setSecondHandGoods] = useState<SecondHandGood[]>(MOCK_SECOND_HAND_GOODS_INITIAL);
  const [pastQuestions, setPastQuestions] = useState<PastQuestionListing[]>(MOCK_PAST_QUESTIONS_INITIAL);
  const [lectureNotes, setLectureNotes] = useState<LectureNoteListing[]>(MOCK_LECTURE_NOTES_INITIAL);
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterialListing[]>(MOCK_PROJECT_MATERIALS_INITIAL);
  const [dataGigs, setDataGigs] = useState<DataCollectionGig[]>(MOCK_DATA_GIGS_INITIAL);
  const [asoEbiListings, setAsoEbiListings] = useState<AsoEbiListing[]>(MOCK_ASO_EBI_INITIAL);

  // Modal states
  const [isListTextbookModalOpen, setIsListTextbookModalOpen] = useState(false);
  const [isListStudyGroupModalOpen, setIsListStudyGroupModalOpen] = useState(false);
  const [isListTutorModalOpen, setIsListTutorModalOpen] = useState(false);
  const [isListLostFoundItemModalOpen, setIsListLostFoundItemModalOpen] = useState(false);
  const [isListPeerReviewModalOpen, setIsListPeerReviewModalOpen] = useState(false);
  const [isListThesisSupportModalOpen, setIsListThesisSupportModalOpen] = useState(false);
  const [isListClubProfileModalOpen, setIsListClubProfileModalOpen] = useState(false);
  const [isListEventTicketModalOpen, setIsListEventTicketModalOpen] = useState(false);
  const [isListMerchandiseModalOpen, setIsListMerchandiseModalOpen] = useState(false);
  const [isListCampusHustleModalOpen, setIsListCampusHustleModalOpen] = useState(false);
  const [isListRentalItemModalOpen, setIsListRentalItemModalOpen] = useState(false);
  const [isListRideShareModalOpen, setIsListRideShareModalOpen] = useState(false);
  const [isListBikeScooterModalOpen, setIsListBikeScooterModalOpen] = useState(false);
  const [isListSubletModalOpen, setIsListSubletModalOpen] = useState(false);
  const [isListRoommateModalOpen, setIsListRoommateModalOpen] = useState(false);
  const [isListFoodModalOpen, setIsListFoodModalOpen] = useState(false);
  const [isListSecondHandGoodModalOpen, setIsListSecondHandGoodModalOpen] = useState(false);
  const [isListPqModalOpen, setIsListPqModalOpen] = useState(false);
  const [isListLectureNoteModalOpen, setIsListLectureNoteModalOpen] = useState(false);
  const [isListProjectMaterialModalOpen, setIsListProjectMaterialModalOpen] = useState(false);
  const [isListDataCollectionGigModalOpen, setIsListDataCollectionGigModalOpen] = useState(false);
  const [isListAsoEbiModalOpen, setIsListAsoEbiModalOpen] = useState(false);

  // Filter States
  const [pqFilters, setPqFilters] = useState({ courseCode: '', university: '', year: '' });
  const [tbFilters, setTbFilters] = useState({ title: '', author: '', course: '', isbn: '' });
  const [lnFilters, setLnFilters] = useState({ courseCode: '', lecturerName: '' });
  const [pmFilters, setPmFilters] = useState({ fieldOfStudy: '', tags: '' });
  const [dgFilters, setDgFilters] = useState({ location: '', compensation: '' });

  // Community Feature Handlers
  const handleOpenPreview = (item: any, itemType: string) => setPreviewingItem({ item, itemType });
  const handleOpenReport = (item: any, itemType: string) => setReportingItem({ item, itemType });
  
  const updateListing = (listingId: string, itemType: string, updateFn: (item: any) => any) => {
    const stateSetters: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
        pastQuestion: setPastQuestions,
        textbook: setTextbookListings,
        lectureNote: setLectureNotes,
        projectMaterial: setProjectMaterials,
        dataGig: setDataGigs,
        studyGroup: setStudyGroupListings,
        tutor: setTutorListings,
        lostAndFound: setLostAndFoundItems,
        peerReview: setPeerReviewListings,
        thesisSupport: setThesisSupportListings,
        clubProfile: setClubProfiles,
        eventTicket: setEventTicketListings,
        merchandise: setMerchandiseItems,
        campusHustle: setCampusHustleListings,
        rental: setRentalListings,
        rideShare: setRideShareListings,
        bikeScooter: setBikeScooterListings,
        sublet: setSubletListings,
        roommate: setRoommateListings,
        food: setFoodListings,
        secondHand: setSecondHandGoods,
        asoEbi: setAsoEbiListings,
    };

    const setter = stateSetters[itemType];
    if (setter) {
        setter(prev => prev.map(item => (item.id === listingId ? updateFn(item) : item)));
    }
  };

  const handleAddReview = (listingId: string, itemType: string, rating: number, comment: string) => {
    const newReview: Omit<MarketplaceReview, 'id'|'listingId'> = {
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerAvatar: currentUser.avatarUrl,
        rating,
        comment,
        date: new Date(),
    };

    updateListing(listingId, itemType, (item) => {
        const reviews = [...(item.reviews || []), { ...newReview, id: uuidv4(), listingId }];
        const newRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const newReviewCount = reviews.length;
        return { ...item, reviews, rating: newRating, reviewCount: newReviewCount };
    });

    setToast({ message: 'Your review has been submitted!', icon: '⭐' });
    setPreviewingItem(null);
  };
  
  const handleReportSubmit = (listingId: string, itemType: string, reason: ReportReason, comment: string) => {
     updateListing(listingId, itemType, (item) => ({ ...item, isReported: true }));
     // In a real app, you would send the report to a backend.
     setReportingItem(null); // close modal
     setToast({ message: 'Thank you. The listing has been reported for review.', icon: '🚩' });
  };


const academicSections: Section[] = [
    { id: 'learningMaterials', title: 'Study Materials & PQs', features: [
        { id: 'pastQuestions', title: 'Past Questions Bank', description: 'Access exam papers from previous years.', icon: DocumentMagnifyingGlassIcon, action: () => setIsListPqModalOpen(true) },
        { id: 'textbooks', title: 'Textbook Exchange', description: "Buy & sell course textbooks.", icon: BookOpenIcon, action: () => setIsListTextbookModalOpen(true) },
        { id: 'lectureNotes', title: 'Lecture Note Exchange', description: "Share and find helpful lecture notes.", icon: ClipboardDocumentListIcon, action: () => setIsListLectureNoteModalOpen(true) },
    ]},
    { id: 'academicSupport', title: 'Academic & Skill Support', features: [
        { id: 'tutoring', title: 'Tutoring Marketplace', description: "Find a tutor or offer your skills.", icon: AcademicCapIcon, action: () => setIsListTutorModalOpen(true) },
        { id: 'studyGroups', title: 'Find Study Groups', description: "Join groups for specific courses.", icon: UsersIcon, action: () => setIsListStudyGroupModalOpen(true) },
        { id: 'peerReview', title: 'Peer Review & Editing', description: "Get feedback on your essays and reports.", icon: PencilSquareIcon, action: () => setIsListPeerReviewModalOpen(true) },
    ]},
    { id: 'fypHub', title: 'Final Year Project Hub', features: [
        { id: 'thesisSupport', title: 'Project & Thesis Support', description: "Get help with your final year projects.", icon: LightBulbIcon, action: () => setIsListThesisSupportModalOpen(true) },
        { id: 'projectMaterials', title: 'Project Materials (for reference)', description: "Find reference materials for your projects.", icon: ArchiveBoxIcon, action: () => setIsListProjectMaterialModalOpen(true) },
        { id: 'dataCollection', title: 'Data Collection & Analysis Gigs', description: "Participate in surveys for cash or find help.", icon: BanknotesIcon, action: () => setIsListDataCollectionGigModalOpen(true) },
    ]}
];

const studentLifeSections: Section[] = [
    { id: 'gigsAndHustles', title: 'Gigs & Hustles', features: [
        { id: 'campusHustles', title: 'Campus Services & Skills', description: "Find or offer services like hair, baking.", icon: SparklesIcon, action: () => setIsListCampusHustleModalOpen(true) },
        { id: 'equipmentRental', title: 'Equipment Rental/Sharing', description: "Rent items like cameras, speakers.", icon: ShareIcon, action: () => setIsListRentalItemModalOpen(true) },
    ]},
    { id: 'eventsAndSocials', title: 'Events & Socials', features: [
        { id: 'eventTickets', title: 'Campus Events & Tickets', description: "Buy or sell tickets for campus events.", icon: TicketIcon, action: () => setIsListEventTicketModalOpen(true) },
        { id: 'clubs', title: 'Club & Association Hub', description: "Discover and join campus clubs.", icon: UsersIcon, action: () => setIsListClubProfileModalOpen(true) },
        { id: 'asoEbi', title: 'Aso-Ebi & Event Wear', description: "Buy/sell fabrics for campus dinners.", icon: SwatchIcon, action: () => setIsListAsoEbiModalOpen(true) },
    ]},
    { id: 'campusEssentials', title: 'Campus Essentials', features: [
        { id: 'food', title: 'Food & Meal Swipe Exchange', description: "Sell homemade food or trade meal swipes.", icon: CakeIcon, action: () => setIsListFoodModalOpen(true) },
        { id: 'secondHandGoods', title: 'Second-Hand Goods', description: "Buy/sell used items like electronics.", icon: ShoppingBagIcon, action: () => setIsListSecondHandGoodModalOpen(true) },
        { id: 'lostAndFound', title: 'Lost & Found', description: "Report lost or found items.", icon: DocumentMagnifyingGlassIcon, action: () => setIsListLostFoundItemModalOpen(true) },
    ]},
    { id: 'movingAndLiving', title: 'Moving & Living', features: [
         { id: 'accommodation', title: 'Off-Campus Accommodation & Reviews', description: "Find off-campus housing and sublets.", icon: HomeModernIcon, action: () => setIsListSubletModalOpen(true) },
         { id: 'roommates', title: 'Find Roommates', description: "Connect with potential roommates.", icon: UserPlusIcon, action: () => setIsListRoommateModalOpen(true) },
         { id: 'rideShare', title: 'Campus Ride-Share', description: "Offer or request rides.", icon: TruckIcon, action: () => setIsListRideShareModalOpen(true) },
         { id: 'bikeScooter', title: 'Bike & Scooter Exchange', description: "Buy, sell, or rent bikes/scooters.", icon: ArrowPathIcon, action: () => setIsListBikeScooterModalOpen(true) },
    ]}
];

  useEffect(() => { if (activeSubFeature) { const currentSectionSource = activeTab === 'academic' ? academicSections : studentLifeSections; const currentSection = currentSectionSource.find(s => s.features.some(f => f.id === activeSubFeature.featureId)); if (!currentSection) { setActiveSubFeature(null); } } }, [activeTab, activeSubFeature]);

  // Listing Handlers
  const handleListTextbook = (data: Omit<TextbookListing, 'id'|'sellerName'|'sellerId'|'listedDate'>) => { setTextbookListings(p => [{...data, id: `tb-${Date.now()}`, sellerName: currentUser.name, sellerId: currentUser.id, listedDate: new Date()},...p]); setIsListTextbookModalOpen(false);};
  const handleListPastQuestion = (data: Omit<PastQuestionListing, 'id'|'sellerName'|'sellerId'|'listedDate'>) => { setPastQuestions(p => [{...data, id: `pq-${Date.now()}`, sellerName: currentUser.name, sellerId: currentUser.id, listedDate: new Date()},...p]); setIsListPqModalOpen(false);};
  const handleListLectureNote = (data: Omit<LectureNoteListing, 'id'|'sellerName'|'sellerId'|'listedDate'>) => { setLectureNotes(p => [{...data, id: `ln-${Date.now()}`, sellerName: currentUser.name, sellerId: currentUser.id, listedDate: new Date()},...p]); setIsListLectureNoteModalOpen(false);};
  const handleListProjectMaterial = (data: Omit<ProjectMaterialListing, 'id'|'sellerName'|'sellerId'|'listedDate'>) => { setProjectMaterials(p => [{...data, id: `pm-${Date.now()}`, sellerName: currentUser.name, sellerId: currentUser.id, listedDate: new Date()},...p]); setIsListProjectMaterialModalOpen(false);};
  const handleListDataCollectionGig = (data: Omit<DataCollectionGig, 'id'|'listerName'|'listerId'|'listedDate'>) => { setDataGigs(p => [{...data, id: `dg-${Date.now()}`, listerName: currentUser.name, listerId: currentUser.id, listedDate: new Date()},...p]); setIsListDataCollectionGigModalOpen(false);};
  const handleListStudyGroup = (data: Omit<StudyGroupListing, 'id'|'listedBy'|'listedById'|'listedDate'>) => { setStudyGroupListings(p => [{...data, id: `sg-${Date.now()}`, listedBy: currentUser.name, listedById: currentUser.id, listedDate: new Date()},...p]); setIsListStudyGroupModalOpen(false);};
  const handleListTutor = (data: Omit<TutorListing, 'id'|'tutorName'|'tutorId'|'listedDate'|'avatarUrl'>) => { setTutorListings(p => [{...data, id: `tutor-${Date.now()}`, tutorName: currentUser.name, tutorId: currentUser.id, listedDate: new Date(), avatarUrl: currentUser.avatarUrl},...p]); setIsListTutorModalOpen(false);};
  const handleListLostFoundItem = (data: Omit<LostAndFoundItem, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'|'isResolved'>) => { setLostAndFoundItems(p => [{...data, id: `lf-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date(), isResolved: false},...p]); setIsListLostFoundItemModalOpen(false);};
  const handleListPeerReview = (data: Omit<PeerReviewServiceListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setPeerReviewListings(p => [{...data, id: `pr-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListPeerReviewModalOpen(false);};
  const handleListThesisSupport = (data: Omit<ThesisSupportListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setThesisSupportListings(p => [{...data, id: `ts-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListThesisSupportModalOpen(false);};
  const handleListClubProfile = (data: Omit<ClubProfile, 'id'|'listedByUserId'|'listedByUserName'|'listedDate'>) => { setClubProfiles(p => [{...data, id: `club-${Date.now()}`, listedByUserId: currentUser.id, listedByUserName: currentUser.name, listedDate: new Date()},...p]); setIsListClubProfileModalOpen(false);};
  const handleListEventTicket = (data: Omit<EventTicketListing, 'id'|'sellerName'|'sellerId'|'postedDate'>) => { setEventTicketListings(p => [{...data, id: `evt-${Date.now()}`, sellerName: currentUser.name, sellerId: currentUser.id, postedDate: new Date()},...p]); setIsListEventTicketModalOpen(false);};
  const handleListMerchandiseItem = (data: Omit<MerchandiseItem, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setMerchandiseItems(p => [{...data, id: `merch-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListMerchandiseModalOpen(false);};
  const handleListCampusHustle = (data: Omit<CampusHustleListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setCampusHustleListings(p => [{...data, id: `fl-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListCampusHustleModalOpen(false);};
  const handleListAsoEbi = (data: Omit<AsoEbiListing, 'id'|'sellerId'|'sellerName'|'postedDate'>) => { setAsoEbiListings(p => [{...data, id: `ae-${Date.now()}`, sellerId: currentUser.id, sellerName: currentUser.name, postedDate: new Date()},...p]); setIsListAsoEbiModalOpen(false);};
  const handleListRentalItem = (data: Omit<RentalListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setRentalListings(p => [{...data, id: `rl-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListRentalItemModalOpen(false);};
  const handleListRideShare = (data: Omit<RideShareListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setRideShareListings(p => [{...data, id: `rs-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListRideShareModalOpen(false);};
  const handleListBikeScooter = (data: Omit<BikeScooterListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setBikeScooterListings(p => [{...data, id: `bs-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListBikeScooterModalOpen(false);};
  const handleListSublet = (data: Omit<SubletListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setSubletListings(p => [{...data, id: `sublet-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListSubletModalOpen(false);};
  const handleListRoommate = (data: Omit<RoommateListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setRoommateListings(p => [{...data, id: `rm-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListRoommateModalOpen(false);};
  const handleListFood = (data: Omit<FoodListing, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setFoodListings(p => [{...data, id: `food-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListFoodModalOpen(false);};
  const handleListSecondHandGood = (data: Omit<SecondHandGood, 'id'|'postedByUserId'|'postedByUserName'|'postedDate'>) => { setSecondHandGoods(p => [{...data, id: `shg-${Date.now()}`, postedByUserId: currentUser.id, postedByUserName: currentUser.name, postedDate: new Date()},...p]); setIsListSecondHandGoodModalOpen(false);};

  const handleBackToMain = () => setActiveSubFeature(null);

  const ActionBar = ({ item, itemType, onMessage, onShare, onSetAlert, isAlertSet, onReport }: any) => {
    const contactInfo = item.contactInfo || item.sellerContact || item.contactForPurchase || item.listedBy;
    return (
      <div className="flex items-center justify-around mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
        <button onClick={() => onMessage(item)} className="flex items-center text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/80" disabled={!contactInfo}>
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mr-1" /> Message
        </button>
        <button onClick={() => onShare(item)} className="flex items-center text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/80">
          <ShareIcon className="w-4 h-4 mr-1" /> Share
        </button>
        <button onClick={() => onSetAlert(item.id)} className={`flex items-center text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/80 ${isAlertSet ? 'text-blue-500' : ''}`}>
          {isAlertSet ? <BellAlertIconSolid className="w-4 h-4 mr-1" /> : <BellAlertIcon className="w-4 h-4 mr-1" />}
          {isAlertSet ? 'Alert Set' : 'Notify Me'}
        </button>
         <button onClick={() => onReport(item, itemType)} className="flex items-center text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/80">
          <FlagIcon className="w-4 h-4 mr-1" /> Report
        </button>
      </div>
    );
  };


  const renderActiveSubFeature = () => {
    if (!activeSubFeature) return null;
    const { featureId } = activeSubFeature;
    const feature = [...academicSections, ...studentLifeSections].flatMap(s => s.features).find(f => f.id === featureId);
    if (!feature) return null;

    let content = <p className="text-center text-gray-500 dark:text-gray-400 mt-8">This section is under construction.</p>;
    let filterUI = null;
    
    switch (featureId) {
        case 'pastQuestions': {
            const filteredItems = pastQuestions.filter(item => 
                (item.isReported !== true) &&
                (!pqFilters.courseCode || item.courseCode.toLowerCase().includes(pqFilters.courseCode.toLowerCase())) &&
                (!pqFilters.university || item.university?.toLowerCase().includes(pqFilters.university.toLowerCase())) &&
                (!pqFilters.year || item.year.toString() === pqFilters.year)
            );

            filterUI = (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-grow w-full md:w-auto">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={pqFilters.courseCode} onChange={(e) => setPqFilters({...pqFilters, courseCode: e.target.value})} placeholder="Filter by Course Code (e.g., MTH101)" className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                    <input value={pqFilters.university} onChange={(e) => setPqFilters({...pqFilters, university: e.target.value})} placeholder="Filter by University" className="w-full md:w-1/4 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    <input type="number" value={pqFilters.year} onChange={(e) => setPqFilters({...pqFilters, year: e.target.value})} placeholder="Filter by Year" className="w-full md:w-1/6 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    <button onClick={() => setPqFilters({ courseCode: '', university: '', year: ''})} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><XMarkIcon className="w-5 h-5"/></button>
                </div>
            );

            content = (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex flex-col group transition-shadow hover:shadow-lg">
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex-1 pr-2">{item.title}</h4>
                                    <button onClick={() => toggleFavorite(item.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                                        {favorites[item.id] ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.courseCode} - {item.year}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{item.university}</p>
                                <div className="flex items-center text-xs mt-2">
                                    <StarIconSolid className="w-4 h-4 text-yellow-500 mr-1" />
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.rating?.toFixed(1) || 'New'}</span>
                                    <span className="text-gray-500 ml-1">({item.reviews?.length || 0} reviews)</span>
                                </div>
                            </div>
                            <div className="mt-auto pt-2">
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₦{item.price}</span>
                                    <button onClick={() => handleOpenPreview(item, 'pastQuestion')} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60">Preview</button>
                                </div>
                                <ActionBar item={item} itemType="pastQuestion" onMessage={handleMessageSeller} onShare={handleShare} onSetAlert={handleSetAlert} isAlertSet={!!alerts[item.id]} onReport={handleOpenReport} />
                            </div>
                        </div>
                    ))}
                     {filteredItems.length === 0 && <p className="text-center col-span-full text-gray-500 dark:text-gray-400 mt-8">No past questions match your filters.</p>}
                </div>
            );
            break;
        }
        case 'textbooks': {
            const filteredItems = textbookListings.filter(item => 
                (item.isReported !== true) &&
                (!tbFilters.title || item.title.toLowerCase().includes(tbFilters.title.toLowerCase())) &&
                (!tbFilters.author || item.author.toLowerCase().includes(tbFilters.author.toLowerCase())) &&
                (!tbFilters.course || item.course?.toLowerCase().includes(tbFilters.course.toLowerCase())) &&
                (!tbFilters.isbn || item.isbn?.replace(/-/g, '').includes(tbFilters.isbn.replace(/-/g, '')))
            );
            
            filterUI = (
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border border-gray-200 dark:border-gray-700">
                    <div className="lg:col-span-2">
                        <label className="text-xs text-gray-500">Title</label>
                        <input value={tbFilters.title} onChange={(e) => setTbFilters({...tbFilters, title: e.target.value})} placeholder="Filter by Title" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                    <div>
                         <label className="text-xs text-gray-500">Author</label>
                        <input value={tbFilters.author} onChange={(e) => setTbFilters({...tbFilters, author: e.target.value})} placeholder="Author" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Course/ISBN</label>
                        <input value={tbFilters.course} onChange={(e) => setTbFilters({...tbFilters, course: e.target.value})} placeholder="Course Code" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                    </div>
                    <button onClick={() => setTbFilters({ title: '', author: '', course: '', isbn: ''})} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><XMarkIcon className="w-5 h-5"/></button>
                </div>
            );

            content = (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                         <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 flex flex-col group transition-shadow hover:shadow-lg">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-md mb-3" />
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex-1 pr-2">{item.title}</h4>
                                    <button onClick={() => toggleFavorite(item.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                                        {favorites[item.id] ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">by {item.author}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
                                    item.condition === TextbookCondition.NEW ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    item.condition === TextbookCondition.LIKE_NEW ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>{item.condition}</span>
                            </div>
                            <div className="mt-auto pt-2">
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₦{item.price}</span>
                                    <button onClick={() => handleOpenPreview(item, 'textbook')} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60">Preview</button>
                                </div>
                                <ActionBar item={item} itemType="textbook" onMessage={handleMessageSeller} onShare={handleShare} onSetAlert={handleSetAlert} isAlertSet={!!alerts[item.id]} onReport={handleOpenReport} />
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && <p className="text-center col-span-full text-gray-500 dark:text-gray-400 mt-8">No textbooks match your filters.</p>}
                </div>
            );
            break;
        }
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <button onClick={handleBackToMain} className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowUturnLeftIcon className="w-5 h-5 mr-1.5" />
            Back to Marketplace
          </button>
          {feature.action && (
            <button onClick={feature.action} className="flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-orange-600 transition-colors">
                 <PlusCircleIcon className="w-5 h-5 mr-2" />
                 List New {feature.title.replace(/s$/, '').replace(/ Bank$/, '')}
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <feature.icon className="w-7 h-7 mr-3 text-orange-500"/>
                {feature.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{feature.description}</p>
            {filterUI}
            {content}
        </div>
      </div>
    );
  };
    
    return (
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 max-h-screen">
          {toast && (
             <div className="animate-fade-in-out absolute top-20 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-[100]">
                <span className="text-xl mr-2">{toast.icon}</span>
                <span className="text-sm font-semibold">{toast.message}</span>
            </div>
          )}
          <ListTextbookModal isOpen={isListTextbookModalOpen} onClose={() => setIsListTextbookModalOpen(false)} onSubmit={handleListTextbook} />
          <ListPastQuestionModal isOpen={isListPqModalOpen} onClose={() => setIsListPqModalOpen(false)} onSubmit={handleListPastQuestion} />
          <ListLectureNoteModal isOpen={isListLectureNoteModalOpen} onClose={() => setIsListLectureNoteModalOpen(false)} onSubmit={handleListLectureNote} />
          <ListProjectMaterialModal isOpen={isListProjectMaterialModalOpen} onClose={() => setIsListProjectMaterialModalOpen(false)} onSubmit={handleListProjectMaterial} />
          <ListDataCollectionGigModal isOpen={isListDataCollectionGigModalOpen} onClose={() => setIsListDataCollectionGigModalOpen(false)} onSubmit={handleListDataCollectionGig} />
          <ListStudyGroupModal isOpen={isListStudyGroupModalOpen} onClose={() => setIsListStudyGroupModalOpen(false)} onSubmit={handleListStudyGroup} />
          <ListTutorModal isOpen={isListTutorModalOpen} onClose={() => setIsListTutorModalOpen(false)} onSubmit={handleListTutor} />
          <ListLostAndFoundItemModal isOpen={isListLostFoundItemModalOpen} onClose={() => setIsListLostFoundItemModalOpen(false)} onSubmit={handleListLostFoundItem} />
          <ListPeerReviewModal isOpen={isListPeerReviewModalOpen} onClose={() => setIsListPeerReviewModalOpen(false)} onSubmit={handleListPeerReview} />
          <ListThesisSupportModal isOpen={isListThesisSupportModalOpen} onClose={() => setIsListThesisSupportModalOpen(false)} onSubmit={handleListThesisSupport} />
          <ListClubProfileModal isOpen={isListClubProfileModalOpen} onClose={() => setIsListClubProfileModalOpen(false)} onSubmit={handleListClubProfile} />
          <ListEventTicketModal isOpen={isListEventTicketModalOpen} onClose={() => setIsListEventTicketModalOpen(false)} onSubmit={handleListEventTicket} />
          <ListMerchandiseItemModal isOpen={isListMerchandiseModalOpen} onClose={() => setIsListMerchandiseModalOpen(false)} onSubmit={handleListMerchandiseItem} />
          <ListCampusHustleModal isOpen={isListCampusHustleModalOpen} onClose={() => setIsListCampusHustleModalOpen(false)} onSubmit={handleListCampusHustle} />
          <ListAsoEbiModal isOpen={isListAsoEbiModalOpen} onClose={() => setIsListAsoEbiModalOpen(false)} onSubmit={handleListAsoEbi} />
          <ListRentalItemModal isOpen={isListRentalItemModalOpen} onClose={() => setIsListRentalItemModalOpen(false)} onSubmit={handleListRentalItem} />
          <ListRideShareModal isOpen={isListRideShareModalOpen} onClose={() => setIsListRideShareModalOpen(false)} onSubmit={handleListRideShare} />
          <ListBikeScooterModal isOpen={isListBikeScooterModalOpen} onClose={() => setIsListBikeScooterModalOpen(false)} onSubmit={handleListBikeScooter} />
          <ListSubletModal isOpen={isListSubletModalOpen} onClose={() => setIsListSubletModalOpen(false)} onSubmit={handleListSublet} />
          <ListRoommateModal isOpen={isListRoommateModalOpen} onClose={() => setIsListRoommateModalOpen(false)} onSubmit={handleListRoommate} />
          <ListFoodModal isOpen={isListFoodModalOpen} onClose={() => setIsListFoodModalOpen(false)} onSubmit={handleListFood} />
          <ListSecondHandGoodModal isOpen={isListSecondHandGoodModalOpen} onClose={() => setIsListSecondHandGoodModalOpen(false)} onSubmit={handleListSecondHandGood} />

          <ListingPreviewModal isOpen={!!previewingItem} onClose={() => setPreviewingItem(null)} itemData={previewingItem} onAddReview={handleAddReview} currentUser={currentUser} />
          <ReportListingModal isOpen={!!reportingItem} onClose={() => setReportingItem(null)} itemData={reportingItem} onSubmit={handleReportSubmit} />
          
          <div className="flex items-center h-16 p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
            <BuildingStorefrontIcon className="w-8 h-8 mr-3 text-orange-500" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Marketplace</h1>
          </div>
    
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeSubFeature ? (
              renderActiveSubFeature()
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex border-b border-gray-300 dark:border-gray-700">
                    <button onClick={() => setActiveTab('academic')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'academic' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Academic Marketplace</button>
                    <button onClick={() => setActiveTab('studentLife')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'studentLife' ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Student Life & Hustles</button>
                  </div>
                </div>
    
                <div className="space-y-8">
                  {(activeTab === 'academic' ? academicSections : studentLifeSections).map(section => (
                    <section key={section.id}>
                      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{section.title}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.features.map(feature => (
                          <button key={feature.id} onClick={() => setActiveSubFeature({ sectionId: section.id, featureId: feature.id })} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-left hover:shadow-lg hover:scale-105 transition-transform duration-200 group">
                            <feature.icon className="w-8 h-8 mb-3 text-orange-500 group-hover:text-orange-400 transition-colors" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
};
