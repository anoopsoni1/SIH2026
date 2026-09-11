import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        services: 'Services',
        workers: 'Verified Workers',
        emergency: 'Emergency 24/7',
        welfare: 'Worker Welfare',
        dashboard: 'Dashboard',
        login: 'Login',
        register: 'Join Cooperative',
        logout: 'Logout',
      },
      hero: {
        title: 'Verified Cooperative Labour, Delivered with Trust & Fair Wages',
        subtitle: 'Direct digital service marketplace connecting skilled, insured worker cooperatives with homes, businesses, and institutions.',
        searchPlaceholder: 'Search for electricians, plumbers, cleaners, carpenters...',
        findService: 'Search Service',
        emergencyBtn: 'Request Emergency Worker',
      },
      services: {
        popular: 'Popular Service Categories',
        electrical: 'Electrical Repairs',
        plumbing: 'Plumbing & Drainage',
        carpentry: 'Carpentry & Woodwork',
        cleaning: 'Home & Office Cleaning',
        viewAll: 'View All Services',
        bookNow: 'Book Service',
      },
      welfare: {
        badge: 'Cooperative Model',
        title: 'Empowering Workers with 82% Direct Earnings & Health Insurance',
        desc: 'Unlike predatory commercial aggregator apps, our cooperative platform ensures transparent wage distribution, active health cover, and democratic society governance.',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        services: 'सेवाएं',
        workers: 'सत्यापित श्रमिक',
        emergency: 'आपातकालीन 24/7',
        welfare: 'श्रमिक कल्याण',
        dashboard: 'डैशबोर्ड',
        login: 'लॉग इन',
        register: 'सहकारी समिति से जुड़ें',
        logout: 'लॉग आउट',
      },
      hero: {
        title: 'सत्यापित सहकारी श्रमिक, विश्वास और उचित मजदूरी के साथ',
        subtitle: 'कुशल, बीमित श्रमिक सहकारी समितियों को घरों, व्यवसायों और संस्थानों से जोड़ने वाला डिजिटल बाज़ार।',
        searchPlaceholder: 'इलेक्ट्रीशियन, प्लंबर, सफाईकर्मी, बढ़ई खोजें...',
        findService: 'सेवा खोजें',
        emergencyBtn: 'आपातकालीन सेवा अनुरोध',
      },
      services: {
        popular: 'लोकप्रिय सेवा श्रेणियां',
        electrical: 'बिजली मरम्मत',
        plumbing: 'प्लंबिंग और नल',
        carpentry: 'बढ़ईगीरी सेवाएं',
        cleaning: 'घर और कार्यालय की सफाई',
        viewAll: 'सभी सेवाएं देखें',
        bookNow: 'बुक करें',
      },
      welfare: {
        badge: 'सहकारी मॉडल',
        title: 'श्रमिकों को 82% प्रत्यक्ष कमाई और स्वास्थ्य बीमा के साथ सशक्त बनाना',
        desc: 'अन्य व्यावसायिक ऐप्स के विपरीत, हमारा सहकारी मंच पारदर्शी वेतन वितरण, सक्रिय स्वास्थ्य कवर और लोकतांत्रिक शासन सुनिश्चित करता है।',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
