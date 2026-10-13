import React from 'react';
import {
  AlertTriangle, PhoneCall, Clock, CheckCircle2, XCircle,
  ShieldAlert, Activity, Hospital, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function StrokeActionGuide({ prediction, facialFeatures }) {
  const { language, t } = useLanguage();
  const isStroke = prediction === 'stroke_associated';

  if (!isStroke) {
    return (
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
              {language === 'hi' ? 'सामान्य समरूपता स्थिति व स्वास्थ्य सुझाव' : 'Healthy Bilateral Symmetry & Maintenance Guidelines'}
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              {language === 'hi'
                ? 'चेहरे पर कोई तीव्र एकतरफा पक्षाघात (Unilateral Paresis) नहीं पाया गया।'
                : 'No acute unilateral facial motor deficit or commissure droop was detected.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              {language === 'hi' ? '1. बेसलाइन सेव करें' : '1. Save Your Baseline'}
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'वर्तमान स्वस्थ प्रोफ़ाइल को बेसलाइन बनाएं ताकि भविष्य में सूक्ष्म बदलावों की तुरंत पहचान हो सके।'
                : 'Store this symmetric scan as your personal reference to distinguish physiological traits from acute changes.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              {language === 'hi' ? '2. नियमित सिमिट्री निगरानी' : '2. Routine Symmetry Checks'}
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'समय-समय पर चेहरे के फेशियल लैंडमार्क सिमिट्री की जांच करते रहें ताकि किसी भी सूक्ष्म बदलाव की पहचान हो सके।'
                : 'Monitor facial landmark symmetry periodically using image or video screening to detect subtle variations.'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              {language === 'hi' ? '3. B.E. F.A.S.T. को याद रखें' : '3. Stay B.E. F.A.S.T. Aware'}
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'hi'
                ? 'अचानक बोलने में लड़खड़ाहट, एक हाथ में कमजोरी या चक्कर आने पर तुरंत 112 डायल करें।'
                : 'If sudden arm weakness, slurred speech, or vision blur occurs, seek emergency care immediately.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-rose-950/60 dark:via-slate-900 dark:to-orange-950/30 border-2 border-rose-300 dark:border-rose-900/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Title & Emergency Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200 dark:border-rose-900/60 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              {language === 'hi' ? 'आपातकालीन चिकित्सा कार्य योजना' : 'Critical Clinical Action Protocol'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-100">
              {language === 'hi' ? 'स्ट्रोक का संकेत मिला — आपको तुरंत क्या करना है' : 'Stroke Pattern Detected — Immediate Next Steps'}
            </h2>
          </div>
        </div>

        {/* Immediate Call Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <a
            href="tel:112"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'hi' ? 'कॉल करें: 112 (एम्बुलेंस)' : 'Call 112 / 102'}</span>
          </a>
          <a
            href="tel:911"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-slate-300" />
            <span>Call 911</span>
          </a>
        </div>
      </div>

      {/* The Golden Hour Window Card */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex items-start space-x-3.5">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
            {language === 'hi'
              ? '⚡ गोल्डन ऑवर (Golden Window): पहले 3 से 4.5 घंटे सबसे महत्वपूर्ण हैं!'
              : '⚡ The Golden Window: Act Within 3 to 4.5 Hours of Onset!'}
          </h4>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            {language === 'hi'
              ? 'दिमाग में रक्तसंचार रुकने पर हर मिनट लगभग 19 लाख मस्तिष्क कोशिकाएं नष्ट होती हैं। यदि मरीज को लक्षण शुरू होने के 3 से 4.5 घंटे के भीतर अस्पताल पहुंचा दिया जाए, तो थक्के को घोलने वाली दवा (tPA) से पक्षाघात को पूरी तरह ठीक किया जा सकता है।'
              : 'Every minute an acute ischemic stroke goes untreated, approximately 1.9 million neurons die. Intravenous thrombolytic therapy (tPA / Alteplase) can dissolve the clot and prevent permanent disability if administered within 3 to 4.5 hours.'}
          </p>
        </div>
      </div>

      {/* Do's and Don'ts Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DO's */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'क्या करें (DO’s — तत्काल कदम)' : 'What To Do (Immediate Protocol)'}</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>{language === 'hi' ? 'समय नोट करें:' : 'Record exact onset time:'}</strong>{' '}
                {language === 'hi'
                  ? 'लक्षण किस समय शुरू हुए, इसे तुरंत कागज़ पर लिखें। डॉक्टर को सबसे पहले यही चाहिए।'
                  : 'Write down the exact minute symptoms began. Doctors require this for clot-busting eligibility.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>{language === 'hi' ? 'करवट लिटाएं:' : 'Safe recovery position:'}</strong>{' '}
                {language === 'hi'
                  ? 'मरीज को शांत रखें और उल्टी होने पर सिर को एक तरफ घुमाकर करवट से लिटाएं।'
                  : 'Keep the patient calm, elevated slightly, and turned to their side if vomiting.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>{language === 'hi' ? 'कपड़े ढीले करें:' : 'Loosen tight collar:'}</strong>{' '}
                {language === 'hi'
                  ? 'गले के आसपास टाई या बटन ढीले करें ताकि सांस लेने में दिक्कत न हो।'
                  : 'Loosen tight neckwear to facilitate unrestricted cerebral airflow.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>{language === 'hi' ? 'CT स्कैन अस्पताल जाएं:' : 'Stroke-ready hospital:'}</strong>{' '}
                {language === 'hi'
                  ? 'ऐसे अस्पताल जाएं जहां 24/7 CT/MRI स्कैन और न्यूरोलॉजिस्ट उपलब्ध हों।'
                  : 'Transport immediately to a comprehensive stroke center with 24/7 neuro-imaging.'}
              </span>
            </li>
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{language === 'hi' ? 'क्या न करें (DON’Ts — गंभीर गलतियां)' : 'What NOT To Do (Avoid Harm)'}</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold">✗</span>
              <span>
                <strong>{language === 'hi' ? 'एस्पिरिन या दवा न दें:' : 'DO NOT give aspirin:'}</strong>{' '}
                {language === 'hi'
                  ? 'बिना CT स्कैन के कोई भी दवा (जैसे Disprin/Aspirin) न दें; अगर स्ट्रोक ब्रेन हेमरेज (Hemorrhage) का है तो यह जानलेवा हो सकता है।'
                  : 'Never give aspirin before a head CT scan rules out intracranial bleeding.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold">✗</span>
              <span>
                <strong>{language === 'hi' ? 'पानी या खाना न दें:' : 'DO NOT give water or food:'}</strong>{' '}
                {language === 'hi'
                  ? 'स्ट्रोक में गले की निगलने वाली मांसपेशियां काम नहीं करतीं; पानी फेफड़ों में जा सकता है (Choking Hazard)।'
                  : 'Stroke impairs swallowing (dysphagia); liquids can enter lungs causing asphyxiation.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold">✗</span>
              <span>
                <strong>{language === 'hi' ? 'सोने न दें:' : 'DO NOT let them sleep it off:'}</strong>{' '}
                {language === 'hi'
                  ? 'यह सोचकर न बैठें कि "आराम करने से ठीक हो जाएगा"। तुरंत एम्बुलेंस बुलाएं।'
                  : 'Do not wait to see if symptoms resolve. Every delayed minute causes irreversible injury.'}
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-500 font-bold">✗</span>
              <span>
                <strong>{language === 'hi' ? 'खुद गाड़ी न चलाने दें:' : 'DO NOT let patient drive:'}</strong>{' '}
                {language === 'hi'
                  ? 'मरीज को खुद गाड़ी चलाने की अनुमति न दें। एम्बुलेंस बुलाना सबसे सुरक्षित है।'
                  : 'Call an ambulance; paramedics can start stabilization and pre-alert the hospital.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* B.E. F.A.S.T. Assessment Grid */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span>{language === 'hi' ? 'B.E. F.A.S.T. स्ट्रोक लक्षणों की जांच सूची' : 'B.E. F.A.S.T. Clinical Stroke Assessment Checklist'}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-base font-black text-rose-600 block mb-0.5">B</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Balance</span>
            <span className="text-[10px] text-slate-500">{language === 'hi' ? 'अचानक संतुलन खोना' : 'Sudden dizziness / fall'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-base font-black text-rose-600 block mb-0.5">E</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Eyes</span>
            <span className="text-[10px] text-slate-500">{language === 'hi' ? 'धुंधली दृष्टि / अंधापन' : 'Vision loss / blur'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/40">
            <span className="text-base font-black text-rose-600 block mb-0.5">F</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Face Droop</span>
            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">{language === 'hi' ? 'मुंह का टेढ़ापन (Flagged)' : 'Facial Droop (Flagged)'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-base font-black text-rose-600 block mb-0.5">A</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Arms</span>
            <span className="text-[10px] text-slate-500">{language === 'hi' ? 'हाथ में कमजोरी / सुन्नपन' : 'Arm weakness / drift'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-base font-black text-rose-600 block mb-0.5">S</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Speech</span>
            <span className="text-[10px] text-slate-500">{language === 'hi' ? 'बोलने में तुतलाना' : 'Slurred / garbled words'}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl bg-amber-50/60 border border-amber-200 dark:border-amber-900">
            <span className="text-base font-black text-amber-600 block mb-0.5">T</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Time</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">{language === 'hi' ? 'तुरंत 112 डायल करें' : 'Call 112 / 911 Now'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
