import { CoachingResponse, EmoticonType } from "../types";
import { calculateBiorhythm } from "./biorhythm";
import { getBatteryRecommendations } from "./recommendations";

export interface CoachingEngineInput {
  name?: string;
  birthdate?: string;
  birthTime?: string;
  gender?: string;
  todayMood?: string;
  todayEmoticon?: EmoticonType | null;
  history?: any[];
  language?: "ko" | "en";
}

const DISTRESS_KEYWORDS = [
  "아픔", "아파", "아프", "아픕", "병", "병원", "몸살", "상처", "감기", "통증", "두통", "복통",
  "우울", "슬픔", "슬퍼", "슬픈", "눈물", "울었", "울고", "상심", "낙담", "절망", "비참", "울적",
  "혼자", "외로", "외롭", "외로움", "고독", "공허", "쓸쓸",
  "힘들", "힘듦", "힘들어", "괴롭", "지침", "지쳐", "지쳤", "번아웃",
];

const STRESS_KEYWORDS = [
  "화남", "화나", "화났", "짜증", "다툼", "싸움", "혼남", "혼났", "혼나", "야단", "꾸중", "잔소리",
  "마찰", "갈등", "언쟁", "시비", "답답", "억울", "분함", "빡침", "열받", "스트레스", "속상",
  "stress", "mad", "angry", "annoyed", "frustrated",
];

const POSITIVE_KEYWORDS = [
  "좋아", "상쾌", "행복", "잘", "굿", "최고", "기쁨", "신나", "달콤", "편안", "수고", "감사", "뿌듯",
  "good", "great", "happy", "relaxed", "fine", "awesome", "joy", "excited",
];

const NEGATIVE_KEYWORDS = [
  "피곤", "졸려", "무기력", "지침", "방전", "귀찮", "tired", "sleepy", "exhausted", "low",
];

const EMOTICON_WEIGHTS: Record<string, number> = {
  VERY_HAPPY: 22,
  HAPPY: 14,
  NEUTRAL: 4,
  SAD: -8,
  CRYING: -16,
  ANGRY: -22,
};

export function isCrisisKeyword(text?: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  const keywords = ["자살", "죽고싶", "죽고 싶", "살기싫", "살기 싫", "극단적 선택", "극단적선택", "죽을래", "suicide", "kill myself", "want to die", "자해", "목숨을 끊", "사라지고 싶"];
  return keywords.some(k => t.includes(k));
}

function getMoodExpressionState(moodText: string): "positive" | "stress" | "distress" | "neutral" | "recovery" | "productive" {
  const text = moodText.toLowerCase();

  if (/(아프|병|우울|슬픔|슬퍼|외로|힘들|지쳐|무기력|피곤|졸려|감기|통증|상처|아픔|울적|절망|비참|병원|몸살|sick|depressed|sad|hurt|lonely|exhausted|tired|sleepy|pain|ill|unwell|drained|weak)/.test(text)) return "distress";
  if (/(화나|짜증|분노|답답|억울|열받|스트레스|갈등|다툼|싸움|마찰|시비|혼남|꾸중|잔소리|angry|annoyed|frustrated|stressed|stress|tense|overwhelmed|upset|mad)/.test(text)) return "stress";
  if (/(좋아|행복|기쁨|신나|상쾌|설레|최고|뿌듯|감사|평온|편안|좋음|기분 좋|맑음|good|great|happy|relaxed|fine|awesome|joy|excited|peaceful|energized|calm)/.test(text)) return "positive";
  if (/(회복|휴식|충전|가볍|편안|한숨|안정|나아짐|괜찮|조금 나아|recover|recovery|recharge|rest|rested|reset|better|calmer)/.test(text)) return "recovery";
  if (/(열심|바쁨|일|업무|프로젝트|계획|목표|성장|집중|진행|busy|productive|focused|goal|project|work|progress|deep work)/.test(text)) return "productive";
  return "neutral";
}

