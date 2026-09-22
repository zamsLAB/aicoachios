export interface UserProfile {
  name: string;
  birthdate: string; // YYYY-MM-DD
  birthTime: string; // Hour selection or "모름"
  gender?: string; // Optional gender
  profilePic?: string; // Optional profile picture base64 string
  notificationEnabled?: boolean; // 알림 활성화 여부
  notificationTime?: string; // 알림 희망 시간
  autoNotificationEnabled?: boolean; // 자동 데일리 알림 (08:00, 12:00, 17:00, 21:00)
  isGuest?: boolean; // 게스트 사용자 여부
}

export type EmoticonType = "VERY_HAPPY" | "HAPPY" | "NEUTRAL" | "SAD" | "CRYING" | "ANGRY";

export interface DiaryLog {
  date: string; // YYYY-MM-DD
  emoticon: EmoticonType;
  note: string;
  battery?: number; // Optional battery score calculated by AI
}

export interface MatchingTarget {
  id: string;
  name: string;
  birthdate: string; // YYYY-MM-DD
  birthTime: string; // Hour selection or "모름"
  relationType: string; // e.g. "친구", "연인", "가족" 등
  photo?: string; // Base64 encoded image
}

export interface RecommendedItem {
  emoji: string;
  name: string;
  desc: string;
}

export interface RecommendedPlace {
  emoji: string;
  name: string;
  desc: string;
}

export interface CoachingResponse {
  conditionBattery: number;
  coachingComment: string;
  items: RecommendedItem[];
  places: RecommendedPlace[];
  isCrisis?: boolean;
}

export interface BiorhythmDetail {
  raw: number;
  score: number;
  status: string;
  color: string;
  emoji: string;
}

export interface BiorhythmData {
  physical: BiorhythmDetail;
  emotional: BiorhythmDetail;
  intellectual: BiorhythmDetail;
  averageScore: number;
  summaryComment: string;
}

export interface EmoticonConfig {
  type: EmoticonType;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  batteryRange: string;
  teenComment: string;
}

export const EMOTICONS: Record<EmoticonType, EmoticonConfig> = {
  VERY_HAPPY: {
    type: "VERY_HAPPY",
    emoji: "🥰",
    label: "완전 행복",
    color: "pink-500",
    bg: "bg-pink-50/70",
    border: "border-pink-100",
    text: "text-pink-600",
    batteryRange: "81~100%",
    teenComment: "짱 행복해! 온 우주가 내 편인 것 같은 하루야 ✨"
  },
  HAPPY: {
    type: "HAPPY",
    emoji: "😊",
    label: "좋음",
    color: "purple-400",
    bg: "bg-purple-50/50",
    border: "border-purple-100/40",
    text: "text-purple-600",
    batteryRange: "61~80%",
    teenComment: "기분 완전 상콤달콤! 좋은 에너지가 가득해 🎀"
  },
  NEUTRAL: {
    type: "NEUTRAL",
    emoji: "😐",
    label: "보통",
    color: "amber-400",
    bg: "bg-amber-50/50",
    border: "border-amber-100/40",
    text: "text-amber-600",
    batteryRange: "41~60%",
    teenComment: "평범하고 소소한 하루, 그래도 나쁘지 않아! 💕"
  },
  SAD: {
    type: "SAD",
    emoji: "😢",
    label: "슬픔",
    color: "blue-400",
    bg: "bg-blue-50/50",
    border: "border-blue-100/40",
    text: "text-blue-600",
    batteryRange: "25~40%",
    teenComment: "조금 울적하고 지치네.. 리프레쉬 힐링해 🌿"
  },
  CRYING: {
    type: "CRYING",
    emoji: "😭",
    label: "눈물",
    color: "indigo-400",
    bg: "bg-indigo-50/50",
    border: "border-indigo-100/40",
    text: "text-indigo-600",
    batteryRange: "10~24%",
    teenComment: "눈물이 퐁퐁 날 것 같아.. 따뜻한 위로가 필요해 🤗 "
  },
  ANGRY: {
    type: "ANGRY",
    emoji: "😡",
    label: "화남",
    color: "rose-400",
    bg: "bg-rose-50/50",
    border: "border-rose-100/40",
    text: "text-rose-600",
    batteryRange: "0~9%",
    teenComment: "뿌엥! 다 마음에 안 들어! 맛있는 거 먹고 풀자 💢"
  }
};
