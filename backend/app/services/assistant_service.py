import re
from typing import Dict, Any, Optional

EMERGENCY_KEYWORDS = [
    r"\barm\b.*\b(numb|weak|drop|can't lift)\b",
    r"\bspeech\b.*\b(slurr|difficult|can't speak|garbl)\b",
    r"\bface\b.*\b(droop|numb|paralyz|twisted)\b",
    r"\bsudden\b.*\b(weakness|blind|dizz|confus|fall)\b",
    r"\bemergency\b",
    r"\bstroke right now\b",
    r"\b911\b|\b112\b|\b102\b|\bambulance\b",
    r"\bhospital\b",
    r"\bmadad\b|\bemergency hai\b|\bambulance bulao\b|\bambulance chahiye\b"
]

def check_emergency_symptoms(query: str) -> bool:
    query_lower = query.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, query_lower):
            return True
    return False

def is_hindi_query(query: str) -> bool:
    q = query.lower()
    hindi_keywords = [
        "kya", "kyu", "kyun", "kaise", "kare", "karna", "chahiye", "hai", "mujhe", "muze",
        "meri", "mera", "batao", "samjhao", "bataiye", "report", "tedha", "aankh", "muh",
        "hoth", "chehra", "lakwa", "stroke", "madad", "doctor", "dawakhana", "aspatal",
        "exercise", "karo", "nahi", "nhi", "kitna", "sahi", "galat", "kab", "kisko", "call"
    ]
    # Check for Devanagari script characters
    if any("\u0900" <= ch <= "\u097f" for ch in query):
        return True
    match_count = sum(1 for kw in hindi_keywords if re.search(r"\b" + kw + r"\b", q))
    return match_count >= 2 or any(kw in q for kw in ["kya karna", "muze kya", "kya mujhe", "kyu dikh raha", "samjhao", "batao"])

