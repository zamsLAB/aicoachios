import { RecommendedItem, RecommendedPlace } from "../types";

export interface RangeDetail {
  title: string;
  emoji: string;
  color: string;
  items: RecommendedItem[];
  places: RecommendedPlace[];
}

export const CRISIS_KEYWORDS = [
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

export function isCrisisKeyword(text?: string | null): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  
  // 1. Direct keywords
  if (CRISIS_KEYWORDS.some(kw => lower.includes(kw))) {
    return true;
  }

  // 2. Specific check for "살자" (suicide slang), distinguishing from positive "열심히 살자", "잘 살자", etc.
  if (/(?:^|\s|[.,!?~])살자(?:$|\s|[.,!?~])/.test(lower)) {
    const positiveSalja = ["열심히", "행복하게", "잘", "같이", "함께", "오래", "즐겁게", "신나게", "웃으며", "살아야"];
    const hasPositiveContext = positiveSalja.some(p => lower.includes(p));
    if (!hasPositiveContext) {
      return true;
    }
  }

  return false;
}

export function getBatteryRecommendations(battery: number, _gender?: string, todayMood?: string): RangeDetail {
  if (todayMood) {
    // 0. Extreme crisis keywords priority safety filter
    if (isCrisisKeyword(todayMood)) {
      return {
        title: "24시간 긴급 위기 상담 및 안전 보호 📞🛡️",
        emoji: "🛡️",
        color: "from-rose-600 to-red-600",
        items: [
          { name: "24시간 무료 상담전화(109)에 전화하기", emoji: "📞", desc: "전문 상담사가 24시간 언제든 따뜻하게 당신의 이야기를 들어드립니다" },
          { name: "믿을 수 있는 사람에게 연락하기", emoji: "💬", desc: "가족, 친구 등 신뢰할 수 있는 소중한 사람에게 지금의 마음을 털어놓아 보세요" },
        ],
        places: [
          { name: "안전하고 편안한 공간", emoji: "🛋️", desc: "마음이 안정될 때까지 편안하고 따뜻한 곳에서 휴식을 취하세요" },
          { name: "전문 심리상담 및 의료기관", emoji: "🏥", desc: "혼자 견디지 마시고 가까운 전문가나 지원 기관의 도움을 받으세요" },
        ],
      };
    }

    const distressKeywords = [
      "아픔", "아파", "아프", "아픕", "병", "병원", "몸살", "상처", "감기", "통증", "두통", "복통",
      "우울", "슬픔", "슬퍼", "슬픈", "눈물", "울었", "울고", "상심", "낙담", "절망", "비참", "울적",
      "혼자", "외로", "외롭", "외로움", "고독", "공허", "쓸쓸",
      "힘들", "힘듦", "힘들어", "괴롭", "지침", "지쳐", "지쳤", "번아웃"
    ];
    const isDistressMood = distressKeywords.some((k) => todayMood.includes(k));
    if (isDistressMood) {
      return {
        title: "따스한 공감 & 마음 회복 힐링 케어 🧸🕯️",
        emoji: "🧸",
        color: "from-purple-500 to-indigo-600",
        items: [
          { name: "모찌 담요", emoji: "🧣", desc: "포근한 모찌 담요로 온몸을 다정하게 감싸안아주기" },
          { name: "푹신 쿠션", emoji: "🛋️", desc: "말랑한 푹신이 쿠션에 기대어 지친 마음 편안히 쉬기" },
          { name: "수면 안대", emoji: "👁️", desc: "눈과 마음의 긴장을 따스하게 녹여주는 유용한 아이템" },
          { name: "토닥토닥 인형", emoji: "🧸", desc: "꼭 껴안고 '오늘도 고생했어' 스스로 마음 토닥이기" },
          { name: "아로마 캔들", emoji: "🕯️", desc: "은은한 빛과 향기로 차분한 조용한 쉼표 만들기" },
          { name: "감성 다이어리", emoji: "📓", desc: "솔직한 마음을 몇 줄 적어보며 차분하게 정리하기" },
        ],
        places: [
          { name: "따끈 유자/자몽차", emoji: "🍊", desc: "지친 몸과 마음을 달래주는 따스하고 달콤한 유자차 한 잔" },
          { name: "달콤 초콜릿", emoji: "🍫", desc: "바삭함과 달콤함으로 순간 우울함을 달콤하게 힐링" },
          { name: "상콤 요아정", emoji: "🍨", desc: "생과일 토핑을 올린 상큼 요거트 아이스크림으로 입가심" },
          { name: "허브 콤부차", emoji: "🍵", desc: "속을 편안하게 지켜주는 은은하고 건강한 허브 티 타임" },
        ],
      };
    }

    const stressKeywords = ["화남", "화나", "짜증", "다툼", "싸움", "혼남", "혼났", "빡침", "열받", "스트레스", "속상", "답답", "억울", "분함", "빡치", "야단", "시비"];
    const isStressMood = stressKeywords.some((k) => todayMood.includes(k));
    if (isStressMood) {
      return {
        title: "스트레스 해소 & 기분 전환 추천! 🔥⚡️",
        emoji: "🔥",
        color: "from-rose-500 to-pink-600",
        items: [
          { name: "반짝 악세사리", emoji: "💍", desc: "기분 전환용 반짝 스타일링으로 일상의 소소한 멋 내기" },
          { name: "트렌디 운동화", emoji: "👟", desc: "신는 순간 가뿐하게 발걸음이 가벼워지는 포인트 슈즈" },
          { name: "스트레스 볼", emoji: "🐹", desc: "주물주물 만지며 가슴속 답답함을 귀엽게 날려버리기" },
          { name: "탑꾸 키링", emoji: "🧷", desc: "가방이나 휴대폰에 달아 기분까지 톡톡 튀게 만들기" },
          { name: "힐링 아로마", emoji: "💐", desc: "공기 중에 칙칙 뿌려 답답했던 분위기를 단숨에 환기" },
        ],
        places: [
          { name: "얼큰 알싸 마라탕", emoji: "🌶️", desc: "얼큰한 1단계 마라탕으로 스트레스와 응어리 싹 날리기" },
          { name: "바삭 쫀득 크루키", emoji: "🥐", desc: "크루아상+쿠키의 겉바속촉 달콤함으로 텐션 수급" },
          { name: "시원 청량스파클링", emoji: "🍹", desc: "속 타는 답답함을 단숨에 가라앉히는 청량한 음료 한 잔" },
          { name: "새콤달콤 탕후루", emoji: "🍡", desc: "바삭 톡 터지는 과일 즙으로 스트레스 단숨에 사르르" },
        ],
      };
    }
  }

  if (battery >= 81) {
    return {
      title: "에너지 최상! 톡톡 튀는 소품 & 메뉴 추천 ⚡️✨",
      emoji: "✨",
      color: "from-pink-500 to-rose-500",
      items: [
        { name: "트렌디 스니커즈", emoji: "👟", desc: "신고 어디든 가고 싶어지는 상큼하고 신나는 운동화" },
        { name: "키치 캐릭 그립톡", emoji: "📱", desc: "볼 때마다 미소가 터지는 취향저격 포인트 소품" },
        { name: "탑꾸 인스 키링", emoji: "🧷", desc: "소중한 가방에 착 달아 오늘 패션의 화룡점정 찍기" },
        { name: "실버 악세사리", emoji: "💍", desc: "손 끝과 목선에 센스를 보여주는 반짝반짝 아이템" },
        { name: "포토 카드", emoji: "📸", desc: "오늘의 신나는 순간과 사진을 예쁘게 스크랩하기" },
      ],
      places: [
        { name: "달콤 상큼 요아정", emoji: "🍨", desc: "벌집굴과 생과일 토핑 가득 올린 시원한 요거트 아이스크림" },
        { name: "두바이 초콜릿", emoji: "🍫", desc: "카다이프 피스타치오의 천국 같은 바삭함과 달달함" },
        { name: "진한 크림 라떼", emoji: "🍵", desc: "쌉싸름한 말차 위에 쫀쫀한 크림이 올라간 MZ 최애 음료" },
        { name: "상큼 아사이 볼", emoji: "🫐", desc: "슈퍼푸드와 그래놀라가 듬뿍 들어간 에너제틱 디저트" },
      ],
    };
  } else if (battery >= 60) {
    return {
      title: "기분 상쾌! 센스있는 소품 & 트렌디 메뉴 🌿🌸",
      emoji: "🌸",
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "은은한 향수", emoji: "✨", desc: "스칠 때마다 잔잔한 잔향이 선사하는 기분 좋은 여운" },
        { name: "폭신 패브릭 쿠션", emoji: "🛋️", desc: "내 방 침대 위 분위기를 감성 가득하게 꾸며주기" },
        { name: "스티커 다이어리", emoji: "📔", desc: "귀여운 스티커로 나만의 소소한 다이어리 꾸미기" },
        { name: "감성 유리 머그컵", emoji: "☕", desc: "예쁜 컵에 음료를 담아 마시며 소소한 행복 누리기" },
        { name: "포근한 수면 양말", emoji: "🧦", desc: "발끝부터 따스해지는 포근하고 귀여운 수면템" },
      ],
      places: [
        { name: "바삭 쫀득 크로플", emoji: "🧇", desc: "아이스크림과 메이플 시럽이 어우러진 겉바속촉 크로플" },
        { name: "톡톡 버블티", emoji: "🧋", desc: "쫀득한 버블을 씹는 맛이 재미있는 달콤 밀크티" },
        { name: "쫀득 약과 쿠키", emoji: "🍪", desc: "전통 약과와 현대 쿠키의 부드러운 만남 디저트" },
        { name: "상큼 스파클링", emoji: "🍹", desc: "기분 좋게 스파클링이 터지는 과일 에이드 음료" },
      ],
    };
  } else if (battery >= 40) {
    return {
      title: "차분한 릴렉스 소품 & 따뜻한 간식 메뉴 🕯️🍵",
      emoji: "🍵",
      color: "from-indigo-500 to-purple-600",
      items: [
        { name: "포근한 담요", emoji: "🧣", desc: "어깨나 무릎에 살포시 덮으면 온몸이 사르르 따스해짐" },
        { name: "아로마 디퓨저", emoji: "💐", desc: "마음을 차분하게 정돈해 주는 힐링 향기 오브제" },
        { name: "부드러운 쿠션", emoji: "🛋️", desc: "등 뒤에 꼭 받치고 편안하게 안겨 수다 떨거나 휴식" },
        { name: "감성 문구", emoji: "✏️", desc: "차분한 생각들을 조용히 적어내려갈 수 있는 아이템" },
        { name: "갬성 텀블러", emoji: "🥛", desc: "음료를 더 맛있게 해 주는 마이 페이보리 텀블러" },
      ],
      places: [
        { name: "달콤 밀크티", emoji: "🧋", desc: "복잡한 생각을 내려놓게 해주는 한 잔의 온기" },
        { name: "에그타르트", emoji: "🥧", desc: "입안 가득 부드러운 푸딩 질감의 달콤 에그타르트" },
        { name: "따스한 라떼", emoji: "🍵", desc: "지친 마음을 보듬어주는 고소하고 진한 핫 말차라떼" },
        { name: "달콤한 초코", emoji: "🍫", desc: "진하고 쫀득한 초코 한 입으로 마음을 차분히 달래기" },
      ],
    };
  } else {
    return {
      title: "에너지 방전! 포근한 숙면 소품 & 안심 메뉴 🛌💤",
      emoji: "💤",
      color: "from-[#4338ca] to-[#312e81]",
      items: [
        { name: "온열 안대", emoji: "👁️", desc: "눈가를 따스하게 지켜주며 숙면을 돕는 필수 휴식 아이템" },
        { name: "포근 수면 양말", emoji: "🧦", desc: "체온이 떨어지지 않게 발끝을 보송보송 감싸주기" },
        { name: "토닥토닥 쿠션", emoji: "🛋️", desc: "아무 생각 없이 안고 푹 쉴 수 있는 몰랑이 소품" },
        { name: "은은 무드등", emoji: "💡", desc: "방 안을 어둡지 않게 밝혀주는 따뜻한 은은한 불빛" },
        { name: "아로마 오일", emoji: "🌿", desc: "베개에 한 방울 떨어뜨려 깊은 수면을 청해보기" },
      ],
      places: [
        { name: "따스한 허브티", emoji: "🍵", desc: "몸과 마음의 긴장을 사르르 녹여주는 따스한 차 한 잔" },
        { name: "상큼 요거트", emoji: "🥣", desc: "부담 없이 속을 다정하게 채워주는 소화 편한 간식" },
        { name: "따뜻한 우유", emoji: "🥛", desc: "스르륵 숙면으로 빠져들게 돕는 부드러운 온기" },
      ],
    };
  }
}
