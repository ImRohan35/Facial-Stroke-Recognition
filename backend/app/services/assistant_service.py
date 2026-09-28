import re
from typing import Dict, Any

EMERGENCY_KEYWORDS = [
    r"\barm\b.*\b(numb|weak|drop|can't lift)\b",
    r"\bspeech\b.*\b(slurr|difficult|can't speak|garbl)\b",
    r"\bface\b.*\b(droop|numb|paralyz|twisted)\b",
    r"\bsudden\b.*\b(weakness|blind|dizz|confus|fall)\b",
    r"\bemergency\b",
    r"\bstroke right now\b",
    r"\b911\b|\b112\b|\bambulance\b"
]

def check_emergency_symptoms(query: str) -> bool:
    query_lower = query.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, query_lower):
            return True
    return False

EDUCATIONAL_TOPICS = {
    "warning_signs": {
        "keywords": ["warning sign", "symptom", "fast", "signs of stroke"],
        "response": (
            "The most critical stroke warning signs are summarized by the **B.E. F.A.S.T.** acronym:\n"
            "- **B (Balance):** Sudden loss of balance, dizziness, or difficulty walking.\n"
            "- **E (Eyes):** Sudden loss of vision in one or both eyes, or double vision.\n"
            "- **F (Face):** Unilateral face drooping when attempting to smile or raise eyebrows.\n"
            "- **A (Arms):** Arm weakness or numbness; one arm drifts downward when raised.\n"
            "- **S (Speech):** Slurred speech, trouble repeating a simple sentence, or confusion.\n"
            "- **T (Time):** Time to call emergency services (911/112) immediately! Brain cells can be saved with rapid intervention."
        )
    },
    "tia": {
        "keywords": ["tia", "transient ischemic", "mini stroke"],
        "response": (
            "A **Transient Ischemic Attack (TIA)**, sometimes colloquially referred to as a 'mini-stroke', occurs when blood flow to part of the brain is temporarily blocked. "
            "Although symptoms often resolve within minutes to hours, a TIA is a severe medical warning sign indicating an elevated risk for a full ischemic stroke. "
            "Any suspected TIA requires immediate emergency medical evaluation, even if symptoms seem to have disappeared."
        )
    },
    "facial_asymmetry": {
        "keywords": ["asymmetry", "facial asymmetry", "symmetry score", "droop"],
        "response": (
            "Facial asymmetry refers to structural or movement differences between the left and right sides of the face. "
            "While slight asymmetry is naturally present in every human face, acute or sudden unilateral asymmetry—such as one corner of the mouth failing to rise during a smile—can be caused by neurological impairment (such as stroke or Bell's Palsy). "
            "StrokeCare AI measures bilateral landmark coordinates to detect deviations from your baseline or standard physiological ranges."
        )
    },
    "doctor_questions": {
        "keywords": ["doctor", "ask my doctor", "questions for", "physician"],
        "response": (
            "Here are helpful questions to bring to your healthcare provider or neurologist:\n"
            "1. 'Based on my blood pressure, glucose, and lifestyle markers, what is my cardiovascular risk profile?'\n"
            "2. 'Should I undergo carotid artery ultrasound or brain neuroimaging given my symptoms or family history?'\n"
            "3. 'What target ranges should I maintain for my blood pressure and LDL cholesterol?'\n"
            "4. 'How often should I monitor facial symmetry or functional recovery?'"
        )
    },
    "report_explanation": {
        "keywords": ["explain report", "understand report", "my result", "confidence"],
        "response": (
            "In your StrokeCare AI report:\n"
            "- **Facial Symmetry Score (0-100):** Reflects mathematical bilateral alignment between facial landmarks (mouth, eyes, eyebrows). Scores above 85 generally reflect symmetrical physiological appearance.\n"
            "- **SHAP Factors:** Highlight which specific facial regions (e.g., mouth corner elevation vs eyebrow height) had the greatest mathematical impact on the AI screening classification.\n"
            "- **Risk Factor Count:** Highlights lifestyle and metabolic factors requiring attention in consultation with your doctor."
        )
    }
}

def generate_assistant_response(query: str) -> Dict[str, Any]:
    # 1. Emergency Safety Check
    if check_emergency_symptoms(query):
        return {
            "is_emergency": True,
            "message": (
                "⚠️ **URGENT EMERGENCY NOTICE:** You have reported symptoms that may indicate an acute stroke. "
                "Do NOT wait for online screening or assessment results. Call emergency medical services (911 in North America, 112 in Europe, or your local emergency number) immediately! "
                "Time is critical for stroke treatment."
            ),
            "emergency_action": "CALL_EMERGENCY"
        }

    # 2. Topic Matching
    q_lower = query.lower()
    for topic_key, data in EDUCATIONAL_TOPICS.items():
        if any(kw in q_lower for kw in data["keywords"]):
            return {
                "is_emergency": False,
                "message": data["response"],
                "topic": topic_key
            }

    # 3. Default Safe Guidance
    return {
        "is_emergency": False,
        "message": (
            "StrokeCare AI is designed to support stroke awareness, screening, and recovery tracking. "
            "I can explain stroke warning signs (B.E. F.A.S.T.), TIAs, facial symmetry metrics, questions to ask your physician, or how to interpret your screening report. "
            "Please note that I cannot provide medical diagnoses or prescribe medications. If you or someone around you is experiencing sudden facial drooping, arm numbness, or speech difficulty, seek emergency care immediately."
        )
    }
