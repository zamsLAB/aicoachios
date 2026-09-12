export type Language = "ko" | "en";

export interface Translations {
  // Common & Navigation
  appTitle: string;
  appSubtitle: string;
  tabCoaching: string;
  tabMatching: string;
  tabProfile: string;
  points: string;
  unlimited: string;
  close: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  confirm: string;
  loading: string;
  pointsRewardBanner: string;
  watchAdForPoints: string;
  get100P: string;

  // Login Screen
  loginWithApple: string;
  termsAgreementNote: string;
  termsOfService: string;
  privacyPolicy: string;
  dataDeletion: string;

  // Onboarding
  onboardingTitle: string;
  onboardingTag: string;
  selectImage: string;
  changeImage: string;
  deleteImage: string;
  nameLabel: string;
  nameLimitNote: string;
  namePlaceholder: string;
  genderLabel: string;
  female: string;
  male: string;
  birthdateLabel: string;
  birthTimeLabel: string;
  unknownTime: string;
  hourUnit: string;
  yearUnit: string;
  monthUnit: string;
  dayUnit: string;
  startBtn: string;

  // Coaching Tab
  writeTodayMood: string;
  moodPlaceholder: string;
  checkTodayCondition: string;
  analyzingFrequency: string;
  analyzingData: string;
  todayCondition: string;
  shareResult: string;
  biorhythmAnalysis: string;
  averageScore: string;
  physicalIndex: string;
  emotionalIndex: string;
  intellectualIndex: string;
  recommendedItems: string;
  recommendedMenus: string;
  bottomBannerBadge: string;
  bottomBannerTitle: string;

  // Mood Calendar
  moodCalendarTitle: string;
  calendarFooterHint: string;
  calendarDays: [string, string, string, string, string, string, string];

  // Emoji Modal
  emojiModalTitle: string;
  dailyNoteLabel: string;
  dailyNotePlaceholder: string;
  statusEmojiLabel: string;
  conditionBatteryScore: string;
  recorded: string;
  notAnalyzedYet: string;
  deleteRecord: string;

  // Matching Tab
  matchingIntroTitle: string;
  matchingIntroSubtitle: string;
  targetNameLabel: string;
  targetNamePlaceholder: string;
  targetBirthdateLabel: string;
  relationLabel: string;
  relationPlaceholder: string;
  addSubmit: string;
  targetListTitle: string;
  noTargetsYet: string;
  birthdayLabel: string;
  analysisDone: string;
  checkTodayMatch: string;
  matchingLoadingFrequency: string;
  matchingLoadingAi: string;
  todayMatchStatus: string;
  aiRelationReport: string;
  bioMatchAnalysis: string;
  todayChemistry: string;
  physicalMatchLabel: string;
  emotionalMatchLabel: string;
  intellectualMatchLabel: string;
  meLabel: string;
  targetLabel: string;

  // Profile Tab & Attendance
  freePoints: string;
  freePointsUnlimited: string;
  watchRewardAdText: string;
  attendanceCheck: string;
  attendanceStreak: string;
  attendance5DayReward: string;
  attendanceCheckInBtn: string;
  attendanceCheckedTodayBtn: string;
  protectData: string;
  protectDataDesc: string;
  loginWithAppleBtn: string;
  editProfile: string;
  resetApp: string;
  resetConfirm: string;
  resetAppDone: string;

  // Toast messages
  toastLanguageSwitched: string;
  toastMoodInputRequired: string;
  toastPartnerNameRequired: string;
  toastRelationRequired: string;
  toastPointsNotEnough: string;
}

const rewardBannerCopy: Record<Language, Pick<Translations, "pointsRewardBanner" | "watchAdForPoints" | "get100P">> = {
  ko: {
    pointsRewardBanner: "무료 포인트",
    watchAdForPoints: "리워드 광고 시청",
    get100P: "+ 100P",
  },
  en: {
    pointsRewardBanner: "Free Points",
    watchAdForPoints: "Watch an AD",
    get100P: "+ 100P",
  },
};

