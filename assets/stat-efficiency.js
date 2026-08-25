(() => {
  "use strict";

  const surface = document.getElementById("stat-efficiency-surface");
  if (!surface) return;

  const API_URL = "https://notmeter.112-168-140-142.sslip.io/stat-efficiency/v1/calculate";
  const CLIPBOARD_PREFIX = "NOTMETER_STATS_V4:";
  const CLIPBOARD_SCHEMA = "notmeter-stat-efficiency-profile-v4";
  const REQUEST_TIMEOUT_MS = 12_000;
  const RECALCULATE_DELAY_MS = 180;
  const BASELINE_INPUTS = [
    "power", "destruction", "justice", "wisdom",
    "attack", "additionalAttack", "minimumAttack", "maximumAttack",
    "pveAttack", "bossAttack", "attackIncreasePercent",
    "damageAmplificationPercent", "weaponDamageAmplificationPercent",
    "pveDamageAmplificationPercent", "bossDamageAmplificationPercent",
    "criticalDamageAmplificationPercent", "perfectPercent", "hardHitPercent",
    "frontDamageAmplificationPercent", "backDamageAmplificationPercent",
  ];
  const EFFECT_GROUPS = [
    ["point", "주신 스탯 · +1"],
    ["flat", "공격 수치 · +10"],
    ["percentPoint", "증폭·판정 · +1%p"],
  ];
  const EFFECT_NAMES = {
    power: "위력", destruction: "파괴", justice: "정의", wisdom: "지혜",
    attack: "공격력", additionalAttack: "추가 공격력", minimumAttack: "최소 공격력",
    maximumAttack: "최대 공격력", pveAttack: "PVE 공격력", bossAttack: "보스 공격력",
    attackIncrease: "공격력 증가율", damageAmplification: "피해 증폭",
    weaponDamageAmplification: "무기 피해 증폭", pveDamageAmplification: "PVE 피해 증폭",
    bossDamageAmplification: "보스 피해 증폭", criticalDamageAmplification: "치명타 피해 증폭",
    perfect: "완벽", hardHit: "강타", frontDamageAmplification: "전방 피해 증폭",
    backDamageAmplification: "후방 피해 증폭",
  };
  const TEXT = {
    ko: {
      title: "스탯 효율 계산기", subtitle: "옵션 수치를 바꾸는 즉시 현재 스탯과 비교해 피해 상승량을 보여줍니다.",
      importTitle: "딜미터기에서 복사한 내 스탯 붙여넣기",
      importDescription: "‘내 스탯 복사’ 값을 붙여넣으면 현재 스탯이 채워지고 바로 계산됩니다.",
      importPlaceholder: "여기를 누르고 Ctrl+V로 붙여넣기", importWaiting: "복사한 값을 기다리고 있습니다",
      importSuccess: "{job} · 피해 계산 스탯 {count}개 입력 완료", importInvalid: "딜미터기에서 복사한 유효한 스탯 값이 아닙니다.",
      noticeTitle: "실시간 계산", notice: "계산 버튼 없이 모든 입력을 즉시 반영합니다. 입력 도중에는 이전 요청을 취소하고 마지막 값만 표시합니다.",
      optionTitle: "비교할 옵션 증가량", optionHelp: "장비를 바꿨을 때 늘어나는 값만 입력하세요. 음수도 입력할 수 있습니다.",
      currentDetails: "현재 스탯 상세 보기 · 필요할 때만 펼치세요", divineStats: "피해 연동 주신 스탯",
      divineStatsHelp: "복사한 값에서 올리면 증가분이 자동으로 옵션 비교에 합산됩니다.",
      power: "위력", destruction: "파괴", justice: "정의", wisdom: "지혜",
      powerGrowth: "1당 공격력 증가 +0.1%p", destructionGrowth: "1당 공격력 증가 +0.2%p",
      justiceGrowth: "1당 완벽 +0.2%p", wisdomGrowth: "1당 강타 +0.2%p",
      attackStats: "현재 공격 수치", attackStatsHelp: "복사 기능을 사용하면 자동 입력됩니다.",
      attack: "공격력", additionalAttack: "추가 공격력", minimumAttack: "최소 공격력", maximumAttack: "최대 공격력",
      pveAttack: "PVE 공격력", bossAttack: "보스 공격력", percentStats: "현재 피해 증폭·판정",
      percentStatsHelp: "현재 캐릭터 창에 표시된 값을 입력합니다.", attackIncrease: "공격력 증가율",
      damageAmp: "피해 증폭", weaponDamageAmp: "무기 피해 증폭", pveAmp: "PVE 피해 증폭", bossAmp: "보스 피해 증폭",
      criticalDamageAmp: "치명타 피해 증폭", perfect: "완벽", hardHit: "강타",
      frontAmp: "전방 피해 증폭", backAmp: "후방 피해 증폭",
      combatAssumptions: "전투 조건", combatAssumptionsHelp: "공격 방향과 기대 판정에 사용됩니다.",
      criticalChance: "치명타 발동률", partyHardHit: "파티 강타 버프", bossHardHitResistance: "보스 강타 저항",
      attackType: "공격 방향", attackNone: "방향 적용 안 함", attackFront: "전방", attackBack: "후방",
      frontRate: "전방 공격 비율", backRate: "후방 공격 비율",
      deltaBaseAttack: "추가 공격력", deltaGearAttack: "공격력", deltaMaxAttack: "최대 공격력",
      deltaPveAttack: "PVE 공격력", deltaBossAttack: "보스 공격력", deltaAttackIncrease: "공격력 증가율",
      deltaDamageAmp: "피해 증폭", deltaWeaponAmp: "무기 피해 증폭", deltaCriticalAmp: "치명타 피해 증폭",
      deltaPerfect: "완벽", deltaHardHit: "강타", deltaFrontAmp: "전방 피해 증폭", deltaBackAmp: "후방 피해 증폭",
      resultKicker: "실시간 옵션 비교", resultTitle: "예상 피해 변화", waitingTitle: "내 스탯을 붙여넣어 주세요",
      waitingDescription: "붙여넣은 뒤 옵션 증가량을 바꾸면 결과가 같은 위치에서 즉시 갱신됩니다.",
      resultGuide: "결과는 현재값 대비 선택한 옵션 증가량의 기대값입니다.",
      ready: "자동 계산 완료", calculating: "자동 계산 중", source: "{job} · 마지막 입력 반영",
      invalid: "공격력·최소/최대 공격력 값을 확인해 주세요.", unavailable: "계산 서버에 연결하지 못했습니다. 자동으로 다시 계산합니다.",
      statWindowAttack: "게임 표시 공격력", effectiveAttack: "보스 유효 공격력", expectedDamage: "기대 피해 지수",
      damageGain: "예상 피해 상승", before: "현재", after: "변경", quickCompare: "스탯별 기본 증가량 비교",
    },
    en: {
      title: "Stat Efficiency Calculator", subtitle: "Every edit instantly compares the selected option against your current stats.",
      importTitle: "Paste stats copied from NotMeter", importDescription: "Paste Copy My Stats to fill the baseline and calculate immediately.",
      importPlaceholder: "Click here and press Ctrl+V", importWaiting: "Waiting for copied stats",
      importSuccess: "{job} · Filled {count} damage stats", importInvalid: "This is not a valid NotMeter stat copy.",
      noticeTitle: "Live calculation", notice: "There is no calculate button. Older requests are cancelled and only the latest input is shown.",
      optionTitle: "Option increase to compare", optionHelp: "Enter only the values gained by changing gear. Negative values are allowed.",
      currentDetails: "Current stat details · expand only when needed", divineStats: "Damage-linked divine stats",
      divineStatsHelp: "Changes from the copied baseline are added to the option delta.", power: "Power", destruction: "Destruction",
      justice: "Justice", wisdom: "Wisdom", powerGrowth: "+0.1%p Attack Increase per point",
      destructionGrowth: "+0.2%p Attack Increase per point", justiceGrowth: "+0.2%p Perfect per point", wisdomGrowth: "+0.2%p Hard Hit per point",
      attackStats: "Current attack values", attackStatsHelp: "Filled automatically by Copy My Stats.", attack: "Attack",
      additionalAttack: "Additional Attack", minimumAttack: "Minimum Attack", maximumAttack: "Maximum Attack", pveAttack: "PVE Attack", bossAttack: "Boss Attack",
      percentStats: "Current amplification and rolls", percentStatsHelp: "Enter the values shown in the character window.", attackIncrease: "Attack Increase",
      damageAmp: "Damage Amplification", weaponDamageAmp: "Weapon Damage Amplification", pveAmp: "PVE Damage Amplification", bossAmp: "Boss Damage Amplification",
      criticalDamageAmp: "Critical Damage Amplification", perfect: "Perfect", hardHit: "Hard Hit", frontAmp: "Front Damage Amplification", backAmp: "Back Damage Amplification",
      combatAssumptions: "Combat conditions", combatAssumptionsHelp: "Used for direction and expected proc damage.", criticalChance: "Critical proc rate",
      partyHardHit: "Party Hard Hit buff", bossHardHitResistance: "Boss Hard Hit resistance", attackType: "Attack direction",
      attackNone: "No direction", attackFront: "Front", attackBack: "Back", frontRate: "Front attack rate", backRate: "Back attack rate",
      deltaBaseAttack: "Additional Attack", deltaGearAttack: "Attack", deltaMaxAttack: "Max Attack", deltaPveAttack: "PVE Attack", deltaBossAttack: "Boss Attack",
      deltaAttackIncrease: "Attack Increase", deltaDamageAmp: "Damage Amplification", deltaWeaponAmp: "Weapon Damage Amplification",
      deltaCriticalAmp: "Critical Damage Amplification", deltaPerfect: "Perfect", deltaHardHit: "Hard Hit", deltaFrontAmp: "Front Damage Amplification", deltaBackAmp: "Back Damage Amplification",
      resultKicker: "LIVE OPTION COMPARISON", resultTitle: "Expected damage change", waitingTitle: "Paste your stats",
      waitingDescription: "After pasting, every option edit updates the result in place.", resultGuide: "The result compares your current values with the selected option increase.",
      ready: "Up to date", calculating: "Updating", source: "{job} · latest input", invalid: "Check Attack and Min/Max Attack values.",
      unavailable: "Could not reach the calculator. It will retry on the next edit.", statWindowAttack: "Displayed Attack", effectiveAttack: "Effective Boss Attack",
      expectedDamage: "Expected Damage Index", damageGain: "Expected damage gain", before: "Current", after: "Changed", quickCompare: "Quick stat comparison",
    },
    "zh-TW": {
      title: "屬性效率計算器", subtitle: "每次修改數值都會立即比較目前屬性與選擇的增量。",
      importTitle: "貼上從 NotMeter 複製的角色屬性", importDescription: "貼上「複製我的屬性」即可填入基準並立即計算。",
      importPlaceholder: "點擊此處並按 Ctrl+V", importWaiting: "等待貼上屬性", importSuccess: "{job} · 已填入 {count} 項傷害屬性", importInvalid: "這不是有效的 NotMeter 屬性資料。",
      noticeTitle: "即時計算", notice: "不需要計算按鈕。舊請求會被取消，只顯示最後輸入的結果。",
      optionTitle: "要比較的選項增量", optionHelp: "只輸入更換裝備後增加的數值，也可輸入負數。", currentDetails: "目前屬性詳細資料 · 需要時再展開",
      divineStats: "傷害連動主神屬性", divineStatsHelp: "相對於貼上基準的變化會自動加入選項增量。", power: "威力", destruction: "破壞", justice: "正義", wisdom: "智慧",
      powerGrowth: "每點攻擊力增加 +0.1%p", destructionGrowth: "每點攻擊力增加 +0.2%p", justiceGrowth: "每點完美 +0.2%p", wisdomGrowth: "每點強擊 +0.2%p",
      attackStats: "目前攻擊數值", attackStatsHelp: "可透過複製功能自動填入。", attack: "攻擊力", additionalAttack: "追加攻擊力", minimumAttack: "最小攻擊力", maximumAttack: "最大攻擊力",
      pveAttack: "PVE 攻擊力", bossAttack: "首領攻擊力", percentStats: "目前傷害增幅與判定", percentStatsHelp: "請輸入角色視窗顯示的數值。", attackIncrease: "攻擊力增加率",
      damageAmp: "傷害增幅", weaponDamageAmp: "武器傷害增幅", pveAmp: "PVE 傷害增幅", bossAmp: "首領傷害增幅", criticalDamageAmp: "暴擊傷害增幅",
      perfect: "完美", hardHit: "強擊", frontAmp: "正面傷害增幅", backAmp: "後方傷害增幅", combatAssumptions: "戰鬥條件", combatAssumptionsHelp: "用於攻擊方向與判定期望值。",
      criticalChance: "暴擊發動率", partyHardHit: "隊伍強擊增益", bossHardHitResistance: "首領強擊抗性", attackType: "攻擊方向", attackNone: "不套用方向", attackFront: "正面", attackBack: "後方",
      frontRate: "正面攻擊比例", backRate: "後方攻擊比例", deltaBaseAttack: "追加攻擊力", deltaGearAttack: "攻擊力", deltaMaxAttack: "最大攻擊力", deltaPveAttack: "PVE 攻擊力",
      deltaBossAttack: "首領攻擊力", deltaAttackIncrease: "攻擊力增加率", deltaDamageAmp: "傷害增幅", deltaWeaponAmp: "武器傷害增幅", deltaCriticalAmp: "暴擊傷害增幅",
      deltaPerfect: "完美", deltaHardHit: "強擊", deltaFrontAmp: "正面傷害增幅", deltaBackAmp: "後方傷害增幅", resultKicker: "即時選項比較", resultTitle: "預期傷害變化",
      waitingTitle: "請貼上角色屬性", waitingDescription: "貼上後修改任一增量，結果會在原位立即更新。", resultGuide: "結果是目前數值與所選增量的期望值比較。",
      ready: "已更新", calculating: "計算中", source: "{job} · 已套用最後輸入", invalid: "請確認攻擊力與最小／最大攻擊力。", unavailable: "無法連線至計算服務，下次修改時會自動重試。",
      statWindowAttack: "遊戲顯示攻擊力", effectiveAttack: "首領有效攻擊力", expectedDamage: "預期傷害指數", damageGain: "預期傷害提升", before: "目前", after: "變更後", quickCompare: "屬性快速比較",
    },
  };

  const form = document.getElementById("efficiency-form");
  const importInput = document.getElementById("stat-import");
  const importStatus = document.getElementById("stat-import-status");
  const resultEmpty = document.getElementById("result-empty");
  const resultSummary = document.getElementById("result-summary");
  const resultList = document.getElementById("result-list");
  const resultSource = document.getElementById("result-source");
  const confidence = document.getElementById("confidence");
  const formulaVersion = document.getElementById("formula-version");
  const formError = document.getElementById("form-error");
  let locale = resolveLocale();
  let baselineDivine = null;
  let recalculateTimer = 0;
  let requestController = null;
  let requestSequence = 0;

  function resolveLocale() {
    const value = document.documentElement.lang;
    return value === "en" || value === "zh-TW" ? value : "ko";
  }

  function t(key, values = {}) {
    let text = TEXT[locale]?.[key] || TEXT.ko[key] || key;
    for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }

  function applyLocale() {
    locale = resolveLocale();
    surface.querySelectorAll("[data-stat-i18n]").forEach(element => { element.textContent = t(element.dataset.statI18n); });
    surface.querySelectorAll("[data-stat-i18n-placeholder]").forEach(element => { element.placeholder = t(element.dataset.statI18nPlaceholder); });
  }

  function numeric(source, key) {
    const value = Number(source?.[key]);
    return Number.isFinite(value) ? value : 0;
  }

  function parseClipboard(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed.startsWith(CLIPBOARD_PREFIX)) throw new Error("prefix");
    const bytes = Uint8Array.from(atob(trimmed.slice(CLIPBOARD_PREFIX.length)), character => character.charCodeAt(0));
    const profile = JSON.parse(new TextDecoder().decode(bytes));
    if (profile?.schema !== CLIPBOARD_SCHEMA || numeric(profile, "attack") <= 0) throw new Error("schema");
    return profile;
  }

  function setField(name, value) {
    const input = form.elements.namedItem(name);
    if (input) input.value = String(Number.isFinite(Number(value)) ? Number(value) : 0);
  }

  function value(name) {
    return numeric(Object.fromEntries(new FormData(form)), name);
  }

  function applyClipboardProfile(profile) {
    document.getElementById("stat-job").value = String(profile.jobName || "").trim();
    for (const name of BASELINE_INPUTS) setField(name, numeric(profile, name));
    baselineDivine = Object.fromEntries(["power", "destruction", "justice", "wisdom"].map(name => [name, numeric(profile, name)]));
    importStatus.textContent = t("importSuccess", { job: profile.jobName || "—", count: BASELINE_INPUTS.length });
    importStatus.className = "stat-import-status success";
    form.classList.remove("was-submitted");
    scheduleCalculation(0);
  }

  function requestPayload() {
    if (!baselineDivine) {
      baselineDivine = { power: value("power"), destruction: value("destruction"), justice: value("justice"), wisdom: value("wisdom") };
    }
    const attackIncreaseDelta = (value("power") - baselineDivine.power) * 0.1 + (value("destruction") - baselineDivine.destruction) * 0.2;
    const perfectDelta = (value("justice") - baselineDivine.justice) * 0.2;
    const hardHitDelta = (value("wisdom") - baselineDivine.wisdom) * 0.2;
    return {
      jobName: document.getElementById("stat-job").value || "unknown",
      attack: value("attack"), additionalAttack: value("additionalAttack"), minimumAttack: value("minimumAttack"), maximumAttack: value("maximumAttack"),
      pveAttack: value("pveAttack"), bossAttack: value("bossAttack"), attackIncreasePercent: value("attackIncreasePercent"),
      damageAmplificationPercent: value("damageAmplificationPercent"), weaponDamageAmplificationPercent: value("weaponDamageAmplificationPercent"),
      pveDamageAmplificationPercent: value("pveDamageAmplificationPercent"), bossDamageAmplificationPercent: value("bossDamageAmplificationPercent"),
      criticalDamageAmplificationPercent: value("criticalDamageAmplificationPercent"), perfectPercent: value("perfectPercent"), hardHitPercent: value("hardHitPercent"),
      frontDamageAmplificationPercent: value("frontDamageAmplificationPercent"), backDamageAmplificationPercent: value("backDamageAmplificationPercent"),
      raceDamageAmplificationPercent: 0, criticalChancePercent: value("criticalChancePercent"), frontAttackRatePercent: value("frontAttackRatePercent"),
      backAttackRatePercent: value("backAttackRatePercent"), attackType: String(form.elements.namedItem("attackType")?.value || "none"),
      combatAttackIncreasePercent: 0, partyDamageAmplificationPercent: 0, bossDamageTolerancePercent: 0,
      partyHardHitPercent: value("partyHardHitPercent"), bossHardHitResistancePercent: value("bossHardHitResistancePercent"),
      optionDelta: {
        baseAttack: value("deltaBaseAttack"), gearAttack: value("deltaGearAttack"), maxAttack: value("deltaMaxAttack"),
        pveAttack: value("deltaPveAttack"), bossAttack: value("deltaBossAttack"),
        attackIncreasePercent: value("deltaAttackIncreasePercent") + attackIncreaseDelta,
        damageBoostPercent: value("deltaDamageBoostPercent"), weaponDamageBoostPercent: value("deltaWeaponDamageBoostPercent"),
        criticalDamageBoostPercent: value("deltaCriticalDamageBoostPercent"), perfectPercent: value("deltaPerfectPercent") + perfectDelta,
        smitePercent: value("deltaSmitePercent") + hardHitDelta, frontDamageBoostPercent: value("deltaFrontDamageBoostPercent"),
        backDamageBoostPercent: value("deltaBackDamageBoostPercent"),
      },
    };
  }

  function formatNumber(value, digits = 0) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(Number(value) || 0);
  }

  function makeCompareCard(label, before, after) {
    const article = document.createElement("article");
    article.className = "live-compare-card";
    const name = document.createElement("span");
    const values = document.createElement("div");
    const current = document.createElement("small");
    const arrow = document.createElement("i");
    const changed = document.createElement("strong");
    name.textContent = t(label);
    current.textContent = formatNumber(before, 2);
    arrow.textContent = "→";
    changed.textContent = formatNumber(after, 2);
    values.append(current, arrow, changed);
    article.append(name, values);
    return article;
  }

  function renderResult(result) {
    resultEmpty.hidden = true;
    resultSummary.hidden = false;
    resultList.hidden = false;
    confidence.textContent = t("ready");
    confidence.className = "confidence high";
    resultSource.textContent = t("source", { job: result.jobName || "—" });
    formulaVersion.textContent = result.formulaVersion || "—";

    const gain = document.createElement("article");
    gain.className = "damage-gain-card";
    const gainLabel = document.createElement("span");
    const gainValue = document.createElement("strong");
    gainLabel.textContent = t("damageGain");
    const gainNumber = Number(result.damageGainPercent) || 0;
    gainValue.textContent = `${gainNumber >= 0 ? "+" : ""}${formatNumber(gainNumber, 4)}%`;
    gainValue.className = gainNumber > 0 ? "positive" : gainNumber < 0 ? "negative" : "";
    gain.append(gainLabel, gainValue);
    resultSummary.replaceChildren(
      gain,
      makeCompareCard("expectedDamage", result.expectedDamage, result.adjustedExpectedDamage),
      makeCompareCard("effectiveAttack", result.effectiveAttack, result.adjustedEffectiveAttack),
      makeCompareCard("statWindowAttack", result.statWindowAttack, result.adjustedStatWindowAttack),
    );

    const effects = Array.isArray(result.effects) ? result.effects : [];
    resultList.replaceChildren(...EFFECT_GROUPS.map(([unit, title]) => {
      const section = document.createElement("section");
      section.className = "result-effect-group";
      const heading = document.createElement("h4");
      heading.textContent = title;
      const grid = document.createElement("div");
      grid.className = "result-effect-grid";
      effects.filter(effect => effect.unit === unit).sort((a, b) => Number(b.gainPercent) - Number(a.gainPercent)).forEach((effect, index) => {
        const card = document.createElement("article");
        const rank = document.createElement("b");
        const copy = document.createElement("div");
        const name = document.createElement("span");
        const effectGain = document.createElement("strong");
        rank.textContent = String(index + 1);
        name.textContent = EFFECT_NAMES[effect.key] || effect.key;
        effectGain.textContent = `${Number(effect.gainPercent) >= 0 ? "+" : ""}${formatNumber(effect.gainPercent, 4)}%`;
        copy.append(name, effectGain);
        card.append(rank, copy);
        grid.append(card);
      });
      section.append(heading, grid);
      return section;
    }));
  }

  function canCalculate() {
    return form.checkValidity() && value("attack") > 0 && value("maximumAttack") >= value("minimumAttack");
  }

  function setCalculating() {
    confidence.textContent = t("calculating");
    confidence.className = "confidence calculating";
  }

  async function calculate() {
    if (!canCalculate()) return;
    const sequence = ++requestSequence;
    requestController?.abort();
    requestController = new AbortController();
    const controller = requestController;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    formError.hidden = true;
    setCalculating();
    try {
      const response = await fetch(API_URL, {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload()), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result?.status !== "ready") throw new Error(result?.error || "invalid");
      if (sequence !== requestSequence) return;
      renderResult(result);
    } catch (error) {
      if (sequence !== requestSequence) return;
      if (error?.name !== "AbortError") console.warn("stat calculation failed", error);
      formError.textContent = t(error?.message === "invalid" ? "invalid" : "unavailable");
      formError.hidden = false;
      confidence.textContent = "!";
      confidence.className = "confidence pending";
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function scheduleCalculation(delay = RECALCULATE_DELAY_MS) {
    window.clearTimeout(recalculateTimer);
    if (!canCalculate()) return;
    setCalculating();
    recalculateTimer = window.setTimeout(() => void calculate(), delay);
  }

  importInput.addEventListener("input", () => {
    try {
      applyClipboardProfile(parseClipboard(importInput.value));
    } catch {
      if (!importInput.value.trim()) {
        importStatus.textContent = t("importWaiting");
        importStatus.className = "stat-import-status";
      } else {
        importStatus.textContent = t("importInvalid");
        importStatus.className = "stat-import-status error";
      }
    }
  });
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", event => {
    if (event.target === importInput) return;
    if (!canCalculate()) {
      requestController?.abort();
      formError.textContent = t("invalid");
      formError.hidden = false;
      return;
    }
    formError.hidden = true;
    scheduleCalculation();
  });
  form.addEventListener("change", event => {
    if (event.target !== importInput) scheduleCalculation(0);
  });

  applyLocale();
  window.NotMeterStatEfficiency = {
    activate() { applyLocale(); scheduleCalculation(0); },
    setLocale(value) { locale = value === "en" || value === "zh-TW" ? value : "ko"; applyLocale(); },
  };
})();
