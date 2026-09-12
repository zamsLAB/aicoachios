import { EmoticonType } from "../types";

export interface BiorhythmDetail {
  raw: number; // -100 ~ 100
  score: number; // 0 ~ 100
  status: string; // "최고조" | "양호" | "전환기" | "저조" | "충전필요"
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

export function calculateBiorhythm(birthdateStr?: string, targetDate: Date = new Date(), lang: "ko" | "en" = "ko"): BiorhythmData {
  const isEn = lang === "en";
  if (!birthdateStr) {
    // 생년월일이 없을 경우 기본값
    return {
      physical: { raw: 50, score: 75, status: isEn ? "Good 🏃" : "신체 양호 🏃", color: "from-emerald-400 to-green-500", emoji: "🏃" },
      emotional: { raw: 60, score: 80, status: isEn ? "Peak ❤️" : "감성 최고 ❤️", color: "from-pink-400 to-rose-500", emoji: "❤️" },
      intellectual: { raw: 40, score: 70, status: isEn ? "Good 🧠" : "지성 양호 🧠", color: "from-blue-400 to-indigo-500", emoji: "🧠" },
      averageScore: 75,
      summaryComment: isEn ? "Biorhythm frequencies are well balanced!" : "기본 바이오리듬 주파수가 안정적이에요!",
    };
  }

  const birthDate = new Date(birthdateStr);
  if (isNaN(birthDate.getTime())) {
    return calculateBiorhythm(undefined, targetDate, lang);
  }

  // 출생일부터 오늘까지 총 경과 일수 (Days)
  const diffTime = targetDate.getTime() - birthDate.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 신체(23일), 감정(28일), 지성(33일) 삼각함수 Sine 계산 (-100 ~ +100)
  const pRaw = Math.sin((2 * Math.PI * days) / 23) * 100;
  const eRaw = Math.sin((2 * Math.PI * days) / 28) * 100;
  const iRaw = Math.sin((2 * Math.PI * days) / 33) * 100;

  // 18~98 점수로 변환 (raw 범위: -100 ~ +100)
  const scaleTo18to98 = (raw: number) => Math.round(18 + ((raw + 100) / 200) * 80);
  const pScore = scaleTo18to98(pRaw);
  const eScore = scaleTo18to98(eRaw);
  const iScore = scaleTo18to98(iRaw);

  const getDetail = (raw: number, score: number, emoji: string, typeNameKo: string, typeNameEn: string): BiorhythmDetail => {
    let statusText = isEn ? "Good" : "무난함";
    let color = "from-emerald-400 to-teal-500";
    if (score >= 80) {
      statusText = isEn ? "Peak ✨" : "최고조 ✨";
      color = "from-pink-500 to-rose-500";
    } else if (score >= 60) {
      statusText = isEn ? "Rising 🚀" : "상승기 🚀";
      color = "from-emerald-400 to-teal-500";
    } else if (score >= 40) {
      statusText = isEn ? "Calm 🍃" : "평온기 🍃";
      color = "from-amber-400 to-yellow-500";
    } else if (score >= 20) {
      statusText = isEn ? "Low 🪫" : "저조기 🪫";
      color = "from-orange-400 to-amber-500";
    } else {
      statusText = isEn ? "Rest 💤" : "급충전 💤";
      color = "from-rose-500 to-red-600";
    }
    const typeName = isEn ? typeNameEn : typeNameKo;
    return { raw: Math.round(raw), score, status: `${typeName} ${statusText}`, color, emoji };
  };

  const physical = getDetail(pRaw, pScore, "🏃", "신체", "Physical");
  const emotional = getDetail(eRaw, eScore, "❤️", "감성", "Emotional");
  const intellectual = getDetail(iRaw, iScore, "🧠", "지성", "Intellectual");

  const averageScore = Math.round((pScore + eScore + iScore) / 3);

  let summaryComment = "";
  if (isEn) {
    if (averageScore >= 80) {
      summaryComment = "All physical, emotional, and intellectual rhythms are at their peak! 🚀";
    } else if (averageScore >= 60) {
      summaryComment = "A vibrant day full of active and positive biorhythm energy! 😆";
    } else if (averageScore >= 40) {
      summaryComment = "A calm and steady rhythm, perfect for enjoying a peaceful day 🍃";
    } else {
      summaryComment = "Your biorhythm suggests resting. Take time to recharge today 🪫";
    }
  } else {
    if (averageScore >= 80) {
      summaryComment = "신체·감성·지성 삼박자가 모두 고조된 최상의 리듬입니다! 🚀";
    } else if (averageScore >= 60) {
      summaryComment = "활기차고 긍정적인 바이오 에너지가 넘쳐나는 하루입니다 😆";
    } else if (averageScore >= 40) {
      summaryComment = "무난하고 안정적인 리듬으로 잔잔한 일상을 즐기기 좋습니다 🍃";
    } else {
      summaryComment = "바이오리듬이 휴식을 요구하고 있어요. 오늘은 차분히 충전해보세요 🪫";
    }
  }

  return { physical, emotional, intellectual, averageScore, summaryComment };
}

// 당일 기분 상태(Mood)와 생년월일 바이오리듬을 결합한 종합 배터리 지수 계산
export function calculateOverallBattery(emoticon: EmoticonType, birthdateStr?: string, targetDate?: Date, todayMood?: string): {
  battery: number;
  biorhythm: BiorhythmData;
  moodBaseScore: number;
} {
  const moodScoreMap: Record<EmoticonType, number> = {
    VERY_HAPPY: 95,
    HAPPY: 78,
    NEUTRAL: 55,
    SAD: 35,
    CRYING: 20,
    ANGRY: 10,
  };

  const moodBaseScore = moodScoreMap[emoticon] ?? 60;
  const biorhythm = calculateBiorhythm(birthdateStr, targetDate);

  // 기분(60%) + 바이오리듬 종합점수(40%)
  let calculated = Math.round(moodBaseScore * 0.6 + biorhythm.averageScore * 0.4);

  if (todayMood) {
    const distressKeywords = [
      "아픔", "아파", "아프", "아픕", "병", "병원", "몸살", "상처", "감기", "통증", "두통", "복통",
      "우울", "슬픔", "슬퍼", "슬픈", "눈물", "울었", "울고", "상심", "낙담", "절망", "비참", "울적",
      "혼자", "외로", "외롭", "외로움", "고독", "공허", "쓸쓸",
      "힘들", "힘듦", "힘들어", "괴롭", "지침", "지쳐", "지쳤", "번아웃"
    ];
    if (distressKeywords.some((k) => todayMood.includes(k))) {
      calculated = Math.min(28, calculated);
    }
  }

  const battery = Math.max(18, Math.min(98, calculated));

  return { battery, biorhythm, moodBaseScore };
}