function buildMoodSpecificComment(name: string, finalBattery: number, moodText: string, isEn: boolean): string {
  const safeMood = moodText.trim() || (isEn ? "today's mood" : "오늘의 기분");
  const moodState = getMoodExpressionState(moodText);

  if (isEn) {
    switch (moodState) {
      case "distress":
        return `${name}, your battery is ${finalBattery}% today. 🔋 You wrote '${safeMood}', and it sounds like your body and mind are carrying a lot right now. A gentle reset—warm tea, a short rest, and a little comfort without pressure—would help you feel more grounded. You do not have to carry this alone today. 💛`;
      case "stress":
        return `${name}, your battery is ${finalBattery}% today. 🔋 '${safeMood}' suggests a tense rhythm. It is okay to pause, breathe, and clear the air before moving again. A short break can reset your energy and bring your focus back. 🌿`;
      case "positive":
        return `${name}, your battery is ${finalBattery}% today. 🔋 The feeling of '${safeMood}' is a strong sign that your energy is flowing well. Keep that momentum going with small joys, light movement, and a little celebration for yourself. ✨`;
      case "recovery":
        return `${name}, your battery is ${finalBattery}% today. 🔋 '${safeMood}' sounds like you are recovering and re-centering. Keep the pace gentle and let your routine support a steady comeback instead of pushing too hard. 🌱`;
      case "productive":
        return `${name}, your battery is ${finalBattery}% today. 🔋 '${safeMood}' suggests real momentum and focus. Use that clarity to tackle the next step in short, efficient moves and protect your energy with a proper pause. ⚡`;
      default:
        return `${name}, your battery is ${finalBattery}% today. 🔋 Even with '${safeMood}', your rhythm can still feel balanced. Take one mindful breath, choose a calm action, and let the day move gently. 💖`;
    }
  }

  switch (moodState) {
    case "distress":
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}'라고 적어주셨군요. 지금 몸과 마음이 꽤 무거운 상태일 수 있어요. 오늘은 강하게 버티기보다 따뜻한 차 한잔, 짧은 휴식, 편안한 환경으로 기분을 내려놓는 시간이 필요해요. 혼자 감당하지 않아도 괜찮아요. 💛`;
    case "stress":
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}'는 마음이 긴장된 흐름이라는 뜻이에요. 지금은 무리하게 밀어붙이기보다 한 번 멈춰 숨을 고르고, 마음을 정리하는 시간을 가지면 에너지가 훨씬 빨리 회복돼요. 🌿`;
    case "positive":
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}'라는 표현은 에너지가 잘 올라가고 있다는 신호예요. 지금처럼 작은 기쁨과 가벼운 움직임을 이어가면 하루의 흐름이 더 좋아질 거예요. ✨`;
    case "recovery":
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}'는 회복과 안정이 필요한 상태로 느껴져요. 속도를 줄이고, 가볍게 충전하는 시간을 갖는다면 더 건강한 흐름으로 돌아올 수 있어요. 🌱`;
    case "productive":
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}'는 집중력과 진행력이 좋은 편이라는 뜻이네요. 그 기세를 살려 짧은 단위로 행동을 나누고, 잠깐의 휴식도 같이 챙기면 더 오래 가요. ⚡`;
    default:
      return `${name}, 오늘 배터리는 ${finalBattery}%예요. 🔋 '${safeMood}' 상태를 보니 균형을 맞추는 게 핵심이에요. 한 번 크게 숨 쉬고, 가볍게 할 수 있는 행동 하나를 선택해보세요. 오늘은 편안하게 흐르는 하루가 가장 좋은 선택입니다. 💖`;
  }
}

