(() => {
  "use strict";

  const VPS_RANKING_CACHE_ROOT = "https://notmeter.112-168-140-142.sslip.io/ranking/v1";
  const GITHUB_RANKING_REPOSITORY_ROOT =
    "https://raw.githubusercontent.com/Not4You-Dev/NotMeter-Web";
  const SAME_ORIGIN_RANKING_CACHE_ROOT = "./data";
  const GITHUB_RANKING_MANIFEST_URLS = [
    `${SAME_ORIGIN_RANKING_CACHE_ROOT}/client/notmeter-ranking-latest.json`,
    `${GITHUB_RANKING_REPOSITORY_ROOT}/main/data/client/notmeter-ranking-latest.json`,
  ];
  const GITHUB_RANKING_RELEASE_ROOT =
    "https://github.com/Not4You-Dev/NotMeter-Web/releases/download";
  let GITHUB_RANKING_CACHE_ROOT = `${GITHUB_RANKING_REPOSITORY_ROOT}/main/data`;
  let githubRankingReleaseTag = "";
  let githubRankingReleaseGeneration = "";
  let githubRankingManifestPublishedAt = 0;
  let githubRankingManifestLoad = null;
  const CACHE_URLS = [
    `${SAME_ORIGIN_RANKING_CACHE_ROOT}/notmeter-ranking.json.gz`,
    `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking.json.gz`,
    `${VPS_RANKING_CACHE_ROOT}/web/main?layout=view-shards-v2`,
  ];
  const CLASS_OVERALL_CACHE_URLS = [
    `${SAME_ORIGIN_RANKING_CACHE_ROOT}/notmeter-ranking-class-overall.json.gz`,
    `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-class-overall.json.gz`,
    `${VPS_RANKING_CACHE_ROOT}/web/class-overall`,
  ];
  const CONTRIBUTION_CACHE_URLS = [
    `${SAME_ORIGIN_RANKING_CACHE_ROOT}/notmeter-setting-guide.json.gz`,
    `${GITHUB_RANKING_CACHE_ROOT}/notmeter-setting-guide.json.gz`,
    `${VPS_RANKING_CACHE_ROOT}/web/setup-guide`,
  ];
  const VPS_CLASS_RANKING_CACHE_ROOT = `${VPS_RANKING_CACHE_ROOT}/web/classes`;
  const VPS_VIEW_RANKING_CACHE_ROOT = `${VPS_RANKING_CACHE_ROOT}/web/views`;
  let GITHUB_CLASS_RANKING_CACHE_ROOT = `${GITHUB_RANKING_CACHE_ROOT}/classes`;
  let GITHUB_VIEW_RANKING_CACHE_ROOT = `${GITHUB_RANKING_CACHE_ROOT}/views`;
  const CUSTOM_CP_CACHE_URLS = [
    `${SAME_ORIGIN_RANKING_CACHE_ROOT}/notmeter-ranking-custom-cp.json.gz`,
    `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-custom-cp.json.gz`,
    `${VPS_RANKING_CACHE_ROOT}/custom-cp/summary`,
  ];
  const FIELD_BOSS_CACHE_URLS = [
    "https://raw.githubusercontent.com/Not4You-Dev/NotMeter-Web/main/presence/notmeter-field-boss-public.json",
    "https://notmeter.112-168-140-142.sslip.io/field-boss/v1/public",
  ];
  const EXPECTED_SCHEMA = "notmeter-web-ranking-v1";
  const EXPECTED_CLASS_RANKING_SCHEMA = "notmeter-web-class-ranking-v1";
  const EXPECTED_VIEW_RANKING_SCHEMA = "notmeter-web-view-ranking-v1";
  const EXPECTED_CLASS_OVERALL_SCHEMA = "notmeter-web-class-overall-v1";
  const EXPECTED_CONTRIBUTION_SCHEMA = "notmeter-setup-guide-v1";
  const EXPECTED_CUSTOM_CP_SCHEMA = "notmeter-web-custom-cp-v4";
  const EXPECTED_CUSTOM_CP_RANK_SCHEMA = "notmeter-web-custom-cp-rank-v1";
  const EXPECTED_CUSTOM_CP_RANK_CHUNK_SCHEMA = "notmeter-web-custom-cp-rank-chunk-v2";
  const DETAIL_SCHEMA = "notmeter-ranking-combat-detail-v1";
  const FIELD_BOSS_CACHE_SCHEMA = "notmeter-field-boss-public-cache-v1";
  const ZH_TW_GAME_DATA_URL = "./assets/game-data.zh-TW.json?v=20260824-1";
  const SUPPORTED_LOCALES = ["ko", "en", "zh-TW"];
  const DETAIL_ENDPOINTS = [
    `${VPS_RANKING_CACHE_ROOT}/details/`,
  ];
  const DETAIL_CACHE_NAME = "notmeter-ranking-details-v1";
  const DETAIL_MEMORY_LIMIT = 48;
  const DETAIL_REQUEST_TIMEOUT_MS = 12_000;
  const DETAIL_RETRY_DELAY_MS = 350;
  const CACHE_REQUEST_TIMEOUT_MS = 60_000;
  const CACHE_STREAM_IDLE_TIMEOUT_MS = 20_000;
  const CACHE_REQUEST_ATTEMPTS = 2;
  const CACHE_RETRY_DELAY_MS = 350;
  const CACHE_MAX_COMPRESSED_BYTES = 64 * 1024 * 1024;
  const CACHE_SYNC_INTERVAL_MS = 5 * 60 * 1000;
  const CACHE_SYNC_JITTER_MS = 3 * 60 * 1000;
  const CACHE_MAX_VISIBLE_AGE_MS = 24 * 60 * 60 * 1000;
  const CACHE_MANIFEST_DRIFT_ALLOWANCE_MS = 12 * 60 * 60 * 1000;
  const VPS_FALLBACK_MINIMUM_DELAY_MS = 5_000;
  const VPS_FALLBACK_MAXIMUM_DELAY_MS = 45_000;
  let vpsFallbackQueue = Promise.resolve();
  let vpsFallbackSpreadPromise = null;
  const CACHE_SYNC_THROTTLE_MS = 60 * 1000;
  const FIELD_BOSS_CACHE_SYNC_INTERVAL_MS = 10 * 60 * 1000;
  const FIELD_BOSS_CACHE_RESUME_THROTTLE_MS = 10 * 60 * 1000;
  const FIELD_BOSS_TARGET_HOLD_THRESHOLD_MS = 10 * 60 * 1000;
  const DAILY_USER_KEY = "__notmeter_daily_active_users__";
  const STANDARD_CP_TIER_LIMIT = 100;
  const PRESET_CP_TIER_MINIMUM = 400_000;
  const PRESET_CP_TIER_LAST_START = 1_200_000;
  const PRESET_CP_TIER_SIZE = 25_000;
  const INTERNAL_REPLAY_PERIOD_LABEL = "__notmeter_replay_top20_v1__";
  const WEEKLY_LABEL_PREFIX = "weekly-wed05|";
  const PERIODS = ["Weekly", "Today", "Recent14Days", "All"];
  const JOB_ORDER = ["검성", "수호성", "살성", "궁성", "마도성", "정령성", "치유성", "호법성", "권성"];
  const PERFORMANCE_JOB_COLORS = {
    "검성": "#69bcd0",
    "수호성": "#84aef0",
    "살성": "#9ccc63",
    "궁성": "#5dc79a",
    "마도성": "#b392e8",
    "정령성": "#d17acb",
    "치유성": "#e2c56d",
    "호법성": "#d9a95f",
    "권성": "#e48870",
  };
  const JOB_CODES = {
    "0": "검성",
    "1": "수호성",
    "2": "살성",
    "3": "궁성",
    "4": "마도성",
    "5": "정령성",
    "6": "치유성",
    "7": "호법성",
    "8": "권성",
  };
  const JOB_NAMES_EN = {
    "검성": "Gladiator",
    "수호성": "Templar",
    "살성": "Assassin",
    "궁성": "Ranger",
    "마도성": "Sorcerer",
    "정령성": "Spiritmaster",
    "치유성": "Cleric",
    "호법성": "Chanter",
    "권성": "Brawler",
  };
  const DUNGEON_NAMES_EN = {
    "deus-research-hard": "Corrupted Deus Research Base (Hard)",
    "noiran-legacy-4": "Noiran's Hidden Legacy (Stage 4)",
    "training-dummy-60s": "Training Dummy (1 min)",
    "bakron-trial": "Trial: Bakron's Sky Island",
    "musphel-hard": "Musphel's Grail (Hard)",
    "fallen-deva-hard": "Fallen Daeva's Castle (Hard)",
    "abyss-horn-4": "Abyssal Horn Cavern (Stage 4)",
    "nightmare-atheron-10": "Nightmare: Awakened Atheron (Stage 10)",
  };
  const DUNGEON_NAMES_ZH_TW = {
    "deus-research-hard": "受侵蝕的德烏斯研究基地（困難）",
    "noiran-legacy-4": "諾伊蘭的隱藏遺產（第4階段）",
    "training-dummy-60s": "訓練用稻草人（1分鐘）",
    "bakron-trial": "試煉：巴克隆空中島",
    "musphel-hard": "穆斯費爾聖杯（困難）",
    "fallen-deva-hard": "墮落守護者之城（困難）",
    "abyss-horn-4": "深淵角岩窟（第4階段）",
    "nightmare-atheron-10": "惡夢：覺醒阿特隆（第10階段）",
  };
  const GAME_NAME_OVERRIDES_ZH_TW = {
    "각성한 아테론 10단계": "覺醒阿特隆 第10階段",
    "훈련용 허수아비 (1분)": "訓練用稻草人（1分鐘）",
    "훈련용 허수아비(1분)": "訓練用稻草人（1分鐘）",
  };
  const FEATURED_DUNGEON_KEYS = ["deus-research-hard", "noiran-legacy-4"];
  // Resolve display order by name so both old and current cache arrays remain compatible.
  const BOSS_PRESENTATION_NAMES = Object.freeze({
    "deus-research-hard": ["감독관 그롬카스", "연구소장 자일러스", "오만의 아티엘"],
    "noiran-legacy-4": ["불완전한 브라운트", "광기의 클로민스터", "아스크란"],
  });
  const DUNGEON_BUTTON_COLLAPSED_LIMIT = 6;
  const SERVER_NAMES_ELYOS = [
    "시엘", "네자칸", "바이젤", "카이시넬", "유스티엘", "아리엘", "프레기온", "메스람타에다",
    "히타니에", "나니아", "타하바타", "루터스", "페르노스", "다미누", "카사카", "바카르마",
    "챈가룽", "코치룽", "이슈타르", "티아마트", "포에타", "베르테론", "나트하라", "탈리스라",
    "주미온", "나히드", "아사르", "칼리드", "라세이스", "페리온", "드라마타", "레다", "아울도르",
    "바크론", "나룬", "가르투아", "클로리스", "이오네", "테이나", "디모네스", "바고트", "아테론",
    "루틸리스", "실리아토르", "이드리스", "사티아", "에스티안", "라후", "라누만", "히브란",
    "우라훔", "라크슈미", "타몬", "티에", "두두리", "데르코스", "둔둔몽", "홀리아울",
  ];
  const SERVER_NAMES_ASMODIAN = [
    "이스라펠", "지켈", "트리니엘", "루미엘", "마르쿠탄", "아스펠", "에레슈키갈", "브리트라",
    "네몬", "하달", "루드라", "울고른", "무닌", "오다르", "젠카카", "크로메데", "콰이링",
    "바바룽", "파프니르", "인드나흐", "이스할겐", "알트가르드", "아그니타", "아티엘", "발데마르",
    "라그타", "게로드", "우르드", "에코", "지젤", "카샤파", "스토프", "베르크", "누아쿰",
    "그리실라", "산트라스", "루벤", "휴고", "크라키", "히스탄", "라트만", "시게베르트",
    "나즈문", "겔코스", "파톤", "펠레이르", "엘비다", "케투", "파이디온", "노툰", "무르트",
    "로탄", "쿠하푸", "두안카", "브로크", "왈터", "푸라킨", "이그누스",
  ];
  const SERVER_SHORT_NAMES = Object.freeze({
    "이스라펠": "이스",
    "이스할겐": "할겐",
  });
  const ARCANA_SLOT_LABEL_KEYS = Object.freeze({
    1: "setupGuideArcanaChalice", 2: "setupGuideArcanaParchment",
    3: "setupGuideArcanaCompass", 4: "setupGuideArcanaBell",
    5: "setupGuideArcanaMirror", 6: "setupGuideArcanaScales",
    7: "setupGuideArcanaKey", 8: "setupGuideArcanaHourglass",
    9: "setupGuideArcanaDice", 10: "setupGuideArcanaLantern",
  });
  const FIELD_BOSS_REGIONS = Array.isArray(globalThis.NotMeterFieldBossCatalog)
    ? globalThis.NotMeterFieldBossCatalog
    : [];
  const FIELD_BOSS_KIBELISKS = globalThis.NotMeterFieldBossKibeliskCatalog || {};
  const DETAIL_METRICS = [
    ["specialization", "specialization"],
    ["hits", "hits"],
    ["parry", "parry"],
    ["avoidance", "avoidanceBlock"],
    ["multiHit", "multiHit"],
    ["critical", "critical"],
    ["front", "front"],
    ["back", "back"],
    ["perfect", "perfect"],
    ["double", "doubleDamage"],
    ["periodic", "periodicDamage"],
    ["healing", "healing"],
    ["drainHealing", "drainHealing"],
    ["averageDamage", "averageDamage"],
    ["maximumDamage", "maximumDamage"],
  ];
  const DETAIL_METRICS_MAXIMUM_DAMAGE_MIGRATION_KEY =
    "notmeter-detail-metrics-maximum-damage-v1";
  const POTION_CODES = new Set([2011101, 2011102, 2010102, 2020101, 2020102, 2010106, 2010103]);

  const COPY = {
    ko: {
      title: "NotMeter 던전 통계",
      subtitle: "직업별 상위 25% DPS 기준으로 정렬합니다",
      characterPageTitle: "NotMeter 캐릭터 검색",
      characterPageSubtitle: "장비 · 영혼 각인 · 마석 · 스킬을 한눈에 확인합니다",
      dailyUsers: "일일 사용자",
      classPerformance: "직업 성능",
      newFeature: "새로 추가된 기능",
      contributionStats: "세팅 가이드",
      contributionPageTitle: "NotMeter 직업별 세팅 가이드",
      contributionPageSubtitle: "전체 기간 상위 랭커의 실제 PVE 세팅 통계",
      contributionStatsTitle: "직업별 세팅 가이드",
      contributionStatsDescription: "상위 랭커의 마석·영석·영혼 각인·아르카나·스킬 선택을 한눈에 확인하세요.",
      contributionPeriod: "캐시 갱신", contributionRecords: "확보 표본",
      contributionSamples: "확인한 후보", contributionLowSamples: "표본 신뢰도",
      contributionDungeonAria: "세팅 가이드 직업 선택",
      contributionLoading: "상위 랭커의 PVE 세팅을 불러오는 중입니다",
      contributionLoadError: "세팅 가이드 캐시를 불러오지 못했습니다",
      contributionEmpty: "아직 확인 가능한 PVE 세팅 표본이 없습니다",
      contributionSortGuide: "사용률이 높은 순서로 표시",
      contributionMethodTitle: "세팅 가이드는 어떻게 만들었나요?",
      contributionMethodScopeTitle: "상위 랭커 기준",
      contributionMethodScopeText: "직업별 전체 기간 랭킹을 1위부터 확인해 최신 PVE 세팅이 있는 캐릭터 20명을 채웁니다.",
      contributionMethodFormulaTitle: "누락 자동 보충",
      contributionMethodFormulaText: "캐릭터 정보나 PVE 스냅샷이 없으면 다음 순위로 내려가며 유효한 20명을 확보합니다.",
      contributionMethodSampleTitle: "한 캐릭터 한 표",
      contributionMethodSampleText: "같은 캐릭터는 한 번만 반영하여 검색 횟수나 기록 수가 많은 캐릭터가 통계를 독점하지 않습니다.",
      contributionMethodTrustTitle: "6시간마다 갱신",
      contributionMethodTrustText: "최근 30일 안에 확인된 PVE 세팅만 사용하며, 표본 수와 사용률을 함께 보여줍니다.",
      contributionCaution: "실전 상위 랭커의 선택을 정리한 참고 자료입니다. 패치·보유 장비·플레이 방식에 따라 정답은 달라질 수 있습니다.",
      setupGuideSampleValue: "{sample}/{target}명",
      setupGuideCandidatesValue: "{count}명",
      setupGuideConfidenceHigh: "높음", setupGuideConfidenceMedium: "보통",
      setupGuideConfidenceLow: "낮음", setupGuideConfidenceInsufficient: "표본 부족",
      setupGuideManastoneTitle: "마석 · 피해 증폭", setupGuideManastoneNote: "피해 증폭 계열 마석만 따로 집계합니다.",
      setupGuideSpiritStoneTitle: "영석 · 피해 증폭", setupGuideSpiritStoneNote: "피해 증폭 계열 영석만 따로 집계합니다.",
      setupGuideSoulTitle: "부위별 영혼 각인", setupGuideSoulNote: "동일한 좌우 장신구는 한 부위로 합쳐 집계합니다.",
      setupGuideSoulGear: "무기·방어구", setupGuideSoulAccessories: "장신구·특수 장비",
      setupGuideSoulSkills: "스킬", setupGuideSoulStats: "옵션",
      setupGuideArcanaTitle: "아르카나", setupGuideSkillTitle: "스킬 투자 우선순위",
      setupGuideActive: "스킬", setupGuideStigma: "스티그마", setupGuidePassive: "패시브",
      setupGuideUsage: "사용 {value}", setupGuideMedianLevel: "중앙 Lv.{value}",
      setupGuideLevelRange: "주요 구간 Lv.{low}~{high}", setupGuideMedianEnhance: "강화 중앙 +{value}",
      setupGuideMedianExceed: "돌파 중앙 {value}", setupGuideTotalSlots: "총 {value}개",
      setupGuideMedianValue: "1인 중앙 {value}", setupGuideArcanaSlots: "슬롯별 카드",
      setupGuideArcanaSets: "세트 구성", setupGuideArcanaCards: "많이 사용하는 카드", setupGuideArcanaSkills: "많이 붙인 스킬",
      setupGuideArcanaStats: "아르카나 추가 능력치", setupGuideNoData: "확인된 표본이 없습니다",
      setupGuideArcanaChalice: "성배", setupGuideArcanaParchment: "양피지",
      setupGuideArcanaCompass: "나침반", setupGuideArcanaBell: "종", setupGuideArcanaMirror: "거울",
      setupGuideArcanaScales: "천칭", setupGuideArcanaKey: "열쇠", setupGuideArcanaHourglass: "모래시계",
      setupGuideArcanaDice: "주사위", setupGuideArcanaLantern: "등불",
      classTop10: "클래스 TOP 10",
      fieldBoss: "필드보스",
      optimization: "최적화",
      optimizationPageTitle: "NotMeter 그래픽 최적화",
      optimizationPageSubtitle: "아이온2 engine.ini 설정 생성기",
      optimizationSurfaceTitle: "그래픽 최적화 설정",
      optimizationSurfaceDescription: "현재 페이지에서 설정을 생성하며 상단 메뉴와 광고는 그대로 유지됩니다.",
      optimizationFrameTitle: "아이온2 그래픽 최적화 설정 생성기",
      discord: "디스코드",
      download: "다운로드",
      taiwanServer: "대만 서버",
      enhancedBuff: "상위 버프",
      peopleValue: "{value}명",
      advertisement: "광고",
      serviceLinksAria: "NotMeter 바로가기",
      dailyUsersTitle: "최근 집계된 일일 사용자 수",
      normalizedDpsVerified: "nDPS 산정 완료",
      normalizedDpsUnavailable: "nDPS 산정 불가",
      normalizedDpsVerifiedTitle: "외부 파티 효과를 제외한 nDPS를 산정할 수 있는 기록입니다.",
      normalizedDpsUnavailableTitle: "nDPS 산정에 필요한 정보가 충분하지 않은 기록입니다.",
      normalizedDpsDescription: "외부 파티 버프가 만든 검증된 추가 피해를 제외한 개인 DPS",
      rankingMetric: "DPS / nDPS 랭킹 기준",
      rankingMetricAria: "랭킹 기준 선택",
      testBadge: "TEST",
      dpsRankingDescription: "파티 버프를 포함한 기존 총 DPS 순위입니다.",
      ndpsRankingDescription: "외부 파티 버프의 검증된 추가 피해를 제외한 nDPS 순위입니다.",
      ndpsRankingFallbackDps: "이 콘텐츠는 nDPS 보정 대상이 아니므로 DPS 순위로 표시합니다.",
      ndpsRankingUnavailableCombatTime: "이 콘텐츠는 전투 시간 순위만 제공합니다.",
      ndpsEmpty: "선택한 조건에 검증된 nDPS 기록이 아직 없습니다",
      classNdps: "{job} nDPS 1~{count}위",
      uniqueNormalizedRankers: "표시 캐릭터 {count}명 · 검증된 nDPS가 있는 기록 중 가장 높은 기록만 표시",
      totalDpsShort: "DPS",
      languageSwitchAria: "언어 전환",
      advertisementAria: "광고",
      fieldBossRegionsAria: "필드보스 지역",
      classTabsAria: "클래스 선택",
      statsFiltersAria: "통계 필터",
      weeklyLegendAria: "주간 변화 기호",
      footerLinksAria: "서비스 안내",
      closeAria: "닫기",
      partyTabsAria: "파티원",
      sponsorOpenAria: "광고 페이지 열기",
      fieldBossPageTitle: "NotMeter 필드보스 현황",
      fieldBossPageSubtitle: "서버별 필드보스 출현 현황",
      artifactPageTitle: "NotMeter 아티팩트 현황",
      artifactPageSubtitle: "한국 서버 대진별 점령 현황과 다음 점령전",
      fieldBossStatus: "필드보스 현황",
      backToRanking: "랭킹으로 돌아가기",
      classPerformancePageTitle: "NotMeter CP 보정 직업 DPS 통계",
      classPerformancePageSubtitle: "이번 주 동일 보스·동일 CP 기준 실전 성능 지표",
      classPerformanceTitle: "CP 보정 직업 DPS 통계",
      classPerformanceDescription: "이번 주 검증 기록 중 CP 800K 이상·파티 CP 차이 100K 이하·기여도 10% 초과 표본을 같은 보스·10K CP 조건으로 맞춘 상대 지표입니다. 원시 DPS 순위가 아닙니다.",
      classPerformanceCpTitle: "검증 기록만 수집",
      classPerformanceCpText: "이번 주 통계 검증을 통과한 보스 처치 중 서버·캐릭터·직업이 확인되고 CP가 800K 이상인 기록만 사용합니다. 최대 CP 제한은 없습니다.",
      classPerformancePartyTitle: "파티 표본 정제",
      classPerformancePartyText: "파티원 정보가 모두 확인되고 CP 최고·최저 차이가 100K 이하인 전투만 사용하며, 파티 총 피해 기여도가 10%를 초과한 캐릭터만 표본에 포함합니다.",
      classPerformanceDedupeTitle: "캐릭터별 대표 기록",
      classPerformanceDedupeText: "같은 캐릭터·보스는 한 번만 반영합니다. 기록이 2회 이상이면 최대 상위 3회 중 두 번째 기록을 사용해 단발성 고점을 줄입니다.",
      classPerformanceTrustTitle: "동일 조건끼리 비교",
      classPerformanceTrustText: "같은 던전·보스·10K CP 안에서만 직업을 비교하고, 조건별 직업 중앙값을 100으로 환산합니다.",
      classPerformanceFormulaKicker: "점수 산식",
      classPerformanceFormulaTitle: "100점은 어떻게 계산하나요?",
      classPerformanceVerifiedBadge: "검증 통과 기록만",
      classPerformanceFormulaExpression: "직업 백분위 DPS ÷ 동일 조건 직업 중앙값 × 100",
      classPerformanceFormulaText: "점수 105는 같은 보스·같은 10K CP 조건의 직업 중앙값보다 관측 DPS가 약 5% 높다는 뜻입니다.",
      classPerformanceCellGateTitle: "비교 셀 통과 조건",
      classPerformanceCellGateText: "동일 보스·10K CP에 전체 대표 기록 30개 이상, 직업별 5개 이상, 비교 가능한 직업 4개 이상일 때만 계산합니다.",
      classPerformanceCombineTitle: "콘텐츠 균등 합산",
      classPerformanceCombineText: "CP 구간의 표본 수는 완만하게 반영하고, 최종 점수는 각 보스를 같은 비중의 기하평균으로 합쳐 인기 보스 쏠림을 줄입니다.",
      classPerformanceConfidenceKicker: "순위 공개 기준",
      classPerformanceConfidenceTitle: "신뢰도 A·B·C는 무엇인가요?",
      classPerformanceConfidenceBasis: "P75 기준",
      classPerformanceGradeAText: "고유 250명+ · 콘텐츠 75% 이상·최소 6개 · 95% 오차 ±4% 이하",
      classPerformanceGradeBText: "고유 100명+ · 콘텐츠 50% 이상·최소 4개 · 95% 오차 ±7% 이하",
      classPerformanceGradeCText: "고유 40명+ · 콘텐츠 최소 3개 · 95% 오차 ±12% 이하",
      classPerformanceGradeOffText: "C 기준 미달은 표본 부족으로 표시하고 순위에서 제외",
      classPerformanceConfidenceNote: "95% 신뢰구간은 콘텐츠를 하나씩 제외했을 때의 점수 변화와 고유 캐릭터 수를 함께 반영한 추정 범위입니다. 집계 가능한 전체 콘텐츠가 기준 개수보다 적으면 전체 콘텐츠 수를 기준으로 판정합니다.",
      classPerformanceCompositionKicker: "직업 제외 필터",
      classPerformanceCompositionTitle: "제외할 직업 선택",
      classPerformanceCompositionText: "보고 싶지 않은 직업을 여러 개 선택하면 해당 직업이 한 명도 없는 파티 기록만 다시 집계합니다.",
      classPerformanceCompositionReset: "제외 초기화",
      classPerformanceCompositionAria: "제외할 파티 직업 선택",
      classPerformanceCompositionExclude: "제외",
      classPerformanceCompositionExcludeJob: "{job} 없는 파티만 보기",
      classPerformanceCompositionAll: "제외 직업 없음 · 전체 파티 집계",
      classPerformanceCompositionExcluded: "{jobs} 제외 파티 · 대표 기록 {samples}개 · 고유 캐릭터 {characters}명",
      classPerformanceCompositionUnavailable: "선택한 직업 제외 조건의 표본이 아직 부족합니다.",
      classPerformanceExclusionDifference: "전체 대비 {value}점",
      classPerformanceMetricsAria: "직업 성능 백분위 선택",
      classPerformanceP50Title: "P50 · 중앙값",
      classPerformanceP50Text: "전체 기록을 낮은 순으로 정렬했을 때 정확히 가운데인 지점으로, 일반적인 실전 성능을 비교합니다.",
      classPerformanceP75Title: "P75 · 상위 25% 기준",
      classPerformanceP75Text: "전체 기록의 75%가 이 값 이하인 지점으로, 숙련된 유저의 실전 성능을 비교합니다.",
      classPerformanceP90Title: "P90 · 상위 10% 기준",
      classPerformanceP90Text: "전체 기록의 90%가 이 값 이하인 지점으로, 최상위권 성능을 보여주지만 표본 변화에 더 민감합니다.",
      classPerformancePending: "이번 주 신뢰도 통계 캐시 갱신을 기다리는 중입니다.",
      classPerformanceEmpty: "신뢰도 기준을 충족한 직업 표본이 아직 없습니다.",
      classPerformanceNoticeTitle: "이 통계를 어디까지 신뢰할 수 있나요?",
      classPerformanceNoticeText: "CP 800K 이상·파티 CP 차이 100K 이하·기여도 10% 초과 조건과 보스·중복 캐릭터·표본 부족 보정을 적용한 이번 주 실전 비교 지표입니다. A가 가장 안정적이고 C는 참고 가능한 최소 기준입니다. 파티 버프·보스별 역할·숙련도 차이까지 완전히 제거할 수는 없으므로 밸런스의 절대 판정이나 이론상 최대 DPS가 아니라, 실제 수집 기록에서 반복 관측된 경향으로 해석해 주세요.",
      classPerformanceSummary: "{period} · 순위 {jobs}개 직업 · 고유 캐릭터 {characters}명 · 콘텐츠 {contents}개",
      classPerformanceInsufficient: "표본 부족",
      classPerformanceGrade: "표본 신뢰도 {grade}",
      classPerformanceBaseline: "기준 100",
      classPerformanceInsufficientHint: "순위 제외",
      classPerformanceCi: "P75 95% 신뢰구간 {low}~{high}",
      classPerformanceCharacters: "캐릭터 {value}명",
      classPerformanceSamples: "대표 기록 {value}개",
      classPerformanceCoverage: "콘텐츠 {value}/{total}",
      classTop10PageTitle: "NotMeter 클래스별 종합 TOP 10",
      classTop10PageSubtitle: "모든 CP·모든 콘텐츠 TOP 20 성적을 합산한 클래스별 종합 랭킹",
      classTop10Title: "클래스별 종합 TOP 10",
      classTop10Description: "모든 CP의 던전·악몽·허수아비 TOP 20 성적을 합산한 클래스별 종합 랭킹입니다.",
      classTop10ScoreTitle: "점수 계산",
      classTop10ScoreText: "1위 100점부터 20위 5점까지 5점 간격으로 환산합니다.",
      classTop10EntryTitle: "종합 랭킹 조건",
      classTop10EntryText: "종합 점수, 총합 DPS, 1위 횟수, TOP 20 진입 콘텐츠 수 순으로 TOP 10을 선정합니다.",
      classTop10DedupeTitle: "중복 기록 처리",
      classTop10DedupeText: "전체 CP·전체 기간 TOP 20의 실제 순위를 그대로 사용하며, 캐릭터별 최고 DPS와 갱신된 CP를 함께 반영합니다.",
      classTop10Pending: "종합 랭킹 캐시 갱신을 기다리는 중입니다.",
      classTop10Empty: "종합 랭킹에 반영할 TOP 20 기록이 아직 없습니다.",
      classTop10ObservedCp: "집계 기록 중 최고 전투력 {value} CP",
      combinedScore: "종합 점수",
      totalDps: "총합 DPS",
      firstPlaces: "1위 횟수",
      contentResults: "콘텐츠 성적",
      pointsUnit: "{value}점",
      firstPlacesValue: "{value}회",
      server: "서버",
      fieldBossServerSearchPlaceholder: "서버명 또는 초성 검색",
      fieldBossServerNoResults: "일치하는 서버가 없습니다",
      fieldBossLoading: "필드보스 공유 캐시를 불러오는 중입니다",
      fieldBossLoadError: "필드보스 캐시를 불러오지 못했습니다",
      fieldBossEmpty: "선택한 서버에서 수집된 필드보스 시간이 아직 없습니다",
      fieldBossServerStatus: "{server} 필드보스 현황",
      fieldBossEntryCount: "시간 {entries}개 · 지역 {regions}개",
      fieldBossGenerated: "캐시 갱신 {time}",
      fieldBossNoTime: "시간 정보 없음",
      fieldBossNoTimeDetail: "해당 서버에서 시간이 수집되지 않았습니다",
      fieldBossExpected: "출현 예정 {time}",
      fieldBossReached: "출현 시간 도달",
      fieldBossHoursLeft: "{hours}시간 {minutes}분 {seconds}초 전",
      fieldBossMinutesLeft: "{minutes}분 {seconds}초 전",
      fieldBossSecondsLeft: "{seconds}초 전",
      fieldBossCacheNow: "방금 갱신",
      fieldBossCacheMinutes: "{value}분 전 갱신",
      fieldBossCacheHours: "{value}시간 전 갱신",
      dungeon: "던전",
      boss: "보스",
      bossResistanceStats: "보스 저항 통계",
      statEfficiencyCalculator: "스탯 효율 계산기",
      statEfficiencyPageTitle: "NotMeter 스탯 효율 계산기",
      statEfficiencyPageSubtitle: "내 캐릭터와 실전 표본을 기준으로 성장 효율을 비교합니다",
      bossResistancePageTitle: "NotMeter 보스 저항 통계",
      bossResistancePageSubtitle: "전체 기간 누적 표본으로 보스별 강타·완벽 저항을 분석합니다",
      bossResistanceStatsTitle: "보스 저항 통계",
      bossResistanceStatsDescription: "전체 기간 누적 표본으로 보스별 강타·완벽 저항 추정값을 표시합니다.",
      bossResistanceDungeonAria: "보스 저항 통계 던전 선택",
      bossResistanceAllTime: "전체 기간 누적",
      hardHitResistance: "강타 저항",
      perfectResistance: "완벽 저항",
      criticalResistance: "치명타 저항",
      evasion: "회피",
      bossResistanceSettingEstimate: "게임 설정 추정",
      bossResistanceMeasuredEstimate: "측정 추정값 {value}",
      bossResistanceSample: "누적 표본 {records}회",
      bossResistancePending: "표본 수집 중",
      bossResistanceSamplesGuide: "강타·완벽 저항은 전체 기간 누적 판정 표본을 기준으로 5% 단위 게임 설정값과 측정 추정값을 함께 표시합니다.",
      bossResistanceNoData: "표시할 보스 정보가 없습니다.",
      period: "기간",
      refresh: "새로고침",
      loading: "동일한 통계 캐시를 불러오는 중입니다",
      loadError: "통계 캐시를 불러오지 못했습니다",
      retry: "다시 시도",
      empty: "선택한 조건에 해당하는 통계가 아직 없습니다",
      rank: "순위",
      job: "직업",
      sample: "표본",
      recordSample: "기록 표본",
      recordSampleValue: "{count}회",
      recordSampleTooltip: "전투 기록 {count}회이며 동일 캐릭터의 반복 기록이 포함될 수 있습니다",
      recordSampleColumnTooltip: "선택한 직접 CP 범위의 전투 기록 수이며 동일 캐릭터의 반복 기록이 포함될 수 있습니다",
      sampleBasisTitle: "표본 수가 줄어든 이유",
      sampleBasisDescription: "같은 던전·보스·직업·25K CP 구간·기간에서 캐릭터별 시간순 최신 기록을 최대 40판까지 사용합니다. 10판 이상은 가장 높고 낮은 10%씩을 제외한 가운데 80% 평균, 10판 미만은 중앙값 1개를 표본으로 집계합니다. 전체 기간도 오래된 기록이 계속 누적되지 않으며, 한 캐릭터는 1명으로 표시됩니다. 30명 미만인 구간은 가까운 25K 구간 표본으로 보정합니다. 기록 삭제나 누락이 아닙니다.",
      sampleBasisChipsAria: "표본 집계 핵심",
      sampleBasisUniqueChip: "표본 = 고유 캐릭터 수",
      sampleBasisBestChip: "DPS·nDPS별 최신 최대 40판 보정 평균",
      sampleBasisColumnTooltip: "같은 조건에서 캐릭터별 최신 최대 40판을 사용해 높고 낮은 일부 기록을 제외한 대표값 1개를 반영한 고유 캐릭터 수입니다",
      top25: "상위 25%",
      top10Threshold: "상위 10%",
      median: "중앙값",
      max: "최고",
      distribution: "분포",
      details: "상세",
      character: "캐릭터",
      duration: "전투 시간",
      cacheNotice: "클라이언트와 동일한 통계 생성본을 사용합니다.",
      privacyPolicy: "개인정보처리방침",
      advertisingNotice: "Google AdSense 광고를 사용합니다.",
      allBosses: "전체 보스",
      dungeonSelectionAria: "던전 선택",
      bossSelectionAria: "보스 선택",
      moreDungeons: "다른 던전 +{count}개 더보기",
      expandDungeons: "던전 목록 펼치기",
      collapseDungeons: "던전 목록 접기",
      allCp: "전체 CP",
      customCp: "직접 CP 지정",
      cpSelectionAria: "CP 구간 선택",
      cpSelectionTitle: "CP 구간 선택",
      cpSelectionDescription: "빠른 선택 또는 100K 묶음 안의 25K 구간을 선택하세요",
      cpSelectionCloseAria: "CP 구간 선택 닫기",
      cpQuickTitle: "빠른 선택",
      cpPresetTitle: "25K 구간",
      cpRangeGroup: "{minimum}K~{maximum}K",
      customCpTitle: "직접 CP 지정",
      customCpDescription: "400~420은 40만 CP부터 42만 CP 구간까지 조회합니다",
      customCpMinimum: "최소 CP",
      customCpMaximum: "최대 CP",
      customCpApply: "적용",
      customCpResolved: "집계 범위 {minimum}K~{maximum}K",
      customCpInvalid: "400K~1,999K 안에서 최소 CP보다 큰 최대 CP를 입력해 주세요",
      thisWeek: "이번 주",
      today: "오늘",
      recent14: "최근 14일",
      allPeriod: "전체 기간",
      records: "기록",
      samples: "표본",
      recordSamples: "기록 표본",
      recordSamplesValue: "기록 표본 {count}회",
      updated: "갱신",
      refreshScheduleAria: "통계 갱신 시간 안내",
      refreshScheduleTitle: "통계 갱신 시간 안내",
      refreshScheduleCadence: "통계 집계는 매시 정각과 30분에 시작합니다.",
      refreshScheduleDelay: "표시된 시각은 통계 생성본의 기준 시각입니다. 기록량이 많으면 집계·압축·업로드 처리에 시간이 더 걸려 홈페이지 반영이 늦어질 수 있습니다.",
      refreshSchedulePage: "열어 둔 홈페이지는 약 5분마다 새 통계를 확인합니다. 바로 확인하려면 ‘새로고침’을 눌러주세요.",
      rankingEntryGuideTitle: "랭킹 등록 기준 안내",
      rankingEntryGuideSubtitle: "기록이 보이지 않을 때 먼저 확인해 주세요",
      rankingEntrySpreadTitle: "파티 전투력 차이",
      rankingEntrySpread: "전투 기록에서 CP가 확인된 파티원 중 최고 전투력과 최저 전투력의 차이가 200K(200,000) 이상이면 해당 전투 전체가 통계와 TOP 20 랭킹에서 제외됩니다.",
      rankingEntryCalculationTitle: "계산 방법",
      rankingEntryCalculation: "최고 CP − 최저 CP로 계산하며 정확히 200K인 경우도 제외됩니다. 예를 들어 900K와 700K가 함께 기록되면 차이가 200K이므로 등록되지 않습니다.",
      rankingEntryPurposeTitle: "적용 목적",
      rankingEntryPurpose: "버스 또는 전투력 격차가 큰 파티의 기록으로 인해 직업별 DPS 통계가 왜곡되는 것을 방지하기 위한 기준입니다.",
      rankingEntryRankerDisplayTitle: "딜미터기 랭커 표시",
      rankingEntryRankerDisplay: "상위 %는 800K 미만에서 전체 기간, 800K 이상에서 이번 주 기록을 비교합니다. 랭커 표시와 랭커 권한 닉네임 효과는 800K 이상만 적용하며, 유효한 쿠폰 효과는 CP 제한이 없습니다.",
      rankingEntryNote: "CP를 알 수 없는 파티원은 차이 계산에서 제외됩니다. 일반 던전 기록은 확정 처치와 파티원 5인 이상 조건을 충족해야 하며, 1인 콘텐츠인 악몽은 1인 이상 확정 처치부터 집계합니다. 훈련용 허수아비는 별도 기준을 사용합니다.",
      rankerDungeonGuideTitle: "구간 랭킹·닉네임 효과 안내",
      rankerDungeonGuideRequired: "문의 전 필독",
      rankerDungeonGuideSubtitle: "랭커 마크 조건부터 닉네임 효과가 다른 사람에게 보이는 시점까지 확인하세요",
      rankerDungeonGuideMarkerChip: "랭커 마크 TOP 20",
      rankerDungeonGuideEffectChip: "닉네임 효과 TOP 3",
      rankerDungeonGuideTimingChip: "다른 사람 반영 5~10분",
      rankerDungeonGuideMarkerLabel: "랭커 마크",
      rankerDungeonGuideMarkerTitle: "전체 기간 또는 이번 주 구간 TOP 20",
      rankerDungeonGuideMarkerBody: "전투력 800K 이상에서 두 기간 중 하나만 충족하면 표시됩니다. 같은 보스·직업·25K CP 구간의 개별 순위로 판정합니다.",
      rankerDungeonGuideEffectLabel: "닉네임 효과",
      rankerDungeonGuideEffectTitle: "전체 기간 또는 이번 주 구간 TOP 3",
      rankerDungeonGuideEffectBody: "전투력 800K 이상에서 두 기간 중 한 곳에서 TOP 3를 달성하면 랭커 닉네임 효과를 사용할 수 있습니다. 유효한 쿠폰 효과는 CP 제한이 없습니다.",
      rankerDungeonGuideFlowAria: "닉네임 효과 반영 순서",
      rankerDungeonGuideUseTitle: "언제부터 사용할 수 있나요?",
      rankerDungeonGuideUseBody: "TOP 3 달성 후 다음 랭킹 캐시가 게시되고 미터기가 자격을 확인하면 사용할 수 있습니다. 통계 집계는 매시 정각과 30분에 시작하며 처리 시간만큼 늦어질 수 있습니다.",
      rankerDungeonGuideSaveTitle: "효과를 저장하면 언제 보이나요?",
      rankerDungeonGuideSaveBody: "저장에 성공하면 본인 미터기에는 바로 표시됩니다. 공개 효과 캐시와 각 미터기의 확인 주기가 각각 5분이므로, 다른 사용자 화면에는 정상 배포 기준 보통 5~10분 안에 반영됩니다.",
      rankerDungeonGuideOthersTitle: "다른 사람에게 안 보일 때",
      rankerDungeonGuideOthersBody: "상대방도 딜미터기를 실행 중이어야 하며, 환경설정의 ‘다른 캐릭터 닉네임 효과 표시’가 켜져 있어야 합니다. 갱신 직후라면 최대 한 번의 추가 확인 주기를 기다려 주세요.",
      rankerDungeonGuideRetentionTitle: "랭커 구간을 벗어나면?",
      rankerDungeonGuideRetentionBody: "현재 CP가 자격을 얻은 25K 구간을 벗어나거나 TOP 3 자격을 잃으면 랭커 권한 효과는 숨겨집니다. 선택한 효과는 지워지지 않으며, 같은 구간에서 자격이 다시 확인되면 자동 복원됩니다.",
      rankerDungeonGuideDungeonTitle: "랭커 마크 대상 던전",
      rankerDungeonGuideIntro: "아래 7개 콘텐츠에서 각 보스·직업·CP 구간별로 판정합니다.",
      rankerDungeonDeusTitle: "잠식된 데우스 연구기지(어려움)",
      rankerDungeonDeusBosses: "감독관 그롬카스 · 연구소장 자일러스 · 오만의 아티엘",
      rankerDungeonNoiranTitle: "노이란의 숨겨진 유산(4단계)",
      rankerDungeonNoiranBosses: "불완전한 브라운트 · 광기의 클로민스터 · 아스크란",
      rankerDungeonBakronTitle: "시련: 바크론의 공중섬",
      rankerDungeonBakronBosses: "티에 · 타몬 · 바크론",
      rankerDungeonMusphelTitle: "무스펠의 성배(어려움)",
      rankerDungeonMusphelBosses: "이스카리엘 · 칼드릭스",
      rankerDungeonFallenDevaTitle: "타락한 데바의 성(어려움)",
      rankerDungeonFallenDevaBosses: "의지의 투르겐 · 금기의 마수 그리오사 · 위악의 바실루스",
      rankerDungeonAbyssHornTitle: "심연의 뿔 암굴(4단계)",
      rankerDungeonAbyssHornBosses: "카푸 · 다칸 · 가르가움",
      rankerDungeonNightmareTitle: "악몽",
      rankerDungeonNightmareBosses: "각성한 아테론 10단계 · DPS가 아닌 빠른 전투 시간 순",
      rankerDungeonGuideScope: "일반 던전 6개는 높은 DPS 순, 악몽은 짧은 전투 시간 순으로 집계합니다. ‘전체 보스’ 조회는 통계를 한 번에 보는 기능이며, 랭커 마크는 각 보스의 개별 순위로 판정합니다.",
      rankerDungeonGuideBakronRewardExcluded: "시련: 바크론의 공중섬은 랭커 마크에는 반영되지만, 랭커 권한 닉네임 효과 대상에서는 임시 제외됩니다.",
      rankerDungeonGuideDummy: "훈련용 허수아비(1분)는 홈페이지 랭킹만 제공하며, 딜미터기 전투 종료 구간 순위·상위% 배지와 실시간 랭커 마크 대상에서는 제외됩니다.",
      rankerDungeonGuidePeriod: "상위 %는 800K 미만에서 전체 기간, 800K 이상에서 이번 주 기록을 사용합니다. 이번 주는 매주 수요일 오전 5시부터 다음 수요일 오전 5시까지입니다.",
      weeklyCompare: "▲▼는 직전 주 동일 조건의 직업별 상위 25% DPS 변화",
      weeklyCompareNdps: "▲▼는 직전 주 동일 조건의 직업별 상위 25% nDPS 변화",
      weeklyTooltip: "직전 주 동일 조건 비교",
      weeklyPreviousShort: "전주",
      weeklyPreviousTitle: "지난주 통계",
      weeklyPreviousRange: "동일 조건 · {range}",
      weeklyPreviousChange: "상위 25% 대비 {value}",
      weeklyPreviousNoData: "지난주 동일 조건 표본 없음",
      weeklyGuideTitle: "▲▼ 이번 주 변화 표시 안내",
      weeklyGuideSubtitle: "직전 주 동일 조건의 직업별 상위 25% DPS와 비교합니다",
      weeklyUp: "상승",
      weeklyDown: "하락",
      weeklyFlat: "변화 없음",
      weeklyGuidePurposeTitle: "표시 목적",
      weeklyGuidePurpose: "밸런스 패치 이후 직업별 실전 성능 흐름을 빠르게 비교하기 위한 참고 지표입니다.",
      weeklyGuideBasisTitle: "비교 기준",
      weeklyGuideBasis: "상위 25% DPS는 직업별 전체 표본에서 상위 25%가 시작되는 경계값(P75)입니다. 현재 선택한 던전·보스·CP 구간을 동일하게 맞춰 이번 주와 직전 주의 P75를 비교하며, 한 주는 매주 수요일 오전 5시부터 다음 수요일 오전 5시까지입니다.",
      weeklyGuideMeaningTitle: "퍼센트 의미",
      weeklyGuideMeaning: "변화율은 (이번 주 P75−직전 주 P75)÷직전 주 P75×100으로 계산합니다. ▲2.4%는 이번 주 값이 2.4% 높고, ▼2.4%는 2.4% 낮다는 뜻입니다.",
      weeklyGuideRankingTitle: "랭킹 반영 방식",
      weeklyGuideRanking: "직업 순서는 이번 주 상위 25% DPS로 정렬합니다. 구간 1~20위와 TOP 3 닉네임 효과 권한은 전투력 800K 이상에서 전체 기간 또는 이번 주 중 하나만 충족해도 인정합니다. 보스 처치 후 상위 %는 800K 미만은 전체 기간, 800K 이상은 이번 주 기록을 사용합니다.",
      weeklyGuideNote: "각 직업 행 아래에서 직전 주의 표본·상위 10%·상위 25%·중앙값·최고값을 함께 확인할 수 있습니다. 직전 주에 같은 조건의 기록이 없으면 비교 수치와 화살표가 표시되지 않습니다.",
      classDps: "{job} DPS 1~{count}위",
      classCombatTime: "{job} 전투 시간 1~{count}위",
      top20: "TOP {count}",
      uniqueRankers: "표시 캐릭터 {count}명 · 동일 캐릭터는 선택 조건에서 가장 높은 DPS 기록만 표시",
      uniqueCombatTimeRankers: "표시 캐릭터 {count}명 · 동일 캐릭터는 선택 조건에서 가장 빠른 전투 기록만 표시",
      backToJobs: "직업 목록으로",
      party: "파티",
      viewDetails: "보기",
      characterProfile: "캐릭터 정보",
      characterProfileShort: "정보",
      combatDetails: "전투 상세 정보",
      detailLoading: "전투 상세 정보를 불러오는 중입니다",
      detailUnavailable: "전투 상세 정보를 불러오지 못했습니다 다시 시도해 주세요",
      detailUnavailableTitle: "상세 기록 없음",
      detailUnavailableOld: "현재 전투 상세 캐시에 포함되지 않은 기록입니다. 1.0.149 이하 기록은 통계에서 제외됩니다.",
      detailUnavailableCustomCp: "직접 CP 조회의 순위 기록은 정상입니다. 다만 이 기록은 현재 전투 상세 캐시에 게시되지 않았으며, 1.0.149 기록이라는 뜻은 아닙니다.",
      partyMembers: "파티원",
      totalDamage: "총 데미지",
      contribution: "기여도",
      deathCount: "사망 횟수",
      combatPower: "전투력 CP",
      hits: "타수",
      hitRate: "적중률",
      criticalRate: "치명타율",
      skillCount: "스킬 수",
      skillBreakdown: "스킬 피해 내역",
      skill: "스킬",
      damage: "데미지",
      damageHealing: "피해 / 치유",
      share: "비중",
      average: "평균",
      averageInterval: "평균 간격",
      buffUptime: "버프 업타임",
      buffUptimeCaption: " / 전투 시간 대비 유지율",
      visibleItems: "표시 항목",
      openSettings: "설정 열기",
      closeSettings: "설정 닫기",
      specialization: "특성",
      parry: "페리",
      avoidance: "회피",
      avoidanceBlock: "회피/받은 공격 막기",
      block: "받은 공격 막기",
      blockDescription: "내 공격이 막힌 횟수가 아니라, 보스의 공격을 해당 캐릭터가 막아낸 횟수와 받은 직접 공격 대비 비율입니다.",
      multiHit: "다단 히트",
      critical: "크리",
      front: "전방",
      back: "후방",
      perfect: "완벽",
      doubleDamage: "강타",
      periodicDamage: "지속피해",
      healing: "치유",
      healingCount: "치유 횟수",
      drainHealing: "흡혈",
      useCount: "사용",
      averageDamage: "평균 데미지",
      maximumDamage: "최고 피해",
      recordedBuffsNone: "기록된 버프 없음",
      agoNow: "방금 갱신",
      agoMinutes: "{value}분 전 갱신",
      agoHours: "{value}시간 전 갱신",
      cacheInvalid: "지원하지 않는 통계 캐시 형식입니다.",
      cacheUnavailable: "잠시 후 새로고침해 주세요.",
    },
    en: {
      title: "NotMeter Dungeon Statistics",
      subtitle: "Classes are ranked by top-quartile DPS",
      characterPageTitle: "NotMeter Character Search",
      characterPageSubtitle: "Equipment · Soul Engravings · Manastones · Skills",
      dailyUsers: "Daily users",
      classPerformance: "Class Performance",
      newFeature: "Newly added feature",
      contributionStats: "Setup Guide",
      contributionPageTitle: "NotMeter Class Setup Guide",
      contributionPageSubtitle: "Actual PVE setup trends among all-time top rankers",
      contributionStatsTitle: "Class Setup Guide",
      contributionStatsDescription: "See the manastones, spirit stones, soul engravings, Arcana, and skills used by top rankers.",
      contributionPeriod: "Cache updated", contributionRecords: "Valid samples",
      contributionSamples: "Candidates checked", contributionLowSamples: "Confidence",
      contributionDungeonAria: "Select a class setup guide",
      contributionLoading: "Loading top-ranker PVE setups",
      contributionLoadError: "Could not load the setup guide cache",
      contributionEmpty: "No usable PVE setup samples are available yet",
      contributionSortGuide: "Ordered by adoption rate",
      contributionMethodTitle: "How is this setup guide built?",
      contributionMethodScopeTitle: "Top-ranker cohort",
      contributionMethodScopeText: "Starting at rank 1 for each class, we collect 20 characters with a recent PVE setup.",
      contributionMethodFormulaTitle: "Automatic backfill",
      contributionMethodFormulaText: "If a character or PVE snapshot is unavailable, the next ranked character is checked until 20 valid samples are found.",
      contributionMethodSampleTitle: "One character, one vote",
      contributionMethodSampleText: "Each character counts once, so repeated searches or many combat records cannot dominate the guide.",
      contributionMethodTrustTitle: "Updated every 6 hours",
      contributionMethodTrustText: "Only PVE setups seen within the last 30 days are used, with sample size and adoption rate shown together.",
      contributionCaution: "This summarizes real choices by top rankers. Patches, available gear, and play style can change the best choice for you.",
      setupGuideSampleValue: "{sample}/{target}", setupGuideCandidatesValue: "{count}",
      setupGuideConfidenceHigh: "High", setupGuideConfidenceMedium: "Medium",
      setupGuideConfidenceLow: "Low", setupGuideConfidenceInsufficient: "Not enough data",
      setupGuideManastoneTitle: "Manastones · damage amplification", setupGuideManastoneNote: "Damage-amplification manastones are counted separately.",
      setupGuideSpiritStoneTitle: "Spirit stones · damage amplification", setupGuideSpiritStoneNote: "Only damage-amplification spirit stones are counted.",
      setupGuideSoulTitle: "Soul engravings by slot", setupGuideSoulNote: "Matching left and right accessories are combined into one slot.",
      setupGuideSoulGear: "Weapons & armor", setupGuideSoulAccessories: "Accessories & special gear",
      setupGuideSoulSkills: "Skills", setupGuideSoulStats: "Options",
      setupGuideArcanaTitle: "Arcana", setupGuideSkillTitle: "Skill investment priority",
      setupGuideActive: "Skills", setupGuideStigma: "Stigma", setupGuidePassive: "Passive",
      setupGuideUsage: "Used by {value}", setupGuideMedianLevel: "Median Lv.{value}",
      setupGuideLevelRange: "Typical Lv.{low}–{high}", setupGuideMedianEnhance: "Median +{value}",
      setupGuideMedianExceed: "Median breakthrough {value}", setupGuideTotalSlots: "{value} total",
      setupGuideMedianValue: "Median per character {value}", setupGuideArcanaSlots: "Cards by slot",
      setupGuideArcanaSets: "Set combinations", setupGuideArcanaCards: "Most-used cards", setupGuideArcanaSkills: "Most-used attached skills",
      setupGuideArcanaStats: "Arcana bonus stats", setupGuideNoData: "No sample available",
      setupGuideArcanaChalice: "Chalice", setupGuideArcanaParchment: "Parchment",
      setupGuideArcanaCompass: "Compass", setupGuideArcanaBell: "Bell", setupGuideArcanaMirror: "Mirror",
      setupGuideArcanaScales: "Scales", setupGuideArcanaKey: "Key", setupGuideArcanaHourglass: "Hourglass",
      setupGuideArcanaDice: "Dice", setupGuideArcanaLantern: "Lantern",
      classTop10: "Class TOP 10",
      fieldBoss: "Field Boss",
      optimization: "Optimization",
      optimizationPageTitle: "NotMeter Optimizer",
      optimizationPageSubtitle: "AION2 engine.ini settings generator",
      optimizationSurfaceTitle: "Graphics Optimization Settings",
      optimizationSurfaceDescription: "Generate settings here while keeping the header and advertisement visible.",
      optimizationFrameTitle: "AION2 graphics optimization settings generator",
      discord: "Discord",
      download: "Download",
      taiwanServer: "Taiwan server",
      enhancedBuff: "Enhanced buff",
      peopleValue: "{value}",
      advertisement: "Ad",
      serviceLinksAria: "NotMeter shortcuts",
      dailyUsersTitle: "Recently counted daily users",
      normalizedDpsVerified: "nDPS ready",
      normalizedDpsUnavailable: "nDPS unavailable",
      normalizedDpsVerifiedTitle: "This record can calculate nDPS with external party effects removed.",
      normalizedDpsUnavailableTitle: "This record does not contain enough information to calculate nDPS.",
      normalizedDpsDescription: "Personal DPS after removing verified extra damage created by external party buffs",
      rankingMetric: "DPS / nDPS ranking metric",
      rankingMetricAria: "Select ranking metric",
      testBadge: "TEST",
      dpsRankingDescription: "The existing total-DPS ranking, including party buffs.",
      ndpsRankingDescription: "Ranks verified nDPS after removing extra damage from external party buffs.",
      ndpsRankingFallbackDps: "This content is not adjusted for nDPS, so its DPS ranking is shown.",
      ndpsRankingUnavailableCombatTime: "This content is ranked by combat time only.",
      ndpsEmpty: "No verified nDPS records match the selected filters yet",
      classNdps: "{job} nDPS — Top {count}",
      uniqueNormalizedRankers: "{count} characters shown · only each character's highest verified nDPS is shown",
      totalDpsShort: "DPS",
      languageSwitchAria: "Switch language",
      advertisementAria: "Advertisement",
      fieldBossRegionsAria: "Field boss regions",
      classTabsAria: "Select class",
      statsFiltersAria: "Statistics filters",
      weeklyLegendAria: "Weekly change symbols",
      footerLinksAria: "Service information",
      closeAria: "Close",
      partyTabsAria: "Party members",
      sponsorOpenAria: "Open advertisement page",
      fieldBossPageTitle: "NotMeter Field Boss Status",
      fieldBossPageSubtitle: "Field-boss spawn status by server",
      artifactPageTitle: "NotMeter Artifact Status",
      artifactPageSubtitle: "Korean server matchups, control status, and the next battle",
      fieldBossStatus: "Field Boss Status",
      backToRanking: "Back to rankings",
      classPerformancePageTitle: "NotMeter CP-Normalized Class DPS",
      classPerformancePageSubtitle: "This week's real-world performance at the same boss and CP",
      classPerformanceTitle: "CP-Normalized Class DPS",
      classPerformanceDescription: "A relative index using this week's verified samples with 800K+ CP, a party CP spread of 100K or less, and over 10% damage contribution, matched by boss and 10K CP bracket. It is not a raw-DPS leaderboard.",
      classPerformanceCpTitle: "Verified runs only",
      classPerformanceCpText: "Only accepted boss kills with a known server, character, and class and record-time CP of at least 800K are used. There is no maximum CP limit.",
      classPerformancePartyTitle: "Party-sample filtering",
      classPerformancePartyText: "Only fights with every party member verified and at most a 100K gap between the party's highest and lowest CP are used; only characters contributing over 10% of party damage enter the sample.",
      classPerformanceDedupeTitle: "One representative run",
      classPerformanceDedupeText: "Each character and boss counts once. With two or more runs, the second-best among up to the top three reduces one-off peaks.",
      classPerformanceTrustTitle: "Like-for-like comparison",
      classPerformanceTrustText: "Classes are compared only within the same dungeon, boss, and 10K CP bracket, then the class median is indexed to 100.",
      classPerformanceFormulaKicker: "SCORING",
      classPerformanceFormulaTitle: "How is the 100 baseline calculated?",
      classPerformanceVerifiedBadge: "Verified runs only",
      classPerformanceFormulaExpression: "Class percentile DPS ÷ same-condition class median × 100",
      classPerformanceFormulaText: "A score of 105 means observed DPS is about 5% above the class median for the same boss and 10K CP bracket.",
      classPerformanceCellGateTitle: "Comparison-cell requirements",
      classPerformanceCellGateText: "A same-boss, 10K-CP cell is used only with at least 30 representative runs overall, five per class, and four comparable classes.",
      classPerformanceCombineTitle: "Equal encounter weighting",
      classPerformanceCombineText: "CP-bracket sample sizes receive limited weighting, then every boss is combined with an equal-weight geometric mean to reduce popular-encounter bias.",
      classPerformanceConfidenceKicker: "RANKING THRESHOLDS",
      classPerformanceConfidenceTitle: "What do confidence grades A, B, and C mean?",
      classPerformanceConfidenceBasis: "P75 basis",
      classPerformanceGradeAText: "250+ unique characters · 75%+ coverage and 6+ encounters · 95% error within ±4%",
      classPerformanceGradeBText: "100+ unique characters · 50%+ coverage and 4+ encounters · 95% error within ±7%",
      classPerformanceGradeCText: "40+ unique characters · 3+ encounters · 95% error within ±12%",
      classPerformanceGradeOffText: "Below C is shown as a small sample and excluded from ranking",
      classPerformanceConfidenceNote: "The 95% interval estimates score variation by removing encounters one at a time and accounting for unique-character count. If fewer encounters are eligible than a grade requires, all eligible encounters become the requirement.",
      classPerformanceCompositionKicker: "CLASS EXCLUSION FILTER",
      classPerformanceCompositionTitle: "Select classes to exclude",
      classPerformanceCompositionText: "Select multiple classes to recalculate only from parties that contain none of those classes.",
      classPerformanceCompositionReset: "Clear exclusions",
      classPerformanceCompositionAria: "Select party classes to exclude",
      classPerformanceCompositionExclude: "Exclude",
      classPerformanceCompositionExcludeJob: "Show parties without {job}",
      classPerformanceCompositionAll: "No excluded classes · aggregating all parties",
      classPerformanceCompositionExcluded: "Parties excluding {jobs} · {samples} representative runs · {characters} unique characters",
      classPerformanceCompositionUnavailable: "The selected class-exclusion condition does not yet have enough samples.",
      classPerformanceExclusionDifference: "vs all parties {value} pts",
      classPerformanceMetricsAria: "Select class-performance percentile",
      classPerformanceP50Title: "P50 · Median",
      classPerformanceP50Text: "The midpoint after sorting all runs from low to high, representing typical real-world performance.",
      classPerformanceP75Title: "P75 · Top 25% threshold",
      classPerformanceP75Text: "The point where 75% of runs are at or below it, representing experienced-player performance.",
      classPerformanceP90Title: "P90 · Top 10% threshold",
      classPerformanceP90Text: "The point where 90% of runs are at or below it, highlighting elite performance but reacting more to sample changes.",
      classPerformancePending: "Waiting for this week's confidence cache to refresh.",
      classPerformanceEmpty: "No class sample meets the confidence threshold yet.",
      classPerformanceNoticeTitle: "How far should this result be trusted?",
      classPerformanceNoticeText: "This weekly comparison applies 800K+ CP, a party CP spread of 100K or less, over 10% damage contribution, boss matching, character deduplication, and small-sample controls. A is the most stable grade, while C is the minimum useful reference. Party buffs, encounter roles, and player skill cannot be removed completely, so this is a repeatedly observed trend rather than an absolute balance verdict or theoretical maximum DPS.",
      classPerformanceSummary: "{period} · {jobs} ranked classes · {characters} unique characters · {contents} encounters",
      classPerformanceInsufficient: "Small sample",
      classPerformanceGrade: "Sample confidence {grade}",
      classPerformanceBaseline: "Baseline 100",
      classPerformanceInsufficientHint: "Not ranked",
      classPerformanceCi: "P75 95% CI {low}–{high}",
      classPerformanceCharacters: "{value} characters",
      classPerformanceSamples: "{value} representative runs",
      classPerformanceCoverage: "{value}/{total} encounters",
      classTop10PageTitle: "NotMeter Class Overall TOP 10",
      classTop10PageSubtitle: "Class rankings combining all-CP Top 20 results across all content",
      classTop10Title: "Class Overall TOP 10",
      classTop10Description: "A class leaderboard combining all-CP Top 20 results from every dungeon, Nightmare, and the training dummy.",
      classTop10ScoreTitle: "Scoring",
      classTop10ScoreText: "Ranks convert in five-point steps, from 100 points for 1st to 5 points for 20th.",
      classTop10EntryTitle: "Eligibility",
      classTop10EntryText: "Each class Top 10 is ordered by overall score, total DPS, 1st-place count, then Top 20 content coverage.",
      classTop10DedupeTitle: "Duplicate records",
      classTop10DedupeText: "Uses the exact All CP and All Time Top 20 rank, keeping each character's best DPS with their updated CP.",
      classTop10Pending: "Waiting for the overall-ranking cache to refresh.",
      classTop10Empty: "No Top 20 result is available for the overall ranking yet.",
      classTop10ObservedCp: "Highest CP among ranked results: {value} CP",
      combinedScore: "Overall score",
      totalDps: "Total DPS",
      firstPlaces: "1st places",
      contentResults: "Content results",
      pointsUnit: "{value} pts",
      firstPlacesValue: "{value}",
      server: "Server",
      fieldBossServerSearchPlaceholder: "Search server name or Korean initials",
      fieldBossServerNoResults: "No matching servers",
      fieldBossLoading: "Loading the shared field-boss cache",
      fieldBossLoadError: "Unable to load the field-boss cache",
      fieldBossEmpty: "No field-boss timers have been collected for this server yet",
      fieldBossServerStatus: "{server} Field Boss Status",
      fieldBossEntryCount: "{entries} timers · {regions} regions",
      fieldBossGenerated: "Cache updated {time}",
      fieldBossNoTime: "No timer data",
      fieldBossNoTimeDetail: "No timer has been collected from this server",
      fieldBossExpected: "Expected {time}",
      fieldBossReached: "Spawn time reached",
      fieldBossHoursLeft: "{hours}h {minutes}m {seconds}s left",
      fieldBossMinutesLeft: "{minutes}m {seconds}s left",
      fieldBossSecondsLeft: "{seconds}s left",
      fieldBossCacheNow: "Updated just now",
      fieldBossCacheMinutes: "Updated {value}m ago",
      fieldBossCacheHours: "Updated {value}h ago",
      dungeon: "Dungeon",
      boss: "Boss",
      bossResistanceStats: "Boss resistance",
      statEfficiencyCalculator: "Stat efficiency",
      statEfficiencyPageTitle: "NotMeter Stat Efficiency Calculator",
      statEfficiencyPageSubtitle: "Compare upgrade efficiency for your character using live combat samples",
      bossResistancePageTitle: "NotMeter Boss Resistance Statistics",
      bossResistancePageSubtitle: "Analyze Power-hit and Perfect resistance from all-time samples",
      bossResistanceStatsTitle: "Boss Resistance Statistics",
      bossResistanceStatsDescription: "All-time samples show estimated Power-hit and Perfect resistance for each boss.",
      bossResistanceDungeonAria: "Select a dungeon for boss resistance statistics",
      bossResistanceAllTime: "All-time total",
      hardHitResistance: "Power-hit resistance",
      perfectResistance: "Perfect resistance",
      criticalResistance: "Critical resistance",
      evasion: "Evasion",
      bossResistanceSettingEstimate: "Estimated game setting",
      bossResistanceMeasuredEstimate: "Measured estimate {value}",
      bossResistanceSample: "Cumulative samples: {records}",
      bossResistancePending: "Collecting samples",
      bossResistanceSamplesGuide: "Power-hit and Perfect use all-time outcome samples to show both the nearest 5% game setting and the measured estimate.",
      bossResistanceNoData: "No boss information is available.",
      period: "Period",
      refresh: "Refresh",
      loading: "Loading the shared statistics cache",
      loadError: "Unable to load the statistics cache",
      retry: "Try again",
      empty: "No records match the selected filters yet",
      rank: "Rank",
      job: "Class",
      sample: "Samples",
      recordSample: "Combat samples",
      recordSampleValue: "{count} runs",
      recordSampleTooltip: "{count} combat records; repeated runs by the same character may be included",
      recordSampleColumnTooltip: "Combat-record count for the custom CP range; repeated runs by the same character may be included",
      sampleBasisTitle: "Why the sample count is lower",
      sampleBasisDescription: "For the same dungeon, boss, class, 25K CP bracket, and period, up to 40 runs are taken in most-recent-first order. With 10 or more runs, the highest and lowest 10% are removed and the middle 80% is averaged; fewer runs use the median. All-time views also keep only the latest 40 runs, each character counts once, and brackets below 30 characters are adjusted with the nearest 25K brackets. No records were deleted or lost.",
      sampleBasisChipsAria: "Sample-count essentials",
      sampleBasisUniqueChip: "Sample = unique characters",
      sampleBasisBestChip: "Adjusted average of up to 40 recent DPS and nDPS runs",
      sampleBasisColumnTooltip: "Unique characters represented by one adjusted value from up to 40 recent runs under the same filters",
      top25: "Top 25%",
      top10Threshold: "Top 10%",
      median: "Median",
      max: "Highest",
      distribution: "Range",
      details: "Details",
      character: "Character",
      duration: "Duration",
      cacheNotice: "Uses the same generated statistics snapshot as the client.",
      privacyPolicy: "Privacy policy",
      advertisingNotice: "This site uses Google AdSense advertising.",
      allBosses: "All bosses",
      dungeonSelectionAria: "Select dungeon",
      bossSelectionAria: "Select boss",
      moreDungeons: "Show {count} more dungeons",
      expandDungeons: "Show all dungeons",
      collapseDungeons: "Collapse dungeons",
      allCp: "All CP",
      customCp: "Custom CP",
      cpSelectionAria: "Select CP bracket",
      cpSelectionTitle: "Select CP bracket",
      cpSelectionDescription: "Use a quick option or choose a 25K bracket grouped by 100K",
      cpSelectionCloseAria: "Close CP bracket selector",
      cpQuickTitle: "Quick selection",
      cpPresetTitle: "25K brackets",
      cpRangeGroup: "{minimum}K–{maximum}K",
      customCpTitle: "Custom CP",
      customCpDescription: "400–420 includes every CP bucket from 400K through 420K",
      customCpMinimum: "Minimum CP",
      customCpMaximum: "Maximum CP",
      customCpApply: "Apply",
      customCpResolved: "Active range: {minimum}K–{maximum}K",
      customCpInvalid: "Use 400K–1,999K and enter a maximum greater than the minimum",
      thisWeek: "This week",
      today: "Today",
      recent14: "Last 14 days",
      allPeriod: "All time",
      records: "records",
      samples: "samples",
      recordSamples: "combat samples",
      recordSamplesValue: "{count} combat samples",
      updated: "updated",
      refreshScheduleAria: "Statistics refresh schedule",
      refreshScheduleTitle: "Statistics refresh schedule",
      refreshScheduleCadence: "Statistics generation starts at the top and half past every hour.",
      refreshScheduleDelay: "The displayed time is the snapshot's generation time. Large data volumes can make aggregation, compression, and upload take longer, so the website may update later.",
      refreshSchedulePage: "An open page checks for new statistics about every five minutes. Select Refresh to check immediately.",
      rankingEntryGuideTitle: "Ranking eligibility",
      rankingEntryGuideSubtitle: "Check these rules when a combat record does not appear",
      rankingEntrySpreadTitle: "Party CP spread",
      rankingEntrySpread: "If the difference between the highest and lowest known party-member CP is 200K (200,000) or more, the entire combat record is excluded from statistics and Top 20 rankings.",
      rankingEntryCalculationTitle: "How it is calculated",
      rankingEntryCalculation: "The spread is highest CP − lowest CP, and exactly 200K is also excluded. For example, a party containing both 900K and 700K characters has a 200K spread and will not be registered.",
      rankingEntryPurposeTitle: "Why this rule exists",
      rankingEntryPurpose: "This prevents carry runs and parties with very large CP gaps from distorting class DPS statistics.",
      rankingEntryRankerDisplayTitle: "Live meter ranker display",
      rankingEntryRankerDisplay: "Top % uses all-time records below 800K CP and current-week records at 800K CP or above. Ranker markers and ranker-granted nickname effects require at least 800K CP; active coupon effects have no CP restriction.",
      rankingEntryNote: "Party members whose CP is unknown are not included in the spread calculation. Regular dungeon records require a confirmed kill and at least five players. Nightmare is solo content and accepts confirmed kills with one or more players. Training-dummy records use separate rules.",
      rankerDungeonGuideTitle: "Bracket ranking & nickname effects",
      rankerDungeonGuideRequired: "READ FIRST",
      rankerDungeonGuideSubtitle: "Rank-marker eligibility, nickname-effect access, and when other players can see it",
      rankerDungeonGuideMarkerChip: "Rank marker: Top 20",
      rankerDungeonGuideEffectChip: "Nickname effect: Top 3",
      rankerDungeonGuideTimingChip: "Others: about 5–10 min",
      rankerDungeonGuideMarkerLabel: "RANK MARKER",
      rankerDungeonGuideMarkerTitle: "Top 20 in all-time or current-week brackets",
      rankerDungeonGuideMarkerBody: "At 800K CP or above, qualifying in either period is enough. Ranking is evaluated per boss, class, and fixed 25K CP bracket.",
      rankerDungeonGuideEffectLabel: "NICKNAME EFFECT",
      rankerDungeonGuideEffectTitle: "Top 3 in all-time or current-week brackets",
      rankerDungeonGuideEffectBody: "At least 800K CP is required for ranker eligibility. Reaching Top 3 in either period unlocks the ranker nickname effect. Active coupon effects have no CP restriction.",
      rankerDungeonGuideFlowAria: "Nickname-effect activation timeline",
      rankerDungeonGuideUseTitle: "When can I use it?",
      rankerDungeonGuideUseBody: "After reaching Top 3, access activates when the next ranking snapshot is published and the meter verifies it. Statistics generation starts at :00 and :30 each hour; processing can add delay.",
      rankerDungeonGuideSaveTitle: "When will a saved effect appear?",
      rankerDungeonGuideSaveBody: "A successful save appears immediately in your meter. The public effect cache is published every five minutes and each meter checks every five minutes, so other players normally see it within about 5–10 minutes after a healthy publication.",
      rankerDungeonGuideOthersTitle: "If other players cannot see it",
      rankerDungeonGuideOthersBody: "They must be running NotMeter with ‘Show other characters’ nickname effects’ enabled. Right after an update, allow one additional refresh cycle.",
      rankerDungeonGuideRetentionTitle: "What if I leave the bracket?",
      rankerDungeonGuideRetentionBody: "A rank-granted effect is hidden if your detected CP leaves the qualifying 25K bracket or Top 3 eligibility is lost. The selected effect is kept and returns when eligibility is verified again.",
      rankerDungeonGuideDungeonTitle: "Dungeons with live rank markers",
      rankerDungeonGuideIntro: "The seven contents below are evaluated separately by boss, class, and CP bracket.",
      rankerDungeonDeusTitle: "Corrupted Deus Research Base (Hard)",
      rankerDungeonDeusBosses: "Supervisor Gromkas · Lab Director Xylus · Arrogant Atiel",
      rankerDungeonNoiranTitle: "Noiran's Hidden Legacy (Stage 4)",
      rankerDungeonNoiranBosses: "Incomplete Brownt · Mad Clominster · Askran",
      rankerDungeonBakronTitle: "Trial: Bakron's Sky Island",
      rankerDungeonBakronBosses: "Tie · Tamon · Bakron",
      rankerDungeonMusphelTitle: "Musphel's Grail (Hard)",
      rankerDungeonMusphelBosses: "Iskariel · Caldrix",
      rankerDungeonFallenDevaTitle: "Fallen Daeva's Castle (Hard)",
      rankerDungeonFallenDevaBosses: "Turgen of Will · Forbidden Beast Griosa · Deceitful Basilus",
      rankerDungeonAbyssHornTitle: "Abyssal Horn Cavern (Stage 4)",
      rankerDungeonAbyssHornBosses: "Kapu · Dakan · Gargaum",
      rankerDungeonNightmareTitle: "Nightmare",
      rankerDungeonNightmareBosses: "Awakened Atheron Stage 10 · ranked by fastest combat time, not DPS",
      rankerDungeonGuideScope: "The six regular dungeons rank higher DPS first; Nightmare ranks shorter combat time first. All Bosses only combines the statistics for viewing—the live rank marker is decided by each boss's individual ranking.",
      rankerDungeonGuideBakronRewardExcluded: "Trial: Bakron's Sky Island is included in rank markers but remains temporarily excluded from ranker-granted nickname effects.",
      rankerDungeonGuideDummy: "Training Dummy (1 min) provides website rankings only. It does not show the meter's post-combat bracket-rank or Top % badge, and it does not award a live rank marker.",
      rankerDungeonGuidePeriod: "Top % uses all-time records below 800K CP and current-week records at 800K CP or above. The current week runs from Wednesday 05:00 KST to the following Wednesday 05:00 KST.",
      weeklyCompare: "▲▼ shows the change in each class's top-25% DPS under the same filters",
      weeklyCompareNdps: "▲▼ shows the change in each class's top-25% nDPS under the same filters",
      weeklyTooltip: "Previous week, same filters",
      weeklyPreviousShort: "Prev.",
      weeklyPreviousTitle: "Previous week",
      weeklyPreviousRange: "Same filters · {range}",
      weeklyPreviousChange: "Top 25% vs. previous week {value}",
      weeklyPreviousNoData: "No previous-week sample under the same filters",
      weeklyGuideTitle: "What the ▲▼ weekly change means",
      weeklyGuideSubtitle: "Compares each class's top-25% DPS with the previous week under identical filters",
      weeklyUp: "Higher",
      weeklyDown: "Lower",
      weeklyFlat: "No change",
      weeklyGuidePurposeTitle: "Purpose",
      weeklyGuidePurpose: "A reference indicator for quickly spotting class performance trends after balance updates.",
      weeklyGuideBasisTitle: "Comparison basis",
      weeklyGuideBasis: "Top-25% DPS is the P75 threshold where the highest quarter of a class's samples begins. It compares this week's P75 with the previous week's under the same dungeon, boss, and CP bracket. A week runs from Wednesday at 05:00 KST to the following Wednesday at 05:00 KST.",
      weeklyGuideMeaningTitle: "Percentage meaning",
      weeklyGuideMeaning: "The change is calculated as (this week's P75 − previous week's P75) ÷ previous week's P75 × 100. ▲2.4% means this week's value is 2.4% higher, while ▼2.4% means it is 2.4% lower.",
      weeklyGuideRankingTitle: "How ranking uses it",
      weeklyGuideRanking: "Classes are sorted by this week's top-25% DPS. At 800K CP or above, bracket Top 20 and Top 3 nickname-effect access qualify from either all-time or current-week records. Post-combat Top % uses all-time records below 800K and current-week records at 800K or above.",
      weeklyGuideNote: "Each class row includes the previous week's sample count, top 10%, top 25%, median, and maximum under the same filters. Comparison values and arrows are hidden when no previous-week sample exists.",
      classDps: "{job} DPS — Top {count}",
      classCombatTime: "{job} Combat Time — Top {count}",
      top20: "TOP {count}",
      uniqueRankers: "{count} characters shown · only each character's highest DPS under these filters is shown",
      uniqueCombatTimeRankers: "{count} characters shown · only each character's fastest combat record under these filters is shown",
      backToJobs: "Back to classes",
      party: "PARTY",
      viewDetails: "View",
      characterProfile: "Character profile",
      characterProfileShort: "Profile",
      combatDetails: "Combat Details",
      detailLoading: "Loading combat details",
      detailUnavailable: "Combat details are temporarily unavailable. Please try again.",
      detailUnavailableTitle: "Details unavailable",
      detailUnavailableOld: "This record is not included in the current combat-detail cache. Records from version 1.0.149 or earlier are excluded from statistics.",
      detailUnavailableCustomCp: "This custom-CP ranking record is valid, but its combat details are not currently published in the detail cache. This does not mean the record is from version 1.0.149.",
      partyMembers: "Party members",
      totalDamage: "Total damage",
      contribution: "Contribution",
      deathCount: "Deaths",
      combatPower: "Combat Power",
      hits: "Hits",
      hitRate: "Hit rate",
      criticalRate: "Critical rate",
      skillCount: "Skills",
      skillBreakdown: "Skill Damage",
      skill: "Skill",
      damage: "Damage",
      damageHealing: "Damage / Healing",
      share: "Share",
      average: "Average",
      averageInterval: "Avg. interval",
      buffUptime: "Buff uptime",
      buffUptimeCaption: " / share of combat duration",
      visibleItems: "Visible items",
      openSettings: "Open settings",
      closeSettings: "Close settings",
      specialization: "Specialization",
      parry: "Parry",
      avoidance: "Evade",
      avoidanceBlock: "Evade / Incoming Block",
      block: "Incoming Block",
      blockDescription: "This is not your attacks being blocked. It shows how many boss attacks this character blocked and the percentage of incoming direct attacks blocked.",
      multiHit: "Multi-hit",
      critical: "Critical",
      front: "Front",
      back: "Back",
      perfect: "Perfect",
      doubleDamage: "Power hit",
      periodicDamage: "Periodic",
      healing: "Healing",
      healingCount: "Healing count",
      drainHealing: "Drain",
      useCount: "Used",
      averageDamage: "Average damage",
      maximumDamage: "Highest damage",
      recordedBuffsNone: "No recorded buffs",
      agoNow: "Updated just now",
      agoMinutes: "Updated {value}m ago",
      agoHours: "Updated {value}h ago",
      cacheInvalid: "This statistics cache format is not supported.",
      cacheUnavailable: "Please refresh again in a moment.",
    },
  };
  COPY["zh-TW"] = {
    ...(globalThis.NotMeterStatsCopyZhTw || {}),
    peopleValue: "{value} 人",
    artifactPageTitle: "NotMeter 神器現況",
    artifactPageSubtitle: "韓國伺服器對戰組合、佔領現況與下一場佔領戰",
    bossResistanceStats: "首領抗性統計",
    statEfficiencyCalculator: "屬性效率計算器",
    statEfficiencyPageTitle: "NotMeter 屬性效率計算器",
    statEfficiencyPageSubtitle: "依目前角色與實戰樣本比較成長效率",
    bossResistancePageTitle: "NotMeter 首領抗性統計",
    bossResistancePageSubtitle: "依全期間累積樣本分析各首領的強擊與完美抗性",
    bossResistanceStatsTitle: "首領抗性統計",
    bossResistanceStatsDescription: "依全期間累積樣本顯示各首領的強擊與完美抗性推估。",
    bossResistanceDungeonAria: "選擇首領抗性統計副本",
    bossResistanceAllTime: "全期間累積",
    hardHitResistance: "強擊抗性",
    perfectResistance: "完美抗性",
    criticalResistance: "暴擊抗性",
    evasion: "迴避",
    bossResistanceSettingEstimate: "遊戲設定推估",
    bossResistanceMeasuredEstimate: "實測推估值 {value}",
    bossResistanceSample: "累積樣本 {records} 場",
    bossResistancePending: "樣本收集中",
    bossResistanceSamplesGuide: "強擊與完美依全期間累積判定樣本，同時顯示最接近 5% 的遊戲設定值與實測推估值。",
    bossResistanceNoData: "目前沒有可顯示的首領資訊。",
    characterProfile: "角色資料",
    characterProfileShort: "角色",
    normalizedDpsVerified: "nDPS 已完成",
    normalizedDpsUnavailable: "無法計算 nDPS",
    normalizedDpsVerifiedTitle: "此紀錄可計算排除外部隊伍增益後的 nDPS。",
    normalizedDpsUnavailableTitle: "此紀錄缺少計算 nDPS 所需的資訊。",
    normalizedDpsDescription: "扣除外部隊伍 Buff 所產生之已驗證追加傷害後的個人 DPS",
    rankingMetric: "DPS / nDPS 排行基準",
    rankingMetricAria: "選擇排行基準",
    testBadge: "TEST",
    dpsRankingDescription: "包含隊伍 Buff 的既有總 DPS 排行。",
    ndpsRankingDescription: "扣除外部隊伍 Buff 所產生之已驗證追加傷害後的 nDPS 排行。",
    ndpsRankingFallbackDps: "此內容不適用 nDPS 校正，因此顯示 DPS 排行。",
    ndpsRankingUnavailableCombatTime: "此內容僅提供戰鬥時間排行。",
    ndpsEmpty: "所選條件目前沒有已驗證的 nDPS 紀錄",
    classNdps: "{job} nDPS 第 1～{count} 名",
    uniqueNormalizedRankers: "顯示 {count} 名角色 · 僅顯示每名角色最高的已驗證 nDPS 紀錄",
    totalDpsShort: "DPS",
    sampleBasisTitle: "為什麼樣本數變少",
    sampleBasisDescription: "在相同副本、首領、職業、25K CP 區間與期間下，每名角色依時間取最近最多 40 場。滿 10 場時排除最高與最低各 10%，以中間 80% 的平均值作為代表；不足 10 場則使用中位數。全期間也只使用最近 40 場，每名角色只計一次；少於 30 名角色的區間會以最接近的 25K 區間樣本校正。並非紀錄遭刪除或遺失。",
    sampleBasisChipsAria: "樣本統計重點",
    sampleBasisUniqueChip: "樣本＝不重複角色數",
    sampleBasisBestChip: "DPS、nDPS 最近最多 40 場校正平均",
    sampleBasisColumnTooltip: "相同條件下，每名角色以最近最多 40 場的校正代表值計算後的不重複角色數",
    recordSampleColumnTooltip: "自訂 CP 範圍內的戰鬥紀錄數；可能包含同一角色的重複挑戰",
    weeklyCompareNdps: "▲▼ 顯示相同條件下各職業前 25% nDPS 與上週的變化",
    weeklyPreviousShort: "上週",
    weeklyPreviousTitle: "上週統計",
    weeklyPreviousRange: "相同條件 · {range}",
    weeklyPreviousChange: "前 25% 較上週 {value}",
    weeklyPreviousNoData: "相同條件下沒有上週樣本",
  };

  function normalizeLocale(value) {
    const candidate = String(value || "").trim();
    if (SUPPORTED_LOCALES.includes(candidate)) {
      return candidate;
    }
    return detectBrowserLocale();
  }

  function detectBrowserLocale() {
    const browserLocales = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
    ].map(value => String(value || "").trim().toLowerCase()).filter(Boolean);
    for (const locale of browserLocales) {
      if (locale.startsWith("zh-tw") || locale.startsWith("zh-hant") ||
          locale.startsWith("zh-hk") || locale.startsWith("zh-mo") || locale === "zh") {
        return "zh-TW";
      }
      if (locale.startsWith("ko")) return "ko";
      if (locale.startsWith("en")) return "en";
      if (locale.startsWith("zh")) return "zh-TW";
    }
    return "en";
  }

  const state = {
    data: null,
    customCpData: null,
    customCpLoad: null,
    customCpRankData: new Map(),
    customCpRankLoads: new Map(),
    classRankingLoads: new Map(),
    viewRankingLoads: new Map(),
    loadedViewDungeonKeys: new Set(),
    customCpSummaryIndexes: new Map(),
    customCpRankIndexes: new Map(),
    locale: normalizeLocale(localStorage.getItem("notmeter-stats-locale")),
    dungeonKey: "",
    dungeonFilterExpanded: false,
    bossIndex: 0,
    cpTierIndex: 0,
    cpFilterMode: "standard",
    customCpPresetTierIndex: 0,
    customCpEditorOpen: false,
    customCpMinK: Math.min(1998, Math.max(400, Number(localStorage.getItem("notmeter-stats-custom-cp-min-k")) || 400)),
    customCpMaxK: Math.min(1999, Math.max(401, Number(localStorage.getItem("notmeter-stats-custom-cp-max-k")) || 420)),
    period: "Weekly",
    rankingMetric: "dps",
    selectedJob: "",
    selectedOverallJob: "",
    performanceMetric: localStorage.getItem("notmeter-class-performance-metric") || "p75Score",
    performanceExclusionMask: decodeClassPerformanceExclusionMask(),
    rankingNavigationBlockedUntil: 0,
    selectedDetail: null,
    detailMemory: new Map(),
    detailLoads: new Map(),
    mode: "summary",
    surfaceMode: "ranking",
    loading: false,
    lastCacheSyncAt: 0,
    iconAtlases: {
      skill: null,
      buff: null,
    },
    zhTwGameData: null,
    zhTwGameDataLoad: null,
    koreanGameNamesByTraditionalChinese: null,
    visibleMetrics: loadVisibleMetrics(),
    fieldBossData: null,
    fieldBossLoad: null,
    fieldBossServerId: Number(localStorage.getItem("notmeter-field-boss-server-id")) || 1001,
    fieldBossServerSearchOpen: false,
    fieldBossServerSearchIndex: -1,
    fieldBossRegion: -1,
    fieldBossLastSyncAt: 0,
    fieldBossRevision: "",
    fieldBossForceRefreshPending: false,
    fieldBossCountdownElements: new Map(),
    fieldBossClock: 0,
    contributionData: null,
    contributionLoad: null,
    contributionDungeonKey: "",
    bossResistanceDungeonKey: "",
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", () => {
    bindElements();
    syncTimedFeatureBadges();
    bindEvents();
    applyLocale();
    renderDetailSettings();
    void ensureLocaleGameData().then(() => {
      if (state.locale === "ko" || state.locale === "zh-TW") {
        applyLocale();
        populateFilters();
        render();
      }
    });
    const pageView = initialPageView();
    if (pageView !== "character") {
      void loadIconAtlases();
      void loadCache();
    }
    if (pageView === "character") {
      openCharacterView();
    } else if (pageView === "optimization") {
      openOptimizationView();
    } else if (pageView === "artifact") {
      openArtifactView();
    } else if (pageView === "field-boss") {
      openFieldBossView();
    } else if (pageView === "class-performance") {
      openClassPerformanceView(false);
    } else if (pageView === "setup-guide") {
      openContributionView();
    } else if (pageView === "boss-resistance") {
      openBossResistanceView();
    } else if (pageView === "stat-efficiency") {
      openStatEfficiencyView();
    } else if (pageView === "class-top10" || window.location.hash === "#class-top10" ||
        history.state?.notMeterStatsView === "class-top10") {
      openClassTop10View(false);
    } else if (window.location.hash === "#class-performance" ||
        history.state?.notMeterStatsView === "class-performance") {
      openClassPerformanceView(false);
    }
    window.setInterval(updateCacheAge, 60_000);
    scheduleRankingCacheSync();
    window.setInterval(() => {
      if (!document.hidden && state.surfaceMode === "fieldBoss") {
        void syncLatestFieldBossCache();
      }
    }, FIELD_BOSS_CACHE_SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        void syncLatestCache();
        void syncLatestFieldBossCache();
      }
    });
    window.addEventListener("pageshow", event => {
      void syncLatestCache(Boolean(event.persisted));
      void syncLatestFieldBossCache();
    });
    window.addEventListener("online", () => {
      void syncLatestCache(true);
      void syncLatestFieldBossCache(true);
    });
  });

  function bindElements() {
    for (const id of [
      "page-title", "page-subtitle", "daily-user-count", "language-button",
      "character-surface", "character-back-button",
      "optimization-button", "optimization-surface", "optimization-back-button",
      "optimization-frame",
      "contribution-button", "contribution-surface", "contribution-back-button",
      "contribution-summary", "contribution-period", "contribution-records",
      "contribution-samples", "contribution-low-samples", "contribution-tabs",
      "contribution-loading-state", "contribution-error-state", "contribution-error-message",
      "contribution-retry-button", "contribution-empty-state", "contribution-content",
      "contribution-dungeon-title", "contribution-rows",
      "boss-resistance-button", "boss-resistance-surface", "boss-resistance-back-button",
      "boss-resistance-tabs", "boss-resistance-content", "boss-resistance-dungeon-title",
      "boss-resistance-rows", "boss-resistance-empty",
      "stat-efficiency-button", "stat-efficiency-surface", "stat-efficiency-back-button",
      "class-performance-button", "class-performance-surface",
      "class-performance-back-button", "class-performance-summary",
      "class-performance-metric-title", "class-performance-metric-description",
      "class-performance-composition-jobs", "class-performance-composition-reset",
      "class-performance-composition-status",
      "class-performance-pending", "class-performance-empty", "class-performance-chart",
      "class-top10-button", "class-top10-surface", "class-top10-back-button",
      "class-top10-tabs", "class-top10-pending", "class-top10-empty",
      "class-top10-view", "class-top10-rows",
      "field-boss-button", "field-boss-surface", "field-boss-back-button",
      "artifact-button", "artifact-surface", "artifact-back-button",
      "field-boss-server", "field-boss-server-results",
      "field-boss-refresh-button", "field-boss-retry-button",
      "field-boss-snapshot", "field-boss-snapshot-title", "field-boss-snapshot-caption",
      "field-boss-entry-count", "field-boss-cache-age", "field-boss-loading-state",
      "field-boss-error-state", "field-boss-error-message", "field-boss-empty-state",
      "field-boss-content", "field-boss-tabs", "field-boss-list",
      "dungeon-filter", "dungeon-filter-buttons", "dungeon-filter-more",
      "ranking-metric-choice", "ranking-metric-description", "ranking-metric-dps", "ranking-metric-ndps",
      "boss-filter", "boss-filter-buttons", "cp-filter", "cp-filter-toggle",
      "cp-filter-current", "cp-filter-menu", "cp-filter-menu-close",
      "cp-filter-quick", "cp-filter-groups",
      "custom-cp-panel", "custom-cp-min", "custom-cp-max", "custom-cp-apply", "custom-cp-result",
      "period-filter", "refresh-button", "retry-button", "snapshot-title", "snapshot-caption",
      "sample-meta", "generated-meta", "weekly-guide", "class-heading", "class-title",
      "class-badge", "class-caption", "sample-column-heading", "class-metric-heading",
      "back-button", "loading-state", "error-state", "error-message", "empty-state", "empty-message",
      "summary-view", "summary-rows", "class-view", "class-rows", "cache-age",
      "combat-detail-modal", "detail-close", "detail-job-icon", "detail-title",
      "detail-character", "detail-duration", "detail-cp", "detail-total-damage",
      "detail-dps", "detail-ndps-row", "detail-ndps", "detail-share", "detail-summary-duration", "detail-death-count", "detail-hits",
      "detail-parry-rate", "detail-critical-rate", "detail-front-rate", "detail-back-rate",
      "detail-perfect-rate", "detail-double-rate", "detail-evade-rate", "detail-block-row",
      "detail-block-rate", "detail-cp-row",
      "detail-visible-count", "detail-settings-toggle", "detail-settings-options",
      "detail-skill-rows", "detail-buffs-section", "detail-buffs", "detail-buff-count",
      "detail-party-tabs",
    ]) {
      elements[id] = document.getElementById(id);
    }
  }

  function syncTimedFeatureBadges() {
    const now = Date.now();
    let nextExpiration = Number.POSITIVE_INFINITY;
    document.querySelectorAll("[data-feature-new-until]").forEach(badge => {
      const expiration = Date.parse(badge.dataset.featureNewUntil || "");
      const visible = Number.isFinite(expiration) && now < expiration;
      badge.hidden = !visible;
      if (visible) {
        nextExpiration = Math.min(nextExpiration, expiration);
      }
    });
    if (Number.isFinite(nextExpiration)) {
      window.setTimeout(
        syncTimedFeatureBadges,
        Math.max(1_000, Math.min(2_147_000_000, nextExpiration - now + 250)));
    }
  }

  function bindEvents() {
    elements["language-button"].addEventListener("change", event => {
      const openDetail = state.selectedDetail;
      state.locale = normalizeLocale(event.currentTarget.value);
      localStorage.setItem("notmeter-stats-locale", state.locale);
      applyLocale();
      window.NotMeterStatEfficiency?.activate();
      populateFilters();
      render();
      if (openDetail) {
        state.selectedDetail = openDetail;
        renderCombatDetail();
      }
      if ((state.locale === "ko" || state.locale === "zh-TW") && !state.zhTwGameData) {
        const requestedLocale = state.locale;
        void ensureLocaleGameData().then(payload => {
          if (!payload || state.locale !== requestedLocale) return;
          applyLocale();
          populateFilters();
          render();
          if (openDetail) {
            state.selectedDetail = openDetail;
            renderCombatDetail();
          }
        });
      }
    });
    elements["optimization-frame"].addEventListener("load", () => {
      syncOptimizationFrameLocale();
      requestOptimizationFrameHeight();
    });
    elements["class-top10-back-button"].addEventListener(
      "click",
      returnToRankingFromClassTop10);
    elements["class-performance-back-button"].addEventListener(
      "click",
      returnToRankingFromClassPerformance);
    elements["contribution-retry-button"].addEventListener("click", () => {
      void loadContributionCache(true);
    });
    elements["contribution-tabs"].addEventListener("click", event => {
      const button = event.target.closest("[data-contribution-dungeon]");
      if (!button) return;
      state.contributionDungeonKey = button.dataset.contributionDungeon;
      renderContributionStats();
    });
    elements["boss-resistance-tabs"].addEventListener("click", event => {
      const button = event.target.closest("[data-boss-resistance-dungeon]");
      if (!button) return;
      state.bossResistanceDungeonKey = button.dataset.bossResistanceDungeon;
      renderBossResistanceView();
    });
    elements["class-performance-composition-reset"].addEventListener("click", () => {
      state.performanceExclusionMask = 0;
      saveClassPerformanceExclusion();
      renderClassPerformanceInPlace();
    });
    elements["class-performance-composition-jobs"].addEventListener("click", event => {
      const button = event.target.closest("[data-composition-job]");
      if (!button) {
        return;
      }
      const index = Number(button.dataset.compositionJob);
      if (!Number.isInteger(index) || index < 0 || index >= JOB_ORDER.length) {
        return;
      }
      state.performanceExclusionMask ^= 1 << index;
      saveClassPerformanceExclusion();
      renderClassPerformanceInPlace();
    });
    document.querySelectorAll("[data-performance-metric]").forEach(button => {
      button.addEventListener("click", () => {
        state.performanceMetric = button.dataset.performanceMetric;
        localStorage.setItem("notmeter-class-performance-metric", state.performanceMetric);
        renderClassPerformance();
      });
    });
    elements["field-boss-server"].addEventListener("focus", event => {
      event.target.select();
      openFieldBossServerSearch();
    });
    elements["field-boss-server"].addEventListener("input", () => {
      state.fieldBossServerSearchIndex = -1;
      openFieldBossServerSearch();
    });
    elements["field-boss-server"].addEventListener("keydown", handleFieldBossServerKeydown);
    elements["field-boss-server-results"].addEventListener("pointerdown", event => {
      const option = event.target.closest("[data-server-id]");
      if (!option) {
        return;
      }
      event.preventDefault();
      selectFieldBossServer(Number(option.dataset.serverId));
    });
    document.addEventListener("pointerdown", event => {
      if (!event.target.closest(".field-boss-server-field")) {
        closeFieldBossServerSearch(true);
      }
    });
    elements["field-boss-refresh-button"].addEventListener("click", () => {
      void loadFieldBossCache(true);
    });
    elements["field-boss-retry-button"].addEventListener("click", () => {
      void loadFieldBossCache(true);
    });
    elements["dungeon-filter"].addEventListener("change", event => {
      closeCombatDetail();
      applyDungeonSelection(event.target.value);
      populateFilters();
      render();
    });
    elements["ranking-metric-choice"].addEventListener("click", event => {
      const button = event.target.closest("[data-ranking-metric]");
      if (!button || button.disabled) {
        return;
      }
      const metric = button.dataset.rankingMetric === "ndps" ? "ndps" : "dps";
      if (metric === state.rankingMetric) {
        return;
      }
      state.rankingMetric = metric;
      closeCombatDetail();
      leaveClassView();
      render();
    });
    elements["dungeon-filter-buttons"].addEventListener("click", event => {
      const button = event.target.closest("[data-dungeon-key]");
      if (!button || button.dataset.dungeonKey === state.dungeonKey) {
        return;
      }
      closeCombatDetail();
      applyDungeonSelection(button.dataset.dungeonKey);
      populateFilters();
      render();
    });
    elements["dungeon-filter-more"].addEventListener("click", () => {
      state.dungeonFilterExpanded = !state.dungeonFilterExpanded;
      renderDungeonFilterButtons();
    });
    elements["boss-filter"].addEventListener("change", event => {
      state.bossIndex = Number(event.target.value);
      leaveClassView();
      render();
    });
    elements["boss-filter-buttons"].addEventListener("click", event => {
      const button = event.target.closest("[data-boss-index]");
      if (!button) {
        return;
      }
      const bossIndex = Number(button.dataset.bossIndex);
      if (!Number.isInteger(bossIndex) || bossIndex === state.bossIndex) {
        return;
      }
      state.bossIndex = bossIndex;
      elements["boss-filter"].value = String(bossIndex);
      leaveClassView();
      renderBossFilterButtons();
      render();
    });
    elements["cp-filter"].addEventListener("change", event => {
      void applyCpFilterSelection(event.target.value);
    });
    elements["cp-filter-toggle"].addEventListener("click", () => {
      if (elements["cp-filter-menu"].hidden) {
        openCpFilterMenu();
      } else {
        closeCpFilterMenu(true);
      }
    });
    elements["cp-filter-menu-close"].addEventListener("click", () => {
      closeCpFilterMenu(true);
    });
    elements["cp-filter-menu"].addEventListener("click", event => {
      const button = event.target.closest("[data-cp-value]");
      if (!button) {
        return;
      }
      closeCpFilterMenu(false);
      void applyCpFilterSelection(button.dataset.cpValue);
    });
    elements["custom-cp-apply"].addEventListener("click", () => void applyCustomCpValue());
    for (const input of [elements["custom-cp-min"], elements["custom-cp-max"]]) {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          void applyCustomCpValue();
        }
      });
    }
    elements["period-filter"].addEventListener("change", event => {
      state.period = event.target.value;
      leaveClassView();
      render();
    });
    elements["refresh-button"].addEventListener("click", () => void loadCache(true, true));
    elements["retry-button"].addEventListener("click", () => void loadCache(true));
    elements["back-button"].addEventListener("click", event => {
      if (isRepeatedPointerActivation(event)) {
        return;
      }
      if (history.state?.notMeterStatsView === "class") {
        history.back();
        return;
      }
      leaveClassView();
      render();
    });
    window.addEventListener("popstate", event => {
      if (event.state?.notMeterStatsView === "class-performance") {
        openClassPerformanceView(false);
        return;
      }
      if (event.state?.notMeterStatsView === "class-top10") {
        openClassTop10View(false);
        return;
      }
      if (event.state?.notMeterStatsView === "contribution") {
        openContributionView();
        return;
      }
      if (event.state?.notMeterStatsView === "boss-resistance") {
        openBossResistanceView();
        return;
      }
      closeFieldBossView();
      closeArtifactView();
      closeClassTop10View();
      closeClassPerformanceView();
      closeContributionView();
      closeBossResistanceView();
      closeStatEfficiencyView();
      closeOptimizationView();
      const job = event.state?.notMeterStatsJob;
      if (event.state?.notMeterStatsView === "class" && job) {
        state.selectedJob = job;
        state.mode = "class";
        blockRankingNavigation();
      } else {
        leaveClassView();
      }
      render();
    });
    window.addEventListener("message", handleOptimizationFrameMessage);
    elements["detail-close"].addEventListener("click", closeCombatDetail);
    elements["detail-settings-toggle"].addEventListener("click", () => {
      const options = elements["detail-settings-options"];
      options.hidden = !options.hidden;
      elements["detail-settings-toggle"].textContent =
        t(options.hidden ? "openSettings" : "closeSettings");
    });
    elements["combat-detail-modal"].addEventListener("click", event => {
      if (event.target === elements["combat-detail-modal"]) {
        closeCombatDetail();
      }
    });
    document.addEventListener("pointerdown", event => {
      if (!elements["cp-filter-menu"].hidden && !event.target.closest(".filter-cp-field")) {
        closeCpFilterMenu(false);
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !elements["cp-filter-menu"].hidden) {
        closeCpFilterMenu(true);
        return;
      }
      if (event.key === "Escape" && state.selectedDetail) {
        closeCombatDetail();
      }
    });
  }

  async function ensureLocaleGameData() {
    if ((state.locale !== "ko" && state.locale !== "zh-TW") || state.zhTwGameData) {
      return state.zhTwGameData;
    }
    if (state.zhTwGameDataLoad) {
      return state.zhTwGameDataLoad;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);
    state.zhTwGameDataLoad = fetch(ZH_TW_GAME_DATA_URL, {
      cache: "force-cache",
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Traditional Chinese game data HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(payload => {
        if (payload?.locale !== "zh-TW" || !payload.names || !payload.skills ||
            !payload.mobs || !payload.buffs || !payload.koSkills ||
            !payload.koMobs || !payload.koBuffs) {
          throw new Error("Traditional Chinese game data format is invalid");
        }
        state.zhTwGameData = payload;
        state.koreanGameNamesByTraditionalChinese = buildKoreanGameNameIndex(payload);
        return payload;
      })
      .catch(() => null)
      .finally(() => {
        window.clearTimeout(timeoutId);
        state.zhTwGameDataLoad = null;
      });
    return state.zhTwGameDataLoad;
  }

  function localeTag() {
    return state.locale === "ko" ? "ko-KR" : state.locale === "zh-TW" ? "zh-TW" : "en-US";
  }

  function buildKoreanGameNameIndex(payload) {
    const candidates = new Map();
    const add = (korean, traditionalChinese) => {
      const ko = String(korean || "").trim();
      const zh = String(traditionalChinese || "").trim();
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
      index.set(String(traditionalChinese).trim(), String(korean).trim());
    }
    for (const [korean, traditionalChinese] of Object.entries(GAME_NAME_OVERRIDES_ZH_TW)) {
      index.set(String(traditionalChinese).trim(), String(korean).trim());
    }
    return index;
  }

  function localizeGameName(value, type = "", ...codes) {
    const original = String(value || "").trim();
    if (state.locale !== "ko" && state.locale !== "zh-TW") {
      return original;
    }
    if (!state.zhTwGameData) {
      if (state.locale === "zh-TW") return GAME_NAME_OVERRIDES_ZH_TW[original] || original;
      return original;
    }

    const korean = state.locale === "ko";
    const collection = type === "skill"
      ? korean ? state.zhTwGameData.koSkills : state.zhTwGameData.skills
      : type === "mob"
        ? korean ? state.zhTwGameData.koMobs : state.zhTwGameData.mobs
        : type === "buff"
          ? korean ? state.zhTwGameData.koBuffs : state.zhTwGameData.buffs
          : null;
    for (const code of codes) {
      let normalizedCode = Math.abs(Math.trunc(Number(code) || 0));
      while (normalizedCode > 0) {
        const byCode = String(collection?.[String(normalizedCode)] || "").trim();
        if (byCode) {
          return byCode;
        }
        if (normalizedCode <= 99_999_999) {
          break;
        }
        normalizedCode = Math.trunc(normalizedCode / 10);
      }
    }
    if (korean) {
      return String(state.koreanGameNamesByTraditionalChinese?.get(original) || original);
    }
    return String(state.zhTwGameData.aliases?.[original] ||
      GAME_NAME_OVERRIDES_ZH_TW[original] || state.zhTwGameData.names?.[original] || original);
  }

  globalThis.NotMeterStatsLocalization = Object.freeze({
    gameName: localizeGameName,
  });

  globalThis.NotMeterPublicRankingCache = Object.freeze({
    async load(force = false) {
      const cache = await fetchRankingCache(Boolean(force));
      validateCache(cache);
      if (!shouldApplyRankingCache(cache, state.data)) {
        return state.data;
      }
      cache.classRankings = cache.classRankings && typeof cache.classRankings === "object"
        ? cache.classRankings
        : {};
      updateDailyUsers(cache);
      return cache;
    },
    async loadClass(dungeonKey, expectedGeneratedAt, force = false) {
      return fetchClassRankingCache(
        dungeonKey,
        String(expectedGeneratedAt || ""),
        Boolean(force));
    },
    async loadView(dungeonKey, expectedGeneratedAt, force = false) {
      return fetchViewRankingCache(
        dungeonKey,
        String(expectedGeneratedAt || ""),
        Boolean(force));
    },
  });

  function applyDungeonSelection(dungeonKey) {
    state.dungeonKey = dungeonKey;
    state.bossIndex = 0;
    resetClassSelection();
  }

  function applyGitHubRankingRevision(revision) {
    if (!/^[0-9a-f]{40}$/i.test(String(revision || ""))) {
      throw new Error("invalid GitHub cache revision");
    }
    const normalized = String(revision).toLowerCase();
    GITHUB_RANKING_CACHE_ROOT =
      `${GITHUB_RANKING_REPOSITORY_ROOT}/${normalized}/data`;
    CACHE_URLS[0] = `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking.json.gz`;
    CLASS_OVERALL_CACHE_URLS[0] =
      `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-class-overall.json.gz`;
    CONTRIBUTION_CACHE_URLS[0] =
      `${GITHUB_RANKING_CACHE_ROOT}/notmeter-setting-guide.json.gz`;
    CUSTOM_CP_CACHE_URLS[0] =
      `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-custom-cp.json.gz`;
    GITHUB_CLASS_RANKING_CACHE_ROOT = `${GITHUB_RANKING_CACHE_ROOT}/classes`;
    GITHUB_VIEW_RANKING_CACHE_ROOT = `${GITHUB_RANKING_CACHE_ROOT}/views`;
  }

  function encodeReleaseAssetPath(path) {
    const normalized = String(path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (!normalized || normalized.split("/").some(part => !part || part === "." || part === "..")) {
      throw new Error("invalid GitHub release cache path");
    }
    const bytes = new TextEncoder().encode(normalized);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return window.btoa(binary).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  function applyGitHubRankingRelease(release) {
    const previousGeneration = githubRankingReleaseGeneration;
    githubRankingReleaseTag = "";
    githubRankingReleaseGeneration = "";
    if (release?.schema !== "notmeter-release-cache-v1" ||
        release?.assetEncoding !== "base64url-path-v1" ||
        !/^(notmeter-cache-a|notmeter-cache-b)$/.test(String(release?.tag || "")) ||
        !/^[0-9a-f]{12,64}$/i.test(String(release?.generation || ""))) {
      return;
    }
    githubRankingReleaseTag = String(release.tag);
    githubRankingReleaseGeneration = String(release.generation).toLowerCase();
    if (githubRankingReleaseGeneration !== previousGeneration) {
      vpsFallbackSpreadPromise = null;
    }
  }

  function githubReleaseCacheUrl(path) {
    if (!githubRankingReleaseTag || !githubRankingReleaseGeneration) {
      return "";
    }
    const assetName = `g-${githubRankingReleaseGeneration}-p-${encodeReleaseAssetPath(path)}`;
    return `${GITHUB_RANKING_RELEASE_ROOT}/${encodeURIComponent(githubRankingReleaseTag)}/${encodeURIComponent(assetName)}`;
  }

  function githubCacheCandidates(path, rawUrl) {
    // The fixed Release slots currently publish client dungeon shards under
    // data/client/classes, but the web-only data/views and data/classes shards
    // remain on the immutable Git revision. Do not spend two retries on a
    // release asset that cannot exist before using the matching revision URL.
    const releaseAssetAvailable =
      !/^data\/(?:views|classes)\//i.test(String(path || ""));
    const releaseUrl = releaseAssetAvailable ? githubReleaseCacheUrl(path) : "";
    return releaseUrl ? [releaseUrl, rawUrl] : [rawUrl];
  }

  function sameOriginRankingCacheUrl(path) {
    const normalized = String(path || "").replace(/\\/g, "/").replace(/^\/+/, "");
    return `./${normalized}`;
  }

  function rankingCacheCandidates(path, rawUrl) {
    return [
      sameOriginRankingCacheUrl(path),
      ...githubCacheCandidates(path, rawUrl),
    ];
  }

  function refreshRankingCacheCandidateUrls() {
    CACHE_URLS.splice(0, CACHE_URLS.length,
      ...rankingCacheCandidates(
        "data/notmeter-ranking.json.gz",
        `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking.json.gz`),
      `${VPS_RANKING_CACHE_ROOT}/web/main?layout=view-shards-v2`);
    CLASS_OVERALL_CACHE_URLS.splice(0, CLASS_OVERALL_CACHE_URLS.length,
      ...rankingCacheCandidates(
        "data/notmeter-ranking-class-overall.json.gz",
        `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-class-overall.json.gz`),
      `${VPS_RANKING_CACHE_ROOT}/web/class-overall`);
    CONTRIBUTION_CACHE_URLS.splice(0, CONTRIBUTION_CACHE_URLS.length,
      ...rankingCacheCandidates(
        "data/notmeter-setting-guide.json.gz",
        `${GITHUB_RANKING_CACHE_ROOT}/notmeter-setting-guide.json.gz`),
      `${VPS_RANKING_CACHE_ROOT}/web/setup-guide`);
    CUSTOM_CP_CACHE_URLS.splice(0, CUSTOM_CP_CACHE_URLS.length,
      ...rankingCacheCandidates(
        "data/notmeter-ranking-custom-cp.json.gz",
        `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-custom-cp.json.gz`),
      `${VPS_RANKING_CACHE_ROOT}/custom-cp/summary`);
  }

  async function refreshGitHubRankingRevision(force = false) {
    if (githubRankingManifestLoad) {
      return githubRankingManifestLoad;
    }
    const load = (async () => {
      const errors = [];
      let manifest = null;
      for (const baseUrl of GITHUB_RANKING_MANIFEST_URLS) {
        const controller = typeof AbortController === "function" ? new AbortController() : null;
        const timeoutId = controller
          ? window.setTimeout(() => controller.abort(), 10_000)
          : 0;
        try {
          const separator = baseUrl.includes("?") ? "&" : "?";
          const response = await fetch(
            `${baseUrl}${separator}v=${Date.now()}`,
            {
              cache: force ? "reload" : "no-cache",
              headers: { Accept: "application/json" },
              signal: controller?.signal,
            });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const candidate = await response.json();
          if (candidate?.schema !== "notmeter-cache-generation-v1" ||
              Number(candidate?.version) !== 1 ||
              !/^[0-9a-f]{40}$/i.test(String(candidate?.revision || ""))) {
            throw new Error("invalid GitHub cache manifest");
          }
          manifest = candidate;
          break;
        } catch (error) {
          errors.push(`${baseUrl}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
        }
      }
      if (!manifest) {
        throw new Error(errors.join(" / "));
      }
      applyGitHubRankingRevision(manifest.revision);
      applyGitHubRankingRelease(manifest.release);
      githubRankingManifestPublishedAt = Date.parse(String(manifest.publishedAt || "")) || 0;
      refreshRankingCacheCandidateUrls();
      return String(manifest.revision).toLowerCase();
    })();
    githubRankingManifestLoad = load;
    try {
      return await load;
    } finally {
      githubRankingManifestLoad = null;
    }
  }

  async function loadCache(force = false, preserveView = false) {
    if (state.loading) {
      return;
    }
    state.loading = true;
    elements["refresh-button"].disabled = true;
    if (!preserveView) {
      showState("loading");
    }

    try {
      await refreshGitHubRankingRevision(force).catch(error => {
        console.warn("GitHub cache manifest unavailable; using stable fallback", error);
      });
      const [cache, initialClassOverallCache] = await Promise.all([
        fetchRankingCache(force),
        fetchClassOverallCache(force).catch(error => {
          console.warn("class overall cache unavailable", error);
          return null;
        }),
      ]);
      validateCache(cache);
      if (!shouldApplyRankingCache(cache, state.data)) {
        console.warn("older ranking cache ignored", {
          currentGeneratedAt: state.data?.generatedAt || null,
          receivedGeneratedAt: cache.generatedAt,
        });
        state.lastCacheSyncAt = Date.now();
        render();
        return;
      }
      cache.classRankings = cache.classRankings && typeof cache.classRankings === "object"
        ? cache.classRankings
        : {};
      cache.bossResistanceStats = Array.isArray(cache.bossResistanceStats)
        ? cache.bossResistanceStats
        : [];
      cache.dungeons = orderDungeonsForDisplay(cache.dungeons);
      let classOverallCache = initialClassOverallCache;
      if (!isMatchingClassOverallCache(classOverallCache, cache.generatedAt)) {
        console.warn("class overall cache generation mismatch; retrying matching cache", {
          rankingGeneratedAt: cache.generatedAt,
          classOverallGeneratedAt: classOverallCache?.generatedAt || null,
        });
        classOverallCache = await fetchClassOverallCache(force, cache.generatedAt)
          .catch(error => {
            console.warn("matching class overall cache unavailable", error);
            return null;
          });
      }
      if (isMatchingClassOverallCache(classOverallCache, cache.generatedAt)) {
        cache.classOverall = classOverallCache.classOverall;
        cache.classPerformance = classOverallCache.classPerformance;
        cache.classOverallGeneratedAt = classOverallCache.generatedAt;
      }
      if (cache.classOverall && !cache.classOverallGeneratedAt) {
        cache.classOverallGeneratedAt = cache.generatedAt;
      }
      if (preserveView && !force &&
        state.data &&
        String(cache.generatedAt) === String(state.data.generatedAt) &&
        String(cache.classOverallGeneratedAt || "") ===
          String(state.data.classOverallGeneratedAt || "")) {
        state.lastCacheSyncAt = Date.now();
        return;
      }
      const previousDungeon = state.dungeonKey;
      const nextDungeon = cache.dungeons.some(item => item.key === previousDungeon)
        ? previousDungeon
        : cache.dungeons[0]?.key || "";
      const globalViews = Array.isArray(cache.views)
        ? cache.views.filter(view => String(view?.dungeonKey || "").startsWith("__"))
        : [];
      const embeddedViews = Array.isArray(cache.views)
        ? cache.views.filter(view =>
            !String(view?.dungeonKey || "").startsWith("__"))
        : [];
      const initialDungeonViews = embeddedViews.filter(view =>
        String(view?.dungeonKey || "").toLowerCase() === nextDungeon.toLowerCase());
      const initialViews = initialDungeonViews.length > 0
        ? initialDungeonViews
        : await fetchViewRankingCache(nextDungeon, cache.generatedAt, force);
      // 현재 Release의 웹 본문에는 모든 던전 요약 뷰가 이미 들어 있다.
      // 이를 버린 뒤 오래된 분할 파일을 다시 받으면 세대 불일치 재시도와
      // VPS 대기열을 거치므로, 본문에 포함된 뷰는 그대로 재사용한다.
      cache.views = globalViews.concat(
        embeddedViews.length > 0 ? embeddedViews : initialViews);
      const nextDungeonBossCount = cache.dungeons
        .find(item => item.key === nextDungeon)?.bossNames?.length || 0;
      const nextBossIndex = state.bossIndex >= 1 && state.bossIndex <= nextDungeonBossCount
        ? state.bossIndex
        : 0;
      const generationChanged = !state.data ||
        String(cache.generatedAt) !== String(state.data.generatedAt);
      if (generationChanged) {
        state.classRankingLoads.clear();
        state.viewRankingLoads.clear();
        state.loadedViewDungeonKeys.clear();
      }
      let preparedCustomCp = null;
      let preparedCustomCpRank = null;
      if (state.cpFilterMode === "custom" && (generationChanged || force)) {
        try {
          const prepared = await prepareCustomCpGeneration(
            cache.generatedAt,
            nextDungeon,
            nextBossIndex,
            force,
            state.mode === "class");
          preparedCustomCp = prepared.summary;
          preparedCustomCpRank = prepared.rank;
        } catch (error) {
          console.warn("matching custom CP cache unavailable", error);
          if (generationChanged) {
            throw error;
          }
        }
      }
      state.lastCacheSyncAt = Date.now();
      closeCombatDetail();
      if (preparedCustomCp || generationChanged) {
        state.customCpData = null;
        state.customCpLoad = null;
        state.customCpRankData.clear();
        state.customCpRankLoads.clear();
        state.customCpSummaryIndexes.clear();
        state.customCpRankIndexes.clear();
      }
      state.data = cache;
      for (const view of cache.views) {
        const embeddedDungeonKey = String(view?.dungeonKey || "").trim().toLowerCase();
        if (embeddedDungeonKey && !embeddedDungeonKey.startsWith("__")) {
          state.loadedViewDungeonKeys.add(embeddedDungeonKey);
        }
      }
      state.loadedViewDungeonKeys.add(nextDungeon);
      if (preparedCustomCp) {
        state.customCpData = preparedCustomCp;
      }
      if (preparedCustomCpRank) {
        state.customCpRankData.set(
          customCpRankCacheKey(nextDungeon, nextBossIndex),
          preparedCustomCpRank);
      }
      state.detailMemory.clear();
      void pruneDetailCache(cache.generatedAt);
      state.dungeonKey = nextDungeon;
      state.bossIndex = nextBossIndex;
      if (!preserveView || state.dungeonKey !== previousDungeon) {
        resetClassSelection();
      }
      updateDailyUsers();
      populateFilters();
      if (state.cpFilterMode === "custom" &&
          !isMatchingCustomCpCache(state.customCpData, cache.generatedAt)) {
        await ensureCustomCpCache(force);
      }
      render();
    } catch (error) {
      console.error(error);
      if (preserveView) {
        return;
      }
      elements["error-message"].textContent =
        error instanceof Error && error.message ? error.message : t("cacheUnavailable");
      showState("error");
    } finally {
      state.loading = false;
      elements["refresh-button"].disabled = false;
    }
  }

  async function syncLatestCache(force = false) {
    if (state.loading ||
      !state.data ||
      (!force && Date.now() - state.lastCacheSyncAt < CACHE_SYNC_THROTTLE_MS)) {
      return;
    }
    await loadCache(force, true);
  }

  function scheduleRankingCacheSync() {
    const delay = CACHE_SYNC_INTERVAL_MS +
      Math.floor(Math.random() * CACHE_SYNC_JITTER_MS);
    window.setTimeout(async () => {
      try {
        if (!document.hidden) {
          await syncLatestCache();
        }
      } finally {
        scheduleRankingCacheSync();
      }
    }, delay);
  }

  async function syncLatestFieldBossCache(force = false) {
    if (state.surfaceMode !== "fieldBoss" || document.hidden) {
      return;
    }
    if (!force &&
        Date.now() - state.fieldBossLastSyncAt < FIELD_BOSS_CACHE_RESUME_THROTTLE_MS) {
      return;
    }
    await loadFieldBossCache(force);
  }

  function initialPageView() {
    const view = new URLSearchParams(window.location.search).get("view");
    if (view === "contribution") return "setup-guide";
    return view === "class-top10" || view === "field-boss" || view === "artifact" || view === "optimization" ||
      view === "class-performance" || view === "setup-guide" ||
      view === "boss-resistance" || view === "stat-efficiency" ||
      view === "character" ? view : "ranking";
  }

  function openCharacterView() {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "character";
    document.body.classList.add("character-view");
    elements["character-surface"].hidden = false;
    updatePageIdentity();
    const rankingCacheLoader = globalThis.NotMeterPublicRankingCache?.load;
    if (typeof rankingCacheLoader === "function") {
      void rankingCacheLoader(false).catch(error => {
        console.warn("character header statistics unavailable", error);
      });
    }
    window.NotMeterCharacter?.activate();
  }

  function openOptimizationView() {
    closeFieldBossView();
    closeArtifactView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "optimization";
    document.body.classList.add("optimization-view");
    elements["optimization-surface"].hidden = false;
    elements["optimization-button"].classList.add("active");
    elements["optimization-button"].setAttribute("aria-current", "page");
    ensureOptimizationFrame();
    updatePageIdentity();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeOptimizationView() {
    if (state.surfaceMode !== "optimization") {
      return;
    }
    state.surfaceMode = "ranking";
    document.body.classList.remove("optimization-view");
    elements["optimization-surface"].hidden = true;
    elements["optimization-button"].classList.remove("active");
    elements["optimization-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function ensureOptimizationFrame() {
    const frame = elements["optimization-frame"];
    if (!frame.getAttribute("src")) {
      frame.setAttribute("src", frame.dataset.src);
      return;
    }
    syncOptimizationFrameLocale();
    requestOptimizationFrameHeight();
  }

  function syncOptimizationFrameLocale() {
    const frame = elements["optimization-frame"];
    frame?.contentWindow?.postMessage({
      type: "notmeter-optimizer-locale",
      locale: state.locale,
    }, window.location.origin);
  }

  function requestOptimizationFrameHeight() {
    const frame = elements["optimization-frame"];
    frame?.contentWindow?.postMessage({
      type: "notmeter-optimizer-request-height",
    }, window.location.origin);
  }

  function handleOptimizationFrameMessage(event) {
    const frame = elements["optimization-frame"];
    if (!frame || event.origin !== window.location.origin ||
        event.source !== frame.contentWindow ||
        event.data?.type !== "notmeter-optimizer-height") {
      return;
    }
    const height = Math.ceil(Number(event.data.height));
    if (!Number.isFinite(height) || height < 320) {
      return;
    }
    frame.style.height = `${Math.min(height, 20_000)}px`;
  }

  function openClassTop10View(pushHistory) {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "classTop10";
    document.body.classList.add("class-top10-view");
    elements["class-top10-surface"].hidden = false;
    elements["class-top10-button"].classList.add("active");
    elements["class-top10-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    renderClassTop10();
    if (pushHistory) {
      history.pushState({ notMeterStatsView: "class-top10" }, "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeClassTop10View() {
    if (state.surfaceMode !== "classTop10") {
      return;
    }
    state.surfaceMode = "ranking";
    document.body.classList.remove("class-top10-view");
    elements["class-top10-surface"].hidden = true;
    elements["class-top10-button"].classList.remove("active");
    elements["class-top10-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function returnToRankingFromClassTop10() {
    if (initialPageView() === "class-top10") {
      window.location.assign(new URL("./", window.location.href).href);
      return;
    }
    if (history.state?.notMeterStatsView === "class-top10") {
      history.back();
      return;
    }
    closeClassTop10View();
    closeBossResistanceView();
    closeContributionView();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openClassPerformanceView(pushHistory) {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassTop10View();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "classPerformance";
    document.body.classList.add("class-performance-view");
    elements["class-performance-surface"].hidden = false;
    elements["class-performance-button"].classList.add("active");
    elements["class-performance-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    renderClassPerformance();
    if (pushHistory) {
      history.pushState({ notMeterStatsView: "class-performance" }, "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeClassPerformanceView() {
    if (state.surfaceMode !== "classPerformance") {
      return;
    }
    state.surfaceMode = "ranking";
    document.body.classList.remove("class-performance-view");
    elements["class-performance-surface"].hidden = true;
    elements["class-performance-button"].classList.remove("active");
    elements["class-performance-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function returnToRankingFromClassPerformance() {
    if (initialPageView() === "class-performance") {
      window.location.assign(new URL("./", window.location.href).href);
      return;
    }
    if (history.state?.notMeterStatsView === "class-performance") {
      history.back();
      return;
    }
    closeClassPerformanceView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openContributionView() {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "contribution";
    document.body.classList.add("contribution-view");
    elements["contribution-surface"].hidden = false;
    elements["contribution-button"].classList.add("active");
    elements["contribution-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    if (state.contributionData) {
      renderContributionStats();
    } else {
      showContributionState("loading");
      void loadContributionCache();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeContributionView() {
    if (state.surfaceMode !== "contribution") return;
    state.surfaceMode = "ranking";
    document.body.classList.remove("contribution-view");
    elements["contribution-surface"].hidden = true;
    elements["contribution-button"].classList.remove("active");
    elements["contribution-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function openBossResistanceView() {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeStatEfficiencyView();
    closeCombatDetail();
    state.surfaceMode = "bossResistance";
    document.body.classList.add("boss-resistance-view");
    elements["boss-resistance-surface"].hidden = false;
    elements["boss-resistance-button"].classList.add("active");
    elements["boss-resistance-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    if (state.data) {
      renderBossResistanceView();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeBossResistanceView() {
    if (state.surfaceMode !== "bossResistance") return;
    state.surfaceMode = "ranking";
    document.body.classList.remove("boss-resistance-view");
    elements["boss-resistance-surface"].hidden = true;
    elements["boss-resistance-button"].classList.remove("active");
    elements["boss-resistance-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function openStatEfficiencyView() {
    closeFieldBossView();
    closeArtifactView();
    closeOptimizationView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeCombatDetail();
    state.surfaceMode = "statEfficiency";
    document.body.classList.add("stat-efficiency-view");
    elements["stat-efficiency-surface"].hidden = false;
    elements["stat-efficiency-button"].classList.add("active");
    elements["stat-efficiency-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    window.NotMeterStatEfficiency?.activate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeStatEfficiencyView() {
    if (state.surfaceMode !== "statEfficiency") return;
    state.surfaceMode = "ranking";
    document.body.classList.remove("stat-efficiency-view");
    elements["stat-efficiency-surface"].hidden = true;
    elements["stat-efficiency-button"].classList.remove("active");
    elements["stat-efficiency-button"].setAttribute("aria-current", "false");
    updatePageIdentity();
  }

  function openFieldBossView() {
    closeArtifactView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeOptimizationView();
    closeCombatDetail();
    state.surfaceMode = "fieldBoss";
    document.body.classList.add("field-boss-view");
    elements["field-boss-surface"].hidden = false;
    elements["field-boss-button"].classList.add("active");
    elements["field-boss-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    startFieldBossClock();
    if (state.fieldBossData) {
      renderFieldBoss();
      void syncLatestFieldBossCache();
    } else {
      showFieldBossState("loading");
      void loadFieldBossCache();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeFieldBossView() {
    if (state.surfaceMode !== "fieldBoss") {
      return;
    }
    state.surfaceMode = "ranking";
    document.body.classList.remove("field-boss-view");
    elements["field-boss-surface"].hidden = true;
    elements["field-boss-button"].classList.remove("active");
    elements["field-boss-button"].setAttribute("aria-current", "false");
    closeFieldBossServerSearch(true);
    stopFieldBossClock();
    updatePageIdentity();
  }

  function openArtifactView() {
    closeFieldBossView();
    closeClassTop10View();
    closeClassPerformanceView();
    closeContributionView();
    closeBossResistanceView();
    closeStatEfficiencyView();
    closeOptimizationView();
    closeCombatDetail();
    state.surfaceMode = "artifact";
    document.body.classList.add("artifact-view");
    elements["artifact-surface"].hidden = false;
    elements["artifact-button"].classList.add("active");
    elements["artifact-button"].setAttribute("aria-current", "page");
    updatePageIdentity();
    window.NotMeterArtifactOccupation?.setLocale(state.locale);
    window.NotMeterArtifactOccupation?.activate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeArtifactView() {
    if (state.surfaceMode !== "artifact") {
      return;
    }
    state.surfaceMode = "ranking";
    document.body.classList.remove("artifact-view");
    elements["artifact-surface"].hidden = true;
    elements["artifact-button"].classList.remove("active");
    elements["artifact-button"].setAttribute("aria-current", "false");
    window.NotMeterArtifactOccupation?.deactivate();
    updatePageIdentity();
  }

  function startFieldBossClock() {
    if (state.fieldBossClock) {
      return;
    }
    refreshFieldBossCountdowns();
    state.fieldBossClock = window.setInterval(refreshFieldBossCountdowns, 1_000);
  }

  function stopFieldBossClock() {
    if (!state.fieldBossClock) {
      return;
    }
    window.clearInterval(state.fieldBossClock);
    state.fieldBossClock = 0;
  }

  async function loadFieldBossCache(force = false) {
    if (state.fieldBossLoad) {
      if (force) {
        state.fieldBossForceRefreshPending = true;
      }
      return state.fieldBossLoad;
    }
    elements["field-boss-refresh-button"].disabled = true;
    elements["field-boss-retry-button"].disabled = true;
    if (!state.fieldBossData) {
      showFieldBossState("loading");
    }
    const load = fetchFieldBossCache(force)
      .then(result => {
        const { cache, revision } = result;
        validateFieldBossCache(cache);
        const previousData = state.fieldBossData;
        const previousRevision = state.fieldBossRevision;
        state.fieldBossLastSyncAt = Date.now();
        if (!shouldApplyFieldBossCache(
          cache,
          previousData,
          revision,
          previousRevision)) {
          if (state.surfaceMode === "fieldBoss" && previousData) {
            elements["field-boss-cache-age"].textContent = fieldBossCacheAgeText();
          }
          return previousData;
        }
        state.fieldBossRevision = revision || previousRevision;
        state.fieldBossData = stabilizeFieldBossCache(cache, previousData, Date.now());
        populateFieldBossServers();
        state.fieldBossRegion = resolveDefaultFieldBossRegion(
          state.fieldBossServerId,
          state.fieldBossRegion);
        if (state.surfaceMode === "fieldBoss") {
          renderFieldBoss();
        }
        return cache;
      })
      .catch(error => {
        console.error(error);
        if (!state.fieldBossData && state.surfaceMode === "fieldBoss") {
          elements["field-boss-error-message"].textContent =
            error instanceof Error && error.message ? error.message : t("cacheUnavailable");
          showFieldBossState("error");
        }
        return null;
      })
      .finally(() => {
        const forceRefreshPending = state.fieldBossForceRefreshPending;
        state.fieldBossForceRefreshPending = false;
        state.fieldBossLoad = null;
        elements["field-boss-refresh-button"].disabled = false;
        elements["field-boss-retry-button"].disabled = false;
        if (forceRefreshPending) {
          queueMicrotask(() => void loadFieldBossCache(true));
        }
      });
    state.fieldBossLoad = load;
    return load;
  }

  async function fetchFieldBossCache(force) {
    const errors = [];
    for (const baseUrl of FIELD_BOSS_CACHE_URLS) {
      try {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const cache = await fetchFieldBossCacheJson(
          `${baseUrl}${separator}v=${Date.now()}`,
          force ? "reload" : "no-cache");
        validateFieldBossCache(cache);
        if (!Array.isArray(cache.servers) || cache.servers.length === 0) {
          throw new Error("empty cache");
        }
        const source = baseUrl.includes("raw.githubusercontent.com") ? "github" : "vps";
        return { cache, revision: `${source}:${Number(cache.generatedAt) || 0}` };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${baseUrl}: ${message}`);
      }
    }
    throw new Error(`${t("cacheUnavailable")} (${errors.join(" / ")})`);
  }

  async function fetchFieldBossCacheJson(url, cacheMode) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), CACHE_REQUEST_TIMEOUT_MS)
      : 0;
    try {
      const response = await fetch(url, {
        cache: cacheMode,
        headers: { Accept: "application/json" },
        signal: controller?.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentLength = Number(response.headers.get("content-length")) || 0;
      if (contentLength > 1_500_000) {
        throw new Error("cache is too large");
      }
      return await response.json();
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }

  function shouldApplyFieldBossCache(cache, current, revision = "", currentRevision = "") {
    if (!current) {
      return true;
    }
    const nextGeneration = Number(cache?.generatedAt) || 0;
    const currentGeneration = Number(current?.generatedAt) || 0;
    if (nextGeneration !== currentGeneration) {
      return nextGeneration > currentGeneration;
    }
    return Boolean(revision && revision !== currentRevision);
  }

  function stabilizeFieldBossCache(cache, current, now = Date.now()) {
    if (!current || !Array.isArray(current.servers) || !Array.isArray(cache?.servers)) {
      return cache;
    }

    const currentTargets = new Map();
    for (const server of current.servers) {
      for (const region of server?.regions || []) {
        for (const entry of region?.entries || []) {
          currentTargets.set(
            `${Number(server?.serverId)}:${Number(region?.region)}:${Number(entry?.bossCode)}`,
            Number(entry?.targetAt));
        }
      }
    }

    let held = false;
    const servers = cache.servers.map(server => ({
      ...server,
      regions: (server?.regions || []).map(region => ({
        ...region,
        entries: (region?.entries || []).map(entry => {
          const key = `${Number(server?.serverId)}:${Number(region?.region)}:${Number(entry?.bossCode)}`;
          const currentTarget = currentTargets.get(key);
          const candidateTarget = Number(entry?.targetAt);
          if (!Number.isSafeInteger(currentTarget) ||
              currentTarget <= now ||
              Math.abs(candidateTarget - currentTarget) < FIELD_BOSS_TARGET_HOLD_THRESHOLD_MS) {
            return entry;
          }
          held = true;
          return { ...entry, targetAt: currentTarget };
        }),
      })),
    }));
    return held ? { ...cache, servers } : cache;
  }

  function validateFieldBossCache(cache) {
    if (!cache || cache.schema !== FIELD_BOSS_CACHE_SCHEMA ||
        Number(cache.version) !== 1 || Number(cache.maximumRegions) !== 6 ||
        !Number.isSafeInteger(Number(cache.generatedAt)) ||
        !Array.isArray(cache.servers) || cache.servers.length > 256 ||
        FIELD_BOSS_REGIONS.length !== 6) {
      throw new Error(t("cacheInvalid"));
    }
    const knownServers = new Set();
    for (const server of cache.servers) {
      const serverId = Number(server?.serverId);
      if (!isKnownServerId(serverId) || knownServers.has(serverId) ||
          !Array.isArray(server.regions) || server.regions.length > 6) {
        throw new Error(t("cacheInvalid"));
      }
      knownServers.add(serverId);
      const knownRegions = new Set();
      for (const region of server.regions) {
        const regionIndex = Number(region?.region);
        const catalog = FIELD_BOSS_REGIONS[regionIndex];
        if (!Number.isInteger(regionIndex) || !catalog || knownRegions.has(regionIndex) ||
            !Array.isArray(region.entries) || region.entries.length > catalog.bosses.length) {
          throw new Error(t("cacheInvalid"));
        }
        knownRegions.add(regionIndex);
        const allowedCodes = new Set(catalog.bosses.map(item => Number(item[0])));
        const knownBosses = new Set();
        for (const entry of region.entries) {
          const bossCode = Number(entry?.bossCode);
          const targetAt = Number(entry?.targetAt);
          if (!allowedCodes.has(bossCode) || knownBosses.has(bossCode) ||
              !Number.isSafeInteger(targetAt) || targetAt <= 0) {
            throw new Error(t("cacheInvalid"));
          }
          knownBosses.add(bossCode);
        }
      }
    }
  }

  function populateFieldBossServers() {
    if (!isKnownServerId(state.fieldBossServerId)) {
      state.fieldBossServerId = 1001;
    }

    const input = elements["field-boss-server"];
    if (!state.fieldBossServerSearchOpen || document.activeElement !== input) {
      input.value = fullServerName(state.fieldBossServerId) || "시엘";
    }
    if (state.fieldBossServerSearchOpen) {
      renderFieldBossServerResults();
    }
  }

  function allFieldBossServers() {
    return [
      ...SERVER_NAMES_ELYOS.map((name, index) => ({
        serverId: 1001 + index,
        name,
        faction: state.locale === "ko" ? "천족" : state.locale === "zh-TW" ? "天族" : "Elyos",
      })),
      ...SERVER_NAMES_ASMODIAN.map((name, index) => ({
        serverId: 2001 + index,
        name,
        faction: state.locale === "ko" ? "마족" : state.locale === "zh-TW" ? "魔族" : "Asmodian",
      })),
    ];
  }

  function normalizeFieldBossServerQuery(value) {
    return String(value || "").normalize("NFC").trim().toLocaleLowerCase("ko-KR");
  }

  function koreanInitials(value) {
    const initials = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
    let result = "";
    for (const character of String(value || "")) {
      const code = character.charCodeAt(0);
      result += code >= 0xac00 && code <= 0xd7a3
        ? initials[Math.floor((code - 0xac00) / 588)]
        : character;
    }
    return result;
  }

  function matchingFieldBossServers(query) {
    const normalized = normalizeFieldBossServerQuery(query);
    const servers = allFieldBossServers();
    if (!normalized) {
      return servers.slice(0, 12);
    }
    return servers.filter(server =>
      normalizeFieldBossServerQuery(server.name).startsWith(normalized) ||
      koreanInitials(server.name).startsWith(normalized)).slice(0, 12);
  }

  function openFieldBossServerSearch() {
    state.fieldBossServerSearchOpen = true;
    renderFieldBossServerResults();
  }

  function closeFieldBossServerSearch(restoreValue = false) {
    state.fieldBossServerSearchOpen = false;
    state.fieldBossServerSearchIndex = -1;
    elements["field-boss-server-results"].hidden = true;
    elements["field-boss-server"].setAttribute("aria-expanded", "false");
    elements["field-boss-server"].removeAttribute("aria-activedescendant");
    if (restoreValue) {
      elements["field-boss-server"].value =
        fullServerName(state.fieldBossServerId) || "시엘";
    }
  }

  function renderFieldBossServerResults() {
    if (!state.fieldBossServerSearchOpen) {
      return;
    }
    const input = elements["field-boss-server"];
    const results = elements["field-boss-server-results"];
    const matches = matchingFieldBossServers(input.value);
    const fragment = document.createDocumentFragment();

    if (matches.length === 0) {
      const empty = document.createElement("div");
      empty.className = "field-boss-server-no-results";
      empty.textContent = t("fieldBossServerNoResults");
      fragment.append(empty);
      state.fieldBossServerSearchIndex = -1;
    } else {
      state.fieldBossServerSearchIndex = Math.min(
        state.fieldBossServerSearchIndex, matches.length - 1);
      matches.forEach((server, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.id = `field-boss-server-option-${server.serverId}`;
        option.className = "field-boss-server-option";
        option.dataset.serverId = String(server.serverId);
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(server.serverId === state.fieldBossServerId));
        option.classList.toggle("active", index === state.fieldBossServerSearchIndex);

        const name = document.createElement("strong");
        name.textContent = server.name;
        const faction = document.createElement("span");
        faction.textContent = server.faction;
        option.append(name, faction);
        fragment.append(option);
      });
    }

    results.replaceChildren(fragment);
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    const active = matches[state.fieldBossServerSearchIndex];
    if (active) {
      input.setAttribute("aria-activedescendant", `field-boss-server-option-${active.serverId}`);
      results.querySelector(".active")?.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function handleFieldBossServerKeydown(event) {
    const matches = matchingFieldBossServers(event.currentTarget.value);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      state.fieldBossServerSearchOpen = true;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const start = state.fieldBossServerSearchIndex < 0
        ? (direction > 0 ? -1 : matches.length)
        : state.fieldBossServerSearchIndex;
      state.fieldBossServerSearchIndex = Math.max(
        0, Math.min(matches.length - 1, start + direction));
      renderFieldBossServerResults();
      return;
    }
    if (event.key === "Enter" && matches.length > 0) {
      event.preventDefault();
      const index = state.fieldBossServerSearchIndex >= 0
        ? state.fieldBossServerSearchIndex
        : 0;
      selectFieldBossServer(matches[index].serverId);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeFieldBossServerSearch(true);
      event.currentTarget.blur();
    }
  }

  function selectFieldBossServer(serverId) {
    if (!isKnownServerId(serverId)) {
      return;
    }
    state.fieldBossServerId = serverId;
    localStorage.setItem("notmeter-field-boss-server-id", String(serverId));
    state.fieldBossRegion = resolveDefaultFieldBossRegion(serverId);
    closeFieldBossServerSearch(false);
    elements["field-boss-server"].value = fullServerName(serverId);
    renderFieldBoss();
  }

  function renderFieldBoss() {
    if (state.surfaceMode !== "fieldBoss" || !state.fieldBossData) {
      return;
    }
    updatePageIdentity();
    populateFieldBossServers();
    const server = currentFieldBossServer();
    const regionsWithData = (server?.regions || [])
      .filter(region => Array.isArray(region.entries) && region.entries.length > 0);
    const entryCount = regionsWithData.reduce(
      (total, region) => total + region.entries.length, 0);
    const serverName = fullServerName(state.fieldBossServerId) || String(state.fieldBossServerId);
    elements["field-boss-snapshot"].hidden = false;
    elements["field-boss-snapshot-title"].textContent =
      t("fieldBossServerStatus", { server: serverName });
    elements["field-boss-snapshot-caption"].textContent = t("fieldBossGenerated", {
      time: formatFieldBossCacheTime(state.fieldBossData.generatedAt),
    });
    elements["field-boss-entry-count"].textContent = t("fieldBossEntryCount", {
      entries: entryCount,
      regions: regionsWithData.length,
    });
    elements["field-boss-cache-age"].textContent = fieldBossCacheAgeText();

    renderFieldBossTabs(server);
    renderFieldBossRows(server);
    showFieldBossState("content");
  }

  function currentFieldBossServer() {
    return state.fieldBossData?.servers?.find(
      server => Number(server.serverId) === state.fieldBossServerId) || null;
  }

  function resolveDefaultFieldBossRegion(serverId, preferred = -1) {
    if (Number.isInteger(preferred) && preferred >= 0 && preferred < FIELD_BOSS_REGIONS.length) {
      return preferred;
    }
    const server = state.fieldBossData?.servers?.find(
      item => Number(item.serverId) === Number(serverId));
    const available = [...(server?.regions || [])]
      .filter(region => Array.isArray(region.entries) && region.entries.length > 0)
      .sort((left, right) =>
        Number(right.observedAt || 0) - Number(left.observedAt || 0));
    return Number(available[0]?.region) || 0;
  }

  function renderFieldBossTabs(server) {
    const byRegion = new Map((server?.regions || []).map(
      region => [Number(region.region), region]));
    const ordered = FIELD_BOSS_REGIONS.map((region, index) => ({
      region,
      index,
      count: byRegion.get(index)?.entries?.length || 0,
      observedAt: Number(byRegion.get(index)?.observedAt) || 0,
    })).sort((left, right) =>
      Number(right.count > 0) - Number(left.count > 0) ||
      right.observedAt - left.observedAt ||
      left.index - right.index);
    const fragment = document.createDocumentFragment();
    for (const item of ordered) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "field-boss-tab";
      if (item.count > 0) {
        button.classList.add("has-data");
      }
      if (item.index === state.fieldBossRegion) {
        button.classList.add("active");
        button.setAttribute("aria-current", "true");
      }
      const label = document.createElement("span");
      label.textContent = item.region.names?.[state.locale] ||
        localizeGameName(item.region.names?.ko || item.region.key);
      const count = document.createElement("span");
      count.className = "field-boss-tab-count";
      count.textContent = `${item.count}/${item.region.bosses.length}`;
      button.append(label, count);
      button.addEventListener("click", () => {
        state.fieldBossRegion = item.index;
        renderFieldBoss();
      });
      fragment.append(button);
    }
    elements["field-boss-tabs"].replaceChildren(fragment);
  }

  function renderFieldBossRows(server) {
    const catalog = FIELD_BOSS_REGIONS[state.fieldBossRegion] || FIELD_BOSS_REGIONS[0];
    const cachedRegion = server?.regions?.find(
      region => Number(region.region) === state.fieldBossRegion);
    const entries = new Map((cachedRegion?.entries || []).map(
      entry => [Number(entry.bossCode), entry]));
    const orderedBosses = catalog.bosses.map((boss, index) => ({
      code: Number(boss[0]),
      name: String(boss[1]),
      kibelisk: FIELD_BOSS_KIBELISKS[Number(boss[0])] || null,
      index,
      entry: entries.get(Number(boss[0])) || null,
    })).sort((left, right) =>
      Number(!left.entry) - Number(!right.entry) ||
      Number(left.entry?.targetAt || Number.MAX_SAFE_INTEGER) -
        Number(right.entry?.targetAt || Number.MAX_SAFE_INTEGER) ||
      left.index - right.index);
    state.fieldBossCountdownElements.clear();
    const fragment = document.createDocumentFragment();
    for (const boss of orderedBosses) {
      const row = document.createElement("article");
      row.className = `field-boss-row${boss.entry ? "" : " no-time"}`;
      const icon = document.createElement("span");
      icon.className = "field-boss-row-icon";
      const image = document.createElement("img");
      image.src = "./assets/boss-icon.png";
      image.alt = "";
      icon.append(image);
      const copy = document.createElement("div");
      copy.className = "field-boss-row-copy";
      const name = document.createElement("strong");
      const bossName = document.createElement("span");
      bossName.className = "field-boss-row-name";
      bossName.textContent = localizeGameName(boss.name, "mob", boss.code);
      name.append(bossName);
      if (boss.kibelisk) {
        const kibeliskName = boss.kibelisk.names?.[state.locale] ||
          boss.kibelisk.names?.ko || "";
        if (kibeliskName) {
          const kibelisk = document.createElement("span");
          kibelisk.className = "field-boss-kibelisk";
          kibelisk.textContent = `- (${boss.kibelisk.order}) ${kibeliskName}`;
          name.append(kibelisk);
        }
      }
      const target = document.createElement("span");
      target.textContent = boss.entry
        ? t("fieldBossExpected", { time: formatFieldBossTargetTime(boss.entry.targetAt) })
        : t("fieldBossNoTimeDetail");
      copy.append(name, target);
      const remaining = document.createElement("span");
      remaining.className = "field-boss-remaining";
      if (boss.entry) {
        const targetAt = Number(boss.entry.targetAt);
        state.fieldBossCountdownElements.set(remaining, targetAt);
        updateFieldBossCountdownElement(remaining, targetAt);
      } else {
        remaining.classList.add("no-time");
        remaining.textContent = t("fieldBossNoTime");
      }
      row.append(icon, copy, remaining);
      fragment.append(row);
    }
    elements["field-boss-list"].replaceChildren(fragment);
    refreshFieldBossCountdowns();
  }

  function refreshFieldBossCountdowns() {
    if (state.surfaceMode !== "fieldBoss") {
      return;
    }
    for (const [element, targetAt] of state.fieldBossCountdownElements) {
      updateFieldBossCountdownElement(element, targetAt);
    }
    if (state.fieldBossData) {
      elements["field-boss-cache-age"].textContent = fieldBossCacheAgeText();
    }
  }

  function updateFieldBossCountdownElement(element, targetAt) {
    const remaining = Number(targetAt) - Date.now();
    element.textContent = formatFieldBossRemaining(remaining);
    element.classList.remove("warning", "soon", "reached");
    if (remaining <= 0) {
      element.classList.add("reached");
    } else if (remaining <= 10 * 60_000) {
      element.classList.add("soon");
    } else if (remaining <= 30 * 60_000) {
      element.classList.add("warning");
    }
  }

  function formatFieldBossRemaining(remainingMilliseconds) {
    if (!Number.isFinite(remainingMilliseconds) || remainingMilliseconds <= 0) {
      return t("fieldBossReached");
    }
    const totalSeconds = Math.max(0, Math.floor(remainingMilliseconds / 1_000));
    const hours = Math.floor(totalSeconds / 3_600);
    const minutes = Math.floor(totalSeconds % 3_600 / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return t("fieldBossHoursLeft", {
        hours,
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    }
    if (minutes > 0) {
      return t("fieldBossMinutesLeft", {
        minutes,
        seconds: String(seconds).padStart(2, "0"),
      });
    }
    return t("fieldBossSecondsLeft", { seconds });
  }

  function formatFieldBossTargetTime(targetAt) {
    const date = new Date(Number(targetAt));
    if (!Number.isFinite(date.getTime())) {
      return "—";
    }
    return new Intl.DateTimeFormat(localeTag(), {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function formatFieldBossCacheTime(generatedAtSeconds) {
    const date = new Date(Number(generatedAtSeconds) * 1_000);
    return Number.isFinite(date.getTime()) ? formatDateTime(date.toISOString()) : "—";
  }

  function fieldBossCacheAgeText() {
    const generatedAt = Number(state.fieldBossData?.generatedAt) * 1_000;
    if (!Number.isFinite(generatedAt) || generatedAt <= 0) {
      return "";
    }
    const ageMinutes = Math.max(0, Math.floor((Date.now() - generatedAt) / 60_000));
    return ageMinutes < 2
      ? t("fieldBossCacheNow")
      : ageMinutes < 60
        ? t("fieldBossCacheMinutes", { value: ageMinutes })
        : t("fieldBossCacheHours", { value: Math.floor(ageMinutes / 60) });
  }

  function showFieldBossState(name) {
    elements["field-boss-loading-state"].hidden = name !== "loading";
    elements["field-boss-error-state"].hidden = name !== "error";
    elements["field-boss-empty-state"].hidden = name !== "empty";
    elements["field-boss-content"].hidden = name !== "content";
    elements["field-boss-snapshot"].hidden = name !== "content";
  }

  function isKnownServerId(serverId) {
    const group = Math.floor(Number(serverId) / 1_000);
    const offset = Number(serverId) % 1_000;
    const names = group === 1 ? SERVER_NAMES_ELYOS : group === 2 ? SERVER_NAMES_ASMODIAN : null;
    return Number.isInteger(serverId) && Boolean(names?.[offset - 1]);
  }

  function fullServerName(serverId) {
    const group = Math.floor(Number(serverId) / 1_000);
    const offset = Number(serverId) % 1_000;
    const names = group === 1 ? SERVER_NAMES_ELYOS : group === 2 ? SERVER_NAMES_ASMODIAN : null;
    return names?.[offset - 1] || "";
  }

  async function fetchRankingCache(force) {
    return fetchCompressedJson(
      CACHE_URLS,
      force,
      candidate => isAcceptableRankingCache(candidate));
  }

  function rankingCacheGeneration(cache) {
    return Date.parse(String(cache?.generatedAt || ""));
  }

  function shouldApplyRankingCache(cache, current) {
    const nextGeneration = rankingCacheGeneration(cache);
    if (!Number.isFinite(nextGeneration)) {
      return false;
    }
    if (!current) {
      return true;
    }
    const currentGeneration = rankingCacheGeneration(current);
    return !Number.isFinite(currentGeneration) || nextGeneration >= currentGeneration;
  }

  function isAcceptableRankingCache(
      cache,
      manifestPublishedAt = githubRankingManifestPublishedAt,
      now = Date.now()) {
    try {
      validateCache(cache);
    } catch {
      return false;
    }
    const generatedAt = rankingCacheGeneration(cache);
    if (!Number.isFinite(generatedAt) || generatedAt > now + 10 * 60 * 1000 ||
        now - generatedAt > CACHE_MAX_VISIBLE_AGE_MS) {
      return false;
    }
    return !Number.isFinite(manifestPublishedAt) || manifestPublishedAt <= 0 ||
      generatedAt >= manifestPublishedAt - CACHE_MANIFEST_DRIFT_ALLOWANCE_MS;
  }

  function normalizeClassRankingDungeonKey(dungeonKey) {
    const normalized = String(dungeonKey || "").trim().toLowerCase();
    if (!/^[a-z0-9_-]{1,64}$/.test(normalized)) {
      throw new Error("invalid dungeon key");
    }
    return normalized;
  }

  async function fetchClassRankingCache(dungeonKey, expectedGeneratedAt, force = false) {
    const normalizedDungeonKey = normalizeClassRankingDungeonKey(dungeonKey);
    const generation = String(expectedGeneratedAt || "");
    if (!generation) {
      throw new Error(t("cacheUnavailable"));
    }
    const cache = await fetchCompressedJson(
      [
        ...rankingCacheCandidates(
          `data/classes/${normalizedDungeonKey}.json.gz`,
          `${GITHUB_CLASS_RANKING_CACHE_ROOT}/${encodeURIComponent(normalizedDungeonKey)}.json.gz`),
        `${VPS_CLASS_RANKING_CACHE_ROOT}/${encodeURIComponent(normalizedDungeonKey)}.json.gz`,
      ],
      force,
      candidate => candidate?.schema === EXPECTED_CLASS_RANKING_SCHEMA &&
        Number(candidate.version) === 1 &&
        String(candidate.generatedAt || "") === generation &&
        String(candidate.dungeonKey || "").toLowerCase() === normalizedDungeonKey &&
        candidate.classRanking && typeof candidate.classRanking === "object",
      generation);
    return cache.classRanking;
  }

  async function fetchViewRankingCache(dungeonKey, expectedGeneratedAt, force = false) {
    const normalizedDungeonKey = normalizeClassRankingDungeonKey(dungeonKey);
    const generation = String(expectedGeneratedAt || "");
    if (!generation) {
      throw new Error(t("cacheUnavailable"));
    }
    const cache = await fetchCompressedJson(
      [
        ...rankingCacheCandidates(
          `data/views/${normalizedDungeonKey}.json.gz`,
          `${GITHUB_VIEW_RANKING_CACHE_ROOT}/${encodeURIComponent(normalizedDungeonKey)}.json.gz`),
        `${VPS_VIEW_RANKING_CACHE_ROOT}/${encodeURIComponent(normalizedDungeonKey)}.json.gz`,
      ],
      force,
      candidate => candidate?.schema === EXPECTED_VIEW_RANKING_SCHEMA &&
        Number(candidate.version) === 1 &&
        String(candidate.generatedAt || "") === generation &&
        String(candidate.dungeonKey || "").toLowerCase() === normalizedDungeonKey &&
        Array.isArray(candidate.views),
      generation);
    return cache.views;
  }

  async function ensureViewRankingCache(dungeonKey, force = false) {
    const normalizedDungeonKey = normalizeClassRankingDungeonKey(dungeonKey);
    if (state.loadedViewDungeonKeys.has(normalizedDungeonKey)) {
      return (state.data?.views || []).filter(
        view => String(view?.dungeonKey || "").toLowerCase() === normalizedDungeonKey);
    }
    const generation = String(state.data?.generatedAt || "");
    if (!generation) {
      throw new Error(t("cacheUnavailable"));
    }
    const loadKey = `${generation}|${normalizedDungeonKey}`;
    if (state.viewRankingLoads.has(loadKey)) {
      return state.viewRankingLoads.get(loadKey);
    }
    const load = fetchViewRankingCache(normalizedDungeonKey, generation, force)
      .then(views => {
        if (String(state.data?.generatedAt || "") === generation) {
          const retained = (state.data.views || []).filter(
            view => String(view?.dungeonKey || "").toLowerCase() !== normalizedDungeonKey);
          state.data.views = retained.concat(views);
          state.loadedViewDungeonKeys.add(normalizedDungeonKey);
        }
        return views;
      })
      .finally(() => state.viewRankingLoads.delete(loadKey));
    state.viewRankingLoads.set(loadKey, load);
    return load;
  }

  async function ensureClassRankingCache(dungeonKey, force = false) {
    const normalizedDungeonKey = normalizeClassRankingDungeonKey(dungeonKey);
    const ranking = state.data?.classRankings?.[normalizedDungeonKey];
    if (ranking) {
      return ranking;
    }
    const generation = String(state.data?.generatedAt || "");
    if (!generation) {
      throw new Error(t("cacheUnavailable"));
    }
    const loadKey = `${generation}|${normalizedDungeonKey}`;
    if (state.classRankingLoads.has(loadKey)) {
      return state.classRankingLoads.get(loadKey);
    }
    const load = fetchClassRankingCache(normalizedDungeonKey, generation, force)
      .then(classRanking => {
        if (String(state.data?.generatedAt || "") === generation) {
          state.data.classRankings[normalizedDungeonKey] = classRanking;
        }
        return classRanking;
      })
      .finally(() => state.classRankingLoads.delete(loadKey));
    state.classRankingLoads.set(loadKey, load);
    return load;
  }

  async function fetchClassOverallCache(force, expectedGeneratedAt = "") {
    const normalizedExpected = String(expectedGeneratedAt || "");
    return fetchCompressedJson(
      CLASS_OVERALL_CACHE_URLS,
      force,
      normalizedExpected
        ? cache => isMatchingClassOverallCache(cache, normalizedExpected)
        : null,
      normalizedExpected);
  }

  async function loadContributionCache(force = false) {
    if (state.contributionLoad) {
      return state.contributionLoad;
    }
    showContributionState("loading");
    state.contributionLoad = (async () => {
      try {
        const cache = await fetchCompressedJson(CONTRIBUTION_CACHE_URLS, force);
        if (cache?.schema !== EXPECTED_CONTRIBUTION_SCHEMA ||
            Number(cache.version) !== 1 ||
            !Array.isArray(cache.jobs)) {
          throw new Error("invalid setup guide cache schema");
        }
        state.contributionData = cache;
        const currentKey = state.contributionDungeonKey;
        state.contributionDungeonKey = cache.jobs.some(item => item.jobName === currentKey)
          ? currentKey
          : String(cache.jobs.find(item => Number(item.sampledCharacters) > 0)?.jobName || cache.jobs[0]?.jobName || "");
        renderContributionStats();
        return cache;
      } catch (error) {
        console.error(error);
        elements["contribution-error-message"].textContent =
          error instanceof Error && error.message ? error.message : t("cacheUnavailable");
        showContributionState("error");
        return null;
      } finally {
        state.contributionLoad = null;
      }
    })();
    return state.contributionLoad;
  }

  function showContributionState(name) {
    elements["contribution-loading-state"].hidden = name !== "loading";
    elements["contribution-error-state"].hidden = name !== "error";
    elements["contribution-empty-state"].hidden = name !== "empty";
    elements["contribution-content"].hidden = name !== "content";
    elements["contribution-summary"].hidden = name !== "content";
  }

  function renderContributionStats() {
    const cache = state.contributionData;
    const jobs = Array.isArray(cache?.jobs) ? cache.jobs : [];
    if (jobs.length === 0) {
      elements["contribution-tabs"].replaceChildren();
      showContributionState("empty");
      return;
    }

    const selected = jobs.find(item => item.jobName === state.contributionDungeonKey) ||
      jobs.find(item => Number(item.sampledCharacters) > 0) || jobs[0];
    state.contributionDungeonKey = selected.jobName;
    const tabs = document.createDocumentFragment();
    for (const job of jobs) {
      const button = document.createElement("button");
      const active = job.jobName === selected.jobName;
      button.type = "button";
      button.className = `contribution-tab${active ? " active" : ""}`;
      button.dataset.contributionDungeon = job.jobName;
      button.setAttribute("aria-pressed", String(active));
      button.append(createJobIcon(job.jobName));
      const label = document.createElement("span");
      label.textContent = jobName(job.jobName);
      const count = document.createElement("small");
      count.textContent = `${formatInteger(job.sampledCharacters)}/${formatInteger(job.targetRankers || cache.rankLimit || 20)}`;
      button.append(label, count);
      tabs.append(button);
    }
    elements["contribution-tabs"].replaceChildren(tabs);

    if (Number(selected.sampledCharacters) <= 0) {
      showContributionState("empty");
      return;
    }

    const target = Number(selected.targetRankers || cache.rankLimit || 20);
    elements["contribution-period"].textContent = formatDateTime(cache.generatedAt);
    elements["contribution-records"].textContent = t("setupGuideSampleValue", {
      sample: formatInteger(selected.sampledCharacters),
      target: formatInteger(target),
    });
    elements["contribution-samples"].textContent = t("setupGuideCandidatesValue", {
      count: formatInteger(selected.inspectedCandidates),
    });
    elements["contribution-low-samples"].textContent = setupGuideConfidence(selected.confidence);
    elements["contribution-dungeon-title"].replaceChildren(createJobIcon(selected.jobName));
    const selectedJobName = document.createElement("span");
    selectedJobName.textContent = jobName(selected.jobName);
    elements["contribution-dungeon-title"].append(selectedJobName);
    const rows = document.createDocumentFragment();
    rows.append(renderSetupGuideStats(
      "setupGuideManastoneTitle",
      selected.manastones,
      "manastone",
      "setupGuideManastoneNote"));
    rows.append(renderSetupGuideStats(
      "setupGuideSpiritStoneTitle",
      selected.spiritStones,
      "spirit-stone",
      "setupGuideSpiritStoneNote"));
    rows.append(renderSetupGuideSoul(selected.soulEngravings));
    rows.append(renderSetupGuideArcana(selected.arcana));
    rows.append(renderSetupGuideSkills(selected.skills));
    elements["contribution-rows"].replaceChildren(rows);
    showContributionState("content");
  }

  function setupGuideConfidence(value) {
    const normalized = String(value || "insufficient");
    return t(normalized === "high" ? "setupGuideConfidenceHigh" :
      normalized === "medium" ? "setupGuideConfidenceMedium" :
      normalized === "low" ? "setupGuideConfidenceLow" : "setupGuideConfidenceInsufficient");
  }

  function createSetupGuideSection(titleKey, modifier = "", noteKey = "") {
    const section = document.createElement("section");
    section.className = `setup-guide-section ${modifier}`.trim();
    const heading = document.createElement("div");
    heading.className = "setup-guide-section-heading";
    const title = document.createElement("h3");
    title.textContent = t(titleKey);
    heading.append(title);
    if (noteKey) {
      const note = document.createElement("p");
      note.className = "setup-guide-section-note";
      note.textContent = t(noteKey);
      heading.append(note);
    }
    const body = document.createElement("div");
    body.className = "setup-guide-section-body";
    section.append(heading, body);
    return { section, body };
  }

  function setupGuideMeta(...values) {
    return values.filter(value => String(value || "").length > 0);
  }

  function createSetupGuideCard(name, icon, meta = [], omitIcon = false) {
    const card = document.createElement("article");
    card.className = `setup-guide-card${omitIcon ? " setup-guide-card-no-icon" : ""}`;
    let visual = null;
    if (!omitIcon) {
      visual = document.createElement("span");
      visual.className = "setup-guide-card-icon";
      const source = String(icon || "").trim();
      if (/^(https:\/\/|\.\/|\/)/i.test(source)) {
        const image = document.createElement("img");
        image.src = source;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        visual.append(image);
      } else {
        visual.textContent = String(name || "?").slice(0, 1);
      }
    }
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = String(name || "—");
    const details = document.createElement("div");
    details.className = "setup-guide-card-meta";
    for (const value of meta) {
      const chip = document.createElement("span");
      chip.textContent = value;
      details.append(chip);
    }
    copy.append(title, details);
    if (visual) card.append(visual);
    card.append(copy);
    return card;
  }

  function appendSetupGuideEmpty(body) {
    const empty = document.createElement("p");
    empty.className = "setup-guide-inline-empty";
    empty.textContent = t("setupGuideNoData");
    body.append(empty);
  }

  function renderSetupGuideStats(titleKey, stats, modifier = "", noteKey = "") {
    const { section, body } = createSetupGuideSection(titleKey, modifier, noteKey);
    body.classList.add("setup-guide-card-grid");
    for (const stat of (Array.isArray(stats) ? stats : [])) {
      const medianValue = `${formatDecimal(stat.medianTotalValue, Number(stat.medianTotalValue) % 1 ? 1 : 0)}${stat.isPercent ? "%" : ""}`;
      body.append(createSetupGuideCard(stat.name, stat.icon, setupGuideMeta(
        t("setupGuideUsage", { value: formatPercent(stat.usageRatePercent, 0) }),
        t("setupGuideTotalSlots", { value: formatInteger(stat.totalCount) }),
        t("setupGuideMedianValue", { value: medianValue }))));
    }
    if (!body.childElementCount) appendSetupGuideEmpty(body);
    return section;
  }

  function renderSetupGuideSoul(slots) {
    const { section, body } = createSetupGuideSection(
      "setupGuideSoulTitle",
      "setup-guide-soul-section",
      "setupGuideSoulNote");
    const source = Array.isArray(slots) ? slots : [];
    const slotGroups = [
      ["setupGuideSoulGear", source.filter(slot => Number(slot.slotPos) <= 8)],
      ["setupGuideSoulAccessories", source.filter(slot => Number(slot.slotPos) > 8)],
    ];
    for (const [groupTitleKey, groupedSlots] of slotGroups) {
      const visibleSlots = groupedSlots.filter(slot =>
        (Array.isArray(slot.skills) && slot.skills.length > 0) ||
        (Array.isArray(slot.stats) && slot.stats.length > 0));
      if (visibleSlots.length === 0) continue;
      const subgroup = document.createElement("div");
      subgroup.className = "setup-guide-subgroup setup-guide-soul-subgroup";
      const subgroupTitle = document.createElement("h4");
      subgroupTitle.textContent = t(groupTitleKey);
      const slotGrid = document.createElement("div");
      slotGrid.className = "setup-guide-slot-grid setup-guide-soul-slot-grid";
      for (const slot of visibleSlots) {
        const group = document.createElement("div");
        group.className = "setup-guide-slot setup-guide-soul-slot";
        const title = document.createElement("h4");
        title.textContent = slot.slotName || "—";
        group.append(title);
        const columns = document.createElement("div");
        columns.className = "setup-guide-soul-columns";
        const categories = [
          ["setupGuideSoulSkills", slot.skills, skill => setupGuideMeta(
            t("setupGuideUsage", { value: formatPercent(skill.usageRatePercent, 0) }),
            t("setupGuideMedianLevel", { value: formatInteger(skill.medianLevel) }))],
          ["setupGuideSoulStats", slot.stats, stat => setupGuideMeta(
            t("setupGuideUsage", { value: formatPercent(stat.usageRatePercent, 0) }),
            t("setupGuideMedianValue", {
              value: `${formatDecimal(stat.medianTotalValue, Number(stat.medianTotalValue) % 1 ? 1 : 0)}${stat.isPercent ? "%" : ""}`,
            }))],
        ];
        for (const [labelKey, choices, meta] of categories) {
          if (!Array.isArray(choices) || choices.length === 0) continue;
          const category = document.createElement("div");
          category.className = `setup-guide-slot-category ${
            labelKey === "setupGuideSoulStats" ? "is-options" : "is-skills"}`;
          const label = document.createElement("h5");
          label.textContent = t(labelKey);
          category.append(label);
          choices.forEach(choice => category.append(createSetupGuideCard(
            choice.name,
            choice.icon,
            meta(choice),
            labelKey === "setupGuideSoulStats")));
          columns.append(category);
        }
        group.append(columns);
        slotGrid.append(group);
      }
      subgroup.append(subgroupTitle, slotGrid);
      body.append(subgroup);
    }
    if (!body.childElementCount) appendSetupGuideEmpty(body);
    return section;
  }

  function renderSetupGuideArcana(arcana) {
    const { section, body } = createSetupGuideSection("setupGuideArcanaTitle");
    if (Array.isArray(arcana?.slots) && arcana.slots.length > 0) {
      const slotGroup = document.createElement("div");
      slotGroup.className = "setup-guide-subgroup";
      const slotTitle = document.createElement("h4");
      slotTitle.textContent = t("setupGuideArcanaSlots");
      const slotGrid = document.createElement("div");
      slotGrid.className = "setup-guide-slot-grid setup-guide-arcana-slot-grid";
      for (const slot of arcana.slots) {
        const group = document.createElement("div");
        group.className = "setup-guide-slot setup-guide-arcana-slot";
        const title = document.createElement("h4");
        const rawSlotPos = Number(slot.slotPos);
        const slotPos = rawSlotPos >= 41 && rawSlotPos <= 50
          ? rawSlotPos - 40
          : rawSlotPos >= 21 && rawSlotPos <= 30
            ? rawSlotPos - 20
            : rawSlotPos;
        const slotLabelKey = ARCANA_SLOT_LABEL_KEYS[slotPos];
        title.textContent = slotLabelKey ? t(slotLabelKey) : (slot.slotName || "—");
        group.append(title);
        const categories = [
          ["setupGuideArcanaCards", slot.choices, choice => setupGuideMeta(
            t("setupGuideUsage", { value: formatPercent(choice.usageRatePercent, 0) }),
            Number(choice.medianEnchantLevel) > 0
              ? t("setupGuideMedianEnhance", { value: formatInteger(choice.medianEnchantLevel) }) : "")],
          ["setupGuideArcanaSkills", slot.skills, choice => setupGuideMeta(
            t("setupGuideUsage", { value: formatPercent(choice.usageRatePercent, 0) }),
            t("setupGuideMedianLevel", { value: formatInteger(choice.medianLevel) }))],
        ];
        for (const [labelKey, choices, meta] of categories) {
          if (!Array.isArray(choices) || choices.length === 0) continue;
          const category = document.createElement("div");
          category.className = `setup-guide-slot-category${labelKey === "setupGuideArcanaSkills" ? " is-skills" : ""}`;
          const categoryTitle = document.createElement("h5");
          categoryTitle.textContent = t(labelKey);
          category.append(categoryTitle);
          choices.forEach(choice => category.append(createSetupGuideCard(
            choice.name,
            choice.icon,
            meta(choice))));
          group.append(category);
        }
        slotGrid.append(group);
      }
      slotGroup.append(slotTitle, slotGrid);
      body.append(slotGroup);
    }
    const groups = [
      ["setupGuideArcanaSets", arcana?.sets, choice => setupGuideMeta(
        t("setupGuideUsage", { value: formatPercent(choice.usageRatePercent, 0) }),
        t("setupGuideTotalSlots", { value: formatInteger(choice.medianEquippedCount) }))],
    ];
    for (const [labelKey, choices, meta] of groups) {
      if (!Array.isArray(choices) || choices.length === 0) continue;
      const group = document.createElement("div");
      group.className = "setup-guide-subgroup";
      const title = document.createElement("h4");
      title.textContent = t(labelKey);
      const grid = document.createElement("div");
      grid.className = "setup-guide-card-grid";
      choices.forEach(choice => grid.append(createSetupGuideCard(
        choice.name,
        choice.icon,
        meta(choice),
        labelKey === "setupGuideArcanaStats")));
      group.append(title, grid);
      body.append(group);
    }
    if (!body.childElementCount) appendSetupGuideEmpty(body);
    return section;
  }

  function renderSetupGuideSkills(skills) {
    const { section, body } = createSetupGuideSection("setupGuideSkillTitle");
    const groups = [
      ["setupGuideActive", skills?.active],
      ["setupGuideStigma", skills?.stigma],
      ["setupGuidePassive", skills?.passive],
    ];
    for (const [labelKey, choices] of groups) {
      if (!Array.isArray(choices) || choices.length === 0) continue;
      const group = document.createElement("div");
      group.className = "setup-guide-subgroup";
      const title = document.createElement("h4");
      title.textContent = t(labelKey);
      const grid = document.createElement("div");
      grid.className = "setup-guide-skill-grid";
      choices.forEach(choice => grid.append(createSetupGuideCard(
        choice.name,
        choice.icon,
        setupGuideMeta(
          t("setupGuideUsage", { value: formatPercent(choice.usageRatePercent, 0) }),
          t("setupGuideMedianLevel", { value: formatInteger(choice.medianLevel) }),
          t("setupGuideLevelRange", {
            low: formatInteger(choice.p25Level),
            high: formatInteger(choice.p75Level),
          })))));
      group.append(title, grid);
      body.append(group);
    }
    if (!body.childElementCount) appendSetupGuideEmpty(body);
    return section;
  }

  async function fetchCompressedJson(urls, force, accept = null, revision = "") {
    const errors = [];
    for (const baseUrl of urls) {
      const releaseVpsSlot = isVpsRankingCacheUrl(baseUrl)
        ? await enterVpsFallbackQueue()
        : null;
      try {
        for (let attempt = 1; attempt <= CACHE_REQUEST_ATTEMPTS; attempt += 1) {
        const query = [];
        if (force || attempt > 1) {
          query.push(`v=${Date.now()}`);
        }
        if (revision) {
          query.push(`generation=${encodeURIComponent(revision)}`);
        }
        const separator = baseUrl.includes("?") ? "&" : "?";
        const url = query.length > 0
          ? `${baseUrl}${separator}${query.join("&")}`
          : baseUrl;
        const controller = typeof AbortController === "function" ? new AbortController() : null;
        let timeoutId = 0;
        const touchRequest = () => {
          if (!controller) {
            return;
          }
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
          timeoutId = window.setTimeout(
            () => controller.abort(),
            CACHE_STREAM_IDLE_TIMEOUT_MS);
        };
        touchRequest();
        try {
          const response = await fetch(url, {
            cache: force || attempt > 1 ? "reload" : "no-cache",
            headers: { Accept: "application/gzip, application/json" },
            signal: controller?.signal,
          });
          touchRequest();
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const bytes = await readCacheResponseBytes(response, touchRequest);
          const text = await decodeCacheBytes(bytes);
          const cache = JSON.parse(text);
          if (accept && !accept(cache)) {
            const mismatch = new Error("cache generation mismatch");
            mismatch.name = "CacheGenerationMismatch";
            throw mismatch;
          }
          return cache;
        } catch (error) {
          errors.push(`${baseUrl}#${attempt}: ${error instanceof Error ? error.message : String(error)}`);
          // 동일 URL에서 받은 완전한 JSON의 세대가 다르면 재요청해도 같은 대용량
          // 파일을 다시 내려받을 가능성이 높다. 즉시 다음 동일 세대 후보로 넘어간다.
          if (error instanceof Error && error.name === "CacheGenerationMismatch") {
            break;
          }
        } finally {
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
        }
          if (attempt < CACHE_REQUEST_ATTEMPTS) {
            await new Promise((resolve) => window.setTimeout(resolve, CACHE_RETRY_DELAY_MS));
          }
        }
      } finally {
        releaseVpsSlot?.();
      }
    }
    throw new Error(`${t("cacheUnavailable")} (${errors.join(" / ")})`);
  }

  function isVpsRankingCacheUrl(url) {
    try {
      const host = new URL(String(url), window.location.href).hostname.toLowerCase();
      return host.endsWith(".sslip.io") || host.endsWith(".nip.io");
    } catch {
      return false;
    }
  }

  async function enterVpsFallbackQueue() {
    let releaseCurrent;
    const previous = vpsFallbackQueue;
    vpsFallbackQueue = new Promise(resolve => {
      releaseCurrent = resolve;
    });
    await previous;
    try {
      if (!vpsFallbackSpreadPromise) {
        const range = VPS_FALLBACK_MAXIMUM_DELAY_MS - VPS_FALLBACK_MINIMUM_DELAY_MS;
        const delay = VPS_FALLBACK_MINIMUM_DELAY_MS + Math.floor(Math.random() * (range + 1));
        vpsFallbackSpreadPromise = new Promise(resolve => window.setTimeout(resolve, delay));
      }
      await vpsFallbackSpreadPromise;
      return () => releaseCurrent();
    } catch (error) {
      releaseCurrent();
      throw error;
    }
  }

  async function readCacheResponseBytes(response, touchRequest) {
    const contentLength = Number(response.headers.get("content-length")) || 0;
    if (contentLength > CACHE_MAX_COMPRESSED_BYTES) {
      throw new Error("cache is too large");
    }
    if (!response.body || typeof response.body.getReader !== "function") {
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > CACHE_MAX_COMPRESSED_BYTES) {
        throw new Error("cache is too large");
      }
      return bytes;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let totalLength = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        touchRequest();
        if (!value || value.byteLength === 0) {
          continue;
        }
        totalLength += value.byteLength;
        if (totalLength > CACHE_MAX_COMPRESSED_BYTES) {
          throw new Error("cache is too large");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const bytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes;
  }

  async function decodeCacheBytes(bytes) {
    const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
    if (!isGzip) {
      return new TextDecoder("utf-8").decode(bytes);
    }
    if (typeof DecompressionStream !== "function") {
      throw new Error("This browser cannot decompress the statistics cache.");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }

  function validateCache(cache) {
    if (!cache || cache.schema !== EXPECTED_SCHEMA || cache.version !== 1 ||
        !Array.isArray(cache.dungeons) || !Array.isArray(cache.views) ||
        !cache.classRankings || !Number.isFinite(rankingCacheGeneration(cache))) {
      throw new Error(t("cacheInvalid"));
    }
  }

  function validateClassOverallCache(cache) {
    if (!cache ||
        cache.schema !== EXPECTED_CLASS_OVERALL_SCHEMA ||
        Number(cache.version) !== 1 ||
        !cache.generatedAt ||
        !cache.classOverall ||
        !Array.isArray(cache.classOverall.contents) ||
        !Array.isArray(cache.classOverall.jobs) ||
        !cache.classPerformance ||
        !Array.isArray(cache.classPerformance.rows)) {
      throw new Error(t("cacheInvalid"));
    }
  }

  function isMatchingClassOverallCache(cache, expectedGeneratedAt) {
    try {
      validateClassOverallCache(cache);
      return String(cache.generatedAt) === String(expectedGeneratedAt || "");
    } catch {
      return false;
    }
  }

  function validateCustomCpCache(cache) {
    if (!isValidCustomCpCache(cache)) {
      throw new Error(t("cacheInvalid"));
    }
  }

  function isValidCustomCpCache(cache) {
    return Boolean(cache &&
        cache.schema === EXPECTED_CUSTOM_CP_SCHEMA &&
        Number(cache.version) === 4 &&
        Array.isArray(cache.cpTiers) &&
        Array.isArray(cache.views) &&
        cache.classRankings &&
        parseWeeklyRange(cache.currentWeekPeriodLabel) &&
        cache.summaryBucketsByDungeon &&
        typeof cache.summaryBucketsByDungeon === "object" &&
        cache.generatedAt);
  }

  function isMatchingCustomCpCache(cache, expectedGeneratedAt) {
    return isValidCustomCpCache(cache) &&
      String(cache.generatedAt) === String(expectedGeneratedAt || "");
  }

  function customCpRankCacheKey(dungeonKey, bossIndex) {
    return `${String(dungeonKey || "").toLowerCase()}|${Math.max(0, Number(bossIndex) || 0)}`;
  }

  function legacyCustomCpRankCacheUrls(dungeonKey) {
    const safeKey = String(dungeonKey || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return [
      `${VPS_RANKING_CACHE_ROOT}/custom-cp/${safeKey}`,
    ];
  }

  function customCpRankChunkUrls(dungeonKey, bossIndex) {
    const safeKey = String(dungeonKey || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const normalizedBossIndex = Math.max(0, Number(bossIndex) || 0);
    return [
      ...githubCacheCandidates(
        `data/notmeter-ranking-custom-cp-${safeKey}-boss-${normalizedBossIndex}.json.gz`,
        `${GITHUB_RANKING_CACHE_ROOT}/notmeter-ranking-custom-cp-${safeKey}-boss-${normalizedBossIndex}.json.gz`),
    ];
  }

  function customCpRankCacheUrls(dungeonKey, bossIndex) {
    return [
      ...customCpRankChunkUrls(dungeonKey, bossIndex),
      ...legacyCustomCpRankCacheUrls(dungeonKey),
    ];
  }

  function validateCustomCpRankCache(
      cache,
      dungeonKey,
      bossIndex,
      expectedGeneratedAt = state.data?.generatedAt) {
    if (!isMatchingCustomCpRankCache(
        cache,
        dungeonKey,
        bossIndex,
        expectedGeneratedAt)) {
      throw new Error(t("cacheInvalid"));
    }
  }

  function isMatchingCustomCpRankCache(cache, dungeonKey, bossIndex, expectedGeneratedAt) {
    return isValidCustomCpRankCache(cache, dungeonKey, bossIndex) &&
      String(cache.generatedAt) === String(expectedGeneratedAt || "");
  }

  function isValidCustomCpRankCache(cache, dungeonKey, bossIndex) {
    if (!cache || cache.dungeonKey !== dungeonKey ||
        !Array.isArray(cache.rankBuckets) || !cache.generatedAt) {
      return false;
    }
    if (cache.schema === EXPECTED_CUSTOM_CP_RANK_CHUNK_SCHEMA &&
        Number(cache.version) === 2) {
      const expectedBossIndex = Math.max(0, Number(bossIndex) || 0);
      return Number(cache.bossIndex) === expectedBossIndex &&
        (expectedBossIndex === 0 ||
          cache.rankBuckets.every(bucket => Number(bucket.B) === expectedBossIndex));
    }
    return cache.schema === EXPECTED_CUSTOM_CP_RANK_SCHEMA &&
      Number(cache.version) === 1;
  }

  async function fetchCustomCpCacheForGeneration(expectedGeneratedAt, force = false) {
    const normalizedExpected = String(expectedGeneratedAt || "");
    if (!normalizedExpected) {
      throw new Error(t("cacheUnavailable"));
    }
    const cache = await fetchCompressedJson(
      CUSTOM_CP_CACHE_URLS,
      force,
      candidate => isMatchingCustomCpCache(candidate, normalizedExpected),
      normalizedExpected);
    validateCustomCpCache(cache);
    return cache;
  }

  async function fetchCustomCpRankCacheForGeneration(
      dungeonKey,
      bossIndex,
      expectedGeneratedAt,
      force = false) {
    const normalizedExpected = String(expectedGeneratedAt || "");
    const normalizedBossIndex = Math.max(0, Number(bossIndex) || 0);
    const cache = await fetchCompressedJson(
      customCpRankCacheUrls(dungeonKey, bossIndex),
      force,
      candidate => isMatchingCustomCpRankCache(
        candidate,
        dungeonKey,
        normalizedBossIndex,
        normalizedExpected),
      normalizedExpected);
    validateCustomCpRankCache(cache, dungeonKey, normalizedBossIndex, normalizedExpected);
    return cache;
  }

  async function fetchCompatibleCustomCpPair(
      dungeonKey,
      bossIndex,
      expectedGeneratedAt,
      force = false) {
    const normalizedExpected = String(expectedGeneratedAt || "");
    if (!normalizedExpected) {
      throw new Error(t("cacheUnavailable"));
    }
    const errors = [];
    for (const summaryUrl of CUSTOM_CP_CACHE_URLS) {
      try {
        const summary = await fetchCompressedJson(
          [summaryUrl],
          force,
          candidate => isMatchingCustomCpCache(candidate, normalizedExpected),
          normalizedExpected);
        const rank = await fetchCustomCpRankCacheForGeneration(
          dungeonKey,
          bossIndex,
          summary.generatedAt,
          force);
        return { summary, rank };
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    throw new Error(`${t("cacheUnavailable")} (${errors.join(" / ")})`);
  }

  async function prepareCustomCpGeneration(
      expectedGeneratedAt,
      dungeonKey,
      bossIndex,
      force,
      includeRank) {
    if (includeRank) {
      return fetchCompatibleCustomCpPair(
        dungeonKey,
        bossIndex,
        expectedGeneratedAt,
        force);
    }
    const summary = await fetchCustomCpCacheForGeneration(expectedGeneratedAt, force);
    return { summary, rank: null };
  }

  async function ensureCustomCpCache(force = false) {
    const expectedGeneratedAt = String(state.data?.generatedAt || "");
    if (isMatchingCustomCpCache(state.customCpData, expectedGeneratedAt) && !force) {
      return state.customCpData;
    }
    if (state.customCpLoad && !force) {
      return state.customCpLoad;
    }
    let load;
    load = fetchCustomCpCacheForGeneration(expectedGeneratedAt, force)
      .then(cache => {
        if (String(state.data?.generatedAt || "") !== expectedGeneratedAt) {
          return cache;
        }
        state.customCpData = cache;
        state.customCpSummaryIndexes.clear();
        return cache;
      })
      .finally(() => {
        if (state.customCpLoad === load) {
          state.customCpLoad = null;
        }
      });
    state.customCpLoad = load;
    return load;
  }

  async function ensureCustomCpRankCache(
      dungeonKey,
      bossIndex = state.bossIndex,
      force = false) {
    const summary = await ensureCustomCpCache(force);
    const expectedGeneratedAt = String(summary.generatedAt || "");
    const cacheKey = customCpRankCacheKey(dungeonKey, bossIndex);
    const current = state.customCpRankData.get(cacheKey);
    if (current &&
        String(current.generatedAt) === expectedGeneratedAt &&
        !force) {
      return current;
    }
    if (state.customCpRankLoads.has(cacheKey) && !force) {
      return state.customCpRankLoads.get(cacheKey);
    }
    let load;
    load = fetchCustomCpRankCacheForGeneration(dungeonKey, bossIndex, expectedGeneratedAt, force)
      .then(cache => ({ summary, rank: cache }))
      .catch(error => {
        console.warn("custom CP generation mismatch; retrying a compatible cache pair", error);
        return fetchCompatibleCustomCpPair(
          dungeonKey,
          bossIndex,
          String(state.data?.generatedAt || ""),
          true);
      })
      .then(pair => {
        if (!isMatchingCustomCpCache(pair.summary, state.data?.generatedAt)) {
          throw new Error(t("cacheUnavailable"));
        }
        if (String(state.customCpData?.generatedAt || "") !== String(pair.summary.generatedAt)) {
          state.customCpData = pair.summary;
          state.customCpSummaryIndexes.clear();
          state.customCpRankData.clear();
          state.customCpRankIndexes.clear();
        }
        state.customCpRankData.set(cacheKey, pair.rank);
        state.customCpRankIndexes.delete(cacheKey);
        return pair.rank;
      })
      .finally(() => {
        if (state.customCpRankLoads.get(cacheKey) === load) {
          state.customCpRankLoads.delete(cacheKey);
        }
      });
    state.customCpRankLoads.set(cacheKey, load);
    return load;
  }

  function populateFilters() {
    if (!state.data) {
      return;
    }
    replaceOptions(
      elements["dungeon-filter"],
      state.data.dungeons,
      item => item.key,
      item => dungeonName(item),
      state.dungeonKey);
    renderDungeonFilterButtons();

    const bosses = bossFilterItems();
    if (!bosses.some(item => item.index === state.bossIndex)) {
      state.bossIndex = 0;
    }
    replaceOptions(
      elements["boss-filter"],
      bosses,
      item => item.index,
      item => item.name,
      state.bossIndex);
    renderBossFilterButtons(bosses);

    const cpTiers = homepageCpTierOptions();
    if (state.cpFilterMode === "standard" &&
        !cpTiers.some(item => String(item.value) === String(state.cpTierIndex))) {
      state.cpTierIndex = 0;
    }
    if (state.cpFilterMode === "custom" && state.customCpPresetTierIndex > 0 &&
        !cpTiers.some(item => item.value === `preset:${state.customCpPresetTierIndex}`)) {
      state.cpFilterMode = "standard";
      state.customCpPresetTierIndex = 0;
      state.cpTierIndex = 0;
    }
    replaceOptions(
      elements["cp-filter"],
      cpTiers,
      item => item.value,
      item => item.label,
      state.cpFilterMode === "custom" && state.customCpPresetTierIndex > 0
        ? `preset:${state.customCpPresetTierIndex}`
        : state.cpTierIndex);
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = t("customCp");
    elements["cp-filter"].append(customOption);
    if (state.cpFilterMode === "custom" && state.customCpPresetTierIndex === 0) {
      state.cpTierIndex = -1;
      elements["cp-filter"].value = "custom";
    }
    syncCustomCpControls();
    renderCpFilterMenu(cpTiers);

    replaceOptions(
      elements["period-filter"],
      PERIODS,
      item => item,
      item => periodName(item),
      state.period);
    syncRankingMetricControl();
  }

  function renderDungeonFilterButtons() {
    const dungeons = state.data?.dungeons || [];
    const collapsed = dungeons.slice(0, DUNGEON_BUTTON_COLLAPSED_LIMIT);
    if (!state.dungeonFilterExpanded &&
        state.dungeonKey &&
        !collapsed.some(item => item.key === state.dungeonKey)) {
      collapsed[collapsed.length - 1] = dungeons.find(item => item.key === state.dungeonKey);
    }
    const visible = state.dungeonFilterExpanded ? dungeons : collapsed.filter(Boolean);
    const fragment = document.createDocumentFragment();
    for (const dungeon of visible) {
      const selected = dungeon.key === state.dungeonKey;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-option-button dungeon-filter-button";
      button.classList.toggle("is-active", selected);
      button.dataset.dungeonKey = dungeon.key;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selected));
      button.textContent = dungeonName(dungeon);
      fragment.append(button);
    }
    elements["dungeon-filter-buttons"].replaceChildren(fragment);

    const moreButton = elements["dungeon-filter-more"];
    const overflowCount = Math.max(0, dungeons.length - DUNGEON_BUTTON_COLLAPSED_LIMIT);
    moreButton.hidden = overflowCount === 0;
    moreButton.textContent = state.dungeonFilterExpanded
      ? t("collapseDungeons")
      : t("moreDungeons", { count: overflowCount });
    moreButton.title = t(state.dungeonFilterExpanded ? "collapseDungeons" : "expandDungeons");
    moreButton.setAttribute("aria-label", moreButton.title);
    moreButton.setAttribute("aria-expanded", String(state.dungeonFilterExpanded));
  }

  function renderBossFilterButtons(bosses = null) {
    const items = bosses || bossFilterItems();
    const fragment = document.createDocumentFragment();
    for (const boss of items) {
      const selected = boss.index === state.bossIndex;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-option-button boss-filter-button";
      button.classList.toggle("is-active", selected);
      button.dataset.bossIndex = String(boss.index);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selected));
      if (boss.index > 0) {
        const order = document.createElement("b");
        order.className = "boss-filter-order";
        order.textContent = String(boss.order);
        button.append(order);
      }
      const label = document.createElement("span");
      label.textContent = boss.name;
      button.append(label);
      fragment.append(button);
    }
    elements["boss-filter-buttons"].replaceChildren(fragment);
  }

  function bossFilterItems(dungeon = currentDungeon()) {
    const names = dungeon?.bossNames || [];
    const configuredNames = BOSS_PRESENTATION_NAMES[dungeon?.key];
    const configuredIndexes = Array.isArray(configuredNames)
      ? configuredNames.map(name => names.indexOf(name) + 1)
      : [];
    const sourceIndexes = configuredIndexes.length === names.length &&
        new Set(configuredIndexes).size === names.length &&
        configuredIndexes.every(index => index >= 1 && index <= names.length)
      ? configuredIndexes
      : names.map((_, index) => index + 1);
    return [{ index: 0, order: 0, name: t("allBosses") }]
      .concat(sourceIndexes.map((sourceIndex, displayIndex) => ({
        index: sourceIndex,
        order: displayIndex + 1,
        name: localizeGameName(names[sourceIndex - 1]),
      })));
  }

  function replaceOptions(select, items, valueSelector, labelSelector, selectedValue) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const option = document.createElement("option");
      option.value = String(valueSelector(item));
      option.textContent = labelSelector(item);
      option.selected = String(option.value) === String(selectedValue);
      fragment.append(option);
    }
    select.replaceChildren(fragment);
  }

  function homepageCpTierOptions() {
    const options = (state.data?.cpTiers || [])
      .filter(item => Number(item.index) < STANDARD_CP_TIER_LIMIT)
      .filter(item => Number(item.index) <= 1)
      .sort((left, right) => Number(left.index) - Number(right.index))
      .map(item => ({
        value: String(item.index),
        label: Number(item.index) === 0 ? t("allCp") : item.label,
      }));
    const detailed = (state.data?.cpTiers || [])
      .filter(item => Number(item.index) >= STANDARD_CP_TIER_LIMIT)
      .filter(item => {
        const minimum = Number(item.minCombatPower);
        const maximum = Number(item.maxCombatPowerExclusive);
        return Number.isFinite(minimum) &&
          Number.isFinite(maximum) &&
          minimum >= PRESET_CP_TIER_MINIMUM &&
          minimum <= PRESET_CP_TIER_LAST_START &&
          maximum - minimum === PRESET_CP_TIER_SIZE;
      })
      .sort((left, right) => Number(left.minCombatPower) - Number(right.minCombatPower))
      .map(item => ({
        value: `preset:${item.index}`,
        label: item.label,
        minCombatPower: Number(item.minCombatPower),
        maxCombatPowerExclusive: Number(item.maxCombatPowerExclusive),
      }));
    return options.concat(detailed);
  }

  function currentCpSelectionValue() {
    if (state.customCpEditorOpen) {
      return "custom";
    }
    if (state.cpFilterMode === "custom") {
      return state.customCpPresetTierIndex > 0
        ? `preset:${state.customCpPresetTierIndex}`
        : "custom";
    }
    return String(state.cpTierIndex);
  }

  function renderCpFilterMenu(cpTiers = homepageCpTierOptions()) {
    const selectedValue = currentCpSelectionValue();
    const selectedOption = cpTiers.find(item => item.value === selectedValue);
    elements["cp-filter-current"].textContent = selectedValue === "custom"
      ? t("customCp")
      : selectedOption?.label || t("allCp");

    const quickFragment = document.createDocumentFragment();
    for (const option of cpTiers.filter(item => !item.value.startsWith("preset:"))) {
      quickFragment.append(createCpFilterButton(option, selectedValue));
    }
    quickFragment.append(createCpFilterButton({ value: "custom", label: t("customCp") }, selectedValue));
    elements["cp-filter-quick"].replaceChildren(quickFragment);

    const grouped = new Map();
    for (const option of cpTiers.filter(item => item.value.startsWith("preset:"))) {
      const minimumK = Math.trunc(option.minCombatPower / 1000);
      const groupMinimumK = Math.floor(minimumK / 100) * 100;
      if (!grouped.has(groupMinimumK)) {
        grouped.set(groupMinimumK, []);
      }
      grouped.get(groupMinimumK).push(option);
    }

    const groupsFragment = document.createDocumentFragment();
    for (const [minimumK, options] of grouped) {
      const group = document.createElement("section");
      group.className = "cp-filter-group";
      const title = document.createElement("strong");
      title.textContent = t("cpRangeGroup", {
        minimum: formatInteger(minimumK),
        maximum: formatInteger(minimumK + 99),
      });
      const buttons = document.createElement("div");
      buttons.className = "cp-filter-group-buttons";
      for (const option of options) {
        buttons.append(createCpFilterButton(option, selectedValue));
      }
      group.append(title, buttons);
      groupsFragment.append(group);
    }
    elements["cp-filter-groups"].replaceChildren(groupsFragment);
  }

  function createCpFilterButton(option, selectedValue) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cp-filter-option";
    button.dataset.cpValue = option.value;
    button.textContent = option.label;
    const active = option.value === selectedValue;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    return button;
  }

  function openCpFilterMenu() {
    renderCpFilterMenu();
    elements["cp-filter-menu"].hidden = false;
    elements["cp-filter-toggle"].setAttribute("aria-expanded", "true");
    elements["cp-filter-menu"].querySelector(".cp-filter-option.is-active, .cp-filter-option")?.focus();
  }

  function closeCpFilterMenu(restoreFocus) {
    elements["cp-filter-menu"].hidden = true;
    elements["cp-filter-toggle"].setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      elements["cp-filter-toggle"].focus();
    }
  }

  async function applyCpFilterSelection(value) {
    if (value === "custom") {
      state.customCpEditorOpen = true;
      syncCustomCpControls();
      renderCpFilterMenu();
      window.requestAnimationFrame(() => elements["custom-cp-min"].focus());
      return;
    }
    if (String(value).startsWith("preset:")) {
      await applyPresetCpTier(Number(String(value).slice("preset:".length)));
      return;
    }
    state.cpFilterMode = "standard";
    state.customCpPresetTierIndex = 0;
    state.customCpEditorOpen = false;
    state.cpTierIndex = Number(value);
    elements["cp-filter"].value = String(state.cpTierIndex);
    syncCustomCpControls();
    renderCpFilterMenu();
    leaveClassView();
    render();
  }

  async function applyPresetCpTier(tierIndex) {
    state.customCpEditorOpen = false;
    const tier = (state.data?.cpTiers || []).find(item =>
      Number(item.index) === tierIndex &&
      Number(item.index) >= STANDARD_CP_TIER_LIMIT);
    const minimum = Number(tier?.minCombatPower);
    const maximumExclusive = Number(tier?.maxCombatPowerExclusive);
    if (!Number.isFinite(minimum) || !Number.isFinite(maximumExclusive) ||
        maximumExclusive - minimum !== PRESET_CP_TIER_SIZE) {
      state.cpFilterMode = "standard";
      state.customCpPresetTierIndex = 0;
      state.cpTierIndex = 0;
      populateFilters();
      render();
      return;
    }

    await activateCustomCpRange(
      Math.trunc(minimum / 1000),
      Math.trunc((maximumExclusive - 1) / 1000),
      tierIndex);
  }

  async function applyCustomCpValue() {
    const minimum = Math.trunc(Number(elements["custom-cp-min"].value));
    const maximum = Math.trunc(Number(elements["custom-cp-max"].value));
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum) ||
        minimum < 400 || maximum > 1999 || maximum <= minimum) {
      elements["custom-cp-result"].textContent = t("customCpInvalid");
      elements["custom-cp-result"].classList.add("error");
      (minimum < 400 ? elements["custom-cp-min"] : elements["custom-cp-max"]).focus();
      return;
    }

    localStorage.setItem("notmeter-stats-custom-cp-min-k", String(minimum));
    localStorage.setItem("notmeter-stats-custom-cp-max-k", String(maximum));
    await activateCustomCpRange(minimum, maximum, 0);
  }

  async function activateCustomCpRange(minimum, maximum, presetTierIndex) {
    const previousMinimum = state.customCpMinK;
    const previousMaximum = state.customCpMaxK;
    state.customCpMinK = minimum;
    state.customCpMaxK = maximum;
    elements["custom-cp-apply"].disabled = true;
    elements["custom-cp-result"].textContent = t("loading");
    elements["custom-cp-result"].classList.remove("error");
    try {
      await ensureCustomCpCache();
    } catch (error) {
      console.error(error);
      state.customCpMinK = previousMinimum;
      state.customCpMaxK = previousMaximum;
      elements["custom-cp-result"].textContent = t("cacheUnavailable");
      elements["custom-cp-result"].classList.add("error");
      return;
    } finally {
      elements["custom-cp-apply"].disabled = false;
    }
    if (matchingCustomCpTiers().length === 0) {
      elements["custom-cp-result"].textContent = t("customCpInvalid");
      elements["custom-cp-result"].classList.add("error");
      return;
    }

    state.cpFilterMode = "custom";
    state.customCpPresetTierIndex = presetTierIndex;
    state.customCpEditorOpen = false;
    state.cpTierIndex = -1;
    elements["cp-filter"].value = presetTierIndex > 0
      ? `preset:${presetTierIndex}`
      : "custom";
    syncCustomCpControls();
    leaveClassView();
    populateFilters();
    render();
    const rankLoad = ensureCustomCpRankCache(state.dungeonKey)
      .catch(error => {
        console.warn("custom CP rank cache prefetch failed", error);
        return null;
      });
    void rankLoad.then(cache => {
      if (cache && state.mode === "class") {
        renderClassRanking();
      }
    });
  }

  function matchingCustomCpTiers() {
    if (!state.customCpData) {
      return [];
    }
    const minimum = state.customCpMinK * 1000;
    const maximum = state.customCpMaxK * 1000;
    return state.customCpData.cpTiers
      .filter(item => Number(item.index) >= STANDARD_CP_TIER_LIMIT)
      .filter(item => {
        const tierMinimum = Number(item.minCombatPower) || 0;
        const tierMaximum = item.maxCombatPowerExclusive == null
          ? Number.POSITIVE_INFINITY
          : Number(item.maxCombatPowerExclusive);
        return tierMaximum > minimum && tierMinimum <= maximum;
      });
  }

  function syncCustomCpControls() {
    const custom = state.customCpEditorOpen ||
      (state.cpFilterMode === "custom" && state.customCpPresetTierIndex === 0);
    elements["custom-cp-panel"].hidden = !custom;
    elements["custom-cp-min"].value = String(state.customCpMinK);
    elements["custom-cp-max"].value = String(state.customCpMaxK);
    elements["custom-cp-result"].classList.remove("error");
    if (!custom || !state.data || (state.customCpEditorOpen && !state.customCpData)) {
      elements["custom-cp-result"].textContent = "";
      return;
    }
    elements["custom-cp-result"].textContent = matchingCustomCpTiers().length > 0
      ? t("customCpResolved", {
          minimum: formatInteger(state.customCpMinK),
          maximum: formatInteger(state.customCpMaxK),
        })
      : t("customCpInvalid");
  }

  function render() {
    if (state.surfaceMode === "character") {
      return;
    }
    if (state.surfaceMode === "optimization") {
      ensureOptimizationFrame();
      return;
    }
    if (state.surfaceMode === "fieldBoss") {
      if (state.fieldBossData) {
        renderFieldBoss();
      }
      return;
    }
    if (state.surfaceMode === "classTop10") {
      renderClassTop10();
      return;
    }
    if (state.surfaceMode === "classPerformance") {
      renderClassPerformance();
      return;
    }
    if (state.surfaceMode === "contribution") {
      if (state.contributionData) {
        renderContributionStats();
      }
      return;
    }
    if (state.surfaceMode === "bossResistance") {
      if (state.data) {
        renderBossResistanceView();
      }
      return;
    }
    if (state.surfaceMode === "statEfficiency") {
      return;
    }
    if (!state.data) {
      return;
    }
    applyLocale();
    updateDailyUsers();
    updateCacheAge();
    syncRankingMetricControl();
    state.mode === "class" ? renderClassRanking() : renderSummary();
  }

  function bossResistanceDungeons() {
    const excludedDungeonKeys = new Set([
      "training-dummy-60s",
      "abyss-horn-4",
      "fallen-deva-hard",
      "bakron-trial",
    ]);
    return (state.data?.dungeons || []).filter(dungeon =>
      !excludedDungeonKeys.has(String(dungeon?.key || "")) &&
      Array.isArray(dungeon?.bossNames) && dungeon.bossNames.length > 0);
  }

  function renderBossResistanceView() {
    const dungeons = bossResistanceDungeons();
    const availableKeys = new Set(dungeons.map(dungeon => dungeon.key));
    if (!availableKeys.has(state.bossResistanceDungeonKey)) {
      state.bossResistanceDungeonKey = dungeons[0]?.key || "";
    }

    const tabs = document.createDocumentFragment();
    for (const dungeon of dungeons) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "boss-resistance-tab";
      button.classList.toggle("active", dungeon.key === state.bossResistanceDungeonKey);
      button.dataset.bossResistanceDungeon = dungeon.key;
      button.setAttribute("aria-pressed", String(dungeon.key === state.bossResistanceDungeonKey));
      button.textContent = dungeonName(dungeon);
      tabs.append(button);
    }
    elements["boss-resistance-tabs"].replaceChildren(tabs);

    const dungeon = dungeons.find(item => item.key === state.bossResistanceDungeonKey);
    const hasDungeon = Boolean(dungeon);
    elements["boss-resistance-content"].hidden = !hasDungeon;
    elements["boss-resistance-empty"].hidden = hasDungeon;
    if (!dungeon) {
      elements["boss-resistance-rows"].replaceChildren();
      return;
    }

    elements["boss-resistance-dungeon-title"].textContent = dungeonName(dungeon);
    const statsByBoss = new Map((state.data?.bossResistanceStats || [])
      .filter(item => String(item?.dungeonKey || "") === dungeon.key)
      .map(item => [Number(item?.bossIndex), item]));
    const rows = document.createDocumentFragment();
    dungeon.bossNames.forEach((rawBossName, index) => {
      const stats = statsByBoss.get(index + 1);
      const row = document.createElement("article");
      row.className = "boss-resistance-row";

      const identity = document.createElement("div");
      identity.className = "boss-resistance-boss";
      const order = document.createElement("span");
      order.className = "boss-resistance-order";
      order.textContent = String(index + 1);
      const identityCopy = document.createElement("div");
      identityCopy.className = "boss-resistance-boss-copy";
      const bossName = document.createElement("strong");
      bossName.textContent = localizeGameName(rawBossName);
      const sample = document.createElement("small");
      sample.className = "boss-resistance-sample";
      const recordCount = Math.max(0, Math.trunc(Number(stats?.recordCount) || 0));
      sample.textContent = recordCount > 0
        ? t("bossResistanceSample", { records: formatInteger(recordCount) })
        : t("bossResistancePending");
      identityCopy.append(bossName, sample);
      identity.append(order, identityCopy);

      row.append(
        identity,
        createBossResistanceMetric(
          "hard-hit",
          "hardHitResistance",
          stats?.estimatedHardHitResistancePercent,
          stats?.hardHitTrials),
        createBossResistanceMetric(
          "perfect",
          "perfectResistance",
          stats?.estimatedPerfectResistancePercent,
          stats?.perfectTrials));
      rows.append(row);
    });
    elements["boss-resistance-rows"].replaceChildren(rows);
  }

  function createBossResistanceMetric(kind, labelKey, value, hits) {
    const metric = document.createElement("div");
    metric.className = `boss-resistance-metric ${kind}`;
    const labelElement = document.createElement("span");
    labelElement.className = "boss-resistance-metric-label";
    labelElement.textContent = t(labelKey);
    const reading = document.createElement("div");
    reading.className = "boss-resistance-reading";
    const settingLabel = document.createElement("small");
    settingLabel.className = "boss-resistance-setting-label";
    settingLabel.textContent = t("bossResistanceSettingEstimate");
    const settingValue = document.createElement("strong");
    const measuredValue = document.createElement("small");
    measuredValue.className = "boss-resistance-measured";
    const numericValue = Number(value);
    const hitCount = Math.max(0, Math.trunc(Number(hits) || 0));
    if (value === null || value === undefined || !Number.isFinite(numericValue) || hitCount <= 0) {
      settingValue.textContent = "—";
      measuredValue.textContent = t("bossResistancePending");
      metric.classList.add("pending");
    } else {
      const roundedEstimate = Math.max(0, Math.min(100, Math.round(numericValue / 5) * 5));
      settingValue.textContent = formatPercent(roundedEstimate);
      measuredValue.textContent = t("bossResistanceMeasuredEstimate", {
        value: formatPercent(numericValue, numericValue % 1 === 0 ? 0 : 2),
      });
    }
    reading.append(settingLabel, settingValue, measuredValue);
    metric.append(labelElement, reading);
    return metric;
  }

  function decodeClassPerformanceExclusionMask() {
    const maximumMask = (1 << JOB_ORDER.length) - 1;
    const stored = Number(localStorage.getItem("notmeter-class-performance-exclusion-mask"));
    if (Number.isInteger(stored) && stored > 0 && stored <= maximumMask) {
      return stored;
    }
    const legacyJob = localStorage.getItem("notmeter-class-performance-excluded-job") || "";
    const legacyIndex = JOB_ORDER.indexOf(legacyJob);
    return legacyIndex >= 0 ? 1 << legacyIndex : 0;
  }

  function saveClassPerformanceExclusion() {
    localStorage.removeItem("notmeter-class-performance-composition");
    if (state.performanceExclusionMask > 0) {
      localStorage.setItem(
        "notmeter-class-performance-exclusion-mask",
        String(state.performanceExclusionMask));
    } else {
      localStorage.removeItem("notmeter-class-performance-exclusion-mask");
    }
    localStorage.removeItem("notmeter-class-performance-excluded-job");
  }

  function renderClassPerformanceInPlace() {
    const anchor = document.querySelector(".class-performance-composition");
    const anchorTop = anchor?.getBoundingClientRect().top;
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const chart = elements["class-performance-chart"];
    const chartHeight = chart.getBoundingClientRect().height;
    if (chartHeight > 0) {
      chart.style.minHeight = `${Math.ceil(chartHeight)}px`;
    }
    renderClassPerformance();

    const restorePosition = () => {
      if (anchor && Number.isFinite(anchorTop)) {
        const offset = anchor.getBoundingClientRect().top - anchorTop;
        if (Math.abs(offset) > 0.5) {
          window.scrollBy(0, offset);
        }
        return;
      }
      window.scrollTo(scrollLeft, scrollTop);
    };

    restorePosition();
    window.requestAnimationFrame(restorePosition);
  }

  function renderClassPerformanceComposition(snapshot) {
    const fragment = document.createDocumentFragment();
    JOB_ORDER.forEach((job, index) => {
      const excluded = (state.performanceExclusionMask & (1 << index)) !== 0;
      const tile = document.createElement("article");
      tile.className = `class-performance-composition-job${excluded ? " excluded" : ""}`;
      tile.style.setProperty("--job-color", PERFORMANCE_JOB_COLORS[job] || "#46e0d5");

      const identity = document.createElement("div");
      identity.className = "class-performance-composition-identity";
      identity.append(createJobIcon(job));
      const name = document.createElement("strong");
      name.textContent = jobName(job);
      identity.append(name);

      const exclude = document.createElement("button");
      exclude.type = "button";
      exclude.className = "class-performance-composition-exclude";
      exclude.dataset.compositionJob = String(index);
      exclude.dataset.compositionAction = "exclude";
      exclude.setAttribute("aria-pressed", String(excluded));
      exclude.setAttribute(
        "aria-label",
        t("classPerformanceCompositionExcludeJob", { job: jobName(job) }));
      exclude.textContent = t("classPerformanceCompositionExclude");
      tile.append(identity, exclude);
      fragment.append(tile);
    });
    elements["class-performance-composition-jobs"].replaceChildren(fragment);
    elements["class-performance-composition-reset"].disabled =
      state.performanceExclusionMask === 0;

    const maximumExclusionMask = (1 << JOB_ORDER.length) - 1;
    const exclusionMask = state.performanceExclusionMask & maximumExclusionMask;
    const exclusion = exclusionMask > 0
      ? (snapshot?.exclusions || []).find(item => Number(item.mask) === exclusionMask)
      : null;
    const excludedJobNames = JOB_ORDER
      .filter((_, index) => (exclusionMask & (1 << index)) !== 0)
      .map(jobName);
    elements["class-performance-composition-status"].classList.toggle(
      "unavailable",
      exclusionMask > 0 && !exclusion);
    elements["class-performance-composition-status"].textContent = exclusionMask > 0
      ? exclusion
        ? t("classPerformanceCompositionExcluded", {
            jobs: excludedJobNames.join(" · "),
            samples: formatInteger(Number(exclusion.sampleCount) || 0),
            characters: formatInteger(Number(exclusion.uniqueCharacters) || 0),
          })
        : t("classPerformanceCompositionUnavailable")
      : t("classPerformanceCompositionAll");
    return { exclusionMask, exclusion };
  }

  function renderClassPerformance() {
    const snapshot = state.data?.classPerformance;
    const available = snapshot && Array.isArray(snapshot.rows);
    elements["class-performance-pending"].hidden = available;
    elements["class-performance-empty"].hidden = true;
    if (!available) {
      elements["class-performance-summary"].textContent = "—";
      elements["class-performance-chart"].hidden = true;
      elements["class-performance-chart"].replaceChildren();
      return;
    }

    const compositionSelection = renderClassPerformanceComposition(snapshot);
    const selectedSnapshot = compositionSelection.exclusionMask > 0
      ? compositionSelection.exclusion
      : snapshot;
    if (!selectedSnapshot || !Array.isArray(selectedSnapshot.rows)) {
      elements["class-performance-summary"].textContent = "—";
      elements["class-performance-empty"].hidden = false;
      elements["class-performance-chart"].hidden = true;
      elements["class-performance-chart"].replaceChildren();
      return;
    }

    const metrics = ["p50Score", "p75Score", "p90Score"];
    if (!metrics.includes(state.performanceMetric)) {
      state.performanceMetric = "p75Score";
    }
    document.querySelectorAll("[data-performance-metric]").forEach(button => {
      const active = button.dataset.performanceMetric === state.performanceMetric;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const metricCopy = {
      p50Score: ["classPerformanceP50Title", "classPerformanceP50Text"],
      p75Score: ["classPerformanceP75Title", "classPerformanceP75Text"],
      p90Score: ["classPerformanceP90Title", "classPerformanceP90Text"],
    }[state.performanceMetric];
    elements["class-performance-metric-title"].textContent = t(metricCopy[0]);
    elements["class-performance-metric-description"].textContent = t(metricCopy[1]);

    const ranked = selectedSnapshot.rows
      .filter(row => Number(row.rank) > 0 && row.confidenceGrade !== "insufficient")
      .sort((left, right) =>
        Number(right[state.performanceMetric] || 0) - Number(left[state.performanceMetric] || 0));
    const insufficient = selectedSnapshot.rows
      .filter(row => Number(row.rank) <= 0 || row.confidenceGrade === "insufficient")
      .sort((left, right) => Number(right.uniqueCharacters) - Number(left.uniqueCharacters));
    const weeklyRange = parseWeeklyRange(snapshot.periodLabel);
    elements["class-performance-summary"].textContent = t("classPerformanceSummary", {
      period: weeklyRange ? formatWeeklyRange(weeklyRange) : t("thisWeek"),
      jobs: ranked.length,
      characters: formatInteger(ranked.reduce(
        (sum, row) => sum + Number(row.uniqueCharacters || 0), 0)),
      contents: Number(selectedSnapshot.totalContentCount || 0),
    });
    if (selectedSnapshot.rows.length === 0) {
      elements["class-performance-empty"].hidden = false;
      elements["class-performance-chart"].hidden = true;
      elements["class-performance-chart"].replaceChildren();
      return;
    }

    elements["class-performance-empty"].hidden = ranked.length > 0;
    const maximum = Math.max(110, ...ranked.map(row => Number(row[state.performanceMetric]) || 0));
    const scaleMaximum = Math.ceil(maximum / 5) * 5;
    const overallRows = new Map((snapshot.rows || []).map(row => [row.jobName, row]));
    const compareWithOverall = compositionSelection.exclusionMask > 0;
    const fragment = document.createDocumentFragment();
    ranked.forEach((row, index) => fragment.append(
      buildClassPerformanceRow(
        row,
        index + 1,
        scaleMaximum,
        false,
        compareWithOverall ? overallRows.get(row.jobName) : null)));
    insufficient.forEach(row => fragment.append(
      buildClassPerformanceRow(row, 0, scaleMaximum, true, null)));
    elements["class-performance-chart"].replaceChildren(fragment);
    elements["class-performance-chart"].hidden = false;
  }

  function buildClassPerformanceRow(
    row,
    displayRank,
    scaleMaximum,
    insufficient,
    overallRow = null) {
    const article = document.createElement("article");
    article.className = `class-performance-row${insufficient ? " insufficient" : ""}`;
    article.style.setProperty("--job-color", PERFORMANCE_JOB_COLORS[row.jobName] || "#46e0d5");

    const rank = document.createElement("span");
    rank.className = "class-performance-rank";
    rank.textContent = displayRank > 0 ? String(displayRank) : "—";

    const identity = document.createElement("div");
    identity.className = "class-performance-identity";
    identity.append(createJobIcon(row.jobName));
    const identityText = document.createElement("span");
    const job = document.createElement("strong");
    job.textContent = jobName(row.jobName);
    const grade = document.createElement("b");
    grade.className = `class-performance-grade grade-${String(row.confidenceGrade).toLowerCase()}`;
    grade.textContent = row.confidenceGrade === "insufficient"
      ? t("classPerformanceInsufficient")
      : t("classPerformanceGrade", { grade: row.confidenceGrade });
    identityText.append(job, grade);
    identity.append(identityText);

    const scoreValue = Number(row[state.performanceMetric]) || 0;
    const graph = document.createElement("div");
    graph.className = "class-performance-graph";
    const track = document.createElement("span");
    track.className = "class-performance-track";
    const fill = document.createElement("span");
    fill.className = "class-performance-fill";
    fill.style.width = `${Math.max(0, Math.min(100, scoreValue / scaleMaximum * 100))}%`;
    const baseline = document.createElement("span");
    baseline.className = "class-performance-baseline";
    baseline.style.left = `${100 / scaleMaximum * 100}%`;
    track.append(fill, baseline);
    const scale = document.createElement("span");
    scale.className = "class-performance-scale";
    scale.innerHTML = `<i>0</i><i>${t("classPerformanceBaseline")}</i><i>${formatDecimal(scaleMaximum, 0)}</i>`;
    graph.append(track, scale);

    const score = document.createElement("div");
    score.className = "class-performance-score";
    if (insufficient) {
      score.innerHTML = `<strong>—</strong><span>${t("classPerformanceInsufficientHint")}</span>`;
    } else {
      const delta = scoreValue - 100;
      const deltaText = `${delta >= 0 ? "+" : ""}${formatDecimal(delta, 1)}%`;
      score.innerHTML = `<strong>${formatDecimal(scoreValue, 1)}</strong><span>${deltaText}</span>`;
    }

    const evidence = document.createElement("div");
    evidence.className = "class-performance-evidence";
    const overallScore = Number(overallRow?.[state.performanceMetric]);
    if (!insufficient && Number.isFinite(overallScore) && overallScore > 0) {
      const difference = scoreValue - overallScore;
      const comparison = document.createElement("span");
      comparison.className = `class-performance-comparison ${
        difference > 0.05 ? "positive" : difference < -0.05 ? "negative" : "neutral"}`;
      comparison.textContent = t("classPerformanceExclusionDifference", {
        value: `${difference >= 0 ? "+" : ""}${formatDecimal(difference, 1)}`,
      });
      evidence.append(comparison);
    }
    const ciText = t("classPerformanceCi", {
      low: formatDecimal(row.confidenceLow, 1),
      high: formatDecimal(row.confidenceHigh, 1),
    });
    evidence.insertAdjacentHTML("beforeend", `
      <span>${t("classPerformanceCharacters", { value: formatInteger(row.uniqueCharacters) })}</span>
      <span>${t("classPerformanceSamples", { value: formatInteger(row.sampleCount) })}</span>
      <span>${t("classPerformanceCoverage", {
        value: row.contentCoverage,
        total: state.data?.classPerformance?.totalContentCount || 0,
      })}</span>
      <span>${ciText}</span>`);

    article.append(rank, identity, graph, score, evidence);
    return article;
  }

  function renderClassTop10() {
    const snapshot = state.data?.classOverall;
    const available = snapshot && Array.isArray(snapshot.jobs);
    elements["class-top10-pending"].hidden = available;
    elements["class-top10-empty"].hidden = true;
    elements["class-top10-view"].hidden = true;
    if (!available) {
      elements["class-top10-tabs"].replaceChildren();
      elements["class-top10-rows"].replaceChildren();
      return;
    }

    const jobsByName = new Map(snapshot.jobs.map(job => [job.jobName, job]));
    if (!JOB_ORDER.includes(state.selectedOverallJob)) {
      state.selectedOverallJob = JOB_ORDER.find(job =>
        Array.isArray(jobsByName.get(job)?.players) &&
        jobsByName.get(job).players.length > 0) || JOB_ORDER[0];
    }
    renderClassTop10Tabs(jobsByName);

    const players = [...(jobsByName.get(state.selectedOverallJob)?.players || [])]
      .sort((left, right) => Number(left.rank) - Number(right.rank))
      .slice(0, 10);
    if (players.length === 0) {
      elements["class-top10-empty"].hidden = false;
      elements["class-top10-rows"].replaceChildren();
      return;
    }

    const fragment = document.createDocumentFragment();
    players.forEach(player =>
      fragment.append(buildClassTop10Row(player, state.selectedOverallJob)));
    elements["class-top10-rows"].replaceChildren(fragment);
    elements["class-top10-view"].hidden = false;
  }

  function renderClassTop10Tabs(jobsByName) {
    const fragment = document.createDocumentFragment();
    for (const job of JOB_ORDER) {
      const count = jobsByName.get(job)?.players?.length || 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "class-top10-tab";
      button.classList.toggle("active", job === state.selectedOverallJob);
      button.setAttribute("aria-pressed", String(job === state.selectedOverallJob));
      button.append(createJobIcon(job));
      const label = document.createElement("span");
      label.textContent = jobName(job);
      const badge = document.createElement("b");
      badge.textContent = String(count);
      button.append(label, badge);
      button.addEventListener("click", () => {
        state.selectedOverallJob = job;
        renderClassTop10();
      });
      fragment.append(button);
    }
    elements["class-top10-tabs"].replaceChildren(fragment);
  }

  function buildClassTop10Row(player, job) {
    const tr = document.createElement("tr");
    tr.className = "class-top10-row";
    tr.append(cellWithRank(player.rank));

    const characterCell = document.createElement("td");
    characterCell.className = "class-top10-character";
    const character = document.createElement("div");
    character.className = "character-main";
    character.append(createJobIcon(job));

    const characterBody = document.createElement("span");
    characterBody.className = "class-top10-character-body";
    const identity = document.createElement("span");
    identity.className = "class-top10-identity";
    const name = document.createElement("span");
    name.className = "character-name";
    name.textContent = String(player.name || "").replace(/^\[TW\]\s*/i, "").trim();
    name.title = formatCharacterName(player.name, player.serverId);
    identity.append(name);
    const server = serverLabel(Number(player.serverId));
    if (server) {
      const serverName = document.createElement("span");
      serverName.className = "class-top10-server";
      serverName.textContent = server;
      identity.append(serverName);
    }
    characterBody.append(identity);

    const meta = document.createElement("span");
    meta.className = "class-top10-character-meta";
    if (isTaiwanName(player.name)) {
      const badge = document.createElement("span");
      badge.className = "tw-badge";
      badge.title = t("taiwanServer");
      meta.append(badge);
    }
    const observedCombatPower = Math.max(
      0,
      ...(player.placements || []).map(placement =>
        Math.trunc(Number(placement.combatPower) || 0)));
    if (observedCombatPower > 0) {
      const cp = document.createElement("span");
      cp.className = "cp-badge class-top10-cp";
      const cpIcon = document.createElement("img");
      cpIcon.src = "./assets/combat-power.png";
      cpIcon.alt = "";
      const value = document.createElement("span");
      value.textContent = formatCombatPower(observedCombatPower);
      cp.title = t("classTop10ObservedCp", {
        value: formatInteger(observedCombatPower),
      });
      cp.append(cpIcon, value);
      meta.append(cp);
    }
    appendCharacterProfileLink(meta, player);
    if (meta.childElementCount > 0) {
      characterBody.append(meta);
    }
    character.append(characterBody);
    characterCell.append(character);
    tr.append(characterCell);

    tr.append(numericCell(
      t("pointsUnit", { value: formatInteger(player.score) }),
      "accent class-top10-score",
      t("combinedScore")));
    tr.append(numericCell(
      formatDps(player.totalDps),
      "class-top10-total-dps",
      t("totalDps")));
    tr.append(numericCell(
      t("firstPlacesValue", { value: formatInteger(player.firstPlaceCount) }),
      "class-top10-firsts",
      t("firstPlaces")));

    const resultsCell = document.createElement("td");
    resultsCell.className = "class-top10-results-cell";
    const results = document.createElement("div");
    results.className = "class-top10-results";
    for (const placement of player.placements || []) {
      const chip = document.createElement("span");
      chip.className = "class-top10-result";
      chip.title =
        `${fullOverallDungeonName(placement.dungeonKey, placement.dungeonName)}\n` +
        `${t("rank")} ${placement.rank} · DPS ${formatInteger(placement.dps)}`;
      const label = document.createElement("span");
      label.textContent = fullOverallDungeonName(
        placement.dungeonKey,
        placement.dungeonName);
      const rank = document.createElement("b");
      rank.textContent = `#${placement.rank}`;
      chip.append(label, rank);
      results.append(chip);
    }
    resultsCell.append(results);
    tr.append(resultsCell);
    return tr;
  }

  function fullOverallDungeonName(dungeonKey, displayName) {
    const names = state.locale === "en"
      ? {
          "deus-research-hard": "Corrupted Deus Research Base (Hard)",
          "noiran-legacy-4": "Noiran's Hidden Legacy (Stage 4)",
          "training-dummy-60s": "Training Dummy (1 min)",
          "bakron-trial": "Trial: Bakron's Sky Island",
          "musphel-hard": "Musphel's Holy Grail (Hard)",
          "fallen-deva-hard": "Fallen Daeva Castle (Hard)",
          "abyss-horn-4": "Abyss Horn Cavern (Stage 4)",
          "nightmare-atheron-10": "Nightmare",
        }
      : state.locale === "zh-TW"
        ? DUNGEON_NAMES_ZH_TW
        : {
          "deus-research-hard": "잠식된 데우스 연구기지(어려움)",
          "noiran-legacy-4": "노이란의 숨겨진 유산(4단계)",
          "training-dummy-60s": "훈련용 허수아비 (1분)",
          "bakron-trial": "시련: 바크론의 공중섬",
          "musphel-hard": "무스펠의 성배(어려움)",
          "fallen-deva-hard": "타락한 데바의 성(어려움)",
          "abyss-horn-4": "심연의 뿔 암굴(4단계)",
          "nightmare-atheron-10": "악몽",
        };
    return names[dungeonKey] || localizeGameName(displayName) || dungeonKey;
  }

  function renderSummary() {
    if (!state.loadedViewDungeonKeys.has(state.dungeonKey)) {
      showState("loading");
      void ensureViewRankingCache(state.dungeonKey)
        .then(() => {
          if (state.mode === "summary" && state.surfaceMode === "ranking") {
            populateFilters();
            renderSummary();
          }
        })
        .catch(error => {
          console.error(error);
          elements["error-message"].textContent =
            error instanceof Error && error.message ? error.message : t("cacheUnavailable");
          showState("error");
        });
      return;
    }
    const view = findSummaryView();
    const usesDirectCustomRange =
      state.cpFilterMode === "custom" && state.customCpPresetTierIndex === 0;
    elements["sample-column-heading"].textContent =
      t(usesDirectCustomRange ? "recordSample" : "sample");
    elements["sample-column-heading"].title = t(
      usesDirectCustomRange ? "recordSampleColumnTooltip" : "sampleBasisColumnTooltip");
    elements["empty-message"].textContent = t(usesNormalizedRanking() ? "ndpsEmpty" : "empty");
    elements["class-heading"].hidden = true;
    elements["class-view"].hidden = true;
    if (!view || !Array.isArray(view.rows) || view.rows.length === 0) {
      updateSnapshot(view);
      showState("empty");
      return;
    }

    updateSnapshot(view);
    const rows = view.rows
      .map(projectSummaryRowForMetric)
      .filter(Boolean)
      .sort((left, right) => Number(right.p75Dps) - Number(left.p75Dps));
    if (rows.length === 0) {
      showState("empty");
      return;
    }
    const max = Math.max(1, ...rows.map(item => Number(item.maxDps) || 0));
    const fragment = document.createDocumentFragment();
    rows.forEach((row, index) => {
      const rank = index + 1;
      fragment.append(buildSummaryRow(row, rank, max));
    });
    elements["summary-rows"].replaceChildren(fragment);
    showState("summary");
  }

  function buildSummaryRow(row, rank, globalMax) {
    const usesDirectCustomRange =
      state.cpFilterMode === "custom" && state.customCpPresetTierIndex === 0;
    const previous = state.period === "Weekly" ? resolvePreviousWeekStats(row) : null;
    const tr = document.createElement("tr");
    tr.className = "job-row";
    tr.dataset.rank = String(rank);
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute("aria-label", `${jobName(row.jobName)} ${t("details")}`);
    const open = () => {
      if (state.mode === "class" || isRankingNavigationBlocked()) {
        return;
      }
      state.selectedJob = row.jobName;
      state.mode = "class";
      blockRankingNavigation();
      history.pushState({
        notMeterStatsView: "class",
        notMeterStatsJob: row.jobName,
      }, "");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    tr.addEventListener("click", event => {
      if (!isRepeatedPointerActivation(event)) {
        open();
      }
    });
    tr.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    tr.append(cellWithRank(rank));

    const jobCell = document.createElement("td");
    jobCell.className = "summary-job-cell";
    const jobWrap = document.createElement("div");
    jobWrap.className = "job-cell";
    jobWrap.append(createJobIcon(row.jobName));
    const name = document.createElement("span");
    name.className = "job-name";
    name.textContent = jobName(row.jobName);
    jobWrap.append(name);
    const comparison = buildWeeklyComparisonBadge(row);
    if (comparison) {
      jobWrap.append(comparison);
    }
    jobCell.append(jobWrap);
    tr.append(jobCell);

    const sampleCell = numericCell(
      usesDirectCustomRange
        ? t("recordSampleValue", { count: formatInteger(row.sampleCount) })
        : formatInteger(row.sampleCount),
      "summary-sample",
      t(usesDirectCustomRange ? "recordSample" : "sample"));
    if (usesDirectCustomRange) {
      sampleCell.title = t("recordSampleTooltip", {
        count: formatInteger(row.sampleCount),
      });
    }
    appendPreviousWeekValue(
      sampleCell,
      previous,
      value => formatInteger(value.sampleCount),
      row.sampleCount,
      value => value.sampleCount);
    tr.append(sampleCell);
    const p90Cell = numericCell(formatSummaryDps(summaryP90Dps(row)), "summary-p90", t("top10Threshold"));
    appendPreviousWeekValue(
      p90Cell,
      previous,
      value => formatPreviousWeekDps(value.p90),
      summaryP90Dps(row),
      value => value.p90);
    tr.append(p90Cell);
    const p75Cell = numericCell(formatDps(row.p75Dps), "accent summary-p75", t("top25"));
    appendPreviousWeekValue(
      p75Cell,
      previous,
      value => formatPreviousWeekDps(value.p75),
      row.p75Dps,
      value => value.p75);
    tr.append(p75Cell);
    const medianCell = numericCell(formatDps(row.medianDps), "median summary-median", t("median"));
    appendPreviousWeekValue(
      medianCell,
      previous,
      value => formatPreviousWeekDps(value.median),
      row.medianDps,
      value => value.median);
    tr.append(medianCell);
    const maxCell = numericCell(formatDps(row.maxDps), "max summary-max", t("max"));
    appendPreviousWeekValue(
      maxCell,
      previous,
      value => formatPreviousWeekDps(value.max),
      row.maxDps,
      value => value.max);
    tr.append(maxCell);

    const distributionCell = document.createElement("td");
    distributionCell.className = "summary-distribution";
    const distribution = document.createElement("div");
    distribution.className = "distribution";
    const track = document.createElement("div");
    track.className = "distribution-track";
    const fill = document.createElement("div");
    fill.className = "distribution-fill";
    fill.style.width = `${Math.max(4, Math.min(100, Number(row.maxDps) / globalMax * 100))}%`;
    track.append(fill);
    const label = document.createElement("span");
    label.className = "distribution-label";
    label.textContent = `${formatDps(row.minDps)} ~ ${formatDps(row.maxDps)}`;
    distribution.append(track, label);
    distributionCell.append(distribution);
    tr.append(distributionCell);

    const chevron = document.createElement("td");
    chevron.className = "row-chevron";
    chevron.textContent = "›";
    tr.append(chevron);
    return tr;
  }

  function appendPreviousWeekValue(cell, previous, formatter, currentMetric, previousMetricSelector) {
    if (!previous) {
      return;
    }
    const current = document.createElement("span");
    current.className = "weekly-current-value";
    current.textContent = cell.textContent;
    const currentNumber = Number(currentMetric) || 0;
    const previousNumber = Number(previousMetricSelector(previous)) || 0;
    const previousText = formatter(previous);
    const comparison = weeklyMetricChange(currentNumber, previousNumber);
    const previousValue = document.createElement("small");
    previousValue.className = "weekly-previous-inline";
    const previousLabel = document.createElement("span");
    previousLabel.className = "weekly-previous-label";
    previousLabel.textContent = t("weeklyPreviousShort");
    const previousMetric = document.createElement("span");
    previousMetric.className = "weekly-previous-value";
    previousMetric.textContent = previousText;
    previousValue.append(previousLabel, previousMetric);
    if (comparison) {
      const delta = document.createElement("span");
      delta.className = `weekly-metric-delta ${comparison.direction}`;
      delta.textContent = comparison.label;
      previousValue.append(delta);
    }
    previousValue.title = `${t("weeklyPreviousShort")} ${previousText} · ${t("thisWeek")} ${current.textContent}` +
      (comparison ? ` · ${comparison.label}` : "");
    cell.classList.add("has-weekly-previous");
    cell.replaceChildren(current, previousValue);
  }

  function weeklyMetricChange(currentMetric, previousMetric) {
    const current = Number(currentMetric);
    const previous = Number(previousMetric);
    if (!(current > 0) || !(previous > 0)) {
      return null;
    }
    const value = (current - previous) / previous * 100;
    const direction = value > 0.05 ? "up" : value < -0.05 ? "down" : "flat";
    return {
      direction,
      value,
      label: `${direction === "up" ? "▲" : direction === "down" ? "▼" : "–"}${Math.abs(value).toFixed(1)}%`,
    };
  }

  function resolvePreviousWeekStats(row) {
    const published = previousWeekSummary(row?.previousWeek);
    if (published) {
      return published;
    }
    if (!Array.isArray(row?.dpsPercentiles) || row.dpsPercentiles.length < 3) {
      return null;
    }
    const sampleCount = Math.max(0, Math.round(Number(row.dpsPercentiles[2]) || 0));
    const p75 = Number(row.dpsPercentiles[0]) || 0;
    if (sampleCount <= 0 || p75 <= 0) {
      return null;
    }
    return {
      sampleCount,
      p90: 0,
      p75,
      median: usesNormalizedRanking() ? 0 : Number(row.dpsPercentiles[1]) || 0,
      max: 0,
    };
  }

  function previousWeeklyRange(periodLabel) {
    const current = parseWeeklyRange(periodLabel);
    if (!current) {
      return null;
    }
    const week = 7 * 24 * 60 * 60 * 1000;
    return {
      start: new Date(current.start.getTime() - week),
      end: new Date(current.end.getTime() - week),
    };
  }

  function weeklyP75Change(row, previous = resolvePreviousWeekStats(row)) {
    const comparison = weeklyMetricChange(row?.p75Dps, previous?.p75);
    return comparison
      ? { ...comparison, label: comparison.label.replace(/^([▲▼–])/, "$1 ") }
      : null;
  }

  function formatPreviousWeekDps(value) {
    return Number(value) > 0 ? formatDps(value) : "—";
  }

  function usesCombatTimeRanking(dungeonKey = state.dungeonKey) {
    return dungeonKey === "nightmare-atheron-10";
  }

  function usesDpsFallbackRanking(dungeonKey = state.dungeonKey) {
    return dungeonKey === "training-dummy-60s";
  }

  function usesNormalizedRanking() {
    return state.rankingMetric === "ndps" &&
      !usesCombatTimeRanking() &&
      !usesDpsFallbackRanking();
  }

  function syncRankingMetricControl() {
    const requestedNormalized = state.rankingMetric === "ndps";
    const normalized = usesNormalizedRanking();
    elements["ranking-metric-dps"].classList.toggle("is-active", !requestedNormalized);
    elements["ranking-metric-dps"].setAttribute("aria-checked", String(!requestedNormalized));
    elements["ranking-metric-ndps"].classList.toggle("is-active", requestedNormalized);
    elements["ranking-metric-ndps"].setAttribute("aria-checked", String(requestedNormalized));
    elements["ranking-metric-ndps"].disabled = false;
    elements["ranking-metric-description"].textContent = t(usesCombatTimeRanking()
      ? "ndpsRankingUnavailableCombatTime"
      : requestedNormalized && usesDpsFallbackRanking()
        ? "ndpsRankingFallbackDps"
        : normalized
          ? "ndpsRankingDescription"
          : "dpsRankingDescription");
  }

  function projectSummaryRowForMetric(row) {
    if (!usesNormalizedRanking()) {
      return row;
    }
    const metric = row?.normalizedDps;
    const sampleCount = Number(metric?.sampleCount) || 0;
    if (sampleCount <= 0) {
      return null;
    }
    const percentiles = Array.isArray(metric.percentiles)
      ? metric.percentiles
      : Array.isArray(metric.dpsPercentiles)
        ? metric.dpsPercentiles
        : null;
    return {
      ...row,
      sampleCount,
      minDps: Number(metric.minDps ?? metric.min) || 0,
      p25Dps: Number(metric.p25Dps ?? metric.p25) || 0,
      medianDps: Number(metric.medianDps ?? metric.median) || 0,
      p75Dps: Number(metric.p75Dps ?? metric.p75) || 0,
      p90Dps: Number(metric.p90Dps ?? metric.p90) || 0,
      maxDps: Number(metric.maxDps ?? metric.max) || 0,
      dpsPercentiles: percentiles,
      previousWeek: metric.previousWeek || null,
    };
  }

  function rankingDuration(player) {
    const duration = Number(player?.U ?? player?.durationSeconds);
    return Number.isFinite(duration) && duration > 0
      ? duration
      : Number.POSITIVE_INFINITY;
  }

  function rankingDps(player) {
    return Number(player?.X ?? player?.dps) || 0;
  }

  function rankingNormalizedDps(player) {
    const verified = player?.A ?? player?.raidDpsVerified;
    if (verified !== true && Number(verified) !== 1) {
      return 0;
    }
    return Math.max(0, Number(player?.Y ?? player?.normalizedDps) || 0);
  }

  function compareClassRankingPlayers(left, right) {
    if (usesCombatTimeRanking()) {
      const durationDifference = rankingDuration(left) - rankingDuration(right);
      if (durationDifference !== 0) {
        return durationDifference;
      }
    }
    const dpsDifference = usesNormalizedRanking()
      ? rankingNormalizedDps(right) - rankingNormalizedDps(left)
      : rankingDps(right) - rankingDps(left);
    if (dpsDifference !== 0) {
      return dpsDifference;
    }
    const rankDifference = Number(left?.rank || 0) - Number(right?.rank || 0);
    if (rankDifference !== 0) {
      return rankDifference;
    }
    const serverDifference = Number(left?.S ?? left?.serverId) - Number(right?.S ?? right?.serverId);
    return serverDifference || String(left?.N ?? left?.name ?? "")
      .localeCompare(String(right?.N ?? right?.name ?? ""));
  }

  function renderClassRanking() {
    const customRankCacheKey = customCpRankCacheKey(
      state.dungeonKey,
      state.bossIndex);
    if (state.cpFilterMode === "custom" &&
        !state.customCpRankData.has(customRankCacheKey)) {
      showState("loading");
      void ensureCustomCpRankCache(state.dungeonKey)
        .then(() => {
          if (state.mode === "class") {
            renderClassRanking();
          }
        })
        .catch(error => {
          console.error(error);
          elements["error-message"].textContent =
            error instanceof Error && error.message ? error.message : t("cacheUnavailable");
          showState("error");
        });
      return;
    }
    if (state.cpFilterMode !== "custom" &&
        !state.data?.classRankings?.[state.dungeonKey]) {
      showState("loading");
      void ensureClassRankingCache(state.dungeonKey)
        .then(() => {
          if (state.mode === "class") {
            renderClassRanking();
          }
        })
        .catch(error => {
          console.error(error);
          elements["error-message"].textContent =
            error instanceof Error && error.message ? error.message : t("cacheUnavailable");
          showState("error");
        });
      return;
    }
    const view = findClassView();
    const jobRow = view?.rows?.find(item => item.jobName === state.selectedJob);
    const players = usesNormalizedRanking()
      ? jobRow?.Y ?? jobRow?.normalizedPlayers ?? []
      : jobRow?.players || [];
    const sorted = [...players]
      .filter(player => !usesNormalizedRanking() || rankingNormalizedDps(player) > 0)
      .sort(compareClassRankingPlayers)
      .slice(0, 20)
      .map((player, index) => ({ ...player, rank: index + 1 }));

    elements["class-heading"].hidden = false;
    elements["class-title"].textContent = t(
      usesCombatTimeRanking()
        ? "classCombatTime"
        : usesNormalizedRanking()
          ? "classNdps"
          : "classDps", {
      job: jobName(state.selectedJob),
      count: sorted.length,
    });
    elements["class-badge"].textContent = t("top20", { count: sorted.length });
    elements["class-caption"].textContent = state.cpFilterMode === "custom"
      ? `${filterDescription()} · ${t(
          usesCombatTimeRanking()
            ? "uniqueCombatTimeRankers"
            : usesNormalizedRanking()
              ? "uniqueNormalizedRankers"
              : "uniqueRankers",
          { count: sorted.length })}`
      : filterDescription();
    elements["class-metric-heading"].textContent = usesNormalizedRanking() ? "nDPS" : "DPS";
    elements["empty-message"].textContent = t(usesNormalizedRanking() ? "ndpsEmpty" : "empty");
    elements["summary-view"].hidden = true;
    updateSnapshot(findSummaryView());
    if (sorted.length === 0) {
      elements["class-view"].hidden = true;
      showState("empty");
      return;
    }
    const fragment = document.createDocumentFragment();
    sorted.forEach(player => fragment.append(buildClassRow(player)));
    elements["class-rows"].replaceChildren(fragment);
    showState("class");
  }

  function buildClassRow(player) {
    const tr = document.createElement("tr");
    const detailContext = {
      dungeonKey: String(state.dungeonKey || "").trim(),
      generation: String(state.data?.generatedAt || "").trim(),
    };
    const detail = resolveCombatDetail(player);
    const publishedLookupKey = String(player.Q ?? player.detailLookupKey ?? "")
      .trim()
      .toLowerCase();
    const hasPublishedDetail =
      player.H === true || player.hasDetail === true;
    const canBuildLookupKey =
      /^[0-9a-f]{64}$/.test(publishedLookupKey) ||
      (hasPublishedDetail && Boolean(globalThis.crypto?.subtle));
    let detailLookupPromise = null;
    const getDetailLookupKey = () => {
      detailLookupPromise ||= resolveDetailLookupKey(player);
      return detailLookupPromise;
    };
    tr.className = "class-detail-row";
    tr.tabIndex = 0;
    tr.setAttribute("role", "button");
    tr.setAttribute(
      "aria-label",
      `${formatCharacterName(player.name, player.serverId)} ${t("combatDetails")}`);
    const open = async () => {
      if (isRankingNavigationBlocked()) {
        return;
      }
      if (detail) {
        openLegacyCombatDetail(player, detail);
      } else if (canBuildLookupKey) {
        await openRemoteCombatDetail(
          player,
          await getDetailLookupKey(),
          tr,
          detailContext);
      } else {
        openUnavailableCombatDetail(
          player,
          state.cpFilterMode === "custom"
            ? t("detailUnavailableCustomCp")
            : t("detailUnavailableOld"));
      }
    };
    tr.addEventListener("click", event => {
      if (!isRepeatedPointerActivation(event)) {
        void open();
      }
    });
    tr.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void open();
      }
    });
    if (!detail && canBuildLookupKey) {
      let hoverTimer = 0;
      tr.addEventListener("mouseenter", () => {
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => {
          void getDetailLookupKey()
            .then(lookupKey => loadRankingCombatDetail(lookupKey, detailContext))
            .catch(() => {});
        }, 220);
      });
      tr.addEventListener("mouseleave", () => window.clearTimeout(hoverTimer));
    }
    tr.append(cellWithRank(player.rank));

    const dungeon = currentDungeon();
    const bossIndex = Number(player.B ?? player.bossIndex ?? state.bossIndex);
    const boss = bossIndex > 0 ? dungeon?.bossNames?.[bossIndex - 1] : "";
    const targetName = String(player.T ?? player.targetName ?? "").trim();
    const bossName = localizeGameName(targetName || boss || (state.bossIndex > 0
      ? dungeon?.bossNames?.[state.bossIndex - 1]
      : t("allBosses")));

    const characterCell = document.createElement("td");
    characterCell.className = "character-cell";
    const characterStack = document.createElement("div");
    characterStack.className = "character-stack";
    const main = document.createElement("div");
    main.className = "character-main";
    main.append(createJobIcon(state.selectedJob));
    const name = document.createElement("span");
    name.className = "character-name";
    name.textContent = formatCharacterName(player.name, player.serverId);
    main.append(name);
    if (isTaiwanName(player.name)) {
      const badge = document.createElement("span");
      badge.className = "tw-badge";
      badge.title = t("taiwanServer");
      badge.setAttribute("role", "img");
      badge.setAttribute("aria-label", badge.title);
      main.append(badge);
    }
    if (Number(player.combatPower) > 0) {
      const cp = document.createElement("span");
      cp.className = "cp-badge";
      const cpIcon = document.createElement("img");
      cpIcon.src = "./assets/combat-power.png";
      cpIcon.alt = "";
      const value = document.createElement("span");
      value.textContent = formatCombatPower(player.combatPower);
      cp.title = `${formatInteger(player.combatPower)} CP`;
      cp.append(cpIcon, value);
      main.append(cp);
    }
    appendCharacterProfileLink(main, player);
    characterStack.append(main);

    const party = state.dungeonKey === "training-dummy-60s" ? [] : decodeParty(player);
    if (party.length > 1) {
      const partyLine = document.createElement("div");
      partyLine.className = "party-icons";
      partyLine.setAttribute("role", "group");
      partyLine.setAttribute("aria-label", `${t("partyMembers")} ${party.length}`);
      const label = document.createElement("span");
      label.className = "party-label";
      label.textContent = t("partyMembers");
      const count = document.createElement("span");
      count.className = "party-count";
      count.textContent = formatInteger(party.length);
      label.append(count);
      partyLine.append(label);
      party.forEach(job => partyLine.append(createJobIcon(job)));
      characterStack.append(partyLine);
    }
    const mobileMeta = document.createElement("span");
    mobileMeta.className = "mobile-class-meta";
    mobileMeta.textContent = `${bossName} · ${formatDuration(player.durationSeconds)}`;
    characterStack.append(mobileMeta);
    characterCell.append(characterStack);
    tr.append(characterCell);

    const bossCell = document.createElement("td");
    bossCell.className = "class-boss";
    bossCell.textContent = bossName;
    tr.append(bossCell);

    tr.append(numericCell(formatDuration(player.durationSeconds), "class-duration", t("duration")));
    tr.append(createRankingDpsCell(player));
    const detailCell = document.createElement("td");
    detailCell.className = "detail-column";
    const detailLink = document.createElement("span");
    detailLink.className = "detail-link";
    detailLink.textContent = `${t("viewDetails")} ›`;
    detailCell.append(detailLink);
    tr.append(detailCell);
    return tr;
  }

  function resolveCombatDetail(player) {
    const detailId = String(player.D ?? player.detailId ?? "").trim();
    if (!detailId) {
      return null;
    }
    const customDetail = state.cpFilterMode === "custom"
      ? state.customCpData?.classRankings?.[state.dungeonKey]?.details?.[detailId]
      : null;
    return customDetail ||
      state.data?.classRankings?.[state.dungeonKey]?.details?.[detailId] ||
      null;
  }

  async function resolveDetailLookupKey(player) {
    const value = String(player.Q ?? player.detailLookupKey ?? "").trim().toLowerCase();
    if (/^[0-9a-f]{64}$/.test(value)) {
      return value;
    }
    if (!globalThis.crypto?.subtle) {
      return "";
    }

    const dungeonKey = String(state.dungeonKey || "").trim().toLowerCase();
    const bossIndex = Math.max(
      0,
      Math.trunc(Number(player.B ?? player.bossIndex ?? state.bossIndex) || 0));
    const job = String(state.selectedJob || "").trim().normalize("NFC");
    const name = String(player.name || "").trim().normalize("NFC");
    const serverId = Math.max(0, Math.trunc(Number(player.serverId) || 0));
    const combatPower = Math.max(
      0,
      Math.trunc(Number(player.recordCombatPower ?? player.combatPower) || 0));
    const rawDuration = Number(player.durationSeconds);
    const roundedDuration = Math.round(
      (Number.isFinite(rawDuration) ? Math.max(0, rawDuration) : 0) * 1000) / 1000;
    const duration = roundedDuration.toFixed(3).replace(/\.?0+$/, "");
    const rawDps = Number(player.dps);
    const dps = Math.round(Number.isFinite(rawDps) ? Math.max(0, rawDps) : 0);
    const canonical = [
      dungeonKey,
      bossIndex,
      job,
      name,
      serverId,
      combatPower,
      duration || "0",
      dps,
    ].join("\n");
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical));
    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function openLegacyCombatDetail(player, detail) {
    const dungeon = currentDungeon();
    const bossIndex = Number(player.B ?? player.bossIndex ?? state.bossIndex);
    const bossName = localizeGameName(bossIndex > 0
      ? dungeon?.bossNames?.[bossIndex - 1]
      : dungeon?.bossNames?.[0] || dungeonName(dungeon));
    state.selectedDetail = {
      player,
      actorId: Number(detail.actorId) || 0,
      record: {
        bossName,
        durationSeconds: Math.max(0, Number(player.durationSeconds) || 60),
        players: [detail],
      },
    };
    renderCombatDetail();
    resetCombatDetailScrollPosition();
    elements["combat-detail-modal"].hidden = false;
    document.body.classList.add("detail-open");
    elements["detail-close"].focus({ preventScroll: true });
  }

  function openUnavailableCombatDetail(player, reason) {
    const dungeon = currentDungeon();
    const bossIndex = Number(player.B ?? player.bossIndex ?? state.bossIndex);
    const bossName = localizeGameName(bossIndex > 0
      ? dungeon?.bossNames?.[bossIndex - 1]
      : dungeon?.bossNames?.[0] || dungeonName(dungeon));
    const actorId = 1;
    state.selectedDetail = {
      player,
      actorId,
      unavailableReason: String(reason || t("detailUnavailable")),
      record: {
        bossName,
        durationSeconds: Math.max(0, Number(player.durationSeconds) || 0),
        players: [{
          actorId,
          name: player.name,
          serverId: Number(player.serverId) || 0,
          jobName: state.selectedJob,
          combatPower: Number(player.combatPower) || 0,
          dps: Number(player.dps) || 0,
          skills: [],
          buffs: [],
        }],
      },
    };
    renderCombatDetail();
    resetCombatDetailScrollPosition();
    elements["combat-detail-modal"].hidden = false;
    document.body.classList.add("detail-open");
    elements["detail-close"].focus({ preventScroll: true });
  }

  async function openRemoteCombatDetail(player, lookupKey, row, detailContext) {
    if (!lookupKey || row.classList.contains("detail-loading")) {
      return;
    }
    row.classList.add("detail-loading");
    row.setAttribute("aria-busy", "true");
    const detailLink = row.querySelector(".detail-link");
    const previousLabel = detailLink?.textContent || "";
    if (detailLink) {
      detailLink.textContent = t("detailLoading");
    }
    try {
      const detailDocument = await loadRankingCombatDetail(lookupKey, detailContext);
      const actorId = Number(detailDocument.selectors?.[lookupKey]) || 0;
      state.selectedDetail = {
        player,
        actorId,
        record: detailDocument.record,
      };
      row.removeAttribute("title");
      renderCombatDetail();
      resetCombatDetailScrollPosition();
      elements["combat-detail-modal"].hidden = false;
      document.body.classList.add("detail-open");
      elements["detail-close"].focus({ preventScroll: true });
    } catch (error) {
      console.error(error);
      const reason = state.cpFilterMode === "custom"
        ? t("detailUnavailableCustomCp")
        : t("detailUnavailable");
      row.title = reason;
      openUnavailableCombatDetail(player, reason);
    } finally {
      row.classList.remove("detail-loading");
      row.removeAttribute("aria-busy");
      if (detailLink) {
        detailLink.textContent = previousLabel;
      }
    }
  }

  async function loadRankingCombatDetail(lookupKey, detailContext = {}) {
    const expectedDungeonKey = String(
      detailContext.dungeonKey || state.dungeonKey || "").trim();
    const generation = String(
      detailContext.generation || state.data?.generatedAt || "").trim();
    const memoryKey = `${expectedDungeonKey}\n${lookupKey}`;
    if (state.detailMemory.has(memoryKey)) {
      const cached = state.detailMemory.get(memoryKey);
      state.detailMemory.delete(memoryKey);
      state.detailMemory.set(memoryKey, cached);
      return cached;
    }
    if (state.detailLoads.has(memoryKey)) {
      return state.detailLoads.get(memoryKey);
    }

    const load = loadRankingCombatDetailCore(
      lookupKey,
      expectedDungeonKey,
      generation)
      .then(document => {
        rememberDetail(memoryKey, document);
        return document;
      })
      .finally(() => state.detailLoads.delete(memoryKey));
    state.detailLoads.set(memoryKey, load);
    return load;
  }

  async function loadRankingCombatDetailCore(
    lookupKey,
    expectedDungeonKey,
    generation) {
    const requestPath = `${lookupKey}?g=${encodeURIComponent(generation)}`;
    const request = new Request(
      `${DETAIL_ENDPOINTS[0]}${requestPath}`,
      { mode: "cors", credentials: "omit" });
    let cache = null;
    if ("caches" in window) {
      try {
        cache = await caches.open(DETAIL_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          try {
            return await parseRankingCombatDetail(
              cachedResponse,
              lookupKey,
              expectedDungeonKey);
          } catch {
            await cache.delete(request);
          }
        }
      } catch {
        cache = null;
      }
    }

    const { detailDocument, cacheCopy } = await downloadRankingCombatDetail(
      requestPath,
      lookupKey,
      expectedDungeonKey);
    if (cache) {
      try {
        await cache.put(request, cacheCopy);
      } catch {
      }
    }
    return detailDocument;
  }

  async function downloadRankingCombatDetail(
    requestPath,
    lookupKey,
    expectedDungeonKey) {
    const failures = [];
    const statuses = [];
    const endpoints = await resolveRankingDetailEndpoints();
    for (const endpoint of endpoints) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        if (attempt > 0) {
          await new Promise(resolve => window.setTimeout(resolve, DETAIL_RETRY_DELAY_MS));
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(
          () => controller.abort(),
          DETAIL_REQUEST_TIMEOUT_MS);
        try {
          const response = await fetch(`${endpoint}${requestPath}`, {
            mode: "cors",
            credentials: "omit",
            cache: attempt === 0 ? "default" : "reload",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          if (!response.ok) {
            statuses.push(response.status);
            throw new Error(`${t("detailUnavailable")} (${response.status})`);
          }
          const cacheCopy = response.clone();
          const detailDocument = await parseRankingCombatDetail(
            response,
            lookupKey,
            expectedDungeonKey);
          return { detailDocument, cacheCopy };
        } catch (error) {
          failures.push(error instanceof Error ? error.message : String(error));
        } finally {
          window.clearTimeout(timeout);
        }
      }
    }

    const error = new Error(`${t("detailUnavailable")} (${failures.join(" / ")})`);
    error.status = statuses.length > 0 && statuses.every(status => status === 404)
      ? 404
      : 0;
    throw error;
  }

  async function resolveRankingDetailEndpoints() {
    try {
      const controlEndpoints = await globalThis.NotMeterControlEndpoint?.getEndpoints?.();
      if (Array.isArray(controlEndpoints) && controlEndpoints.length > 0) {
        return [...new Set(controlEndpoints
          .map(endpoint => String(endpoint || "").trim().replace(/\/$/, ""))
          .filter(Boolean)
          .map(endpoint => `${endpoint}/ranking/v1/details/`))];
      }
    } catch {
    }
    return DETAIL_ENDPOINTS;
  }

  async function parseRankingCombatDetail(
    response,
    lookupKey,
    expectedDungeonKey) {
    const payload = await response.arrayBuffer();
    if (payload.byteLength <= 0 || payload.byteLength > 8 * 1024 * 1024) {
      throw new Error(t("detailUnavailable"));
    }
    const etag = String(response.headers.get("etag") || "")
      .replace(/^W\//, "")
      .replaceAll("\"", "")
      .trim()
      .toLowerCase();
    if (/^[0-9a-f]{64}$/.test(etag) && globalThis.crypto?.subtle) {
      const hash = await crypto.subtle.digest("SHA-256", payload);
      const actual = Array.from(new Uint8Array(hash))
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");
      if (actual !== etag) {
        throw new Error(t("detailUnavailable"));
      }
    }

    const document = JSON.parse(new TextDecoder().decode(payload));
    const players = document.record?.players;
    const actorId = Number(document.selectors?.[lookupKey]) || 0;
    if (document.schema !== DETAIL_SCHEMA ||
        Number(document.version) !== 1 ||
        document.dungeonKey !== expectedDungeonKey ||
        !Array.isArray(players) ||
        players.length < 1 ||
        players.length > 10 ||
        actorId <= 0 ||
        !players.some(player => Number(player.actorId) === actorId) ||
        players.some(player =>
          !Array.isArray(player.skills) ||
          player.skills.length > 192 ||
          !Array.isArray(player.buffs) ||
          player.buffs.length > 80)) {
      throw new Error(t("detailUnavailable"));
    }
    return document;
  }

  function rememberDetail(lookupKey, document) {
    state.detailMemory.delete(lookupKey);
    state.detailMemory.set(lookupKey, document);
    while (state.detailMemory.size > DETAIL_MEMORY_LIMIT) {
      state.detailMemory.delete(state.detailMemory.keys().next().value);
    }
  }

  async function pruneDetailCache(generatedAt) {
    if (!("caches" in window)) {
      return;
    }
    try {
      const cache = await caches.open(DETAIL_CACHE_NAME);
      const expected = `g=${encodeURIComponent(String(generatedAt || ""))}`;
      const requests = await cache.keys();
      await Promise.all(requests
        .filter(request => !request.url.includes(expected))
        .map(request => cache.delete(request)));
    } catch {
    }
  }

  function resetCombatDetailScrollPosition() {
    const modal = elements["combat-detail-modal"];
    const scrollTargets = [
      elements["detail-skill-rows"],
      elements["detail-buffs-section"],
      modal?.querySelector(".detail-content"),
      modal?.querySelector(".detail-summary"),
    ];
    for (const target of scrollTargets) {
      if (target) {
        target.scrollTop = 0;
      }
    }
  }

  function closeCombatDetail() {
    if (!state.selectedDetail && elements["combat-detail-modal"]?.hidden) {
      return;
    }
    state.selectedDetail = null;
    resetCombatDetailScrollPosition();
    if (elements["combat-detail-modal"]) {
      elements["combat-detail-modal"].hidden = true;
    }
    document.body.classList.remove("detail-open");
  }

  function renderCombatDetail() {
    if (!state.selectedDetail) {
      return;
    }
    const { player, record } = state.selectedDetail;
    const unavailableReason = String(state.selectedDetail.unavailableReason || "");
    const players = Array.isArray(record?.players) ? record.players : [];
    const detail = players.find(candidate =>
      Number(candidate.actorId) === Number(state.selectedDetail.actorId)) || players[0];
    if (!detail) {
      closeCombatDetail();
      return;
    }
    const detailJob = detail.jobName || state.selectedJob;
    const durationSeconds = Math.max(
      0,
      Number(record.durationSeconds) || Number(player.durationSeconds) || 60);
    const dungeon = currentDungeon();
    const bossIndex = Number(player.B ?? player.bossIndex ?? state.bossIndex);
    const bossName = localizeGameName(String(record.bossName || "") || (bossIndex > 0
      ? dungeon?.bossNames?.[bossIndex - 1]
      : dungeon?.bossNames?.[0] || dungeonName(dungeon)));

    elements["detail-job-icon"].replaceChildren(createJobIcon(detailJob));
    elements["detail-title"].textContent = bossName || t("combatDetails");
    elements["detail-character"].textContent = formatCharacterName(
      detail.name || player.name,
      Number(detail.serverId || player.serverId));
    elements["detail-duration"].textContent = formatDuration(durationSeconds);
    renderDetailPartyTabs(players);

    const combatPower = Number(detail.combatPower || player.combatPower) || 0;
    elements["detail-cp-row"].hidden = combatPower <= 0;
    elements["detail-cp"].textContent = formatInteger(combatPower);
    elements["detail-total-damage"].textContent = unavailableReason
      ? "—"
      : formatInteger(detail.totalDamage);
    elements["detail-dps"].textContent = formatCompact(
      Number(detail.dps || player.dps) || 0);
    const normalizedDps = Math.max(0, Number(detail.normalizedDps) || 0);
    const showNormalizedDps = !unavailableReason && normalizedDps > 0;
    elements["detail-ndps-row"].hidden = !showNormalizedDps;
    elements["detail-ndps"].textContent = showNormalizedDps
      ? formatCompact(normalizedDps)
      : "—";
    elements["detail-share"].textContent = unavailableReason
      ? "—"
      : formatPercent(detail.sharePercent);
    elements["detail-summary-duration"].textContent = formatDuration(durationSeconds);
    elements["detail-death-count"].textContent = unavailableReason
      ? "—"
      : formatInteger(Math.max(0, Number(detail.deathCount) || 0));
    elements["detail-hits"].textContent = unavailableReason ? "—" : formatInteger(detail.hitCount);
    elements["detail-parry-rate"].textContent = unavailableReason ? "—" : formatPercent(detail.parryRate);
    elements["detail-critical-rate"].textContent = unavailableReason ? "—" : formatPercent(detail.criticalRate);
    elements["detail-front-rate"].textContent = unavailableReason ? "—" : formatPositionPercent(detail.frontAttackRate);
    elements["detail-back-rate"].textContent = unavailableReason ? "—" : formatPositionPercent(detail.backAttackRate);
    elements["detail-perfect-rate"].textContent = unavailableReason ? "—" : formatPercent(detail.perfectRate);
    elements["detail-double-rate"].textContent = unavailableReason ? "—" : formatPercent(detail.doubleDamageRate);
    elements["detail-evade-rate"].textContent = unavailableReason ? "—" : formatPercent(detail.evadeRate);
    const blockDataReliable = Boolean(detail.blockDataReliable);
    elements["detail-block-row"].title = t("blockDescription");
    elements["detail-block-row"].setAttribute("aria-label", t("blockDescription"));
    elements["detail-block-rate"].textContent = unavailableReason || !blockDataReliable
      ? "—"
      : `${formatInteger(Math.max(0, Number(detail.blockHits) || 0))} / ${formatPercent(detail.blockRate)}`;
    applyDetailMetricVisibility();
    elements["detail-block-row"].hidden =
      !blockDataReliable || !isDetailMetricVisible("avoidance");

    const skills = Array.isArray(detail.skills)
      ? [...detail.skills]
          .filter(skill =>
            globalThis.NotMeterCombatDetailBuffs.shouldDisplaySkill(skill) &&
            (Number(skill.totalDamage) > 0 ||
             Number(skill.healingAmount) > 0 ||
             Number(skill.drainHealingAmount) > 0 ||
             Number(skill.useCount) > 0))
          .sort((left, right) =>
            Number(right.totalDamage) - Number(left.totalDamage) ||
            Number(right.healingAmount) - Number(left.healingAmount) ||
            Number(right.useCount) - Number(left.useCount))
      : [];
    const skillRows = document.createDocumentFragment();
    if (unavailableReason) {
      const unavailable = document.createElement("article");
      unavailable.className = "detail-unavailable";
      const title = document.createElement("strong");
      title.textContent = t("detailUnavailableTitle");
      const description = document.createElement("span");
      description.textContent = unavailableReason;
      unavailable.append(title, description);
      skillRows.append(unavailable);
    } else {
      for (const skill of skills) {
        skillRows.append(buildDetailSkillRow(skill));
      }
    }
    elements["detail-skill-rows"].replaceChildren(skillRows);

    if (unavailableReason) {
      elements["detail-buffs"].replaceChildren();
      elements["detail-buff-count"].textContent = "";
      elements["detail-buffs-section"].hidden = true;
      return;
    }

    const buffs = Array.isArray(detail.buffs)
      ? [...detail.buffs]
          .filter(buff => globalThis.NotMeterCombatDetailBuffs.shouldDisplay(buff))
          .sort((left, right) =>
            Number(right.uptimeSeconds) - Number(left.uptimeSeconds) ||
            Number(right.count) - Number(left.count) ||
            Number(left.code) - Number(right.code))
      : [];
    const buffItems = document.createDocumentFragment();
    for (const buff of buffs) {
      buffItems.append(buildDetailBuff(buff, durationSeconds));
    }
    if (buffs.length === 0) {
      const empty = document.createElement("span");
      empty.className = "detail-buff-empty";
      empty.textContent = t("recordedBuffsNone");
      buffItems.append(empty);
    }
    elements["detail-buffs"].replaceChildren(buffItems);
    elements["detail-buff-count"].textContent = ` (${formatInteger(buffs.length)})`;
    elements["detail-buffs-section"].hidden = false;
  }

  function renderDetailPartyTabs(players) {
    const host = elements["detail-party-tabs"];
    if (!host) {
      return;
    }
    if (players.length <= 1) {
      host.hidden = true;
      host.replaceChildren();
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const player of players) {
      const actorId = Number(player.actorId) || 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "detail-party-tab";
      button.classList.toggle(
        "active",
        actorId === Number(state.selectedDetail?.actorId));
      button.append(createJobIcon(player.jobName || ""));
      const identity = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = formatCharacterName(player.name, Number(player.serverId));
      const dps = document.createElement("small");
      dps.textContent = `DPS ${formatCompact(Number(player.dps) || 0)}`;
      identity.append(name, dps);
      button.append(identity);
      button.title = `${t("partyMembers")} · ${name.textContent}`;
      button.addEventListener("click", () => {
        state.selectedDetail.actorId = actorId;
        renderCombatDetail();
        resetCombatDetailScrollPosition();
      });
      fragment.append(button);
    }
    host.replaceChildren(fragment);
    host.hidden = false;
  }

  function buildDetailSkillRow(skill) {
    const row = document.createElement("article");
    row.className = "detail-skill-row";
    const recordedSkillName = globalThis.NotMeterCombatDetailBuffs?.skillDisplayName?.(skill, state.locale) ||
      String(skill.skillName || "—");
    const skillDisplayName = localizeGameName(
      recordedSkillName,
      "skill",
      skill.rawSkillCode,
      skill.skillCode);
    const totalDamage = Math.max(0, Number(skill.totalDamage) || 0);
    const healingAmount = Math.max(0, Number(skill.healingAmount) || 0);
    const useCount = Math.max(0, Number(skill.useCount) || 0);
    row.classList.toggle("healing", totalDamage <= 0 && healingAmount > 0);
    row.classList.toggle("support", totalDamage <= 0 && healingAmount <= 0);
    row.title = totalDamage > 0
      ? `${skillDisplayName}\n${formatInteger(skill.minHit)} ~ ${formatInteger(skill.maxHit)}`
      : skillDisplayName;

    const bar = document.createElement("span");
    bar.className = "detail-skill-bar";
    bar.style.width = `${Math.max(0, Math.min(100, Number(skill.damagePercentage) || 0))}%`;

    const icon = document.createElement("span");
    icon.className = "detail-skill-icon";
    applyDetailSkillIcon(icon, skill, 28);

    const title = document.createElement("span");
    title.className = "detail-skill-title";
    const name = document.createElement("strong");
    name.className = "detail-skill-name";
    name.textContent = skillDisplayName;
    title.append(name);
    const levelBadge = buildDetailSkillLevelBadge(skill.skillLevel);
    if (levelBadge) {
      title.append(levelBadge);
    }

    const damage = document.createElement("strong");
    damage.className = "detail-skill-damage";
    if (totalDamage > 0) {
      damage.append(document.createTextNode(formatInteger(totalDamage)));
      const share = document.createElement("span");
      share.textContent = ` (${formatPercent(skill.damagePercentage, 1)})`;
      damage.append(share);
    } else if (healingAmount > 0) {
      damage.textContent = `${t("healing")} ${formatCompact(healingAmount)}`;
    } else {
      damage.textContent = `${t("useCount")} ${formatUseCount(useCount)}`;
    }

    const chips = document.createElement("div");
    chips.className = "detail-skill-chips";
    const interval = Number(skill.averageUseIntervalMilliseconds);
    if (Number.isFinite(interval) && interval > 0) {
      chips.append(buildDetailChip(t("averageInterval"), `${interval.toFixed(2)}ms`, "accent"));
    }
    if (useCount > 0) {
      chips.append(buildDetailChip(t("useCount"), formatUseCount(useCount), "accent"));
    }
    if (isDetailMetricVisible("specialization")) {
      chips.append(buildSpecializationChip(skill.specializationFlags));
    }
    if (isDetailMetricVisible("hits") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("hits"), formatInteger(skill.hitCount)));
    }
    if (isDetailMetricVisible("parry") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("parry"), formatPercent(skill.parryRate), "accent"));
    }
    if (isDetailMetricVisible("avoidance") && Number(skill.evadeCount) > 0) {
      chips.append(buildDetailChip(
        t("avoidance"),
        `${formatInteger(skill.evadeCount)} / ${formatPercent(skill.evadeRate)}`));
    }
    if (isDetailMetricVisible("multiHit") && Number(skill.hitCount) > 0) {
      const hits = Math.max(0, Number(skill.hitCount) || 0);
      const ratio = hits > 0 ? (Number(skill.multiHitCount) || 0) / hits * 100 : 0;
      chips.append(buildDetailChip(t("multiHit"), formatPercent(ratio), "double"));
    }
    if (isDetailMetricVisible("critical") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("critical"), formatPercent(skill.criticalRate), "critical"));
    }
    if (isDetailMetricVisible("front") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("front"), formatPositionPercent(skill.frontAttackRate), "position"));
    }
    if (isDetailMetricVisible("back") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("back"), formatPositionPercent(skill.backAttackRate), "position"));
    }
    if (isDetailMetricVisible("perfect") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("perfect"), formatPercent(skill.perfectRate), "perfect"));
    }
    if (isDetailMetricVisible("double") && Number(skill.hitCount) > 0) {
      chips.append(buildDetailChip(t("doubleDamage"), formatPercent(skill.doubleDamageRate), "double"));
    }
    if (isDetailMetricVisible("periodic") &&
        (Number(skill.periodicDamage) > 0 || Number(skill.periodicHitCount) > 0)) {
      const periodic = Number(skill.periodicHitCount) > 0
        ? `${formatCompact(skill.periodicDamage)} / ${formatInteger(skill.periodicHitCount)}${state.locale === "ko" ? "회" : state.locale === "zh-TW" ? "次" : "x"}`
        : formatCompact(skill.periodicDamage);
      chips.append(buildDetailChip(t("periodicDamage"), periodic, "perfect"));
    }
    if (isDetailMetricVisible("healing") && Number(skill.healingAmount) > 0) {
      chips.append(buildDetailChip(t("healing"), formatCompact(skill.healingAmount), "healing"));
    }
    if (Number(skill.healingHitCount) > 0) {
      chips.append(buildDetailChip(t("healingCount"), formatInteger(skill.healingHitCount), "healing"));
    }
    if (isDetailMetricVisible("drainHealing") && Number(skill.drainHealingAmount) > 0) {
      chips.append(buildDetailChip(t("drainHealing"), formatCompact(skill.drainHealingAmount), "healing"));
    }
    if (isDetailMetricVisible("averageDamage") && totalDamage > 0) {
      chips.append(buildDetailChip(t("averageDamage"), formatCompact(skill.averageDamage)));
    }
    if (isDetailMetricVisible("maximumDamage") && totalDamage > 0 && Number(skill.maxHit) > 0) {
      chips.append(buildDetailChip(t("maximumDamage"), formatCompact(skill.maxHit), "maximum"));
    }

    row.append(bar, icon, title, damage, chips);
    return row;
  }

  function buildDetailSkillLevelBadge(value) {
    const level = Math.trunc(Number(value) || 0);
    if (level < 1 || level > 99) {
      return null;
    }
    const badge = document.createElement("span");
    badge.className = "detail-level-badge";
    badge.setAttribute("aria-label", `Level ${level}`);
    const prefix = document.createElement("span");
    prefix.className = "detail-level-prefix";
    prefix.textContent = "LV";
    const number = document.createElement("span");
    number.className = "detail-level-number";
    number.textContent = String(level);
    badge.append(prefix, number);
    return badge;
  }

  function formatUseCount(value) {
    const count = formatInteger(Math.max(0, Number(value) || 0));
    return state.locale === "ko" ? `${count}회` : state.locale === "zh-TW" ? `${count}次` : `${count}x`;
  }

  function buildDetailChip(label, value, modifier = "") {
    const chip = document.createElement("span");
    chip.className = `detail-chip ${modifier}`.trim();
    chip.append(document.createTextNode(`${label} `));
    const strong = document.createElement("b");
    strong.textContent = value;
    chip.append(strong);
    chip.title = `${label} ${value}`;
    return chip;
  }

  function buildSpecializationChip(flags) {
    const chip = document.createElement("span");
    chip.className = "detail-chip";
    chip.append(document.createTextNode(t("specialization")));
    const dots = document.createElement("span");
    dots.className = "detail-spec-dots";
    for (let index = 0; index < 5; index++) {
      const dot = document.createElement("i");
      if (Array.isArray(flags) && flags[index]) {
        dot.className = "active";
      }
      dots.append(dot);
    }
    chip.append(dots);
    return chip;
  }

  function buildDetailBuff(buff, durationSeconds) {
    const item = document.createElement("article");
    item.className = "detail-buff";
    const seconds = Math.max(0, Number(buff.uptimeSeconds) || 0);
    const ratio = durationSeconds > 0 ? Math.min(100, seconds / durationSeconds * 100) : 0;
    const enhanced = globalThis.NotMeterCombatDetailBuffs.isEnhanced(buff);

    const iconSlot = document.createElement("span");
    iconSlot.className = "detail-buff-icon-slot";
    const icon = document.createElement("span");
    icon.className = "detail-buff-icon";
    applyBuffIcon(icon, buff, 30);
    iconSlot.append(icon);
    if (enhanced) {
      const upBadge = document.createElement("span");
      upBadge.className = "detail-buff-up";
      upBadge.textContent = "UP";
      iconSlot.append(upBadge);
    }

    const text = document.createElement("div");
    text.className = "detail-buff-text";
    const title = document.createElement("div");
    title.className = "detail-buff-title";
    const name = document.createElement("strong");
    name.textContent = buffDisplayName(buff);
    title.append(name);
    const levelBadge = buildDetailSkillLevelBadge(buff.skillLevel);
    if (levelBadge) {
      title.append(levelBadge);
    }
    const uptime = document.createElement("span");
    const appliedCount = Math.max(1, Number(buff.count) || 0);
    uptime.textContent =
      `${formatPercent(ratio)} · ${formatDuration(seconds)} · ${state.locale === "zh-TW" ? `${appliedCount}次` : `x${appliedCount}`}`;
    text.append(title, uptime);

    const gauge = document.createElement("span");
    gauge.className = "detail-buff-gauge";
    const fill = document.createElement("i");
    fill.style.width = `${ratio}%`;
    gauge.append(fill);

    const enhancedDescription = enhanced
      ? `\n${t("enhancedBuff")}`
      : "";
    item.title = `${name.textContent}\n${formatDuration(seconds)} / ${formatDuration(durationSeconds)} (${formatPercent(ratio)})${enhancedDescription}`;
    item.append(iconSlot, text, gauge);
    return item;
  }

  function buffDisplayName(buff) {
    const recordedName = globalThis.NotMeterCombatDetailBuffs.displayName(
      buff,
      state.locale,
      state.iconAtlases.buff);
    return localizeGameName(recordedName, "buff", buff.rawCode, buff.code);
  }

  function loadVisibleMetrics() {
    try {
      const saved = JSON.parse(localStorage.getItem("notmeter-detail-metrics") || "null");
      if (Array.isArray(saved)) {
        const allowed = new Set(DETAIL_METRICS.map(([key]) => key));
        const metrics = new Set(saved.filter(key => allowed.has(key)));
        if (!localStorage.getItem(DETAIL_METRICS_MAXIMUM_DAMAGE_MIGRATION_KEY)) {
          metrics.add("maximumDamage");
          localStorage.setItem("notmeter-detail-metrics", JSON.stringify([...metrics]));
          localStorage.setItem(DETAIL_METRICS_MAXIMUM_DAMAGE_MIGRATION_KEY, "1");
        }
        return metrics;
      }
      localStorage.setItem(DETAIL_METRICS_MAXIMUM_DAMAGE_MIGRATION_KEY, "1");
    } catch {
    }
    return new Set(DETAIL_METRICS.map(([key]) => key));
  }

  function renderDetailSettings() {
    if (!elements["detail-settings-options"]) {
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const [key, labelKey] of DETAIL_METRICS) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = t(labelKey);
      button.classList.toggle("active", isDetailMetricVisible(key));
      button.addEventListener("click", () => {
        if (state.visibleMetrics.has(key)) {
          state.visibleMetrics.delete(key);
        } else {
          state.visibleMetrics.add(key);
        }
        localStorage.setItem(
          "notmeter-detail-metrics",
          JSON.stringify([...state.visibleMetrics]));
        renderDetailSettings();
        if (state.selectedDetail) {
          renderCombatDetail();
        }
      });
      fragment.append(button);
    }
    elements["detail-settings-options"].replaceChildren(fragment);
    elements["detail-visible-count"].textContent =
      `${state.visibleMetrics.size}/${DETAIL_METRICS.length}`;
    elements["detail-settings-toggle"].textContent =
      t(elements["detail-settings-options"].hidden ? "openSettings" : "closeSettings");
  }

  function isDetailMetricVisible(key) {
    return state.visibleMetrics.has(key);
  }

  function applyDetailMetricVisibility() {
    document.querySelectorAll("#combat-detail-modal [data-detail-metric]").forEach(element => {
      element.hidden = !isDetailMetricVisible(element.dataset.detailMetric);
    });
  }

  async function loadIconAtlases() {
    try {
      const [skill, buff] = await Promise.all([
        fetch("./assets/icons/skill-icons.json?v=20260726-5", { cache: "force-cache" })
          .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))),
        fetch("./assets/icons/buff-icons.json?v=20260726-5", { cache: "force-cache" })
          .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))),
      ]);
      state.iconAtlases.skill = skill;
      state.iconAtlases.buff = buff;
      if (state.selectedDetail) {
        renderCombatDetail();
      }
    } catch (error) {
      console.warn("NotMeter icon atlas unavailable", error);
    }
  }

  function applySkillIcon(element, rawCode, fallbackCode, size) {
    const key = findSkillIconKey(rawCode, fallbackCode);
    if (key) {
      applyAtlasIcon(element, "skill", key, size);
    }
  }

  function applyDetailSkillIcon(element, skill, size) {
    const preferred = globalThis.NotMeterCombatDetailBuffs.skillIconSource(skill);
    const preferredManifest = preferred ? state.iconAtlases[preferred.type] : null;
    if (preferred && Object.hasOwn(preferredManifest?.icons || {}, preferred.key)) {
      applyAtlasIcon(element, preferred.type, preferred.key, size);
      return;
    }

    const skillKey = findSkillIconKey(skill?.rawSkillCode, skill?.skillCode);
    if (skillKey) {
      applyAtlasIcon(element, "skill", skillKey, size);
      return;
    }

    const buffKey = findBuffIconKey(skill?.rawSkillCode, skill?.skillCode);
    if (buffKey) {
      applyAtlasIcon(element, "buff", buffKey, size);
    }
  }

  function applyBuffIcon(element, buff, size) {
    const code = buff?.code;
    const rawCode = buff?.rawCode;
    const preferred = globalThis.NotMeterCombatDetailBuffs.iconSource(buff);
    const preferredManifest = preferred ? state.iconAtlases[preferred.type] : null;
    if (preferred && Object.hasOwn(preferredManifest?.icons || {}, preferred.key)) {
      applyAtlasIcon(element, preferred.type, preferred.key, size);
      return;
    }

    const buffKey = findBuffIconKey(rawCode, code);
    if (buffKey) {
      applyAtlasIcon(element, "buff", buffKey, size);
      return;
    }
    applySkillIcon(element, rawCode, code, size);
  }

  function findBuffIconKey(rawCode, fallbackCode) {
    const manifest = state.iconAtlases.buff;
    if (!manifest) {
      return "";
    }

    for (const candidate of [rawCode, fallbackCode]) {
      const iconKey = manifest.codes?.[String(Math.abs(Number(candidate) || 0))];
      if (iconKey && Object.hasOwn(manifest.icons, iconKey)) {
        return iconKey;
      }
    }
    return "";
  }

  function applyAtlasIcon(element, type, key, size) {
    const manifest = state.iconAtlases[type];
    const index = manifest?.icons?.[key];
    if (!Number.isInteger(index)) {
      return;
    }
    const column = index % Number(manifest.columns);
    const row = Math.floor(index / Number(manifest.columns));
    element.style.backgroundImage = `url("./assets/icons/${type}-atlas.png?v=20260726-5")`;
    element.style.backgroundSize =
      `${Number(manifest.columns) * size}px ${Number(manifest.rows) * size}px`;
    element.style.backgroundPosition = `${-column * size}px ${-row * size}px`;
  }

  function findSkillIconKey(rawCode, fallbackCode) {
    const manifest = state.iconAtlases.skill;
    if (!manifest) {
      return "";
    }

    for (const candidate of [rawCode, fallbackCode]) {
      const godstone = godstoneIconKey(candidate);
      if (godstone && Object.hasOwn(manifest.icons, godstone)) {
        return godstone;
      }
    }

    // rawCode에는 특성 단계가 붙으므로 클라이언트 기준 코드로 접어서 찾는다
    for (const candidate of [rawCode, fallbackCode]) {
      let normalized = normalizeSkillIconCode(candidate);
      if (normalized === 11250000) {
        normalized = 11400000;
      } else if (normalized === 11400000) {
        normalized = 11250000;
      }
      const key = String(normalized || "");
      if (key && Object.hasOwn(manifest.icons, key)) {
        return key;
      }
    }
    return "";
  }

  function normalizeSkillIconCode(value) {
    let code = Math.abs(Number(value) || 0);
    if (code >= 100011 && code <= 100018) return 16100000;
    if ((code >= 100021 && code <= 100028) || code === 16990002) return 16110000;
    if ((code >= 100031 && code <= 100038) || code === 16990003) return 16120000;
    if (code >= 100041 && code <= 100048) return 16130000;
    if (code === 100051 || code === 100055) return 16250000;
    if ((code >= 16001101 && code <= 16001104) || (code >= 16001301 && code <= 16001304)) return 16100000;
    if ((code >= 16001105 && code <= 16001108) || (code >= 16001305 && code <= 16001308)) return 16110000;
    if ((code >= 16001109 && code <= 16001112) || (code >= 16001309 && code <= 16001312)) return 16120000;
    if ((code >= 16001113 && code <= 16001116) || (code >= 16001313 && code <= 16001316)) return 16130000;
    if (code === 16001117 || code === 16001317) return 16250000;
    if (POTION_CODES.has(code)) return code;
    if (code >= 10000000 && code % 10 === 0 && POTION_CODES.has(code / 10)) return code / 10;
    if (code >= 110000000 && code <= 190999999) {
      return Math.floor(code / 100000) * 10000;
    }
    if (code >= 100000000) {
      code = Math.floor(code / 10);
    }
    if (POTION_CODES.has(code)) return code;
    return code >= 11000000 && code <= 19999999
      ? Math.floor(code / 10000) * 10000
      : 0;
  }

  function godstoneIconKey(value) {
    let code = Math.abs(Number(value) || 0);
    if (code >= 3000000 && code <= 3099999) {
      code = code * 10 + 1;
    }
    if (code < 30000000 || code > 30999999) {
      return "";
    }
    const digits = String(Math.trunc(code)).padStart(8, "0");
    const suffix = Number(digits.slice(5, 7)) - 6;
    return suffix >= 1 && suffix <= 18
      ? `godstone-${String(suffix).padStart(3, "0")}`
      : "";
  }

  function findSummaryView() {
    if (state.cpFilterMode === "custom") {
      if (state.customCpPresetTierIndex > 0) {
        const presetViews = (state.customCpData?.views || []).filter(view =>
          view.dungeonKey === state.dungeonKey &&
          Number(view.bossIndex) === state.bossIndex &&
          Number(view.cpTierIndex) === state.customCpPresetTierIndex);
        const presetView = state.period === "Weekly"
          ? presetViews.find(view => parseWeeklyRange(view.periodLabel))
          : presetViews.find(view =>
              normalizePeriod(view.period) === state.period &&
              (state.period !== "All" || !parseWeeklyRange(view.periodLabel)));
        if (presetView) {
          return presetView;
        }
      }
      return buildCustomExactSummaryView();
    }
    const views = (state.data?.views || []).filter(view =>
      view.dungeonKey === state.dungeonKey &&
      Number(view.bossIndex) === state.bossIndex &&
      Number(view.cpTierIndex) === state.cpTierIndex);
    return selectPeriodViews(views)[0];
  }

  function selectPeriodViews(views) {
    if (state.period === "Weekly") {
      return views.filter(view =>
        normalizePeriod(view.period) === "All" &&
        parseWeeklyRange(view.periodLabel));
    }
    return views.filter(view =>
      normalizePeriod(view.period) === state.period &&
      (state.period !== "All" || !parseWeeklyRange(view.periodLabel)) &&
      view.periodLabel !== INTERNAL_REPLAY_PERIOD_LABEL);
  }

  function findClassView() {
    if (state.cpFilterMode === "custom") {
      return buildCustomExactClassView();
    }
    const classRanking = state.data?.classRankings?.[state.dungeonKey];
    const views = classRanking?.views?.filter(view =>
      Number(view.bossIndex) === state.bossIndex &&
      Number(view.cpTierIndex) === state.cpTierIndex) || [];
    if (state.period === "Weekly") {
      return [...views].reverse().find(view => normalizePeriod(view.period) === "All");
    }
    return views.find(view => normalizePeriod(view.period) === state.period);
  }

  function buildCustomExactSummaryView() {
    const buckets = filterCustomCpSummaryBuckets(state.period);
    const previousBuckets = state.period === "Weekly"
      ? filterCustomCpSummaryBuckets("PreviousWeekly")
      : [];
    const previousByJob = aggregateCustomCpSummary(previousBuckets);
    const currentByJob = aggregateCustomCpSummary(buckets);
    const rows = [...currentByJob.entries()]
      .map(([jobName, current]) => {
        const previous = previousByJob.get(jobName);
        return {
          jobName,
          sampleCount: current.sampleCount,
          minDps: current.minDps,
          p25Dps: current.p25Dps,
          medianDps: current.medianDps,
          p75Dps: current.p75Dps,
          p90Dps: current.p90Dps,
          maxDps: current.maxDps,
          dpsPercentiles: state.period === "Weekly" && previous
            ? [previous.p75Dps, current.p75Dps, previous.sampleCount]
            : null,
          previousWeek: state.period === "Weekly"
            ? previousWeekSummary(previous)
            : null,
          normalizedDps: {
            ...current.normalizedDps,
            dpsPercentiles: state.period === "Weekly" && previous?.normalizedDps?.sampleCount > 0
              ? [
                  previous.normalizedDps.p75Dps,
                  current.normalizedDps.p75Dps,
                  previous.normalizedDps.sampleCount,
                ]
              : null,
            previousWeek: state.period === "Weekly"
              ? previousWeekSummary(previous?.normalizedDps)
              : null,
          },
        };
      });
    const playerSampleCount = [...currentByJob.values()]
      .reduce((sum, row) => sum + (usesNormalizedRanking()
        ? row.normalizedDps.sampleCount
        : row.sampleCount), 0);
    return {
      dungeonKey: state.dungeonKey,
      bossIndex: state.bossIndex,
      cpTierIndex: -1,
      cpTierLabel: customCpRangeLabel(),
      period: state.period === "Weekly" ? "All" : state.period,
      periodLabel: state.period === "Weekly"
        ? customCpWeeklyPeriodLabel()
        : state.period,
      generatedAt: state.customCpData?.generatedAt,
      recordCount: 0,
      playerSampleCount,
      rows,
    };
  }

  function buildCustomExactClassView() {
    const bestByCharacter = new Map();
    for (const bucket of filterCustomCpRankBuckets(state.period)) {
      const jobName = String(bucket.J || "");
      for (const player of Array.isArray(bucket.L) ? bucket.L : []) {
        const name = String(player.N || "");
        const serverId = Number(player.S) || 0;
        if (!name || serverId <= 0) {
          continue;
        }
        if (usesNormalizedRanking() && rankingNormalizedDps(player) <= 0) {
          continue;
        }
        const participant = String(player.G || `${serverId}:${name}`);
        const key = `${jobName}\u0000${participant}`;
        const current = bestByCharacter.get(key);
        if (!current || compareClassRankingPlayers(player, current.player) < 0) {
          bestByCharacter.set(key, { jobName, player, bossIndex: Number(bucket.B) || 0 });
        }
      }
    }
    const rows = JOB_ORDER.map(jobName => {
      const players = [...bestByCharacter.values()]
        .filter(item => item.jobName === jobName)
        .sort((left, right) => compareClassRankingPlayers(left.player, right.player))
        .slice(0, 20)
        .map((item, index) => ({
          rank: index + 1,
          name: String(item.player.N || ""),
          serverId: Number(item.player.S) || 0,
          combatPower: Number(item.player.C) || 0,
          recordCombatPower: Number(item.player.O) || Number(item.player.C) || 0,
          durationSeconds: Number(item.player.U) || 0,
          partyJobNames: null,
          dps: Number(item.player.X) || 0,
          normalizedDps: Number(item.player.Y) || 0,
          raidDpsVerified: item.player.A === true || Number(item.player.A) === 1,
          P: String(item.player.P || ""),
          B: item.bossIndex,
          D: state.dungeonKey === "training-dummy-60s"
            ? String(item.player.R || "")
            : null,
          Q: String(item.player.Q || "") || null,
          H: item.player.H === true ? true : null,
          T: item.player.T || null,
        }));
      return { jobName, players };
    }).filter(row => row.players.length > 0);
    return {
      bossIndex: state.bossIndex,
      cpTierIndex: -1,
      period: state.period === "Weekly" ? "All" : state.period,
      rows,
    };
  }

  function filterCustomCpSummaryBuckets(period) {
    const buckets = customCpBucketsInRange(
      customCpSummaryIndex(state.dungeonKey));
    const periodMask = customCpPeriodMask(period);
    return buckets.filter(bucket =>
      (state.bossIndex === 0 || Number(bucket.B) === state.bossIndex) &&
      (Number(bucket.M) & periodMask) !== 0);
  }

  function filterCustomCpRankBuckets(period) {
    const buckets = customCpBucketsInRange(
      customCpRankIndex(state.dungeonKey));
    const periodMask = customCpPeriodMask(period);
    return buckets.filter(bucket =>
      (state.bossIndex === 0 || Number(bucket.B) === state.bossIndex) &&
      Number(bucket.M) === periodMask);
  }

  function customCpSummaryIndex(dungeonKey) {
    if (state.customCpSummaryIndexes.has(dungeonKey)) {
      return state.customCpSummaryIndexes.get(dungeonKey);
    }
    const buckets = state.customCpData?.summaryBucketsByDungeon?.[dungeonKey];
    const index = indexCustomCpBuckets(buckets);
    state.customCpSummaryIndexes.set(dungeonKey, index);
    return index;
  }

  function customCpRankIndex(dungeonKey) {
    const cacheKey = customCpRankCacheKey(dungeonKey, state.bossIndex);
    if (state.customCpRankIndexes.has(cacheKey)) {
      return state.customCpRankIndexes.get(cacheKey);
    }
    const buckets = state.customCpRankData.get(cacheKey)?.rankBuckets;
    const index = indexCustomCpBuckets(buckets);
    state.customCpRankIndexes.set(cacheKey, index);
    return index;
  }

  function indexCustomCpBuckets(buckets) {
    const index = new Map();
    if (!Array.isArray(buckets)) {
      return index;
    }
    for (const bucket of buckets) {
      const combatPowerK = Number(bucket.K);
      if (!Number.isInteger(combatPowerK)) {
        continue;
      }
      const rows = index.get(combatPowerK);
      if (rows) {
        rows.push(bucket);
      } else {
        index.set(combatPowerK, [bucket]);
      }
    }
    return index;
  }

  function customCpBucketsInRange(index) {
    const buckets = [];
    for (let combatPowerK = state.customCpMinK;
         combatPowerK <= state.customCpMaxK;
         combatPowerK++) {
      const rows = index.get(combatPowerK);
      if (rows) {
        buckets.push(...rows);
      }
    }
    return buckets;
  }

  function customCpPeriodMask(period) {
    if (period === "Today") return 1;
    if (period === "Recent14Days") return 2;
    if (period === "All") return 4;
    if (period === "Weekly") return 8;
    if (period === "PreviousWeekly") return 16;
    return 0;
  }

  function aggregateCustomCpSummary(buckets) {
    const bucketsByJob = new Map();
    for (const bucket of buckets) {
      const jobName = String(bucket.J || "");
      if (!jobName) {
        continue;
      }
      const rows = bucketsByJob.get(jobName) || [];
      rows.push(bucket);
      bucketsByJob.set(jobName, rows);
    }
    const summaryByJob = new Map();
    for (const [jobName, rows] of bucketsByJob) {
      const dps = aggregateCustomMetric(rows, "N", ["L", "A", "E", "H", "Q", "X"]);
      const normalized = aggregateCustomMetric(rows, "S", ["I", "D", "F", "G", "P", "Y"]);
      summaryByJob.set(jobName, {
        ...dps,
        normalizedDps: normalized,
      });
    }
    return summaryByJob;
  }

  function aggregateCustomMetric(rows, countKey, valueKeys) {
    const samples = [];
    let sampleCount = 0;
    for (const row of rows) {
      const count = Math.max(0, Number(row[countKey]) || 0);
      sampleCount += count;
      const values = valueKeys
        .map(key => Number(row[key]))
        .filter(value => value > 0);
      const weight = values.length > 0 ? count / values.length : 0;
      for (const value of values) {
        if (weight > 0) samples.push([value, weight]);
      }
    }
    samples.sort((left, right) => left[0] - right[0]);
    return {
      sampleCount,
      minDps: weightedQuantile(samples, 0),
      p25Dps: weightedQuantile(samples, 0.25),
      medianDps: weightedQuantile(samples, 0.5),
      p75Dps: weightedQuantile(samples, 0.75),
      p90Dps: weightedQuantile(samples, 0.9),
      maxDps: weightedQuantile(samples, 1),
    };
  }

  function percentile(sortedValues, quantile) {
    if (sortedValues.length === 0) {
      return 0;
    }
    if (sortedValues.length === 1) {
      return sortedValues[0];
    }
    const position = Math.max(0, Math.min(1, quantile)) * (sortedValues.length - 1);
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) {
      return sortedValues[lower];
    }
    const weight = position - lower;
    return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
  }

  function customCpWeeklyPeriodLabel() {
    return String(state.customCpData?.currentWeekPeriodLabel || "") ||
      (state.customCpData?.views || [])
      .find(view =>
        view.dungeonKey === state.dungeonKey &&
        parseWeeklyRange(view.periodLabel))
      ?.periodLabel || "";
  }

  function customCpWeeklyRange(previous) {
    const range = parseWeeklyRange(customCpWeeklyPeriodLabel());
    if (!range || !previous) {
      return range;
    }
    return {
      start: new Date(range.start.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(range.end.getTime() - 7 * 24 * 60 * 60 * 1000),
    };
  }

  function koreaDayStart(timestamp) {
    if (!Number.isFinite(timestamp)) {
      return Number.NaN;
    }
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(timestamp));
    const value = type => Number(parts.find(part => part.type === type)?.value || 0);
    return Date.UTC(value("year"), value("month") - 1, value("day")) -
      9 * 60 * 60 * 1000;
  }

  function mergeCustomSummaryViews(views) {
    if (views.length === 0) {
      return null;
    }
    const rowsByJob = new Map();
    for (const view of views) {
      for (const row of view.rows || []) {
        const rows = rowsByJob.get(row.jobName) || [];
        rows.push(row);
        rowsByJob.set(row.jobName, rows);
      }
    }
    return {
      ...views[0],
      cpTierIndex: -1,
      cpTierLabel: customCpRangeLabel(),
      recordCount: views.reduce((sum, view) => sum + (Number(view.recordCount) || 0), 0),
      playerSampleCount: views.reduce((sum, view) => sum + (Number(view.playerSampleCount) || 0), 0),
      rows: [...rowsByJob.entries()].map(([jobName, rows]) =>
        mergeCustomSummaryRows(jobName, rows)),
    };
  }

  function mergeCustomSummaryRows(jobName, rows) {
    const samples = [];
    for (const row of rows) {
      const values = Array.isArray(row.dpsPercentiles) && row.dpsPercentiles.length >= 10
        ? row.dpsPercentiles
        : [row.minDps, row.p25Dps, row.medianDps, row.p75Dps, row.p90Dps, row.maxDps];
      const weight = Math.max(1, Number(row.sampleCount) || 1) / Math.max(1, values.length);
      for (const value of values) {
        if (Number(value) > 0) {
          samples.push([Number(value), weight]);
        }
      }
    }
    samples.sort((left, right) => left[0] - right[0]);
    const sampleCount = rows.reduce((sum, row) => sum + (Number(row.sampleCount) || 0), 0);
    const weeklyComparison = state.period === "Weekly"
      ? mergeWeeklyComparison(rows)
      : null;
    const previousWeek = state.period === "Weekly"
      ? mergePreviousWeekSummaries(rows.map(row => row.previousWeek))
      : null;
    return {
      jobName,
      sampleCount,
      minDps: weightedQuantile(samples, 0),
      p25Dps: weightedQuantile(samples, 0.25),
      medianDps: weightedQuantile(samples, 0.5),
      p75Dps: weightedQuantile(samples, 0.75),
      p90Dps: weightedQuantile(samples, 0.9),
      maxDps: weightedQuantile(samples, 1),
      dpsPercentiles: weeklyComparison,
      previousWeek,
    };
  }

  function weightedQuantile(samples, quantile) {
    if (samples.length === 0) {
      return 0;
    }
    const total = samples.reduce((sum, item) => sum + item[1], 0);
    const target = Math.max(0, Math.min(1, quantile)) * total;
    let current = 0;
    for (const item of samples) {
      current += item[1];
      if (current >= target) {
        return item[0];
      }
    }
    return samples[samples.length - 1][0];
  }

  function mergeWeeklyComparison(rows) {
    const available = rows
      .map(row => row.dpsPercentiles)
      .filter(value => Array.isArray(value) && value.length >= 3 && Number(value[2]) > 0);
    if (available.length === 0) {
      return null;
    }
    const count = available.reduce((sum, value) => sum + Number(value[2]), 0);
    return [
      available.reduce((sum, value) => sum + Number(value[0]) * Number(value[2]), 0) / count,
      available.reduce((sum, value) => sum + Number(value[1]) * Number(value[2]), 0) / count,
      count,
    ];
  }

  function previousWeekSummary(value) {
    const sampleCount = Math.max(0, Math.round(Number(value?.sampleCount) || 0));
    if (sampleCount <= 0) {
      return null;
    }
    return {
      sampleCount,
      p90: Number(value?.p90Dps ?? value?.p90) || 0,
      p75: Number(value?.p75Dps ?? value?.p75) || 0,
      median: Number(value?.medianDps ?? value?.median) || 0,
      max: Number(value?.maxDps ?? value?.max) || 0,
    };
  }

  function mergePreviousWeekSummaries(values) {
    const available = values
      .map(previousWeekSummary)
      .filter(Boolean);
    if (available.length === 0) {
      return null;
    }
    const samples = [];
    for (const value of available) {
      const metrics = [value.median, value.p75, value.p90, value.max]
        .filter(metric => metric > 0);
      const weight = metrics.length > 0 ? value.sampleCount / metrics.length : 0;
      for (const metric of metrics) {
        if (weight > 0) samples.push([metric, weight]);
      }
    }
    samples.sort((left, right) => left[0] - right[0]);
    return {
      sampleCount: available.reduce((sum, value) => sum + value.sampleCount, 0),
      p90: weightedQuantile(samples, 0.9),
      p75: weightedQuantile(samples, 0.75),
      median: weightedQuantile(samples, 0.5),
      max: weightedQuantile(samples, 1),
    };
  }

  function mergeCustomClassViews(views) {
    const minimum = state.customCpMinK * 1000;
    const maximum = state.customCpMaxK * 1000;
    const bestByCharacter = new Map();
    for (const view of views) {
      for (const row of view.rows || []) {
        for (const player of row.players || []) {
          const combatPower = Number(player.combatPower) || 0;
          if (combatPower < minimum || combatPower > maximum) {
            continue;
          }
          const key = `${row.jobName}\u0000${Number(player.serverId) || 0}\u0000${player.name}`;
          const current = bestByCharacter.get(key);
          if (!current || Number(player.dps) > Number(current.player.dps)) {
            bestByCharacter.set(key, { jobName: row.jobName, player });
          }
        }
      }
    }
    const rows = JOB_ORDER.map(jobName => {
      const players = [...bestByCharacter.values()]
        .filter(item => item.jobName === jobName)
        .map(item => item.player)
        .sort((left, right) => Number(right.dps) - Number(left.dps))
        .slice(0, 20)
        .map((player, index) => ({ ...player, rank: index + 1 }));
      return { jobName, players };
    }).filter(row => row.players.length > 0);
    return {
      bossIndex: state.bossIndex,
      cpTierIndex: -1,
      period: state.period === "Weekly" ? "All" : state.period,
      rows,
    };
  }

  function updateSnapshot(view) {
    elements["snapshot-title"].textContent = filterDescription();
    const weeklyRange = state.period === "Weekly"
      ? parseWeeklyRange(view?.periodLabel)
      : null;
    elements["snapshot-caption"].textContent = weeklyRange
      ? `${formatWeeklyRange(weeklyRange)} · ${t(usesNormalizedRanking() ? "weeklyCompareNdps" : "weeklyCompare")}`
      : "";
    elements["snapshot-caption"].hidden = !weeklyRange;
    elements["weekly-guide"].hidden = state.period !== "Weekly";
    elements["sample-meta"].textContent = view
      ? state.cpFilterMode === "custom"
        ? t("recordSamplesValue", {
            count: formatInteger(view.playerSampleCount),
          })
        : `${t("records")} ${formatInteger(view.recordCount)} · ${t("samples")} ${formatInteger(view.playerSampleCount)}`
      : "—";
    elements["generated-meta"].textContent = state.data
      ? `${t("updated")} ${formatDateTime(state.data.generatedAt)}`
      : "—";
  }

  function filterDescription() {
    const dungeon = currentDungeon();
    const boss = state.bossIndex === 0
      ? t("allBosses")
      : localizeGameName(dungeon?.bossNames?.[state.bossIndex - 1]) || t("allBosses");
    const cp = state.cpFilterMode === "custom"
      ? customCpRangeLabel()
      : state.cpTierIndex === 0
        ? t("allCp")
        : state.data.cpTiers.find(item => Number(item.index) === state.cpTierIndex)?.label || t("allCp");
    const metric = usesCombatTimeRanking()
      ? t("duration")
      : usesNormalizedRanking()
        ? "nDPS"
        : "DPS";
    return `${metric} · ${dungeonName(dungeon)} · ${boss} · ${cp} · ${periodName(state.period)}`;
  }

  function customCpRangeLabel() {
    if (state.customCpPresetTierIndex > 0) {
      const tier = state.data?.cpTiers?.find(item =>
        Number(item.index) === state.customCpPresetTierIndex);
      if (tier?.label) {
        return tier.label;
      }
    }
    return `${formatInteger(state.customCpMinK)}K~${formatInteger(state.customCpMaxK)}K`;
  }

  function updateDailyUsers(data = state.data) {
    const view = data?.views?.find(item => item.dungeonKey === DAILY_USER_KEY);
    elements["daily-user-count"].textContent = view
      ? t("peopleValue", { value: formatInteger(view.recordCount) })
      : "—";
  }

  function updateCacheAge() {
    if (!state.data?.generatedAt) {
      elements["cache-age"].textContent = "";
      return;
    }
    const generatedAt = Date.parse(state.data.generatedAt);
    if (!Number.isFinite(generatedAt)) {
      elements["cache-age"].textContent = "";
      return;
    }
    const ageMinutes = Math.max(0, Math.floor((Date.now() - generatedAt) / 60_000));
    elements["cache-age"].textContent = ageMinutes < 2
      ? t("agoNow")
      : ageMinutes < 60
        ? t("agoMinutes", { value: ageMinutes })
        : t("agoHours", { value: Math.floor(ageMinutes / 60) });
  }

  function applyLocale() {
    document.documentElement.lang = state.locale;
    elements["language-button"].value = state.locale;
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const key = element.dataset.i18n;
      if (COPY[state.locale]?.[key] || COPY.ko[key]) {
        element.textContent = t(key);
      }
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
      const key = element.dataset.i18nAriaLabel;
      if (COPY[state.locale]?.[key] || COPY.ko[key]) {
        element.setAttribute("aria-label", t(key));
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      const key = element.dataset.i18nPlaceholder;
      if (COPY[state.locale]?.[key] || COPY.ko[key]) {
        element.setAttribute("placeholder", t(key));
      }
    });
    document.querySelectorAll("[data-i18n-title]").forEach(element => {
      const key = element.dataset.i18nTitle;
      if (COPY[state.locale]?.[key] || COPY.ko[key]) {
        element.setAttribute("title", t(key));
      }
    });
    updatePageIdentity();
    syncCustomCpControls();
    renderDetailSettings();
    syncOptimizationFrameLocale();
    window.NotMeterStatEfficiency?.setLocale(state.locale);
    window.NotMeterCharacter?.setLocale(state.locale);
    window.NotMeterArtifactOccupation?.setLocale(state.locale);
    if (state.surfaceMode === "fieldBoss" && state.fieldBossData) {
      renderFieldBoss();
    }
    if (state.surfaceMode === "bossResistance" && state.data) {
      renderBossResistanceView();
    }
  }

  function updatePageIdentity() {
    const fieldBoss = state.surfaceMode === "fieldBoss";
    const artifact = state.surfaceMode === "artifact";
    const classTop10 = state.surfaceMode === "classTop10";
    const classPerformance = state.surfaceMode === "classPerformance";
    const optimization = state.surfaceMode === "optimization";
    const contribution = state.surfaceMode === "contribution";
    const bossResistance = state.surfaceMode === "bossResistance";
    const statEfficiency = state.surfaceMode === "statEfficiency";
    const character = state.surfaceMode === "character";
    const title = t(character
      ? "characterPageTitle"
      : optimization
      ? "optimizationPageTitle"
      : contribution
        ? "contributionPageTitle"
      : bossResistance
        ? "bossResistancePageTitle"
      : statEfficiency
        ? "statEfficiencyPageTitle"
      : artifact
        ? "artifactPageTitle"
      : fieldBoss
        ? "fieldBossPageTitle"
        : classTop10
          ? "classTop10PageTitle"
          : classPerformance
            ? "classPerformancePageTitle"
          : "title");
    const subtitle = t(character
      ? "characterPageSubtitle"
      : optimization
      ? "optimizationPageSubtitle"
      : contribution
        ? "contributionPageSubtitle"
      : bossResistance
        ? "bossResistancePageSubtitle"
      : statEfficiency
        ? "statEfficiencyPageSubtitle"
      : artifact
        ? "artifactPageSubtitle"
      : fieldBoss
        ? "fieldBossPageSubtitle"
        : classTop10
          ? "classTop10PageSubtitle"
          : classPerformance
            ? "classPerformancePageSubtitle"
          : "subtitle");
    document.title = title;
    elements["page-title"].textContent = title;
    elements["page-subtitle"].textContent = subtitle;
  }

  function showState(name) {
    elements["loading-state"].hidden = name !== "loading";
    elements["error-state"].hidden = name !== "error";
    elements["empty-state"].hidden = name !== "empty";
    elements["summary-view"].hidden = name !== "summary";
    elements["class-view"].hidden = name !== "class";
  }

  function isRepeatedPointerActivation(event) {
    return Number(event?.detail) > 1;
  }

  function blockRankingNavigation() {
    state.rankingNavigationBlockedUntil = Date.now() + 350;
  }

  function isRankingNavigationBlocked() {
    return Date.now() < state.rankingNavigationBlockedUntil;
  }

  function replaceClassHistoryWithSummary() {
    const current = globalThis.history?.state;
    if (current?.notMeterStatsView !== "class") {
      return false;
    }
    const summaryState = { ...current, notMeterStatsView: "summary" };
    delete summaryState.notMeterStatsJob;
    globalThis.history.replaceState(summaryState, "");
    return true;
  }

  function resetClassSelection() {
    state.mode = "summary";
    state.selectedJob = "";
    blockRankingNavigation();
    replaceClassHistoryWithSummary();
  }

  function leaveClassView() {
    closeCombatDetail();
    resetClassSelection();
  }

  function currentDungeon() {
    return state.data?.dungeons?.find(item => item.key === state.dungeonKey) || null;
  }

  function orderDungeonsForDisplay(dungeons) {
    const featuredOrder = new Map(
      FEATURED_DUNGEON_KEYS.map((key, index) => [key, index]));
    return [...(Array.isArray(dungeons) ? dungeons : [])]
      .map((dungeon, index) => ({ dungeon, index }))
      .sort((left, right) => {
        const leftOrder = featuredOrder.get(left.dungeon?.key);
        const rightOrder = featuredOrder.get(right.dungeon?.key);
        if (leftOrder !== undefined || rightOrder !== undefined) {
          return (leftOrder ?? Number.MAX_SAFE_INTEGER) -
            (rightOrder ?? Number.MAX_SAFE_INTEGER);
        }
        return left.index - right.index;
      })
      .map(item => item.dungeon);
  }

  function dungeonName(dungeon) {
    if (!dungeon) {
      return "";
    }
    if (state.locale === "en") {
      return DUNGEON_NAMES_EN[dungeon.key] || dungeon.displayName;
    }
    if (state.locale === "zh-TW") {
      return DUNGEON_NAMES_ZH_TW[dungeon.key] || localizeGameName(dungeon.displayName);
    }
    return dungeon.displayName;
  }

  function jobName(job) {
    if (state.locale === "en") {
      return JOB_NAMES_EN[job] || job;
    }
    return state.locale === "zh-TW" ? localizeGameName(job) : job;
  }

  function periodName(period) {
    const normalized = normalizePeriod(period);
    return normalized === "Weekly"
      ? t("thisWeek")
      : normalized === "Today"
      ? t("today")
      : normalized === "All"
        ? t("allPeriod")
        : t("recent14");
  }

  function normalizePeriod(value) {
    if (typeof value === "number") {
      return ["Today", "Recent14Days", "All"][value] || "Recent14Days";
    }
    return String(value || "Recent14Days");
  }

  function parseWeeklyRange(label) {
    const text = String(label || "");
    if (!text.startsWith(WEEKLY_LABEL_PREFIX)) {
      return null;
    }
    const [startText, endText] = text.slice(WEEKLY_LABEL_PREFIX.length).split("|");
    const start = new Date(startText);
    const end = new Date(endText);
    return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start
      ? { start, end }
      : null;
  }

  function formatWeeklyRange(range) {
    const separator = state.locale === "ko" ? "~" : "–";
    const suffix = state.locale === "ko" ? "한국시간" : state.locale === "zh-TW" ? "韓國時間" : "KST";
    return `${formatKoreaShort(range.start)}${separator}${formatKoreaShort(range.end)} ${suffix}`;
  }

  function formatKoreaShort(value) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(value);
    const get = type => parts.find(part => part.type === type)?.value || "";
    return `${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
  }

  function buildWeeklyComparisonBadge(row) {
    if (state.period !== "Weekly") {
      return null;
    }
    const previous = resolvePreviousWeekStats(row);
    const change = weeklyP75Change(row, previous);
    if (!previous || !change) {
      return null;
    }
    const badge = document.createElement("span");
    badge.className = `weekly-change ${change.direction}`;
    badge.textContent = change.label;
    badge.title =
      `${t("weeklyTooltip")}\n` +
      `${t("top25")} ${formatDps(previous.p75)} → ${formatDps(row.p75Dps)}\n` +
      `${t("samples")} ${formatInteger(previous.sampleCount)} → ${formatInteger(row.sampleCount)}`;
    return badge;
  }

  function cellWithRank(rank) {
    const td = document.createElement("td");
    td.className = "rank-column";
    const badge = document.createElement("span");
    badge.className = "rank-badge";
    badge.textContent = String(rank);
    td.append(badge);
    return td;
  }

  function numericCell(value, modifier = "", label = "") {
    const td = document.createElement("td");
    td.className = `numeric ${modifier}`.trim();
    td.textContent = value;
    if (label) {
      td.dataset.label = label;
    }
    return td;
  }

  function createRankingDpsCell(player) {
    const dps = Math.max(0, Number(player?.X ?? player?.dps) || 0);
    const verifiedValue = player?.A ?? player?.raidDpsVerified;
    const verified = verifiedValue === true || Number(verifiedValue) === 1;
    const normalizedDps = verified
      ? Math.max(0, Number(player?.Y ?? player?.normalizedDps) || 0)
      : 0;
    const td = document.createElement("td");
    td.className = "numeric accent class-dps";
    const normalizedRanking = usesNormalizedRanking();
    td.dataset.label = normalizedRanking ? "nDPS" : "DPS";

    const total = document.createElement("strong");
    total.className = `class-dps-total${normalizedRanking ? " normalized" : ""}`;
    total.textContent = formatInteger(Math.round(normalizedRanking ? normalizedDps : dps));

    const adjusted = document.createElement("span");
    adjusted.className = `class-dps-adjusted ${verified ? "verified" : "unavailable"}` +
      (normalizedRanking ? " normalized-ranking" : "");
    const status = document.createElement("span");
    status.className = "class-dps-status";
    status.textContent = verified ? t("normalizedDpsVerified") : t("normalizedDpsUnavailable");
    status.title = verified ? t("normalizedDpsVerifiedTitle") : t("normalizedDpsUnavailableTitle");
    const normalized = document.createElement("span");
    normalized.className = "class-dps-metric normalized";
    const normalizedLabel = document.createElement("span");
    normalizedLabel.className = "class-dps-metric-label";
    normalizedLabel.textContent = normalizedRanking ? t("totalDpsShort") : "nDPS";
    const normalizedValue = document.createElement("span");
    normalizedValue.className = "class-dps-metric-value";
    normalizedValue.textContent = formatInteger(Math.round(normalizedRanking ? dps : normalizedDps));
    normalized.append(normalizedLabel, normalizedValue);
    adjusted.append(...(normalizedRanking ? [normalized] : [status, normalized]));

    td.title = `DPS ${formatInteger(Math.round(dps))}\n` +
      `nDPS ${formatInteger(Math.round(normalizedDps))} · ${t("normalizedDpsDescription")}\n` +
      (verified ? t("normalizedDpsVerifiedTitle") : t("normalizedDpsUnavailableTitle"));
    td.append(total, adjusted);
    return td;
  }

  function createJobIcon(job) {
    const frame = document.createElement("span");
    frame.className = "job-icon-frame";
    frame.title = jobName(job);
    const img = document.createElement("img");
    img.src = `./assets/jobs/${encodeURIComponent(job)}.png`;
    img.alt = "";
    img.loading = "lazy";
    frame.append(img);
    return frame;
  }

  function decodeParty(player) {
    if (Array.isArray(player.partyJobNames) && player.partyJobNames.length > 0) {
      return player.partyJobNames.filter(job => JOB_ORDER.includes(job));
    }
    const compact = String(player.P ?? player.compactParty ?? "");
    return [...compact].map(code => JOB_CODES[code]).filter(Boolean);
  }

  function formatCharacterName(name, serverId) {
    const clean = String(name || "").replace(/^\[TW\]\s*/i, "").trim();
    const server = serverLabel(Number(serverId));
    return server ? `${clean}[${server}]` : clean;
  }

  function characterProfileHref(player) {
    const name = String(player?.name || "").replace(/^\[TW\]\s*/i, "").trim();
    const serverId = Math.max(0, Math.trunc(Number(player?.serverId) || 0));
    if (!name || serverId <= 0 || /[*＊]/u.test(name)) return "";
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("view", "character");
    url.searchParams.set("serverId", String(serverId));
    url.searchParams.set("name", name);
    if (isTaiwanPlayer(player)) {
      url.searchParams.set("region", "tw");
    }
    return url.href;
  }

  function appendCharacterProfileLink(container, player) {
    const href = characterProfileHref(player);
    if (!href) return;
    const link = document.createElement("a");
    link.className = "ranking-character-profile-link";
    link.href = href;
    link.textContent = `${t("characterProfileShort")} ›`;
    link.title = t("characterProfile");
    link.setAttribute("aria-label", `${formatCharacterName(player.name, player.serverId)} ${t("characterProfile")}`);
    link.addEventListener("click", event => event.stopPropagation());
    link.addEventListener("keydown", event => event.stopPropagation());
    container.append(link);
  }

  function serverLabel(serverId) {
    const group = Math.floor(serverId / 1000);
    const offset = serverId % 1000;
    const names = group === 1 ? SERVER_NAMES_ELYOS : group === 2 ? SERVER_NAMES_ASMODIAN : null;
    const name = names?.[offset - 1] || "";
    return SERVER_SHORT_NAMES[name] || [...name].slice(0, 2).join("");
  }

  function isTaiwanName(name) {
    return /^\[TW\]/i.test(String(name || "")) || /[\u3400-\u4dbf\u4e00-\u9fff]/u.test(String(name || ""));
  }

  function isTaiwanPlayer(player) {
    const region = String(player?.serverRegion ?? player?.R ?? player?.region ?? "").trim();
    return /^tw$/i.test(region) || /^taiwan$/i.test(region) || isTaiwanName(player?.name);
  }

  function formatDps(value) {
    const number = Number(value) || 0;
    const units = [
      [1_000_000_000, "B"],
      [1_000_000, "M"],
      [1_000, "K"],
    ];
    for (const [size, suffix] of units) {
      if (Math.abs(number) >= size) {
        const digits = Math.abs(number) >= size * 100 ? 0 : Math.abs(number) >= size * 10 ? 1 : 2;
        return `${trimFixed(number / size, digits)}${suffix}`;
      }
    }
    return formatInteger(Math.round(number));
  }

  function formatSummaryDps(value) {
    return Number(value) > 0 ? formatDps(value) : "—";
  }

  function summaryP90Dps(row) {
    const direct = Number(row?.p90Dps);
    if (direct > 0) return direct;
    const percentiles = Array.isArray(row?.dpsPercentiles) ? row.dpsPercentiles : [];
    return percentiles.length >= 91 ? Number(percentiles[90]) || 0 : 0;
  }

  function formatCompact(value) {
    const number = Math.max(0, Number(value) || 0);
    if (number >= 1_000_000_000) {
      return `${(number / 1_000_000_000).toFixed(2)}B`;
    }
    if (number >= 1_000_000) {
      return `${(number / 1_000_000).toFixed(2)}M`;
    }
    if (number >= 1_000) {
      return `${(number / 1_000).toFixed(2)}K`;
    }
    return formatInteger(Math.round(number));
  }

  function formatCombatPower(value) {
    const number = Math.max(0, Number(value) || 0);
    if (number >= 1_000_000) {
      return `${formatInteger(Math.floor(number / 1_000))}M`;
    }
    if (number >= 1_000) {
      return `${trimFixed(number / 1_000, 1)}K`;
    }
    return formatInteger(Math.round(number));
  }

  function trimFixed(value, digits) {
    const fixed = Number(value).toFixed(digits);
    return digits > 0 ? fixed.replace(/\.?0+$/, "") : fixed;
  }

  function formatPercent(value, digits = 0) {
    return `${trimFixed(Math.max(0, Number(value) || 0), digits)}%`;
  }

  function formatPositionPercent(value) {
    return value === null || value === undefined || Number.isNaN(Number(value))
      ? "-%"
      : formatPercent(value);
  }

  function formatInterval(value) {
    const milliseconds = Number(value);
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
      return "—";
    }
    return milliseconds >= 1_000
      ? `${trimFixed(milliseconds / 1_000, 2)}s`
      : `${formatInteger(Math.round(milliseconds))}ms`;
  }

  function formatSeconds(value) {
    const seconds = Math.max(0, Number(value) || 0);
    const amount = trimFixed(seconds, seconds < 10 ? 1 : 0);
    return state.locale === "ko" ? `${amount}초` : state.locale === "zh-TW" ? `${amount}秒` : `${amount}s`;
  }

  function formatInteger(value) {
    return new Intl.NumberFormat(localeTag())
      .format(Number(value) || 0);
  }

  function formatDecimal(value, digits = 1) {
    return new Intl.NumberFormat(localeTag(), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(value) || 0);
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(total / 60);
    return `${String(minutes).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    return new Intl.DateTimeFormat(localeTag(), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  function t(key, values = {}) {
    let text = COPY[state.locale]?.[key] || COPY.ko[key] || key;
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }
})();
