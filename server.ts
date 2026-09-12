import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { z } from "zod";

dotenv.config();

const app = express();

// Trust proxy for correct client IP detection under reverse proxy (Cloud Run, etc.)
app.set("trust proxy", 1);

// Enable CORS for web, iOS (Capacitor/WKWebView), and external clients
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: "10kb" })); // Prevent denial of service with oversized payloads

const PORT = 3000;

// ============ Gemini Client (lazy init) ============
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is required.");
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// ============ Rate Limiting (Abuse / Cost control) ============
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." },
});
app.use("/api/", apiLimiter);

// ============ Input Validation (Zod) ============
const emoticonEnum = z
  .enum(["VERY_HAPPY", "HAPPY", "NEUTRAL", "SAD", "CRYING", "ANGRY"])
  .optional()
  .nullable();

const coachingSchema = z.object({
  name: z.string().trim().min(1).max(20),
  birthdate: z.string().trim().min(1).max(20),
  birthTime: z.string().trim().max(20).optional().nullable(),
  gender: z.string().trim().max(10).optional().nullable(),
  todayMood: z.string().trim().max(300).optional().nullable(),
  todayEmoticon: emoticonEnum,
  history: z.array(z.any()).max(30).optional().nullable(),
  language: z.enum(["ko", "en"]).optional().nullable(),
});

const matchingSchema = z.object({
  userName: z.string().trim().min(1).max(20),
  userBirthdate: z.string().trim().min(1).max(20),
  userGender: z.string().trim().max(10).optional().nullable(),
  targetName: z.string().trim().min(1).max(20),
  targetBirthdate: z.string().trim().min(1).max(20),
  relationType: z.string().trim().min(1).max(300),
  userBattery: z.number().min(0).max(100).optional().nullable(),
  language: z.enum(["ko", "en"]).optional().nullable(),
});

// ============ Crisis Intervention (Safety Filter) ============
// ONLY extreme crisis words (자살, 죽고싶, 살기싫, 극단적 선택, 살자, 죽을래, suicide, kill myself, want to die 등)
const CRISIS_KEYWORDS = [
  "자살",
  "죽고싶",
  "죽고 싶",
  "살기싫",
  "살기 싫",
  "극단적 선택",
  "극단적선택",
  "죽을래",
  "suicide",
  "kill myself",
  "want to die",
  "자해",
  "목숨을 끊",
  "사라지고 싶",
  "뛰어내리",
];

const DISTRESS_KEYWORDS = [
  "아픔", "아파", "아프", "아픕", "병", "병원", "몸살", "상처", "감기", "통증", "두통", "복통",
  "우울", "슬픔", "슬퍼", "슬픈", "눈물", "울었", "울고", "상심", "낙담", "절망", "비참", "울적",
  "혼자", "외로", "외롭", "외로움", "고독", "공허", "쓸쓸",
  "힘들", "힘듦", "힘들어", "괴롭", "지침", "지쳐", "지쳤", "번아웃",
];

function containsCrisisSignal(...texts: (string | undefined | null)[]): boolean {
  const combined = texts.filter(Boolean).join(" ").toLowerCase();
  if (!combined) return false;
  if (CRISIS_KEYWORDS.some((kw) => combined.includes(kw))) {
    return true;
  }
  // Check for slang "살자" (meaning suicide), avoiding positive context
  if (/(?:^|\s|[.,!?~])살자(?:$|\s|[.,!?~])/.test(combined)) {
    const positiveSalja = ["열심히", "행복하게", "잘", "같이", "함께", "오래", "즐겁게", "신나게", "웃으며", "살아야"];
    const hasPositiveContext = positiveSalja.some((p) => combined.includes(p));
    if (!hasPositiveContext) {
      return true;
    }
  }
  return false;
}

const CRISIS_MESSAGE_KO =
  "힘든 마음을 털어놓아 주셔서 감사합니다. 당신의 안전과 생명은 무엇보다 소중합니다.\n\n" +
  "📞 상담전화: 109 (24시간 무료)\n" +
  "📞 상담전화: 1577-0199\n" +
  "📞 상담전화: 1388";

const CRISIS_MESSAGE_EN =
  "Thank you for sharing your heavy feelings. Your safety and life are the most precious.\n\n" +
  "📞 Crisis & Suicide Lifeline: Call or Text 988 (24/7)\n" +
  "📞 Emergency Helpline: 911 / 112";

