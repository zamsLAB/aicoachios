import { BiorhythmData, calculateBiorhythm } from "./biorhythm";

export interface MatchingResult {
  score: number;
  chemistryLevel: string;
  chemistryEmoji: string;
  coachingMessage: string;
  todayChemistryMatch: number;
  physicalMatch: number;
  emotionalMatch: number;
  intellectualMatch: number;
  userBio: BiorhythmData;
  targetBio: BiorhythmData;
}

export function analyzeMatching(
  userName: string,
  userBirthdate: string,
  _userGender: string,
  targetName: string,
  targetBirthdate: string,
  relationType: string, // "친구" | "썸/연인" | "가족" | "기타" 또는 사용자 입력 텍스트
  userBattery?: number,
  lang: "ko" | "en" = "ko"
): MatchingResult {
  const isEn = lang === "en";
  const currentBattery = typeof userBattery === "number" && userBattery > 0 ? userBattery : 70;

  // 1. 생년월일 기반 바이오리듬 계산
  const userBio = calculateBiorhythm(userBirthdate, new Date(), lang);
  const targetBio = calculateBiorhythm(targetBirthdate, new Date(), lang);

  // 2. 항목별 바이오리듬 조화도 (위상차 기반) 계산
  const calculatePhaseMatch = (uScore: number, tScore: number, weightSeed: number) => {
    const rawDiff = Math.abs(uScore - tScore);
    const similarity = 100 - rawDiff * 0.65;
    const cappedMatch = Math.round(similarity * 0.88 + weightSeed);
    return Math.max(18, Math.min(98, cappedMatch));
  };

  const rawPhysical = calculatePhaseMatch(userBio.physical.score, targetBio.physical.score, 4);
  const rawEmotional = calculatePhaseMatch(userBio.emotional.score, targetBio.emotional.score, 2);
  const rawIntellectual = calculatePhaseMatch(userBio.intellectual.score, targetBio.intellectual.score, 5);

  // 사용자가 남긴 글(관계/상태 텍스트) 기반 '오늘 케미' 점수 계산
  const relationLower = relationType.toLowerCase();
  const negativeConflictKeywords = [
    "싸움", "다툼", "어색", "냉전", "삐침", "화남", "화나", "짜증", "속상", "혼남", "혼났", "혼나", "야단", "꾸중", "잔소리", "마찰", "갈등", "언쟁", "시비", "답답", "억울", "빡침", "열받",
    "fight", "argue", "conflict", "awkward", "mad", "angry", "upset", "annoyed"
  ];
  const breakKeywords = ["헤어짐", "남남", "이별", "차단", "손절", "breakup", "broken", "blocked", "ex"];
  const loveKeywords = ["1일", "고백", "사귐", "설렘", "달달", "좋아", "사랑", "짝사랑", "연애", "데이트", "심쿵", "행복", "최고", "love", "crush", "date", "sweet", "couple", "dating"];
  const friendKeywords = ["베프", "찐친", "친함", "친구", "동료", "가족", "식구", "friend", "bestie", "colleague", "family"];

  let textMatchScore = 75; // 기본 평범한 관계 점수

  if (negativeConflictKeywords.some((k) => relationLower.includes(k))) {
    textMatchScore = 32;
  } else if (breakKeywords.some((k) => relationLower.includes(k))) {
    textMatchScore = 20;
  } else if (loveKeywords.some((k) => relationLower.includes(k))) {
    textMatchScore = 93;
  } else if (friendKeywords.some((k) => relationLower.includes(k))) {
    textMatchScore = 84;
  } else if (relationType.trim().length > 0) {
    let textHash = 0;
    for (let i = 0; i < relationType.length; i++) textHash += relationType.charCodeAt(i);
    textMatchScore = 65 + (textHash % 20); // 65 ~ 84
  }

  const todayChemistryMatch = Math.max(18, Math.min(98, textMatchScore));
  const physicalMatch = rawPhysical;
  const emotionalMatch = rawEmotional;
  const intellectualMatch = rawIntellectual;

  // 4개 항목(오늘 케미, 신체 매칭, 감성 매칭, 지성 매칭)의 정확한 산술 평균으로 종합 score 결정!
  const score = Math.max(18, Math.min(98, Math.round((todayChemistryMatch + physicalMatch + emotionalMatch + intellectualMatch) / 4)));

  // 관계 상태 및 페르소나/어투 분석
  const relationMention = relationType.trim() ? `'${relationType.trim()}'` : (isEn ? "Current relationship" : "현재 관계");
  let coachingMessage = "";
  let hasSpecialStatus = false;

  const isNoona = relationLower.includes("누나") || relationLower.includes("언니");
  const isOpp = relationLower.includes("오빠") || relationLower.includes("형");
  const isBanmal = relationLower.includes("반말") || relationLower.includes("친구처럼") || relationLower.includes("친구");
  const isJondaet = relationLower.includes("존댓말") || relationLower.includes("예의") || relationLower.includes("정중");

  if (negativeConflictKeywords.some((k) => relationLower.includes(k))) {
    if (isNoona) {
      coachingMessage = `${userName}아, ${targetName}(이)랑 감정 파동이 살짝 어긋났나 보네. '${relationMention}' 상황 때문에 마음 많이 복잡하고 속상했지? 지금은 서로 파동이 예민한 상태라 사소한 말에도 부딪힐 수 있어. 오늘은 귀여운 이모티콘으로 쿨하게 안부만 전하고, 내일 맛있는 간식 챙겨주며 대화해봐. 누나가 보니까 금방 다시 좋아질 거니까 너무 걱정 마! 🍓⚡`;
    } else if (isBanmal && !isJondaet) {
      coachingMessage = `${userName}아! ${targetName}이랑 감정 파동이 잠깐 꼬인 것 같아. '${relationMention}' 상황에 너무 맘 상해있지 마. 오늘 둘 다 감정 곡선이 날카로운 편이라 긴 대화는 피하는 게 좋아. 저녁에 가볍게 릴스나 짤 하나 던지면서 분위기 먼저 풀어봐! 쿨하게 풀면 언제 그랬냐는 듯 다시 베프 모드로 돌아올 거야! 🍓⚡`;
    } else {
      coachingMessage = isEn
        ? `Your emotional rhythm with ${targetName} is a little off right now. The situation described as ${relationMention} is likely temporary, so it's best to take a gentle approach today. Avoid heavy topics for now and send a warm, low-pressure message tonight. Things usually feel softer again after a little space and calm. 🍓⚡`
        : `${userName}님과 ${targetName}님의 감정 바이오리듬 주파수가 잠시 교차하는 시점이에요. 적어주신 ${relationMention} 상황은 일시적인 파동의 흐름이니 너무 자책하거나 조급해하지 마세요. 오늘은 감정이 예민할 수 있으니 진지한 담판보다는 숨고르기가 필요해요. 오늘 밤 따뜻한 이모티콘과 함께 부드러운 안부 톡을 먼저 건네보세요. 내일이면 한결 부드러운 대화가 이어질 거예요! 🍓⚡`;
    }
    hasSpecialStatus = true;
  } else if (breakKeywords.some((k) => relationLower.includes(k))) {
    if (isNoona) {
      coachingMessage = `${userName}아, 그동안 마음고생 진짜 많았지? 감정 파동이 내려앉았을 땐 상대방 생각하느라 네 에너지를 갉아먹지 않는 게 제일 중요해. 오늘은 네가 제일 좋아하는 음식 배달시켜서 맛있게 먹자. 따뜻한 차 한잔 마시면서 온전히 너만을 위한 꿀잠을 자봐. 누나가 항상 응원하고 있으니까 힘내자! 🧸🕯️`;
    } else {
      coachingMessage = isEn
        ? `It seems the emotional wave between you two has drifted a little. Instead of forcing a fix right now, focus on restoring your own energy first. A warm rest, a quiet evening, and a little time to breathe will help you feel more like yourself again. Better energy will come back naturally soon. 🧸🕯️`
        : `두 사람의 감정 바이오리듬 파동에 큰 거리가 생겨 마음이 많이 아프실 것 같아요. 지금은 상대와의 억지 파동 맞추기보다 ${userName}님 자신의 바이오 에너지를 먼저 온전히 채워야 할 때입니다. 과거의 마찰을 되새기기보다는 오늘 하루 나 자신에게 따뜻한 선물을 건네보세요. 편안한 휴식과 숙면이 마음에 깊은 평온을 되찾아줄 거예요. ${userName}님의 빛나는 내일을 진심으로 응원합니다. 🧸🕯️`;
    }
    hasSpecialStatus = true;
  } else if (loveKeywords.some((k) => relationLower.includes(k))) {
    if (isNoona) {
      coachingMessage = `대박! ${userName}아, ${targetName}(이)랑 오늘 케미(${todayChemistryMatch}%) 완전 핑크빛이잖아! 둘 다 감정 파동이 최상위권이라 눈빛만 봐도 통하는 날이야. 오늘 같이 예쁜 카페 가거나 소소한 산책 데이트 즐겨봐. 누나가 보니까 오늘 선톡 하나만 툭 던져도 하트 뿅뿅 분위기 될 거야. 망설이지 말고 지금 바로 다정하게 연락해봐! 💕`;
    } else if (isBanmal && !isJondaet) {
      coachingMessage = `와우! 너랑 ${targetName} 케미 지수(${todayChemistryMatch}%) 완전 불타오르는데? 오늘 두 사람 감정 리듬이 완벽하게 싱크 맞아서 티키타카 대박일 거야. 고민하지 말고 '오늘 뭐해?'라고 바로 선톡 고고해봐! 맛있는 디저트나 재밌는 영상 공유하면서 이야기꽃 피우기 딱 좋은 타이밍이야. 오늘 완전 둘만의 날이니까 신나게 즐겨봐! 💕`;
    } else {
      coachingMessage = isEn
        ? `Wow! Your chemistry score is ${todayChemistryMatch}% and the energy between you and ${targetName} is really flowing. This is a perfect moment to send a sweet message, plan a coffee date, or share a little thoughtful moment. The connection feels warm, easy, and naturally romantic today. 💕`
        : `와우! 두 사람의 바이오리듬(오늘 케미 ${todayChemistryMatch}%) 파동이 매우 매끄럽게 동기화되어 있어요! ${targetName}님과의 ${relationMention} 분위기가 핑크빛으로 한껏 무르익은 최상의 날입니다. 서로의 눈빛과 말 한마디에도 설렘과 다정함이 자연스럽게 묻어나는 타이밍이에요. 오늘 퇴근길이나 저녁에 달콤한 음료와 함께 기분 좋은 하트 톡을 먼저 건네보세요. 두 분 사이에 더욱 깊고 사랑스러운 유대감이 피어날 거예요! 💕`;
    }
    hasSpecialStatus = true;
  }

  let chemistryLevel = isEn ? "Comfortable 🍃" : "무난무난 🍃";
  let chemistryEmoji = "🌱";
  if (score >= 90) {
    chemistryLevel = isEn ? "Dream Team Match! 💕" : "환상의 짝꿍 케미! 💕";
    chemistryEmoji = "😍";
  } else if (score >= 80) {
    chemistryLevel = isEn ? "Strong Partner! ⭐" : "든든한 오직 내편! ⭐";
    chemistryEmoji = "🤩";
  } else if (score >= 70) {
    chemistryLevel = isEn ? "Calm Frequency 🫧" : "늘 편안한 주파수 🫧";
    chemistryEmoji = "😊";
  } else if (score >= 60) {
    chemistryLevel = isEn ? "Steady Balance 🌱" : "무난한 조화로움 🌱";
    chemistryEmoji = "😉";
  } else {
    chemistryLevel = isEn ? "Adjustment Needed ⚡" : "파동 조정 필요 ⚡";
    chemistryEmoji = "😶‍🌫️";
  }

  if (!hasSpecialStatus) {
    if (isNoona) {
      coachingMessage = score >= 85
        ? `${userName}아, ${targetName}(이)랑 바이오 케미(${score}점) 완전 찰떡이다! 서로 신체·감정 리듬이 딱 맞아떨어져서 같이 있으면 에너지 넘칠 거야. 오늘 같이 맛있는 거 먹으러 가거나 신나게 수다 떨어봐. 누나가 보니까 둘이 만나면 스트레스 싹 날아갈 각이야. 즐거운 추억 많이 만들고 와! 📸✨`
        : `${userName}아, ${targetName}(이)랑은 차분하고 편안하게 잘 맞는 스타일이야. 서로 부담 없는 페이스를 유지하면서 다정하게 챙겨주면 좋아. 오늘 가볍게 '오늘 하루 어땠어?' 하고 안부 물어봐. 잔잔한 대화 속에서 서로 더 돈독해질 거야. 누나가 항상 응원할게! ☕`;
    } else if (isOpp) {
      coachingMessage = score >= 85
        ? `${userName}아, ${targetName}(이)랑 궁합(${score}점) 대박인데? 오늘 서로 컨디션 파동이 아주 좋아서 뭘 해도 척척 맞을 거야. 자신 있게 먼저 밥 한 끼 먹자고 연락해봐! 형/오빠가 볼 때 오늘이 아주 좋은 타이밍이다. 멋지게 리드해봐! 📸✨`
        : `${userName}아, ${targetName}(이)랑은 서서히 호흡을 맞춰가는 타이밍이야. 너무 조급해하지 말고 편안하게 들어주는 자세가 최고야. 오늘 부담 없는 일상 이야기로 자연스럽게 대화 물꼬를 트자. 조금씩 가까워지는 재미가 쏠쏠할 거다! ☕`;
    } else if (isBanmal && !isJondaet) {
      coachingMessage = score >= 85
        ? `야! 너랑 ${targetName} 케미 지수(${score}점) 완전 대박이야! 오늘 둘 다 에너지 뿜뿜하는 날이라 티키타카 제대로 터질 듯. 같이 코노 가거나 맛있는 야식 먹으면서 수다 떨기 딱 좋은 날임! 망설이지 말고 지금 당장 연락해서 약속 잡아봐! 📸✨`
        : `너랑 ${targetName}은 잔잔하고 편안하게 오래 가는 찐친 스타일이야. 오늘 서로 컨디션이 차분하니까 자극적인 것보단 소소한 일상이 딱이야. 가볍게 재미있는 릴스나 일상 톡 하나 보내면서 툭 연락해봐! 편안한 대화 속에서 기분 좋은 힐링이 될 거야! ☕`;
    } else if (relationType.includes("친구") || relationType.includes("찐친") || relationType.includes("베프") || relationLower.includes("friend")) {
      coachingMessage = isEn
        ? (score >= 85
            ? `Your physical rhythm (${physicalMatch}%) and emotional rhythm (${emotionalMatch}%) are in great sync with ${targetName}. Today feels like a perfect time to spend time together, share a good meal, and make a memory. A simple invite or a friendly message could make the day even better. 📸✨`
            : `Your rhythm with ${targetName} feels steady, easy, and comfortable. Today is a good day for light conversation and small moments of connection. A thoughtful message or a casual check-in will help both of you feel more relaxed and close. ☕`)
        : (score >= 85
            ? `${userName}님과 ${targetName}님은 신체(${physicalMatch}%)·감정(${emotionalMatch}%) 바이오리듬이 서로 완벽하게 호응하고 있어요! 오늘 두 분 모두 긍정적인 에너지가 가득하여 함께할 때 큰 시너지가 납니다. 맛있는 음식을 함께 나누거나 핫플에 방문하기에 가장 이상적인 타이밍이에요. 먼저 기분 좋은 약속을 제안해보시면 두 배로 즐거운 하루가 될 것입니다! 📸✨`
            : `${userName}님과 ${targetName}님의 지성·감정 리듬이 잔잔하고 편안하게 흐르고 있어요. 특별히 무리하지 않아도 곁에 있는 것만으로 안정감을 주는 소중한 인연입니다. 오늘 가볍게 안부를 묻거나 재미있는 소식을 공유해보세요. 소소한 온기가 두 분의 우정을 더욱 깊고 따뜻하게 만들어줄 거예요. ☕`);
    } else if (relationType.includes("썸") || relationType.includes("연인") || relationLower.includes("crush") || relationLower.includes("couple")) {
      coachingMessage = isEn
        ? (score >= 85
            ? `This is a very sweet moment for you and ${targetName}. Your emotional rhythm is at ${emotionalMatch}% and the connection feels genuinely warm. A coffee date, a short call, or a thoughtful message would fit perfectly right now. Go for it with confidence. 💕`
            : `Your rhythm with ${targetName} is gentle and warm, which is a good sign for building trust. Rather than rushing, a sincere and thoughtful message will make a strong impression. Show a little care and let the connection grow naturally. 💌`)
        : (score >= 85
            ? `어머나! 두 분의 감정 바이오리듬 궁합이 무려 ${emotionalMatch}%로 심쿵 지수가 넘쳐납니다! 오늘 두 분의 주파수가 로맨틱한 공명을 이루어 사소한 눈맞춤에도 설렘이 가득할 거예요. 저녁 시간이나 퇴근길에 달콤한 선톡을 보내거나 짧은 티타임을 제안해보세요. 오늘 건네는 다정한 한마디가 두 분의 관계를 훨씬 가깝게 이끌어줄 것입니다! 💕`
            : `${userName}님과 ${targetName}님의 바이오 파동이 차분하고 포근한 조화를 이루고 있어요. 급한 밀당보다는 상대방의 하루를 다정하게 챙겨주는 따뜻한 관심이 큰 호감을 부릅니다. '오늘 고생 많았어'라는 따뜻한 격려 한마디를 건네보세요. 은은하고 깊은 신뢰와 애정이 싹트는 계기가 될 것입니다. 💌`);
    } else if (relationType.includes("가족") || relationLower.includes("family")) {
      coachingMessage = isEn
        ? `Compatibility score with ${targetName} is ${score} pts. Steady and dependable family energy flows between you two. Today is great for showing heartfelt gratitude and care. A short phone call or sharing a warm meal will bring immense joy to both hearts. 🏠`
        : `두 사람의 바이오리듬 궁합 점수는 ${score}점입니다. 서서히 맞물려가는 든든하고 포근한 패밀리 에너지 파동을 지니고 계시네요. 오늘은 서로의 수고를 알아주고 따뜻한 칭찬 한마디를 건네기 좋은 날입니다. 저녁에 가볍게 안부 전화를 걸어 다정한 마음을 나누어보세요. 가족의 든든한 온기가 큰 힘이 될 것입니다. 🏠`;
    } else {
      coachingMessage = isEn
        ? `Compatibility score with ${targetName} is ${score} pts. Your biorhythms balance each other well today. Understanding and acknowledging each other's state will create wonderful synergy. Keep communication clear, gentle, and positive throughout the day! ⭐`
        : `${userName}님과 ${targetName}님의 바이오리듬 궁합은 ${score}점입니다. 서로의 신체와 감정 파동이 상호 보완적인 균형을 이루고 있어요. 상대방의 오늘 컨디션을 존중하고 부드럽게 의견을 나누면 놀라운 시너지가 발휘됩니다. 긍정적인 미소와 함께 편안한 대화를 나누어보세요. 서로에게 든든한 힘이 되는 하루가 될 것입니다! ⭐`;
    }
  }

  return {
    score,
    chemistryLevel,
    chemistryEmoji,
    coachingMessage,
    todayChemistryMatch,
    physicalMatch,
    emotionalMatch,
    intellectualMatch,
    userBio,
    targetBio,
  };
}
