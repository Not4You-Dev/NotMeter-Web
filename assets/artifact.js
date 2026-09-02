(() => {
  "use strict";

  const localCacheOverride = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? new URLSearchParams(window.location.search).get("artifactApi") : "";
  const GITHUB_CACHE_URL =
    "https://raw.githubusercontent.com/Not4You-Dev/NotMeter-Web/main/presence/notmeter-artifact-occupation-public.json";
  const EXPECTED_SCHEMA = "notmeter-artifact-occupation-public-v1";
  const EXPECTED_REVISION = "kr-2026-08-26";
  const POLL_INTERVAL_MS = 10 * 60_000;
  const REQUEST_TIMEOUT_MS = 8_000;
  const STORAGE_KEY = "notmeter-artifact-pair-id";
  const ICON_URL = "./assets/artifact-neutral.png";
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
      description: "한국 서버 대진별 점령 현황을 한눈에 확인하세요.", pair: "서버 대진",
      snapshot: "이미지 복사", loading: "아티팩트 현황을 불러오는 중입니다",
      errorTitle: "현황을 불러오지 못했습니다", error: "잠시 후 다시 확인해 주세요.",
      west: "서부 진영", east: "동부 진영", occupied: "현재 점령", waiting: "현황 확인 중",
      partial: "일부 현황 확인 중",
      westLead: "서부 진영 우세", eastLead: "동부 진영 우세", draw: "양 진영 동률",
      next: "다음 아티팩트 점령전", lower: "어비스 하층", middle: "어비스 중층",
      lowerCaption: "하층 아티팩트 3곳", middleCaption: "중층 아티팩트 3곳",
      neutral: "미확인", confirmed: "확인됨", updated: "최근 확인 {time}",
      noData: "새 회차 정보 확인 중", source: "한국 서버에서 확인된 현황을 약 10분마다 반영합니다.",
      copied: "이미지를 클립보드에 복사했습니다.", downloaded: "이미지 파일로 저장했습니다.",
      snapshotFailed: "이미지를 만들지 못했습니다.", koreaOnly: "한국 서버 전용",
    },
    en: {
      description: "See the latest artifact control for every Korean server matchup.", pair: "Server matchup",
      snapshot: "Copy image", loading: "Loading artifact status",
      errorTitle: "Artifact status is unavailable", error: "Please try again shortly.",
      west: "West", east: "East", occupied: "Current control", waiting: "Checking status",
      partial: "Some locations pending",
      westLead: "West leads", eastLead: "East leads", draw: "Tied",
      next: "Next artifact battle", lower: "Lower Abyss", middle: "Middle Abyss",
      lowerCaption: "3 lower artifacts", middleCaption: "3 middle artifacts",
      neutral: "Unknown", confirmed: "Confirmed", updated: "Checked {time}",
      noData: "Waiting for the new round", source: "Verified Korean server status is updated about every 10 minutes.",
      copied: "Image copied to the clipboard.", downloaded: "Image downloaded.",
      snapshotFailed: "Could not create the image.", koreaOnly: "Korean servers only",
    },
    "zh-TW": {
      description: "此功能僅顯示韓國伺服器的神器佔領狀態。", pair: "伺服器對戰",
      snapshot: "複製圖片", loading: "正在載入神器佔領狀態",
      errorTitle: "無法載入佔領狀態", error: "請稍後再試。",
      west: "西部陣營", east: "東部陣營", occupied: "目前佔領", waiting: "確認中",
      partial: "部分地點確認中",
      westLead: "西部陣營領先", eastLead: "東部陣營領先", draw: "雙方平手",
      next: "下一場神器佔領戰", lower: "深淵下層", middle: "深淵中層",
      lowerCaption: "下層神器 3 處", middleCaption: "中層神器 3 處",
      neutral: "未確認", confirmed: "已確認", updated: "最近確認 {time}",
      noData: "等待新回合資訊", source: "僅顯示韓國伺服器資料，約每 10 分鐘更新。",
      copied: "圖片已複製到剪貼簿。", downloaded: "圖片已下載。",
      snapshotFailed: "無法建立圖片。", koreaOnly: "僅限韓國伺服器",
    },
  };

  const state = {
    active: false,
    bound: false,
    locale: "ko",
    data: null,
    pairId: Number(localStorage.getItem(STORAGE_KEY)) || 1,
    request: null,
    requestController: null,
    pollTimer: 0,
    clockTimer: 0,
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
      "artifact-description", "artifact-pair-label", "artifact-pair-select",
      "artifact-snapshot-button", "artifact-snapshot-label", "artifact-refresh-button",
      "artifact-retry-button", "artifact-loading-state", "artifact-loading-text",
      "artifact-error-state", "artifact-error-title", "artifact-error-message",
      "artifact-dashboard", "artifact-west-caption", "artifact-east-caption",
      "artifact-west-server", "artifact-east-server", "artifact-round-label",
      "artifact-west-score", "artifact-east-score", "artifact-advantage",
      "artifact-next-label", "artifact-countdown", "artifact-next-time",
      "artifact-layer-grid", "artifact-updated-at", "artifact-source-note", "artifact-copy-status",
    ]) {
      elements[id] = document.getElementById(id);
    }
    elements["artifact-pair-select"].addEventListener("change", event => {
      state.pairId = Number(event.currentTarget.value) || 1;
      localStorage.setItem(STORAGE_KEY, String(state.pairId));
      render();
    });
    elements["artifact-refresh-button"].addEventListener("click", () => void refresh());
    elements["artifact-retry-button"].addEventListener("click", () => void refresh());
    elements["artifact-snapshot-button"].addEventListener("click", () => void copySnapshot());
    populatePairSelect();
    state.bound = true;
  }

  function populatePairSelect() {
    const select = elements["artifact-pair-select"];
    select.replaceChildren(...PAIRS.map(pair => {
      const option = document.createElement("option");
      option.value = String(pair.pairId);
      option.textContent = `${pair.west.name}  VS  ${pair.east.name}`;
      return option;
    }));
    if (!PAIRS.some(pair => pair.pairId === state.pairId)) state.pairId = 1;
    select.value = String(state.pairId);
  }

  function setStaticCopy() {
    elements["artifact-description"].textContent = text("description");
    elements["artifact-pair-label"].textContent = text("pair");
    elements["artifact-snapshot-label"].textContent = text("snapshot");
    elements["artifact-loading-text"].textContent = text("loading");
    elements["artifact-error-title"].textContent = text("errorTitle");
    elements["artifact-west-caption"].textContent = text("west");
    elements["artifact-east-caption"].textContent = text("east");
    elements["artifact-round-label"].textContent = text("occupied");
    elements["artifact-next-label"].textContent = text("next");
    elements["artifact-source-note"].textContent = text("source");
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
        state.data = payload;
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

  function selectedPair() {
    return state.data?.pairs?.find(pair => pair.pairId === state.pairId) ||
      PAIRS.find(pair => pair.pairId === state.pairId) || PAIRS[0];
  }

  function normalizedLayer(pair, layerNumber) {
    const source = pair?.layers?.find(item => Number(item.layer) === layerNumber);
    const byId = new Map(Array.isArray(source?.entries)
      ? source.entries.map(entry => [Number(entry.artifactId), Number(entry.ownerSide)])
      : []);
    const confirmed = Number(pair?.nextBattleAt) > Date.now() && source?.state === "confirmed";
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
    if (!state.data) {
      showLoading(true);
      updateCountdown();
      return;
    }
    const pair = selectedPair();
    const layers = [normalizedLayer(pair, 1), normalizedLayer(pair, 2)];
    const entries = layers.flatMap(layer => layer.entries);
    const confirmedLayers = layers.filter(layer => layer.confirmed).length;
    const west = entries.filter(entry => entry.ownerSide === 1).length;
    const east = entries.filter(entry => entry.ownerSide === 2).length;
    elements["artifact-west-server"].textContent = pair.west.name;
    elements["artifact-east-server"].textContent = pair.east.name;
    elements["artifact-west-score"].textContent = String(west);
    elements["artifact-east-score"].textContent = String(east);
    const advantage = elements["artifact-advantage"];
    advantage.className = `artifact-advantage ${west > east ? "west" : east > west ? "east" : "neutral"}`;
    advantage.textContent = confirmedLayers === 0 ? text("waiting")
      : confirmedLayers < layers.length ? text("partial")
      : west > east ? text("westLead") : east > west ? text("eastLead") : text("draw");
    elements["artifact-layer-grid"].replaceChildren(...layers.map(renderLayer));
    const observedAt = Math.max(...layers.map(layer => layer.observedAt));
    elements["artifact-updated-at"].textContent = observedAt > 0
      ? text("updated", { time: formatObservedAt(observedAt) }) : text("noData");
    elements["artifact-loading-state"].hidden = true;
    elements["artifact-error-state"].hidden = true;
    elements["artifact-dashboard"].hidden = false;
    updateCountdown();
  }

  function renderLayer(layer) {
    const card = document.createElement("article");
    card.className = "artifact-layer-card";
    const west = layer.entries.filter(entry => entry.ownerSide === 1).length;
    const east = layer.entries.filter(entry => entry.ownerSide === 2).length;
    const title = layer.layer === 1 ? text("lower") : text("middle");
    const caption = layer.layer === 1 ? text("lowerCaption") : text("middleCaption");
    card.innerHTML = `
      <header class="artifact-layer-heading">
        <div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(caption)}</span></div>
        <span class="artifact-layer-score"><b class="west">${west}</b> : <b class="east">${east}</b></span>
      </header>
      <div class="artifact-list"></div>`;
    const list = card.querySelector(".artifact-list");
    list.replaceChildren(...layer.entries.map(entry => {
      const side = entry.ownerSide === 1 ? "west" : entry.ownerSide === 2 ? "east" : "neutral";
      const row = document.createElement("div");
      row.className = `artifact-row ${side}`;
      row.innerHTML = `
        <span class="artifact-row-icon"><img src="${ICON_URL}" alt=""></span>
        <span class="artifact-row-copy"><strong>${escapeHtml(entry.name)}</strong><small>${layer.confirmed ? escapeHtml(text("confirmed")) : escapeHtml(text("waiting"))}</small></span>
        <span class="artifact-owner ${side}">${escapeHtml(ownerName(entry.ownerSide))}</span>`;
      return row;
    }));
    return card;
  }

  function ownerName(side) {
    return side === 1 ? text("west") : side === 2 ? text("east") : text("neutral");
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
    const pair = selectedPair();
    const nextBattleAt = effectiveNextBattleAt(pair);
    if (!nextBattleAt) {
      elements["artifact-countdown"].textContent = "—";
      elements["artifact-next-time"].textContent = text("koreaOnly");
      return;
    }
    const remaining = Math.max(0, nextBattleAt - Date.now());
    elements["artifact-countdown"].textContent = formatCountdown(remaining);
    elements["artifact-next-time"].textContent = new Intl.DateTimeFormat(state.locale, {
      timeZone: "Asia/Seoul", month: "short", day: "numeric", weekday: "short",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(nextBattleAt));
  }

  function effectiveNextBattleAt(pair) {
    const published = Number(pair?.nextBattleAt) || 0;
    if (published > Date.now()) return published;
    const pairId = Number(pair?.pairId) || state.pairId;
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
    try {
      const canvas = await createSnapshotCanvas();
      const blob = await new Promise((resolve, reject) => canvas.toBlob(
        value => value ? resolve(value) : reject(new Error("blob")), "image/png"));
      if (navigator.clipboard?.write && globalThis.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        status.textContent = text("copied");
      } else {
        downloadBlob(blob);
        status.textContent = text("downloaded");
      }
    } catch {
      try {
        const canvas = await createSnapshotCanvas();
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("blob");
        downloadBlob(blob);
        status.textContent = text("downloaded");
      } catch {
        status.textContent = text("snapshotFailed");
      }
    }
    window.setTimeout(() => { if (status) status.textContent = ""; }, 4_000);
  }

  async function createSnapshotCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    const pair = selectedPair();
    const layers = [normalizedLayer(pair, 1), normalizedLayer(pair, 2)];
    const entries = layers.flatMap(layer => layer.entries);
    const west = entries.filter(entry => entry.ownerSide === 1).length;
    const east = entries.filter(entry => entry.ownerSide === 2).length;
    const gradient = context.createLinearGradient(0, 0, 1400, 900);
    gradient.addColorStop(0, "#0d2330"); gradient.addColorStop(0.52, "#06121c"); gradient.addColorStop(1, "#180d20");
    context.fillStyle = gradient; context.fillRect(0, 0, 1400, 900);
    context.fillStyle = "rgba(36,219,229,.12)"; context.beginPath(); context.arc(115, 220, 320, 0, Math.PI * 2); context.fill();
    context.fillStyle = "rgba(214,76,235,.11)"; context.beginPath(); context.arc(1320, 230, 330, 0, Math.PI * 2); context.fill();
    const icon = await loadImage(ICON_URL);
    context.drawImage(icon, 64, 52, 72, 72);
    context.fillStyle = "#f3f9fb"; context.font = "900 42px Pretendard, sans-serif"; context.fillText("아티팩트 현황", 158, 91);
    context.fillStyle = "#7e9dad"; context.font = "700 19px Pretendard, sans-serif"; context.fillText("NotMeter · 한국 서버", 160, 122);
    context.textAlign = "center";
    context.fillStyle = "#7fe9f6"; context.font = "900 35px Pretendard, sans-serif"; context.fillText(pair.west.name, 365, 210);
    context.fillStyle = "#ec9bfa"; context.fillText(pair.east.name, 1035, 210);
    context.fillStyle = "#35d8e9"; context.font = "950 66px Pretendard, sans-serif"; context.fillText(String(west), 585, 218);
    context.fillStyle = "#698594"; context.fillText(":", 700, 218);
    context.fillStyle = "#dc72ef"; context.fillText(String(east), 815, 218);
    context.fillStyle = "#fff0af"; context.font = "850 24px Pretendard, sans-serif";
    context.fillText(`${text("next")} · ${formatCountdown(Math.max(0, effectiveNextBattleAt(pair) - Date.now()))}`, 700, 282);
    layers.forEach((layer, index) => drawSnapshotLayer(context, layer, index === 0 ? 60 : 720, 340, icon));
    context.textAlign = "left"; context.fillStyle = "#7994a3"; context.font = "650 17px Pretendard, sans-serif";
    context.fillText(text("source"), 64, 858);
    context.textAlign = "right"; context.fillStyle = "#c7d8de"; context.font = "850 18px Pretendard, sans-serif";
    context.fillText(new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date()), 1336, 858);
    return canvas;
  }

  function drawSnapshotLayer(context, layer, x, y, icon) {
    roundedRect(context, x, y, 620, 440, 22, "rgba(7,22,32,.92)", "#274353");
    context.textAlign = "left"; context.fillStyle = "#f1f7f9"; context.font = "900 29px Pretendard, sans-serif";
    context.fillText(layer.layer === 1 ? text("lower") : text("middle"), x + 28, y + 55);
    context.fillStyle = "#7896a6"; context.font = "700 17px Pretendard, sans-serif";
    context.fillText(layer.confirmed ? text("confirmed") : text("waiting"), x + 28, y + 83);
    layer.entries.forEach((entry, index) => {
      const rowY = y + 110 + index * 101;
      const sideColor = entry.ownerSide === 1 ? "rgba(29,199,219,.18)" : entry.ownerSide === 2 ? "rgba(197,69,225,.18)" : "rgba(117,143,154,.10)";
      const border = entry.ownerSide === 1 ? "#267e8d" : entry.ownerSide === 2 ? "#7e348c" : "#294452";
      roundedRect(context, x + 22, rowY, 576, 82, 14, sideColor, border);
      context.drawImage(icon, x + 38, rowY + 13, 56, 56);
      context.fillStyle = "#eaf3f6"; context.font = "850 21px Pretendard, sans-serif"; context.textAlign = "left";
      context.fillText(entry.name, x + 112, rowY + 36, 340);
      context.fillStyle = "#7895a4"; context.font = "700 15px Pretendard, sans-serif";
      context.fillText(layer.confirmed ? text("confirmed") : text("waiting"), x + 112, rowY + 61);
      context.fillStyle = entry.ownerSide === 1 ? "#6fe8f4" : entry.ownerSide === 2 ? "#e990f8" : "#9bb0b9";
      context.font = "900 20px Pretendard, sans-serif"; context.textAlign = "right";
      context.fillText(ownerName(entry.ownerSide), x + 570, rowY + 49);
    });
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
    link.download = `NotMeter-아티팩트-${selectedPair().west.name}-vs-${selectedPair().east.name}.png`;
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
