/*
 * 실제 사례 목록
 * - 새 사례는 아래 객체 하나를 복사해서 붙여넣고 내용을 바꾸면 됩니다.
 * - signals: content.js의 8대 원칙 id (truth, clarity, scope, significance, voluntary, completeness, relevance, evidence)
 * - outcome.type: "sanction"(제재) | "guidance"(행정지도·권고) | "cleared"(무혐의) | "court"(판결)
 * - 출처(sources)는 반드시 1개 이상 넣어 주세요. 기사보다 기관 보도자료가 있으면 그쪽을 우선합니다.
 */
window.GW_CASES = [
  {
    id: "spa-ecoleather",
    region: "국내",
    year: 2025,
    industry: "패션",
    company: "무신사·신성통상·이랜드월드·아이티엑스코리아",
    brands: "무신사 스탠다드, 탑텐, 미쏘·스파오, 자라",
    claim: "인조가죽(합성피혁) 제품을 ‘에코 레더’, ‘환경을 생각하는’ 등의 표현으로 판매",
    problem: "포괄적인 친환경 표현을 썼지만 근거를 충분히 제시하지 못했습니다. 해외에서 만든 원단을 매입해 썼고, 별도의 친환경 공정도 없었습니다. 공정위는 일부 단계만 떼어 비교해 친환경이라고 광고하는 것은 적절하지 않다고 봤습니다.",
    outcome: { type: "sanction", text: "공정위 경고 (표시광고법상 거짓·과장 광고). 자진 시정을 고려해 과징금은 없음. 패션업계 친환경 광고에 대한 첫 제재 사례" },
    signals: ["clarity", "scope"],
    takeaway: "‘비건’이 곧 ‘친환경’은 아닙니다. 동물성 원료를 안 썼다는 것과 환경 부담이 적다는 것은 별개의 문제입니다.",
    sources: [
      { label: "쿠키뉴스 (2025.05.15)", url: "https://www.kukinews.com/article/view/kuk202505150163" },
      { label: "YTN (2025.04.13)", url: "https://www.ytn.co.kr/_ln/0134_202504131240198391" }
    ]
  },
  {
    id: "posco",
    region: "국내",
    year: 2025,
    industry: "철강",
    company: "포스코·포스코홀딩스",
    brands: "이노빌트, 이오토포스, 그린어블 / 그리닛",
    claim: "자체 브랜드 인증(이노빌트)을 받은 제품을 ‘친환경 제품·강건재’로, 세 브랜드를 ‘3대 친환경 브랜드’로 홍보",
    problem: "이노빌트는 포스코가 스스로 부여하는 인증이고, 심사 기준 중 친환경성이 차지하는 비중이 매우 낮았습니다. 나머지 두 브랜드도 전기차·풍력 설비용 철강재를 분류한 것일 뿐 친환경 제품과는 다르다고 판단됐습니다.",
    outcome: { type: "sanction", text: "공정위 시정명령 (2025.4, 거짓·과장 광고). 앞서 환경단체 기후솔루션의 신고로 환경부가 탄소중립 브랜드 ‘그리닛’ 일부 표현에 삭제 행정지도. 이후 포스코는 사내 그린워싱 검토위원회를 신설" },
    signals: ["truth", "clarity"],
    takeaway: "‘인증’이라는 단어보다 ‘누가 준 인증인지’, ‘무엇을 심사했는지’를 봐야 합니다.",
    sources: [
      { label: "한국경제 (2025.04.17)", url: "https://www.hankyung.com/article/202504178414i" },
      { label: "기후솔루션 신고 보도자료", url: "https://forourclimate.org/ko/newsroom/560" },
      { label: "더팩트 - 환경부 행정지도", url: "https://news.tf.co.kr/read/ogmeta/2110953.htm" }
    ]
  },
  {
    id: "sk-lng",
    region: "국내",
    year: 2022,
    industry: "에너지",
    company: "SK E&S",
    brands: "호주 바로사 가스전 LNG",
    claim: "탄소 포집·저장(CCS)과 배출권 구매로 ‘CO₂ Free LNG’, ‘탄소중립 LNG’를 생산하겠다고 광고",
    problem: "환경단체는 화석연료인 LNG는 개발·생산 단계에서 탄소가 배출되고, 계획 단계의 기술과 배출권 상쇄로 ‘탄소 0’을 주장하는 것은 과장이라고 신고했습니다. 반면 공정위는 현 시점에서 거짓·과장이 분명하다고 보기 어렵다고 판단했습니다.",
    outcome: { type: "cleared", text: "공정위 무혐의 (2022.3). 다만 환경부는 지속 노출 시 소비자 인식 왜곡이 우려된다며 표현 수정을 권고했고, SK E&S는 문구를 ‘저탄소’로 변경" },
    signals: ["completeness", "evidence"],
    takeaway: "같은 광고를 두고도 기관의 판단이 갈렸습니다. 법적으로 문제없다는 것과 소비자가 오해하지 않는다는 것은 다를 수 있습니다. 토론해 볼 만한 사례입니다.",
    sources: [
      { label: "프레시안 (2022.10.27)", url: "https://pressian.com/pages/articles/2022102711540768535" },
      { label: "더나은미래 - 무혐의 결정", url: "https://futurechosun.com/?p=63273" }
    ]
  },
  {
    id: "klm",
    region: "해외",
    year: 2024,
    industry: "항공",
    company: "KLM 네덜란드항공",
    brands: "‘Fly Responsibly(책임감 있는 비행)’ 캠페인",
    claim: "항공권 구매 시 산림녹화 기부 등에 참여해 탄소를 줄일 수 있다며 ‘책임감 있는 비행’을 홍보",
    problem: "환경단체가 기만적 광고라며 소송을 제기했습니다. 상쇄 프로그램과 미래 계획으로 항공 여행의 환경 영향이 줄어드는 것처럼 보이게 했다는 점이 쟁점이었습니다.",
    outcome: { type: "court", text: "네덜란드 법원이 해당 광고가 기만적이라고 판결, KLM 패소" },
    signals: ["completeness", "evidence"],
    takeaway: "‘나무를 심으면 괜찮다’는 메시지는 배출 자체를 줄이지 않습니다.",
    sources: [
      { label: "YTN (2025.04.19)", url: "https://www.ytn.co.kr/_ln/0102_202504190625368845" }
    ]
  }
];
