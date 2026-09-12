import { RecommendedItem, RecommendedPlace } from "../types";
export { getBatteryRecommendations } from "./recommendations";

export function getCoachingTags(battery: number, birthdate?: string, gender?: string, lang: "ko" | "en" = "ko"): { emoji: string; text: string }[] {
  const isEn = lang === "en";

  // Tag 1: Battery tension status
  let tensionTag = { emoji: "🔋", text: isEn ? "Good Condition" : "컨디션" };
  if (battery <= 30) {
    tensionTag = { emoji: "🪫", text: isEn ? "Low Battery" : "방전주의" };
  } else if (battery <= 60) {
    tensionTag = { emoji: "🔋", text: isEn ? "Recharge Mode" : "충전모드" };
  } else if (battery <= 85) {
    tensionTag = { emoji: "✨", text: isEn ? "Sparkling Energy" : "반짝반짝" };
  } else {
    tensionTag = { emoji: "🔥", text: isEn ? "Peak Vitality" : "불꽃활활" };
  }

  // Tag 2: Gender/Age style tag
  let userGroupTag = { emoji: "☘️", text: isEn ? "Need Healing" : "리프레쉬" };
  if (gender === "FEMALE" || gender === "여자") {
    userGroupTag = { emoji: "🌸", text: isEn ? "Self Care" : "힐링케어" };
  } else if (gender === "MALE" || gender === "남자") {
    userGroupTag = { emoji: "🏃‍♂️", text: isEn ? "Move & Action" : "무브무브" };
  }

  // Tag 3: Simple constellation/zodiac vibe based on birthdate
  let astroTag = { emoji: "🌟", text: isEn ? "Lucky Flow" : "오늘의 행운 존" };
  if (birthdate) {
    const month = parseInt(birthdate.split("-")[1] || "1", 10);
    if ([3, 4, 5].includes(month)) astroTag = { emoji: "🌱", text: isEn ? "Spring Vitality" : "상큼상큼" };
    else if ([6, 7, 8].includes(month)) astroTag = { emoji: "🌊", text: isEn ? "Cool Mind" : "쏘-쿨" };
    else if ([9, 10, 11].includes(month)) astroTag = { emoji: "🍂", text: isEn ? "Rich Spirit" : "알록달록" };
    else astroTag = { emoji: "❄️", text: isEn ? "Crisp Focus" : "엘사파워" };
  }

  return [tensionTag, userGroupTag, astroTag];
}
