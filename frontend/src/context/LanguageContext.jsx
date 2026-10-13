import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    // Brand
    brandName: 'Stroke Recognition AI',
    brandTagline: 'Explainable Facial Asymmetry & Landmark Analysis',
    screeningModality: 'Research Screening Modality',
    
    // Navbar / Header
    home: 'Home',
    about: 'About Project',
    howItWorks: 'How It Works',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    startAnalysis: 'Start Analysis',
    openDashboard: 'Open Dashboard',
    backToHome: 'Back to Home',
    role: 'Role',
    switchRole: 'Switch Demo Persona',

    // Nav Menu Items
    overview: 'Overview',
    dashboard: 'Dashboard',
    aiFacialScreening: 'AI Facial Screening',
    screeningHub: 'Screening Hub',
    imageUpload: 'Image Upload',
    cameraCapture: 'Camera Capture',
    videoAnalysis: 'Video Analysis',
    resultsAndXai: 'Results & Explainability',
    analysisResult: 'Analysis Result',
    explainableAi: 'Explainable AI',
    facialAsymmetry: 'Facial Asymmetry',
    personalTracking: 'Personal Tracking',
    personalBaseline: 'Personal Baseline',
    assessmentHistory: 'Assessment History',
    comparison: 'Comparison',
    monitoringTrends: 'Monitoring Trends',
    clinicalReports: 'Clinical Reports',
    account: 'Account',
    myProfile: 'My Profile',
    settings: 'Settings',

    // Screening Outcomes
    strokeDetected: 'Stroke-associated facial pattern detected',
    nonStrokeDetected: 'Non-stroke-associated facial pattern',
    unableToAssess: 'Unable to Reliably Assess (Uncertain / Low Confidence)',
    modelConfidence: 'Model Confidence',
    inputReliability: 'Input Reliability',
    facialMeasurements: 'Facial Measurements (0 - 100 Index)',
    facialSymmetry: 'Facial Symmetry',
    eyeSymmetry: 'Eye Symmetry',
    eyebrowSymmetry: 'Eyebrow Symmetry',
    mouthSymmetry: 'Mouth Symmetry',
    noseAlignment: 'Nose Alignment',
    jawSymmetry: 'Jaw Symmetry',
    
    // Buttons
    newScan: 'New Scan',
    downloadReport: 'Download Report',
    generateReport: 'Generate Report',
    generatingPdf: 'Generating PDF...',
    viewExplanation: 'View Explanation',
    compareWithBaseline: 'Compare With Baseline',
    viewHistory: 'View History',
    setAsBaseline: 'Set as Personal Baseline',
    savedAsBaseline: 'Saved as Baseline ✓',
    recordVideo: 'Record 5-10s Video',
    uploadVideo: 'Upload Video File',
    capturePhoto: 'Capture Photo',
    retake: 'Retake',
    analyzeNow: 'Analyze Facial Symmetry',
    analyzing: 'Analyzing Landmarks...',
    
    // Emergency & Recommendations
    emergencyTitle: 'Urgent Action Plan — What You Must Do Now',
    callAmbulance: 'Call Ambulance (112 / 102)',
    callEmergency: 'Call Emergency (911 / 112)',
    goldenHourNotice: 'Act Within the Golden Window (First 3 - 4.5 Hours)',
    goldenHourDesc: 'Ischemic stroke clot-busting medication (tPA) is most effective when administered within 3 to 4.5 hours of first symptom onset.',
    dosAndDonts: 'Crucial Emergency Do’s and Don’ts',
    doRecoveryPos: 'DO keep the person seated or lying on their side (recovery position) if dizzy or nauseous.',
    doNoteTime: 'DO record the exact time facial drooping or symptoms were first observed.',
    doCallNow: 'DO call 112/102 immediately and head to a stroke-ready center with 24/7 CT scan capability.',
    dontAspirin: 'DO NOT administer aspirin or blood thinners (can cause fatal bleed if hemorrhagic stroke).',
    dontFoodWater: 'DO NOT give food, water, or oral pills (throat muscles may be impaired, causing asphyxiation).',
    dontWait: 'DO NOT wait to see if symptoms improve on their own.',
    fastProtocol: 'B.E. F.A.S.T. Assessment Breakdown',
    fastBalance: 'Balance: Sudden loss of balance, unsteadiness, or dizziness.',
    fastEyes: 'Eyes: Sudden loss of vision, blurriness, or diplopia.',
    fastFace: 'Face: Unilateral facial droop when smiling or at rest.',
    fastArms: 'Arms: Arm weakness or downward drift when raised.',
    fastSpeech: 'Speech: Slurred speech, garbled words, difficulty understanding.',
    fastTime: 'Time: Time to call emergency medical help immediately.',

    // Language Toggle
    switchLang: 'हिंदी में देखें'
  },
  hi: {
    // Brand
    brandName: 'स्ट्रोक रिकॉग्निशन AI',
    brandTagline: 'व्याख्यात्मक फेशियल असममिति और लैंडमार्क विश्लेषण',
    screeningModality: 'अनुसंधान स्क्रीनिंग मोडैलिटी',

    // Navbar / Header
    home: 'होम',
    about: 'प्रोजेक्ट के बारे में',
    howItWorks: 'यह कैसे काम करता है',
    signIn: 'साइन इन करें',
    register: 'रजिस्टर करें',
    signOut: 'लॉग आउट',
    startAnalysis: 'जांच शुरू करें',
    openDashboard: 'डैशबोर्ड खोलें',
    backToHome: 'होम पर वापस जाएं',
    role: 'रोल',
    switchRole: 'डेमो रोल बदलें',

    // Nav Menu Items
    overview: 'सिंहावलोकन',
    dashboard: 'डैशबोर्ड',
    aiFacialScreening: 'AI फेशियल स्क्रीनिंग',
    screeningHub: 'स्क्रीनिंग हब',
    imageUpload: 'फोटो अपलोड करें',
    cameraCapture: 'कैमरे से जांच',
    videoAnalysis: 'वीडियो विश्लेषण',
    resultsAndXai: 'परिणाम और व्याख्या',
    analysisResult: 'विश्लेषण परिणाम',
    explainableAi: 'एक्सप्लेनेबल AI',
    facialAsymmetry: 'चेहरे की असममिति',
    personalTracking: 'व्यक्तिगत ट्रैकिंग',
    personalBaseline: 'व्यक्तिगत बेसलाइन',
    assessmentHistory: 'जांच का इतिहास',
    comparison: 'तुलना (Comparison)',
    monitoringTrends: 'निगरानी ट्रेंड्स',
    clinicalReports: 'क्लिनिकल रिपोर्ट्स',
    account: 'अकाउंट',
    myProfile: 'मेरी प्रोफाइल',
    settings: 'सेटिंग्स',

    // Screening Outcomes
    strokeDetected: 'स्ट्रोक-संबंधित चेहरे का पैटर्न पहचाना गया (Stroke-Associated)',
    nonStrokeDetected: 'गैर-स्ट्रोक चेहरे का पैटर्न (सामान्य समरूपता)',
    unableToAssess: 'सटीक आकलन संभव नहीं (अनिश्चित / कम स्पष्टता)',
    modelConfidence: 'मॉडल विश्वास स्तर (Confidence)',
    inputReliability: 'फोटो गुणवत्ता व विश्वसनीयता',
    facialMeasurements: 'चेहरे के माप (0 - 100 इंडेक्स)',
    facialSymmetry: 'चेहरे की समरूपता',
    eyeSymmetry: 'आंखों की समरूपता',
    eyebrowSymmetry: 'भौंहों की समरूपता',
    mouthSymmetry: 'मुंह की समरूपता',
    noseAlignment: 'नाक का संरेखण',
    jawSymmetry: 'जबड़े की समरूपता',

    // Buttons
    newScan: 'नया स्कैन करें',
    downloadReport: 'रिपोर्ट डाउनलोड करें',
    generateReport: 'रिपोर्ट बनाएं',
    generatingPdf: 'PDF बन रही है...',
    viewExplanation: 'विस्तृत व्याख्या देखें',
    compareWithBaseline: 'बेसलाइन से तुलना करें',
    viewHistory: 'इतिहास देखें',
    setAsBaseline: 'बेसलाइन के रूप में सेव करें',
    savedAsBaseline: 'बेसलाइन सेव हो गई ✓',
    recordVideo: '5-10 सेकंड का वीडियो बनाएं',
    uploadVideo: 'वीडियो फाइल अपलोड करें',
    capturePhoto: 'फोटो खींचें',
    retake: 'दोबारा लें',
    analyzeNow: 'समानता का विश्लेषण करें',
    analyzing: 'विश्लेषण किया जा रहा है...',

    // Emergency & Recommendations
    emergencyTitle: 'आपातकालीन कार्य योजना — आपको तुरंत क्या करना चाहिए',
    callAmbulance: 'एम्बुलेंस बुलाएं (112 / 102)',
    callEmergency: 'इमरजेंसी कॉल करें (112 / 911)',
    goldenHourNotice: 'गोल्डन ऑवर में तुरंत कार्रवाई करें (शुरुआती 3 - 4.5 घंटे)',
    goldenHourDesc: 'स्ट्रोक के थक्के को घोलने वाली दवा (tPA) लक्षण दिखने के पहले 3 से 4.5 घंटों के भीतर सबसे प्रभावी होती है।',
    dosAndDonts: 'ज़रूरी सावधानियां: क्या करें और क्या न करें (Do’s & Don’ts)',
    doRecoveryPos: 'मरीज को शांत रखें और उल्टी या चक्कर आने पर करवट दिलाकर (रिकवरी पोज़िशन में) लिटाएं।',
    doNoteTime: 'लक्षण या चेहरे का टेढ़ापन शुरू होने का सटीक समय ज़रूर नोट करें।',
    doCallNow: 'तुरंत 112/102 पर कॉल करें और 24/7 CT स्कैन सुविधा वाले अस्पताल ले जाएं।',
    dontAspirin: 'बिना सीटी स्कैन के एस्पिरिन या कोई दवा बिल्कुल न दें (रक्तस्राव होने पर यह जानलेवा हो सकती है)।',
    dontFoodWater: 'मरीज को पानी, खाना या दवा मुंह से न दें (गले की मांसपेशियां शिथिल होने से दम घुट सकता है)।',
    dontWait: 'लक्षण खुद ठीक होने का इंतजार न करें; तुरंत अस्पताल जाएं।',
    fastProtocol: 'B.E. F.A.S.T. आपातकालीन संकेत',
    fastBalance: 'Balance (संतुलन): अचानक संतुलन बिगड़ना, लड़खड़ाहट या चक्कर।',
    fastEyes: 'Eyes (आंखें): एक या दोनों आंखों से अचानक धुंधला दिखना या दृष्टि जाना।',
    fastFace: 'Face (चेहरा): मुस्कुराने या आराम की स्थिति में चेहरे/मुंह का एक तरफ लटकना।',
    fastArms: 'Arms (हाथ): एक हाथ में अचानक कमजोरी या उठाने पर नीचे गिरना।',
    fastSpeech: 'Speech (आवाज): बोलने में तुतलाना, लड़खड़ाहट या समझ न पाना।',
    fastTime: 'Time (समय): हर एक मिनट महत्वपूर्ण है! तुरंत 112/102 पर फोन करें।',

    // Language Toggle
    switchLang: 'Switch to English'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('strokecare_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('strokecare_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key] !== undefined) return dict[key];
    if (TRANSLATIONS.en[key] !== undefined) return TRANSLATIONS.en[key];
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'en',
      toggleLanguage: () => {},
      t: (key, fallback = '') => TRANSLATIONS.en[key] || fallback || key
    };
  }
  return ctx;
};
