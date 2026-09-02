(() => {
  "use strict";

  const localCacheOverride = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? new URLSearchParams(window.location.search).get("artifactApi") : "";
  const GITHUB_CACHE_URL =
    "https://raw.githubusercontent.com/Not4You-Dev/NotMeter-Web/main/presence/notmeter-artifact-occupation-public.json";
  const EXPECTED_SCHEMA = "notmeter-artifact-occupation-public-v1";
  const EXPECTED_REVISION = "kr-2026-08-26";
  const MATCH_DURATION_DAYS = 14;
  const MATCH_BATTLE_WEEKDAYS = new Set([3, 6]);
  const DAY_MS = 24 * 60 * 60_000;
  const KOREA_OFFSET_MS = 9 * 60 * 60_000;
  const POLL_INTERVAL_MS = 5 * 60_000;
  const REQUEST_TIMEOUT_MS = 8_000;
  const FAVORITE_STORAGE_KEY = "notmeter-artifact-favorite-servers-v1";
  const ICON_URLS = Object.freeze({
    neutral: "./assets/artifact-neutral.png",
    west: "./assets/artifact-west.png?v=20260902-2",
    east: "./assets/artifact-east.png",
  });
  const PAIRS = [
    [1, 1001, "시엘", 2001, "이스라펠"], [2, 2002, "지켈", 2006, "아스펠"],
    [3, 1003, "바이젤", 2007, "에레슈키갈"], [4, 1004, "카이시넬", 1002, "네자칸"],
    [5, 2005, "마르쿠탄", 2003, "트리니엘"], [6, 1005, "유스티엘", 2018, "바바룽"],
    [7, 1006, "아리엘", 2004, "루미엘"], [8, 1009, "히타니에", 1014, "다미누"],
    [9, 1010, "나니아", 1019, "이슈타르"], [10, 2011, "루드라", 2008, "브리트라"],
    [11, 1011, "타하바타", 2019, "파프니르"], [12, 1012, "루터스", 1018, "코치룽"],
    [13, 1013, "페르노스", 2012, "울고른"], [14, 2015, "젠카카", 2013, "무닌"],
    [15, 1015, "카사카", 2017, "콰이링"], [16, 2016, "크로메데", 2009, "네몬"],
    [17, 1016, "바카르마", 2020, "인드나흐"], [18, 1017, "챈가룽", 2014, "오다르"],
    [19, 1020, "티아마트", 1008, "메스람타에다"], [20, 2021, "이스할겐", 2010, "하달"],
    [21, 1021, "포에타", 1007, "프레기온"],
  ].map(([pairId, westId, west, eastId, east]) => ({
    pairId, west: { serverId: westId, name: west }, east: { serverId: eastId, name: east },
  }));
  const ARTIFACTS = {
    1: [
      [1001, "에레슈란타의 뿌리 아티팩트"],
      [1002, "유황나무섬 아티팩트"],
      [1003, "시엘의 날개 군도 아티팩트"],
    ],
    2: [
      [2001, "침식된 중앙섬 아티팩트"],
      [2002, "오염된 늪지 아티팩트"],
      [2003, "뒤틀린 고목나무 숲 아티팩트"],
    ],
  };
  const COPY = {
    ko: {
      description: "한국 서버 21개 대진의 점령 현황을 한눈에 확인하세요.",
      overviewTitle: "전체 21개 서버 대진", overviewCaption: "별을 누른 서버는 항상 위에 표시됩니다.",
      roundLabel: "점령전 회차", currentRound: "현재 현황", historyOption: "{date} 점령전",
      historyTitle: "{date} 점령 결과", historyCaption: "종료된 회차의 하층·중층 점령 결과입니다.",
      historyRecord: "점령전 종료 기록", historySource: "완료된 점령전 결과를 회차별로 보관합니다.",
      matchLabel: "현재 서버 매칭", matchWeek: "2주 매칭 · {week}주차", matchRange: "{start} 시작 · {end} 교체 예정",
      matchRoundLabel: "2주 점령전", matchRounds: "점령전 총 {total}회", matchSchedule: "매주 수·토 22:00",
      matchRemaining: "매칭 교체까지", matchEnded: "새 매칭 확인 중", matchReset: "새 매칭 시작 시 누적 점수가 초기화됩니다.",
      currentScore: "현재 점령", roundScore: "회차 결과", cumulativeScore: "2주 누적",
      cumulativeCoverage: "{count}/{total}회 집계", cumulativePending: "집계 준비 중",
      scoringGuide: "아티팩트 1곳을 1점으로 계산하며, 하층·중층이 모두 확인된 회차만 2주 누적 점수에 반영합니다.",
      snapshot: "이미지 복사", snapshotWorking: "이미지 만드는 중", snapshotCopied: "복사 완료",
      snapshotDownloaded: "파일 저장 완료", snapshotFailedShort: "다시 시도",
      loading: "아티팩트 현황을 불러오는 중입니다",
      errorTitle: "현황을 불러오지 못했습니다", error: "잠시 후 다시 확인해 주세요.",
      west: "서부 진영", east: "동부 진영", occupied: "현재 점령", waiting: "현황 확인 중",
      partial: "일부 현황 확인 중",
      westLead: "서부 진영 우세", eastLead: "동부 진영 우세", draw: "양 진영 동률",
      next: "다음 아티팩트 점령전", lower: "어비스 하층", middle: "어비스 중층",
      lowerCaption: "하층 아티팩트 3곳", middleCaption: "중층 아티팩트 3곳",
      neutral: "미확인", confirmed: "확인됨", updated: "최근 확인 {time}",
      noData: "새 회차 정보 확인 중", source: "한국 서버에서 확인된 현황을 약 5분마다 반영합니다.",
      favoriteServer: "{server} 즐겨찾기", unfavoriteServer: "{server} 즐겨찾기 해제",
      copied: "이미지를 클립보드에 복사했습니다.", downloaded: "이미지 파일로 저장했습니다.",
      snapshotFailed: "이미지를 만들지 못했습니다.", koreaOnly: "한국 서버 전용",
    },
    en: {
      description: "See all 21 Korean server matchups and their artifact control at once.",
      overviewTitle: "All 21 server matchups", overviewCaption: "Star a server to keep its matchup at the top.",
      roundLabel: "Battle round", currentRound: "Current status", historyOption: "{date} battle",
      historyTitle: "Results for {date}", historyCaption: "Final Lower and Middle Abyss control for this round.",
      historyRecord: "Final battle result", historySource: "Completed artifact battles are saved by round.",
      matchLabel: "Current server match", matchWeek: "Two-week match · Week {week}", matchRange: "{start} start · {end} change",
      matchRoundLabel: "Two-week battles", matchRounds: "{total} artifact battles", matchSchedule: "Wed & Sat at 22:00",
      matchRemaining: "Until matchup change", matchEnded: "Waiting for new matchup", matchReset: "The total resets when a new matchup begins.",
      currentScore: "Current control", roundScore: "Round result", cumulativeScore: "Two-week total",
      cumulativeCoverage: "{count}/{total} rounds", cumulativePending: "Waiting for data",
      scoringGuide: "Each artifact is worth one point. Only rounds with all Lower and Middle Abyss locations confirmed are included.",
      snapshot: "Copy image", snapshotWorking: "Creating image", snapshotCopied: "Copied",
      snapshotDownloaded: "File saved", snapshotFailedShort: "Try again",
      loading: "Loading artifact status",
      errorTitle: "Artifact status is unavailable", error: "Please try again shortly.",
      west: "West", east: "East", occupied: "Current control", waiting: "Checking status",
      partial: "Some locations pending",
      westLead: "West leads", eastLead: "East leads", draw: "Tied",
      next: "Next artifact battle", lower: "Lower Abyss", middle: "Middle Abyss",
      lowerCaption: "3 lower artifacts", middleCaption: "3 middle artifacts",
      neutral: "Unknown", confirmed: "Confirmed", updated: "Checked {time}",
      noData: "Waiting for the new round", source: "Verified Korean server status is updated about every 5 minutes.",
      favoriteServer: "Favorite {server}", unfavoriteServer: "Remove {server} from favorites",
      copied: "Image copied to the clipboard.", downloaded: "Image downloaded.",
      snapshotFailed: "Could not create the image.", koreaOnly: "Korean servers only",
    },
    "zh-TW": {
      description: "一次查看韓國伺服器全部 21 組對戰的神器佔領狀態。",
      overviewTitle: "全部 21 組伺服器對戰", overviewCaption: "點選星號後，該伺服器的對戰會固定顯示在最上方。",
      roundLabel: "佔領戰場次", currentRound: "目前狀態", historyOption: "{date} 佔領戰",
      historyTitle: "{date} 佔領結果", historyCaption: "此場次結束時的深淵下層與中層佔領結果。",
      historyRecord: "佔領戰最終記錄", historySource: "已結束的神器佔領戰會依場次保存。",
      matchLabel: "目前伺服器配對", matchWeek: "兩週配對 · 第 {week} 週", matchRange: "{start} 開始 · {end} 預計更換",
      matchRoundLabel: "兩週佔領戰", matchRounds: "神器佔領戰共 {total} 場", matchSchedule: "每週三、六 22:00",
      matchRemaining: "距離配對更換", matchEnded: "等待新配對", matchReset: "新配對開始時累計分數會重設。",
      currentScore: "目前佔領", roundScore: "本場結果", cumulativeScore: "兩週累計",
      cumulativeCoverage: "已統計 {count}/{total} 場", cumulativePending: "等待資料",
      scoringGuide: "每座神器計 1 分，僅在深淵下層與中層全部確認後納入兩週累計。",
      snapshot: "複製圖片", snapshotWorking: "正在建立圖片", snapshotCopied: "已複製",
      snapshotDownloaded: "檔案已儲存", snapshotFailedShort: "再試一次",
      loading: "正在載入神器佔領狀態",
      errorTitle: "無法載入佔領狀態", error: "請稍後再試。",
      west: "西部陣營", east: "東部陣營", occupied: "目前佔領", waiting: "確認中",
      partial: "部分地點確認中",
      westLead: "西部陣營領先", eastLead: "東部陣營領先", draw: "雙方平手",
      next: "下一場神器佔領戰", lower: "深淵下層", middle: "深淵中層",
      lowerCaption: "下層神器 3 處", middleCaption: "中層神器 3 處",
      neutral: "未確認", confirmed: "已確認", updated: "最近確認 {time}",
      noData: "等待新回合資訊", source: "僅顯示韓國伺服器資料，約每 5 分鐘更新。",
      favoriteServer: "將 {server} 加入最愛", unfavoriteServer: "取消 {server} 的最愛",
      copied: "圖片已複製到剪貼簿。", downloaded: "圖片已下載。",
      snapshotFailed: "無法建立圖片。", koreaOnly: "僅限韓國伺服器",
    },
  };

  const state = {
    active: false,
    bound: false,
    locale: "ko",
    data: null,
    request: null,
    requestController: null,
    pollTimer: 0,
    clockTimer: 0,
    snapshotFeedbackTimer: 0,
    selectedRoundKey: "current",
    favoriteServerIds: readFavoriteServerIds(),
    presentations: [],
  };
  const elements = {};

  function text(key, replacements = {}) {
    let value = COPY[state.locale]?.[key] || COPY.ko[key] || key;
    for (const [name, replacement] of Object.entries(replacements)) {
      value = value.replace(`{${name}}`, replacement);
    }
    return value;
  }

  function normalizeLocale(locale) {
    return locale === "en" || locale === "zh-TW" ? locale : "ko";
  }

  function cacheUrl() {
    if (localCacheOverride) return localCacheOverride;
    const url = new URL(GITHUB_CACHE_URL);
    url.searchParams.set("v", String(Date.now()));
    return url.toString();
  }

  function bind() {
    if (state.bound) return;
    for (const id of [
      "artifact-description", "artifact-overview-title", "artifact-overview-caption",
      "artifact-round-label", "artifact-round-select",
      "artifact-snapshot-button", "artifact-snapshot-label", "artifact-refresh-button",
      "artifact-retry-button", "artifact-loading-state", "artifact-loading-text",
      "artifact-error-state", "artifact-error-title", "artifact-error-message",
      "artifact-dashboard", "artifact-overview-grid", "artifact-updated-at",
      "artifact-source-note", "artifact-copy-status", "artifact-cycle-label",
      "artifact-cycle-week", "artifact-cycle-range", "artifact-cycle-round-label",
      "artifact-cycle-rounds", "artifact-cycle-schedule", "artifact-cycle-remaining-label",
      "artifact-cycle-countdown", "artifact-cycle-reset", "artifact-score-guide",
    ]) {
      elements[id] = document.getElementById(id);
    }
    elements["artifact-refresh-button"].addEventListener("click", () => void refresh());
    elements["artifact-retry-button"].addEventListener("click", () => void refresh());
    elements["artifact-snapshot-button"].addEventListener("click", () => void copySnapshot());
    elements["artifact-round-select"].addEventListener("change", event => {
      state.selectedRoundKey = event.target.value || "current";
      render();
    });
    elements["artifact-overview-grid"].addEventListener("click", event => {
      const button = event.target instanceof Element
        ? event.target.closest("[data-artifact-favorite-server]")
        : null;
      if (!button) return;
      toggleFavoriteServer(Number(button.dataset.artifactFavoriteServer));
    });
    window.addEventListener("storage", event => {
      if (event.key !== FAVORITE_STORAGE_KEY) return;
      state.favoriteServerIds = readFavoriteServerIds();
      if (state.active) render();
    });
    state.bound = true;
  }

  function setStaticCopy() {
    elements["artifact-description"].textContent = text("description");
    elements["artifact-overview-title"].textContent = text("overviewTitle");
    elements["artifact-overview-caption"].textContent = text("overviewCaption");
    elements["artifact-round-label"].textContent = text("roundLabel");
    if (!state.data && elements["artifact-round-select"].options.length > 0) {
      elements["artifact-round-select"].options[0].textContent = text("currentRound");
    }
    elements["artifact-snapshot-label"].textContent = text("snapshot");
    elements["artifact-loading-text"].textContent = text("loading");
    elements["artifact-error-title"].textContent = text("errorTitle");
    elements["artifact-source-note"].textContent = text("source");
    elements["artifact-cycle-label"].textContent = text("matchLabel");
    elements["artifact-cycle-round-label"].textContent = text("matchRoundLabel");
    elements["artifact-cycle-remaining-label"].textContent = text("matchRemaining");
    elements["artifact-cycle-reset"].textContent = text("matchReset");
    elements["artifact-score-guide"].textContent = text("scoringGuide");
  }

  async function refresh() {
    if (!state.active || state.request) return state.request;
    showLoading(!state.data);
    const controller = new AbortController();
    state.requestController = controller;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    state.request = (async () => {
      try {
        const response = await fetch(cacheUrl(), {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const payload = await response.json();
        if (!isValidPayload(payload)) throw new Error("invalid");
        state.data = { ...payload, history: normalizeHistory(payload.history) };
        if (state.active) render();
      } catch (error) {
        if (error?.name !== "AbortError" && state.active && !state.data) showError();
      } finally {
        window.clearTimeout(timeout);
        if (state.requestController === controller) state.requestController = null;
        state.request = null;
      }
    })();
    return state.request;
  }

  function isValidPayload(payload) {
    if (!(payload && payload.schema === EXPECTED_SCHEMA && payload.version === 1 &&
      payload.pairingRevision === EXPECTED_REVISION && payload.region === "KR" &&
      Array.isArray(payload.pairs) && payload.pairs.length === PAIRS.length)) return false;
    if (new Set(payload.pairs.map(pair => pair?.pairId)).size !== PAIRS.length) return false;
    return payload.pairs.every(pair => {
        const expected = PAIRS.find(item => item.pairId === pair?.pairId);
        return expected && pair.group === ((pair.pairId - 1) % 3) + 1 &&
          pair.west?.serverId === expected.west.serverId && pair.west?.name === expected.west.name &&
          pair.east?.serverId === expected.east.serverId && pair.east?.name === expected.east.name &&
          Number.isSafeInteger(pair.nextBattleAt) && pair.nextBattleAt > 0 &&
          Array.isArray(pair.layers) && pair.layers.length === 2;
      });
  }

  function normalizeHistory(history) {
    if (!Array.isArray(history)) return [];
    const seen = new Set();
    return history
      .filter(item => {
        const pair = PAIRS.find(expected => expected.pairId === Number(item?.pairId));
        const battleAt = Number(item?.battleAt);
        if (!pair || !Number.isSafeInteger(battleAt) || battleAt <= 0 ||
          !Array.isArray(item.layers) || item.layers.length !== 2) return false;
        const layers = item.layers.map(layer => Number(layer?.layer)).sort();
        if (layers[0] !== 1 || layers[1] !== 2 || !item.layers.every(isValidHistoryLayer)) return false;
        const key = `${pair.pairId}:${battleAt}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((left, right) => Number(right.battleAt) - Number(left.battleAt));
  }

  function isValidHistoryLayer(layer) {
    if (!(layer && (Number(layer.layer) === 1 || Number(layer.layer) === 2) &&
      (layer.state === "confirmed" || layer.state === "waiting") && Array.isArray(layer.entries))) return false;
    if (layer.state === "waiting") return layer.entries.length === 0;
    const expectedIds = new Set(ARTIFACTS[Number(layer.layer)].map(([artifactId]) => artifactId));
    return layer.entries.length === 3 && layer.entries.every(entry =>
      expectedIds.delete(Number(entry?.artifactId)) && [0, 1, 2].includes(Number(entry?.ownerSide)));
  }

  function koreaDateKey(timestamp) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(timestamp)).filter(part => part.type !== "literal")
      .map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function availableRoundKeys() {
    return [...new Set((state.data?.history || []).map(item => koreaDateKey(Number(item.battleAt))))]
      .sort((left, right) => right.localeCompare(left));
  }

  function populateRoundSelect() {
    const select = elements["artifact-round-select"];
    const roundKeys = availableRoundKeys();
    if (state.selectedRoundKey !== "current" && !roundKeys.includes(state.selectedRoundKey)) {
      state.selectedRoundKey = "current";
    }
    const options = [new Option(text("currentRound"), "current")];
    for (const roundKey of roundKeys) {
      options.push(new Option(text("historyOption", { date: formatRoundDate(roundKey) }), roundKey));
    }
    select.replaceChildren(...options);
    select.value = state.selectedRoundKey;
    select.disabled = roundKeys.length === 0;
  }

  function payloadPair(pairId) {
    return state.data?.pairs?.find(pair => Number(pair.pairId) === Number(pairId)) ||
      PAIRS.find(pair => pair.pairId === Number(pairId));
  }

  function normalizedLayer(pair, layerNumber, historical = false) {
    const source = pair?.layers?.find(item => Number(item.layer) === layerNumber);
    const byId = new Map(Array.isArray(source?.entries)
      ? source.entries.map(entry => [Number(entry.artifactId), Number(entry.ownerSide)])
      : []);
    const confirmed = (historical || Number(pair?.nextBattleAt) > Date.now()) && source?.state === "confirmed";
    return {
      layer: layerNumber,
      confirmed,
      observedAt: confirmed ? Number(source.observedAt) || 0 : 0,
      entries: ARTIFACTS[layerNumber].map(([artifactId, name]) => ({
        artifactId,
        name,
        ownerSide: confirmed && (byId.get(artifactId) === 1 || byId.get(artifactId) === 2)
          ? byId.get(artifactId) : 0,
      })),
    };
  }

  function render() {
    if (!state.active || !state.bound) return;
    setStaticCopy();
    renderCycleSummary();
    if (!state.data) {
      showLoading(true);
      updateCountdown();
      return;
    }
    populateRoundSelect();
    const historical = state.selectedRoundKey !== "current";
    const presentations = sortPresentationsByFavorites(PAIRS.map(pair => historical
      ? buildPairPresentation(historyPair(pair, state.selectedRoundKey), true)
      : buildPairPresentation(payloadPair(pair.pairId), false)));
    state.presentations = presentations;
    if (historical) {
      const date = formatRoundDate(state.selectedRoundKey);
      elements["artifact-overview-title"].textContent = text("historyTitle", { date });
      elements["artifact-overview-caption"].textContent = text("historyCaption");
      elements["artifact-source-note"].textContent = text("historySource");
    }
    elements["artifact-overview-grid"].replaceChildren(...presentations.map(renderPairCard));
    const observedAt = Math.max(0, ...presentations.flatMap(item => item.layers.map(layer => layer.observedAt)));
    elements["artifact-updated-at"].textContent = observedAt > 0
      ? text("updated", { time: formatObservedAt(observedAt) }) : text("noData");
    elements["artifact-loading-state"].hidden = true;
    elements["artifact-error-state"].hidden = true;
    elements["artifact-dashboard"].hidden = false;
    updateCountdown();
  }

  function historyPair(pair, roundKey) {
    const record = (state.data?.history || []).find(item =>
      Number(item.pairId) === pair.pairId && koreaDateKey(Number(item.battleAt)) === roundKey);
    return {
      ...pair,
      group: ((pair.pairId - 1) % 3) + 1,
      nextBattleAt: Number(record?.battleAt) || roundTimestampForPair(roundKey, pair.pairId),
      archivedAt: Number(record?.archivedAt) || 0,
      updatedAt: Number(record?.updatedAt) || 0,
      layers: record?.layers || [],
    };
  }

  function roundTimestampForPair(roundKey, pairId) {
    const minute = String(((Number(pairId) - 1) % 3) * 5).padStart(2, "0");
    const timestamp = Date.parse(`${roundKey}T13:${minute}:00Z`);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function matchingPeriod(now = Date.now()) {
    const revisionDate = EXPECTED_REVISION.replace(/^kr-/, "");
    const startAt = Date.parse(`${revisionDate}T00:00:00+09:00`);
    const endAt = startAt + MATCH_DURATION_DAYS * DAY_MS;
    const elapsedWeeks = Math.floor(Math.max(0, now - startAt) / (7 * DAY_MS));
    let totalRounds = 0;
    for (let day = 0; day < MATCH_DURATION_DAYS; day += 1) {
      const koreaDate = new Date(startAt + day * DAY_MS + KOREA_OFFSET_MS);
      if (MATCH_BATTLE_WEEKDAYS.has(koreaDate.getUTCDay())) totalRounds += 1;
    }
    return {
      startAt,
      endAt,
      week: Math.min(2, Math.max(1, elapsedWeeks + 1)),
      totalRounds,
    };
  }

  function renderCycleSummary() {
    const period = matchingPeriod();
    elements["artifact-cycle-week"].textContent = text("matchWeek", { week: period.week });
    elements["artifact-cycle-range"].textContent = text("matchRange", {
      start: formatCycleDate(period.startAt),
      end: formatCycleDate(period.endAt),
    });
    elements["artifact-cycle-rounds"].textContent = text("matchRounds", { total: period.totalRounds });
    elements["artifact-cycle-schedule"].textContent = text("matchSchedule");
    updateCycleCountdown(period);
  }

  function previousBattleAt(nextBattleAt) {
    if (!Number.isSafeInteger(nextBattleAt) || nextBattleAt <= 0) return 0;
    const koreaDate = new Date(nextBattleAt + KOREA_OFFSET_MS);
    const weekday = koreaDate.getUTCDay();
    if (weekday === 3) return nextBattleAt - 4 * DAY_MS;
    if (weekday === 6) return nextBattleAt - 3 * DAY_MS;
    return 0;
  }

  function completeRoundScore(layers) {
    if (!Array.isArray(layers) || layers.length !== 2) return null;
    const ordered = [...layers].sort((left, right) => Number(left?.layer) - Number(right?.layer));
    if (Number(ordered[0]?.layer) !== 1 || Number(ordered[1]?.layer) !== 2 ||
      ordered.some(layer => layer?.state !== "confirmed" || !isValidHistoryLayer(layer))) return null;
    const entries = ordered.flatMap(layer => layer.entries);
    return {
      west: entries.filter(entry => Number(entry.ownerSide) === 1).length,
      east: entries.filter(entry => Number(entry.ownerSide) === 2).length,
    };
  }

  function buildCumulativeScore(pairId, cutoffAt = Number.POSITIVE_INFINITY) {
    const period = matchingPeriod();
    const rounds = new Map();
    for (const record of state.data?.history || []) {
      const battleAt = Number(record?.battleAt);
      if (Number(record?.pairId) !== Number(pairId) || battleAt < period.startAt ||
        battleAt >= period.endAt || battleAt > cutoffAt) continue;
      const score = completeRoundScore(record.layers);
      if (score) rounds.set(battleAt, score);
    }

    const currentPair = state.data?.pairs?.find(pair => Number(pair?.pairId) === Number(pairId));
    const currentBattleAt = previousBattleAt(Number(currentPair?.nextBattleAt));
    const currentScore = completeRoundScore(currentPair?.layers);
    if (currentScore && currentBattleAt >= period.startAt && currentBattleAt < period.endAt &&
      currentBattleAt <= cutoffAt && !rounds.has(currentBattleAt)) {
      rounds.set(currentBattleAt, currentScore);
    }

    return {
      west: [...rounds.values()].reduce((sum, score) => sum + score.west, 0),
      east: [...rounds.values()].reduce((sum, score) => sum + score.east, 0),
      count: rounds.size,
      total: period.totalRounds,
    };
  }

  function buildPairPresentation(pair, historical = false) {
    const layers = [normalizedLayer(pair, 1, historical), normalizedLayer(pair, 2, historical)];
    const entries = layers.flatMap(layer => layer.entries);
    const confirmedLayers = layers.filter(layer => layer.confirmed).length;
    const west = entries.filter(entry => entry.ownerSide === 1).length;
    const east = entries.filter(entry => entry.ownerSide === 2).length;
    const lead = confirmedLayers === 0 ? text("waiting")
      : confirmedLayers < layers.length ? text("partial")
      : west > east ? text("westLead") : east > west ? text("eastLead") : text("draw");
    const cumulative = buildCumulativeScore(
      pair?.pairId,
      historical ? Number(pair?.nextBattleAt) || 0 : Number.POSITIVE_INFINITY);
    return {
      pair,
      layers,
      west,
      east,
      confirmedLayers,
      lead,
      cumulative,
      historical,
      favoriteCount: favoriteCount(pair),
    };
  }

  function readFavoriteServerIds() {
    try {
      const validIds = new Set(PAIRS.flatMap(pair => [pair.west.serverId, pair.east.serverId]));
      const stored = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) || "[]");
      return new Set(Array.isArray(stored)
        ? stored.map(Number).filter(serverId => validIds.has(serverId))
        : []);
    } catch {
      return new Set();
    }
  }

  function saveFavoriteServerIds() {
    try {
      localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify([...state.favoriteServerIds]));
    } catch {
    }
  }

  function favoriteCount(pair) {
    return [pair?.west?.serverId, pair?.east?.serverId]
      .filter(serverId => state.favoriteServerIds.has(Number(serverId))).length;
  }

  function sortPresentationsByFavorites(presentations) {
    return [...presentations].sort((left, right) =>
      right.favoriteCount - left.favoriteCount ||
      Number(left.pair?.pairId) - Number(right.pair?.pairId));
  }

  function toggleFavoriteServer(serverId) {
    if (!PAIRS.some(pair => pair.west.serverId === serverId || pair.east.serverId === serverId)) return;
    if (state.favoriteServerIds.has(serverId)) {
      state.favoriteServerIds.delete(serverId);
    } else {
      state.favoriteServerIds.add(serverId);
    }
    saveFavoriteServerIds();
    render();
  }

  function favoriteButton(server) {
    const active = state.favoriteServerIds.has(Number(server.serverId));
    const label = text(active ? "unfavoriteServer" : "favoriteServer", { server: server.name });
    return `<button class="artifact-favorite-button${active ? " is-active" : ""}" type="button" ` +
      `data-artifact-favorite-server="${Number(server.serverId)}" aria-pressed="${active}" ` +
      `aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><span aria-hidden="true">★</span></button>`;
  }

  function renderPairCard(presentation) {
    const { pair, layers, west, east, lead, cumulative, historical, favoriteCount } = presentation;
    const card = document.createElement("article");
    const leadSide = west > east ? "west" : east > west ? "east" : "neutral";
    card.className = `artifact-overview-card ${leadSide}${favoriteCount > 0 ? " is-favorite" : ""}`;
    card.dataset.pairId = String(pair.pairId);
    const battleAt = historical ? Number(pair.nextBattleAt) : effectiveNextBattleAt(pair);
    const battleTime = battleAt ? formatBattleTime(battleAt) : text("koreaOnly");
    card.innerHTML = `
      <header class="artifact-overview-card-head">
        <span>${escapeHtml(String(pair.pairId).padStart(2, "0"))} · ${escapeHtml(battleTime)}</span>
        <strong class="artifact-overview-lead ${leadSide}">${escapeHtml(lead)}</strong>
      </header>
      <div class="artifact-overview-versus">
        <div class="artifact-overview-server west">
          ${favoriteButton(pair.west)}
          <strong title="${escapeHtml(pair.west.name)}">${escapeHtml(pair.west.name)}</strong>
        </div>
        <span class="artifact-overview-score-block">
          <small>${escapeHtml(historical ? text("roundScore") : text("currentScore"))}</small>
          <span class="artifact-overview-score"><b class="west">${west}</b><i>:</i><b class="east">${east}</b></span>
        </span>
        <div class="artifact-overview-server east">
          <strong title="${escapeHtml(pair.east.name)}">${escapeHtml(pair.east.name)}</strong>
          ${favoriteButton(pair.east)}
        </div>
      </div>
      <div class="artifact-overview-cumulative">
        <span><b>${escapeHtml(text("cumulativeScore"))}</b><small>${escapeHtml(cumulative.count > 0
          ? text("cumulativeCoverage", { count: cumulative.count, total: cumulative.total })
          : text("cumulativePending"))}</small></span>
        <strong>${cumulative.count > 0
          ? `<b class="west">${cumulative.west}</b><i>:</i><b class="east">${cumulative.east}</b>`
          : "<b>—</b><i>:</i><b>—</b>"}</strong>
      </div>
      <div class="artifact-overview-layers"></div>
      <footer class="artifact-overview-next">
        <span>${escapeHtml(historical ? text("historyRecord") : text("next"))}</span>
        <strong${historical ? "" : ` data-artifact-countdown="${pair.pairId}"`}>${battleAt ? escapeHtml(historical ? formatHistoryMoment(battleAt) : formatCountdown(Math.max(0, battleAt - Date.now()))) : "—"}</strong>
      </footer>`;
    card.querySelector(".artifact-overview-layers")
      .replaceChildren(...layers.map(renderCompactLayer));
    return card;
  }

  function renderCompactLayer(layer) {
    const section = document.createElement("section");
    const west = layer.entries.filter(entry => entry.ownerSide === 1).length;
    const east = layer.entries.filter(entry => entry.ownerSide === 2).length;
    const title = layer.layer === 1 ? text("lower") : text("middle");
    section.className = "artifact-overview-layer";
    section.innerHTML = `
      <header>
        <strong>${escapeHtml(title)}</strong>
        <span><b class="west">${west}</b> : <b class="east">${east}</b></span>
      </header>
      <div class="artifact-overview-artifacts"></div>`;
    const list = section.querySelector(".artifact-overview-artifacts");
    list.replaceChildren(...layer.entries.map(entry => {
      const side = entry.ownerSide === 1 ? "west" : entry.ownerSide === 2 ? "east" : "neutral";
      const item = document.createElement("span");
      item.className = `artifact-overview-artifact ${side}`;
      item.title = entry.name;
      item.innerHTML = `
        <img src="${artifactIconUrl(entry.ownerSide)}" alt="">
        <span><b>${escapeHtml(shortArtifactName(entry.name))}</b><small>${escapeHtml(layer.confirmed ? ownerName(entry.ownerSide) : text("waiting"))}</small></span>`;
      return item;
    }));
    return section;
  }

  function shortArtifactName(name) {
    return String(name).replace(/\s*아티팩트$/u, "");
  }

  function ownerName(side) {
    return side === 1 ? text("west") : side === 2 ? text("east") : text("neutral");
  }

  function artifactIconKey(side) {
    return side === 1 ? "west" : side === 2 ? "east" : "neutral";
  }

  function artifactIconUrl(side) {
    return ICON_URLS[artifactIconKey(side)];
  }

  function showLoading(visible) {
    elements["artifact-loading-state"].hidden = !visible;
    elements["artifact-error-state"].hidden = true;
    elements["artifact-dashboard"].hidden = visible;
  }

  function showError() {
    elements["artifact-loading-state"].hidden = true;
    elements["artifact-dashboard"].hidden = true;
    elements["artifact-error-message"].textContent = text("error");
    elements["artifact-error-state"].hidden = false;
  }

  function updateCountdown() {
    if (!state.active || !state.bound) return;
    updateCycleCountdown();
    if (state.selectedRoundKey !== "current") return;
    document.querySelectorAll("[data-artifact-countdown]").forEach(element => {
      const pair = payloadPair(Number(element.dataset.artifactCountdown));
      const nextBattleAt = effectiveNextBattleAt(pair);
      element.textContent = nextBattleAt
        ? formatCountdown(Math.max(0, nextBattleAt - Date.now())) : "—";
    });
  }

  function updateCycleCountdown(period = matchingPeriod()) {
    const remaining = period.endAt - Date.now();
    elements["artifact-cycle-countdown"].textContent = remaining > 0
      ? formatCountdown(remaining)
      : text("matchEnded");
  }

  function effectiveNextBattleAt(pair) {
    const published = Number(pair?.nextBattleAt) || 0;
    if (published > Date.now()) return published;
    const pairId = Number(pair?.pairId) || 1;
    const groupMinute = ((pairId - 1) % 3) * 5;
    const now = Date.now();
    const korea = new Date(now + 9 * 60 * 60_000);
    for (let days = 0; days <= 7; days += 1) {
      const date = new Date(Date.UTC(
        korea.getUTCFullYear(), korea.getUTCMonth(), korea.getUTCDate() + days,
        0, 0, 0, 0));
      if (date.getUTCDay() !== 3 && date.getUTCDay() !== 6) continue;
      const candidate = Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 13, groupMinute, 0, 0);
      if (candidate > now) return candidate;
    }
    return 0;
  }

  function formatBattleTime(timestamp) {
    return new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(timestamp));
  }

  function formatRoundDate(roundKey) {
    const timestamp = Date.parse(`${roundKey}T03:00:00Z`);
    return new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", year: "numeric", month: "short", day: "numeric",
    }).format(new Date(timestamp));
  }

  function formatCycleDate(timestamp) {
    return new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", month: "short", day: "numeric",
    }).format(new Date(timestamp));
  }

  function formatHistoryMoment(timestamp) {
    return new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(timestamp));
  }

  function formatCountdown(milliseconds) {
    const total = Math.floor(milliseconds / 1000);
    const days = Math.floor(total / 86_400);
    const hours = Math.floor((total % 86_400) / 3_600);
    const minutes = Math.floor((total % 3_600) / 60);
    const seconds = total % 60;
    const clock = [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");
    return days > 0 ? `${days}일 ${clock}` : clock;
  }

  function formatObservedAt(seconds) {
    return new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(seconds * 1000));
  }

  async function copySnapshot() {
    if (!state.data) return;
    const status = elements["artifact-copy-status"];
    status.textContent = "";
    status.removeAttribute("data-state");
    setSnapshotButtonState("working");
    try {
      const canvas = await createSnapshotCanvas();
      const blob = await new Promise((resolve, reject) => canvas.toBlob(
        value => value ? resolve(value) : reject(new Error("blob")), "image/png"));
      if (navigator.clipboard?.write && globalThis.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          showSnapshotResult("copied", "copied");
        } catch {
          downloadBlob(blob);
          showSnapshotResult("downloaded", "downloaded");
        }
      } else {
        downloadBlob(blob);
        showSnapshotResult("downloaded", "downloaded");
      }
    } catch {
      showSnapshotResult("failed", "snapshotFailed");
    }
  }

  function showSnapshotResult(buttonState, messageKey) {
    const status = elements["artifact-copy-status"];
    status.textContent = text(messageKey);
    status.dataset.state = buttonState;
    setSnapshotButtonState(buttonState);
  }

  function setSnapshotButtonState(buttonState) {
    const button = elements["artifact-snapshot-button"];
    const label = elements["artifact-snapshot-label"];
    const icon = button?.querySelector("[data-artifact-snapshot-icon]");
    if (!button || !label) return;

    window.clearTimeout(state.snapshotFeedbackTimer);
    button.classList.remove("is-working", "is-copied", "is-downloaded", "is-failed");
    button.disabled = buttonState === "working";
    button.setAttribute("aria-busy", buttonState === "working" ? "true" : "false");
    if (buttonState === "working") {
      button.classList.add("is-working");
      label.textContent = text("snapshotWorking");
      if (icon) icon.textContent = "◌";
      return;
    }

    const presentation = {
      copied: ["is-copied", "snapshotCopied", "✓"],
      downloaded: ["is-downloaded", "snapshotDownloaded", "↓"],
      failed: ["is-failed", "snapshotFailedShort", "!"],
    }[buttonState];
    if (presentation) {
      button.classList.add(presentation[0]);
      label.textContent = text(presentation[1]);
      if (icon) icon.textContent = presentation[2];
    }

    state.snapshotFeedbackTimer = window.setTimeout(() => {
      button.classList.remove("is-copied", "is-downloaded", "is-failed");
      button.disabled = false;
      button.setAttribute("aria-busy", "false");
      label.textContent = text("snapshot");
      if (icon) icon.textContent = "▣";
      const status = elements["artifact-copy-status"];
      if (status) {
        status.textContent = "";
        status.removeAttribute("data-state");
      }
    }, 3_200);
  }

  async function createSnapshotCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 3500;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0d2330"); gradient.addColorStop(0.52, "#06121c"); gradient.addColorStop(1, "#180d20");
    context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(36,219,229,.12)"; context.beginPath(); context.arc(115, 220, 320, 0, Math.PI * 2); context.fill();
    context.fillStyle = "rgba(214,76,235,.11)"; context.beginPath(); context.arc(2280, 250, 430, 0, Math.PI * 2); context.fill();
    const [neutralIcon, westIcon, eastIcon] = await Promise.all([
      loadImage(ICON_URLS.neutral),
      loadImage(ICON_URLS.west),
      loadImage(ICON_URLS.east),
    ]);
    const icons = { neutral: neutralIcon, west: westIcon, east: eastIcon };
    context.drawImage(icons.neutral, 64, 45, 86, 86);
    context.fillStyle = "#f3f9fb"; context.font = "900 48px Pretendard, sans-serif"; context.fillText("아티팩트 현황", 176, 88);
    const historical = state.selectedRoundKey !== "current";
    const snapshotRound = historical ? `${formatRoundDate(state.selectedRoundKey)} 점령 결과` : "한국 서버 전체 21개 대진";
    context.fillStyle = "#7e9dad"; context.font = "700 22px Pretendard, sans-serif"; context.fillText(`NotMeter · ${snapshotRound}`, 178, 124);
    const period = matchingPeriod();
    context.fillStyle = "#9eeff4"; context.font = "850 19px Pretendard, sans-serif";
    context.fillText(text("matchWeek", { week: period.week }), 64, 169);
    context.fillStyle = "#7896a5"; context.font = "750 17px Pretendard, sans-serif";
    context.fillText(text("matchRange", {
      start: formatCycleDate(period.startAt), end: formatCycleDate(period.endAt),
    }), 290, 169);
    context.textAlign = "right"; context.fillStyle = "#fff0ad"; context.font = "850 18px Pretendard, sans-serif";
    context.fillText(`${text("matchRounds", { total: period.totalRounds })} · ${text("matchSchedule")}`, 2336, 169);
    const presentations = state.presentations.length === PAIRS.length
      ? state.presentations
      : sortPresentationsByFavorites(PAIRS.map(pair =>
          buildPairPresentation(payloadPair(pair.pairId), false)));
    presentations.forEach((presentation, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      drawSnapshotPair(context, presentation, 60 + column * 770, 205 + row * 448, icons);
    });
    context.textAlign = "left"; context.fillStyle = "#7994a3"; context.font = "650 18px Pretendard, sans-serif";
    context.fillText(text("source"), 64, 3452);
    context.textAlign = "right"; context.fillStyle = "#c7d8de"; context.font = "850 19px Pretendard, sans-serif";
    context.fillText(new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date()), 2336, 3452);
    return canvas;
  }

  function drawSnapshotPair(context, presentation, x, y, icons) {
    const { pair, layers, west, east, lead, cumulative, historical, favoriteCount } = presentation;
    roundedRect(context, x, y, 740, 428, 20, "rgba(7,22,32,.94)", favoriteCount > 0 ? "#b89b4b" : "#294554");
    context.textAlign = "left"; context.fillStyle = "#7896a6"; context.font = "800 17px Pretendard, sans-serif";
    const battleAt = historical ? Number(pair.nextBattleAt) : effectiveNextBattleAt(pair);
    context.fillText(`${favoriteCount > 0 ? "★ " : ""}${String(pair.pairId).padStart(2, "0")} · ${battleAt ? formatBattleTime(battleAt) : "—"}`, x + 22, y + 31);
    context.textAlign = "right"; context.fillStyle = west > east ? "#74e9f4" : east > west ? "#e995f8" : "#a8bbc4";
    context.font = "900 17px Pretendard, sans-serif"; context.fillText(lead, x + 718, y + 31);
    context.textAlign = "left"; context.fillStyle = "#7fe9f6"; context.font = "900 28px Pretendard, sans-serif";
    context.fillText(pair.west.name, x + 22, y + 78, 235);
    context.textAlign = "right"; context.fillStyle = "#ec9bfa"; context.fillText(pair.east.name, x + 718, y + 78, 235);
    context.textAlign = "center"; context.font = "950 32px Pretendard, sans-serif";
    context.fillStyle = "#35d8e9"; context.fillText(String(west), x + 330, y + 79);
    context.fillStyle = "#718a97"; context.fillText(":", x + 370, y + 79);
    context.fillStyle = "#dc72ef"; context.fillText(String(east), x + 410, y + 79);
    context.textAlign = "center"; context.fillStyle = "#708d9a"; context.font = "850 13px Pretendard, sans-serif";
    context.fillText(historical ? text("roundScore") : text("currentScore"), x + 370, y + 99);
    layers.forEach((layer, layerIndex) => {
      const layerY = y + 112 + layerIndex * 112;
      context.textAlign = "left"; context.fillStyle = "#dfecef"; context.font = "900 18px Pretendard, sans-serif";
      context.fillText(layer.layer === 1 ? text("lower") : text("middle"), x + 22, layerY + 19);
      context.textAlign = "right"; context.fillStyle = "#7894a3"; context.font = "800 16px Pretendard, sans-serif";
      context.fillText(layer.confirmed ? text("confirmed") : text("waiting"), x + 718, layerY + 19);
      layer.entries.forEach((entry, entryIndex) => {
        const itemX = x + 20 + entryIndex * 238;
        const itemY = layerY + 31;
        const fill = entry.ownerSide === 1 ? "rgba(29,199,219,.17)" : entry.ownerSide === 2 ? "rgba(197,69,225,.17)" : "rgba(117,143,154,.09)";
        const border = entry.ownerSide === 1 ? "#267e8d" : entry.ownerSide === 2 ? "#7e348c" : "#294452";
        roundedRect(context, itemX, itemY, 224, 72, 11, fill, border);
        context.drawImage(icons[artifactIconKey(entry.ownerSide)], itemX + 10, itemY + 18, 36, 36);
        context.textAlign = "left"; context.fillStyle = "#ecf4f6"; context.font = "850 15px Pretendard, sans-serif";
        context.fillText(shortArtifactName(entry.name), itemX + 54, itemY + 29, 158);
        context.fillStyle = entry.ownerSide === 1 ? "#71e8f3" : entry.ownerSide === 2 ? "#e893f7" : "#98adb6";
        context.font = "900 14px Pretendard, sans-serif";
        context.fillText(layer.confirmed ? ownerName(entry.ownerSide) : text("waiting"), itemX + 54, itemY + 53, 158);
      });
    });
    roundedRect(context, x + 20, y + 340, 700, 42, 9,
      "rgba(18,53,64,.72)", "rgba(72,112,126,.62)");
    context.textAlign = "left"; context.fillStyle = "#dbe9ed"; context.font = "900 16px Pretendard, sans-serif";
    context.fillText(text("cumulativeScore"), x + 34, y + 358);
    context.fillStyle = "#7895a2"; context.font = "750 13px Pretendard, sans-serif";
    context.fillText(cumulative.count > 0
      ? text("cumulativeCoverage", { count: cumulative.count, total: cumulative.total })
      : text("cumulativePending"), x + 34, y + 375);
    context.textAlign = "right"; context.font = "950 24px Pretendard, sans-serif";
    if (cumulative.count > 0) {
      context.fillStyle = "#46dce9"; context.fillText(String(cumulative.west), x + 650, y + 368);
      context.fillStyle = "#6b8591"; context.fillText(":", x + 674, y + 368);
      context.fillStyle = "#dc77ee"; context.fillText(String(cumulative.east), x + 708, y + 368);
    } else {
      context.fillStyle = "#8198a2"; context.fillText("— : —", x + 708, y + 368);
    }
    context.textAlign = "left"; context.fillStyle = "#758f9d"; context.font = "750 15px Pretendard, sans-serif";
    context.fillText(historical ? text("historyRecord") : text("next"), x + 22, y + 411);
    context.textAlign = "right"; context.fillStyle = "#fff0af"; context.font = "900 17px Pretendard, sans-serif";
    context.fillText(battleAt ? (historical ? formatHistoryMoment(battleAt) : formatCountdown(Math.max(0, battleAt - Date.now()))) : "—", x + 718, y + 411);
  }

  function roundedRect(context, x, y, width, height, radius, fill, stroke) {
    context.beginPath();
    context.moveTo(x + radius, y); context.lineTo(x + width - radius, y); context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius); context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height); context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius); context.quadraticCurveTo(x, y, x + radius, y); context.closePath();
    context.fillStyle = fill; context.fill(); context.strokeStyle = stroke; context.lineWidth = 1; context.stroke();
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source;
    });
  }

  function downloadBlob(blob) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = state.selectedRoundKey === "current"
      ? "NotMeter-아티팩트-전체-서버.png"
      : `NotMeter-아티팩트-${state.selectedRoundKey}.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function activate() {
    bind();
    if (state.active) return;
    state.active = true;
    setStaticCopy();
    render();
    void refresh();
    state.pollTimer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, POLL_INTERVAL_MS);
    state.clockTimer = window.setInterval(updateCountdown, 1_000);
  }

  function deactivate() {
    state.active = false;
    window.clearInterval(state.pollTimer); state.pollTimer = 0;
    window.clearInterval(state.clockTimer); state.clockTimer = 0;
    state.requestController?.abort(); state.requestController = null;
  }

  function setLocale(locale) {
    state.locale = normalizeLocale(locale);
    if (state.bound) render();
  }

  window.NotMeterArtifactOccupation = { activate, deactivate, setLocale };
})();
