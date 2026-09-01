(() => {
  "use strict";

  const API_ROOT = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5080/character/v1"
    : "https://notmeter.112-168-140-142.sslip.io/character/v1";
  const CHARACTER_RANKING_API_ROOT = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5080/ranking/v1/character"
    : "https://notmeter.112-168-140-142.sslip.io/ranking/v1/character";
  const RECENT_KEY = "notmeter-character-recent-v1";
  const FAVORITE_KEY = "notmeter-character-favorites-v1";
  const OFFICIAL_NAME_CATALOG_URL = "./assets/game-data.zh-TW.json?v=20260824-1";
  const OFFICIAL_TERMS_KO_TO_ZH_TW = Object.freeze({
    "천족": "天族", "마족": "魔族",
    "공격력": "攻擊力", "추가 공격력": "追加攻擊力", "최대 공격력": "最大攻擊力",
    "명중": "命中", "추가 명중": "追加命中", "치명타": "暴擊", "치명타 저항": "暴擊抵抗",
    "방어력": "防禦力", "추가 방어력": "追加防禦力", "회피": "迴避", "추가 회피": "追加迴避",
    "생명력": "生命力", "정신력": "精神力", "전투 속도": "戰鬥速度", "이동 속도": "移動速度",
    "피해 증폭": "傷害增幅", "무기 피해 증폭": "武器傷害增幅", "치명타 피해 증폭": "暴擊傷害增幅",
    "전방 피해 증폭": "前方傷害增幅", "후방 피해 증폭": "後方傷害增幅",
    "PVE 공격력": "PVE攻擊力", "PVE 명중": "PVE命中", "PVE 피해 증폭": "PVE傷害增幅",
    "보스 공격력": "首領攻擊力", "보스 피해 증폭": "首領傷害增幅",
    "봉혼석 추가 피해": "封魂石追加傷害", "막기": "格擋", "관통": "貫穿",
    "다단 히트 적중": "多段打擊命中", "재시전 시간": "再次施展時間",
  });
  const RECENT_LIMIT = 10;
  const FAVORITE_LIMIT = 30;
  const REQUEST_TIMEOUT_MS = 45_000;
  const SEARCH_SESSION_TTL_MS = 5 * 60_000;
  const PROFILE_SESSION_TTL_MS = 10 * 60_000;
  const SESSION_PROFILE_LIMIT = 4;
  const PROFILE_SESSION_INDEX_KEY = "notmeter-character-profile-session-index-v1";
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
      searchKicker: "CHARACTER LOOKUP", searchTitle: "캐릭터 검색",
      searchDescription: "닉네임으로 장비·스킬·랭킹을 바로 확인하세요",
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
      rankingNote: "현재 PVE 장비 전투력이 속한 동일 직업·25K 구간의 전체 기간과 이번 주 TOP 20을 나눠 표시합니다. 각 기간에서 던전별 최고 기록 한 건만 보여줍니다.",
      rankingAllTime: "전체 기간", rankingWeekly: "이번 주",
      rankingLoading: "공개 랭킹을 확인하고 있습니다.",
      rankingEmpty: "현재 PVE 장비 전투력이 속한 동일 직업·25K 구간에 공개 TOP 20 기록이 없습니다.",
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
      arcanaSkillTotal: "아르카나 스킬 증가 총합", arcanaSkillTotalNote: "장착 중인 모든 아르카나의 동일 스킬 증가 레벨을 합산",
      arcanaCards: "{value}개 아르카나",
      gearTab: "장비", accessoryTab: "장신구",
      emptyOption: "표시할 옵션 없음", acquired: "습득", notAcquired: "미습득",
      equipped: "장착", ownedTitles: "보유 타이틀", mount: "탈것", wing: "날개",
      wingSkin: "날개 외형", boards: "개 주신", unlocked: "개 노드 개방",
      itemCount: "{value}개", itemCountPair: "{visible} / {total}개",
      statsDescription: "게임에서 익숙한 배치로 주요 스탯과 주신 스탯을 한눈에 확인합니다.",
      arcanaDescription: "장착 중인 아르카나와 강화 수치를 슬롯 순서대로 표시합니다.",
      skillsDescription: "현재 스킬 레벨만 빠르게 비교할 수 있습니다.",
      exceedStage: "돌파 {value}단계", stoneOriginal: "{count}개 · 원본 +{value}",
      stoneCount: "{count}개 마석",
      loadoutTitle: "장비 세팅", loadoutNote: "마지막으로 확인된 PVE·PVP 장비를 비교합니다.",
      pveLoadout: "PVE", pvpLoadout: "PVP", currentLoadout: "현재", unavailableLoadout: "미수집",
      loadoutCapturedAt: "마지막 확인 {value}", unknownLoadout: "현재 장비의 PVE/PVP 구분을 확인할 수 없습니다.",
      equipmentSnapshot: "장비 스냅샷", equipmentSnapshotBusy: "이미지 만드는 중",
      equipmentSnapshotCopied: "이미지를 클립보드에 복사했습니다.",
      equipmentSnapshotDownloaded: "클립보드를 사용할 수 없어 PNG로 저장했습니다.",
      equipmentSnapshotFailed: "장비 스냅샷을 만들지 못했습니다.",
      equipmentSnapshotWaiting: "장비 상세 정보를 모두 불러온 뒤 사용할 수 있습니다.",
      snapshotKicker: "NOTMETER · EQUIPMENT SNAPSHOT", snapshotSoulSkills: "영혼 각인 스킬",
      snapshotSoulSkillsNote: "장착 장비 전체의 동일 스킬 증가 레벨 합계",
      snapshotManastones: "장착 마석 총수치", snapshotManastonesNote: "현재 세팅에 장착된 마석 합계",
      snapshotItemSoul: "각인", snapshotItemStones: "마석",
      snapshotFooter: "현재 선택한 {loadout} 세팅 · 아이온2 공식 공개 정보 기준",
      officialNote: "캐릭터 정보는 아이온2 공식 공개 정보 기준이며, 게임 내 정보 공개 상태와 갱신 시점에 따라 일부 항목이 비어 있을 수 있습니다.",
    },
    en: {
      searchKicker: "CHARACTER LOOKUP", searchTitle: "Character Search",
      searchDescription: "View gear, skills, and rankings by character name",
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
      rankingNote: "Shows all-time and current-week Top 20 records for the same class and 25K bracket as the current PVE loadout, keeping only the best record per dungeon in each period.",
      rankingAllTime: "All-time", rankingWeekly: "This week",
      rankingLoading: "Checking public rankings.", rankingEmpty: "No public Top 20 record was found for the same class and 25K bracket as the current PVE loadout.",
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
      arcanaSkillTotal: "Arcana skill level totals", arcanaSkillTotalNote: "Combined skill level increases across all equipped Arcana",
      arcanaCards: "{value} Arcana",
      gearTab: "Gear", accessoryTab: "Accessories",
      emptyOption: "No visible option", acquired: "Acquired", notAcquired: "Not acquired",
      equipped: "Equipped", ownedTitles: "Owned titles", mount: "Mount", wing: "Wings",
      wingSkin: "Wing skin", boards: " boards", unlocked: " nodes open",
      itemCount: "{value}", itemCountPair: "{visible} / {total}",
      statsDescription: "See core and divine stats in the same familiar layout as the game.",
      arcanaDescription: "Equipped Arcana and enhancement levels in slot order.",
      skillsDescription: "Quickly compare current skill levels.",
      exceedStage: "Breakthrough stage {value}", stoneOriginal: "{count} · raw +{value}",
      stoneCount: "{count} manastones",
      loadoutTitle: "Gear loadouts", loadoutNote: "Compare the latest detected PVE and PVP equipment.",
      pveLoadout: "PVE", pvpLoadout: "PVP", currentLoadout: "Current", unavailableLoadout: "Not captured",
      loadoutCapturedAt: "Last detected {value}", unknownLoadout: "The current equipment could not be classified as PVE or PVP.",
      equipmentSnapshot: "Gear snapshot", equipmentSnapshotBusy: "Creating image",
      equipmentSnapshotCopied: "Image copied to the clipboard.",
      equipmentSnapshotDownloaded: "Clipboard unavailable. The PNG was downloaded instead.",
      equipmentSnapshotFailed: "Could not create the gear snapshot.",
      equipmentSnapshotWaiting: "Available after all equipment details finish loading.",
      snapshotKicker: "NOTMETER · EQUIPMENT SNAPSHOT", snapshotSoulSkills: "Soul engraving skills",
      snapshotSoulSkillsNote: "Combined skill levels across all equipped items",
      snapshotManastones: "Equipped manastone totals", snapshotManastonesNote: "Totals for the selected loadout",
      snapshotItemSoul: "Engraving", snapshotItemStones: "Stones",
      snapshotFooter: "Selected {loadout} loadout · AION2 official public profile",
      officialNote: "Character data comes from AION2's official public profile. Some fields can be empty depending on visibility and refresh time.",
    },
    "zh-TW": {
      searchKicker: "CHARACTER LOOKUP", searchTitle: "角色搜尋",
      searchDescription: "輸入角色名稱，快速查看裝備、技能與排名",
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
      rankingNote: "依目前 PVE 裝備戰鬥力所屬的同職業 25K 區間，分別顯示全部期間與本週 TOP 20；每個期間只保留各副本的最高紀錄。",
      rankingAllTime: "全部期間", rankingWeekly: "本週",
      rankingLoading: "正在確認公開排名。", rankingEmpty: "目前 PVE 裝備戰鬥力所屬的同職業 25K 區間，沒有公開暱稱的 TOP 20 紀錄。",
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
      arcanaSkillTotal: "阿爾卡納技能提升合計", arcanaSkillTotalNote: "合計所有已裝備阿爾卡納的相同技能提升等級",
      arcanaCards: "{value}個阿爾卡納",
      gearTab: "裝備", accessoryTab: "飾品",
      acquired: "已學習", notAcquired: "未學習", equipped: "裝備中", ownedTitles: "持有稱號",
      mount: "坐騎", wing: "翅膀", wingSkin: "翅膀外觀", boards: " 個主神",
      unlocked: " 個節點開放", itemCount: "{value}個", itemCountPair: "{visible} / {total}個",
      statsDescription: "以遊戲中熟悉的配置，一覽主要屬性與主神屬性。",
      arcanaDescription: "依欄位順序顯示已裝備的阿爾卡納與強化數值。",
      skillsDescription: "快速比較目前技能等級。",
      exceedStage: "突破 {value}階段", stoneOriginal: "{count}個 · 原始 +{value}",
      stoneCount: "{count}個魔石",
      loadoutTitle: "裝備配置", loadoutNote: "比較最後確認的 PVE 與 PVP 裝備。",
      pveLoadout: "PVE", pvpLoadout: "PVP", currentLoadout: "目前", unavailableLoadout: "尚未收集",
      loadoutCapturedAt: "最後確認 {value}", unknownLoadout: "目前裝備無法判定為 PVE 或 PVP。",
      equipmentSnapshot: "裝備快照", equipmentSnapshotBusy: "正在建立圖片",
      equipmentSnapshotCopied: "圖片已複製到剪貼簿。",
      equipmentSnapshotDownloaded: "無法使用剪貼簿，已改為下載 PNG。",
      equipmentSnapshotFailed: "無法建立裝備快照。",
      equipmentSnapshotWaiting: "裝備詳細資料全部載入後即可使用。",
      snapshotKicker: "NOTMETER · EQUIPMENT SNAPSHOT", snapshotSoulSkills: "靈魂刻印技能",
      snapshotSoulSkillsNote: "合計所有已裝備道具的相同技能等級",
      snapshotManastones: "已裝備魔石總數值", snapshotManastonesNote: "目前配置的已鑲嵌魔石合計",
      snapshotItemSoul: "刻印", snapshotItemStones: "魔石",
      snapshotFooter: "目前選擇的 {loadout} 配置 · AION2 官方公開資料",
      officialNote: "角色資料以 AION2 官方公開資料為準；依公開設定與更新時間，部分項目可能為空白。",
    },
  };

  const state = {
    locale: readLocale(), searchResults: [], searchRace: "all", searchComplete: true,
    searchRequest: 0, profile: null, profileLoad: null, profileRequest: 0,
    profileRenderSignature: "",
    rankingKey: "", rankingStatus: "idle", rankingRows: [], rankingLoad: null,
    activeLoadout: null, activeEquipmentTab: "gear",
    officialNameCatalog: null, officialNameCatalogLoad: null, koreanNamesByTraditionalChinese: null,
  };
  const elements = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindElements();
    bindEvents();
    applyCopy();
    void ensureOfficialNameCatalog().then(refreshLocalizedContent);
    if (isCharacterView()) activate();
  });

  function bindElements() {
    for (const id of [
      "character-search-form", "character-search-input", "character-search-submit",
      "character-search-kicker", "character-search-title", "character-search-description",
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
      void ensureOfficialNameCatalog().then(refreshLocalizedContent);
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
    if (elements["character-search-kicker"]) elements["character-search-kicker"].textContent = copy.searchKicker;
    if (elements["character-search-title"]) elements["character-search-title"].textContent = copy.searchTitle;
    if (elements["character-search-description"]) elements["character-search-description"].textContent = copy.searchDescription;
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
    state.searchResults = [];
    const requestId = ++state.searchRequest;
    setRaceFiltersVisible(true);
    renderLoadingRows();
    setPopover(true);
    const region = searchOfficialRegion();
    const sessionKey = searchSessionKey(name, region);
    const sessionPayload = readSessionPayload(sessionKey, SEARCH_SESSION_TTL_MS);
    if (sessionPayload) applySearchPayload(sessionPayload, region);
    try {
      const data = await fetchJson(
        `${API_ROOT}/search?name=${encodeURIComponent(name)}&region=${region}&lang=${officialLanguage()}&fast=1`);
      if (requestId !== state.searchRequest) return;
      const preserveCompleteSession = sessionPayload?.complete !== false && data?.complete === false;
      if (!preserveCompleteSession) {
        writeSessionPayload(sessionKey, data);
        applySearchPayload(data, region);
      }
      if (data?.complete === false || !Array.isArray(data?.results) || data.results.length === 0) {
        void pollSearchResults(name, region, requestId);
      }
    } catch {
      if (sessionPayload) return;
      setRaceFiltersVisible(false);
      elements["character-search-status"].textContent = copy.searchError;
      renderMessage(copy.searchError);
    } finally {
      elements["character-search-submit"].disabled = false;
    }
  }

  function applySearchPayload(data, region = searchOfficialRegion()) {
    state.searchComplete = data?.complete !== false;
    state.searchResults = Array.isArray(data?.results)
      ? data.results.map(item => ({ ...item, region })).sort((a, b) =>
        Number(b.combatPower) - Number(a.combatPower) ||
        String(a.name || "").localeCompare(String(b.name || ""), "ko"))
      : [];
    renderSearchRows(state.searchResults, false);
  }

  async function pollSearchResults(name, region, requestId) {
    for (let attempt = 0; attempt < 90 && requestId === state.searchRequest; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, attempt < 8 ? 500 : 1250));
      if (requestId !== state.searchRequest) return;
      try {
        const data = await fetchJson(
          `${API_ROOT}/search?name=${encodeURIComponent(name)}&region=${region}&lang=${officialLanguage()}&fast=1&_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (requestId !== state.searchRequest) return;
        const preserveCompletePayload = state.searchComplete && state.searchResults.length > 0 && data?.complete === false;
        if (!preserveCompletePayload) {
          writeSessionPayload(searchSessionKey(name, region), data);
          applySearchPayload(data, region);
        }
        if (data?.complete !== false && Array.isArray(data?.results) && data.results.length > 0) return;
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
        ? /(?:천족|天族|Elyos)/i.test(String(item.raceName || ""))
        : /(?:마족|魔族|Asmodian)/i.test(String(item.raceName || "")));
    if (!recent) {
      const count = state.searchRace === "all"
        ? formatCopy("itemCount", { value: formatNumber(filteredRows.length) })
        : formatCopy("itemCountPair", {
          visible: formatNumber(filteredRows.length), total: formatNumber(rows.length),
        });
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
    const serverName = localizeOfficialText(item.serverName) || String(item.serverId || "—");
    const nameLine = node("span", "character-search-name-line");
    nameLine.append(textNode("strong", item.name || "—"));
    const cp = node("strong", "character-search-cp cp-badge");
    const hasCp = Number(item.combatPower) > 0;
    cp.title = hasCp ? `${formatNumber(item.combatPower)} CP` : currentCopy().sortingCp;
    cp.append(createImage("./assets/combat-power.png", ""),
      textNode("span", hasCp ? formatCompactCombatPower(item.combatPower) : currentCopy().cpPending));
    nameLine.append(cp);
    identity.append(nameLine, textNode("span",
      `${serverName} - ${localizeOfficialText(item.raceName) || "—"}`, "character-search-meta"));
    const job = node("span", "character-search-job");
    job.append(createImage(jobIcon(item.className), ""),
      document.createTextNode(localizeOfficialText(item.className) || "—"));
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
    if (normalizeOfficialRegion(item.region) === "tw") url.searchParams.set("region", "tw");
    else url.searchParams.delete("region");
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
      const region = currentOfficialRegion();
      const data = await fetchJson(
        `${API_ROOT}/search?name=${encodeURIComponent(name)}&region=${region}&lang=${officialLanguage()}&fast=1`);
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
    const region = currentOfficialRegion(params);
    if (!serverId || !characterId) {
      showProfileState("error", currentCopy().invalidName);
      return;
    }
    if (state.profileLoad && !force) return state.profileLoad;
    const sessionKey = profileSessionKey(region, serverId, characterId);
    const sessionPayload = !force
      ? readSessionPayload(sessionKey, PROFILE_SESSION_TTL_MS)
      : null;
    if (sessionPayload) applyProfilePayload(sessionPayload, params, serverId, characterId);
    if ((!refreshOfficial || !state.profile) && !sessionPayload) showProfileState("loading");
    const refreshSuffix = refreshOfficial ? "&refresh=1" : "";
    const fastSuffix = refreshOfficial ? "" : "&fast=1";
    const requestId = ++state.profileRequest;
    state.profileLoad = fetchJson(
      `${API_ROOT}/profile?serverId=${encodeURIComponent(serverId)}&characterId=${encodeURIComponent(characterId)}&region=${region}&lang=${officialLanguage()}${refreshSuffix}${fastSuffix}`,
      { cache: "no-store" },
    ).then(data => {
      writeProfileSessionPayload(sessionKey, data);
      applyProfilePayload(data, params, serverId, characterId);
      if (data?.complete === false) void pollProfile(params, region, serverId, characterId, requestId);
      return true;
    }).catch(error => {
      if (refreshOfficial && state.profile) showProfileState("content");
      else showProfileState("error", error?.message || currentCopy().loadError);
      return false;
    }).finally(() => { state.profileLoad = null; });
    return state.profileLoad;
  }

  async function pollProfile(params, region, serverId, characterId, requestId) {
    for (let attempt = 0; attempt < 90 && requestId === state.profileRequest; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, attempt < 6 ? 600 : 1250));
      if (requestId !== state.profileRequest) return;
      try {
        const data = await fetchJson(
          `${API_ROOT}/profile?serverId=${encodeURIComponent(serverId)}&characterId=${encodeURIComponent(characterId)}&region=${region}&lang=${officialLanguage()}&fast=1&_=${Date.now()}`,
          { cache: "no-store" },
        );
        if (requestId !== state.profileRequest) return;
        writeProfileSessionPayload(profileSessionKey(region, serverId, characterId), data);
        applyProfilePayload(data, params, serverId, characterId);
        if (data?.complete !== false) return;
      } catch {
        // The profile shell remains usable while detailed item options finish loading.
      }
    }
  }

  function applyProfilePayload(data, params, serverId, characterId) {
    const previousCharacterId = state.profile?.info?.profile?.characterId || "";
    const nextCharacterId = data?.info?.profile?.characterId || characterId;
    if (previousCharacterId === nextCharacterId && state.profile?.complete !== false && data?.complete === false) {
      return;
    }
    if (previousCharacterId && previousCharacterId !== nextCharacterId) {
      state.activeLoadout = null;
      state.activeEquipmentTab = "gear";
    }
    const renderSignature = profilePayloadSignature(data, characterId);
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
      region: currentOfficialRegion(params),
    });
    if (renderSignature !== state.profileRenderSignature) {
      state.profileRenderSignature = renderSignature;
      renderProfile(data);
    }
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
    const loadoutView = resolveLoadoutView(data);
    const visibleData = loadoutView.data;
    const info = visibleData?.info || {};
    const profile = info.profile || {};
    const statList = Array.isArray(info.stat?.statList) ? info.stat.statList : [];
    const allEquipment = Array.isArray(visibleData?.equipment?.equipment?.equipmentList)
      ? visibleData.equipment.equipment.equipmentList : [];
    const itemDetails = visibleData?.itemDetails || {};
    const regularEquipment = allEquipment.filter(item => !String(item.slotPosName).startsWith("Arcana"));
    const arcana = allEquipment.filter(item => String(item.slotPosName).startsWith("Arcana"));
    const itemLevel = statList.find(item => item.type === "ItemLevel")?.value || 0;

    document.title = `${profile.characterName || copy.heading} · NotMeter`;
    content.replaceChildren();
    content.append(
      renderHero(profile, itemLevel, visibleData?.equipment?.petwing || {}, info.title || {},
        visibleData?.fetchedAt, visibleData?.complete !== false),
      renderSectionNav(),
      renderCharacterRankings(data),
      renderEquipment(regularEquipment, itemDetails, data, loadoutView.type),
      renderSkills(visibleData?.equipment?.skill?.skillList || []),
      renderStats(statList),
      renderArcana(arcana, itemDetails),
      textNode("p", copy.officialNote, "character-data-note"),
    );
  }

  function resolveLoadoutView(data) {
    const currentType = normalizeLoadoutType(data?.currentLoadoutType);
    const loadouts = data?.loadouts && typeof data.loadouts === "object" ? data.loadouts : {};
    let selectedType = normalizeLoadoutType(state.activeLoadout);
    if (!selectedType || (selectedType !== currentType && !loadouts[selectedType])) {
      selectedType = currentType;
    }
    state.activeLoadout = selectedType;

    const snapshot = selectedType && selectedType !== currentType ? loadouts[selectedType] : null;
    if (!snapshot) return { type: selectedType, data };

    const rootInfo = data?.info || {};
    return {
      type: selectedType,
      data: {
        ...data,
        fetchedAt: snapshot.capturedAt || data?.fetchedAt,
        info: {
          ...rootInfo,
          profile: snapshot.profile || rootInfo.profile || {},
          stat: snapshot.stat || rootInfo.stat || {},
        },
        equipment: snapshot.equipment || {},
        itemDetails: snapshot.itemDetails || {},
        complete: true,
      },
    };
  }

  function normalizeLoadoutType(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return normalized === "PVE" || normalized === "PVP" ? normalized : null;
  }

  function renderCompactLoadoutSelector(data, selectedType) {
    const copy = currentCopy();
    const currentType = normalizeLoadoutType(data?.currentLoadoutType);
    const loadouts = data?.loadouts && typeof data.loadouts === "object" ? data.loadouts : {};
    const selector = node("div", "equipment-loadout-tabs");
    selector.setAttribute("aria-label", copy.loadoutTitle);
    for (const type of ["PVE", "PVP"]) {
      const available = type === currentType || Boolean(loadouts[type]);
      const button = node("button", `equipment-loadout-tab loadout-${type.toLowerCase()}`);
      button.type = "button";
      button.disabled = !available;
      button.textContent = type === "PVE" ? copy.pveLoadout : copy.pvpLoadout;
      button.setAttribute("aria-pressed", String(type === selectedType));
      if (type === selectedType) button.classList.add("selected");
      if (type === currentType) button.dataset.current = "true";
      if (!available) button.title = copy.unavailableLoadout;
      if (available) button.addEventListener("click", () => switchEquipmentLoadout(type));
      selector.append(button);
    }
    return selector;
  }

  function switchEquipmentLoadout(type) {
    const scrollTop = window.scrollY;
    state.activeLoadout = type;
    renderProfile(state.profile);
    window.requestAnimationFrame(() => window.scrollTo(0, scrollTop));
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
      [copy.server, localizeOfficialText(profile.serverName)],
      [copy.legion, profile.regionName || copy.none], [copy.level, profile.characterLevel],
    ]) {
      const item = node("span");
      item.append(document.createTextNode(`${label} `), textNode("b", String(value || "—")));
      meta.append(item);
    }
    copyBox.append(nameRow, meta);
    const equippedItems = [
      [copy.mount, localizeOfficialText(petwing?.pet?.name) || copy.none,
        petwing?.pet?.level ? `Lv.${petwing.pet.level}` : "", ""],
      [copy.wing, localizeOfficialText(petwing?.wing?.name) || copy.none,
        petwing?.wing?.enchantLevel ? `+${petwing.wing.enchantLevel}` : "", ""],
    ];
    const titleOrder = { Attack: 0, Defense: 1, Etc: 2 };
    const equippedTitles = (Array.isArray(titles?.titleList) ? titles.titleList.slice() : [])
      .sort((left, right) => (titleOrder[left.equipCategory] ?? 9) - (titleOrder[right.equipCategory] ?? 9));
    for (const title of equippedTitles) {
      const options = (Array.isArray(title.equipStatList) ? title.equipStatList : [])
        .map(item => localizeOfficialText(item.desc)).filter(Boolean).join(" · ");
      equippedItems.push([
        `${copy.equipped} ${copy.title} · ${titleCategoryLabel(title.equipCategory)}`,
        localizeOfficialText(title.name) || copy.none,
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

  function renderCharacterRankings(data) {
    const copy = currentCopy();
    const section = createSection(
      "character-rankings", copy.rankingEyebrow, copy.rankingTitle, copy.rankingNote);
    const body = node("div", "character-ranking-body");
    const rankingKey = rankingProfileKey(data);
    if (state.rankingKey !== rankingKey) {
      state.rankingKey = rankingKey;
      state.rankingStatus = "idle";
      state.rankingRows = [];
      state.rankingLoad = null;
    }
    body.dataset.rankingKey = rankingKey;
    renderCharacterRankingBody(body);
    section.append(body);

    if (state.rankingStatus === "idle") startCharacterRankingLoad(data, rankingKey);
    return section;
  }

  function rankingProfileKey(data) {
    const profile = data?.info?.profile || {};
    const params = new URLSearchParams(window.location.search);
    return [
      state.locale,
      currentOfficialRegion(params),
      Number(profile?.serverId) || Number(params.get("serverId")) || 0,
      String(profile?.characterId || params.get("characterId") || profile?.characterName || "").trim(),
      canonicalJobName(profile?.className),
      resolvePveCombatPower(data),
    ].join("|");
  }

  function startCharacterRankingLoad(data, rankingKey) {
    state.rankingStatus = "loading";
    const load = loadCharacterRankings(data);
    state.rankingLoad = load;
    void load.then(rows => {
      if (state.rankingKey !== rankingKey || state.rankingLoad !== load) return;
      state.rankingRows = rows;
      state.rankingStatus = "ready";
      refreshCharacterRankingBody(rankingKey);
    }).catch(() => {
      if (state.rankingKey !== rankingKey || state.rankingLoad !== load) return;
      state.rankingRows = [];
      state.rankingStatus = "error";
      refreshCharacterRankingBody(rankingKey);
    });
  }

  function refreshCharacterRankingBody(rankingKey) {
    const body = document.querySelector("#character-rankings .character-ranking-body");
    if (!body || body.dataset.rankingKey !== rankingKey) return;
    renderCharacterRankingBody(body);
  }

  function renderCharacterRankingBody(body) {
    const copy = currentCopy();
    if (state.rankingStatus === "idle" || state.rankingStatus === "loading") {
      body.replaceChildren(textNode("p", copy.rankingLoading, "character-ranking-state"));
      return;
    }
    if (state.rankingStatus === "error") {
      body.replaceChildren(textNode("p", copy.rankingError, "character-ranking-state"));
      return;
    }
    if (!state.rankingRows.length) {
      body.replaceChildren(textNode("p", copy.rankingEmpty, "character-ranking-state"));
      return;
    }
    const periods = [
      ["allTime", copy.rankingAllTime],
      ["weekly", copy.rankingWeekly],
    ];
    const groups = node("div", "character-ranking-periods");
    for (const [periodKey, periodLabel] of periods) {
      const periodRows = state.rankingRows.filter(row => row.periodKey === periodKey);
      if (!periodRows.length) continue;
      const period = node("section", `character-ranking-period character-ranking-period-${periodKey}`);
      const heading = node("div", "character-ranking-period-heading");
      heading.append(
        textNode("strong", periodLabel),
        textNode(
          "span",
          `${periodRows.length}${state.locale === "ko" ? "개" : state.locale === "zh-TW" ? "筆" : ""}`,
        ),
      );
      const scroll = node("div", "character-ranking-scroll");
      const table = node("div", "character-ranking-table");
      const header = node("div", "character-ranking-row character-ranking-header");
      for (const label of [copy.rank, copy.dungeon, copy.boss, copy.dps]) {
        header.append(textNode("span", label));
      }
      table.append(header);
      for (const row of periodRows) {
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
      scroll.append(table);
      period.append(heading, scroll);
      groups.append(period);
    }
    body.replaceChildren(groups);
  }

  function resolvePveCombatPower(data) {
    const currentType = normalizeLoadoutType(data?.currentLoadoutType);
    if (currentType === "PVE") {
      return Math.max(0, Math.trunc(number(data?.info?.profile?.combatPower)));
    }
    return Math.max(0, Math.trunc(number(data?.loadouts?.PVE?.profile?.combatPower)));
  }

  async function loadCharacterRankings(data) {
    const pveCombatPower = resolvePveCombatPower(data);
    const profile = data?.info?.profile || {};
    const params = new URLSearchParams(window.location.search);
    const characterName = String(profile?.characterName || params.get("name") || "").trim();
    const queryServerId = Number(params.get("serverId"));
    const serverId = Number(profile?.serverId) || queryServerId;
    const jobName = canonicalJobName(profile?.className);
    if (!characterName || !serverId || !jobName || !pveCombatPower) return [];

    const query = new URLSearchParams({
      name: characterName,
      serverId: String(serverId),
      job: jobName,
      combatPower: String(pveCombatPower),
    });
    const characterId = String(profile?.characterId || params.get("characterId") || "").trim();
    if (characterId) query.set("characterId", characterId);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    let response;
    try {
      response = await fetch(`${CHARACTER_RANKING_API_ROOT}?${query}`, {
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeout);
    }
    if (!response.ok) throw new Error(`character ranking ${response.status}`);
    const payload = await response.json();
    const results = (Array.isArray(payload?.rows) ? payload.rows : []).map(row => ({
      rank: Number(row?.rank),
      dps: number(row?.dps),
      dungeonKey: String(row?.dungeonKey || ""),
      dungeonName: localizeGameName(row?.dungeonName || row?.dungeonKey || "—"),
      bossName: cleanBossName(localizeGameName(row?.bossName || "—", "mob")),
      cpTierLabel: String(row?.cpTierLabel || ""),
      dungeonOrder: Number(row?.dungeonIndex) || 0,
      bossIndex: Number(row?.bossIndex) || 0,
      periodKey: row?.periodKey === "weekly" ? "weekly" : "allTime",
    })).filter(row => row.rank >= 1 && row.rank <= 20 && row.dps > 0 && row.dungeonKey);
    const bestByPeriodAndDungeon = new Map();
    for (const row of results) {
      const key = `${row.periodKey}|${row.dungeonKey}`;
      const current = bestByPeriodAndDungeon.get(key);
      if (!current || row.dps > current.dps || (row.dps === current.dps && row.rank < current.rank)) {
        bestByPeriodAndDungeon.set(key, row);
      }
    }
    return [...bestByPeriodAndDungeon.values()].sort((left, right) =>
      (left.periodKey === right.periodKey ? 0 : left.periodKey === "allTime" ? -1 : 1) ||
      left.dungeonOrder - right.dungeonOrder || right.dps - left.dps);
  }

  function cleanBossName(value) {
    return String(value || "—")
      .replace(/^\s*\d+\s*(?:네임드|보스|首領|Boss)\s*(?:[·:：-]\s*)?/i, "")
      .trim() || "—";
  }

  function renderStats(statList) {
    const copy = currentCopy();
    const section = createSection("character-stats", "ALL STATS", copy.stats, copy.statsDescription);
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
    if (descriptions.length) item.title = descriptions.map(localizeOfficialText).join(" · ");
    const sigil = node("span", `character-stat-sigil stat-sigil-${stat.type}`);
    sigil.setAttribute("aria-hidden", "true");
    item.append(sigil);
    const copy = node("span", "character-orbit-copy");
    copy.append(textNode("b", localizeOfficialText(String(stat.name || "—").replace(/\[[^\]]+\]$/, ""))),
      textNode("strong", formatNumber(stat.value)));
    item.append(copy);
    return item;
  }

  function renderEquipment(items, details, loadoutData, selectedLoadoutType) {
    const copy = currentCopy();
    const section = createSection("character-equipment", "EQUIPMENT LOADOUT", copy.equipment, copy.equipmentNote,
      formatCopy("itemCount", { value: items.length }));
    const sorted = items.slice().sort((a, b) => Number(a.slotPos) - Number(b.slotPos));
    const gear = sorted.filter(item => !ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)));
    const accessories = sorted.filter(item => ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)))
      .sort((a, b) => equipmentDetailPriority(b, details) - equipmentDetailPriority(a, details) ||
        Number(a.slotPos) - Number(b.slotPos));
    const tabs = node("div", "equipment-tabs");
    tabs.setAttribute("role", "tablist");
    const stickyControls = node("div", "equipment-sticky-controls");
    const panels = node("div", "equipment-tab-panels");
    const groups = [
      ["gear", copy.gearTab, gear],
      ["accessories", copy.accessoryTab, accessories],
    ];
    const selectedEquipmentTab = groups.some(([key]) => key === state.activeEquipmentTab)
      ? state.activeEquipmentTab : "gear";
    for (const [index, [key, label, groupItems]] of groups.entries()) {
      const selected = key === selectedEquipmentTab;
      const button = node("button", "equipment-tab");
      button.type = "button";
      button.dataset.equipmentTab = key;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(selected));
      button.append(textNode("span", label), textNode("strong", String(groupItems.length)));
      const list = node("div", "equipment-list");
      list.dataset.equipmentPanel = key;
      list.setAttribute("role", "tabpanel");
      list.hidden = !selected;
      for (const item of groupItems) list.append(renderEquipmentCard(item, details[String(item.slotPos)] || {}));
      button.addEventListener("click", () => {
        state.activeEquipmentTab = key;
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
    const sectionHead = section.querySelector(".character-section-head");
    const headActions = node("div", "character-section-actions");
    const itemCount = sectionHead?.querySelector(".character-section-count");
    if (itemCount) headActions.append(itemCount);
    const snapshotStatus = node("span", "equipment-snapshot-status");
    snapshotStatus.setAttribute("role", "status");
    snapshotStatus.setAttribute("aria-live", "polite");
    const snapshotButton = node("button", "equipment-snapshot-button");
    snapshotButton.type = "button";
    const snapshotIcon = node("span", "equipment-snapshot-button-icon");
    snapshotIcon.setAttribute("aria-hidden", "true");
    snapshotButton.append(snapshotIcon, textNode("span", copy.equipmentSnapshot));
    const currentType = normalizeLoadoutType(loadoutData?.currentLoadoutType);
    const waitingForDetails = selectedLoadoutType === currentType && loadoutData?.complete === false;
    snapshotButton.disabled = waitingForDetails;
    if (waitingForDetails) snapshotButton.title = copy.equipmentSnapshotWaiting;
    snapshotButton.addEventListener("click", () => void copyEquipmentSnapshot(snapshotButton, snapshotStatus));
    headActions.append(snapshotStatus, snapshotButton);
    sectionHead?.append(headActions);
    stickyControls.append(renderCompactLoadoutSelector(loadoutData, selectedLoadoutType), tabs);
    section.append(stickyControls,
      renderSoulSkillSummary(items, details), renderMagicStoneSummary(items, details), panels);
    return section;
  }

  function renderSoulSkillSummary(items, details) {
    const copy = currentCopy();
    const rows = collectSoulSkillTotals(items, details);
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
    const rows = collectMagicStoneTotals(items, details);
    const grid = node("div", "equipment-stone-summary-grid");
    for (const row of rows) {
      const item = node("div", `equipment-stone-summary-item${row.isAmplification ? " amplification" : ""}`);
      item.append(
        textNode("span", row.name),
        textNode("strong", row.valueText),
        textNode("small", row.detailText),
      );
      grid.append(item);
    }
    if (!rows.length) grid.append(textNode("span", copy.emptyOption, "empty-detail"));
    summary.append(heading, grid);
    return summary;
  }

  function collectSoulSkillTotals(items, details) {
    const totals = new Map();
    for (const item of items) {
      const detail = details[String(item.slotPos)] || {};
      for (const skill of Array.isArray(detail.subSkills) ? detail.subSkills : []) {
        const name = localizeOfficialText(skill?.name);
        if (!name) continue;
        const key = String(skill.id || name);
        const current = totals.get(key) || { name, icon: skill.icon || "", level: 0, count: 0 };
        current.level += number(skill.level);
        current.count += 1;
        if (!current.icon && skill.icon) current.icon = skill.icon;
        totals.set(key, current);
      }
    }
    return [...totals.values()].sort((left, right) =>
      right.level - left.level || left.name.localeCompare(right.name, "ko"));
  }

  function collectMagicStoneTotals(items, details) {
    const totals = new Map();
    for (const item of items) {
      const detail = details[String(item.slotPos)] || {};
      for (const stone of Array.isArray(detail.magicStoneStat) ? detail.magicStoneStat : []) {
        const name = localizeOfficialText(stone?.name);
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
    return [...totals.values()].sort((left, right) => {
      const priority = stoneEffectPriority(left) - stoneEffectPriority(right);
      if (priority) return priority;
      if (stoneEffectPriority(left) === 0) {
        const leftPercent = left.unit === "%" ? left.value : left.value / 100;
        const rightPercent = right.unit === "%" ? right.value : right.value / 100;
        if (leftPercent !== rightPercent) return rightPercent - leftPercent;
      }
      return left.name.localeCompare(right.name, "ko");
    })
      .map(row => {
        const isAmplification = stoneEffectPriority(row) === 0;
        const shouldConvert = isAmplification && row.unit !== "%";
        const displayedValue = shouldConvert ? row.value / 100 : row.value;
        const value = Number.isInteger(displayedValue)
          ? String(displayedValue)
          : displayedValue.toFixed(2).replace(/\.?0+$/, "");
        return {
          ...row,
          isAmplification,
          valueText: `+${value}${shouldConvert ? "%" : row.unit}`,
          detailText: shouldConvert
            ? formatCopy("stoneOriginal", { count: row.count, value: row.value })
            : formatCopy("stoneCount", { count: row.count }),
        };
      });
  }

  async function copyEquipmentSnapshot(button, status) {
    const copy = currentCopy();
    const originalLabel = copy.equipmentSnapshot;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    const label = button.querySelector("span:last-child");
    if (label) label.textContent = copy.equipmentSnapshotBusy;
    status.textContent = "";
    status.className = "equipment-snapshot-status";

    let blobPromise;
    try {
      if (!globalThis.NotMeterEquipmentSnapshot?.createBlob) throw new Error("Snapshot renderer unavailable");
      blobPromise = globalThis.NotMeterEquipmentSnapshot.createBlob(buildEquipmentSnapshotModel());
      if (!navigator.clipboard?.write || typeof globalThis.ClipboardItem !== "function") {
        throw new Error("Image clipboard unavailable");
      }
      await navigator.clipboard.write([
        new globalThis.ClipboardItem({ "image/png": blobPromise }),
      ]);
      showEquipmentSnapshotStatus(status, copy.equipmentSnapshotCopied, "success");
    } catch {
      try {
        const blob = await (blobPromise || globalThis.NotMeterEquipmentSnapshot.createBlob(buildEquipmentSnapshotModel()));
        downloadEquipmentSnapshot(blob);
        showEquipmentSnapshotStatus(status, copy.equipmentSnapshotDownloaded, "fallback");
      } catch {
        showEquipmentSnapshotStatus(status, copy.equipmentSnapshotFailed, "error");
      }
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      if (label) label.textContent = originalLabel;
    }
  }

  function buildEquipmentSnapshotModel() {
    const copy = currentCopy();
    const loadoutView = resolveLoadoutView(state.profile);
    const visibleData = loadoutView.data;
    const info = visibleData?.info || {};
    const profile = info.profile || {};
    const statList = Array.isArray(info.stat?.statList) ? info.stat.statList : [];
    const itemLevel = statList.find(item => item.type === "ItemLevel")?.value || 0;
    const allEquipment = Array.isArray(visibleData?.equipment?.equipment?.equipmentList)
      ? visibleData.equipment.equipment.equipmentList : [];
    const items = allEquipment.filter(item => !String(item.slotPosName).startsWith("Arcana"))
      .sort((left, right) => Number(left.slotPos) - Number(right.slotPos));
    const details = visibleData?.itemDetails || {};
    const gear = items.filter(item => !ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)));
    const accessories = items.filter(item => ACCESSORY_SLOT_TYPES.has(String(item.slotPosName)))
      .sort((left, right) => equipmentDetailPriority(right, details) - equipmentDetailPriority(left, details) ||
        Number(left.slotPos) - Number(right.slotPos));
    const loadoutType = loadoutView.type || copy.currentLoadout;
    return {
      locale: state.locale,
      brandIcon: safeImageUrl("./assets/notmeter-icon.png"),
      jobIcon: safeImageUrl(jobIcon(profile.className)),
      characterName: profile.characterName || "—",
      serverName: localizeOfficialText(profile.serverName) || "—",
      className: localizeOfficialText(profile.className) || "—",
      combatPowerText: `${formatNumber(profile.combatPower)} CP`,
      itemLevelText: formatNumber(itemLevel),
      loadoutType,
      updatedAtText: `${copy.updatedAt} ${formatDateTime(visibleData?.fetchedAt)}`,
      soulSkills: collectSoulSkillTotals(items, details).map(row => ({
        ...row,
        icon: safeImageUrl(row.icon),
        valueText: copy.soulSkillLevel.replace("{value}", row.level),
      })),
      stones: collectMagicStoneTotals(items, details).map(row => ({
        ...row,
        highlight: row.isAmplification,
      })),
      gear: gear.map(item => buildEquipmentSnapshotItem(item, details[String(item.slotPos)] || {})),
      accessories: accessories.map(item => buildEquipmentSnapshotItem(item, details[String(item.slotPos)] || {})),
      labels: {
        snapshotKicker: copy.snapshotKicker,
        combatPower: copy.combatPower,
        itemLevel: copy.itemLevel,
        soulSkills: copy.snapshotSoulSkills,
        soulSkillsNote: copy.snapshotSoulSkillsNote,
        manastoneTotals: copy.snapshotManastones,
        manastoneTotalsNote: copy.snapshotManastonesNote,
        gear: copy.gearTab,
        accessories: copy.accessoryTab,
        itemSoul: copy.snapshotItemSoul,
        itemStones: copy.snapshotItemStones,
        itemCount: copy.itemCount,
        none: copy.none,
        footer: copy.snapshotFooter.replace("{loadout}", loadoutType),
      },
    };
  }

  function buildEquipmentSnapshotItem(item, detail) {
    const soulSkills = (Array.isArray(detail?.subSkills) ? detail.subSkills : [])
      .map(skill => `${localizeOfficialText(skill.name) || "—"} +${number(skill.level)}`);
    const soulStats = (Array.isArray(detail?.subStats) ? detail.subStats : [])
      .map(statParts)
      .filter(stat => stat.name || stat.value)
      .map(stat => `${stat.name} ${stat.value}`.trim());
    const magicStones = (Array.isArray(detail?.magicStoneStat) ? detail.magicStoneStat : [])
      .map((stone, index) => equipmentSnapshotStone(stone, index))
      .sort((left, right) => left.priority - right.priority ||
        (left.priority === 0 ? right.percentValue - left.percentValue : 0) ||
        left.index - right.index)
      .map(stone => stone.text);
    const godStones = (Array.isArray(detail?.godStoneStat) ? detail.godStoneStat : [])
      .map(stone => `${localizeOfficialText(stone.name) || "—"} ${String(stone.value || "")}`.trim());
    const slotDetails = [equipmentSnapshotSlotLabel(item.slotPosName)];
    if (number(item.exceedLevel)) slotDetails.push(formatCopy("exceedStage", { value: number(item.exceedLevel) }));
    return {
      name: localizeOfficialText(item.name) || "—",
      icon: safeImageUrl(item.icon),
      grade: String(item.grade || "Common"),
      enhanceText: `+${number(item.enchantLevel)}`,
      slotName: slotDetails.filter(Boolean).join(" · "),
      soulText: [...soulSkills, ...soulStats].join(" · "),
      stoneText: [...magicStones, ...godStones].join(" · "),
    };
  }

  function equipmentSnapshotStone(stone, index) {
    const name = localizeOfficialText(stone?.name) || "—";
    const rawValue = String(stone?.value || "").replace(/,/g, "").trim();
    const match = rawValue.match(/[+-]?\d+(?:\.\d+)?/);
    const priority = stoneEffectPriority({ name });
    let valueText = rawValue;
    let percentValue = 0;
    if (match) {
      const numericValue = Number(match[0]);
      percentValue = rawValue.includes("%") ? numericValue : numericValue / 100;
      if (priority === 0 && !rawValue.includes("%")) {
        const converted = Number.isInteger(percentValue)
          ? String(percentValue)
          : percentValue.toFixed(2).replace(/\.?0+$/, "");
        valueText = `${percentValue > 0 ? "+" : ""}${converted}%`;
      }
    }
    return {
      index,
      priority,
      percentValue,
      text: `${name} ${valueText}`.trim(),
    };
  }

  function equipmentSnapshotSlotLabel(value) {
    const slot = String(value || "").trim();
    const labels = {
      ko: {
        MainHand: "주무기", SubHand: "보조무기", Helmet: "투구", Shoulder: "견갑",
        Torso: "상의", Pants: "하의", Gloves: "장갑", Boots: "장화", Cape: "망토",
        Pendant: "펜던트", Necklace: "목걸이", Earring1: "귀걸이 1", Earring2: "귀걸이 2",
        Ring1: "반지 1", Ring2: "반지 2", Bracelet1: "팔찌 1", Bracelet2: "팔찌 2",
        Belt: "허리띠", Brooch1: "브로치 1", Brooch2: "브로치 2", Amulet: "아뮬렛",
        Rune1: "룬 1", Rune2: "룬 2",
      },
      en: {
        MainHand: "Main hand", SubHand: "Off hand", Helmet: "Helmet", Shoulder: "Shoulders",
        Torso: "Chest", Pants: "Legs", Gloves: "Gloves", Boots: "Boots", Cape: "Cape",
        Pendant: "Pendant", Necklace: "Necklace", Earring1: "Earring 1", Earring2: "Earring 2",
        Ring1: "Ring 1", Ring2: "Ring 2", Bracelet1: "Bracelet 1", Bracelet2: "Bracelet 2",
        Belt: "Belt", Brooch1: "Brooch 1", Brooch2: "Brooch 2", Amulet: "Amulet",
        Rune1: "Rune 1", Rune2: "Rune 2",
      },
      "zh-TW": {
        MainHand: "主手武器", SubHand: "副手武器", Helmet: "頭盔", Shoulder: "護肩",
        Torso: "上衣", Pants: "下衣", Gloves: "手套", Boots: "鞋子", Cape: "披風",
        Pendant: "墜飾", Necklace: "項鍊", Earring1: "耳環 1", Earring2: "耳環 2",
        Ring1: "戒指 1", Ring2: "戒指 2", Bracelet1: "手鐲 1", Bracelet2: "手鐲 2",
        Belt: "腰帶", Brooch1: "胸針 1", Brooch2: "胸針 2", Amulet: "護符",
        Rune1: "符文 1", Rune2: "符文 2",
      },
    };
    return labels[state.locale]?.[slot] || labels.ko[slot] ||
      slot.replace(/([a-z])([A-Z0-9])/g, "$1 $2");
  }

  function downloadEquipmentSnapshot(blob) {
    const profile = state.profile?.info?.profile || {};
    const fileName = `${String(profile.characterName || "NotMeter").replace(/[\\/:*?"<>|]/g, "-")}-장비-스냅샷.png`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function showEquipmentSnapshotStatus(status, message, kind) {
    status.textContent = message;
    status.className = `equipment-snapshot-status ${kind}`;
    window.setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = "";
        status.className = "equipment-snapshot-status";
      }
    }, 5000);
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
    const itemName = localizeOfficialText(item.name);
    icon.append(createImage(item.icon, itemName));
    const itemCopy = node("div", "equipment-copy");
    const title = node("div", "equipment-title");
    if (number(item.exceedLevel)) {
      const exceed = node("span", "equipment-exceed-mark");
      exceed.setAttribute("aria-label", formatCopy("exceedStage", { value: number(item.exceedLevel) }));
      exceed.append(textNode("span", String(number(item.exceedLevel))));
      title.append(exceed);
    }
    title.append(
      textNode("span", `+${number(item.enchantLevel)}`, "equipment-enhance-value"),
      textNode("strong", itemName || "—"),
    );
    const basicOptions = node("div", "equipment-identity-options");
    basicOptions.append(textNode("h6", copy.basicOptions));
    const basicList = node("ul");
    const optionLines = basicItemOptions(detail);
    if (!optionLines.length) basicList.append(textNode("li", copy.emptyOption, "empty-detail"));
    for (const line of optionLines.slice(0, 12)) basicList.append(textNode("li", line));
    basicOptions.append(basicList);
    itemCopy.append(title, basicOptions);
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
      option.append(textNode("span", localizeOfficialText(stat.name) || "—"),
        textNode("b", stat.value || "—"));
      list.append(option);
    }
    const skills = (Array.isArray(detail?.subSkills) ? detail.subSkills : [])
      .slice(0, Math.max(0, 12 - stats.length));
    for (const skill of skills) {
      const option = node("li", "equipment-skill-option");
      option.append(createImage(skill.icon, ""),
        textNode("span", localizeOfficialText(skill.name) || "—"),
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
      const stoneName = localizeOfficialText(stone.name);
      if (stone.icon) tile.append(createImage(stone.icon, stoneName));
      const stoneCopy = node("span");
      stoneCopy.append(textNode("b", stoneName || "—"));
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
      copy.arcanaDescription, formatCopy("itemCount", { value: items.length }));
    const grid = node("div", "character-arcana-grid");
    for (const item of items.slice().sort((a, b) => Number(a.slotPos) - Number(b.slotPos))) {
      const card = node("article", "character-arcana-card");
      const itemName = localizeOfficialText(item.name);
      card.append(createImage(item.icon, itemName));
      const body = node("div");
      const detail = details[String(item.slotPos)] || {};
      body.append(textNode("strong", `+${number(item.enchantLevel)} ${itemName || "—"}`));
      const options = node("ul", "arcana-option-list");
      for (const line of basicItemOptions(detail)) options.append(textNode("li", line));
      for (const skill of Array.isArray(detail.subSkills) ? detail.subSkills : []) {
        const option = node("li", "arcana-skill-option");
        option.append(createImage(skill.icon, ""), textNode("b", `+${number(skill.level)}`),
          textNode("span", localizeOfficialText(skill.name) || "—"));
        options.append(option);
      }
      if (!options.childElementCount) options.append(textNode("li", copy.emptyOption, "empty-detail"));
      card.append(body, options);
      grid.append(card);
    }
    if (!items.length) grid.append(textNode("div", copy.none, "character-search-empty"));
    section.append(renderArcanaSkillSummary(items, details), grid);
    return section;
  }

  function renderArcanaSkillSummary(items, details) {
    const copy = currentCopy();
    const totals = new Map();
    for (const item of items) {
      const detail = details[String(item.slotPos)] || {};
      for (const skill of Array.isArray(detail.subSkills) ? detail.subSkills : []) {
        const name = localizeOfficialText(skill?.name);
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
    const summary = node("section", "arcana-skill-summary");
    const heading = node("div", "equipment-summary-heading");
    heading.append(textNode("strong", copy.arcanaSkillTotal), textNode("span", copy.arcanaSkillTotalNote));
    const grid = node("div", "arcana-skill-summary-grid");
    for (const row of rows) {
      const item = node("div", "arcana-skill-summary-item");
      item.append(createImage(row.icon, ""));
      const identity = node("span");
      identity.append(textNode("strong", row.name),
        textNode("small", copy.arcanaCards.replace("{value}", row.count)));
      item.append(identity, textNode("b", copy.soulSkillLevel.replace("{value}", row.level)));
      grid.append(item);
    }
    if (!rows.length) grid.append(textNode("span", copy.emptyOption, "empty-detail"));
    summary.append(heading, grid);
    return summary;
  }

  function renderSkills(rawSkills) {
    const copy = currentCopy();
    const skills = Array.isArray(rawSkills) ? rawSkills.slice() : [];
    skills.sort((a, b) => Number(b.skillLevel) - Number(a.skillLevel) || String(a.name).localeCompare(String(b.name)));
    const section = createSection("character-skills", "SKILL LIBRARY", copy.skills,
      copy.skillsDescription, formatCopy("itemCount", { value: skills.length }));
    const groups = [
      ["active", copy.activeSkills, skills.filter(skill => !["dp", "passive"].includes(String(skill.category).toLowerCase()))],
      ["stigma", copy.stigmaSkills, skills.filter(skill => String(skill.category).toLowerCase() === "dp")],
      ["passive", copy.passiveSkills, skills.filter(skill => String(skill.category).toLowerCase() === "passive")],
    ];
    const groupsContainer = node("div", "skill-groups");
    groups.forEach(([, label, groupSkills]) => {
      const group = node("section", "skill-group");
      const heading = node("div", "skill-group-heading");
      heading.append(textNode("h5", label), textNode("span",
        formatCopy("itemCount", { value: groupSkills.length })));
      const grid = node("div", "character-skill-grid");
      for (const skill of groupSkills) {
        const card = node("article", "character-skill-card");
        const skillName = localizeOfficialText(skill.name);
        card.append(createImage(skill.icon, skillName));
        const body = node("div");
        body.append(textNode("strong", skillName || "—"),
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
    const name = localizeOfficialText(stat?.name);
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

  function searchSessionKey(name, region) {
    const normalizedName = String(name || "").trim().normalize("NFC").toLocaleLowerCase();
    return `notmeter-character-search-session-v1:${normalizeOfficialRegion(region)}:${officialLanguage()}:${normalizedName}`;
  }

  function profileSessionKey(region, serverId, characterId) {
    return `notmeter-character-profile-session-v1:${normalizeOfficialRegion(region)}:${officialLanguage()}:${Number(serverId) || 0}:${String(characterId || "")}`;
  }

  function readSessionPayload(key, ttlMs) {
    try {
      const entry = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!entry || !entry.savedAt || Date.now() - Number(entry.savedAt) > ttlMs) {
        sessionStorage.removeItem(key);
        return null;
      }
      return entry.payload || null;
    } catch {
      return null;
    }
  }

  function writeSessionPayload(key, payload) {
    if (!key || !payload) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), payload }));
    } catch {
      // A full or disabled session store must not block character lookup.
    }
  }

  function writeProfileSessionPayload(key, payload) {
    const existing = readSessionPayload(key, PROFILE_SESSION_TTL_MS);
    if (existing?.complete !== false && payload?.complete === false) return;
    writeSessionPayload(key, payload);
    try {
      const parsed = JSON.parse(sessionStorage.getItem(PROFILE_SESSION_INDEX_KEY) || "[]");
      const keys = Array.isArray(parsed) ? parsed.filter(item => item !== key) : [];
      keys.unshift(key);
      for (const staleKey of keys.slice(SESSION_PROFILE_LIMIT)) sessionStorage.removeItem(staleKey);
      sessionStorage.setItem(PROFILE_SESSION_INDEX_KEY, JSON.stringify(keys.slice(0, SESSION_PROFILE_LIMIT)));
    } catch {
      // The profile remains usable even when the optional session index cannot be saved.
    }
  }

  function profilePayloadSignature(data, fallbackCharacterId = "") {
    const profile = data?.info?.profile || {};
    const detailKeys = Object.keys(data?.itemDetails || {}).sort().join(",");
    const loadoutSignature = Object.entries(data?.loadouts || {})
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}:${value?.contentHash || value?.capturedAt || ""}`)
      .join(",");
    return [
      profile.characterId || fallbackCharacterId,
      data?.fetchedAt || "",
      data?.complete !== false ? "complete" : "partial",
      detailKeys,
      data?.currentLoadoutType || "",
      loadoutSignature,
    ].join("|");
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
    return `${normalizeOfficialRegion(item?.region)}:${Number(item?.serverId) || 0}:${String(item?.characterId || "")}`;
  }

  function savedCharacter(item) {
    return {
      characterId: String(item?.characterId || ""), name: String(item?.name || ""),
      serverId: Number(item?.serverId), serverName: String(item?.serverName || ""),
      className: String(item?.className || ""), raceName: String(item?.raceName || ""),
      level: number(item?.level), combatPower: number(item?.combatPower),
      profileImage: String(item?.profileImage || ""),
      region: normalizeOfficialRegion(item?.region),
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
  function officialLanguage() {
    if (state.locale === "zh-TW") return "zh";
    if (state.locale === "ko") return "ko";
    return currentOfficialRegion() === "tw" ? "zh" : "ko";
  }
  async function ensureOfficialNameCatalog() {
    if ((state.locale !== "ko" && state.locale !== "zh-TW") || state.officialNameCatalog) {
      return state.officialNameCatalog;
    }
    if (state.officialNameCatalogLoad) return state.officialNameCatalogLoad;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);
    state.officialNameCatalogLoad = fetch(OFFICIAL_NAME_CATALOG_URL, {
      cache: "force-cache",
      signal: controller.signal,
    }).then(response => {
      if (!response.ok) throw new Error(`Official name catalog HTTP ${response.status}`);
      return response.json();
    }).then(payload => {
      if (payload?.locale !== "zh-TW" || !payload.names || !payload.aliases) {
        throw new Error("Official name catalog format is invalid");
      }
      state.officialNameCatalog = payload;
      state.koreanNamesByTraditionalChinese = buildKoreanOfficialNameIndex(payload);
      return payload;
    }).catch(() => null).finally(() => {
      window.clearTimeout(timeoutId);
      state.officialNameCatalogLoad = null;
    });
    return state.officialNameCatalogLoad;
  }
  function buildKoreanOfficialNameIndex(payload) {
    const candidates = new Map();
    const add = (korean, traditionalChinese) => {
      const ko = normalizeOfficialName(korean);
      const zh = normalizeOfficialName(traditionalChinese);
      if (!ko || !zh) return;
      if (!candidates.has(zh)) candidates.set(zh, new Set());
      candidates.get(zh).add(ko);
    };
    for (const [korean, traditionalChinese] of Object.entries(payload?.names || {})) {
      add(korean, traditionalChinese);
    }
    const index = new Map([...candidates]
      .filter(([, koreanNames]) => koreanNames.size === 1)
      .map(([traditionalChinese, koreanNames]) => [traditionalChinese, [...koreanNames][0]]));
    for (const [korean, traditionalChinese] of Object.entries(payload?.aliases || {})) {
      index.set(normalizeOfficialName(traditionalChinese), normalizeOfficialName(korean));
    }
    for (const [korean, traditionalChinese] of Object.entries(OFFICIAL_TERMS_KO_TO_ZH_TW)) {
      index.set(normalizeOfficialName(traditionalChinese), normalizeOfficialName(korean));
    }
    return index;
  }
  function normalizeOfficialName(value) {
    return String(value || "").normalize("NFC").replace(/\s+/g, " ").trim();
  }
  function translateOfficialName(value) {
    const original = normalizeOfficialName(value);
    if (!original || state.locale === "en") return original;
    if (state.locale === "ko") {
      return state.koreanNamesByTraditionalChinese?.get(original) || original;
    }
    return String(OFFICIAL_TERMS_KO_TO_ZH_TW[original] ||
      state.officialNameCatalog?.aliases?.[original] ||
      state.officialNameCatalog?.names?.[original] ||
      original);
  }
  function localizeOfficialText(value) {
    const original = normalizeOfficialName(value);
    if (!original) return "";
    const direct = translateOfficialName(original);
    if (direct !== original) return direct;
    const match = original.match(/^(.+?)(\s+[+\-]?\d[\d,.]*(?:\.\d+)?%?(?:\s*\([^)]*\))?)$/u);
    if (!match) return original;
    const translatedPrefix = translateOfficialName(match[1]);
    return translatedPrefix === match[1] ? original : `${translatedPrefix}${match[2]}`;
  }
  function refreshLocalizedContent() {
    if (state.profile) renderProfile(state.profile);
    if (elements["character-search-popover"]?.hidden) return;
    if (elements["character-search-input"]?.value.trim() && state.searchResults.length) {
      renderSearchRows(state.searchResults, false);
    } else {
      renderRecent();
    }
  }
  function normalizeOfficialRegion(value) {
    return /^(tw|taiwan|zh-tw)$/i.test(String(value || "").trim()) ? "tw" : "kr";
  }
  function currentOfficialRegion(params = new URLSearchParams(window.location.search)) {
    return normalizeOfficialRegion(params.get("region"));
  }
  function searchOfficialRegion() { return state.locale === "zh-TW" ? "tw" : "kr"; }
  function readLocale() {
    try {
      const saved = localStorage.getItem("notmeter-stats-locale");
      if (COPY[saved]) return saved;
    } catch { /* ignored */ }
    const languages = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
    ].map(value => String(value || "").trim().toLowerCase()).filter(Boolean);
    for (const language of languages) {
      if (language.startsWith("zh-tw") || language.startsWith("zh-hant") ||
          language.startsWith("zh-hk") || language.startsWith("zh-mo") || language === "zh") return "zh-TW";
      if (language.startsWith("ko")) return "ko";
      if (language.startsWith("en")) return "en";
      if (language.startsWith("zh")) return "zh-TW";
    }
    return "en";
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
  function canonicalJobName(job) {
    const value = String(job || "").trim();
    const aliases = {
      "劍星": "검성", "殺星": "살성", "弓星": "궁성", "魔道星": "마도성",
      "精靈星": "정령성", "守護星": "수호성", "治癒星": "치유성",
      "護法星": "호법성", "拳星": "권성",
    };
    return aliases[value] || value;
  }
  function jobIcon(job) {
    const canonical = canonicalJobName(job);
    return canonical ? `./assets/jobs/${encodeURIComponent(canonical)}.png` : "./assets/notmeter-icon.png";
  }
  function formatCopy(key, values = {}) {
    let value = currentCopy()[key] || COPY.ko[key] || key;
    for (const [name, replacement] of Object.entries(values)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }
  function localizeGameName(value, type = "") {
    return globalThis.NotMeterStatsLocalization?.gameName?.(value, type) || String(value || "");
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(String(value || ""), window.location.href);
      if (url.origin === window.location.origin ||
          (url.protocol === "https:" && ["plaync.com", "playnccdn.com", "ncsoft.com"].some(domain =>
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
      const changed = state.locale !== locale;
      state.locale = locale;
      applyCopy();
      void ensureOfficialNameCatalog().then(refreshLocalizedContent);
      if (changed && isCharacterView() && state.profile) void loadProfile(true, false);
    },
  };
})();
