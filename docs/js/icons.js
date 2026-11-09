/*
 * 8대 원칙 아이콘 (직접 그린 SVG, 24×24 격자, 선 1.5, 둥근 끝, currentColor)
 * - 키는 content.js signals의 id (변경 금지)
 * - 채워야 하는 부분은 class="f" (CSS에서 fill: currentColor)
 * - 그림 수정은 개발 담당만. 콘텐츠 작업에는 이 파일을 건드릴 필요가 없습니다.
 */
window.GW_ICONS = {
  // ① 사실과 다른 주장 - 고무 도장 + ×
  truth: `<circle cx="10" cy="5" r="2.3"/><path d="M8.6 7.1v3.4M11.4 7.1v3.4"/><rect x="3.5" y="10.5" width="13" height="4.5" rx="1"/><path d="M3.5 18.5h8"/><path d="M15.5 17l4.5 4.5M20 17l-4.5 4.5"/>`,
  // ② 막연한 단어와 초록 이미지 - 잎 + 물음표
  clarity: `<path d="M3 19.5C3 12 7.2 7.5 13 7.5c0 6.5-4 12-10 12z"/><path d="M3 19.5l5.5-5.5"/><path d="M15.8 6.2a2.6 2.6 0 1 1 3.7 2.4c-.9.4-1.4 1-1.4 2v.6"/><circle class="f" cx="18.1" cy="14.6" r=".9"/>`,
  // ③ 일부를 전체처럼 - 1/4만 채운 원
  scope: `<circle cx="12" cy="12" r="8.5"/><path class="f" d="M12 12V3.5a8.5 8.5 0 0 1 8.5 8.5z"/>`,
  // ④ 작은 개선을 크게 - 돋보기 아래 작은 점
  significance: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3L21 21"/><circle class="f" cx="10.5" cy="10.5" r="1.4"/>`,
  // ⑤ 당연한 걸 자랑 - 체크 표시가 든 메달
  voluntary: `<circle cx="12" cy="9" r="6"/><path d="M9.5 9.1l1.8 1.8 3.3-3.4"/><path d="M8.7 14l-1.2 7 4.5-2.3 4.5 2.3-1.2-7"/>`,
  // ⑥ 불리한 정보 숨기기 - 문서 + 가림 띠
  completeness: `<path d="M5.5 2.5h9l4 4v15h-13z"/><path d="M14.5 2.5v4h4"/><path d="M8.5 9.5h7M8.5 18.5h4.5"/><rect class="f" x="7.5" y="12.5" width="9" height="3.2" rx=".5"/>`,
  // ⑦ 상관없는 장점 강조 - 어긋난 퍼즐 두 조각
  relevance: `<path d="M2.5 3.5h7v3a2 2 0 1 1 0 4v3h-7z"/><path d="M14.5 10.5h7v10h-7v-3a2 2 0 1 0 0-4z"/>`,
  // ⑧ 증명할 수 없는 주장 - 빈 폴더 (∅ = 자료 없음)
  evidence: `<path d="M2.5 6a1 1 0 0 1 1-1h5l2 2h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1z"/><circle cx="12" cy="13.5" r="3"/><path d="M9.9 15.6l4.2-4.2"/>`
};