def generate_assessment_explanation(
    query: str,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Intelligent, bilingual (English & Hindi) Explainable AI clinical assistant.
    Provides context-aware explanations about the active assessment,
    anatomical landmarks, model confidence, and next-step clinical recommendations.
    """
    ctx = context or {}
    q = query.strip()
    q_lower = q.lower()
    hindi = is_hindi_query(q)

    prediction = ctx.get("prediction", "non_stroke_associated")
    facial_sym = ctx.get("facial_symmetry", 88.0)
    mouth_sym = ctx.get("mouth_symmetry", 85.0)
    eye_sym = ctx.get("eye_symmetry", 92.0)
    eyebrow_sym = ctx.get("eyebrow_symmetry", 88.0)
    conf_pct = int((ctx.get("model_confidence") or 0.88) * 100)

    # 1. Emergency Safety Trigger
    if any(k in q_lower for k in ["emergency", "ambulance", "call 112", "call 911", "hospital", "sudden weak", "gir gaya", "behosh"]):
        if hindi:
            return {
                "is_emergency": True,
                "answer": (
                    "🚨 **तत्काल आपातकालीन सूचना (Urgent Emergency Action):**\n\n"
                    "यदि किसी व्यक्ति को अचानक चेहरे पर टेढ़ापन, एक हाथ में कमजोरी, या बोलने में तुतलाना/दिक्कत हो रही है, "
                    "तो तुरंत आपातकालीन सेवाओं को कॉल करें:\n"
                    "- 📞 **भारत में:** **112** या **102** (एम्बुलेंस)\n"
                    "- 📞 **यूएस/ग्लोबल:** **911** / **112**\n\n"
                    "**ज़रूरी बातें (Do's & Don'ts):**\n"
                    "1. मरीज को तुरंत आराम की स्थिति में बैठाएं या करवट दिलाकर लिटाएं।\n"
                    "2. बिना डॉक्टर या सीटी स्कैन के कोई दवा (जैसे डिस्प्रिन/एस्पिरिन) या पानी/खाना बिल्कुल न दें।\n"
                    "3. लक्षण शुरू होने का सटीक समय नोट करें और तुरंत स्ट्रोक-रेडी अस्पताल ले जाएं।"
                ),
                "emergency_action": "CALL_112"
            }
        return {
            "is_emergency": True,
            "answer": (
                "🚨 **URGENT EMERGENCY ACTION REQUIRED:**\n\n"
                "If you or someone nearby is experiencing acute neurological signs (facial droop, arm weakness, slurred speech):\n"
                "- 📞 **India Emergency:** **112** or **102** (Ambulance)\n"
                "- 📞 **US/Global:** **911** / **112**\n\n"
                "**Immediate Protocol:**\n"
                "1. Keep the person calm and in a safe recovery position (on their side if vomiting).\n"
                "2. Note the exact time symptoms started (crucial for tPA clot-buster within 4.5 hours).\n"
                "3. DO NOT give food, water, or aspirin until a head CT scan is performed."
            ),
            "emergency_action": "CALL_911"
        }

    # 2. What should I do? / Next steps recommendations
    if any(k in q_lower for k in ["kya karna", "kya karu", "what to do", "next step", "steps", "action", "suggest", "karna chahiye", "kya kare"]):
        if prediction == "stroke_associated":
            if hindi:
                return {
                    "is_emergency": True,
                    "answer": (
                        "⚠️ **स्ट्रोक का संकेत मिलने पर आपको क्या करना चाहिए:**\n\n"
                        "1. **तुरंत न्यूरोलॉजिस्ट या इमरजेंसी जाएं:** बिना देरी किए 112/102 पर एम्बुलेंस बुलाएं या नजदीकी 24/7 CT स्कैन वाले अस्पताल पहुंचे।\n"
                        "2. **गोल्डन ऑवर (Golden Hour):** स्ट्रोक के पहले 3 से 4.5 घंटे सबसे महत्वपूर्ण होते हैं जिसमें थक्के को घोलने वाली दवा (tPA) दी जा सकती है।\n"
                        "3. **पानी या एस्पिरिन न दें:** जब तक डॉक्टर यह न देख लें कि स्ट्रोक खून के रिसाव (Hemorrhagic) का तो नहीं है, कोई दवा न दें।\n"
                        "4. **यह रिपोर्ट दिखाएं:** इस ऐप से 'Download Report' पर क्लिक करके PDF रिपोर्ट डॉक्टर को दिखाएं।"
                    ),
                    "emergency_action": "SEEK_MEDICAL_ATTENTION"
                }
            return {
                "is_emergency": True,
                "answer": (
                    "⚠️ **Recommended Action Plan (Stroke Pattern Detected):**\n\n"
                    "1. **Immediate Medical Evaluation:** Visit an emergency department equipped with 24/7 neuro-imaging (CT/MRI) immediately or dial 112 / 911.\n"
                    "2. **Observe the Golden Window:** Brain cells are protected when medical intervention occurs within 3 to 4.5 hours of symptom onset.\n"
                    "3. **Do NOT Self-Medicate:** Never administer aspirin or fluids before a medical scan rules out intracranial hemorrhage.\n"
                    "4. **Share Clinical PDF:** Download the detailed ReportLab clinical report and share it directly with the attending physician."
                ),
                "emergency_action": "SEEK_MEDICAL_ATTENTION"
            }
        else:
            if hindi:
                return {
                    "is_emergency": False,
                    "answer": (
                        "✅ **वर्तमान स्थिति व सुझाव (Normal Non-Stroke Status):**\n\n"
                        f"आपके चेहरे के लैंडमार्क का समग्र समरूपता स्कोर **{facial_sym}/100** है, जो सामान्य शारीरिक सीमा में है।\n\n"
                        "**आगे क्या करें:**\n"
                        "1. **नियमित निगरानी:** समय-समय पर (हफ्ते या महीने में एक बार) अपना चेहरा स्कैन करके व्यक्तिगत बेसलाइन से तुलना करें।\n"
                        "2. **जोखिम कारक जांचें:** 'Risk Factor' पेज पर जाकर अपना ब्लड प्रेशर, शुगर और लाइफस्टाइल स्कोर चेक करें।\n"
                        "3. **सावधानी:** यदि भविष्य में कभी अचानक चेहरे में सुन्नता या कमजोरी महसूस हो, तो तुरंत डॉक्टर से संपर्क करें।"
                    )
                }
            return {
                "is_emergency": False,
                "answer": (
                    f"✅ **Next Steps & Maintenance (Non-Stroke Pattern):**\n\n"
                    f"Your overall facial symmetry score is **{facial_sym}/100**, and mouth alignment is **{mouth_sym}/100**, indicating balanced physiological bilateral geometry.\n\n"
                    "**Recommended Actions:**\n"
                    "1. **Save Personal Baseline:** Click 'Set as Personal Baseline' so future scans can track subtle drift against your healthy resting profile.\n"
                    "2. **Cardiovascular Risk Assessment:** Complete the evidence-based AHA risk profiler under the 'Risk Factors' tab.\n"
                    "3. **Routine Monitoring:** Perform a quick periodic scan monthly or if you experience unusual facial fatigue."
                )
            }

    # 3. Mouth Symmetry / Lip Droop
    if any(k in q_lower for k in ["mouth", "lip", "corner", "muh", "hoth", "tedha", "droop", "smile"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    f"👄 **मुंह की समरूपता (Mouth Symmetry Score: {mouth_sym}/100):**\n\n"
                    "यह स्कोर आपके होठों के दोनों कोनों (Oral Commissures) के स्तर और नाक-ठोड़ी की मध्य रेखा से उनकी दूरी को मापता है।\n"
                    "- एक्यूट स्ट्रोक में चेहरे की तंत्रिका कमजोर होने के कारण मुंह का एक कोना नीचे गिर (Droop) जाता है।\n"
                    f"- आपका वर्तमान स्कोर **{mouth_sym}/100** है। 75 से ऊपर का स्कोर सामान्य और संतुलित माना जाता है।"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                f"👄 **Oral Commissure & Mouth Symmetry (Score: {mouth_sym}/100):**\n\n"
                "This metric evaluates the horizontal and vertical alignment of your left and right oral commissures "
                "relative to the mid-sagittal Glabella-Menton anatomical axis.\n"
                "- In acute ischemic stroke, central facial nerve paresis causes downward unilateral oral corner displacement.\n"
                f"- Your current mouth symmetry score is **{mouth_sym}/100**. Scores above 75 reflect healthy bilateral motor control."
            )
        }

    # 4. Eye / Eyebrow Asymmetry
    if any(k in q_lower for k in ["eye", "ptosis", "eyebrow", "aankh", "bhonh", "palki", "palke"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    f"👁️ **आंख व भौंह समरूपता (Eye: {eye_sym}/100, Eyebrow: {eyebrow_sym}/100):**\n\n"
                    "यह दोनों आंखों के खुलने की ऊंचाई (Palpebral Fissure Height) और दोनों भौंहों के उठाव में अंतर को मापता है।\n"
                    "- स्ट्रोक में आमतौर पर निचला चेहरा अधिक प्रभावित होता है, जबकि बेल्स पाल्सी (Bell's Palsy) में माथे और आंख की पलक भी पूरी तरह बंद नहीं होती।\n"
                    f"- आपकी आंखों का स्कोर **{eye_sym}/100** सामान्य संतुलन दर्शाता है।"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                f"👁️ **Eye & Eyebrow Bilateral Balance (Eye: {eye_sym}/100, Brow: {eyebrow_sym}/100):**\n\n"
                "Measures the palpebral fissure aperture difference and frontalis muscle arch elevation between left and right sides.\n"
                "- In central facial palsy (stroke), upper facial muscles often retain bilateral innervation, whereas peripheral palsies affect the entire hemiface.\n"
                f"- Your eye symmetry score of **{eye_sym}/100** falls within typical symmetrical physiological limits."
            )
        }

    # 5. Model Confidence
    if any(k in q_lower for k in ["confidence", "certainty", "percent", "vishwas", "bharosa", "shanka"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    f"📊 **मॉडल कॉन्फिडेंस (Model Confidence: {conf_pct}%):**\n\n"
                    f"प्रदर्शित कॉन्फिडेंस ({conf_pct}%) यह बताता है कि आपके चेहरे के 468 लैंडमार्क बिंदु प्रशिक्षित "
                    "मशीन लर्निंग डेटासेट (स्ट्रोक बनाम गैर-स्ट्रोक समूह) के पैटर्न से कितनी मजबूती से मेल खाते हैं।\n"
                    "- यह कोई चिकित्सीय प्रतिशत (Medical Probability) नहीं है, बल्कि AI एल्गोरिदम का पैटर्न मिलान स्कोर है।"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                f"📊 **Model Confidence ({conf_pct}%):**\n\n"
                f"The displayed confidence of {conf_pct}% reflects mathematical feature certainty against the Kaggle annotated "
                "stroke benchmark dataset (3,715 verified cohort cases).\n"
                "- It is an algorithmic pattern-recognition certainty metric, NOT a clinical diagnosis or medical percentage of disease."
            )
        }

    # 6. B.E. F.A.S.T. signs
    if any(k in q_lower for k in ["fast", "sign", "symptom", "lakshan", "b.e. fast", "nishan"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    "⏱️ **B.E. F.A.S.T. स्ट्रोक चेतावनी संकेत:**\n\n"
                    "- **B (Balance):** अचानक संतुलन बिगड़ना, चक्कर आना या चलने में लड़खड़ाहट।\n"
                    "- **E (Eyes):** अचानक एक या दोनों आंखों से धुंधला दिखना या नजर चले जाना।\n"
                    "- **F (Face):** चेहरे या मुंह का एक तरफ झुकना (हंसने पर टेढ़ा होना)।\n"
                    "- **A (Arms):** एक हाथ में कमजोरी या सुन्नपन, उठाने पर हाथ का नीचे गिरना।\n"
                    "- **S (Speech):** बोलने में लड़खड़ाहट या साफ न बोल पाना।\n"
                    "- **T (Time):** समय बहुत कीमती है! तुरंत 112/102 या 911 पर कॉल करें।"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                "⏱️ **B.E. F.A.S.T. Warning Sign Acronym:**\n\n"
                "- **B (Balance):** Sudden loss of balance, ataxia, or dizziness.\n"
                "- **E (Eyes):** Sudden visual disturbance or unilateral vision loss.\n"
                "- **F (Face):** Facial drooping or unilateral smile asymmetry.\n"
                "- **A (Arms):** Arm weakness or pronator drift when extended.\n"
                "- **S (Speech):** Slurred speech or difficulty repeating a simple phrase.\n"
                "- **T (Time):** Call emergency services immediately (112 / 911). Every minute saves ~1.9 million neurons."
            )
        }

    # 7. PDF Report explanation
    if any(k in q_lower for k in ["report", "pdf", "download", "kaise padhe", "samjhao report"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    "📄 **क्लिनिकल रिपोर्ट कैसे पढ़ें और डाउनलोड करें:**\n\n"
                    "1. ऊपर 'Download Report' बटन पर क्लिक करके मेडिकल-ग्रेड PDF रिपोर्ट डाउनलोड करें।\n"
                    "2. रिपोर्ट में शामिल मुख्य बिंदु:\n"
                    f"   - समग्र चेहरे की समरूपता: **{facial_sym}/100**\n"
                    f"   - मुंह का संतुलन: **{mouth_sym}/100**\n"
                    f"   - AI मॉडल का वर्गीकरण: **{'Non-Stroke (सामान्य)' if prediction == 'non_stroke_associated' else 'Stroke Pattern Flagged'}**\n"
                    "   - SHAP एक्सप्लेनएबिलिटी चार्ट (किस अंग ने AI के निर्णय को प्रभावित किया)।\n"
                    "3. इस रिपोर्ट को अपने न्यूरोलॉजिस्ट या फिजिशियन को दिखाकर चिकित्सीय परामर्श लें।"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                "📄 **Understanding & Downloading Your Clinical Report:**\n\n"
                "1. Click the **Download Report** button at the top to generate a high-resolution ReportLab PDF.\n"
                "2. Key sections included:\n"
                f"   - Bilateral Facial Symmetry Index: **{facial_sym}/100**\n"
                f"   - Primary Oral Commissure Metric: **{mouth_sym}/100**\n"
                f"   - Classification Outcome: **{prediction.replace('_', ' ').title()}**\n"
                "   - SHAP biomarker ranking (quantifying regional feature weight).\n"
                "3. Present this report to your healthcare provider or neurologist during evaluation."
            )
        }

    # 8. Recovery & Facial Exercises
    if any(k in q_lower for k in ["exercise", "kasrat", "recovery", "theek", "rehab", "physiotherapy"]):
        if hindi:
            return {
                "is_emergency": False,
                "answer": (
                    "💪 **चेहरे के पुनर्वास और व्यायाम (Facial Rehab Exercises):**\n\n"
                    "यदि डॉक्टर की सलाह हो, तो चेहरे की मांसपेशियों को मजबूत करने के लिए ये व्यायाम किए जाते हैं:\n"
                    "1. **मुस्कुराहट अभ्यास:** शीशे के सामने धीरे-धीरे मुस्कुराने की कोशिश करें और दोनों कोनों को बराबर उठाने का प्रयास करें।\n"
                    "2. **होंठ सिकोड़ना (Pucker):** होठों को 'O' के आकार में सिकोड़ें और 5 सेकंड रोकें।\n"
                    "3. **भौंहें उठाना:** दोनों भौंहों को ऊपर उठाएं और माथे पर सिकुड़न देखें।\n"
                    "4. **आंखें भींचना:** आंखों को मजबूती से बंद करें फिर धीरे-धीरे खोलें।\n"
                    "*नोट: किसी भी नई कसरत से पहले अपने फिजियोथेरेपिस्ट या न्यूरोलॉजिस्ट से अनुमति अवश्य लें।*"
                )
            }
        return {
            "is_emergency": False,
            "answer": (
                "💪 **Facial Rehabilitation & Neuromuscular Retraining:**\n\n"
                "When prescribed by a neuro-rehabilitation specialist, standard facial exercises include:\n"
                "1. **Symmetric Smile Retraining:** Gentle smiling in front of a mirror, focusing on bilateral mouth corner elevation.\n"
                "2. **Lip Pucker:** Compressing lips into an 'O' shape for 5 seconds to strengthen the orbicularis oris.\n"
                "3. **Frontalis Brow Lift:** Raising both eyebrows together, holding for 3 seconds.\n"
                "4. **Eyelid Closure:** Gently closing and squeezing eyelids shut to stimulate orbicularis oculi.\n"
                "*Note: Always confirm exercise protocols with your supervising therapist.*"
            )
        }

    # 9. General / Default Answer
    if hindi:
        return {
            "is_emergency": False,
            "answer": (
                f"🤖 **StrokeCare AI सहायक:**\n\n"
                f"आपके वर्तमान स्कैन का परिणाम: **{'Non-Stroke (सामान्य समरूपता)' if prediction == 'non_stroke_associated' else 'Stroke Pattern Flagged'}** है, "
                f"जिसका समरूपता स्कोर **{facial_sym}/100** और विश्वास स्तर **{conf_pct}%** है।\n\n"
                "आप मुझसे निम्न प्रश्न पूछ सकते हैं:\n"
                "- 'मुंह का स्कोर क्या दर्शाता है?'\n"
                "- 'मुझे क्या करना चाहिए?'\n"
                "- 'B.E. F.A.S.T. के क्या लक्षण हैं?'\n"
                "- 'रिपोर्ट कैसे डाउनलोड करें?'\n"
                "- 'आपातकालीन नंबर क्या हैं?'"
            )
        }

    return {
        "is_emergency": False,
        "answer": (
            f"🤖 **StrokeCare AI Educational Assistant:**\n\n"
            f"Your current assessment outcome is **{prediction.replace('_', ' ').title()}** with an overall facial symmetry score of "
            f"**{facial_sym}/100** and mouth symmetry of **{mouth_sym}/100** (Confidence: {conf_pct}%).\n\n"
            "I can explain:\n"
            "- 'What does mouth asymmetry mean?'\n"
            "- 'What should I do if a stroke pattern is flagged?'\n"
            "- 'How does MediaPipe 468 landmark tracking work?'\n"
            "- 'What are the B.E. F.A.S.T. warning signs?'\n"
            "- 'How to interpret and download the clinical report?'"
        )
    }

def generate_assistant_response(query: str) -> Dict[str, Any]:
    return generate_assessment_explanation(query)