export const translations: Record<Language, Translations> = {
  ko: {
    ...rewardBannerCopy.ko,
    appTitle: "AI 데일리 코칭",
    appSubtitle: "매일 나를 코칭해주는 나만의 AI 다이어리 💛",
    tabCoaching: "오늘 코칭",
    tabMatching: "인연 매칭",
    tabProfile: "나의 정보",
    points: "P",
    unlimited: "무제한",
    close: "닫기",
    cancel: "취소",
    save: "저장",
    delete: "삭제",
    edit: "수정",
    confirm: "확인",
    loading: "로딩 중...",

    loginWithApple: "Apple로 로그인",
    termsAgreementNote: "로그인 시 아래사항에 동의하는 것으로 간주됩니다.",
    termsOfService: "서비스 이용약관",
    privacyPolicy: "개인정보처리방침",
    dataDeletion: "데이터 삭제 안내",

    onboardingTitle: "기본 정보 입력 📝",
    onboardingTag: "Onboarding",
    selectImage: "이미지 선택",
    changeImage: "📸 등록",
    deleteImage: "이미지 삭제",
    nameLabel: "이름 (또는 닉네임)",
    nameLimitNote: "최대 8자",
    namePlaceholder: "잇츠미영크크야호",
    genderLabel: "성별 선택 👤",
    female: "여자",
    male: "남자",
    birthdateLabel: "태어난 생년월일 🎂",
    birthTimeLabel: "태어난 시간 (선택) ⏰",
    unknownTime: "모름",
    hourUnit: "시",
    yearUnit: "년",
    monthUnit: "월",
    dayUnit: "일",
    startBtn: "AI 코칭 시작하기 🌟",

    writeTodayMood: "오늘의 기분 상태를 작성해주세요 📝",
    moodPlaceholder: "잠을 푹 자서 상쾌하고 기분이 좋음",
    checkTodayCondition: "오늘 컨디션 확인하기 ✨",
    analyzingFrequency: "에너지 주파수 분석 중...",
    analyzingData: "오늘의 감정 데이터를 분석하는 중...",
    todayCondition: "🔋 오늘의 컨디션",
    shareResult: "결과 공유",
    biorhythmAnalysis: "바이오 리듬 분석",
    averageScore: "오늘 평균 (average)",
    physicalIndex: "신체지수 (Physical)",
    emotionalIndex: "감성지수 (Emotional)",
    intellectualIndex: "지성지수 (Intellectual)",
    recommendedItems: "추천 소품",
    recommendedMenus: "추천 메뉴",
    bottomBannerBadge: "오늘 내 컨디션은?",
    bottomBannerTitle: "AI 데일리 코칭",

    moodCalendarTitle: "기분 달력",
    calendarFooterHint: "💡 오늘 기분을 이모티콘으로 표현해요",
    calendarDays: ["일", "월", "화", "수", "목", "금", "토"],

    emojiModalTitle: "기분 일기",
    dailyNoteLabel: "소소한 오늘 일기 한 줄",
    dailyNotePlaceholder: "오늘 마라탕 먹고 행복했음!",
    statusEmojiLabel: "기분 이모티콘 선택",
    conditionBatteryScore: "🔋 컨디션 배터리 점수",
    recorded: "기록됨",
    notAnalyzedYet: "아직 분석 전이에요",
    deleteRecord: "기록 삭제하기",

    matchingIntroTitle: "인연 등록",
    matchingIntroSubtitle: "오늘 나랑 잘 맞는 인연은 누구일까요?",
    targetNameLabel: "상대방 이름 (또는 닉네임)",
    targetNamePlaceholder: "베프 1호",
    targetBirthdateLabel: "상대방 생년월일",
    relationLabel: "우리는 무슨 사이?",
    relationPlaceholder: "오늘부터 찐친 환상의 짝궁 케미",
    addSubmit: "등록 완료 ✨",
    targetListTitle: "상대방",
    noTargetsYet: "나만의 소중한 인연을 등록해보세요! 💕",
    birthdayLabel: "생일",
    analysisDone: "분석 체크",
    checkTodayMatch: "오늘 매칭 확인",
    matchingLoadingFrequency: "우주 주파수 및 에너지 분석 중 🛰️",
    matchingLoadingAi: "오늘 매칭을 AI가 분석하는 중 🤖",
    todayMatchStatus: "오늘 상태 분석",
    aiRelationReport: "AI 매칭 리포트",
    bioMatchAnalysis: "바이오 매칭 분석",
    todayChemistry: "오늘 케미 (Chemistry)",
    physicalMatchLabel: "신체 지수 (Physical)",
    emotionalMatchLabel: "감성 지수 (Emotional)",
    intellectualMatchLabel: "지성 지수 (Intellectual)",
    meLabel: "나",
    targetLabel: "상대",

    freePoints: "무료 포인트",
    freePointsUnlimited: "무제한",
    watchRewardAdText: "🎬 보상 광고 시청 시",
    attendanceCheck: "출석 체크",
    attendanceStreak: "연속 출석",
    attendance5DayReward: "5일 연속 출석 500P 증정! 🎁",
    attendanceCheckInBtn: "오늘 체크하기 ➔",
    attendanceCheckedTodayBtn: "오늘 출석 완료 ✅",
    protectData: "데이터 보호하기",
    protectDataDesc: "계정 로그인 시 데이터가 안전하게 보관됩니다.",
    loginWithAppleBtn: "Apple로 시작하기",
    editProfile: "정보 수정하기",
    resetApp: "앱 초기화",
    resetConfirm: "정말 초기화 할거임? 포인트와 기록이 사라져요! 🥺",
    resetAppDone: "앱이 초기화되었습니다.",

    toastLanguageSwitched: "한글 버전으로 설정되었습니다 🇰🇷",
    toastMoodInputRequired: "오늘 기분을 한 단어라도 입력해주세요 ✏️",
    toastPartnerNameRequired: "상대방 이름을 입력해주세요 ✏️",
    toastRelationRequired: "나와의 관계를 입력해주세요 💕",
    toastPointsNotEnough: "광고 포인트 적립됩니다! 📺",
  },
  en: {
    ...rewardBannerCopy.en,
    appTitle: "AI Daily Coaching",
    appSubtitle: "Your AI Condition & Mood Diary 💛",
    tabCoaching: "Daily Coaching",
    tabMatching: "Match",
    tabProfile: "My Profile",
    points: "P",
    unlimited: "Unlimited",
    close: "Close",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    confirm: "OK",
    loading: "Loading...",

    loginWithApple: "Sign in with Apple",
    termsAgreementNote: "By logging in, you agree to our Terms & Privacy Policy.",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    dataDeletion: "Data Deletion",

    onboardingTitle: "Profile Details 📝",
    onboardingTag: "Onboarding",
    selectImage: "Select Image",
    changeImage: "📸 Upload",
    deleteImage: "Remove Image",
    nameLabel: "Name / Nickname",
    nameLimitNote: "Max 8 letters",
    namePlaceholder: "Your nickname",
    genderLabel: "Gender 👤",
    female: "Female",
    male: "Male",
    birthdateLabel: "Date of Birth 🎂",
    birthTimeLabel: "Birth Time (Optional) ⏰",
    unknownTime: "Unknown",
    hourUnit: ":00",
    yearUnit: "",
    monthUnit: "",
    dayUnit: "",
    startBtn: "Start AI Coaching 🌟",

    writeTodayMood: "How are you feeling today? 📝",
    moodPlaceholder: "Feeling well-rested energetic",
    checkTodayCondition: "Check Today's Condition ✨",
    analyzingFrequency: "Analyzing energy frequencies...",
    analyzingData: "Processing today's emotional signals...",
    todayCondition: "🔋 Today's Condition",
    shareResult: "Share Result",
    biorhythmAnalysis: "Biorhythm Analysis",
    averageScore: "Avg",
    physicalIndex: "Physical Index",
    emotionalIndex: "Emotional Index",
    intellectualIndex: "Intellectual Index",
    recommendedItems: "Recommended Items",
    recommendedMenus: "Recommended Food",
    bottomBannerBadge: "How is your energy today?",
    bottomBannerTitle: "AI Daily Coaching",

    moodCalendarTitle: "Mood Calendar",
    calendarFooterHint: "💡 Today's mood with an emoji",
    calendarDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    emojiModalTitle: "Mood Diary",
    dailyNoteLabel: "Today's quick thought",
    dailyNotePlaceholder: "Enjoyed delicious dinner with friends!",
    statusEmojiLabel: "Select mood emoji",
    conditionBatteryScore: "🔋 Condition Battery Score",
    recorded: "Recorded",
    notAnalyzedYet: "Not analyzed yet",
    deleteRecord: "Delete Record",

    matchingIntroTitle: "Match Connection",
    matchingIntroSubtitle: "Who matches best with your energy today?",
    targetNameLabel: "Partner's Name (or Nickname)",
    targetNamePlaceholder: "e.g. Bestie Alex",
    targetBirthdateLabel: "Date of Birth",
    relationLabel: "Relationship / Status Note",
    relationPlaceholder: "e.g. Crush / Had an argument",
    addSubmit: "Save connection ✨",
    targetListTitle: "Connections",
    noTargetsYet: "Add friends or loved ones to check your compatibility! 💕",
    birthdayLabel: "Birthday",
    analysisDone: "Analysis Done",
    checkTodayMatch: "Check Match",
    matchingLoadingFrequency: "Analyzing cosmic frequencies and energy 🛰️",
    matchingLoadingAi: "AI is analyzing today's compatibility 🤖",
    todayMatchStatus: "Today's Status Analysis",
    aiRelationReport: "AI Matching Report",
    bioMatchAnalysis: "Bio-Match Analysis",
    todayChemistry: "Overall Chemistry Score",
    physicalMatchLabel: "Physical Chemistry",
    emotionalMatchLabel: "Emotional Chemistry",
    intellectualMatchLabel: "Intellectual Chemistry",
    meLabel: "Me",
    targetLabel: "Partner",

    freePoints: "Free Points",
    freePointsUnlimited: "Unlimited",
    watchRewardAdText: "🎬 Watch a video for points",
    attendanceCheck: "Daily check-in",
    attendanceStreak: "Streak",
    attendance5DayReward: "Earn 500P with a 5-day streak! 🎁",
    attendanceCheckInBtn: "Check in today ➔",
    attendanceCheckedTodayBtn: "Checked in today ✅",
    protectData: "Secure Your Data",
    protectDataDesc: "Sign in with Apple to keep your data.",
    loginWithAppleBtn: "Continue with Apple",
    editProfile: "Edit Profile",
    resetApp: "Reset App",
    resetConfirm: "Are you sure? Points and records will be deleted! 🥺",
    resetAppDone: "App has been reset.",

    toastLanguageSwitched: "Switched to English version 🇺🇸",
    toastMoodInputRequired: "Please share how you feel today ✏️",
    toastPartnerNameRequired: "Please enter your partner's name ✏️",
    toastRelationRequired: "Please tell us your relationship 💕",
    toastPointsNotEnough: "You’ll earn points after the ad ends! 📺",
  },
};

export const formatMonthYear = (year: number, month: number, lang: Language): string => {
  if (lang === "en") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[month]} ${year}`;
  }
  return `${year}년 ${month + 1}월`;
};

export const formatTodayBadge = (d: Date, lang: Language): string => {
  if (lang === "en") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[d.getMonth()]} ${d.getDate()}`;
  }
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};