// ============ Memory Response Cache (Save API quota) ============
type CacheEntry = { data: any; expires: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours Cache
const CACHE_MAX_SIZE = 500;

function getCacheKey(prefix: string, payload: any): string {
  const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `${prefix}:${hash}`;
}
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}
function setCached(key: string, data: any): void {
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// ============ Common Scoring Utils ============
function calcBaseSajuScore(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return 42 + (hash % 33); // Range: 42 ~ 74
}
function clampScore(score: number, min = 18, max = 98): number {
  return Math.max(min, Math.min(max, score));
}
function getChemistry(score: number): { level: string; emoji: string } {
  if (score >= 90) return { level: "환상의 리듬 케미! 💕", emoji: "💖" };
  if (score >= 80) return { level: "든든한 에너지 짝꿍! ⭐", emoji: "⭐" };
  if (score >= 70) return { level: "편안한 주파수 🫧", emoji: "🍬" };
  if (score >= 60) return { level: "무난한 공존 🍃", emoji: "🌱" };
  return { level: "파동 조정 필요 ⚡", emoji: "🔌" };
}
const EMOTICON_WEIGHTS: Record<string, number> = {
  VERY_HAPPY: 24, HAPPY: 16, NEUTRAL: 4, SAD: -8, CRYING: -16, ANGRY: -24,
};

type CoachingInput = z.infer<typeof coachingSchema>;
type MatchingInput = z.infer<typeof matchingSchema>;

function calculateBiorhythmServer(birthdateStr?: string) {
  if (!birthdateStr) return { physical: 70, emotional: 75, intellectual: 80, averageScore: 75 };
  const birth = new Date(birthdateStr);
  if (isNaN(birth.getTime())) return { physical: 70, emotional: 75, intellectual: 80, averageScore: 75 };

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

  const pRaw = Math.sin((2 * Math.PI * diffDays) / 23) * 100;
  const eRaw = Math.sin((2 * Math.PI * diffDays) / 28) * 100;
  const iRaw = Math.sin((2 * Math.PI * diffDays) / 33) * 100;

  const scaleTo18to98 = (raw: number) => Math.round(18 + ((raw + 100) / 200) * 80);
  const physical = scaleTo18to98(pRaw);
  const emotional = scaleTo18to98(eRaw);
  const intellectual = scaleTo18to98(iRaw);
  const averageScore = Math.round((physical + emotional + intellectual) / 3);

  return { physical, emotional, intellectual, averageScore };
}

function fallbackCoaching(input: CoachingInput) {
  const { name, birthdate, todayMood, todayEmoticon, language } = input;
  const isEn = language === "en";
  const bio = calculateBiorhythmServer(birthdate);

  let moodAdjustment = 0;
  let isStressMood = false;
  let isDistressMood = false;

  if (todayMood) {
    const positive = ["좋아", "상쾌", "행복", "잘", "굿", "최고", "기쁨", "신나", "달콤", "편안", "수고", "good", "great", "happy", "relaxed", "fine", "awesome"];
    const negative = ["피곤", "감기", "아파", "기침", "미열", "졸려", "짜증", "슬퍼", "우울", "힘들어", "속상", "싸움", "지침", "방전", "tired", "sad", "sick", "hurt", "exhausted"];
    const stressKeywords = ["화남", "화나", "짜증", "다툼", "싸움", "혼남", "혼났", "빡침", "열받", "스트레스", "속상", "답답", "억울", "분함", "야단", "시비", "stress", "mad", "angry"];

    isDistressMood = DISTRESS_KEYWORDS.some((k) => todayMood.includes(k)) || /sick|depressed|sad|hurt|lonely|exhausted/i.test(todayMood);
    isStressMood = stressKeywords.some((k) => todayMood.includes(k));
    const posCount = positive.filter((k) => todayMood.includes(k)).length;
    const negCount = negative.filter((k) => todayMood.includes(k)).length;
    if (posCount > negCount) moodAdjustment = 2 + Math.min(posCount, 6);
    else if (negCount > posCount) moodAdjustment = -(2 + Math.min(negCount, 6));
    if (isStressMood) moodAdjustment -= 5;
  }

  const emoticonAdjustment = todayEmoticon ? EMOTICON_WEIGHTS[todayEmoticon] : 4;
  let finalBattery = clampScore(Math.round(bio.averageScore * 0.4 + (55 + moodAdjustment + emoticonAdjustment) * 0.6));

  if (isDistressMood) {
    // 아픔, 병, 우울, 슬픔, 혼자/외로움 단어 포함 시 컨디션 30 이하 보장 (18~28%)
    finalBattery = Math.min(28, Math.max(18, finalBattery));
  }

  let coachingComment = "";
  if (isEn) {
    if (isDistressMood && todayMood) {
      coachingComment = `${name}, your battery is currently at ${finalBattery}%. 🔋 Hearing that you feel '${todayMood}', your mind and body must be tired and in need of gentle comfort. You don't have to carry everything alone today—wrap yourself in warmth, take a deep breath, and rest. Soon your positive energy will return! 🧸🌸✨`;
    } else if (isStressMood && todayMood) {
      coachingComment = `${name}, your battery is at ${finalBattery}% today! 🔋 It looks like things were stressful with '${todayMood}'. Refresh yourself with a cool beverage, your favorite music, and some light movement to shake off the tension! 🍀`;
    } else {
      const moodMention = todayMood ? `Reflecting on your mood '${todayMood}', ` : "";
      coachingComment = `${name}, your battery is at ${finalBattery}% today! 🔋 ${moodMention}harmonize your daily rhythms and take time to recharge with what you love! 💖`;
    }
  } else {
    if (isDistressMood && todayMood) {
      coachingComment = `${name}, 오늘 배터리는 ${finalBattery}%로 많이 내려가 있네요. 🔋 적어주신 '${todayMood}' 소식에 몸과 마음이 참 많이 아프고 외롭고 힘들었을 것 같아요. 당신의 마음을 따뜻하게 공감해요. 혼자 다 짊어지려 하지 말고 오늘은 따뜻한 이불 속에서 쉬어가는 시간을 꼭 가져보세요. 이 휴식이 지나고 나면 다시 밝고 따뜻한 긍정의 기운이 피어날 거예요! 🧸🌸✨`;
    } else if (isStressMood && todayMood) {
      coachingComment = `${name}, 오늘 배터리는 ${finalBattery}%네요! 🔋 적어주신 '${todayMood}' 상태로 속상하고 마음이 복잡하셨겠어요. 이럴 때는 시원한 음료나 매콤한 간식, 신나는 음악으로 기분 전환과 스트레스 해소를 꼭 해보시는 걸 추천드려요! 🍀`;
    } else {
      const moodMention = todayMood
        ? `남겨주신 '${todayMood}' 상태를 마음 깊이 공감하고 있어요.`
        : "피로와 기분을 다정하게 채워드릴게요.";
      coachingComment = `${name}, 오늘 배터리는 ${finalBattery}%네요! 🔋 ${moodMention} 신체·감정·지성 바이오리듬과 오늘 기분을 조화롭게 맞추어 따뜻한 충전의 시간을 선물해보세요! 💖`;
    }
  }

  return {
    conditionBattery: finalBattery,
    coachingComment,
  };
}

function fallbackMatching(input: MatchingInput, currentBattery: number) {
  const { userName, userBirthdate, targetName, targetBirthdate, relationType } = input;
  const userBio = calculateBiorhythmServer(userBirthdate);
  const targetBio = calculateBiorhythmServer(targetBirthdate);

  const calculatePhaseMatchServer = (uScore: number, tScore: number, seed: number) => {
    const rawDiff = Math.abs(uScore - tScore);
    const similarity = 100 - rawDiff * 0.65;
    return Math.max(18, Math.min(98, Math.round(similarity * 0.88 + seed)));
  };

  const physicalMatch = calculatePhaseMatchServer(userBio.physical, targetBio.physical, 4);
  const emotionalMatch = calculatePhaseMatchServer(userBio.emotional, targetBio.emotional, 2);
  const intellectualMatch = calculatePhaseMatchServer(userBio.intellectual, targetBio.intellectual, 5);

  const r = relationType.toLowerCase();

  const negativeConflictKeywords = [
    "싸움", "다툼", "어색", "냉전", "삐침", "화남", "화나", "짜증", "속상", "혼남", "혼났", "혼나", "야단", "꾸중", "잔소리", "마찰", "갈등", "언쟁", "시비", "답답", "억울", "빡침", "열받"
  ];
  const breakKeywords = ["헤어짐", "남남", "이별", "차단", "손절"];
  const loveKeywords = ["1일", "고백", "사귐", "설렘", "달달", "좋아", "사랑", "짝사랑", "연애", "데이트", "심쿵", "행복", "최고"];
  const friendKeywords = ["베프", "찐친", "친함", "친구", "동료", "가족", "식구"];

  // 사용자가 남긴 글(관계/상태 텍스트) 기반 '오늘 케미' 점수 계산
  let textMatchScore = 75;
  if (negativeConflictKeywords.some((k) => r.includes(k))) {
    textMatchScore = 32;
  } else if (breakKeywords.some((k) => r.includes(k))) {
    textMatchScore = 20;
  } else if (loveKeywords.some((k) => r.includes(k))) {
    textMatchScore = 93;
  } else if (friendKeywords.some((k) => r.includes(k))) {
    textMatchScore = 84;
  } else if (relationType.trim().length > 0) {
    let textHash = 0;
    for (let i = 0; i < relationType.length; i++) textHash += relationType.charCodeAt(i);
    textMatchScore = 65 + (textHash % 20); // 65 ~ 84
  }

  const todayChemistryMatch = Math.max(18, Math.min(98, textMatchScore));
  const adjPhysical = physicalMatch;
  const adjEmotional = emotionalMatch;
  const adjIntellectual = intellectualMatch;

  // 4개 항목(오늘 케미, 생체, 감성, 지성)의 정확한 산술 평균으로 종합 score 계산!
  const score = Math.max(18, Math.min(98, Math.round((todayChemistryMatch + adjPhysical + adjEmotional + adjIntellectual) / 4)));

  let coachingMessage: string;
  const relationMention = relationType.trim() ? `'${relationType.trim()}'` : "현재 관계";

  if (negativeConflictKeywords.some((k) => r.includes(k))) {
    coachingMessage = `${userName}님과 ${targetName}님의 감정 바이오리듬 파동이 잠시 교차하는 시점이에요. 적어주신 ${relationMention} 상황은 일시적이니, 귀여운 이모티콘으로 다정하게 화해의 신호를 전달해보세요! 🍓⚡`;
  } else if (breakKeywords.some((k) => r.includes(k))) {
    coachingMessage = `두 사람의 감정 바이오리듬 파동에 거리가 생겨 마음이 아프실 것 같아요. 지금은 ${userName}님 자신의 바이오 에너지를 먼저 온전히 채우는 따뜻한 휴식이 필요한 때입니다. 🧸🕯️`;
  } else if (loveKeywords.some((k) => r.includes(k))) {
    coachingMessage = `와! 두 사람의 감정 바이오리듬 파동이 매우 매끄럽게 동기화되어 있어요! ${targetName}님과의 ${relationMention} 분위기가 핑크빛으로 무르익었으니 마음을 전해보세요. 💕`;
  } else if (r.includes("친구") || r.includes("찐친") || r.includes("베프")) {
    coachingMessage = `남겨주신 ${relationMention} 상태처럼 ${userName}님과 ${targetName}님은 바이오 주파수가 유쾌하게 잘 통하는 사이예요! 🌟`;
  } else if (r.includes("가족")) {
    coachingMessage = `남겨주신 ${relationMention} 관계처럼 은근히 서로를 든든하게 받쳐주는 바이오 에너지를 지니고 있어요! 오늘 따뜻한 한마디를 건네보세요. 🏠✨`;
  } else {
    coachingMessage = `남겨주신 ${relationMention} 상태에 대해 마음 깊이 공감하고 있어요. ${userName}님과 ${targetName}님은 물 흐르듯 조화로운 바이오 파동을 지니고 있으니 편안하게 다가가보세요. 🍃`;
  }

  const { level, emoji } = getChemistry(score);
  return {
    score,
    chemistryLevel: level,
    chemistryEmoji: emoji,
    coachingMessage,
    todayChemistryMatch,
    physicalMatch: adjPhysical,
    emotionalMatch: adjEmotional,
    intellectualMatch: adjIntellectual,
  };
}

// ================= /api/coaching =================
app.post("/api/coaching", async (req, res) => {
  try {
    const parsed = coachingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "이름과 생년월일을 확인해주세요." });
    }
    const input = parsed.data;

    // Safety: Immediate fallback for severe distress signals
    if (containsCrisisSignal(input.todayMood)) {
      const isEn = input.language === "en";
      return res.json({
        conditionBattery: 30,
        coachingComment: isEn ? CRISIS_MESSAGE_EN : CRISIS_MESSAGE_KO,
        isCrisis: true,
        items: isEn
          ? [
              { emoji: "📞", name: "Call or text 988 Lifeline (24/7)", desc: "24/7 free and confidential crisis support is always available" },
              { emoji: "💬", name: "Reach out to someone you trust", desc: "Share your feelings with family, friends, or trusted supporters" },
            ]
          : [
              { emoji: "📞", name: "24시간 무료 상담전화(109)에 전화하기", desc: "전문 상담사가 24시간 언제든 따뜻하게 당신의 이야기를 들어드립니다" },
              { emoji: "💬", name: "믿을 수 있는 사람에게 연락하기", desc: "가족, 친구 등 신뢰할 수 있는 소중한 사람에게 지금의 마음을 털어놓아 보세요" },
            ],
        places: isEn
          ? [
              { emoji: "🛋️", name: "Safe & Calm Space", desc: "Rest in a safe and comfortable environment" },
              { emoji: "🏥", name: "Emergency / Clinic Support", desc: "Emergency services: 911 / 112" },
            ]
          : [
              { emoji: "🛋️", name: "안전하고 편안한 공간", desc: "마음이 안정될 때까지 편안하고 따뜻한 곳에서 휴식을 취하세요" },
              { emoji: "🏥", name: "전문 심리상담 및 의료기관", desc: "혼자 견디지 마시고 가까운 전문가나 지원 기관의 도움을 받으세요" },
            ],
      });
    }

    // Cache lookup
    const cacheKey = getCacheKey("coaching", input);
    const cached = getCached<any>(cacheKey);
    if (cached) return res.json(cached);

    let result = fallbackCoaching(input);

    try {
      const ai = getGeminiClient();
      const { name, birthdate, birthTime, todayMood, history, gender, todayEmoticon } = input;
      const bio = calculateBiorhythmServer(birthdate);

      const isDistressMood = todayMood ? DISTRESS_KEYWORDS.some((k) => todayMood.includes(k)) : false;

      const isEn = input.language === "en";
      const prompt = `
당신은 생년월일 기반 바이오리듬(신체 23일, 감정 28일, 지성 33일 주기)과 사용자의 당일 기분 상태를 세심하게 종합 분석하는 전문 AI 인생 코치입니다.
사용자 이름: ${name}
사용자 성별: ${gender || "여성"}
생년월일: ${birthdate} (오늘 바이오리듬 평균 점수: ${bio.averageScore}점 / 신체 ${bio.physical}%, 감정 ${bio.emotional}%, 지성 ${bio.intellectual}%)
오늘의 한줄 상태/기분: ${todayMood || "따로 적지 않음"}
오늘의 기분달력 선택 이모티콘: ${todayEmoticon || "선택하지 않음"} (VERY_HAPPY, HAPPY, NEUTRAL, SAD, CRYING, ANGRY 중 하나)
이전 최근 기분 기록 리스트: ${JSON.stringify((history || []).slice(0, 10))}
요청 언어: ${isEn ? "English" : "Korean"}

**점수 계산 및 코칭 규칙 (필수 준수)**:
1. 생년월일 기반 바이오리듬 평균 점수(${bio.averageScore}점)와 오늘의 기분/상태(${todayMood}) 및 이모티콘 가중치를 결합하여 종합 컨디션 배터리를 계산하세요.
2. **[필수 규정 - 아픔/병/우울/슬픔/혼자 감정 처리]**:
   만약 사용자의 오늘의 기분/상태(${todayMood})에 '아픔', '아파', '병', '우울', '슬픔', '슬퍼', '혼자', '외로움', '외롭', '힘듦', '힘들어', '괴롭', '지침', '눈물', '몸살', '상처' 등 아픔, 질병, 우울, 슬픔, 혼자/외로움 관련 키워드가 포함되어 있다면:
   - **conditionBattery는 반드시 30 이하(18~30 사이)로 부여**하세요.
   - **coachingComment**에는 아프고 슬프고 혼자라 외로운 마음을 깊이 따뜻하게 공감해 주고, "혼자가 아니에요", "잘 견뎌내고 있어요", "충분히 쉬어가면 다시 밝고 따뜻한 긍정의 기운이 채워질 거예요"와 같이 **희망적이고 따뜻한 긍정의 메시지**를 다정하게 담아내세요.
3. 만약 사용자의 오늘의 기분/상태(${todayMood})에 화남, 짜증, 다툼, 혼남, 빡침, 열받음, 스트레스 등 마찰/스트레스 관련 키워드가 포함되어 있다면, 사용자의 속상한 마음을 공감해 주고 '기분 전환 및 스트레스 해소'에 어울리는 따뜻한 조언을 담아내세요.
4. coachingComment는 **2~3문장 이내**로 짧고 다정하게 작성하세요. 사주 오행 단어는 언급 금지.
${isEn ? `5. Output language: English. Start with "${name}, your battery is [score]% today! [emoji]"` : `5. 출력 언어: 한국어. 첫 문장은 "${name}, 오늘 배터리는 [점수]%네요! [이모지]"로 시작.`}

**언어 지침**: ${isEn ? "Write in warm, friendly, natural English." : "반말 금지, 항상 다정한 존댓말(해요체) 사용."}
응답은 아래 JSON 스키마만 반환하세요:
{ "conditionBattery": number, "coachingComment": string }
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conditionBattery: { type: Type.INTEGER, description: "0~100 사이 정수" },
              coachingComment: { type: Type.STRING, description: "존댓말 코칭 한마디 (최대 2~3문장)" },
            },
            required: ["conditionBattery", "coachingComment"],
          },
        },
      });

      if (response.text) {
        const parsedRes = JSON.parse(response.text.trim());
        if (typeof parsedRes.conditionBattery === "number" && parsedRes.coachingComment) {
          result = parsedRes;
          if (isDistressMood) {
            result.conditionBattery = Math.min(30, Math.max(18, result.conditionBattery));
          }
        }
      }
    } catch (apiError: any) {
      console.error("Gemini API Error, using fallback:", apiError.message);
    }

    setCached(cacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error("Coaching endpoint error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ================= /api/matching =================
app.post("/api/matching", async (req, res) => {
  try {
    const parsed = matchingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
    }
    const input = parsed.data;
    const currentBattery = input.userBattery && input.userBattery > 0 ? input.userBattery : 70;

    // Safety: Immediate fallback for severe distress signals
    if (containsCrisisSignal(input.relationType, input.targetName)) {
      const isEn = input.language === "en";
      return res.json({
        score: 30,
        chemistryLevel: isEn ? "Safety Support 🛡️" : "안전 보호 쉼표 🛡️",
        chemistryEmoji: "🛡️",
        coachingMessage: isEn ? CRISIS_MESSAGE_EN : CRISIS_MESSAGE_KO,
        physicalMatch: 30,
        emotionalMatch: 30,
        intellectualMatch: 30,
        isCrisis: true,
      });
    }

    const cacheKey = getCacheKey("matching", { ...input, currentBattery });
    const cached = getCached<any>(cacheKey);
    if (cached) return res.json(cached);

    let result = fallbackMatching(input, currentBattery);

    try {
      const ai = getGeminiClient();
      const { userName, userBirthdate, userGender, targetName, targetBirthdate, relationType } = input;
      const userBio = calculateBiorhythmServer(userBirthdate);
      const targetBio = calculateBiorhythmServer(targetBirthdate);

      const prompt = `
당신은 두 사람의 생년월일 기반 바이오리듬(신체 23일, 감정 28일, 지성 33일 주기 파동) 및 입력된 관계 상태를 분석하는 인연 리듬 분석가입니다.

사용자: ${userName} / ${userBirthdate} / ${userGender || "여자"} / 오늘 배터리 ${currentBattery}% (바이오리듬 평균: ${userBio.averageScore}%)
상대방: ${targetName} / ${targetBirthdate} (바이오리듬 평균: ${targetBio.averageScore}%) / 관계·상태: ${relationType}

[규칙]
1. 두 사람의 신체, 감정, 지성 바이오리듬 주파수의 조화도(0~100%) 및 사용자가 적어준 관계·상태 글('${relationType}')을 감성 분석하여 종합 score를 계산하세요.
2. todayChemistryMatch 수치는 사용자가 입력한 관계·상태 글('${relationType}')의 감정, 설렘, 갈등, 이슈 상태를 분석하여 계산한 '오늘 케미 매칭 %' (18~98) 수치입니다. (예: 긍정/달달 85~98%, 갈등/싸움 20~45%, 평범 65~80%)
3. physicalMatch, emotionalMatch, intellectualMatch, todayChemistryMatch 수치는 종합 score와 일관되도록 동기화하여 부여하세요.
4. score에 따라 chemistryLevel/chemistryEmoji 지정: 90+ "환상의 리듬 케미! 💕"/"💖", 80-89 "든든한 에너지 짝꿍! ⭐"/"⭐", 70-79 "편안한 주파수 🫧"/"🍬", 60-69 "무난한 공존 🍃"/"🌱", 59- "파동 조정 필요 ⚡"/"🔌"
5. coachingMessage 규칙: 사용자가 입력한 관계 및 오늘상태('${relationType}')를 언급하면서 따뜻한 공감과 바이오 파동 기반의 조언을 건네세요. 2~3문장 이내, 다정한 존댓말. "사주 오행" 표현 사용 금지.

응답은 아래 JSON 스키마만 반환하세요:
{ "score": number, "chemistryLevel": string, "chemistryEmoji": string, "coachingMessage": string, "todayChemistryMatch": number, "physicalMatch": number, "emotionalMatch": number, "intellectualMatch": number }
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "18~98 사이 정수" },
              chemistryLevel: { type: Type.STRING },
              chemistryEmoji: { type: Type.STRING },
              coachingMessage: { type: Type.STRING, description: "최대 2~3문장" },
              todayChemistryMatch: { type: Type.INTEGER, description: "오늘 케미 매칭 % (18~98)" },
              physicalMatch: { type: Type.INTEGER, description: "신체 궁합 % (0~100)" },
              emotionalMatch: { type: Type.INTEGER, description: "감정 궁합 % (0~100)" },
              intellectualMatch: { type: Type.INTEGER, description: "지성 궁합 % (0~100)" },
            },
            required: ["score", "chemistryLevel", "chemistryEmoji", "coachingMessage", "todayChemistryMatch", "physicalMatch", "emotionalMatch", "intellectualMatch"],
          },
        },
      });

      if (response.text) {
        const parsedRes = JSON.parse(response.text.trim());
        if (typeof parsedRes.coachingMessage === "string") {
          const tChem = typeof parsedRes.todayChemistryMatch === "number" ? parsedRes.todayChemistryMatch : result.todayChemistryMatch;
          const pMatch = typeof parsedRes.physicalMatch === "number" ? parsedRes.physicalMatch : result.physicalMatch;
          const eMatch = typeof parsedRes.emotionalMatch === "number" ? parsedRes.emotionalMatch : result.emotionalMatch;
          const iMatch = typeof parsedRes.intellectualMatch === "number" ? parsedRes.intellectualMatch : result.intellectualMatch;

          // 4개 세부 항목의 산술 평균으로 종합 score 100% 정합성 보장
          const exactAvgScore = Math.max(18, Math.min(98, Math.round((tChem + pMatch + eMatch + iMatch) / 4)));
          const { level, emoji } = getChemistry(exactAvgScore);

          result = {
            ...result,
            ...parsedRes,
            todayChemistryMatch: tChem,
            physicalMatch: pMatch,
            emotionalMatch: eMatch,
            intellectualMatch: iMatch,
            score: exactAvgScore,
            chemistryLevel: level,
            chemistryEmoji: emoji,
          };
        }
      }
    } catch (apiError: any) {
      console.error("Gemini Matching API Error, using fallback:", apiError.message);
    }

    setCached(cacheKey, result);
    return res.json(result);
  } catch (err: any) {
    console.error("Matching endpoint error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============ Vite(dev) / 정적 파일(prod) 서빙 ============
async function initServer() {
  const distPath = path.join(process.cwd(), "dist");

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    console.log("Vite dev middleware loaded.");
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // If request has a file extension (e.g. .png, .json, .js, .css), return 404 instead of SPA index.html
      if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
        return res.status(404).send("File not found");
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
