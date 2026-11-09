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
  const signalTag = (id) => {
    const s = signalById[id];
    return s ? `<a class="tag" href="#/learn/${s.id}">${esc(s.no)} ${esc(s.title)}</a>` : "";
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

  function router() {
    const [name = "", param] = location.hash.replace(/^#\/?/, "").split("/");
    const view = routes[name] || viewHome;
    document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
    view(param);
    const titles = { learn: "알아보기", cases: "사례", quiz: "퀴즈", check: "판독기", about: "소개" };
    document.title = titles[name] ? `${titles[name]} · ${CFG.siteName}` : CFG.siteName;
    if (!param) window.scrollTo(0, 0);
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

      <section class="sec">
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
                <span class="no">${esc(s.no)}</span>
                <strong>${esc(s.title)}</strong>
                <span class="pr">${esc(s.principle)}</span>
              </a></li>`).join("")}
          </ol>
        </div>
      </section>`;
  }

  // 가상 광고: 이모지 없이 브랜드명을 크게
  function adCard(ad) {
    return `
      <div class="ad">
        <span class="ad-label">가상 광고</span>
        <div class="ad-visual look-${esc(ad.look)}" aria-hidden="true">${esc(ad.brand)}</div>
        <div class="ad-body">
          <p class="ad-brand">${esc(ad.brand)} · ${esc(ad.product)}</p>
          <p class="ad-copy">${esc(ad.copy)}</p>
        </div>
      </div>`;
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
            ${photo(C.definition.photo)}
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
                <span class="p-no" aria-hidden="true">${esc(s.no)}</span>
                <div class="p-body">
                  <h3>${esc(s.title)} <span class="p-name">원칙 ${esc(s.no)} ${esc(s.principle)}</span></h3>
                  <p class="short">${esc(s.short)}</p>
                  <details ${s.id === focusId ? "open" : ""}>
                    <summary>자세히 보기</summary>
                    <div class="detail">
                      <p>${esc(s.desc)}</p>
                      <div class="example bad"><b>이런 표현은 의심</b>${esc(s.bad)}</div>
                      <div class="example good"><b>이렇게 쓰면 확인 가능</b>${esc(s.good)}</div>
                      ${s.fashion ? `<div class="example fashion"><b>패션 광고에서는</b>${esc(s.fashion)}</div>` : ""}
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
            ${C.toolkit.map((t) => `<li class="step"><h3>${esc(t.title)}</h3><p class="muted small">${esc(t.body)}</p></li>`).join("")}
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
            <span class="tag">${esc(c.region)} · ${esc(c.industry)} · ${c.year}</span>
            <span class="badge ${esc(c.outcome.type)}">${outcomeLabel[c.outcome.type] || ""}</span>
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

  function viewQuiz() {
    let items = [];
    const state = { idx: -1, results: [] };

    const start = () => {
      items = drawQuestions();
      state.idx = -1;
      state.results = [];
      next();
    };

    const intro = () => {
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="result-hero">
                        <h1>이 광고, 믿어도 될까?</h1>
            <p>가상의 광고 ${QUIZ.pool.length}개 중 ${Math.min(QUIZ.drawCount, QUIZ.pool.length)}개가 무작위로 나옵니다. 모든 광고가 그린워싱은 아닙니다. 근거가 잘 갖춰진 광고도 섞여 있습니다.</p>
            <div class="btn-row"><button class="btn btn-primary" data-start>시작하기</button></div>
          </div>
        </div></section>`;
      app.querySelector("[data-start]").addEventListener("click", start);
    };

    const next = () => {
      state.idx++;
      if (state.idx >= items.length) return result();
      question(items[state.idx]);
      window.scrollTo(0, 0);
    };

    const question = (q) => {
      const n = state.idx + 1, total = items.length;
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="progress">
            <span>${n} / ${total}</span>
            <div class="progress-bar"><span style="width:${((n - 1) / total) * 100}%"></span></div>
          </div>
          ${adCard(q.ad)}
          <p class="question">${esc(q.question)}</p>
          <div class="options">
            ${q.options.map((o, i) => `<button class="option" data-i="${i}">${esc(o.text)}</button>`).join("")}
          </div>
          <div class="feedback-slot"></div>
        </div></section>`;

      app.querySelectorAll(".option").forEach((btn) => btn.addEventListener("click", () => {
        const ok = q.options[+btn.dataset.i].correct;
        state.results.push({ q, ok });
        app.querySelectorAll(".option").forEach((b, i) => {
          b.disabled = true;
          if (q.options[i].correct) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
          else b.classList.add("dim");
        });
        app.querySelector(".progress-bar span").style.width = `${(n / total) * 100}%`;
        app.querySelector(".feedback-slot").innerHTML = `
          <div class="feedback ${ok ? "ok" : "no"}">
            <h4>${ok ? "정답입니다" : "다시 생각해 볼까요?"}</h4>
            <p>${esc(q.explain)}</p>
            ${q.signal ? signalTag(q.signal) : ""}
          </div>
          <div class="nav-row"><span></span>
            <button class="btn btn-primary" data-next>${n === total ? "결과 보기" : "다음 문제"} →</button>
          </div>`;
        app.querySelector("[data-next]").addEventListener("click", next);
        app.querySelector(".feedback").scrollIntoView({ block: "nearest", behavior: "smooth" });
      }));
    };

    const result = () => {
      const score = state.results.filter((r) => r.ok).length;
      const total = items.length;
      // 결과 문구는 10문항 기준 점수 구간이므로 문항 수가 달라져도 비율로 환산
      const scaled = Math.round((score / total) * 10);
      const r = QUIZ.results.find((x) => scaled >= x.min) || QUIZ.results[QUIZ.results.length - 1];
      analytics.event("quiz-complete");
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

    intro();
  }

  // ---------- 판독기 ----------
  function viewCheck() {
    const qs = CHECK.questions;
    const answers = new Array(qs.length).fill(null); // 각 문항에 고른 answer key
    let idx = -1;

    const intro = () => {
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="result-hero">
                        <h1>이 광고의 그린워싱 위험도는?</h1>
            <p>${esc(CHECK.intro)}</p>
            <div class="btn-row"><button class="btn btn-primary" data-start>판독 시작 (${qs.length}문항)</button></div>
          </div>
        </div></section>`;
      app.querySelector("[data-start]").addEventListener("click", () => go(0));
    };

    const go = (i) => {
      idx = i;
      if (idx >= qs.length) return result();
      const q = qs[idx];
      const s = signalById[q.signal];
      app.innerHTML = `
        <section class="section"><div class="wrap flow">
          <div class="progress">
            <span>${idx + 1} / ${qs.length}</span>
            <div class="progress-bar"><span style="width:${(idx / qs.length) * 100}%"></span></div>
          </div>
          <div class="card">
            ${s ? `<span class="tag">원칙 ${esc(s.no)} ${esc(s.principle)}</span>` : ""}
            <p class="question">${esc(q.text)}</p>
            <div class="check-answers">
              ${CHECK.answers.map((a) => `<button class="option ${answers[idx] === a.key ? "selected" : ""}" data-key="${a.key}">${esc(a.label)}</button>`).join("")}
            </div>
          </div>
          <div class="nav-row">
            <button class="btn btn-ghost" data-back ${idx === 0 ? "disabled style=\"visibility:hidden\"" : ""}>← 이전</button>
          </div>
        </div></section>`;
      app.querySelectorAll("[data-key]").forEach((b) => b.addEventListener("click", () => {
        answers[idx] = b.dataset.key;
        b.classList.add("selected");
        setTimeout(() => go(idx + 1), 160); // 선택 표시를 잠깐 보여준 뒤 다음 문항
      }));
      app.querySelector("[data-back]").addEventListener("click", () => go(idx - 1));
    };

    const result = () => {
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
      analytics.event("check-complete-" + level.key);

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
              <button class="btn btn-primary" data-retry>다른 광고 판독하기</button>
              <button class="btn btn-ghost" data-share>결과 공유</button>
            </div>
          </div>

          ${flagged.length ? `
            <h3 class="sub-head">확인이 필요한 부분 (${flagged.length})</h3>
            <div class="flagged">
              ${flagged.map(({ q, f }) => {
                const s = signalById[q.signal];
                return `<div class="flag ${f < 1 ? "half" : ""}">
                  <p class="t">${esc(s.no)} ${esc(s.title)} ${f < 1 ? '<span class="small muted">(정보 부족)</span>' : ""}</p>
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
      app.querySelector("[data-retry]").addEventListener("click", () => viewCheck());
      app.querySelector("[data-share]").addEventListener("click", () =>
        share(`그린워싱 판독기로 광고를 확인해 봤어요: 위험도 ${pct}점 (${level.label})`));
      window.scrollTo(0, 0);
    };

    intro();
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
