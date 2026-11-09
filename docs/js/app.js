/*
 * 그린워싱 판독기 - 화면 로직
 * 구조
 *   1) 공통 유틸 (escape, 토스트, 공유, 통계)
 *   2) 라우터: location.hash(#/quiz 등)를 보고 해당 view 함수를 실행
 *   3) view 함수: 각 페이지 HTML을 만들고 이벤트를 연결
 * 콘텐츠는 data/*.js 에 있으므로, 내용 수정을 위해 이 파일을 고칠 필요는 없습니다.
 */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG;
  const C = window.GW_CONTENT;
  const CASES = window.GW_CASES;
  const QUIZ = window.GW_QUIZ;
  const CHECK = window.GW_CHECKLIST;
  const app = document.getElementById("app");

  /* ============================================================
     1) 공통 유틸
     ============================================================ */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const signalById = Object.fromEntries(C.signals.map((s) => [s.id, s]));
  // 원칙 아이콘 (js/icons.js). 번호를 대신하지 않고 옆에 붙는 보조 그림이라 aria-hidden
  const ICONS = window.GW_ICONS || {};
  const picon = (id, size = 16, cls = "") => ICONS[id]
    ? `<svg class="pi ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[id]}</svg>`
    : "";
  const signalTag = (id) => {
    const s = signalById[id];
    return s ? `<a class="tag" href="#/learn/${s.id}">${picon(s.id, 14)}${esc(s.title)}</a>` : "";
  };

  let toastTimer;
  function toast(msg) {
    const el = document.querySelector(".toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function share(text) {
    const url = location.href.split("#")[0];
    if (navigator.share) {
      try { await navigator.share({ title: CFG.siteName, text, url }); return; } catch (e) { /* 취소 */ }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast("링크를 복사했습니다");
    } catch (e) {
      toast("복사가 지원되지 않는 환경입니다");
    }
  }

  // 템플릿의 {이름} 자리를 값으로 채우기 (checklist.js 문구 템플릿용)
  const fill = (tpl, vals) => tpl.replace(/\{([^{}]+)\}/g, (m, k) => (k in vals ? vals[k] : m));

  // 클립보드 복사. Clipboard API가 막힌 환경에서는 예전 방식(execCommand)으로 시도
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) return toast("복사가 지원되지 않는 환경입니다");
    }
    toast("복사했습니다");
  }

  // GoatCounter: config에 주소가 있을 때만 로드. 해시 라우팅이라 페이지 이동을 직접 기록합니다.
  const analytics = {
    ready: false,
    init() {
      if (!CFG.goatcounter) return;
      window.goatcounter = { no_onload: true };
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://gc.zgo.at/count.js";
      s.dataset.goatcounter = CFG.goatcounter;
      s.onload = () => { this.ready = true; this.page(); };
      document.head.appendChild(s);
    },
    page() {
      if (!this.ready || !window.goatcounter.count) return;
      window.goatcounter.count({ path: "/" + (location.hash.replace(/^#\/?/, "") || "home") });
    },
    event(name) {
      if (!this.ready || !window.goatcounter.count) return;
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  };

  // 사진: src가 있으면 이미지, 없으면 hint 글자가 적힌 빈 자리
  const photo = (p = {}, cls = "") => `
    <figure class="photo ${cls}">
      ${p.src
        ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}"${p.pos ? ` style="object-position:${esc(p.pos)}"` : ""} loading="lazy">`
        : `<div class="photo-slot" aria-hidden="true">${esc(p.hint || "사진")}</div>`}
      ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}
    </figure>`;

  // 가상 제품 라벨 그림 (알아보기 정의 옆). 글자·원칙은 content.js definition.label
  // 위치는 slot으로 고정: badge(도장) / hero(큰 글자) / line1·line2. 번호 원은 오른쪽, 점선으로 연결
  const labelArt = (L) => {
    const by = Object.fromEntries(L.claims.map((c) => [c.slot, c]));
    const mark = (c, x1, y1, cy) => c && signalById[c.signal] ? `
      <line class="la-lead" x1="${x1}" y1="${y1}" x2="250" y2="${cy}"/>
      <circle class="la-no" cx="264" cy="${cy}" r="14"/>
      <svg class="pi la-no-i" x="255" y="${cy - 9}" width="18" height="18" viewBox="0 0 24 24">${ICONS[c.signal] || ""}</svg>` : "";
    const badge = by.badge ? by.badge.text.split("\n") : [];
    const desc = L.claims.map((c) => `${c.text.replace("\n", " ")}(${signalById[c.signal]?.title || ""})`).join(", ");
    return `
      <svg class="label-art" viewBox="0 0 300 360" role="img" aria-label="가상 ${esc(L.product)} 라벨: ${esc(desc)}">
        <rect class="la-cap" x="118" y="8" width="44" height="30" rx="4"/>
        <rect class="la-neck" x="126" y="38" width="28" height="16"/>
        <path class="la-body" d="M56 86 Q56 54 96 54 L184 54 Q224 54 224 86 L224 330 Q224 352 202 352 L78 352 Q56 352 56 330 Z"/>
        <rect class="la-paper" x="66" y="104" width="136" height="220" rx="4"/>
        <text class="la-brand" x="134" y="130">${esc(L.brand)} · ${esc(L.product)}</text>
        <path class="la-leaf" d="M134 142 C110 152 110 182 134 194 C158 182 158 152 134 142 Z"/>
        <path class="la-vein" d="M134 150 L134 188"/>
        ${by.hero ? `<text class="la-hero" x="134" y="234">${esc(by.hero.text)}</text>` : ""}
        <line class="la-rule" x1="80" y1="250" x2="188" y2="250"/>
        ${by.line1 ? `<text class="la-line" x="134" y="273">${esc(by.line1.text)}</text>` : ""}
        ${by.line2 ? `<text class="la-line" x="134" y="297">${esc(by.line2.text)}</text>` : ""}
        <text class="la-vol" x="134" y="316">${esc(L.volume || "")}</text>
        ${by.badge ? `
          <circle class="la-badge" cx="212" cy="96" r="27"/>
          <circle class="la-badge-in" cx="212" cy="96" r="22"/>
          <text class="la-badge-t" x="212" y="${badge.length > 1 ? 93 : 100}">${esc(badge[0])}</text>
          ${badge[1] ? `<text class="la-badge-t" x="212" y="107">${esc(badge[1])}</text>` : ""}` : ""}
        ${mark(by.badge, 238, 88, 62)}
        ${mark(by.hero, 206, 222, 200)}
        ${mark(by.line1, 206, 268, 258)}
        ${mark(by.line2, 206, 292, 300)}
      </svg>`;
  };

  // 번호 섹션 머리 (01. 제목 / 설명). 페이지마다 numberer()로 번호를 새로 셉니다.
  const numberer = () => {
    let n = 0;
    return (title, desc) => `
      <header class="sec-head">
        <span class="sec-no">${String(++n).padStart(2, "0")}.</span>
        <h2>${title}</h2>
        ${desc ? `<p>${desc}</p>` : ""}
      </header>`;
  };

  // 현황 수치: 큰 숫자 + 설명
  const figures = () => `
    <div class="figures">
      ${C.stats.items.map((x) => `
        <div class="figure">
          <p class="v">${esc(x.value)}</p>
          <p>${esc(x.label)}</p>
          ${x.sub ? `<p class="small muted">${esc(x.sub)}</p>` : ""}
          <p class="src">${esc(x.source)}</p>
        </div>`).join("")}
    </div>`;

  // 적발 건수 막대그래프 (값이 최댓값 대비 몇 %인지로 막대 높이 결정)
  const detectionChart = () => {
    const d = C.stats.detections;
    const max = Math.max(...d.data.map((x) => x.count));
    const peak = d.data.find((x) => x.count === max).year;
    return `
      <div class="chart">
        <h3>${esc(d.title)}</h3>
        <div class="bars" role="img" aria-label="${d.data.map((x) => `${x.year}년 ${x.count}건`).join(", ")}">
          ${d.data.map((x) => `
            <div class="bar-col">
              <span class="bar-val">${x.count.toLocaleString()}</span>
              <div class="bar ${x.year === peak ? "peak" : ""}" style="height:${Math.max(2, (x.count / max) * 100)}%"></div>
              <span class="bar-year">${x.year}</span>
            </div>`).join("")}
        </div>
        <p class="small muted" style="margin-top:12px">${esc(d.note)}</p>
        <p class="small muted">출처: ${esc(d.source)}</p>
      </div>`;
  };

  const surveyButton = (key, label) =>
    CFG.surveys && CFG.surveys[key]
      ? `<a class="btn btn-ghost" href="${esc(CFG.surveys[key])}" target="_blank" rel="noopener">${esc(label)} ↗</a>`
      : "";

  /* ============================================================
     2) 라우터
     ============================================================ */
  const routes = { "": viewHome, learn: viewLearn, cases: viewCases, quiz: viewQuiz, check: viewCheck, about: viewAbout };

  // 페이지를 떠날 때 정리할 일(타이머 등). view 함수가 onLeave(fn)로 등록하면 다음 라우팅 직전에 실행
  let leaveFns = [];
  const onLeave = (fn) => leaveFns.push(fn);
  const runLeave = () => { const fns = leaveFns; leaveFns = []; fns.forEach((fn) => fn()); };

  // 퀴즈 화면(해설·결과)에서 원칙 링크(#/learn/...)를 눌러 알아보기로 간 경우 표시 → 알아보기에 '퀴즈로 돌아가기' 바를 띄움
  // 알아보기 외의 페이지로 이동하면 해제
  let fromQuiz = false;
  app.addEventListener("click", (e) => {
    if (location.hash.startsWith("#/quiz") && e.target.closest('a[href^="#/learn"]')) fromQuiz = true;
  });

  function router() {
    runLeave();
    const [name = "", param] = location.hash.replace(/^#\/?/, "").split("/");
    const view = routes[name] || viewHome;
    if (name !== "learn") fromQuiz = false;
    document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
    view(param);
    const titles = { learn: "알아보기", cases: "사례", quiz: "퀴즈", check: "판독기", about: "소개" };
    document.title = titles[name] ? `${titles[name]} · ${CFG.siteName}` : CFG.siteName;
    // 페이지 전환은 즉시 맨 위로 (CSS의 smooth를 따르면 애니메이션이 남아, 화면이 정한 스크롤 위치를 덮어씀 - 예: 퀴즈 해설 복원)
    if (!param) window.scrollTo({ top: 0, behavior: "instant" });
    app.focus({ preventScroll: true });
    analytics.page();
  }

  /* ============================================================
     3) 페이지
     ============================================================ */

  // ---------- 홈 ----------
  // 섹션마다 다른 배치: 사진 히어로 → 좌우 분할 → 큰 카드+목록 → 녹색 반전 → 원칙 격자
  function viewHome() {
    const H = C.home;
    let n = 0;
    const no = () => `<span class="sec-no">${String(++n).padStart(2, "0")}.</span>`;
    const meta = {
      learn: `${C.signals.length}대 원칙 · 사례 · 확인 방법`,
      cases: `실제 사례 ${CASES.length}건`,
      quiz: `${QUIZ.pool.length}문항 중 ${Math.min(QUIZ.drawCount, QUIZ.pool.length)}문항 무작위`,
      check: `체크리스트 ${CHECK.questions.length}문항`
    };
    const [main, ...rest] = H.features;
    const hp = H.heroPhoto || {};
    app.innerHTML = `
      <section class="hero-full ${hp.src ? "has-photo" : ""}">
        <div class="hero-bg">
          ${hp.src ? `<img src="${esc(hp.src)}" alt="${esc(hp.alt)}">` : `<span class="hero-hint" aria-hidden="true">${esc(hp.hint || "사진")}</span>`}
        </div>
        <div class="wrap hero-content">
          <h1>${esc(H.title)}<br><em>${esc(H.titleEm)}</em></h1>
          <p class="lead">${esc(CFG.tagline)}</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="#/check">지금 보는 광고 판독하기</a>
            <a class="btn btn-ghost" href="#/quiz">퀴즈로 연습하기</a>
          </div>
        </div>
      </section>

      <section class="sec ask-sec">
        <div class="wrap split">
          <div class="split-head">
            ${no()}
            <h2>광고를 볼 때<br>딱 세 가지만<br>물어보세요</h2>
          </div>
          <ol class="ask-list">
            ${H.questions.map((x) => `<li><span class="q">${esc(x.q)}</span><span class="muted">${esc(x.a)}</span></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          <div class="head-row">${no()}<h2>둘러보기</h2></div>
          <div class="explore">
            <a class="explore-main" href="#/${esc(main.id)}">
              ${photo(main.photo, "wide")}
              <h3>${esc(main.title)}</h3>
              <p class="muted">${esc(main.desc)}</p>
              <p class="meta">${esc(meta[main.id] || "")}</p>
            </a>
            <ul class="explore-list">
              ${rest.map((f) => `
                <li><a href="#/${esc(f.id)}">
                  ${photo(f.photo, "thumb")}
                  <div>
                    <h3>${esc(f.title)}</h3>
                    <p class="muted small">${esc(f.desc)}</p>
                    <p class="meta">${esc(meta[f.id] || "")}</p>
                  </div>
                </a></li>`).join("")}
            </ul>
          </div>
        </div>
      </section>

      <section class="band-dark">
        <div class="wrap">
          <div class="band-head">${no()}<h2>숫자로 보는<br>그린워싱</h2></div>
          <div class="band-figures">
            ${C.stats.items.map((x) => `
              <div>
                <p class="v">${esc(x.value)}</p>
                <p>${esc(x.label)}</p>
                ${x.sub ? `<p class="small sub">${esc(x.sub)}</p>` : ""}
                <p class="src">${esc(x.source)}</p>
              </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          <div class="head-cols">
            <div>${no()}<h2>친환경 광고가 지켜야 할 8대 원칙</h2></div>
            <div class="stack">
              <p class="muted">「환경성 표시·광고 관리제도에 관한 고시」의 원칙입니다. 하나라도 어긋나면 그린워싱을 의심해 볼 수 있습니다.</p>
              <div><a class="btn btn-ghost" href="#/learn">원칙 자세히 알아보기</a></div>
            </div>
          </div>
          <ol class="p-grid">
            ${C.signals.map((s) => `
              <li><a href="#/learn/${s.id}">
                <span class="no">${picon(s.id, 32)}</span>
                <strong>${esc(s.title)}</strong>
                <span class="pr">${esc(s.principle)}</span>
              </a></li>`).join("")}
          </ol>
        </div>
      </section>`;
    heroFade();
  }

  // 홈 히어로: 사진은 화면에 고정, 01 섹션(밝은 바탕)이 그 위로 올라와 덮음
  // 사진과 히어로 글자를 같은 비율로 옅게: 1(맨 위) → 0(01 섹션 마지막 질문 '누가 확인했나요?'의 아래 끝이 화면에 들어온 순간)
  function heroFade() {
    const bg = app.querySelector(".hero-bg");
    const content = app.querySelector(".hero-content");
    const last = app.querySelector(".ask-list li:last-child");
    if (!bg || !content || !last) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const remain = last.getBoundingClientRect().bottom - window.innerHeight; // 남은 스크롤 거리
      const end = y + remain;
      const op = 1 - (end <= 0 ? 1 : Math.min(Math.max(y / end, 0), 1));
      const hidden = op <= 0 ? "hidden" : ""; // 완전히 투명하면 버튼도 눌리지 않게
      bg.style.opacity = content.style.opacity = op.toFixed(3);
      bg.style.visibility = content.style.visibility = hidden;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll); // 글꼴 로드 후 높이 변화 반영
    update();
    onLeave(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
  }

  // 가상 광고: 판단 대상인 광고 문구를 가장 크게, 브랜드·제품은 캡션으로
  // (quiz.js의 look 값은 현재 화면에 쓰지 않음 - 데이터 호환용으로만 남김)
  function adCard(ad) {
    return `
      <figure class="ad">
        <figcaption class="ad-meta">
          <span>${esc(ad.brand)} · ${esc(ad.product)}</span>
          <span class="ad-label">가상 광고</span>
        </figcaption>
        <blockquote class="ad-copy">${esc(ad.copy)}</blockquote>
      </figure>`;
  }

  // ---------- 알아보기 ----------
  function viewLearn(focusId) {
    const head = numberer();
    app.innerHTML = `
      <section class="page-head">
        <div class="wrap">
          <h1>${esc(C.definition.title)}</h1>
          <div class="def">
            <div class="stack">
              <p class="lead">${esc(C.definition.body)}</p>
              <p class="muted">${esc(C.definition.law)}</p>
              <p class="note">${esc(C.definition.note)}</p>
            </div>
            ${C.definition.label
              ? `<figure class="def-label">
                  <div class="def-label-art">${labelArt(C.definition.label)}</div>
                  <ol class="def-label-notes">
                    ${C.definition.label.claims.filter((c) => signalById[c.signal]).map((c) => {
                      const s = signalById[c.signal];
                      return `<li><span class="no" aria-hidden="true">${picon(s.id, 22)}</span><div><a href="#/learn/${s.id}"><strong>${esc(s.title)}</strong></a><p>${esc(c.note)}</p></div></li>`;
                    }).join("")}
                  </ol>
                  ${C.definition.label.caption ? `<figcaption>${esc(C.definition.label.caption)}</figcaption>` : ""}
                </figure>`
              : photo(C.definition.photo)}
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("현황과 실태")}
          <div class="grid grid-2" style="gap:40px;align-items:start">
            ${detectionChart()}
            ${figures()}
          </div>
        </div>
      </section>

      <section class="sec" id="signals">
        <div class="wrap">
          ${head("친환경 광고가 지켜야 할 8대 원칙", "「환경성 표시·광고 관리제도에 관한 고시」의 8가지 원칙을 소비자가 광고를 볼 때 확인할 질문으로 옮겼습니다.")}
          <ol class="principles">
            ${C.signals.map((s) => `
              <li class="principle" id="sig-${s.id}">
                <span class="p-no" aria-hidden="true">${picon(s.id, 48)}</span>
                <div class="p-body">
                  <h3>${esc(s.title)} <span class="p-name">${esc(s.principle)}</span></h3>
                  <p class="short">${esc(s.short)}</p>
                  <details ${s.id === focusId ? "open" : ""}>
                    <summary>자세히 보기</summary>
                    <div class="detail">
                      <p>${esc(s.desc)}</p>
                      <div class="example bad"><b>이런 표현은 의심</b>${esc(s.bad)}</div>
                      <div class="example good"><b>이렇게 쓰면 확인 가능</b>${esc(s.good)}</div>
                      ${s.fashion ? `<div class="example fashion"><b>ex) 패션 광고에서는</b>${esc(s.fashion)}</div>` : ""}
                      <p class="basis">법적 유형: ${esc(s.legal)}<br>근거: ${esc(s.basis)}</p>
                    </div>
                  </details>
                </div>
              </li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("법적으로는 어떻게 문제가 될까?", "원칙을 어긴 광고는 법적으로 아래 네 가지 유형으로 다뤄집니다.")}
          <div class="table-wrap">
            <table class="tbl">
              <thead><tr><th>유형</th><th>핵심</th><th>대표적인 모습</th></tr></thead>
              <tbody>${C.legalTypes.map((t) => `<tr><th scope="row">${esc(t.name)}</th><td>${esc(t.core)}</td><td class="muted">${esc(t.example)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("그린워싱의 7가지 죄악", "캐나다 환경마케팅 기업 TerraChoice가 정리한 국제적으로 널리 쓰이는 분류입니다. 8대 원칙과 이렇게 연결됩니다.")}
          <ul class="sins">
            ${C.sins.map((x) => `
              <li class="sin">
                <p><strong>${esc(x.name)}</strong> <span class="small muted">${esc(x.en)}</span></p>
                <p class="small muted">${esc(x.desc)}</p>
                <div class="tags">${x.signals.map(signalTag).join("")}</div>
              </li>`).join("")}
          </ul>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("세 가지 관점으로 보기")}
          <div class="photo-cards">
            ${C.axes.map((a) => `
              <article class="photo-card axis-card">
                ${photo(a.photo)}
                <p class="label">${esc(a.label)}</p>
                <h3>${esc(a.title)}</h3>
                <ul>${a.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
                ${a.survey && a.survey.length ? `
                  <h4 class="minor">우리 모둠 설문 결과</h4>
                  <div class="stats">${a.survey.map((s) => `<div class="stat"><div class="v">${esc(s.value)}</div><div class="small muted">${esc(s.label)}</div></div>`).join("")}</div>` : ""}
              </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("직접 확인하는 방법")}
          <ol class="steps">
            ${C.toolkit.map((t) => `<li class="step"><h3>${esc(t.title)}</h3><p class="muted small">${esc(t.body)}</p>${(t.links || []).map((l) => `
              <p class="step-link small"><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>${l.path ? `<br><span class="muted">${esc(l.path)}</span>` : ""}</p>`).join("")}</li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${head("누가 규제하고 있나요?")}
          <div>
            ${C.regulation.map((r) => `<div class="reg"><strong>${esc(r.who)}</strong><p class="muted small">${esc(r.what)}</p></div>`).join("")}
          </div>
        </div>
      </section>`;

    // 퀴즈 해설·결과에서 왔으면 화면 아래에 '퀴즈로 돌아가기' 고정 바 (진행 상태는 quizState에 남아 있어 그대로 이어짐)
    if (fromQuiz && quizState) {
      const where = quizState.done ? "결과 화면" : `${quizState.idx + 1} / ${quizState.items.length}번 문제`;
      app.insertAdjacentHTML("beforeend", `
        <div class="back-spacer" aria-hidden="true"></div>
        <div class="back-bar"><div class="wrap">
          <span class="small muted">퀴즈 ${esc(where)}에서 이동</span>
          <a class="btn btn-primary" href="#/quiz">${quizState.done ? "퀴즈 결과로 돌아가기" : "퀴즈로 돌아가기"}</a>
        </div></div>`);
    }

    // #/learn/<signal> 로 들어오면 해당 원칙으로 이동
    if (focusId && signalById[focusId]) {
      const el = document.getElementById(`sig-${focusId}`);
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: "center" });
        el.classList.add("flash");
      });
    }
  }

  // ---------- 사례 ----------
  function viewCases() {
    const outcomeLabel = { sanction: "제재", guidance: "행정지도", cleared: "무혐의", court: "판결" };
    const regions = ["전체", ...new Set(CASES.map((c) => c.region))];
    app.innerHTML = `
      <section class="section">
        <div class="wrap">
          <div class="section-head">
                        <h1>실제로 문제가 된 광고들</h1>
            <p>기관의 공식 판단이 있었던 사례만 모았습니다. 판단이 엇갈린 사례도 있습니다.</p>
          </div>
          <div class="filters">${regions.map((r, i) => `<button class="tab" aria-selected="${i === 0}" data-region="${esc(r)}">${esc(r)}</button>`).join("")}</div>
          <div class="grid grid-2 case-list"></div>
        </div>
      </section>`;

    const list = app.querySelector(".case-list");
    const render = (region) => {
      const items = CASES.filter((c) => region === "전체" || c.region === region).sort((a, b) => b.year - a.year);
      list.innerHTML = items.map((c) => `
        <article class="card case">
          <div class="case-top">
            <span class="tag">${esc(c.region)}${c.country ? `(${esc(c.country)})` : ""} · ${esc(c.industry)} · ${c.year}</span>
            <span class="badge ${esc(c.outcome.type)}">${esc(c.outcome.label || outcomeLabel[c.outcome.type] || "")}</span>
          </div>
          <div>
            <h3>${esc(c.company)}</h3>
            <p class="brands">${esc(c.brands)}</p>
          </div>
          <dl>
            <div><dt>무엇을 주장했나</dt><dd>${esc(c.claim)}</dd></div>
            <div><dt>무엇이 문제였나</dt><dd>${esc(c.problem)}</dd></div>
          </dl>
          <div class="outcome ${esc(c.outcome.type)}">${esc(c.outcome.text)}</div>
          <p class="takeaway">${esc(c.takeaway)}</p>
          <div class="tags">${c.signals.map(signalTag).join("")}</div>
          <p class="sources">출처: ${c.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(" · ")}</p>
        </article>`).join("");
    };
    app.querySelectorAll("[data-region]").forEach((b) => b.addEventListener("click", () => {
      app.querySelectorAll("[data-region]").forEach((x) => x.setAttribute("aria-selected", x === b));
      render(b.dataset.region);
    }));
    render("전체");
  }

  // ---------- 퀴즈 ----------
  // 배열을 무작위로 섞기 (Fisher-Yates: 모든 순서가 같은 확률로 나옴)
  function shuffled(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 문항 풀에서 drawCount개 뽑기 - 정상 광고(signal: null)는 최소 minGood개 보장
  function drawQuestions() {
    const n = Math.min(QUIZ.drawCount, QUIZ.pool.length);
    const good = shuffled(QUIZ.pool.filter((q) => !q.signal));
    const fixed = good.slice(0, Math.min(QUIZ.minGood, good.length, n));
    const rest = shuffled(QUIZ.pool.filter((q) => !fixed.includes(q)));
    return shuffled([...fixed, ...rest.slice(0, n - fixed.length)]);
  }

  // 퀴즈 진행 상태는 viewQuiz 밖(모듈 수준)에 둔다.
  // 해설의 원칙 링크(#/learn/...)나 메뉴로 나갔다가 #/quiz로 돌아오면 이어서 진행. 새로 고침하면 초기화.
  // { items: 출제 문항, idx: 현재 번호(0부터), results: [{ q, ok, picked }], done: 결과 화면 도달 여부 }
  let quizState = null;

  // 시작 화면 괄호 안 문구 후보 (규칙은 quiz.js 상단 주석과 같게 유지)
  // ad.short가 있으면 short, 없으면 copy. 이모지 제거 후 24자 이하, '[마크 설명]'이 든 문구는 제외
  // 그린워싱 문구(bad)와 정상 광고 문구(good, signal: null)로 나눠 돌려줌
  const INTRO_COPY_MAX = 24;
  const introCopies = () => {
    const clean = (t) => String(t || "")
      .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}️‍]/gu, "")
      .replace(/\s+/g, " ").trim();
    const ok = (t) => t && !t.includes("[") && [...t].length <= INTRO_COPY_MAX;
    const out = { bad: [], good: [] };
    QUIZ.pool.forEach((q) => {
      const t = clean(q.ad.short || q.ad.copy);
      if (ok(t)) out[q.signal ? "bad" : "good"].push(t);
    });
    return out;
  };

  // 두 종류를 번갈아 내보내는 순서 생성기. 한 종류를 다 쓰면 다시 섞어서 이어감(같은 문구 연속 방지)
  // 한쪽 후보가 없으면 있는 쪽만 차례로
  const alternator = ({ bad, good }) => {
    const queues = { bad: [], good: [] };
    const kinds = [bad.length && "bad", good.length && "good"].filter(Boolean);
    let k = Math.floor(Math.random() * kinds.length), last = { bad: null, good: null };
    return () => {
      if (!kinds.length) return "";
      const kind = kinds[k % kinds.length]; k++;
      const src = kind === "bad" ? bad : good;
      if (!queues[kind].length) {
        queues[kind] = shuffled(src);
        if (src.length > 1 && queues[kind][0] === last[kind]) queues[kind].push(queues[kind].shift());
      }
      return (last[kind] = queues[kind].shift());
    };
  };

  function viewQuiz() {
    // 시작 화면의 문구 교체 타이머. 시작 버튼·페이지 이동 때 반드시 정리
    let rotateTimer = null, fadeTimer = null;
    const stopRotate = () => {
      clearInterval(rotateTimer); clearTimeout(fadeTimer);
      rotateTimer = fadeTimer = null;
    };
    onLeave(stopRotate);

    const start = () => {
      stopRotate();
      quizState = { items: drawQuestions(), idx: -1, results: [], done: false };
      next();
    };

    const intro = () => {
      stopRotate();
      const I = QUIZ.intro || {};
      const n = Math.min(QUIZ.drawCount, QUIZ.pool.length);
      const vals = { 출제: n, 전체: QUIZ.pool.length, 정상: Math.min(QUIZ.minGood, n) };
      const nextCopy = alternator(introCopies());
      const first = nextCopy();
      app.innerHTML = `
        <section class="section qi-sec"><div class="wrap qi">
          <h1 class="qi-title" aria-label="이 광고, 믿어도 될까?">
            <span class="qi-line">이 광고,</span>
            <span class="qi-bracket" aria-hidden="true"><span class="qi-p">(</span><span class="qi-copy">${esc(first)}</span><span class="qi-p">)</span></span>
            <span class="qi-line">믿어도 될까?</span>
          </h1>
          ${I.lead ? `<p class="qi-lead">${esc(I.lead)}</p>` : ""}
          ${(I.fields || []).length ? `
          <dl class="qi-fields">
            ${I.fields.map((f) => `
              <div class="qi-field">
                <dt>${esc(f.label)}</dt>
                <dd><b>${esc(fill(f.value || "", vals))}</b>${f.note ? `<span>${esc(fill(f.note, vals))}</span>` : ""}</dd>
              </div>`).join("")}
          </dl>` : ""}
          <div class="btn-row qi-start"><button class="btn btn-primary" data-start>시작하기 →</button></div>
        </div></section>`;
      app.querySelector("[data-start]").addEventListener("click", start);

      // 3.5초마다 짧은 페이드로 교체. 동작 줄이기 설정이면 첫 문구 고정
      const el = app.querySelector(".qi-copy");
      const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) return;
      rotateTimer = setInterval(() => {
        el.classList.add("is-out");
        fadeTimer = setTimeout(() => {
          el.textContent = nextCopy();
          el.classList.remove("is-out");
        }, 250);
      }, 3500);
    };

    const next = () => {
      quizState.idx++;
      if (quizState.idx >= quizState.items.length) return result();
      question(quizState.items[quizState.idx]);
      window.scrollTo(0, 0);
    };

    const question = (q) => {
      const state = quizState, items = state.items;
      const n = state.idx + 1, total = items.length;
      const keys = "ABCDE";
      const pad = (x) => String(x).padStart(2, "0");
      // 문항 눈금: 지난 문항은 맞음/틀림, 현재 문항은 굵게
      const ticks = () => items.map((_, i) => {
        const r = state.results[i];
        const cls = r ? (r.ok ? "ok" : "no") : i === state.idx ? "now" : "";
        return `<li class="${cls}"></li>`;
      }).join("");
      app.innerHTML = `
        <section class="section"><div class="wrap flow quiz">
          <div class="quiz-top">
            <p class="quiz-no"><b>${pad(n)}</b> / ${pad(total)}</p>
            <ol class="ticks" aria-hidden="true">${ticks()}</ol>
          </div>
          ${adCard(q.ad)}
          <p class="question">${esc(q.question)}</p>
          <div class="qopts">
            ${q.options.map((o, i) => `
              <button class="qopt" data-i="${i}">
                <span class="k">${keys[i]}</span><span class="t">${esc(o.text)}</span><span class="v"></span>
              </button>`).join("")}
          </div>
          <div class="feedback-slot" aria-live="polite"></div>
        </div></section>`;

      // 답을 고른 뒤의 화면(정답 표시 + 해설). 처음 고를 때와, 다른 페이지에서 돌아와 복원할 때 함께 쓴다
      const showAnswer = (picked) => {
        const ok = q.options[picked].correct;
        const answer = q.options.findIndex((o) => o.correct);
        app.querySelectorAll(".qopt").forEach((b, i) => {
          b.disabled = true;
          const v = b.querySelector(".v");
          if (i === answer) { b.classList.add("is-answer"); v.textContent = i === picked ? "정답 · 내 선택" : "정답"; }
          else if (i === picked) { b.classList.add("is-wrong"); v.textContent = "내 선택"; }
          else b.classList.add("is-dim");
        });
        app.querySelector(".ticks").innerHTML = ticks();
        app.querySelector(".feedback-slot").innerHTML = `
          <div class="qexp ${ok ? "ok" : "no"}">
            <p class="verdict">${ok ? "맞혔습니다." : `틀렸습니다. 정답은 ${keys[answer]}입니다.`}</p>
            <p>${esc(q.explain)}</p>
            ${q.signal ? signalTag(q.signal) : ""}
          </div>
          <div class="btn-row qnext">
            <button class="btn btn-primary" data-next>${n === total ? "결과 보기" : "다음 문제"} →</button>
          </div>`;
        app.querySelector("[data-next]").addEventListener("click", next);
      };

      // 이미 답한 문항이면(링크로 나갔다 돌아온 경우) 해설까지 펼친 상태로 복원
      const prev = state.results[state.idx];
      if (prev) {
        showAnswer(prev.picked);
        // 라우터가 맨 위로 올린 다음에 실행되도록 한 프레임 미룸
        requestAnimationFrame(() => app.querySelector(".qexp").scrollIntoView({ block: "center", behavior: "instant" }));
        return;
      }

      app.querySelectorAll(".qopt").forEach((btn) => btn.addEventListener("click", () => {
        const picked = +btn.dataset.i;
        state.results[state.idx] = { q, ok: q.options[picked].correct, picked };
        showAnswer(picked);
        app.querySelector(".qexp").scrollIntoView({ block: "nearest", behavior: "smooth" });
      }));
    };

    const result = () => {
      const state = quizState;
      const score = state.results.filter((r) => r.ok).length;
      const total = state.items.length;
      // 결과 문구는 10문항 기준 점수 구간이므로 문항 수가 달라져도 비율로 환산
      const scaled = Math.round((score / total) * 10);
      const r = QUIZ.results.find((x) => scaled >= x.min) || QUIZ.results[QUIZ.results.length - 1];
      if (!state.done) analytics.event("quiz-complete"); // 결과 화면으로 돌아올 때는 다시 집계하지 않음
      state.done = true;
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="result-hero">
                        <p class="score">${score}<small>/ ${total}</small></p>
            <h2>${esc(r.title)}</h2>
            <p>${esc(r.body)}</p>
            <div class="btn-row">
              <button class="btn btn-primary" data-retry>새 문제로 다시 풀기</button>
              <button class="btn btn-ghost" data-share>결과 공유</button>
              ${surveyButton("general", "설문 참여하기")}
            </div>
          </div>
          <h3 class="sub-head">문항별 돌아보기</h3>
          <div class="review">
            ${state.results.map(({ q, ok }) => `
              <div class="review-item">
                <span class="mark ${ok ? "o" : "x"}">${ok ? "O" : "X"}</span>
                <div><strong>${esc(q.ad.brand)}</strong> - ${esc(q.ad.copy)}
                  ${!ok && q.signal ? `<div style="margin-top:6px">${signalTag(q.signal)}</div>` : ""}
                </div>
              </div>`).join("")}
          </div>
          <div class="btn-row" style="margin-top:24px">
            <a class="btn btn-ghost" href="#/check">실제 광고에 판독기 써보기</a>
          </div>
        </div></section>`;
      app.querySelector("[data-retry]").addEventListener("click", start);
      app.querySelector("[data-share]").addEventListener("click", () =>
        share(`그린워싱 판단 퀴즈 ${score}/${total} - ‘${r.title}’ 결과가 나왔어요. 당신은 몇 개나 알아볼 수 있나요?`));
      window.scrollTo(0, 0);
    };

    // 진행 중이던 퀴즈가 있으면 이어서, 없으면 시작 화면
    if (!quizState) intro();
    else if (quizState.done) result();
    else question(quizState.items[quizState.idx]);
  }

  // ---------- 판독기 ----------
  // 판독기 진행 상태도 퀴즈처럼 viewCheck 밖(모듈 수준)에 둔다. 다른 페이지 다녀와도 유지, 새로 고침하면 초기화.
  // { answers: 문항별로 고른 answer key(안 고르면 null), page: 현재 페이지(0부터), done: 결과 화면 도달, counted: 통계 집계 여부 }
  // 결과 화면의 입력칸(제품명, 광고 문구)은 여기에 저장하지 않는다.
  let checkState = null;
  const CHECK_PER_PAGE = 3; // 한 페이지 문항 수. 휴대폰에서 한 페이지가 2화면을 넘지 않도록 3개

  function viewCheck() {
    const qs = CHECK.questions;
    const pages = Math.ceil(qs.length / CHECK_PER_PAGE);
    const fresh = () => ({ answers: new Array(qs.length).fill(null), page: 0, done: false, counted: false });
    const restart = () => { checkState = fresh(); showPage(); };

    const intro = () => {
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="result-hero">
                        <h1>이 광고의 그린워싱 위험도는?</h1>
            <p>${esc(CHECK.intro)}</p>
            <div class="btn-row"><button class="btn btn-primary" data-start>판독 시작 (${qs.length}문항)</button></div>
          </div>
        </div></section>`;
      app.querySelector("[data-start]").addEventListener("click", restart);
    };

    // 한 페이지에 CHECK_PER_PAGE개 문항. 모두 답해야 '다음'이 활성화되고, '이전'으로 돌아가 답을 바꿀 수 있다
    const showPage = () => {
      const st = checkState;
      const from = st.page * CHECK_PER_PAGE;
      const idxs = qs.slice(from, from + CHECK_PER_PAGE).map((_, k) => from + k);
      const last = st.page === pages - 1;
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="progress">
            <span>${st.page + 1} / ${pages}</span>
            <div class="progress-bar"><span></span></div>
          </div>
          <div class="check-page">
            ${idxs.map((i) => {
              const q = qs[i], s = signalById[q.signal];
              const sel = st.answers[i];
              return `
              <div class="check-q">
                <p class="check-q-head"><span class="check-q-no">${i + 1}</span>${s ? `<span class="tag">${picon(s.id, 14)}${esc(s.title)}</span>` : ""}</p>
                <p class="question" id="cq-${i}">${esc(q.text)}</p>
                <div class="check-answers" role="radiogroup" aria-labelledby="cq-${i}" data-q="${i}">
                  ${CHECK.answers.map((a, k) => `<button type="button" class="option" role="radio" data-key="${a.key}"
                    aria-checked="${sel === a.key}" tabindex="${sel ? (sel === a.key ? 0 : -1) : (k === 0 ? 0 : -1)}">${esc(a.label)}</button>`).join("")}
                </div>
              </div>`;
            }).join("")}
          </div>
          <p class="check-left small muted" aria-live="polite"></p>
          <div class="nav-row">
            ${st.page > 0 ? `<button type="button" class="btn btn-ghost" data-back>이전</button>` : "<span></span>"}
            <button type="button" class="btn btn-primary" data-next>${last ? "결과 보기" : "다음"} →</button>
          </div>
        </div></section>`;

      const nextBtn = app.querySelector("[data-next]");
      const unanswered = () => idxs.filter((i) => !st.answers[i]);
      const update = () => {
        const left = unanswered().length;
        nextBtn.setAttribute("aria-disabled", String(left > 0));
        app.querySelector(".check-left").textContent = left ? `남은 문항 ${left}개` : "";
        // 진행 바는 페이지 단위: 이 페이지를 다 답하면 한 칸 채움
        app.querySelector(".progress-bar span").style.width = `${((st.page + (left ? 0 : 1)) / pages) * 100}%`;
      };

      app.querySelectorAll(".check-answers").forEach((group) => {
        const i = +group.dataset.q;
        const radios = [...group.querySelectorAll("[role=radio]")];
        const choose = (b) => {
          st.answers[i] = b.dataset.key;
          radios.forEach((r) => { r.setAttribute("aria-checked", String(r === b)); r.tabIndex = r === b ? 0 : -1; });
          update();
        };
        radios.forEach((b, k) => {
          b.addEventListener("click", () => choose(b));
          // 라디오 그룹 키보드 조작: 화살표로 이동하며 선택
          b.addEventListener("keydown", (e) => {
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!step) return;
            e.preventDefault();
            const to = radios[(k + step + radios.length) % radios.length];
            to.focus();
            choose(to);
          });
        });
      });

      nextBtn.addEventListener("click", () => {
        const left = unanswered();
        if (left.length) {
          // 비활성 상태에서 누르면 아직 안 고른 첫 문항으로 안내
          const g = app.querySelector(`.check-answers[data-q="${left[0]}"]`);
          g.scrollIntoView({ block: "center", behavior: "instant" });
          g.querySelector("[tabindex='0']").focus({ preventScroll: true });
          return;
        }
        if (last) { st.done = true; return result(); }
        st.page++;
        showPage();
      });
      const back = app.querySelector("[data-back]");
      if (back) back.addEventListener("click", () => { st.page--; showPage(); });

      update();
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    const result = () => {
      const answers = checkState.answers;
      // 점수 = Σ(weight × factor) / Σweight × 100
      const factor = Object.fromEntries(CHECK.answers.map((a) => [a.key, a.factor]));
      const max = qs.reduce((sum, q) => sum + q.weight, 0);
      const got = qs.reduce((sum, q, i) => sum + q.weight * (factor[answers[i]] || 0), 0);
      const pct = Math.round((got / max) * 100);
      const level = CHECK.levels.find((l) => pct >= l.min);
      const flagged = qs
        .map((q, i) => ({ q, f: factor[answers[i]] || 0 }))
        .filter((x) => x.f > 0)
        .sort((a, b) => b.q.weight * b.f - a.q.weight * a.f);
      if (!checkState.counted) analytics.event("check-complete-" + level.key); // 돌아와서 다시 볼 때는 집계 안 함
      checkState.counted = true;

      // 결과 화면 하단: 근거 요청 문구 / 신고 안내 / AI 검토 프롬프트 (문구는 checklist.js)
      const RQ = CHECK.request, RP = CHECK.report, AI = CHECK.aiPrompt;
      const asks = [...new Set(flagged.map(({ q }) => q.ask).filter(Boolean))];
      const principleList = C.signals.map((s) => `${s.no} ${s.principle}: ${s.short}`).join("\n");
      const flagList = flagged.length
        ? flagged.map(({ q, f }) => `- ${signalById[q.signal].no} ${signalById[q.signal].principle}${f < 1 ? " (정보 부족)" : ""}: ${q.text}`).join("\n")
        : AI.noFlags;

      app.innerHTML = `
        <section class="section"><div class="wrap flow level-${level.key}">
          <div class="result-hero">
            <p class="score lv" aria-label="위험도 ${pct}점">${pct}<small>/ 100</small></p>
            <p class="level-label">${esc(level.label)}</p>
            <div class="meter" aria-hidden="true"><span></span></div>
            <p>${esc(level.body)}</p>
            <div class="btn-row">
              <button class="btn btn-primary" data-retry>다시 하기</button>
              <button class="btn btn-ghost" data-share>결과 공유</button>
            </div>
          </div>

          ${flagged.length ? `
            <h3 class="sub-head">확인이 필요한 부분 (${flagged.length})</h3>
            <div class="flagged">
              ${flagged.map(({ q, f }) => {
                const s = signalById[q.signal];
                return `<div class="flag ${f < 1 ? "half" : ""}">
                  <p class="t">${picon(s.id, 18)}${esc(s.title)} ${f < 1 ? '<span class="small muted">(정보 부족)</span>' : ""}</p>
                  <p class="d">${esc(q.text)}</p>
                  <p class="d"><a href="#/learn/${s.id}">이 원칙 자세히 보기</a></p>
                </div>`;
              }).join("")}
            </div>` : `<p class="muted" style="margin-top:20px">걸린 항목이 없습니다.</p>`}

          <section class="act">
            <h3>${esc(RQ.heading)}</h3>
            <p class="muted">${esc(RQ.help)}</p>
            <label class="field"><span>${esc(RQ.productLabel)}</span>
              <input id="rq-product" type="text" placeholder="${esc(RQ.productPlaceholder)}" autocomplete="off">
            </label>
            ${asks.length ? `
              <pre class="preview" id="rq-preview"></pre>
              <div class="btn-row"><button class="btn btn-primary" data-copy-request>요청 문구 복사</button></div>`
              : `<p class="muted">${esc(RQ.none)}</p>`}
          </section>

          <section class="act">
            <h3>${esc(RP.heading)}</h3>
            <p class="muted">${esc(RP.help)}</p>
            <ul class="channels">
              ${RP.channels.map((c) => `
                <li>
                  <p><strong>${esc(c.who)}</strong>${c.law ? ` <span class="small muted">${esc(c.law)}</span>` : ""}</p>
                  <p class="small muted">${esc(c.what)}</p>
                  <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.urlLabel)} ↗</a>
                  ${c.path ? `<p class="small muted">${esc(c.path)}</p>` : ""}
                </li>`).join("")}
            </ul>
            <h4 class="minor">${esc(RP.prepareTitle)}</h4>
            <ul class="prepare">${RP.prepare.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          </section>

          <section class="act">
            <h3>${esc(AI.heading)}</h3>
            <p class="muted">${esc(AI.help)}</p>
            <label class="field"><span>${esc(AI.adLabel)}</span>
              <textarea id="ai-ad" rows="4" placeholder="${esc(AI.adPlaceholder)}"></textarea>
            </label>
            <details class="prompt-peek">
              <summary>만들어진 프롬프트 미리 보기</summary>
              <pre class="preview" id="ai-preview"></pre>
            </details>
            <div class="btn-row"><button class="btn btn-primary" data-copy-prompt>AI 검토 프롬프트 복사</button></div>
          </section>

          <p class="disclaimer">${esc(CHECK.disclaimer)}</p>
        </div></section>`;

      const productEl = app.querySelector("#rq-product");
      const adEl = app.querySelector("#ai-ad");
      const requestText = () => fill(RQ.template, {
        제품: productEl.value.trim() || RQ.productFallback,
        질문목록: asks.map((a, i) => `${i + 1}. ${a}`).join("\n")
      });
      const promptText = () => fill(AI.template, {
        제품: productEl.value.trim() || "(입력 안 함)",
        광고문구: adEl.value.trim(),
        원칙목록: principleList,
        판독결과: flagList
      });
      const refresh = () => {
        const rq = app.querySelector("#rq-preview");
        if (rq) rq.textContent = requestText();
        app.querySelector("#ai-preview").textContent = promptText();
      };
      productEl.addEventListener("input", refresh);
      adEl.addEventListener("input", refresh);
      refresh();
      const copyReq = app.querySelector("[data-copy-request]");
      if (copyReq) copyReq.addEventListener("click", () => { copyText(requestText()); analytics.event("check-copy-request"); });
      app.querySelector("[data-copy-prompt]").addEventListener("click", () => {
        if (!adEl.value.trim()) { toast(AI.empty); adEl.focus(); return; }
        copyText(promptText());
        analytics.event("check-copy-prompt");
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        app.querySelector(".meter span").style.width = `${pct}%`;
      }));
      app.querySelector("[data-retry]").addEventListener("click", restart); // 1페이지 빈 상태로
      app.querySelector("[data-share]").addEventListener("click", () =>
        share(`그린워싱 판독기로 광고를 확인해 봤어요: 위험도 ${pct}점 (${level.label})`));
      window.scrollTo({ top: 0, behavior: "instant" });
    };

    // 진행 중이던 판독이 있으면 이어서, 없으면 시작 화면
    if (!checkState) intro();
    else if (checkState.done) result();
    else showPage();
  }

  // ---------- 소개 ----------
  function viewAbout() {
    const t = CFG.team || {};
    const surveys = [surveyButton("general", "소비자 인식 설문 참여"), surveyButton("post", "체험 후 만족도 조사")].join("");
    app.innerHTML = `
      <section class="section">
        <div class="wrap">
          <div class="section-head">
                        <h1>왜 이 사이트를 만들었나요?</h1>
          </div>
          <div class="about-grid">
            <div class="card stack">
              <p>정부는 기업이 스스로 점검할 수 있는 그린워싱 자가진단표를 만들었지만, 정작 광고를 보는 소비자가 쓸 수 있는 도구는 거의 없습니다.</p>
              <p>이 사이트는 「환경성 표시·광고 관리제도에 관한 고시」의 8대 원칙과 공정거래위원회 심사지침, 환경부 가이드라인의 기준을 소비자의 질문으로 바꾸어, 누구나 친환경 광고의 근거를 스스로 확인해 볼 수 있도록 만들었습니다.</p>
              <p>목표는 특정 기업을 비난하는 것이 아니라, ‘친환경’이라는 말 앞에서 한 번 더 근거를 묻는 소비 습관을 만드는 것입니다. 그런 소비자가 늘어날수록 기업도 더 정확한 정보를 내놓게 됩니다.</p>
              ${surveys ? `<div class="btn-row" style="margin-top:16px">${surveys}</div>` : ""}
            </div>
            <div class="card stack">
              <h3>만든 사람들</h3>
              <p class="muted">${esc(t.project)}${t.name ? ` · ${esc(t.name)}` : ""}</p>
              ${t.members && t.members.length ? `<ul class="member-list">${t.members.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
              ${t.contact ? `<p class="small">문의: ${esc(t.contact)}</p>` : ""}
              ${t.instagram ? `<p class="small"><a href="${esc(t.instagram)}" target="_blank" rel="noopener">인스타그램 ↗</a></p>` : ""}
              <h3 style="margin-top:20px">참고한 기준</h3>
              <ul class="member-list small muted">
                <li>「환경기술 및 환경산업 지원법」 제16조의10</li>
                <li>「환경성 표시·광고 관리제도에 관한 고시」</li>
                <li>공정거래위원회, 「환경 관련 표시·광고에 관한 심사지침」 (2023 개정)</li>
                <li>환경부·한국환경산업기술원, 「친환경 경영활동 표시·광고 가이드라인」 (2023.10)</li>
                <li>TerraChoice, 그린워싱의 7가지 죄악</li>
                <li>그린피스, 대기업집단 소셜미디어 그린워싱 실태 조사 (2023)</li>
                <li>EU 지침 2024/825 (그린 전환을 위한 소비자 역량 강화)</li>
              </ul>
            </div>
          </div>
          <p class="disclaimer">${esc(CHECK.disclaimer)} 퀴즈에 등장하는 브랜드와 광고는 모두 가상이며, 실제 사례 페이지의 내용은 공개된 기관 발표와 언론 보도를 바탕으로 합니다.</p>
        </div>
      </section>`;
  }

  /* ============================================================
     시작
     ============================================================ */
  document.querySelectorAll("[data-site-name]").forEach((el) => (el.textContent = CFG.siteName));
  document.querySelectorAll("[data-project]").forEach((el) => (el.textContent = (CFG.team && CFG.team.project) || ""));
  analytics.init();
  window.addEventListener("hashchange", router);
  router();
})();
