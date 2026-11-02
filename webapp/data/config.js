/*
 * 사이트 전역 설정
 * - 코드를 몰라도 이 파일의 값만 바꾸면 사이트 이름, 설문 링크, 방문 통계를 바꿀 수 있습니다.
 * - 따옴표("") 안의 글자만 수정하세요.
 */
window.SITE_CONFIG = {
  // 사이트 이름 (미정 - 확정되면 여기만 바꾸면 전체 반영)
  siteName: "TrueGreen",

  // 홈 화면 한 줄 소개
  tagline: "‘친환경’이라는 말, 그대로 믿어도 될까요? 광고 속 주장을 스스로 따져보는 연습을 해봅니다.",

  // Google Forms 링크 (비워두면 버튼이 표시되지 않습니다)
  surveys: {
    pre: "",      // 강연 전 사전 조사
    post: "",     // 강연 후 사후 조사 + 만족도
    general: ""   // 일반 소비자 인식 설문
  },

  // 방문 수·퀴즈 완료 수 집계용 GoatCounter 주소 (무료, 쿠키 없음)
  // 예: "https://우리코드.goatcounter.com/count"  - 비워두면 집계하지 않습니다.
  goatcounter: "",

  // 소개 페이지 정보
  team: {
    project: "경희대학교 세계와시민 Global Citizen Project",
    name: "",          // 모둠 이름
    members: [],       // 예: ["박정후 (컴퓨터공학과)", "..."]  - 공개 동의를 받은 뒤 입력
    contact: "",       // 이메일 또는 인스타그램 주소
    instagram: ""      // 인스타그램 링크 (선택)
  }
};
