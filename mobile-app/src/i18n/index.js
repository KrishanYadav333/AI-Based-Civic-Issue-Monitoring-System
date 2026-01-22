import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      appName: 'Civic Issue Monitor',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      
      // Auth
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      loginError: 'Login failed. Please check your credentials.',
      
      // Dashboard
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      totalIssues: 'Total Issues',
      pendingIssues: 'Pending Issues',
      resolvedIssues: 'Resolved Issues',
      highPriority: 'High Priority',
      
      // Issues
      issues: 'Issues',
      newIssue: 'New Issue',
      captureIssue: 'Capture Issue',
      issueDetails: 'Issue Details',
      issueType: 'Issue Type',
      issueStatus: 'Status',
      issuePriority: 'Priority',
      description: 'Description',
      location: 'Location',
      ward: 'Ward',
      assignedTo: 'Assigned To',
      createdBy: 'Created By',
      createdAt: 'Created At',
      resolvedAt: 'Resolved At',
      
      // Issue Types
      pothole: 'Pothole',
      garbage_overflow: 'Garbage Overflow',
      street_light: 'Street Light',
      drainage: 'Drainage',
      water_supply: 'Water Supply',
      road_damage: 'Road Damage',
      illegal_dumping: 'Illegal Dumping',
      other: 'Other',
      
      // Status
      pending: 'Pending',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      
      // Priority
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      
      // Actions
      takePhoto: 'Take Photo',
      selectFromGallery: 'Select from Gallery',
      getCurrentLocation: 'Get Current Location',
      reportIssue: 'Report Issue',
      resolveIssue: 'Resolve Issue',
      viewOnMap: 'View on Map',
      
      // Messages
      issueReported: 'Issue reported successfully',
      issueResolved: 'Issue resolved successfully',
      locationPermissionDenied: 'Location permission denied',
      cameraPermissionDenied: 'Camera permission denied',
      networkError: 'Network error. Please try again.',
      offlineMode: 'Offline Mode - Changes will sync when online',
      
      // Offline
      syncPending: 'Sync Pending',
      syncNow: 'Sync Now',
      lastSync: 'Last Sync',
      pendingActions: 'Pending Actions'
    }
  },
  hi: {
    translation: {
      // Common
      appName: 'नागरिक समस्या मॉनिटर',
      loading: 'लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      submit: 'जमा करें',
      confirm: 'पुष्टि करें',
      back: 'पीछे',
      next: 'अगला',
      close: 'बंद करें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      refresh: 'ताज़ा करें',
      
      // Auth
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      email: 'ईमेल',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      loginError: 'लॉगिन विफल। कृपया अपनी साख जांचें।',
      
      // Dashboard
      dashboard: 'डैशबोर्ड',
      statistics: 'आंकड़े',
      totalIssues: 'कुल समस्याएं',
      pendingIssues: 'लंबित समस्याएं',
      resolvedIssues: 'हल की गई समस्याएं',
      highPriority: 'उच्च प्राथमिकता',
      
      // Issues
      issues: 'समस्याएं',
      newIssue: 'नई समस्या',
      captureIssue: 'समस्या दर्ज करें',
      issueDetails: 'समस्या विवरण',
      issueType: 'समस्या का प्रकार',
      issueStatus: 'स्थिति',
      issuePriority: 'प्राथमिकता',
      description: 'विवरण',
      location: 'स्थान',
      ward: 'वार्ड',
      assignedTo: 'सौंपा गया',
      createdBy: 'द्वारा बनाया गया',
      createdAt: 'बनाया गया',
      resolvedAt: 'हल किया गया',
      
      // Issue Types
      pothole: 'गड्ढा',
      garbage_overflow: 'कूड़ा ओवरफ्लो',
      street_light: 'स्ट्रीट लाइट',
      drainage: 'जल निकासी',
      water_supply: 'जल आपूर्ति',
      road_damage: 'सड़क क्षति',
      illegal_dumping: 'अवैध डंपिंग',
      other: 'अन्य',
      
      // Status
      pending: 'लंबित',
      in_progress: 'प्रगति में',
      resolved: 'हल हो गया',
      
      // Priority
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'निम्न',
      
      // Actions
      takePhoto: 'फोटो लें',
      selectFromGallery: 'गैलरी से चुनें',
      getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
      reportIssue: 'समस्या रिपोर्ट करें',
      resolveIssue: 'समस्या हल करें',
      viewOnMap: 'मानचित्र पर देखें',
      
      // Messages
      issueReported: 'समस्या सफलतापूर्वक रिपोर्ट की गई',
      issueResolved: 'समस्या सफलतापूर्वक हल की गई',
      locationPermissionDenied: 'स्थान अनुमति अस्वीकृत',
      cameraPermissionDenied: 'कैमरा अनुमति अस्वीकृत',
      networkError: 'नेटवर्क त्रुटि। कृपया पुन: प्रयास करें।',
      offlineMode: 'ऑफ़लाइन मोड - परिवर्तन ऑनलाइन होने पर सिंक होंगे',
      
      // Offline
      syncPending: 'सिंक लंबित',
      syncNow: 'अभी सिंक करें',
      lastSync: 'अंतिम सिंक',
      pendingActions: 'लंबित क्रियाएं'
    }
  },
  gu: {
    translation: {
      // Common
      appName: 'નાગરિક સમસ્યા મોનિટર',
      loading: 'લોડ થઈ રહ્યું છે...',
      save: 'સાચવો',
      cancel: 'રદ કરો',
      delete: 'ડિલીટ કરો',
      edit: 'સંપાદિત કરો',
      submit: 'સબમિટ કરો',
      confirm: 'પુષ્ટિ કરો',
      back: 'પાછળ',
      next: 'આગળ',
      close: 'બંધ કરો',
      search: 'શોધો',
      filter: 'ફિલ્ટર',
      refresh: 'રિફ્રેશ કરો',
      
      // Auth
      login: 'લોગિન',
      logout: 'લોગઆઉટ',
      email: 'ઈમેલ',
      password: 'પાસવર્ડ',
      forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
      loginError: 'લોગિન નિષ્ફળ. કૃપા કરીને તમારા ક્રેડેન્શિયલ્સ તપાસો.',
      
      // Dashboard
      dashboard: 'ડેશબોર્ડ',
      statistics: 'આંકડાઓ',
      totalIssues: 'કુલ સમસ્યાઓ',
      pendingIssues: 'બાકી સમસ્યાઓ',
      resolvedIssues: 'ઉકેલાયેલી સમસ્યાઓ',
      highPriority: 'ઉચ્ચ પ્રાથમિકતા',
      
      // Issues
      issues: 'સમસ્યાઓ',
      newIssue: 'નવી સમસ્યા',
      captureIssue: 'સમસ્યા કેપ્ચર કરો',
      issueDetails: 'સમસ્યા વિગતો',
      issueType: 'સમસ્યાનો પ્રકાર',
      issueStatus: 'સ્થિતિ',
      issuePriority: 'પ્રાથમિકતા',
      description: 'વર્ણન',
      location: 'સ્થાન',
      ward: 'વોર્ડ',
      assignedTo: 'સોંપવામાં આવ્યું',
      createdBy: 'દ્વારા બનાવવામાં આવ્યું',
      createdAt: 'બનાવાયેલ',
      resolvedAt: 'ઉકેલવામાં આવ્યું',
      
      // Issue Types
      pothole: 'ખાડો',
      garbage_overflow: 'કચરો ઓવરફ્લો',
      street_light: 'સ્ટ્રીટ લાઈટ',
      drainage: 'ડ્રેનેજ',
      water_supply: 'પાણી પુરવઠો',
      road_damage: 'રોડ ડેમેજ',
      illegal_dumping: 'ગેરકાયદે ડમ્પિંગ',
      other: 'અન્ય',
      
      // Status
      pending: 'બાકી',
      in_progress: 'પ્રગતિમાં',
      resolved: 'ઉકેલાઈ ગયું',
      
      // Priority
      high: 'ઉચ્ચ',
      medium: 'મધ્યમ',
      low: 'નીચું',
      
      // Actions
      takePhoto: 'ફોટો લો',
      selectFromGallery: 'ગેલેરીમાંથી પસંદ કરો',
      getCurrentLocation: 'વર્તમાન સ્થાન મેળવો',
      reportIssue: 'સમસ્યા નોંધાવો',
      resolveIssue: 'સમસ્યા ઉકેલો',
      viewOnMap: 'નકશા પર જુઓ',
      
      // Messages
      issueReported: 'સમસ્યા સફળતાપૂર્વક નોંધાવાઈ',
      issueResolved: 'સમસ્યા સફળતાપૂર્વક ઉકેલાઈ',
      locationPermissionDenied: 'સ્થાન પરવાનગી નકારવામાં આવી',
      cameraPermissionDenied: 'કેમેરા પરવાનગી નકારવામાં આવી',
      networkError: 'નેટવર્ક ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.',
      offlineMode: 'ઓફલાઈન મોડ - ફેરફારો ઓનલાઈન થાય ત્યારે સિંક થશે',
      
      // Offline
      syncPending: 'સિંક બાકી',
      syncNow: 'હવે સિંક કરો',
      lastSync: 'છેલ્લું સિંક',
      pendingActions: 'બાકી ક્રિયાઓ'
    }
  }
};

const LANGUAGE_KEY = '@civic_language';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Load saved language
AsyncStorage.getItem(LANGUAGE_KEY).then(savedLanguage => {
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
});

// Helper to change and persist language
export const changeLanguage = async (languageCode) => {
  await i18n.changeLanguage(languageCode);
  await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
};

// Helper to get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
];

export default i18n;
