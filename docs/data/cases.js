/*
 * 실제 사례 목록
 * - 새 사례는 아래 객체 하나를 복사해서 붙여넣고 내용을 바꾸면 됩니다.
 * - signals: content.js의 8대 원칙 id (truth, clarity, scope, significance, voluntary, completeness, relevance, evidence)
 * - region: "국내" 또는 "해외" (사례 페이지 필터 탭이 이 값으로 만들어집니다. 나라 이름은 country에)
 * - country: (선택) 해외 사례의 나라. 카드 위쪽에 "해외(프랑스)"처럼 표시됩니다
 * - outcome.type: "sanction"(제재) | "guidance"(행정지도·권고) | "cleared"(무혐의) | "court"(판결)
 * - outcome.label: (선택) 배지 글자를 바꿀 때만. 예: 정부 기관이 아닌 자율심의기구 판단이면 "자율심의"
 * - short: (선택) 카드를 접어 두었을 때 보이는 '무엇을 주장했나' 요약. 사례 페이지에서 카드는 처음에 접혀 있습니다.
 *     - 40자 안팎, 한 문장으로 씁니다. 예) short: "인조가죽 제품을 ‘에코 레더’라고 광고"
 *     - claim을 줄이되, 무엇을 어떤 말로 광고했는지(핵심 표현)는 남겨 주세요. 평가("과장했다" 등)는 넣지 않습니다.
 *     - 접힌 카드에는 short가 잘리지 않고 그대로 나오고, '자세히'를 펼치면 short 대신 claim 전체가 나옵니다 (둘이 같이 보이지 않음).
 *     - short를 비워 두거나 빼면 claim이 두 줄까지만 보이고 나머지는 '…'로 잘립니다. 펼치면 전체가 보입니다.
 *     - 따옴표는 claim과 같은 ‘ ’를 쓰세요. 줄바꿈은 넣지 마세요.
 * - 금액은 통화 단위를 꼭 붙여 주세요 (원 / 캐나다달러 등)
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
    country: "네덜란드",
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
  },
  {
    id: "lg-kimchi",
    region: "국내",
    year: 2019,
    industry: "가전",
    company: "LG전자",
    brands: "김치냉장고 김치통",
    claim: "김치냉장고 김치통을 카탈로그·제품 부착 스티커·홈페이지에서 ‘미국 FDA 인증’ 제품으로, HS 마크를 근거로 ‘친환경 김치통’으로 광고 (2011-2016년경)",
    problem: "미국 FDA에는 플라스틱 식품용기를 인증하는 제도가 없어, 김치통은 FDA 안전기준을 충족했을 뿐 인증을 받은 것이 아니었습니다. HS 마크는 식품용기라면 당연히 지켜야 할 위생·안전 법적 기준을 충족했다는 의미일 뿐, 친환경의 근거가 될 수 없다고 판단됐습니다.",
    // 과징금 금액 확인 필요: 2019.5.28 언론 보도는 5,000만 원, 공정위 의결서(2019-128) 주문은 7,400만 원
    outcome: { type: "sanction", text: "공정위 시정명령과 과징금 부과 (2019, 거짓·과장 광고)" },
    signals: ["truth", "voluntary", "evidence"],
    takeaway: "법적 기준을 지켰다는 것은 ‘친환경’의 근거가 아닙니다. 같은 용도의 다른 제품도 모두 지켜야 하는 기준이기 때문입니다.",
    sources: [
      { label: "공정위 의결 제2019-128호 (2019.06.17, CaseNote 게재 전문)", url: "https://casenote.kr/%EA%B3%B5%EC%A0%95%EA%B1%B0%EB%9E%98%EC%9C%84%EC%9B%90%ED%9A%8C/%EC%9D%98%EA%B2%B02019-128" },
      { label: "환경일보 (2019.05.29)", url: "https://www.hkbs.co.kr/news/articleView.html?idxno=515776" }
    ]
  },
  {
    id: "biodegradable-80",
    region: "국내",
    year: 2024,
    industry: "생활용품",
    company: "생분해 표시 제품 80개(한국소비자원 실태조사)",
    brands: "음식물 싱크대 거름망, 비닐봉투, 반려동물 배변봉투, 빨대",
    claim: "생분해 플라스틱 제품을 온라인 판매 페이지에서 ‘자연 생분해’, ‘100% 생분해’ 등으로 광고",
    problem: "54개 제품은 별도의 산업 퇴비화 시설 조건에서 분해된다는 인증을 받았는데도 ‘자연 생분해’, ‘100% 생분해’처럼 인증 내용과 다르게 표현했습니다. 7개 제품은 ‘음식물쓰레기와 함께 배출 가능’ 등 잘못된 배출 방법을 안내했고, 41개 제품은 시험성적서나 인증서를 판매 페이지에 제시하지 않았습니다 (한 제품이 여러 유형에 해당할 수 있음).",
    outcome: { type: "guidance", label: "시정 권고", text: "한국소비자원이 조사 대상 80개 제품 모두 개선이 필요하다고 보고 사업자에게 시정 권고 (2024.12). 80개 중 76개 사업자가 개선 계획을 회신" },
    signals: ["truth", "completeness", "evidence"],
    takeaway: "‘생분해’ 인증은 대개 퇴비화 시설 조건을 기준으로 합니다. 국내에는 따로 수거하는 체계가 없어 종량제봉투에 담아 일반쓰레기로 버려야 합니다.",
    sources: [
      { label: "한국소비자원 보도자료 (2024.12.03)", url: "https://www.kca.go.kr/home/sub.do?menukey=4002&mode=view&no=1003776783" },
      { label: "연합뉴스 (2024.12.03)", url: "https://www.yna.co.kr/view/AKR20241202111100030" }
    ]
  },
  {
    id: "stan-smith",
    region: "해외",
    country: "프랑스",
    year: 2021,
    industry: "패션",
    company: "아디다스",
    brands: "‘스탠 스미스’ 운동화 옥외 광고",
    claim: "‘100% iconique, 50% recyclée(100% 아이코닉, 50% 재활용)’ 문구와 ‘End plastic waste(플라스틱 쓰레기를 끝내자)’ 로고, 운동화가 플라스틱병을 밟는 이미지로 광고",
    problem: "재활용 소재 50%는 신발 중 갑피(발등을 덮는 윗부분)에만 해당했고, 신발 전체에서 재활용 소재가 차지하는 비율은 광고로 알 수 없었습니다. 또 신발 자체는 재활용이 되지 않는데도, 로고와 이미지는 이 제품이 플라스틱 쓰레기를 없애는 데 보탬이 되는 것처럼 보이게 했다고 판단됐습니다.",
    outcome: { type: "guidance", label: "자율심의", text: "프랑스 광고자율심의기구(JDP)가 신고를 인용 (2021.7.2). 광고업계 ‘지속가능발전’ 권고의 명확성(4항), 비례성(3항), 표지·로고(6항) 위반으로 판단. 정부 기관이 아닌 광고업계 자율심의기구의 판단입니다" },
    signals: ["scope", "clarity", "significance"],
    takeaway: "‘50%’를 보면 ‘무엇의 50%인가’를 물어야 합니다. 재활용 소재로 만든 것과 다 쓴 뒤 재활용할 수 있는 것도 서로 다릅니다.",
    sources: [
      { label: "JDP 결정 제756/21호 (2021.07.02)", url: "https://www.jdp-pub.org/avis/avis-du-jdp-n756-21-modes-et-accessoires/" }
    ]
  },
  {
    id: "keurig",
    region: "해외",
    country: "캐나다",
    year: 2022,
    industry: "식품",
    company: "Keurig Canada (큐리그 캐나다)",
    brands: "K-Cup 일회용 커피 캡슐",
    claim: "웹사이트·SNS·포장에서 K-Cup 캡슐이 재활용 가능하며, 뚜껑을 벗기고 커피 찌꺼기를 비우면 재활용할 수 있다고 안내",
    problem: "브리티시컬럼비아주와 퀘벡주를 제외한 지역에서는 시(市) 재활용 프로그램이 이 캡슐을 널리 받지 않았습니다. 뚜껑을 벗기고 비우면 된다는 안내도 추가 절차가 필요한 일부 지역에서는 오해를 줄 수 있다고 판단됐습니다.",
    outcome: { type: "sanction", text: "캐나다 경쟁국(Competition Bureau)과 합의 (2022.1.6). 벌금 300만 캐나다달러, 환경 단체 기부 80만 캐나다달러, 조사 비용 8만 5천 캐나다달러 부담. 재활용 표시와 포장을 바꾸고 정정 공지를 게재" },
    signals: ["truth", "completeness"],
    takeaway: "‘재활용 가능’은 내가 사는 곳의 수거 체계가 실제로 받아 주는지에 달려 있습니다.",
    sources: [
      { label: "캐나다 경쟁국 보도자료 (2022.01.06)", url: "https://www.canada.ca/en/competition-bureau/news/2022/01/keurig-canada-to-pay-3-million-penalty-to-settle-competition-bureaus-concerns-over-coffee-pod-recycling-claims.html" },
      { label: "토론토 중앙일보 (2026.07.08)", url: "https://www.cktimes.net/news/54352/" }
    ]
  }
];
