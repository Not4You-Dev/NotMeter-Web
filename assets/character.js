(() => {
  "use strict";

  const API_ROOT = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5080/character/v1"
    : "https://notmeter.112-168-140-142.sslip.io/character/v1";
  const RECENT_KEY = "notmeter-character-recent-v1";
  const FAVORITE_KEY = "notmeter-character-favorites-v1";
  const RECENT_LIMIT = 10;
  const FAVORITE_LIMIT = 30;
  const REQUEST_TIMEOUT_MS = 30_000;
  const CORE_STAT_TYPES = new Set(["STR", "DEX", "INT", "CON", "AGI", "WIS"]);
  const DIVINE_STAT_TYPES = new Set([
    "Justice", "Freedom", "Illusion", "Life", "Time", "Destruction",
    "Death", "Wisdom", "Destiny", "Space",
  ]);
  const ACCESSORY_SLOT_TYPES = new Set([
    "Pendant", "Necklace", "Earring1", "Earring2", "Ring1", "Ring2", "Bracelet1",
    "Bracelet2", "Belt", "Brooch1", "Brooch2", "Amulet", "Rune1", "Rune2",
  ]);
  const ITEM_GRADE_PRIORITY = Object.freeze({ Mythic: 6, Epic: 5, Unique: 4, Legend: 3, Rare: 2, Common: 1 });
  const COPY = {
    ko: {
      placeholder: "캐릭터 이름을 입력하세요", search: "검색", saved: "즐겨찾기 · 최근 검색",
      favorites: "즐겨찾기", recent: "최근 검색", recentGuide: "즐겨찾기는 고정 · 최근 검색은 최대 10개",
      addFavorite: "즐겨찾기에 추가", removeFavorite: "즐겨찾기에서 제거", deleteRecent: "최근 검색에서 삭제",
      results: "검색 결과 · 정확히 일치 · CP 높은 순 · 50레벨만 표시",
      searchAll: "전체", searchElyos: "천족", searchAsmodian: "마족", searchRaceFilter: "종족 필터",
      searching: "공식 캐릭터를 검색하고 있습니다", sortingCp: "CP 확인 후 자동 정렬 중",
      cpPending: "확인 중", noRecent: "즐겨찾기 또는 최근 검색한 캐릭터가 없습니다.",
      noResults: "검색 결과가 없습니다.", searchError: "검색 서버에 연결하지 못했습니다.",
      invalidName: "캐릭터 이름을 입력해 주세요.", pageTitle: "NotMeter 캐릭터 정보",
      pageSubtitle: "장비 · 영혼 각인 · 마석 · 스킬", heading: "캐릭터 정보",
      headingDescription: "장비 옵션과 영혼 각인, 마석을 한 화면에서 비교할 수 있습니다.",
      back: "랭킹으로 돌아가기", loading: "공식 캐릭터 정보를 불러오는 중입니다",
      loadingSub: "장비별 영혼 각인과 마석을 함께 확인하고 있습니다.",
      loadingDetails: "장비 상세 옵션을 빠르게 불러오는 중",
      loadError: "캐릭터 정보를 불러오지 못했습니다", retry: "다시 시도",
      overview: "한눈에 보기", stats: "스탯", equipment: "장비", arcana: "아르카나",
      skills: "스킬", activeSkills: "스킬", stigmaSkills: "스티그마", passiveSkills: "패시브",
      collection: "탈것 · 날개 · 타이틀",
      ranking: "랭킹", rankingEyebrow: "NOTMETER PUBLIC RANKING", rankingTitle: "구간별 TOP 20",
      rankingNote: "공개 닉네임으로 등록된 전체 기간 기록 중 던전별 최고 DPS 한 건만 표시합니다.",
      rankingLoading: "공개 랭킹을 확인하고 있습니다.",
      rankingEmpty: "공개 닉네임으로 등록된 구간별 TOP 20 기록이 없습니다.",
      rankingError: "랭킹 정보를 불러오지 못했습니다.", rank: "순위", dungeon: "던전", boss: "보스", dps: "DPS",
      combatPower: "전투력", itemLevel: "아이템 레벨", legion: "레기온", none: "없음",
      updatedAt: "최근 갱신", refreshProfile: "정보 새로고침", refreshingProfile: "갱신 중",
      refreshComplete: "최신 정보로 갱신했습니다.", refreshCooldown: "최근 갱신 후 5분부터 다시 갱신할 수 있습니다.",
      refreshFailed: "공식 정보 갱신에 실패해 기존 정보를 유지합니다.",
      server: "서버", job: "직업", race: "종족", level: "레벨", title: "타이틀",
      coreStats: "주요 스탯", divineStats: "주신 스탯", generalStats: "일반·전투 스탯",
      generalStatsNote: "장착 장비의 공식 옵션·영혼 각인·마석을 합산한 값입니다.",
      equipmentNote: "아이템별 기본 옵션, 영혼 각인, 장착 마석을 같은 행에서 비교할 수 있습니다.",
      soulSummary: "영혼 각인 한눈에 보기", stoneSummary: "마석 한눈에 보기",
      basicOptions: "기본·추가 옵션", soulEngraving: "영혼 각인", manastones: "마석 · 신석",
      stoneTotal: "장착 마석 총합", stoneTotalNote: "모든 착용 장비 기준 · 피해 증폭 계열은 100당 1%로 환산",
      soulSkillTotal: "영혼 각인 스킬 총합", soulSkillTotalNote: "동일 스킬의 증가 레벨을 장비 전체에서 합산",
      soulSkillLevel: "+{value}", equippedItems: "{value}개 장비",
      gearTab: "장비", accessoryTab: "장신구",
      emptyOption: "표시할 옵션 없음", acquired: "습득", notAcquired: "미습득",
      equipped: "장착", ownedTitles: "보유 타이틀", mount: "탈것", wing: "날개",
      wingSkin: "날개 외형", boards: "개 주신", unlocked: "개 노드 개방",
      officialNote: "캐릭터 정보는 아이온2 공식 공개 정보 기준이며, 게임 내 정보 공개 상태와 갱신 시점에 따라 일부 항목이 비어 있을 수 있습니다.",
    },
    en: {
      placeholder: "Enter a character name", search: "Search", saved: "Favorites · Recent",
      favorites: "Favorites", recent: "Recent", recentGuide: "Favorites stay pinned · Up to 10 recent characters",
      addFavorite: "Add to favorites", removeFavorite: "Remove from favorites", deleteRecent: "Remove from recent",
      results: "Results · Exact name · Highest CP first · Level 50 only",
      searchAll: "All", searchElyos: "Elyos", searchAsmodian: "Asmodian", searchRaceFilter: "Race filter",
      searching: "Searching official character data", sortingCp: "Checking CP and sorting automatically",
      cpPending: "Checking", noRecent: "No recent characters.",
      noResults: "No characters found.", searchError: "Could not reach the search service.",
      invalidName: "Enter a character name.", pageTitle: "NotMeter Character Profile",
      pageSubtitle: "Gear · Soul Engraving · Manastones · Skills", heading: "Character profile",
      headingDescription: "Compare gear options, soul engravings, and manastones in one view.",
      back: "Back to rankings", loading: "Loading official character data",
      loadingSub: "Checking item engravings and manastones.", loadError: "Could not load this character",
      loadingDetails: "Loading detailed gear options",
      retry: "Retry", overview: "Overview", stats: "Stats", equipment: "Equipment",
      arcana: "Arcana", skills: "Skills", activeSkills: "Skills", stigmaSkills: "Stigma", passiveSkills: "Passive",
      collection: "Mount · Wings · Titles",
      ranking: "Ranking", rankingEyebrow: "NOTMETER PUBLIC RANKING", rankingTitle: "Top 20 by CP bracket",
      rankingNote: "Shows only the highest-DPS all-time public Top 20 record for each dungeon.",
      rankingLoading: "Checking public rankings.", rankingEmpty: "No public Top 20 bracket record was found.",
      rankingError: "Could not load ranking data.", rank: "Rank", dungeon: "Dungeon", boss: "Boss", dps: "DPS",
      combatPower: "Combat Power", itemLevel: "Item Level", legion: "Legion", none: "None",
      updatedAt: "Last updated", refreshProfile: "Refresh profile", refreshingProfile: "Refreshing",
      refreshComplete: "Profile refreshed.", refreshCooldown: "You can refresh again five minutes after the last update.",
      refreshFailed: "Refresh failed. The cached profile is still displayed.",
      server: "Server", job: "Class", race: "Race", level: "Level", title: "Title",
      coreStats: "Core stats", divineStats: "Divine stats", generalStats: "Combat stats",
      generalStatsNote: "Totals from official equipped item options, engravings, and manastones.",
      equipmentNote: "Compare base options, soul engravings, and socketed stones on one row.",
      soulSummary: "Soul engraving summary", stoneSummary: "Manastone summary",
      basicOptions: "Base & bonus options", soulEngraving: "Soul engraving", manastones: "Stones",
      stoneTotal: "Equipped manastone totals", stoneTotalNote: "All equipped gear · damage amplification converts at 100 = 1%",
      soulSkillTotal: "Soul engraving skill totals", soulSkillTotalNote: "Combined skill levels across all equipped gear",
      soulSkillLevel: "+{value}", equippedItems: "{value} items",
      gearTab: "Gear", accessoryTab: "Accessories",
      emptyOption: "No visible option", acquired: "Acquired", notAcquired: "Not acquired",
      equipped: "Equipped", ownedTitles: "Owned titles", mount: "Mount", wing: "Wings",
      wingSkin: "Wing skin", boards: " boards", unlocked: " nodes open",
      officialNote: "Character data comes from AION2's official public profile. Some fields can be empty depending on visibility and refresh time.",
    },
    "zh-TW": {
      placeholder: "輸入角色名稱", search: "搜尋", saved: "我的最愛 · 最近搜尋",
      favorites: "我的最愛", recent: "最近搜尋", recentGuide: "我的最愛固定顯示 · 最近搜尋最多 10 個",
      addFavorite: "加入我的最愛", removeFavorite: "從我的最愛移除", deleteRecent: "從最近搜尋刪除",
      results: "搜尋結果 · 名稱完全相符 · 戰鬥力由高至低 · 僅顯示 50 級", searching: "正在搜尋官方角色資料",
      sortingCp: "正在確認戰鬥力並自動排序", cpPending: "確認中", noRecent: "沒有最近搜尋角色。",
      searchAll: "全部", searchElyos: "天族", searchAsmodian: "魔族", searchRaceFilter: "種族篩選",
      noResults: "找不到角色。", searchError: "無法連線搜尋服務。", invalidName: "請輸入角色名稱。",
      pageTitle: "NotMeter 角色資料", pageSubtitle: "裝備 · 靈魂刻印 · 魔石 · 技能", heading: "角色資料",
      headingDescription: "在同一畫面比較裝備選項、靈魂刻印與魔石。", back: "返回排名",
      loading: "正在載入官方角色資料", loadingSub: "正在確認各裝備的靈魂刻印與魔石。",
      loadingDetails: "正在快速載入裝備詳細選項",
      loadError: "無法載入角色資料", retry: "重試", overview: "總覽", stats: "屬性",
      equipment: "裝備", arcana: "阿爾卡納", skills: "技能", activeSkills: "技能", stigmaSkills: "烙印技能",
      passiveSkills: "被動技能",
      ranking: "排名", rankingEyebrow: "NOTMETER PUBLIC RANKING", rankingTitle: "區間 TOP 20",
      rankingNote: "每個副本僅顯示公開暱稱的全期間最高 DPS TOP 20 紀錄。",
      rankingLoading: "正在確認公開排名。", rankingEmpty: "沒有公開暱稱的區間 TOP 20 紀錄。",
      rankingError: "無法載入排名資料。", rank: "名次", dungeon: "副本", boss: "首領", dps: "DPS",
      collection: "坐騎 · 翅膀 · 稱號", combatPower: "戰鬥力", itemLevel: "道具等級",
      updatedAt: "最近更新", refreshProfile: "更新資料", refreshingProfile: "更新中",
      refreshComplete: "已更新為最新資料。", refreshCooldown: "最近更新五分鐘後可再次更新。",
      refreshFailed: "官方資料更新失敗，將繼續顯示快取資料。",
      legion: "軍團", none: "無", server: "伺服器", job: "職業", race: "種族", level: "等級",
      title: "稱號", coreStats: "主要屬性", divineStats: "主神屬性", generalStats: "一般·戰鬥屬性",
      generalStatsNote: "合計官方已裝備道具的選項、靈魂刻印與魔石。", equipmentNote: "同列比較基本選項、靈魂刻印與已鑲嵌魔石。",
      soulSummary: "靈魂刻印總覽", stoneSummary: "魔石總覽", basicOptions: "基本·追加選項",
      soulEngraving: "靈魂刻印", manastones: "魔石 · 神石", stoneTotal: "已裝備魔石合計",
      stoneTotalNote: "所有已裝備道具 · 傷害增幅以 100 = 1% 換算", emptyOption: "無可顯示選項",
      soulSkillTotal: "靈魂刻印技能合計", soulSkillTotalNote: "合計所有已裝備道具的相同技能等級",
      soulSkillLevel: "+{value}", equippedItems: "{value}件裝備",
      gearTab: "裝備", accessoryTab: "飾品",
      acquired: "已學習", notAcquired: "未學習", equipped: "裝備中", ownedTitles: "持有稱號",
      mount: "坐騎", wing: "翅膀", wingSkin: "翅膀外觀", boards: " 個主神",
      unlocked: " 個節點開放", officialNote: "角色資料以 AION2 官方公開資料為準；依公開設定與更新時間，部分項目可能為空白。",
    },
  };

  const state = {
    locale: readLocale(), searchResults: [], searchRace: "all", searchComplete: true,
    searchRequest: 0, profile: null, profileLoad: null, profileRequest: 0,
  };
  const elements = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindElements();
    bindEvents();
    applyCopy();
    if (isCharacterView()) activate();
  });

  function bindElements() {
    for (const id of [
      "character-search-form", "character-search-input", "character-search-submit",
      "character-search-popover", "character-search-popover-title", "character-search-status",
      "character-search-results", "character-search-race-filters", "character-surface", "character-page-title",
      "character-page-description", "character-back-button", "character-loading-state",
      "character-error-state", "character-error-title", "character-error-message",
      "character-retry-button", "character-profile-content",
    ]) elements[id] = document.getElementById(id);
  }

  function bindEvents() {
    elements["character-search-form"]?.addEventListener("submit", event => {
      event.preventDefault();
      void search(elements["character-search-input"].value);
    });
    elements["character-search-input"]?.addEventListener("focus", () => {
      const query = elements["character-search-input"].value.trim();
      if (query && state.searchResults.length) renderSearchRows(state.searchResults, false);
      else renderRecent();
      setPopover(true);
    });
    elements["character-search-input"]?.addEventListener("input", () => {
      if (!elements["character-search-input"].value.trim()) renderRecent();
    });
    elements["character-search-race-filters"]?.addEventListener("click", event => {
      const button = event.target.closest("[data-search-race]");
      if (!button) return;
      state.searchRace = button.dataset.searchRace || "all";
      renderSearchRows(state.searchResults, false);
    });
    elements["character-retry-button"]?.addEventListener("click", () => void loadProfile(true, false));
    document.addEventListener("pointerdown", event => {
      if (!event.target.closest("#global-character-search")) setPopover(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setPopover(false);
    });
  }

  function applyCopy() {
    const copy = currentCopy();
    elements["character-search-input"]?.setAttribute("placeholder", copy.placeholder);
    if (elements["character-search-submit"]) elements["character-search-submit"].textContent = copy.search;
    const raceFilters = elements["character-search-race-filters"];
    if (raceFilters) {
      raceFilters.setAttribute("aria-label", copy.searchRaceFilter);
      const labels = { all: copy.searchAll, elyos: copy.searchElyos, asmodian: copy.searchAsmodian };
      for (const button of raceFilters.querySelectorAll("[data-search-race]")) {
        button.textContent = labels[button.dataset.searchRace] || copy.searchAll;
      }
    }
    if (elements["character-page-title"]) elements["character-page-title"].textContent = copy.heading;
    if (elements["character-page-description"]) elements["character-page-description"].textContent = copy.headingDescription;
    const backLabel = elements["character-back-button"]?.querySelector("span:last-child");
    if (backLabel) backLabel.textContent = copy.back;
    if (elements["character-error-title"]) elements["character-error-title"].textContent = copy.loadError;
    if (elements["character-retry-button"]) elements["character-retry-button"].textContent = copy.retry;
    const loading = elements["character-loading-state"];
    if (loading) {
      const strong = loading.querySelector("strong");
      const span = loading.querySelector("span");
      if (strong) strong.textContent = copy.loading;
      if (span) span.textContent = copy.loadingSub;
    }
    if (!elements["character-search-popover"]?.hidden) renderRecent();
    if (state.profile) renderProfile(state.profile);
  }

  async function search(rawName) {
    const name = String(rawName || "").trim();
    const copy = currentCopy();
    if (!name) {
      renderMessage(copy.invalidName);
      setPopover(true);
      return;
    }
    elements["character-search-submit"].disabled = true;
    elements["character-search-popover-title"].textContent = copy.results;
    elements["character-search-status"].textContent = copy.searching;
    state.searchRace = "all";
    state.searchComplete = true;
    const requestId = ++state.searchRequest;
    setRaceFiltersVisible(true);
    renderLoadingRows();
    setPopover(true);
    try {
      const data = await fetchJson(`${API_ROOT}/search?name=${encodeURIComponent(name)}&fast=1`);
      if (requestId !== state.searchRequest) return;
      applySearchPayload(data);
      if (!state.searchComplete) void pollSearchResults(name, requestId);
    } catch {
      setRaceFiltersVisible(false);
      elements["character-search-status"].textContent = copy.searchError;
      renderMessage(copy.searchError);
    } finally {
      elements["character-search-submit"].disabled = false;
    }
  }

  function applySearchPayload(data) {
    state.searchComplete = data?.complete !== false;
    state.searchResults = Array.isArray(data?.results)
      ? data.results.slice().sort((a, b) =>
        Number(b.combatPower) - Number(a.combatPower) ||
        String(a.name || "").localeCompare(String(b.name || ""), "ko"))
      : [];
    renderSearchRows(state.searchResults, false);
  }

  async function pollSearchResults(name, requestId) {
    for (let attempt = 0; attempt < 90 && requestId === state.searchRequest; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, attempt < 10 ? 350 : 1000));
      if (requestId !== state.searchRequest) return;
      try {
        const data = await fetchJson(
          `${API_ROOT}/search?name=${encodeURIComponent(name)}&fast=1&_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (requestId !== state.searchRequest) return;
        applySearchPayload(data);
        if (state.searchComplete) return;
      } catch {
        // The first result list remains usable while a background CP lookup is retried.
      }
    }
  }

  function renderRecent() {
    const copy = currentCopy();
    elements["character-search-popover-title"].textContent = copy.saved;
    elements["character-search-status"].textContent = copy.recentGuide;
    setRaceFiltersVisible(false);
    renderSavedRows();
  }

  function renderSavedRows() {
    const container = elements["character-search-results"];
    container.replaceChildren();
    const favorites = readFavorites();
    const favoriteKeys = new Set(favorites.map(characterKey));
    const recent = readRecent().filter(item => !favoriteKeys.has(characterKey(item)));
    if (!favorites.length && !recent.length) {
      renderMessage(currentCopy().noRecent);
      return;
    }
    appendSavedGroup(container, currentCopy().favorites, favorites, "favorite");
    appendSavedGroup(container, currentCopy().recent, recent, "recent");
  }

  function appendSavedGroup(container, title, rows, context) {
    if (!rows.length) return;
    const heading = node("div", "character-search-group-head");
    heading.append(textNode("strong", title), textNode("span", formatNumber(rows.length)));
    container.append(heading);
    for (const item of rows) container.append(createSearchRow(item, context));
  }

  function renderSearchRows(rows, recent) {
    const container = elements["character-search-results"];
    container.replaceChildren();
    const filteredRows = recent || state.searchRace === "all"
      ? rows
      : rows.filter(item => state.searchRace === "elyos"
        ? String(item.raceName || "").includes("천")
        : String(item.raceName || "").includes("마"));
    if (!recent) {
      const count = state.searchRace === "all"
        ? `${formatNumber(filteredRows.length)}개`
        : `${formatNumber(filteredRows.length)} / ${formatNumber(rows.length)}개`;
      elements["character-search-status"].textContent = state.searchComplete
        ? count
        : `${count} · ${currentCopy().sortingCp}`;
      for (const button of elements["character-search-race-filters"]?.querySelectorAll("[data-search-race]") || []) {
        button.setAttribute("aria-pressed", String(button.dataset.searchRace === state.searchRace));
      }
    }
    if (!filteredRows.length) {
      renderMessage(recent ? currentCopy().noRecent : currentCopy().noResults);
      return;
    }
    for (const item of filteredRows) container.append(createSearchRow(item, "search"));
  }

  function setRaceFiltersVisible(visible) {
    if (elements["character-search-race-filters"]) {
      elements["character-search-race-filters"].hidden = !visible;
    }
  }

  function createSearchRow(item, context = "search") {
    const row = node("div", "character-search-row");
    const button = node("button", "character-search-open");
    button.type = "button";
    const avatar = node("span", "character-search-avatar");
    avatar.append(createImage(item.profileImage, item.name));
    const identity = node("span", "character-search-name");
    const serverName = item.serverName || String(item.serverId || "—");
    const nameLine = node("span", "character-search-name-line");
    nameLine.append(textNode("strong", item.name || "—"));
    const cp = node("strong", "character-search-cp cp-badge");
    const hasCp = Number(item.combatPower) > 0;
    cp.title = hasCp ? `${formatNumber(item.combatPower)} CP` : currentCopy().sortingCp;
    cp.append(createImage("./assets/combat-power.png", ""),
      textNode("span", hasCp ? formatCompactCombatPower(item.combatPower) : currentCopy().cpPending));
    nameLine.append(cp);
    identity.append(nameLine, textNode("span", `${serverName} - ${item.raceName || "—"}`, "character-search-meta"));
    const job = node("span", "character-search-job");
    job.append(createImage(jobIcon(item.className), ""), document.createTextNode(item.className || "—"));
    button.append(avatar, identity, job);
    button.addEventListener("click", () => openCharacter(item));
    const actions = node("span", "character-search-actions");
    const favorite = node("button", "character-search-action character-favorite-button");
    const favoriteActive = isFavorite(item);
    favorite.type = "button";
    favorite.textContent = favoriteActive ? "★" : "☆";
    favorite.title = favoriteActive ? currentCopy().removeFavorite : currentCopy().addFavorite;
    favorite.setAttribute("aria-label", favorite.title);
    favorite.setAttribute("aria-pressed", String(favoriteActive));
    favorite.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(item);
      if (context === "search") renderSearchRows(state.searchResults, false);
      else renderRecent();
    });
    actions.append(favorite);
    if (context === "recent") {
      const remove = node("button", "character-search-action character-recent-delete");
      remove.type = "button";
      remove.textContent = "×";
      remove.title = currentCopy().deleteRecent;
      remove.setAttribute("aria-label", remove.title);
      remove.addEventListener("click", event => {
        event.stopPropagation();
        removeRecent(item);
        renderRecent();
      });
      actions.append(remove);
    }
    row.append(button, actions);
    return row;
  }

  function renderLoadingRows() {
    const container = elements["character-search-results"];
    container.replaceChildren();
    const row = node("div", "character-search-empty");
    row.append(node("div", "spinner"), textNode("p", currentCopy().searching));
    container.append(row);
  }

  function renderMessage(message) {
    elements["character-search-results"].replaceChildren(textNode("div", message, "character-search-empty"));
  }

  function openCharacter(item) {
    saveRecent(item);
    const url = new URL("./", window.location.href);
    url.searchParams.set("view", "character");
    url.searchParams.set("serverId", String(item.serverId));
    url.searchParams.set("characterId", item.characterId);
    url.searchParams.set("name", item.name || "");
    window.location.assign(url.href);
  }

  function activate() {
    const params = new URLSearchParams(window.location.search);
    const serverId = Number(params.get("serverId"));
    const characterId = params.get("characterId") || "";
    const name = String(params.get("name") || "").trim();
    if (!characterId && serverId > 0 && name) {
      void resolveLinkedCharacter(name, serverId);
      return;
    }
    void loadProfile(false, false);
  }

  async function resolveLinkedCharacter(name, serverId) {
    showProfileState("loading");
    try {
      const data = await fetchJson(`${API_ROOT}/search?name=${encodeURIComponent(name)}&fast=1`);
      const candidates = Array.isArray(data.results) ? data.results : [];
      const normalizedName = name.normalize("NFC").toLocaleLowerCase();
      const match = candidates.find(item =>
        Number(item.serverId) === Number(serverId) &&
        String(item.name || "").normalize("NFC").toLocaleLowerCase() === normalizedName) ||
        candidates.find(item => Number(item.serverId) === Number(serverId));
      if (!match?.characterId) throw new Error(currentCopy().noResults);
      const url = new URL(window.location.href);
      url.searchParams.set("characterId", String(match.characterId));
      url.searchParams.set("name", String(match.name || name));
      window.history.replaceState({}, "", url.href);
      await loadProfile(true, false);
    } catch (error) {
      showProfileState("error", error?.message || currentCopy().loadError);
    }
  }

  async function loadProfile(force, refreshOfficial) {
    const params = new URLSearchParams(window.location.search);
    const serverId = Number(params.get("serverId"));
    const characterId = params.get("characterId") || "";
    if (!serverId || !characterId) {
      showProfileState("error", currentCopy().invalidName);
      return;
    }
    if (state.profileLoad && !force) return state.profileLoad;
    if (!refreshOfficial || !state.profile) showProfileState("loading");
    const refreshSuffix = refreshOfficial ? "&refresh=1" : "";
    const fastSuffix = refreshOfficial ? "" : "&fast=1";
    const requestId = ++state.profileRequest;
    state.profileLoad = fetchJson(
      `${API_ROOT}/profile?serverId=${encodeURIComponent(serverId)}&characterId=${encodeURIComponent(characterId)}${refreshSuffix}${fastSuffix}`,
      { cache: refreshOfficial ? "no-store" : "default" },
    ).then(data => {
      applyProfilePayload(data, params, serverId, characterId);
      if (data?.complete === false) void pollProfile(params, serverId, characterId, requestId);
      return true;
    }).catch(error => {
      if (refreshOfficial && state.profile) showProfileState("content");
      else showProfileState("error", error?.message || currentCopy().loadError);
      return false;
    }).finally(() => { state.profileLoad = null; });
    return state.profileLoad;
  }

  async function pollProfile(params, serverId, characterId, requestId) {
    for (let attempt = 0; attempt < 40 && requestId === state.profileRequest; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, attempt < 8 ? 350 : 750));
      if (requestId !== state.profileRequest) return;
      try {
        const data = await fetchJson(
          `${API_ROOT}/profile?serverId=${encodeURIComponent(serverId)}&characterId=${encodeURIComponent(characterId)}&fast=1&_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (requestId !== state.profileRequest) return;
        applyProfilePayload(data, params, serverId, characterId);
        if (data?.complete !== false) return;
      } catch {
        // The profile shell remains usable while detailed item options finish loading.
      }
    }
  }

  function applyProfilePayload(data, params, serverId, characterId) {
    state.profile = data;
    const profile = data?.info?.profile || {};
    saveRecent({
      characterId: profile.characterId || characterId,
      name: profile.characterName || params.get("name") || "",
      serverId: profile.serverId || serverId,
      serverName: profile.serverName || "",
      className: profile.className || "",
      raceName: profile.raceName || "",
      level: profile.characterLevel || 0,
      combatPower: profile.combatPower || 0,
      profileImage: profile.profileImage || "",
    });
    renderProfile(data);
    showProfileState("content");
  }

  function showProfileState(name, message = "") {
    elements["character-loading-state"].hidden = name !== "loading";
    elements["character-error-state"].hidden = name !== "error";
    elements["character-profile-content"].hidden = name !== "content";
    if (message) elements["character-error-message"].textContent = message;
  }

  function renderProfile(data) {
    const copy = currentCopy();
    const content = elements["character-profile-content"];
    const info = data?.info || {};
    const profile = info.profile || {};
    const statList = Array.isArray(info.stat?.statList) ? info.stat.statList : [];
    const allEquipment = Array.isArray(data?.equipment?.equipment?.equipmentList)
      ? data.equipment.equipment.equipmentList : [];
    const itemDetails = data?.itemDetails || {};
    const regularEquipment = allEquipment.filter(item => !String(item.slotPosName).startsWith("Arcana"));
    const arcana = allEquipment.filter(item => String(item.slotPosName).startsWith("Arcana"));
    const itemLevel = statList.find(item => item.type === "ItemLevel")?.value || 0;

    document.title = `${profile.characterName || copy.heading} · NotMeter`;
    content.replaceChildren();
    content.append(
      renderHero(profile, itemLevel, data?.equipment?.petwing || {}, info.title || {},
        data?.fetchedAt, data?.complete !== false),
      renderSectionNav(),
      renderCharacterRankings(profile),
      renderEquipment(regularEquipment, itemDetails),
      renderSkills(data?.equipment?.skill?.skillList || []),
      renderStats(statList),
      renderArcana(arcana, itemDetails),
      textNode("p", copy.officialNote, "character-data-note"),
    );
  }

  function renderHero(profile, itemLevel, petwing, titles, fetchedAt, profileComplete) {
    const copy = currentCopy();
    const hero = node("section", "character-hero");
    const avatar = node("div", "character-profile-avatar");
    avatar.append(createImage(profile.profileImage || jobIcon(profile.className), profile.characterName || ""));
    const copyBox = node("div", "character-hero-copy");
    const nameRow = node("div", "character-hero-name");
    const heroJobIcon = createImage(jobIcon(profile.className), "");
    heroJobIcon.className = "character-hero-job-icon";
    nameRow.append(heroJobIcon, textNode("h3", profile.characterName || "—"));
    const meta = node("div", "character-hero-meta");
    for (const [label, value] of [
      [copy.server, profile.serverName],
      [copy.legion, profile.regionName || copy.none], [copy.level, profile.characterLevel],
    ]) {
      const item = node("span");
      item.append(document.createTextNode(`${label} `), textNode("b", String(value || "—")));
      meta.append(item);
    }
    copyBox.append(nameRow, meta);
    const equippedItems = [
      [copy.mount, petwing?.pet?.name || copy.none, petwing?.pet?.level ? `Lv.${petwing.pet.level}` : "", ""],
      [copy.wing, petwing?.wing?.name || copy.none, petwing?.wing?.enchantLevel ? `+${petwing.wing.enchantLevel}` : "", ""],
    ];
    const titleOrder = { Attack: 0, Defense: 1, Etc: 2 };
    const equippedTitles = (Array.isArray(titles?.titleList) ? titles.titleList.slice() : [])
      .sort((left, right) => (titleOrder[left.equipCategory] ?? 9) - (titleOrder[right.equipCategory] ?? 9));
    for (const title of equippedTitles) {
      const options = (Array.isArray(title.equipStatList) ? title.equipStatList : [])
        .map(item => item.desc).filter(Boolean).join(" · ");
      equippedItems.push([
        `${copy.equipped} ${copy.title} · ${titleCategoryLabel(title.equipCategory)}`,
        title.name || copy.none,
        "",
        options,
      ]);
    }
    if (!equippedTitles.length) equippedItems.push([`${copy.equipped} ${copy.title}`, copy.none, "", ""]);
    const collection = node("div", "character-equipped-collection");
    for (const [index, [label, value, suffix, detail]] of equippedItems.entries()) {
      const isTitle = index >= 2;
      const item = node("span", `character-equipped-item${isTitle ? " character-equipped-title-item" : ""}${index === 2 ? " title-row-start" : ""}`);
      item.append(textNode("small", label), textNode("strong", value));
      if (suffix) item.append(textNode("em", suffix));
      if (detail) item.append(textNode("i", detail));
      collection.append(item);
    }
    copyBox.append(collection);
    const cp = node("div", "character-cp-card");
    const cpValue = node("span", "character-profile-cp-badge cp-badge");
    cpValue.title = `${formatNumber(profile.combatPower)} CP`;
    cpValue.append(createImage("./assets/combat-power.png", ""),
      textNode("strong", formatCompactCombatPower(profile.combatPower)));
    cp.append(textNode("span", copy.combatPower), cpValue,
      textNode("small", `${formatNumber(profile.combatPower)} CP · ${copy.itemLevel} ${formatNumber(itemLevel)}`));
    const refresh = node("div", "character-profile-refresh");
    const refreshStatus = textNode("span", profileComplete
      ? `${copy.updatedAt} ${formatDateTime(fetchedAt)}`
      : copy.loadingDetails);
    const refreshButton = textNode("button", copy.refreshProfile, "character-profile-refresh-button");
    refreshButton.type = "button";
    refreshButton.addEventListener("click", async () => {
      const previousFetchedAt = state.profile?.fetchedAt || "";
      refreshButton.disabled = true;
      refreshButton.textContent = copy.refreshingProfile;
      refreshStatus.textContent = copy.refreshingProfile;
      const succeeded = await loadProfile(true, true);
      const visibleRefresh = elements["character-profile-content"]
        ?.querySelector(".character-profile-refresh");
      const visibleStatus = visibleRefresh?.querySelector("span");
      const visibleButton = visibleRefresh?.querySelector("button");
      if (visibleButton) {
        visibleButton.disabled = false;
        visibleButton.textContent = copy.refreshProfile;
      }
      if (!succeeded) {
        if (visibleStatus) visibleStatus.textContent = copy.refreshFailed;
        return;
      }
      const refreshedAt = state.profile?.fetchedAt || "";
      if (visibleStatus) {
        visibleStatus.textContent = refreshedAt === previousFetchedAt
          ? copy.refreshCooldown
          : copy.refreshComplete;
      }
    });
    refresh.append(refreshStatus, refreshButton);
    cp.append(refresh);
    hero.append(avatar, copyBox, cp);
    return hero;
  }

  function renderSectionNav() {
    const copy = currentCopy();
    const nav = node("nav", "character-section-nav");
    for (const [id, label] of [
      ["character-rankings", copy.ranking],
      ["character-equipment", copy.equipment],
      ["character-skills", copy.skills],
      ["character-stats", copy.stats], ["character-arcana", copy.arcana],
    ]) {
      const link = textNode("a", label);
      link.href = `#${id}`;
      nav.append(link);
    }
    return nav;
  }

  function renderCharacterRankings(profile) {
    const copy = currentCopy();
    const section = createSection(
      "character-rankings", copy.rankingEyebrow, copy.rankingTitle, copy.rankingNote);
    const body = node("div", "character-ranking-body");
    body.append(textNode("p", copy.rankingLoading, "character-ranking-state"));
    section.append(body);

    void loadCharacterRankings(profile).then(rows => {
      if (!rows.length) {
        body.replaceChildren(textNode("p", copy.rankingEmpty, "character-ranking-state"));
        return;
      }
      const table = node("div", "character-ranking-table");
      const header = node("div", "character-ranking-row character-ranking-header");
      for (const label of [copy.rank, copy.dungeon, copy.boss, copy.dps]) {
        header.append(textNode("span", label));
      }
      table.append(header);
      for (const row of rows) {
        const item = node("div", "character-ranking-row");
        const rank = node("span", "character-ranking-rank");
        rank.append(textNode("strong", `#${row.rank}`), textNode("small", row.cpTierLabel));
        item.append(
          rank,
          textNode("strong", row.dungeonName),
          textNode("span", row.bossName),
          textNode("strong", formatNumber(Math.round(row.dps)), "character-ranking-dps"),
        );
        table.append(item);
      }
      body.replaceChildren(table);
    }).catch(() => {
      body.replaceChildren(textNode("p", copy.rankingError, "character-ranking-state"));
    });
    return section;
  }

  async function loadCharacterRankings(profile) {
    const loader = globalThis.NotMeterPublicRankingCache?.load;
    if (typeof loader !== "function") throw new Error("ranking cache loader unavailable");
    const cache = await loader(false);
    const characterName = String(profile?.characterName || "").trim().toLocaleLowerCase();
    const queryServerId = Number(new URLSearchParams(window.location.search).get("serverId"));
    const serverId = Number(profile?.serverId) || queryServerId;
    const jobName = String(profile?.className || "").trim();
    if (!characterName || !jobName) return [];

    const dungeonIndex = new Map((Array.isArray(cache.dungeons) ? cache.dungeons : [])
      .map((item, index) => [item.key, { ...item, index }]));
    const metadata = new Map((Array.isArray(cache.views) ? cache.views : []).map(view => [
      `${view.dungeonKey}|${view.bossIndex}|${view.cpTierIndex}|${view.period}`,
      view,
    ]));
    const results = [];
    for (const [dungeonKey, ranking] of Object.entries(cache.classRankings || {})) {
      const views = Array.isArray(ranking?.views) ? ranking.views : [];
      for (const view of views) {
        if (view.period !== "All" || Number(view.cpTierIndex) <= 0 || Number(view.bossIndex) !== 0) continue;
        const group = (Array.isArray(view.rows) ? view.rows : [])
          .find(row => row.jobName === jobName);
        const player = (Array.isArray(group?.players) ? group.players : []).find(candidate => {
          const name = String(candidate?.name || "").trim();
          if (!name || name.includes("*") || name.toLocaleLowerCase() !== characterName) return false;
          return !serverId || !Number(candidate.serverId) || Number(candidate.serverId) === serverId;
        });
        if (!player || Number(player.rank) < 1 || Number(player.rank) > 20) continue;
        const key = `${dungeonKey}|${view.bossIndex}|${view.cpTierIndex}|${view.period}`;
        const meta = metadata.get(key) || {};
        const dungeon = dungeonIndex.get(dungeonKey) || {};
        const recordedBossIndex = Number(player.B ?? player.bossIndex) || 0;
        const recordedBossName = recordedBossIndex > 0
          ? dungeon.bossNames?.[recordedBossIndex - 1]
          : player.bossName;
        results.push({
          rank: Number(player.rank),
          dps: number(player.dps),
          dungeonKey,
          dungeonName: String(meta.dungeonName || dungeon.displayName || dungeonKey),
          bossName: cleanBossName(recordedBossName || meta.bossName || "—"),
          cpTierLabel: String(meta.cpTierLabel || cache.cpTiers?.find(tier =>
            Number(tier.index) === Number(view.cpTierIndex))?.label || ""),
          dungeonOrder: Number(dungeon.index) || 0,
          bossIndex: Number(view.bossIndex) || 0,
          cpTierIndex: Number(view.cpTierIndex) || 0,
        });
      }
    }
    const bestByDungeon = new Map();
    for (const row of results) {
      const current = bestByDungeon.get(row.dungeonKey);
      if (!current || row.dps > current.dps || (row.dps === current.dps && row.rank < current.rank)) {
        bestByDungeon.set(row.dungeonKey, row);
      }
    }
    return [...bestByDungeon.values()].sort((left, right) =>
      left.dungeonOrder - right.dungeonOrder || right.dps - left.dps);
  }

  function cleanBossName(value) {
    return String(value || "—")
      .replace(/^\s*\d+\s*(?:네임드|보스)\s*(?:[·:：-]\s*)?/i, "")
      .trim() || "—";
  }

  function renderStats(statList) {
    const copy = currentCopy();
    const section = createSection("character-stats", "ALL STATS", copy.stats,
      "게임에서 익숙한 배치로 주요 스탯과 주신 스탯을 한눈에 확인합니다.");
    const wheel = node("div", "character-stat-wheel");
    wheel.append(node("div", "character-stat-orbit-lines"));
    const coreRing = node("div", "character-core-ring");
    const divineRing = node("div", "character-divine-ring");
    const coreStats = statList.filter(item => CORE_STAT_TYPES.has(item.type));
    const divineStats = statList.filter(item => DIVINE_STAT_TYPES.has(item.type));
    for (const [index, stat] of coreStats.entries()) coreRing.append(renderOrbitStat(stat, "core", index));
    for (const [index, stat] of divineStats.entries()) divineRing.append(renderOrbitStat(stat, "divine", index));
    wheel.append(coreRing, divineRing);
    section.append(wheel);
    return section;
  }

  function renderOrbitStat(stat, kind, index) {
    const item = node("div", `character-orbit-stat ${kind} stat-position-${index}`);
    const descriptions = Array.isArray(stat.statSecondList) ? stat.statSecondList : [];
    if (descriptions.length) item.title = descriptions.join(" · ");
    const sigil = node("span", `character-stat-sigil stat-sigil-${stat.type}`);
    sigil.setAttribute("aria-hidden", "true");
    item.append(sigil);
    const copy = node("span", "character-orbit-copy");
    copy.append(textNode("b", String(stat.name || "—").replace(/\[[^\]]+\]$/, "")),
      textNode("strong", formatNumber(stat.value)));
    item.append(copy);
    return item;
  }

  function renderEquipment(items, details) {
    const copy = currentCopy();
    const section = createSection("character-equipment", "EQUIPMENT LOADOUT", copy.equipment, copy.equipmentNote,
      `${items.length}개`);
    const sorted = items.slice().sort((a, b) => Number(a.slotPos) - Number(b.slotPos));
    const gear = sorted.filter(item => !ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)));
    const accessories = sorted.filter(item => ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)))
      .sort((a, b) => equipmentDetailPriority(b, details) - equipmentDetailPriority(a, details) ||
        Number(a.slotPos) - Number(b.slotPos));
    const tabs = node("div", "equipment-tabs");
    tabs.setAttribute("role", "tablist");
    const panels = node("div", "equipment-tab-panels");
    const groups = [
      ["gear", copy.gearTab, gear],
      ["accessories", copy.accessoryTab, accessories],
    ];
    for (const [index, [key, label, groupItems]] of groups.entries()) {
      const button = node("button", "equipment-tab");
      button.type = "button";
      button.dataset.equipmentTab = key;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === 0));
      button.append(textNode("span", label), textNode("strong", String(groupItems.length)));
      const list = node("div", "equipment-list");
      list.dataset.equipmentPanel = key;
      list.setAttribute("role", "tabpanel");
      list.hidden = index !== 0;
      for (const item of groupItems) list.append(renderEquipmentCard(item, details[String(item.slotPos)] || {}));
      button.addEventListener("click", () => {
        for (const tab of tabs.querySelectorAll(".equipment-tab")) {
          tab.setAttribute("aria-selected", String(tab === button));
        }
        for (const panel of panels.querySelectorAll(".equipment-list")) {
          panel.hidden = panel.dataset.equipmentPanel !== key;
        }
      });
      tabs.append(button);
      panels.append(list);
    }
    section.append(tabs, renderSoulSkillSummary(items, details), renderMagicStoneSummary(items, details), panels);
    return section;
  }

  function renderSoulSkillSummary(items, details) {
    const copy = currentCopy();
    const totals = new Map();
    for (const item of items) {
      const detail = details[String(item.slotPos)] || {};
      for (const skill of Array.isArray(detail.subSkills) ? detail.subSkills : []) {
        const name = String(skill?.name || "").trim();
        if (!name) continue;
        const key = String(skill.id || name);
        const current = totals.get(key) || { name, icon: skill.icon || "", level: 0, count: 0 };
        current.level += number(skill.level);
        current.count += 1;
        if (!current.icon && skill.icon) current.icon = skill.icon;
        totals.set(key, current);
      }
    }
    const rows = [...totals.values()].sort((left, right) =>
      right.level - left.level || left.name.localeCompare(right.name, "ko"));
    const summary = node("section", "equipment-soul-skill-summary");
    const heading = node("div", "equipment-summary-heading");
    heading.append(textNode("strong", copy.soulSkillTotal), textNode("span", copy.soulSkillTotalNote));
    const grid = node("div", "equipment-soul-skill-grid");
    for (const row of rows) {
      const item = node("div", "equipment-soul-skill-item");
      item.append(createImage(row.icon, ""));
      const identity = node("span");
      identity.append(textNode("strong", row.name), textNode("small", copy.equippedItems.replace("{value}", row.count)));
      item.append(identity, textNode("b", copy.soulSkillLevel.replace("{value}", row.level)));
      grid.append(item);
    }
    if (!rows.length) grid.append(textNode("span", copy.emptyOption, "empty-detail"));
    summary.append(heading, grid);
    return summary;
  }

  function renderMagicStoneSummary(items, details) {
    const copy = currentCopy();
    const summary = node("section", "equipment-stone-summary");
    const heading = node("div", "equipment-summary-heading");
    heading.append(textNode("strong", copy.stoneTotal), textNode("span", copy.stoneTotalNote));
    const totals = new Map();
    for (const item of items) {
      const detail = details[String(item.slotPos)] || {};
      for (const stone of Array.isArray(detail.magicStoneStat) ? detail.magicStoneStat : []) {
        const name = String(stone?.name || "").trim();
        const rawValue = String(stone?.value ?? "").replace(/,/g, "");
        const match = rawValue.match(/[+-]?\d+(?:\.\d+)?/);
        if (!name || !match) continue;
        const unit = rawValue.includes("%") ? "%" : "";
        const key = `${name}|${unit}`;
        const current = totals.get(key) || { name, unit, value: 0, count: 0 };
        current.value += Number(match[0]);
        current.count += 1;
        totals.set(key, current);
      }
    }
    const grid = node("div", "equipment-stone-summary-grid");
    const rows = [...totals.values()].sort((left, right) =>
      stoneEffectPriority(left) - stoneEffectPriority(right) || left.name.localeCompare(right.name, "ko"));
    for (const row of rows) {
      const isAmplification = stoneEffectPriority(row) === 0;
      const shouldConvert = isAmplification && row.unit !== "%";
      const displayedValue = shouldConvert ? row.value / 100 : row.value;
      const value = Number.isInteger(displayedValue)
        ? String(displayedValue)
        : displayedValue.toFixed(2).replace(/\.?0+$/, "");
      const item = node("div", `equipment-stone-summary-item${isAmplification ? " amplification" : ""}`);
      item.append(
        textNode("span", row.name),
        textNode("strong", `+${value}${shouldConvert ? "%" : row.unit}`),
        textNode("small", shouldConvert
          ? `${row.count}개 · 원본 +${row.value}`
          : `${row.count}개 마석`),
      );
      grid.append(item);
    }
    if (!rows.length) grid.append(textNode("span", copy.emptyOption, "empty-detail"));
    summary.append(heading, grid);
    return summary;
  }

  function equipmentDetailPriority(item, details) {
    const detail = details[String(item.slotPos)] || {};
    const hasSoulEngraving = (Array.isArray(detail.subStats) && detail.subStats.length > 0) ||
      (Array.isArray(detail.subSkills) && detail.subSkills.length > 0);
    const hasStone = (Array.isArray(detail.magicStoneStat) && detail.magicStoneStat.length > 0) ||
      (Array.isArray(detail.godStoneStat) && detail.godStoneStat.length > 0);
    return Number(hasSoulEngraving) + Number(hasStone);
  }

  function renderEquipmentCard(item, detail) {
    const copy = currentCopy();
    const card = node("article", `equipment-card equipment-grade-${item.grade || "Common"}`);
    const identity = node("div", "equipment-identity");
    const icon = node("div", "equipment-icon");
    icon.append(createImage(item.icon, item.name || ""));
    const itemCopy = node("div", "equipment-copy");
    itemCopy.append(textNode("strong", item.name || "—"));
    const progress = node("div", "equipment-progress");
    progress.append(textNode("span", `+${number(item.enchantLevel)}`, "equipment-enhance-badge"));
    if (number(item.exceedLevel)) {
      progress.append(textNode("span", `돌파 ${number(item.exceedLevel)}단계`, "equipment-exceed-badge"));
    }
    const basicOptions = node("div", "equipment-identity-options");
    basicOptions.append(textNode("h6", copy.basicOptions));
    const basicList = node("ul");
    const optionLines = basicItemOptions(detail);
    if (!optionLines.length) basicList.append(textNode("li", copy.emptyOption, "empty-detail"));
    for (const line of optionLines.slice(0, 12)) basicList.append(textNode("li", line));
    basicOptions.append(basicList);
    itemCopy.append(progress, basicOptions);
    identity.append(icon, itemCopy);
    card.append(identity,
      renderSoulEngravingColumn(copy.soulEngraving, detail),
      renderStoneColumn(copy.manastones, detail),
    );
    return card;
  }

  function renderEquipmentColumn(title, lines) {
    const column = node("div", "equipment-detail-column");
    column.append(textNode("h6", title));
    const list = node("ul");
    if (!lines.length) list.append(textNode("li", currentCopy().emptyOption, "empty-detail"));
    for (const line of lines.slice(0, 12)) list.append(textNode("li", line));
    column.append(list);
    return column;
  }

  function renderSoulEngravingColumn(title, detail) {
    const column = node("div", "equipment-detail-column equipment-soul-column");
    column.append(textNode("h6", title));
    const list = node("ul");
    const stats = (Array.isArray(detail?.subStats) ? detail.subStats : [])
      .map(statParts)
      .filter(stat => stat.name || stat.value)
      .slice(0, 12);
    for (const stat of stats) {
      const option = node("li", "equipment-soul-stat");
      option.append(textNode("span", stat.name || "—"), textNode("b", stat.value || "—"));
      list.append(option);
    }
    const skills = (Array.isArray(detail?.subSkills) ? detail.subSkills : [])
      .slice(0, Math.max(0, 12 - stats.length));
    for (const skill of skills) {
      const option = node("li", "equipment-skill-option");
      option.append(createImage(skill.icon, ""), textNode("span", skill.name || "—"),
        textNode("b", `Lv.${number(skill.level)}`));
      list.append(option);
    }
    if (!stats.length && !skills.length) list.append(textNode("li", currentCopy().emptyOption, "empty-detail"));
    column.append(list);
    return column;
  }

  function renderStoneColumn(title, detail) {
    const column = node("div", "equipment-detail-column equipment-stone-column");
    column.append(textNode("h6", title));
    const stones = node("div", "equipment-stone-grid");
    const entries = [
      ...(Array.isArray(detail?.magicStoneStat) ? detail.magicStoneStat.map(stone => ({ ...stone, kind: "magic" })) : []),
      ...(Array.isArray(detail?.godStoneStat) ? detail.godStoneStat.map(stone => ({ ...stone, kind: "god" })) : []),
    ].sort(compareStones);
    if (!entries.length) stones.append(textNode("span", currentCopy().emptyOption, "empty-detail"));
    for (const stone of entries.slice(0, 8)) {
      const tile = node("div", `equipment-stone equipment-stone-grade-${stone.grade || "Common"}${stone.kind === "god" ? " godstone" : ""}`);
      if (stone.icon) tile.append(createImage(stone.icon, stone.name || ""));
      const stoneCopy = node("span");
      stoneCopy.append(textNode("b", stone.name || "—"));
      if (stone.value) stoneCopy.append(textNode("em", String(stone.value)));
      tile.append(stoneCopy);
      stones.append(tile);
    }
    column.append(stones);
    return column;
  }

  function compareStones(left, right) {
    return Number(left.kind === "god") - Number(right.kind === "god") ||
      stoneGradePriority(right) - stoneGradePriority(left) ||
      stoneEffectPriority(left) - stoneEffectPriority(right) ||
      String(left.name || "").localeCompare(String(right.name || ""), "ko") ||
      String(left.value || "").localeCompare(String(right.value || ""), "ko");
  }

  function stoneGradePriority(stone) {
    const grade = String(stone?.grade || "Common");
    return ITEM_GRADE_PRIORITY[grade] || 0;
  }

  function stoneEffectPriority(stone) {
    const name = String(stone?.name || "").replace(/\s+/g, " ");
    if (/피해\s*(?:량\s*)?증폭|Damage\s*Amplification|傷害增幅/i.test(name)) return 0;
    if (/공격력|Attack\s*Power|攻擊力/i.test(name)) return 1;
    if (/치명타|Critical|暴擊/i.test(name)) return 2;
    if (/명중|Accuracy|命中/i.test(name)) return 3;
    if (/방어|저항|막기|회피|생명력|Defense|Resistance|Block|Evasion|HP|防禦|抵抗|格擋|迴避|生命/i.test(name)) return 4;
    return 5;
  }

  function renderArcana(items, details) {
    const copy = currentCopy();
    const section = createSection("character-arcana", "ARCANA SET", copy.arcana,
      "장착 중인 아르카나와 강화 수치를 슬롯 순서대로 표시합니다.", `${items.length}개`);
    const grid = node("div", "character-arcana-grid");
    for (const item of items.slice().sort((a, b) => Number(a.slotPos) - Number(b.slotPos))) {
      const card = node("article", "character-arcana-card");
      card.append(createImage(item.icon, item.name || ""));
      const body = node("div");
      const detail = details[String(item.slotPos)] || {};
      body.append(textNode("strong", item.name || "—"),
        textNode("span", `+${number(item.enchantLevel)} · ${detail.gradeName || item.grade || ""}`));
      const options = node("ul", "arcana-option-list");
      for (const line of basicItemOptions(detail)) options.append(textNode("li", line));
      for (const skill of Array.isArray(detail.subSkills) ? detail.subSkills : []) {
        const option = node("li", "arcana-skill-option");
        option.append(createImage(skill.icon, ""), textNode("span", skill.name || "—"),
          textNode("b", `Lv.${number(skill.level)}`));
        options.append(option);
      }
      if (!options.childElementCount) options.append(textNode("li", copy.emptyOption, "empty-detail"));
      card.append(body, options);
      grid.append(card);
    }
    if (!items.length) grid.append(textNode("div", copy.none, "character-search-empty"));
    section.append(grid);
    return section;
  }

  function renderSkills(rawSkills) {
    const copy = currentCopy();
    const skills = Array.isArray(rawSkills) ? rawSkills.slice() : [];
    skills.sort((a, b) => Number(b.skillLevel) - Number(a.skillLevel) || String(a.name).localeCompare(String(b.name)));
    const section = createSection("character-skills", "SKILL LIBRARY", copy.skills,
      "현재 스킬 레벨만 빠르게 비교할 수 있습니다.", `${skills.length}개`);
    const groups = [
      ["active", copy.activeSkills, skills.filter(skill => !["dp", "passive"].includes(String(skill.category).toLowerCase()))],
      ["stigma", copy.stigmaSkills, skills.filter(skill => String(skill.category).toLowerCase() === "dp")],
      ["passive", copy.passiveSkills, skills.filter(skill => String(skill.category).toLowerCase() === "passive")],
    ];
    const groupsContainer = node("div", "skill-groups");
    groups.forEach(([, label, groupSkills]) => {
      const group = node("section", "skill-group");
      const heading = node("div", "skill-group-heading");
      heading.append(textNode("h5", label), textNode("span", `${groupSkills.length}개`));
      const grid = node("div", "character-skill-grid");
      for (const skill of groupSkills) {
        const card = node("article", "character-skill-card");
        card.append(createImage(skill.icon, skill.name || ""));
        const body = node("div");
        body.append(textNode("strong", skill.name || "—"),
          textNode("span", `Lv.${number(skill.skillLevel)}`));
        card.append(body);
        grid.append(card);
      }
      if (!groupSkills.length) grid.append(textNode("div", copy.none, "character-search-empty"));
      group.append(heading, grid);
      groupsContainer.append(group);
    });
    section.append(groupsContainer);
    return section;
  }

  function createSection(id, kicker, title, description, count = "") {
    const section = node("section", "character-section");
    section.id = id;
    const head = node("div", "character-section-head");
    const copy = node("div");
    copy.append(textNode("span", kicker, "character-section-kicker"), textNode("h4", title), textNode("p", description));
    head.append(copy);
    if (count) head.append(textNode("span", count, "character-section-count"));
    section.append(head);
    return section;
  }

  function basicItemOptions(detail) {
    return statLines(detail?.mainStats);
  }

  function statLines(stats) {
    if (!Array.isArray(stats)) return [];
    return stats.map(statParts)
      .map(stat => `${stat.name} ${stat.value}`.trim())
      .filter(Boolean);
  }

  function statParts(stat) {
    const name = stat?.name || "";
    let value = stat?.value ?? "";
    if (stat?.minValue && String(stat.minValue) !== String(stat.value)) value = `${stat.minValue}~${stat.value}`;
    const extra = String(stat?.extra ?? "");
    if (extra && extra !== "0" && extra !== "0%") value = `${value} (+${extra.replace(/^\+/, "")})`;
    return { name, value: String(value) };
  }

  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        cache: options.cache || "default", headers: { Accept: "application/json" }, signal: controller.signal,
      });
      if (!response.ok) throw new Error(response.status === 404 ? currentCopy().noResults : currentCopy().loadError);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function readRecent() {
    try {
      const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
    } catch { return []; }
  }

  function readFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.slice(0, FAVORITE_LIMIT) : [];
    } catch { return []; }
  }

  function characterKey(item) {
    return `${Number(item?.serverId) || 0}:${String(item?.characterId || "")}`;
  }

  function savedCharacter(item) {
    return {
      characterId: String(item?.characterId || ""), name: String(item?.name || ""),
      serverId: Number(item?.serverId), serverName: String(item?.serverName || ""),
      className: String(item?.className || ""), raceName: String(item?.raceName || ""),
      level: number(item?.level), combatPower: number(item?.combatPower),
      profileImage: String(item?.profileImage || ""),
    };
  }

  function writeFavorites(items) {
    try { localStorage.setItem(FAVORITE_KEY, JSON.stringify(items.slice(0, FAVORITE_LIMIT))); } catch { /* ignored */ }
  }

  function isFavorite(item) {
    const key = characterKey(item);
    return readFavorites().some(entry => characterKey(entry) === key);
  }

  function toggleFavorite(item) {
    if (!item?.characterId || !item?.serverId) return;
    const key = characterKey(item);
    const favorites = readFavorites();
    const existing = favorites.findIndex(entry => characterKey(entry) === key);
    if (existing >= 0) favorites.splice(existing, 1);
    else favorites.unshift(savedCharacter(item));
    writeFavorites(favorites);
  }

  function removeRecent(item) {
    const key = characterKey(item);
    const recent = readRecent().filter(entry => characterKey(entry) !== key);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch { /* ignored */ }
  }

  function saveRecent(item) {
    if (!item?.characterId || !item?.serverId) return;
    const saved = savedCharacter(item);
    const key = characterKey(saved);
    const recent = readRecent().filter(entry => characterKey(entry) !== key);
    recent.unshift(saved);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, RECENT_LIMIT))); } catch { /* ignored */ }
    const favorites = readFavorites();
    const favoriteIndex = favorites.findIndex(entry => characterKey(entry) === key);
    if (favoriteIndex >= 0) {
      favorites[favoriteIndex] = saved;
      writeFavorites(favorites);
    }
  }

  function setPopover(open) {
    elements["character-search-popover"].hidden = !open;
    elements["character-search-input"].setAttribute("aria-expanded", String(open));
  }

  function currentCopy() { return COPY[state.locale] || COPY.ko; }
  function readLocale() {
    try {
      const saved = localStorage.getItem("notmeter-stats-locale");
      if (COPY[saved]) return saved;
    } catch { /* ignored */ }
    const language = String(navigator.language || "").toLowerCase();
    return language.startsWith("zh") ? "zh-TW" : language.startsWith("ko") ? "ko" : "en";
  }
  function titleCategoryLabel(category) {
    const key = String(category || "Etc");
    const labels = state.locale === "zh-TW"
      ? { Attack: "攻擊系列", Defense: "防禦系列", Etc: "其他系列" }
      : state.locale === "en"
        ? { Attack: "Attack type", Defense: "Defense type", Etc: "Utility type" }
        : { Attack: "공격계열", Defense: "방어계열", Etc: "기타계열" };
    return labels[key] || labels.Etc;
  }
  function isCharacterView() { return new URLSearchParams(window.location.search).get("view") === "character"; }
  function number(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
  function formatNumber(value) { return new Intl.NumberFormat(state.locale === "zh-TW" ? "zh-TW" : state.locale).format(number(value)); }
  function formatDateTime(value) {
    const date = new Date(value || 0);
    if (!Number.isFinite(date.getTime())) return "—";
    return new Intl.DateTimeFormat(state.locale === "zh-TW" ? "zh-TW" : state.locale, {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(date);
  }
  function formatCompactCombatPower(value) {
    const combatPower = Math.max(0, number(value));
    if (combatPower >= 1_000_000) return `${formatNumber(Math.floor(combatPower / 1_000))}M`;
    if (combatPower >= 1_000) return `${(combatPower / 1_000).toFixed(1).replace(/\.?0+$/, "")}K`;
    return formatNumber(Math.round(combatPower));
  }
  function jobIcon(job) { return job ? `./assets/jobs/${encodeURIComponent(job)}.png` : "./assets/notmeter-icon.png"; }

  function safeImageUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      if (url.origin === window.location.origin ||
          (url.protocol === "https:" && ["plaync.com", "playnccdn.com"].some(domain =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)))) return url.href;
    } catch { /* ignored */ }
    return "./assets/notmeter-icon.png";
  }

  function createImage(src, alt) {
    const image = document.createElement("img");
    image.src = safeImageUrl(src);
    image.alt = alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    return image;
  }
  function node(tag, className = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }
  function textNode(tag, text, className = "") {
    const element = node(tag, className);
    element.textContent = text == null ? "" : String(text);
    return element;
  }

  window.NotMeterCharacter = {
    activate,
    setLocale(locale) {
      if (!COPY[locale]) return;
      state.locale = locale;
      applyCopy();
    },
  };
})();
