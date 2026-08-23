(() => {
  "use strict";

  const surface = document.getElementById("stat-efficiency-surface");
  if (!surface) return;

  const API_BASE = "https://notmeter.112-168-140-142.sslip.io/formula/v1";
  const CLIPBOARD_PREFIX = "NOTMETER_STATS_V4:";
  const CLIPBOARD_SCHEMA = "notmeter-stat-efficiency-profile-v4";
  const SIMULATION_DEBOUNCE_MS = 450;
  const SIMULATION_CACHE_LIMIT = 48;
  const CATALOG_REFRESH_MS = 60_000;
  const LOCALES = ["ko", "en", "zh-TW"];
  const FALLBACK_JOBS = [
    ["검성", "검성"], ["수호성", "수호성"], ["궁성", "궁성"],
    ["살성", "살성"], ["마도성", "마도성"], ["정령성", "정령성"],
    ["치유성", "치유성"], ["호법성", "호법성"], ["권성", "권성"],
  ];
  const PROFILE_FIELDS = [
    "attack", "additionalAttack", "minimumAttack", "maximumAttack", "attackIncreasePercent", "criticalAttackPower",
	"sealstoneAdditionalDamage", "power", "vitality", "agility", "knowledge", "precision",
    "will", "justice", "freedom", "illusion", "life", "time", "destruction",
    "death", "wisdom", "destiny", "space",
    "accuracy", "weaponAccuracy", "accuracyIncreasePercent", "pveAccuracy", "critical", "criticalIncreasePercent",
    "defense", "armorDefense", "defenseIncreasePercent", "penetration", "pveAttack",
    "bossAttack", "frontAttack", "backAttack", "frontCritical", "backCritical",
	"damageAmplificationPercent",
    "weaponDamageAmplificationPercent", "pveDamageAmplificationPercent",
    "bossDamageAmplificationPercent", "criticalDamageAmplificationPercent",
    "additionalHitAccuracyPercent", "perfectPercent", "hardHitPercent",
    "cooldownTimePercent", "combatSpeedPercent", "frontDamageAmplificationPercent",
    "backDamageAmplificationPercent",
	"waterDamageAmplificationPercent", "fireDamageAmplificationPercent",
	"windDamageAmplificationPercent", "earthDamageAmplificationPercent",
	"holyDamageAmplificationPercent", "darkDamageAmplificationPercent",
	"intellectDamageAmplificationPercent",
	"feralDamageAmplificationPercent", "natureDamageAmplificationPercent",
	"transDamageAmplificationPercent",
  ];
	const EXTENDED_PROFILE_FIELDS = new Set([
		"waterDamageAmplificationPercent", "fireDamageAmplificationPercent",
		"windDamageAmplificationPercent", "earthDamageAmplificationPercent",
		"holyDamageAmplificationPercent", "darkDamageAmplificationPercent",
		"intellectDamageAmplificationPercent",
		"feralDamageAmplificationPercent", "natureDamageAmplificationPercent",
		"transDamageAmplificationPercent",
	]);
	const GROWTH_EFFECTS = new Set([
		"power", "vitality", "agility", "knowledge", "precision", "will", "justice",
		"freedom", "illusion", "life", "time", "destruction", "death", "wisdom",
		"destiny", "space",
	]);
	const ATTACK_VALUE_EFFECTS = new Set([
		"additionalAttack", "minimumAttack", "maximumAttack", "criticalAttackPower",
		"sealstoneAdditionalDamage", "penetration", "pveAttack", "bossAttack",
		"frontAttack", "backAttack",
	]);
	const JUDGMENT_VALUE_EFFECTS = new Set([
		"accuracy", "pveAccuracy", "critical", "frontCritical", "backCritical",
	]);
	const HIDDEN_EFFECTS = new Set([
		"allElementDamageAmplification", "sealstoneAdditionalDamage", "weaponDamageAmplification",
		"waterDamageAmplification", "fireDamageAmplification", "windDamageAmplification",
		"earthDamageAmplification", "holyDamageAmplification", "darkDamageAmplification",
		"intellectDamageAmplification", "feralDamageAmplification",
		"natureDamageAmplification", "transDamageAmplification", "penetration",
		"vitality", "agility", "knowledge", "precision", "will", "freedom",
		"life", "death", "destiny", "space",
		"accuracy", "pveAccuracy", "critical", "frontCritical", "backCritical",
		"criticalAttackPower", "criticalDamageAmplification",
	]);
	const DIRECTIONAL_EFFECTS = ["frontDamageAmplification", "backDamageAmplification"];
  const DISPLAYED_STAT_FIELDS = [
    ["attack", false], ["accuracy", false], ["critical", false], ["defense", false],
    ["cooldownTimePercent", true], ["combatSpeedPercent", true],
  ];
  const TEXT = {
    ko: {
      title: "스탯 효율 계산기", subtitle: "내 캐릭터에서 무엇을 올려야 가장 강해지는지 비교합니다.",
      guideTitle: "어떤 결과가 표시되나요?", guideDescription: "스탯을 넣지 않아도 통계를 볼 수 있고, 내 스탯을 붙여넣으면 개인 기준으로 자동 보정됩니다.", guideOverviewTitle: "스탯 미입력 · 전체 통계", guideOverviewDescription: "선택한 직업의 실제 표본 중 대표 스탯을 기준으로 전체 전투 효율 순위를 바로 보여줍니다.", guidePersonalTitle: "내 스탯 붙여넣기 · 개인 보정", guidePersonalDescription: "현재 공격력·증폭·판정 수치를 반영해 내 캐릭터에서 실제로 더 유리한 순위로 자동 변경합니다.",
	      methodAria: "스탯 효율 계산 기준", methodTitle: "어떻게 계산하나요?", methodDataTitle: "1. 실전 표본 수집", methodDataDescription: "지원 던전에서 최종 스탯·직업·스킬·공격 방향·보스 상태가 함께 확인된 피해만 사용합니다.", methodModelTitle: "2. 공식식과 표본 분리", methodModelDescription: "검증된 피해식은 고정하고, 표본은 직업별 스킬 피해 비중·공격 방향·추가타 피해량을 교차 검증하는 데만 사용합니다.", methodCompareTitle: "3. 상승 전후 재계산", methodCompareDescription: "같은 전투 조건에서 각 스탯을 +1, +10 또는 +1%p 바꿔 공식식으로 기대 피해를 다시 계산합니다.", methodValidationTitle: "4. 검증된 항목만 공개", methodValidationDescription: "장비·기본 공격력 분리가 필요한 무기 피해 증폭과 독립식이 미확인된 속성 증폭·관통은 순위에서 제외합니다.",
      inputWaitingTitle: "직업 전체 통계를 불러오는 중입니다", inputWaitingDescription: "스탯 입력 없이도 직업별 집계 순위를 볼 수 있습니다.", readyToCalculateTitle: "내 스탯이 적용되었습니다", readyToCalculateDescription: "개인 스탯을 반영한 효율 순위로 자동 갱신합니다.",
      importTitle: "딜미터기에서 복사한 내 스탯 붙여넣기", importDescription: "딜미터기 처치 기록 상단의 ‘내 스탯 복사’를 누른 뒤 아래 칸에 붙여넣으면 현재 캐릭터 스탯이 자동 입력됩니다.", importPlaceholder: "여기를 누르고 Ctrl+V로 붙여넣기", importWaiting: "복사한 값을 기다리고 있습니다", importSuccess: "내 스탯 {count}개를 자동 입력했습니다", importInvalid: "딜미터기에서 복사한 올바른 스탯 값이 아닙니다",
	      noticeTitle: "공식식 우선 원칙", notice: "표본 상관관계로 계수를 만들지 않습니다. 무기 피해 증폭·속성 증폭·관통처럼 현재 입력만으로 정확히 분리할 수 없는 항목은 숨깁니다.", heroKicker: "검증식 + 실전 표본", heroTitle: "직업 전체 전투 기준 성장 우선순위를 확인하세요", heroDescription: "공식식으로 스탯 상승분을 계산하고 실제 표본에서는 직업별 스킬·방향 비중만 반영합니다.",
      collecting: "표본 수집 중 · 준비 중", ready: "계산 준비 완료", samples: "{count} 표본", samplesChecking: "표본 수 확인 중", samplesUnavailable: "표본 수 확인 지연", sourceOnly: "분석 대상", deus: "잠식된 데우스 연구기지(어려움)", noiran: "노이란의 숨겨진 유산(4단계)",
      combatProfile: "전투 조건", combatProfileHelp: "직업만 선택하면 검증된 보스의 전체 스킬·공격 방향 표본을 종합합니다.", job: "직업", jobPickerTitle: "비교할 직업 선택", jobPickerHelp: "직업 마크를 누르면 전체 효율 순위가 즉시 변경됩니다.", analysisScope: "분석 범위", jobOverallScope: "직업 전체 전투 종합", jobOverallHelp: "스킬·레벨·특성을 따로 고르지 않고 실제 수집된 전체 전투 표본으로 계산합니다.",
      divineStats: "주신 스탯", divineStatsHelp: "각 스탯 1당 확인된 상승 효과를 함께 표시합니다.", growthPending: "공격 연동 효과 확인 중", powerGrowth: "1당 공격력 증가 +0.1%p", precisionGrowth: "1당 명중·치명타 증가 +0.1%p", justiceGrowth: "1당 완벽 +0.2%p", freedomGrowth: "1당 명중 증가 +0.2%p", illusionGrowth: "1당 재시전 시간 −0.2%p", timeGrowth: "1당 전투 속도 +0.2%p", destructionGrowth: "1당 공격력 증가 +0.2%p", deathGrowth: "1당 치명타 증가 +0.2%p", wisdomGrowth: "1당 강타 +0.2%p",
      attackStats: "공격 스탯", attackStatsHelp: "복사 기능을 사용하면 자동 입력됩니다.", attack: "기초 공격력", additionalAttack: "추가 공격력", minimumAttack: "최소 공격력", maximumAttack: "최대 공격력", criticalAttackPower: "치명타 공격력", sealstoneAdditionalDamage: "봉혼석 추가 피해", power: "위력", vitality: "체력", agility: "민첩", knowledge: "지식", precision: "정확", will: "의지", justice: "정의", freedom: "자유", illusion: "환상", life: "생명", time: "시간", destruction: "파괴", death: "죽음", wisdom: "지혜", destiny: "운명", space: "공간", accuracy: "명중", weaponAccuracy: "무기 명중", pveAccuracy: "PVE 명중", critical: "치명타", defense: "방어력", armorDefense: "방어구 방어력", penetration: "관통", pveAttack: "PVE 공격력", bossAttack: "보스 공격력", frontAttack: "전방 공격력", backAttack: "후방 공격력", frontCritical: "전방 치명타", backCritical: "후방 치명타",
      percentStats: "증폭·판정 스탯", percentStatsHelp: "다단 히트는 발동 20%+표기값+특화, 연속 굴림 50%+표기값으로 최대 4타까지 계산합니다.", attackIncrease: "공격력 증가율", accuracyIncrease: "명중 증가율", criticalIncrease: "치명타 증가율", defenseIncrease: "방어력 증가율", damageAmp: "피해 증폭", weaponAmp: "무기 피해 증폭", pveAmp: "PVE 피해 증폭", bossAmp: "보스 피해 증폭", criticalAmp: "치명타 피해 증폭", additionalHit: "다단 히트 적중", perfect: "완벽", hardHit: "강타", cooldownTime: "재시전 시간", combatSpeed: "전투 속도", frontAmp: "전방 피해 증폭", backAmp: "후방 피해 증폭",
	      calculate: "내 스탯으로 다시 계산", calculating: "계산 중…", resultKicker: "직업 전체 분석", resultTitle: "단위별 스탯 효율", displayedStatsTitle: "실시간 스탯 시뮬레이션", displayedStatsHelp: "복사 기준에서 입력값을 바꾸면 게임 표시 최종 스탯이 바로 갱신됩니다.", displayedAttack: "최종 공격력", displayedAccuracy: "최종 명중", displayedCritical: "최종 치명타", displayedDefense: "최종 방어력", displayedCooldownTime: "재시전 시간", displayedCombatSpeed: "전투 속도", simulationReset: "복사 기준으로 초기화", simulationDamage: "예상 종합 피해 변화", simulationWaiting: "기준 스탯을 붙여넣으면 자동 계산됩니다.", simulationCalculating: "변경값을 계산하고 있습니다.", simulationCollecting: "선택한 직업은 아직 검증 표본을 수집 중이며 최종 스탯은 정상 계산되었습니다.", simulationUnsupported: "해당 변경값은 독립 검증 전이라 예상 피해를 표시하지 않습니다.", simulationReady: "직업 전체 전투와 검증 완료 보스를 종합 계산한 결과입니다.", waitingTitle: "선택한 직업의 표본을 검증하고 있습니다", waitingDescription: "선택한 직업과 지원 보스 표본이 공개 가능한 검증 기준을 통과하면 결과가 열립니다.", resultGuide: "공식식이 검증된 항목만 표시합니다. +1, +10, +1%p처럼 단위가 다른 순위는 직접 비교하지 않습니다.", overviewSource: "직업 대표 표본 기준", personalSource: "내 캐릭터 스탯 기준", growthGroup: "주신 스탯 · +1 기준", attackGroup: "공격 수치 · +10 기준", judgmentGroup: "판정 수치 · +10 기준", percentGroup: "퍼센트 스탯 · +1%p 기준", directionalGroup: "공격 방향 효율 · +1%p 기준", directionalHelp: "전방·후방은 모두 ×(1 + 방향 증폭/100)의 같은 독립 곱연산입니다. 큰 값은 실제 방향 비중까지 반영한 직업 전체 기대값입니다.", directionalOverall: "직업 전체 기대", directionalOnHit: "해당 방향 1타", directionalFormula: "공통식 ×(1 + 방향 증폭/100)", frontCondition: "전방 타격에서만 적용", backCondition: "후방 타격에서만 적용", observedDamageShare: "실전 피해 비중 {share}%", detailRanking: "단위별 효율 순위 · {count}개 항목", easyTitle: "간편하게 사용하는 방법", easyOne: "직업을 선택하면 스탯 입력 없이 전체 표본 통계가 바로 표시됩니다.", easyTwo: "내 캐릭터에 맞추려면 딜미터기에서 ‘내 스탯 복사’ 후 붙여넣습니다.", easyThree: "붙여넣은 스탯은 자동 계산되며 입력값을 바꾸면 실시간으로 다시 보정됩니다.",
      pending: "검증 전", low: "낮은 신뢰", medium: "중간 신뢰", high: "높은 신뢰", invalid: "입력값을 확인해 주세요.", unavailable: "계산 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      powerEffect: "위력 +1", vitalityEffect: "체력 +1", agilityEffect: "민첩 +1", knowledgeEffect: "지식 +1", precisionEffect: "정확 +1", willEffect: "의지 +1", justiceEffect: "정의 +1", freedomEffect: "자유 +1", illusionEffect: "환상 +1", lifeEffect: "생명 +1", timeEffect: "시간 +1", destructionEffect: "파괴 +1", deathEffect: "죽음 +1", wisdomEffect: "지혜 +1", destinyEffect: "운명 +1", spaceEffect: "공간 +1", additionalAttackEffect: "추가 공격력 +10", minimumAttackEffect: "최소 공격력 +10", maximumAttackEffect: "최대 공격력 +10", criticalAttackPowerEffect: "치명타 공격력 +10", sealstoneAdditionalDamageEffect: "봉혼석 추가 피해 +10", accuracyEffect: "명중 +10", pveAccuracyEffect: "PVE 명중 +10", criticalEffect: "치명타 +10", penetrationEffect: "관통 +10", damageAmplificationEffect: "피해 증폭 +1%p", weaponDamageAmplificationEffect: "무기 피해 증폭 +1%p", criticalDamageAmplificationEffect: "치명타 피해 증폭 +1%p", additionalHitAccuracyEffect: "다단 히트 적중 +1%p", perfectEffect: "완벽 +1%p", hardHitEffect: "강타 +1%p", cooldownTimeEffect: "재시전 시간 -1%p", combatSpeedEffect: "전투 속도 +1%p", pveAttackEffect: "PVE 공격력 +10", pveDamageAmplificationEffect: "PVE 피해 증폭 +1%p", bossAttackEffect: "보스 공격력 +10", bossDamageAmplificationEffect: "보스 피해 증폭 +1%p", frontAttackEffect: "전방 공격력 +10", backAttackEffect: "후방 공격력 +10", frontCriticalEffect: "전방 치명타 +10", backCriticalEffect: "후방 치명타 +10", frontDamageAmplificationEffect: "전방 피해 증폭 +1%p", backDamageAmplificationEffect: "후방 피해 증폭 +1%p",
	  attributeStats: "속성·대상 증폭", waterAmp: "물 속성 증폭", fireAmp: "불 속성 증폭", windAmp: "바람 속성 증폭", earthAmp: "땅 속성 증폭", holyAmp: "신성 속성 증폭", darkAmp: "암흑 속성 증폭", allElementAmp: "모든 속성 증폭", intellectAmp: "지성형 피해 증폭", feralAmp: "야성형 피해 증폭", natureAmp: "자연형 피해 증폭", transAmp: "변이형 피해 증폭", waterDamageAmplificationEffect: "물 속성 증폭 +1%p", fireDamageAmplificationEffect: "불 속성 증폭 +1%p", windDamageAmplificationEffect: "바람 속성 증폭 +1%p", earthDamageAmplificationEffect: "땅 속성 증폭 +1%p", holyDamageAmplificationEffect: "신성 속성 증폭 +1%p", darkDamageAmplificationEffect: "암흑 속성 증폭 +1%p", allElementDamageAmplificationEffect: "모든 속성 증폭 +1%p", intellectDamageAmplificationEffect: "지성형 피해 증폭 +1%p", feralDamageAmplificationEffect: "야성형 피해 증폭 +1%p", natureDamageAmplificationEffect: "자연형 피해 증폭 +1%p", transDamageAmplificationEffect: "변이형 피해 증폭 +1%p",
    },
    en: {
	  minimumAttackEffect: "Minimum Attack +10",
      guideTitle: "What does this result mean?", guideDescription: "See aggregate rankings without stats, or paste your stats for an automatic personal adjustment.", guideOverviewTitle: "No stats · Class overview", guideOverviewDescription: "Shows the full-combat ranking from a representative real sample for the selected class.", guidePersonalTitle: "Paste stats · Personal result", guidePersonalDescription: "Uses your current attack, amplification, and hit values to reorder efficiency for your character.",
      methodAria: "Stat efficiency calculation method", methodTitle: "How is it calculated?", methodDataTitle: "1. Collect combat samples", methodDataDescription: "Only damage with confirmed final stats, class, skill, attack direction, and boss state from supported dungeons is used.", methodModelTitle: "2. Separate formulas and samples", methodModelDescription: "Verified damage formulas stay fixed; samples validate each class's skill mix, direction mix, and extra-hit damage only.", methodCompareTitle: "3. Recalculate each increase", methodCompareDescription: "Each stat is changed by +1, +10, or +1%p and the expected boss damage change is compared under the same conditions.", methodValidationTitle: "4. Show validated stats only", methodValidationDescription: "Element amplification, penetration, and other effects without an independently verified formula remain excluded regardless of sample count.",
      inputWaitingTitle: "Loading class-wide statistics", inputWaitingDescription: "View aggregate class rankings without entering stats.", readyToCalculateTitle: "Your stats are applied", readyToCalculateDescription: "The ranking updates automatically for your character.",
      title: "Stat Efficiency Calculator", subtitle: "Compare which upgrade makes your character stronger.", importTitle: "Paste stats copied from NotMeter", importDescription: "Press ‘Copy my stats’ at the top of Kill Records, then paste below to fill the current character's stats automatically.", importPlaceholder: "Click here and press Ctrl+V", importWaiting: "Waiting for copied stats", importSuccess: "Filled {count} stats automatically", importInvalid: "This is not a valid stat value copied from NotMeter", noticeTitle: "Formula-first policy", notice: "Sample correlations never define coefficients. Weapon, element, and penetration effects that cannot be isolated from the current input remain hidden.", heroKicker: "VERIFIED FORMULAS + COMBAT DATA", heroTitle: "Find your upgrade priority across all combat for your class", heroDescription: "Fixed formulas calculate each stat increase; samples provide only the class skill and direction mix.", collecting: "Collecting samples · Coming soon", ready: "Ready to calculate", samples: "{count} samples", samplesChecking: "Checking sample count", samplesUnavailable: "Sample count delayed", sourceOnly: "Analysis sources", deus: "Corrupted Deus Research Base (Hard)", noiran: "Noiran's Hidden Legacy (Stage 4)",
      combatProfile: "Combat profile", combatProfileHelp: "Choose only a class to combine all skill and attack-direction samples from validated bosses.", job: "Class", jobPickerTitle: "Choose a class to compare", jobPickerHelp: "Select a class mark to update the complete efficiency ranking immediately.", analysisScope: "Scope", jobOverallScope: "All class combat", jobOverallHelp: "Uses the complete collected combat sample without separate skill, level, or trait choices.",
      divineStats: "Divine stats", divineStatsHelp: "Shows the confirmed increase provided by each point.", growthPending: "Offensive link under verification", powerGrowth: "+0.1%p Attack per point", precisionGrowth: "+0.1%p Accuracy and Critical per point", justiceGrowth: "+0.2%p Perfect per point", freedomGrowth: "+0.2%p Accuracy per point", illusionGrowth: "−0.2%p Cooldown Time per point", timeGrowth: "+0.2%p Combat Speed per point", destructionGrowth: "+0.2%p Attack per point", deathGrowth: "+0.2%p Critical per point", wisdomGrowth: "+0.2%p Power Hit per point",
      attackStats: "Attack stats", attackStatsHelp: "Use copied stats to fill these automatically.", attack: "Base Attack", additionalAttack: "Additional Attack", minimumAttack: "Minimum Attack", maximumAttack: "Maximum Attack", criticalAttackPower: "Critical Attack Power", sealstoneAdditionalDamage: "Sealstone Additional Damage", power: "Power", vitality: "Vitality", agility: "Agility", knowledge: "Knowledge", precision: "Precision", will: "Will", justice: "Justice", freedom: "Freedom", illusion: "Illusion", life: "Life", time: "Time", destruction: "Destruction", death: "Death", wisdom: "Wisdom", destiny: "Destiny", space: "Space", accuracy: "Accuracy", weaponAccuracy: "Weapon Accuracy", pveAccuracy: "PVE Accuracy", critical: "Critical", defense: "Defense", armorDefense: "Armor Defense", penetration: "Penetration", pveAttack: "PVE Attack", bossAttack: "Boss Attack", frontAttack: "Front Attack", backAttack: "Back Attack", frontCritical: "Front Critical", backCritical: "Back Critical", percentStats: "Amplification and hit stats", percentStatsHelp: "Multi-hit uses 20% + displayed stat + trait to activate, then 50% + displayed stat for each continuation roll, up to 4 hits.", attackIncrease: "Attack Increase", accuracyIncrease: "Accuracy Increase", criticalIncrease: "Critical Increase", defenseIncrease: "Defense Increase", damageAmp: "Damage Amp", weaponAmp: "Weapon Damage Amp", pveAmp: "PVE Damage Amp", bossAmp: "Boss Damage Amp", criticalAmp: "Critical Damage Amp", additionalHit: "Multi-hit Accuracy", perfect: "Perfect", hardHit: "Power Hit", cooldownTime: "Cooldown Time", combatSpeed: "Combat Speed", frontAmp: "Front Damage Amp", backAmp: "Back Damage Amp",
      calculate: "Recalculate for my stats", calculating: "Calculating…", resultKicker: "FULL CLASS ANALYSIS", resultTitle: "Stat efficiency by unit", displayedStatsTitle: "Live stat simulation", displayedStatsHelp: "Change an input to update the final in-game totals from the copied baseline.", displayedAttack: "Total Attack", displayedAccuracy: "Total Accuracy", displayedCritical: "Total Critical", displayedDefense: "Total Defense", displayedCooldownTime: "Cooldown Time", displayedCombatSpeed: "Combat Speed", simulationReset: "Reset to copied stats", simulationDamage: "Estimated overall damage change", simulationWaiting: "Paste copied stats to start automatic calculation.", simulationCalculating: "Calculating the changed values.", simulationCollecting: "The selected class is still collecting validated samples; final stats were calculated normally.", simulationUnsupported: "This change is not independently validated, so no estimated damage is shown.", simulationReady: "Calculated across all class combat and validated bosses.", waitingTitle: "Validating samples for the selected class", waitingDescription: "Results unlock after the class and supported boss samples pass the public validation threshold.", resultGuide: "Only formula-validated results are shown. Do not directly compare +1, +10, and +1%p groups.", overviewSource: "Representative class samples", personalSource: "Your character stats", growthGroup: "DIVINE STATS · PER +1", attackGroup: "ATTACK VALUES · PER +10", judgmentGroup: "HIT VALUES · PER +10", percentGroup: "PERCENT STATS · PER +1%p", directionalGroup: "DIRECTIONAL EFFICIENCY · PER +1%p", directionalHelp: "Front and back both use the independent multiplier ×(1 + directional amp/100). The large value includes the class's observed directional damage share.", directionalOverall: "Whole-combat expectation", directionalOnHit: "Matching hit", directionalFormula: "Shared formula ×(1 + directional amp/100)", frontCondition: "Front hits only", backCondition: "Back hits only", observedDamageShare: "Observed damage share {share}%", detailRanking: "Efficiency by unit · {count} stats", easyTitle: "Quick start", easyOne: "Choose a class to see aggregate rankings without entering stats.", easyTwo: "For a personal result, copy your stats in NotMeter and paste them here.", easyThree: "Pasted stats calculate automatically and live changes are re-evaluated.", pending: "Unverified", low: "Low confidence", medium: "Medium confidence", high: "High confidence", invalid: "Check the entered values.", unavailable: "Could not reach the calculator. Try again shortly.",
      powerEffect: "Power +1", vitalityEffect: "Vitality +1", agilityEffect: "Agility +1", knowledgeEffect: "Knowledge +1", precisionEffect: "Precision +1", willEffect: "Will +1", justiceEffect: "Justice +1", freedomEffect: "Freedom +1", illusionEffect: "Illusion +1", lifeEffect: "Life +1", timeEffect: "Time +1", destructionEffect: "Destruction +1", deathEffect: "Death +1", wisdomEffect: "Wisdom +1", destinyEffect: "Destiny +1", spaceEffect: "Space +1", additionalAttackEffect: "Additional Attack +10", maximumAttackEffect: "Maximum Attack +10", criticalAttackPowerEffect: "Critical Attack Power +10", sealstoneAdditionalDamageEffect: "Sealstone Additional Damage +10", accuracyEffect: "Accuracy +10", pveAccuracyEffect: "PVE Accuracy +10", criticalEffect: "Critical +10", penetrationEffect: "Penetration +10", damageAmplificationEffect: "Damage Amp +1%p", weaponDamageAmplificationEffect: "Weapon Damage Amp +1%p", criticalDamageAmplificationEffect: "Critical Damage Amp +1%p", additionalHitAccuracyEffect: "Multi-hit Accuracy +1%p", perfectEffect: "Perfect +1%p", hardHitEffect: "Power Hit +1%p", cooldownTimeEffect: "Cooldown Time -1%p", combatSpeedEffect: "Combat Speed +1%p", pveAttackEffect: "PVE Attack +10", pveDamageAmplificationEffect: "PVE Damage Amp +1%p", bossAttackEffect: "Boss Attack +10", bossDamageAmplificationEffect: "Boss Damage Amp +1%p", frontAttackEffect: "Front Attack +10", backAttackEffect: "Back Attack +10", frontCriticalEffect: "Front Critical +10", backCriticalEffect: "Back Critical +10", frontDamageAmplificationEffect: "Front Damage Amp +1%p", backDamageAmplificationEffect: "Back Damage Amp +1%p",
	  attributeStats: "Element and target amps", waterAmp: "Water Damage Amp", fireAmp: "Fire Damage Amp", windAmp: "Wind Damage Amp", earthAmp: "Earth Damage Amp", holyAmp: "Holy Damage Amp", darkAmp: "Dark Damage Amp", allElementAmp: "All Element Amp", intellectAmp: "Intellect Damage Amp", feralAmp: "Feral Damage Amp", natureAmp: "Nature Damage Amp", transAmp: "Trans Damage Amp", waterDamageAmplificationEffect: "Water Damage Amp +1%p", fireDamageAmplificationEffect: "Fire Damage Amp +1%p", windDamageAmplificationEffect: "Wind Damage Amp +1%p", earthDamageAmplificationEffect: "Earth Damage Amp +1%p", holyDamageAmplificationEffect: "Holy Damage Amp +1%p", darkDamageAmplificationEffect: "Dark Damage Amp +1%p", allElementDamageAmplificationEffect: "All Element Amp +1%p", intellectDamageAmplificationEffect: "Intellect Damage Amp +1%p", feralDamageAmplificationEffect: "Feral Damage Amp +1%p", natureDamageAmplificationEffect: "Nature Damage Amp +1%p", transDamageAmplificationEffect: "Trans Damage Amp +1%p",
    },
    "zh-TW": {
	  minimumAttackEffect: "最小攻擊力 +10",
      guideTitle: "結果代表什麼？", guideDescription: "不用輸入屬性即可查看整體統計；貼上角色屬性後會自動調整為個人結果。", guideOverviewTitle: "未輸入屬性 · 職業統計", guideOverviewDescription: "依所選職業的真實代表樣本，立即顯示整體戰鬥效率排名。", guidePersonalTitle: "貼上屬性 · 個人調整", guidePersonalDescription: "套用目前攻擊、增幅與判定數值，自動改為適合目前角色的效率排名。",
      methodAria: "屬性效率計算方式", methodTitle: "如何計算？", methodDataTitle: "1. 收集實戰樣本", methodDataDescription: "僅使用在支援副本中，同時確認最終屬性、職業、技能、攻擊方向與首領狀態的傷害。", methodModelTitle: "2. 分離公式與樣本", methodModelDescription: "已驗證的傷害公式保持固定；樣本只用於驗證各職業的技能占比、方向占比與追加打擊傷害。", methodCompareTitle: "3. 重新計算提升前後", methodCompareDescription: "在相同條件下將各屬性調整 +1、+10 或 +1%p，比較預期首領傷害的變化。", methodValidationTitle: "4. 僅公開已驗證項目", methodValidationDescription: "屬性增幅、貫穿等尚未獨立確認公式的項目，不論樣本數量都會從排名排除。",
      inputWaitingTitle: "正在載入職業整體統計", inputWaitingDescription: "不輸入屬性也能查看職業彙總排名。", readyToCalculateTitle: "已套用角色屬性", readyToCalculateDescription: "排名會自動依目前角色重新計算。",
      title: "屬性效率計算器", subtitle: "比較哪一項提升最能強化目前角色。", importTitle: "貼上從 NotMeter 複製的角色屬性", importDescription: "在討伐紀錄上方按下「複製我的屬性」，再貼到下方即可自動填入目前角色的數值。", importPlaceholder: "點擊此處並按 Ctrl+V 貼上", importWaiting: "等待貼上已複製的屬性", importSuccess: "已自動填入 {count} 項屬性", importInvalid: "這不是從 NotMeter 複製的有效屬性", noticeTitle: "公式優先原則", notice: "不以樣本相關性建立係數；目前輸入無法精確分離的武器、屬性增幅與貫穿效果會保持隱藏。", heroKicker: "驗證公式＋實戰樣本", heroTitle: "確認職業整體戰鬥的成長優先順序", heroDescription: "固定公式計算屬性提升，樣本只提供各職業的技能與方向占比。", collecting: "正在收集樣本 · 準備中", ready: "可開始計算", samples: "{count} 筆樣本", samplesChecking: "正在確認樣本數", samplesUnavailable: "樣本數確認延遲", sourceOnly: "分析對象", deus: "受侵蝕的德烏斯研究基地（困難）", noiran: "諾伊蘭的隱藏遺產（第4階段）",
      combatProfile: "戰鬥條件", combatProfileHelp: "只需選擇職業，即可綜合通過驗證首領的全部技能與攻擊方向樣本。", job: "職業", jobPickerTitle: "選擇要比較的職業", jobPickerHelp: "點選職業圖示後會立即更新完整效率排名。", analysisScope: "分析範圍", jobOverallScope: "職業整體戰鬥", jobOverallHelp: "不需另外選擇技能、等級或特性，直接使用完整收集的戰鬥樣本。",
      divineStats: "主神屬性", divineStatsHelp: "同時顯示每 1 點已確認的提升效果。", growthPending: "攻擊連動效果確認中", powerGrowth: "每點攻擊力增加 +0.1%p", precisionGrowth: "每點命中與暴擊增加 +0.1%p", justiceGrowth: "每點完美 +0.2%p", freedomGrowth: "每點命中增加 +0.2%p", illusionGrowth: "每點再使用時間 −0.2%p", timeGrowth: "每點戰鬥速度 +0.2%p", destructionGrowth: "每點攻擊力增加 +0.2%p", deathGrowth: "每點暴擊增加 +0.2%p", wisdomGrowth: "每點強擊 +0.2%p",
      attackStats: "攻擊屬性", attackStatsHelp: "使用複製功能即可自動填入。", attack: "基礎攻擊力", additionalAttack: "追加攻擊力", minimumAttack: "最小攻擊力", maximumAttack: "最大攻擊力", criticalAttackPower: "暴擊攻擊力", sealstoneAdditionalDamage: "封魂石追加傷害", power: "威力", vitality: "體力", agility: "敏捷", knowledge: "知識", precision: "精準", will: "意志", justice: "正義", freedom: "自由", illusion: "幻象", life: "生命", time: "時間", destruction: "破壞", death: "死亡", wisdom: "智慧", destiny: "命運", space: "空間", accuracy: "命中", weaponAccuracy: "武器命中", pveAccuracy: "PVE 命中", critical: "暴擊", defense: "防禦力", armorDefense: "防具防禦力", penetration: "貫穿", pveAttack: "PVE 攻擊力", bossAttack: "首領攻擊力", frontAttack: "正面攻擊力", backAttack: "背面攻擊力", frontCritical: "正面暴擊", backCritical: "背面暴擊", percentStats: "增幅與判定屬性", percentStatsHelp: "多段命中以 20%＋面板值＋特化判定發動，再以 50%＋面板值連續判定，最多 4 段。", attackIncrease: "攻擊力增加率", accuracyIncrease: "命中增加率", criticalIncrease: "暴擊增加率", defenseIncrease: "防禦力增加率", damageAmp: "傷害增幅", weaponAmp: "武器傷害增幅", pveAmp: "PVE 傷害增幅", bossAmp: "首領傷害增幅", criticalAmp: "暴擊傷害增幅", additionalHit: "多段命中", perfect: "完美", hardHit: "強擊", cooldownTime: "再使用時間", combatSpeed: "戰鬥速度", frontAmp: "正面傷害增幅", backAmp: "後方傷害增幅",
      calculate: "依我的屬性重新計算", calculating: "計算中…", resultKicker: "職業整體分析", resultTitle: "依單位分類的屬性效率", displayedStatsTitle: "即時屬性模擬", displayedStatsHelp: "變更輸入值後，會從複製基準即時更新遊戲最終屬性。", displayedAttack: "最終攻擊力", displayedAccuracy: "最終命中", displayedCritical: "最終暴擊", displayedDefense: "最終防禦力", displayedCooldownTime: "再使用時間", displayedCombatSpeed: "戰鬥速度", simulationReset: "重設為複製基準", simulationDamage: "預估綜合傷害變化", simulationWaiting: "貼上複製的屬性後即可自動計算。", simulationCalculating: "正在計算變更後的數值。", simulationCollecting: "所選職業仍在收集驗證樣本，最終屬性已正常計算。", simulationUnsupported: "此變更尚未通過獨立驗證，因此不顯示預估傷害。", simulationReady: "已綜合職業整體戰鬥與通過驗證的首領。", waitingTitle: "正在收集所選職業的樣本", waitingDescription: "所選職業與足夠的支援首領通過高可信度驗證後才會顯示結果。", resultGuide: "只顯示公式驗證通過的結果；+1、+10、+1%p 不同單位不可直接比較。", overviewSource: "職業代表樣本基準", personalSource: "目前角色屬性基準", growthGroup: "主神屬性 · 每 +1", attackGroup: "攻擊數值 · 每 +10", judgmentGroup: "判定數值 · 每 +10", percentGroup: "百分比屬性 · 每 +1%p", directionalGroup: "攻擊方向效率 · 每 +1%p", directionalHelp: "正面與背面都使用 ×(1 + 方向增幅/100) 的獨立乘法。大字數值已包含職業實戰方向傷害占比。", directionalOverall: "整體戰鬥期望", directionalOnHit: "符合方向的單次命中", directionalFormula: "共同公式 ×(1 + 方向增幅/100)", frontCondition: "僅套用正面命中", backCondition: "僅套用背面命中", observedDamageShare: "實戰傷害占比 {share}%", detailRanking: "依單位分類的效率 · {count}項", easyTitle: "快速使用方法", easyOne: "選擇職業後，不需輸入屬性即可查看整體樣本統計。", easyTwo: "若要個人結果，請在 NotMeter 複製角色屬性後貼到這裡。", easyThree: "貼上後會自動計算，變更輸入值時也會即時重新調整。", pending: "尚未驗證", low: "低可信度", medium: "中可信度", high: "高可信度", invalid: "請確認輸入值。", unavailable: "無法連線至計算服務，請稍後再試。",
      powerEffect: "威力 +1", vitalityEffect: "體力 +1", agilityEffect: "敏捷 +1", knowledgeEffect: "知識 +1", precisionEffect: "精準 +1", willEffect: "意志 +1", justiceEffect: "正義 +1", freedomEffect: "自由 +1", illusionEffect: "幻象 +1", lifeEffect: "生命 +1", timeEffect: "時間 +1", destructionEffect: "破壞 +1", deathEffect: "死亡 +1", wisdomEffect: "智慧 +1", destinyEffect: "命運 +1", spaceEffect: "空間 +1", additionalAttackEffect: "追加攻擊力 +10", maximumAttackEffect: "最大攻擊力 +10", criticalAttackPowerEffect: "暴擊攻擊力 +10", sealstoneAdditionalDamageEffect: "封魂石追加傷害 +10", accuracyEffect: "命中 +10", pveAccuracyEffect: "PVE 命中 +10", criticalEffect: "暴擊 +10", penetrationEffect: "貫穿 +10", damageAmplificationEffect: "傷害增幅 +1%p", weaponDamageAmplificationEffect: "武器傷害增幅 +1%p", criticalDamageAmplificationEffect: "暴擊傷害增幅 +1%p", additionalHitAccuracyEffect: "多段命中 +1%p", perfectEffect: "完美 +1%p", hardHitEffect: "強擊 +1%p", cooldownTimeEffect: "再使用時間 -1%p", combatSpeedEffect: "戰鬥速度 +1%p", pveAttackEffect: "PVE 攻擊力 +10", pveDamageAmplificationEffect: "PVE 傷害增幅 +1%p", bossAttackEffect: "首領攻擊力 +10", bossDamageAmplificationEffect: "首領傷害增幅 +1%p", frontAttackEffect: "正面攻擊力 +10", backAttackEffect: "背面攻擊力 +10", frontCriticalEffect: "正面暴擊 +10", backCriticalEffect: "背面暴擊 +10", frontDamageAmplificationEffect: "正面傷害增幅 +1%p", backDamageAmplificationEffect: "後方傷害增幅 +1%p",
	  attributeStats: "屬性與目標增幅", waterAmp: "水屬性增幅", fireAmp: "火屬性增幅", windAmp: "風屬性增幅", earthAmp: "地屬性增幅", holyAmp: "神聖屬性增幅", darkAmp: "黑暗屬性增幅", allElementAmp: "所有屬性增幅", intellectAmp: "知性型傷害增幅", feralAmp: "野性型傷害增幅", natureAmp: "自然型傷害增幅", transAmp: "變異型傷害增幅", waterDamageAmplificationEffect: "水屬性增幅 +1%p", fireDamageAmplificationEffect: "火屬性增幅 +1%p", windDamageAmplificationEffect: "風屬性增幅 +1%p", earthDamageAmplificationEffect: "地屬性增幅 +1%p", holyDamageAmplificationEffect: "神聖屬性增幅 +1%p", darkDamageAmplificationEffect: "黑暗屬性增幅 +1%p", allElementDamageAmplificationEffect: "所有屬性增幅 +1%p", intellectDamageAmplificationEffect: "知性型傷害增幅 +1%p", feralDamageAmplificationEffect: "野性型傷害增幅 +1%p", natureDamageAmplificationEffect: "自然型傷害增幅 +1%p", transDamageAmplificationEffect: "變異型傷害增幅 +1%p",
    },
  };
  const EFFECT_KEYS = {
    power: "powerEffect", vitality: "vitalityEffect", agility: "agilityEffect", knowledge: "knowledgeEffect", precision: "precisionEffect", will: "willEffect", justice: "justiceEffect", freedom: "freedomEffect", illusion: "illusionEffect", life: "lifeEffect", time: "timeEffect", destruction: "destructionEffect", death: "deathEffect", wisdom: "wisdomEffect", destiny: "destinyEffect", space: "spaceEffect",
	additionalAttack: "additionalAttackEffect", minimumAttack: "minimumAttackEffect", maximumAttack: "maximumAttackEffect", criticalAttackPower: "criticalAttackPowerEffect", sealstoneAdditionalDamage: "sealstoneAdditionalDamageEffect",
    accuracy: "accuracyEffect", pveAccuracy: "pveAccuracyEffect", critical: "criticalEffect", penetration: "penetrationEffect",
    damageAmplification: "damageAmplificationEffect", weaponDamageAmplification: "weaponDamageAmplificationEffect",
    criticalDamageAmplification: "criticalDamageAmplificationEffect", additionalHitAccuracy: "additionalHitAccuracyEffect", perfect: "perfectEffect", hardHit: "hardHitEffect", cooldownTime: "cooldownTimeEffect", combatSpeed: "combatSpeedEffect",
    pveAttack: "pveAttackEffect", pveDamageAmplification: "pveDamageAmplificationEffect", bossAttack: "bossAttackEffect", bossDamageAmplification: "bossDamageAmplificationEffect", frontAttack: "frontAttackEffect", backAttack: "backAttackEffect", frontCritical: "frontCriticalEffect", backCritical: "backCriticalEffect", frontDamageAmplification: "frontDamageAmplificationEffect", backDamageAmplification: "backDamageAmplificationEffect",
	waterDamageAmplification: "waterDamageAmplificationEffect", fireDamageAmplification: "fireDamageAmplificationEffect", windDamageAmplification: "windDamageAmplificationEffect", earthDamageAmplification: "earthDamageAmplificationEffect", holyDamageAmplification: "holyDamageAmplificationEffect", darkDamageAmplification: "darkDamageAmplificationEffect", allElementDamageAmplification: "allElementDamageAmplificationEffect", intellectDamageAmplification: "intellectDamageAmplificationEffect", feralDamageAmplification: "feralDamageAmplificationEffect", natureDamageAmplification: "natureDamageAmplificationEffect", transDamageAmplification: "transDamageAmplificationEffect",
  };

  const state = {
    locale: resolveLocale(), catalog: null, catalogLoad: null, catalogLoadedAt: 0,
    catalogRefreshTimer: 0, catalogUnavailable: false, initialized: false,
    pendingJobName: "", emptyState: "input", lastResult: null, resultMode: "overview",
    simulationBaseline: null, simulationResult: null, simulationTimer: 0,
    simulationAbortController: null, simulationCache: new Map(), applyingStats: false,
  };
  const form = document.getElementById("efficiency-form");
  const jobSelect = document.getElementById("job");
  const jobPickerOptions = document.getElementById("result-job-options");
  const submitButton = form.querySelector("button[type=submit]");
  const importInput = document.getElementById("stat-import");
  const importStatus = document.getElementById("stat-import-status");

  function resolveLocale() {
    const documentLocale = document.documentElement.lang;
    if (LOCALES.includes(documentLocale)) return documentLocale;
    const stored = localStorage.getItem("notmeter-stats-locale");
    if (LOCALES.includes(stored)) return stored;
    const browser = String(navigator.language || "").toLowerCase();
    return browser.startsWith("zh") ? "zh-TW" : browser.startsWith("en") ? "en" : "ko";
  }

  function t(key, values = {}) {
    let text = TEXT[state.locale]?.[key] || TEXT.ko[key] || key;
    for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }

  function applyLocale() {
    surface.querySelectorAll("[data-stat-i18n]").forEach(element => {
      element.textContent = t(element.dataset.statI18n);
    });
    surface.querySelectorAll("[data-stat-i18n-placeholder]").forEach(element => {
      element.setAttribute("placeholder", t(element.dataset.statI18nPlaceholder));
    });
	surface.querySelectorAll("[data-stat-i18n-aria-label]").forEach(element => {
		element.setAttribute("aria-label", t(element.dataset.statI18nAriaLabel));
	});
    renderCatalog();
    if (state.catalog) setModelState(state.catalog.status, state.catalog.sampleCount);
    else setModelNotice(state.catalogUnavailable ? "samplesUnavailable" : "samplesChecking");
    if (state.simulationResult) renderSimulation(state.simulationResult);
    if (state.lastResult) renderResults(state.lastResult, state.resultMode);
    else if (state.emptyState) showEmptyState(state.emptyState);
  }

  function jobs() {
	if (!state.catalog?.jobs?.length) return FALLBACK_JOBS;
	return FALLBACK_JOBS.map(([fallbackKey, fallbackName]) => {
	  const match = state.catalog.jobs.find(job =>
		job.key === fallbackKey || job.name === fallbackName);
	  return match ? [match.key, match.name] : [fallbackKey, fallbackName];
	});
  }

  function renderCatalog() {
    const requestedJob = state.pendingJobName || jobSelect.value;
    jobSelect.replaceChildren(...jobs().map(([value, label]) => new Option(label, value)));
    const match = [...jobSelect.options].find(option =>
      option.value === requestedJob || option.textContent === requestedJob);
    if (match) jobSelect.value = match.value;
    if (state.pendingJobName && match) state.pendingJobName = "";
	renderJobPicker();
  }

  function renderJobPicker() {
	const selected = jobSelect.value;
	jobPickerOptions.replaceChildren(...jobs().map(([value, label]) => {
	  const hasResult = !state.catalog?.jobs?.length || state.catalog.jobs.some(job =>
		job.key === value || job.name === label);
	  const button = document.createElement("button");
	  button.type = "button";
	  button.className = `result-job-option${value === selected ? " is-selected" : ""}${hasResult ? "" : " is-collecting"}`;
	  button.dataset.job = value;
	  button.setAttribute("aria-label", label);
	  button.setAttribute("aria-pressed", String(value === selected));
	  button.title = label;
	  const icon = document.createElement("img");
	  icon.src = `./assets/jobs/${encodeURIComponent(label)}.png`;
	  icon.alt = "";
	  const name = document.createElement("span");
	  name.textContent = label;
	  button.append(icon, name);
	  return button;
	}));
  }

  function formatCount(value) { return new Intl.NumberFormat(state.locale).format(Number(value) || 0); }

  function setModelState(status, sampleCount) {
    const ready = status === "ready";
    document.getElementById("model-state").classList.toggle("ready", ready);
    document.getElementById("model-state-title").textContent = t(ready ? "ready" : "collecting");
    document.getElementById("model-sample-count").textContent = t("samples", { count: formatCount(sampleCount) });
  }

  function setModelNotice(messageKey) {
    document.getElementById("model-state").classList.remove("ready");
    document.getElementById("model-state-title").textContent = t("collecting");
    document.getElementById("model-sample-count").textContent = t(messageKey);
  }

  function loadCatalog(force = false) {
    if (state.catalogLoad) return state.catalogLoad;
    if (!force && state.catalog && Date.now() - state.catalogLoadedAt < CATALOG_REFRESH_MS) {
      return Promise.resolve(state.catalog);
    }
    const request = fetch(`${API_BASE}/catalog`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(response => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(catalog => {
        state.catalog = catalog;
        state.catalogUnavailable = false;
        state.catalogLoadedAt = Date.now();
        setModelState(catalog.status, catalog.sampleCount);
        renderCatalog();
        if (!state.simulationBaseline) renderCatalogOverview();
        return catalog;
      })
      .catch(() => {
        if (!state.catalog) {
          state.catalogUnavailable = true;
          setModelNotice("samplesUnavailable");
          renderCatalog();
        }
        return state.catalog;
      })
      .finally(() => {
        if (state.catalogLoad === request) state.catalogLoad = null;
      });
    state.catalogLoad = request;
    return state.catalogLoad;
  }

  function refreshCatalogWhenVisible() {
    if (document.visibilityState === "hidden" || surface.hidden) return;
    void loadCatalog(true);
  }

  function decodeClipboardProfile(text) {
    const trimmed = String(text || "").trim();
    let json = trimmed;
    if (trimmed.startsWith(CLIPBOARD_PREFIX)) {
      const encoded = trimmed.slice(CLIPBOARD_PREFIX.length);
      const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    }
    const profile = JSON.parse(json);
    if (!profile || profile.schema !== CLIPBOARD_SCHEMA || profile.version !== 4 ||
        typeof profile.jobName !== "string" || !profile.jobName.trim()) {
      throw new Error("invalid profile");
    }
    for (const field of PROFILE_FIELDS) {
	  if (profile[field] === undefined && EXTENDED_PROFILE_FIELDS.has(field)) profile[field] = 0;
      if (!Number.isFinite(Number(profile[field]))) throw new Error(`invalid ${field}`);
    }
    if (!Array.isArray(profile.skills) || profile.skills.some(skill =>
        !Number.isInteger(Number(skill?.code)) || Number(skill.code) <= 0 ||
        !Number.isInteger(Number(skill?.level)) || Number(skill.level) <= 0 ||
        !["active", "stigma", "passive"].includes(String(skill?.category)))) {
      throw new Error("invalid skills");
    }
    return profile;
  }

  function displayNumber(value) {
    const number = Number(value);
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100);
  }

  function applyClipboardProfile(text) {
    try {
      const profile = decodeClipboardProfile(text);
      state.pendingJobName = profile.jobName.trim();
      renderCatalog();
      let filled = 0;
      state.applyingStats = true;
      for (const field of PROFILE_FIELDS) {
        const input = form.elements.namedItem(field);
        if (!(input instanceof HTMLInputElement)) continue;
        input.value = displayNumber(profile[field]);
		input.setCustomValidity("");
        filled++;
      }
      state.applyingStats = false;
      importInput.value = "";
      importStatus.className = "stat-import-status success";
      importStatus.textContent = t("importSuccess", { count: filled });
      form.classList.remove("was-submitted");
      form.classList.add("stats-imported");
      window.setTimeout(() => form.classList.remove("stats-imported"), 900);
	  establishSimulationBaseline();
      showEmptyState("ready");
      window.setTimeout(() => form.requestSubmit(), 0);
      return true;
    } catch {
      state.applyingStats = false;
      importStatus.className = "stat-import-status error";
      importStatus.textContent = t("importInvalid");
      return false;
    }
  }

  function number(formData, key) {
    const value = Number(formData.get(key));
    return Number.isFinite(value) ? value : 0;
  }

  function requestPayload() {
    const data = new FormData(form);
    return {
      jobName: String(data.get("jobName") || ""), targetType: "boss", targetKey: "all", direction: "none",
      attack: number(data, "attack"), additionalAttack: number(data, "additionalAttack"), minimumAttack: number(data, "minimumAttack"), maximumAttack: number(data, "maximumAttack"), attackIncreasePercent: number(data, "attackIncreasePercent"), criticalAttackPower: number(data, "criticalAttackPower"), sealstoneAdditionalDamage: number(data, "sealstoneAdditionalDamage"), power: number(data, "power"), vitality: number(data, "vitality"), agility: number(data, "agility"), knowledge: number(data, "knowledge"), precision: number(data, "precision"), will: number(data, "will"), justice: number(data, "justice"), freedom: number(data, "freedom"), illusion: number(data, "illusion"), life: number(data, "life"), time: number(data, "time"), destruction: number(data, "destruction"), death: number(data, "death"), wisdom: number(data, "wisdom"), destiny: number(data, "destiny"), space: number(data, "space"),
      accuracy: number(data, "accuracy"), weaponAccuracy: number(data, "weaponAccuracy"), accuracyIncreasePercent: number(data, "accuracyIncreasePercent"), pveAccuracy: number(data, "pveAccuracy"), critical: number(data, "critical"), criticalIncreasePercent: number(data, "criticalIncreasePercent"), defense: number(data, "defense"), armorDefense: number(data, "armorDefense"), defenseIncreasePercent: number(data, "defenseIncreasePercent"), penetration: number(data, "penetration"), pveAttack: number(data, "pveAttack"), bossAttack: number(data, "bossAttack"), frontAttack: number(data, "frontAttack"), backAttack: number(data, "backAttack"), frontCritical: number(data, "frontCritical"), backCritical: number(data, "backCritical"),
      damageAmplificationPercent: number(data, "damageAmplificationPercent"), weaponDamageAmplificationPercent: number(data, "weaponDamageAmplificationPercent"), pveDamageAmplificationPercent: number(data, "pveDamageAmplificationPercent"), bossDamageAmplificationPercent: number(data, "bossDamageAmplificationPercent"), criticalDamageAmplificationPercent: number(data, "criticalDamageAmplificationPercent"), additionalHitAccuracyPercent: number(data, "additionalHitAccuracyPercent"), perfectPercent: number(data, "perfectPercent"), hardHitPercent: number(data, "hardHitPercent"), cooldownTimePercent: number(data, "cooldownTimePercent"), combatSpeedPercent: number(data, "combatSpeedPercent"), frontDamageAmplificationPercent: number(data, "frontDamageAmplificationPercent"), backDamageAmplificationPercent: number(data, "backDamageAmplificationPercent"),
	  waterDamageAmplificationPercent: number(data, "waterDamageAmplificationPercent"), fireDamageAmplificationPercent: number(data, "fireDamageAmplificationPercent"), windDamageAmplificationPercent: number(data, "windDamageAmplificationPercent"), earthDamageAmplificationPercent: number(data, "earthDamageAmplificationPercent"), holyDamageAmplificationPercent: number(data, "holyDamageAmplificationPercent"), darkDamageAmplificationPercent: number(data, "darkDamageAmplificationPercent"), intellectDamageAmplificationPercent: number(data, "intellectDamageAmplificationPercent"), feralDamageAmplificationPercent: number(data, "feralDamageAmplificationPercent"), natureDamageAmplificationPercent: number(data, "natureDamageAmplificationPercent"), transDamageAmplificationPercent: number(data, "transDamageAmplificationPercent"),
      skillCode: 0, skillLevel: 0, specializationMask: 0, passives: [],
    };
  }

  function showEmptyState(kind) {
	state.emptyState = kind;
	state.lastResult = null;
	const copy = kind === "ready"
		? ["readyToCalculateTitle", "readyToCalculateDescription"]
		: kind === "collecting"
			? ["waitingTitle", "waitingDescription"]
			: ["inputWaitingTitle", "inputWaitingDescription"];
	const empty = document.getElementById("result-empty");
	empty.querySelector("strong").textContent = t(copy[0]);
	empty.querySelector("p").textContent = t(copy[1]);
	empty.hidden = false;
    document.getElementById("result-list").hidden = true;
    document.getElementById("result-summary").hidden = true;
    document.getElementById("result-directional").hidden = true;
    document.getElementById("result-details").hidden = true;
    document.getElementById("result-source").textContent = t(
      state.simulationBaseline ? "personalSource" : "overviewSource");
    document.getElementById("confidence").className = "confidence pending";
    document.getElementById("confidence").textContent = t("pending");
    document.getElementById("formula-version").textContent = "—";
  }

  function renderCatalogOverview() {
    if (!state.catalog || state.catalog.status !== "ready") {
      showCollecting();
      return false;
    }
    const selected = state.catalog.jobs?.find(job =>
      job.key === jobSelect.value || job.name === jobSelect.value);
    if (!selected || !Array.isArray(selected.effects) || selected.effects.length === 0) {
      showCollecting({ sampleCount: state.catalog.sampleCount, formulaVersion: state.catalog.formulaVersion });
      return false;
    }
    renderResults({
      status: "ready",
      sampleCount: state.catalog.sampleCount,
      formulaVersion: selected.formulaVersion || state.catalog.formulaVersion,
      confidence: selected.confidence || "medium",
      effects: selected.effects,
    }, "overview");
    return true;
  }

  function showCollecting(result) {
	if (!state.simulationBaseline) renderDisplayedStats(result?.displayedStats);
    const sampleCount = result?.sampleCount ?? state.catalog?.sampleCount;
    if (sampleCount === undefined) {
      setModelNotice(state.catalogUnavailable ? "samplesUnavailable" : "samplesChecking");
    } else {
      setModelState(state.catalog?.status || "collecting", sampleCount);
    }
    showEmptyState("collecting");
    document.getElementById("formula-version").textContent = result?.formulaVersion || "—";
  }

  function validDisplayedStats(stats) {
    return Boolean(stats) && DISPLAYED_STAT_FIELDS.every(([key, percent]) => {
      const value = Number(stats[key]);
      return percent
        ? Number.isFinite(value)
        : Number.isSafeInteger(value) && value >= 0;
    });
  }

  function formatDisplayedValue(value, percent) {
    return percent ? `${displayNumber(value)}%` : formatCount(value);
  }

  function renderDisplayedStats(stats, baselineStats = null) {
	const panel = document.getElementById("displayed-stats");
	if (!validDisplayedStats(stats)) {
		panel.hidden = true;
		return;
	}
	const hasBaseline = validDisplayedStats(baselineStats);
	for (const [key, percent] of DISPLAYED_STAT_FIELDS) {
      const candidate = Number(stats[key]);
      const baseline = hasBaseline ? Number(baselineStats[key]) : candidate;
      const delta = Math.round((candidate - baseline) * 100) / 100;
      document.getElementById(`displayed-${key}`).textContent = delta
        ? `${formatDisplayedValue(baseline, percent)} → ${formatDisplayedValue(candidate, percent)}`
        : formatDisplayedValue(candidate, percent);
      const deltaElement = document.getElementById(`displayed-${key}-delta`);
      deltaElement.textContent = delta
        ? `${delta > 0 ? "+" : ""}${displayNumber(delta)}${percent ? "%p" : ""}`
        : "";
      deltaElement.className = delta > 0 ? "positive" : delta < 0 ? "negative" : "";
	}
    document.getElementById("simulation-reset").hidden = !state.simulationBaseline;
	panel.hidden = false;
  }

  function renderSimulation(result) {
    state.simulationResult = result;
    renderDisplayedStats(result?.candidateDisplayedStats, result?.baselineDisplayedStats);
    const gain = document.getElementById("simulation-damage-gain");
    const description = document.getElementById("simulation-damage-state");
    const gainPercent = Number(result?.gainPercent);
    if (result?.status === "ready" && Number.isFinite(gainPercent)) {
      gain.textContent = `${gainPercent > 0 ? "+" : ""}${gainPercent.toFixed(4)}%`;
      gain.className = gainPercent > 0 ? "positive" : gainPercent < 0 ? "negative" : "";
      description.textContent = t("simulationReady");
      return;
    }
    gain.textContent = "—";
    gain.className = "";
    description.textContent = result?.status === "calculating"
      ? t("simulationCalculating")
	  : result?.status === "unsupported"
		? t("simulationUnsupported")
        : t("simulationCollecting");
  }

  function clonePayload(payload) {
    return JSON.parse(JSON.stringify(payload));
  }

  function establishSimulationBaseline() {
    if (!form.checkValidity()) return false;
    window.clearTimeout(state.simulationTimer);
    state.simulationAbortController?.abort();
    state.simulationBaseline = clonePayload(requestPayload());
    state.simulationResult = null;
    state.simulationCache.clear();
    scheduleSimulation(true);
    return true;
  }

  function scheduleSimulation(immediate = false) {
    if (!state.simulationBaseline || !form.checkValidity()) return;
    window.clearTimeout(state.simulationTimer);
    state.simulationAbortController?.abort();
    state.simulationAbortController = null;
    renderSimulation({
      status: "calculating",
      baselineDisplayedStats: state.simulationResult?.baselineDisplayedStats,
      candidateDisplayedStats: state.simulationResult?.candidateDisplayedStats,
    });
    state.simulationTimer = window.setTimeout(
      () => void runSimulation(),
      immediate ? 0 : SIMULATION_DEBOUNCE_MS);
  }

  async function runSimulation() {
    if (!state.simulationBaseline || !form.checkValidity()) return;
    const payload = {
      baseline: state.simulationBaseline,
      candidate: requestPayload(),
    };
    const cacheKey = JSON.stringify(payload);
    const cached = state.simulationCache.get(cacheKey);
    if (cached) {
      renderSimulation(cached);
      return;
    }

    state.simulationAbortController?.abort();
    const controller = new AbortController();
    state.simulationAbortController = controller;
    try {
      const response = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.status === "invalid") throw new Error("invalid simulation");
      state.simulationCache.set(cacheKey, result);
      if (state.simulationCache.size > SIMULATION_CACHE_LIMIT) {
        state.simulationCache.delete(state.simulationCache.keys().next().value);
      }
      renderSimulation(result);
    } catch (failure) {
      if (failure?.name === "AbortError") return;
      const previous = state.simulationResult;
      renderSimulation({
        status: "collecting",
        baselineDisplayedStats: previous?.baselineDisplayedStats,
        candidateDisplayedStats: previous?.candidateDisplayedStats,
      });
    } finally {
      if (state.simulationAbortController === controller) state.simulationAbortController = null;
    }
  }

  function resetSimulation() {
    if (!state.simulationBaseline) return;
    state.applyingStats = true;
    for (const field of PROFILE_FIELDS) {
      const input = form.elements.namedItem(field);
      if (input instanceof HTMLInputElement) {
        input.value = displayNumber(state.simulationBaseline[field]);
        input.setCustomValidity("");
      }
    }
    state.applyingStats = false;
    scheduleSimulation(true);
  }

  function installStatStepControls() {
    for (const field of PROFILE_FIELDS) {
      const input = form.elements.namedItem(field);
	  if (!(input instanceof HTMLInputElement) || input.type === "hidden" ||
		  input.parentElement?.classList.contains("stat-input-control")) continue;
      const control = document.createElement("div");
      control.className = "stat-input-control";
      const decrement = document.createElement("button");
      decrement.type = "button";
      decrement.className = "stat-step-button";
      decrement.dataset.delta = "-1";
      decrement.setAttribute("aria-label", `${field} -1`);
      decrement.textContent = "−";
      const increment = document.createElement("button");
      increment.type = "button";
      increment.className = "stat-step-button";
      increment.dataset.delta = "1";
      increment.setAttribute("aria-label", `${field} +1`);
      increment.textContent = "+";
      input.before(control);
      control.append(decrement, input, increment);
    }
  }

  function changeStatBy(input, delta) {
    if (!state.simulationBaseline && form.checkValidity()) {
      state.simulationBaseline = clonePayload(requestPayload());
      state.simulationCache.clear();
    }
    const minimum = input.min === "" ? -Infinity : Number(input.min);
    const maximum = input.max === "" ? Infinity : Number(input.max);
    const current = Number(input.value);
    if (!Number.isFinite(current)) return;
    input.value = displayNumber(Math.min(maximum, Math.max(minimum, current + delta)));
    input.setCustomValidity("");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function renderResults(result, mode = "personal") {
    if (result.status !== "ready") { showCollecting(result); return; }
	state.emptyState = "";
	state.lastResult = result;
	state.resultMode = mode;
	if (!state.simulationBaseline) renderDisplayedStats(result.displayedStats);
    setModelState("ready", result.sampleCount);
    const list = document.getElementById("result-list");
	const effects = Array.isArray(result.effects)
		? result.effects.filter(effect =>
			!HIDDEN_EFFECTS.has(effect.key) && Number(effect.gainPercent) > 0)
		: [];
	const rankedEffects = effects.filter(effect => !DIRECTIONAL_EFFECTS.includes(effect.key));
	const groups = [
		["growthGroup", rankedEffects.filter(effect => GROWTH_EFFECTS.has(effect.key))],
		["attackGroup", rankedEffects.filter(effect => ATTACK_VALUE_EFFECTS.has(effect.key))],
		["judgmentGroup", rankedEffects.filter(effect => JUDGMENT_VALUE_EFFECTS.has(effect.key))],
		["percentGroup", rankedEffects.filter(effect => !GROWTH_EFFECTS.has(effect.key) && !ATTACK_VALUE_EFFECTS.has(effect.key) && !JUDGMENT_VALUE_EFFECTS.has(effect.key))],
	].filter(([, items]) => items.length);
	list.replaceChildren(...groups.map(([titleKey, items]) => {
		const group = document.createElement("section"); group.className = "result-group";
		const title = document.createElement("h4"); title.className = "result-group-title"; title.textContent = t(titleKey);
		group.append(title, ...items.map((effect, index) => {
			const row = document.createElement("div"); row.className = `result-row${index === 0 ? " is-top" : ""}`;
			const rank = document.createElement("span"); rank.className = "result-rank"; rank.textContent = String(index + 1);
			const name = document.createElement("span"); name.className = "result-name"; name.textContent = t(EFFECT_KEYS[effect.key] || effect.key);
			const gain = document.createElement("strong"); gain.className = "result-gain"; gain.textContent = `+${Number(effect.gainPercent).toFixed(4)}%`;
			row.append(rank, name, gain);
			return row;
		}));
		return group;
	}));
    const summary = document.getElementById("result-summary");
    summary.replaceChildren(...groups.map(([titleKey, items]) => {
      const effect = items[0];
      const card = document.createElement("div"); card.className = "result-summary-card";
      const category = document.createElement("span"); category.textContent = t(titleKey);
      const name = document.createElement("strong"); name.textContent = t(EFFECT_KEYS[effect.key] || effect.key);
      const gain = document.createElement("b"); gain.textContent = `+${Number(effect.gainPercent).toFixed(4)}%`;
      card.append(category, name, gain);
      return card;
    }));
    summary.hidden = groups.length === 0;
	const directional = document.getElementById("result-directional");
	const directionalItems = DIRECTIONAL_EFFECTS
		.map(key => effects.find(effect => effect.key === key))
		.filter(Boolean);
	const selectedCatalogJob = state.catalog?.jobs?.find(job =>
		job.key === jobSelect.value || job.name === jobSelect.value);
	directional.replaceChildren();
	if (directionalItems.length) {
		const heading = document.createElement("div"); heading.className = "result-directional-heading";
		const headingText = document.createElement("strong"); headingText.textContent = t("directionalGroup");
		const headingHelp = document.createElement("span"); headingHelp.textContent = t("directionalHelp");
		heading.append(headingText, headingHelp);
		const grid = document.createElement("div"); grid.className = "result-directional-grid";
		grid.append(...directionalItems.map(effect => {
			const card = document.createElement("article"); card.className = "result-directional-card";
			const name = document.createElement("span"); name.textContent = t(EFFECT_KEYS[effect.key] || effect.key);
			const overallLabel = document.createElement("small");
			overallLabel.className = "result-directional-overall";
			overallLabel.textContent = t("directionalOverall");
			const gain = document.createElement("strong"); gain.textContent = `+${Number(effect.gainPercent).toFixed(4)}%`;
			const condition = document.createElement("small");
			const isFront = effect.key === "frontDamageAmplification";
			const conditionText = t(isFront ? "frontCondition" : "backCondition");
			const share = Number(selectedCatalogJob?.[
				isFront ? "frontDirectionSharePercent" : "backDirectionSharePercent"]);
			const conditionalGain = Number(effect.conditionalGainPercent);
			const matchingHit = Number.isFinite(conditionalGain)
				? `${t("directionalOnHit")} +${conditionalGain.toFixed(4)}%`
				: conditionText;
			condition.textContent = Number.isFinite(share)
				? `${matchingHit} · ${t("observedDamageShare", { share: displayNumber(share) })}`
				: matchingHit;
			const formula = document.createElement("small");
			formula.className = "result-directional-formula";
			formula.textContent = t("directionalFormula");
			card.append(name, overallLabel, gain, condition, formula);
			return card;
		}));
		directional.append(heading, grid);
	}
	directional.hidden = directionalItems.length === 0;
    const details = document.getElementById("result-details");
    details.hidden = effects.length === 0;
    details.open = true;
    document.getElementById("result-details-label").textContent = t("detailRanking", { count: effects.length });
    document.getElementById("result-empty").hidden = true;
    list.hidden = false;
    document.getElementById("result-source").textContent = t(
      mode === "overview" ? "overviewSource" : "personalSource");
    const confidence = document.getElementById("confidence");
    confidence.className = `confidence ${result.confidence}`;
    confidence.textContent = t(result.confidence);
    document.getElementById("formula-version").textContent = result.formulaVersion || "—";
  }

  async function submit(event) {
    event.preventDefault();
    const error = document.getElementById("form-error");
    error.hidden = true;
    form.classList.add("was-submitted");
    if (!form.reportValidity()) {
      renderCatalogOverview();
      return;
    }
    if (!state.simulationBaseline) establishSimulationBaseline();
    submitButton.disabled = true;
    submitButton.textContent = t("calculating");
    try {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(requestPayload()),
      });
      const result = await response.json();
      if (!response.ok || result.status === "invalid") throw new Error(t("invalid"));
      renderResults(result);
    } catch (failure) {
      error.textContent = failure instanceof Error && failure.message ? failure.message : t("unavailable");
      if (!error.textContent || /^\d+$/.test(error.textContent)) error.textContent = t("unavailable");
      error.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = t("calculate");
    }
  }

  function bind() {
    if (state.initialized) return;
    state.initialized = true;
    installStatStepControls();
    form.addEventListener("submit", submit);
    jobSelect.addEventListener("change", () => {
	  renderJobPicker();
	  if (state.simulationBaseline && form.checkValidity()) form.requestSubmit();
	  else renderCatalogOverview();
    });
	jobPickerOptions.addEventListener("click", event => {
	  const button = event.target instanceof Element
		? event.target.closest(".result-job-option")
		: null;
	  if (!button || !jobPickerOptions.contains(button) || button.dataset.job === jobSelect.value) return;
	  jobSelect.value = button.dataset.job || "";
	  jobSelect.dispatchEvent(new Event("change", { bubbles: true }));
	});
    form.addEventListener("input", event => {
      if (state.applyingStats || !(event.target instanceof HTMLInputElement) ||
          !PROFILE_FIELDS.includes(event.target.name)) return;
      if (!state.simulationBaseline) {
        if (form.checkValidity()) {
          establishSimulationBaseline();
          showEmptyState("ready");
        }
        return;
      }
      scheduleSimulation();
    });
    form.addEventListener("change", event => {
      if (state.applyingStats ||
          (event.target instanceof HTMLInputElement && PROFILE_FIELDS.includes(event.target.name))) return;
      if (form.checkValidity()) establishSimulationBaseline();
    });
    form.addEventListener("click", event => {
      const button = event.target instanceof Element
        ? event.target.closest(".stat-step-button")
        : null;
      if (!button || !form.contains(button)) return;
      const input = button.parentElement?.querySelector("input[type=number]");
      if (input instanceof HTMLInputElement) changeStatBy(input, Number(button.dataset.delta));
    });
    document.getElementById("simulation-reset").addEventListener("click", resetSimulation);
    surface.addEventListener("paste", event => {
      const text = event.clipboardData?.getData("text/plain") || "";
      if (!text.trim().startsWith(CLIPBOARD_PREFIX) && event.target !== importInput) return;
      event.preventDefault();
      applyClipboardProfile(text);
    });
    importInput.addEventListener("input", () => {
      const value = importInput.value.trim();
      if (value.startsWith(CLIPBOARD_PREFIX) || value.startsWith("{")) applyClipboardProfile(value);
    });
    document.addEventListener("visibilitychange", refreshCatalogWhenVisible);
    state.catalogRefreshTimer = window.setInterval(
      refreshCatalogWhenVisible,
      CATALOG_REFRESH_MS);
    showEmptyState("input");
  }

  function activate() {
    bind();
    applyLocale();
    void loadCatalog();
    window.setTimeout(() => importInput.focus({ preventScroll: true }), 0);
  }

  function setLocale(locale) {
    state.locale = LOCALES.includes(locale) ? locale : "ko";
    if (state.initialized) applyLocale();
  }

  window.NotMeterStatEfficiency = { activate, setLocale, applyClipboardProfile };
})();