export function generateSmartCoaching(input: CoachingEngineInput): CoachingResponse {
  const name = input.name || "사용자";
  const birthdate = input.birthdate || "2010-01-01";
  const todayMood = (input.todayMood || "").trim();
  const todayEmoticon = input.todayEmoticon;
  const isEn = input.language === "en";

  // 1. Crisis check
  if (isCrisisKeyword(todayMood)) {
    const crisisComment = isEn
      ? "Thank you for sharing your heavy feelings. Your safety and life are the most precious.\n\n📞 Crisis & Suicide Lifeline: Call or Text 988 (24/7)\n📞 Emergency Helpline: 911 / 112"
      : "힘든 마음을 털어놓아 주셔서 감사합니다. 당신의 안전과 생명은 무엇보다 소중합니다.\n\n📞 24시간 무료 상담전화: 109\n📞 정신건강 상담전화: 1577-0199\n📞 청소년 상담전화: 1388";
    
    return {
      conditionBattery: 28,
      coachingComment: crisisComment,
      items: isEn
        ? [
            { emoji: "📞", name: "Call/Text 988 Lifeline (24/7)", desc: "24/7 free and confidential crisis support is always available" },
            { emoji: "💬", name: "Reach out to someone you trust", desc: "Share your feelings with family, friends, or trusted supporters" },
          ]
        : [
            { emoji: "📞", name: "24시간 무료 상담전화(109) 연락", desc: "전문 상담사가 24시간 언제든 따뜻하게 당신의 이야기를 들어드립니다" },
            { emoji: "💬", name: "소중한 사람에게 마음 전하기", desc: "가족, 친구 등 신뢰할 수 있는 소중한 사람에게 지금의 마음을 털어놓아 보세요" },
          ],
      places: isEn
        ? [
            { emoji: "🛋️", name: "Safe & Warm Space", desc: "Rest in a safe and comfortable environment until you feel grounded" },
            { emoji: "🏥", name: "Emergency / Clinic Support", desc: "Emergency services: 911 / 112" },
          ]
        : [
            { emoji: "🛋️", name: "안전하고 편안한 쉼터", desc: "마음이 안정될 때까지 편안하고 따뜻한 곳에서 충분한 휴식을 취하세요" },
            { emoji: "🏥", name: "전문 심리상담 및 의료기관", desc: "혼자 견디지 마시고 가까운 전문가나 지원 기관의 따뜻한 도움을 받으세요" },
          ],
      isCrisis: true,
    };
  }

  // 2. Biorhythm calculation
  const bio = calculateBiorhythm(birthdate, new Date(), input.language || "ko");
  const bioAvg = bio.averageScore;

  // 3. Mood NLP Analysis
  const isDistress = DISTRESS_KEYWORDS.some(k => todayMood.includes(k)) || /sick|depressed|sad|hurt|lonely|exhausted/i.test(todayMood);
  const isStress = STRESS_KEYWORDS.some(k => todayMood.includes(k));
  
  let moodScoreOffset = 0;
  const posHits = POSITIVE_KEYWORDS.filter(k => todayMood.includes(k)).length;
  const negHits = NEGATIVE_KEYWORDS.filter(k => todayMood.includes(k)).length;

  if (posHits > negHits) {
    moodScoreOffset = 4 + Math.min(posHits * 2, 8);
  } else if (negHits > posHits) {
    moodScoreOffset = -(4 + Math.min(negHits * 2, 8));
  }
  if (isStress) moodScoreOffset -= 6;

  const emoticonOffset = todayEmoticon ? (EMOTICON_WEIGHTS[todayEmoticon] || 4) : 4;

  let finalBattery = Math.round(bioAvg * 0.45 + (54 + moodScoreOffset + emoticonOffset) * 0.55);
  finalBattery = Math.max(18, Math.min(98, finalBattery));

  if (isDistress) {
    // Distress guarantee: 18~28%
    finalBattery = Math.min(28, Math.max(18, finalBattery));
  }

  // 4. Generate empathetic coaching comments based on the user's actual written state
  const coachingComment = buildMoodSpecificComment(name, finalBattery, todayMood || (isEn ? "a steady day" : "평온한 하루"), isEn);

  // 5. Recommendations
  const rec = getBatteryRecommendations(finalBattery, input.gender || "HUMAN", todayMood);

  return {
    conditionBattery: finalBattery,
    coachingComment,
    items: rec.items,
    places: rec.places,
    isCrisis: false,
  };
}
