(() => {
  "use strict";

  const surface = document.getElementById("stat-efficiency-surface");
  if (!surface) return;

  const API_URL = "https://notmeter.112-168-140-142.sslip.io/stat-efficiency/v1/calculate";
  const CLIPBOARD_PREFIX = "NOTMETER_STATS_V4:";
  const CLIPBOARD_SCHEMA = "notmeter-stat-efficiency-profile-v4";
  const REQUEST_TIMEOUT_MS = 12_000;
  const RECALCULATE_DELAY_MS = 450;
  const SUPPORTED_INPUTS = [
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
    weaponDamageAmplification: "무기 피해 증폭",
    pveDamageAmplification: "PVE 피해 증폭", bossDamageAmplification: "보스 피해 증폭",
    criticalDamageAmplification: "치명타 피해 증폭",
    perfect: "완벽", hardHit: "강타", frontDamageAmplification: "전방 피해 증폭",
    backDamageAmplification: "후방 피해 증폭",
  };
  const TEXT = {
    ko: {
      title: "스탯 효율 계산기", subtitle: "현재 캐릭터에서 실제 피해 기대값을 높이는 스탯만 비교합니다.",
      importTitle: "딜미터기에서 복사한 내 스탯 붙여넣기",
      importDescription: "처치 기록 상단의 ‘내 스탯 복사’를 누른 뒤 붙여넣으면 필요한 피해 스탯만 자동 입력됩니다.",
      importPlaceholder: "여기를 누르고 Ctrl+V로 붙여넣기", importWaiting: "복사한 값을 기다리고 있습니다",
      importSuccess: "{job} · 피해 계산 스탯 {count}개를 입력했습니다", importInvalid: "딜미터기에서 복사한 유효한 스탯 값이 아닙니다.",
      noticeTitle: "표시 기준",
      notice: "현재 고정 계산식에서 피해 기대값을 직접 바꾸는 스탯만 표시합니다. 명중·방어·재시전 시간·전투 속도·속성 증폭·봉혼석·관통 등 미검증 항목은 계산 UI와 순위에서 제외됩니다.",
      divineStats: "피해 연동 주신 스탯", divineStatsHelp: "현재 고정식에 직접 연결되는 항목만 표시합니다.",
      power: "위력", destruction: "파괴", justice: "정의", wisdom: "지혜",
      powerGrowth: "1당 공격력 증가 +0.1%p", destructionGrowth: "1당 공격력 증가 +0.2%p",
      justiceGrowth: "1당 완벽 +0.2%p", wisdomGrowth: "1당 강타 +0.2%p",
      attackStats: "공격 수치", attackStatsHelp: "복사 기능을 사용하면 자동 입력됩니다.",
      attack: "공격력", additionalAttack: "추가 공격력", minimumAttack: "최소 공격력", maximumAttack: "최대 공격력",
      pveAttack: "PVE 공격력", bossAttack: "보스 공격력", percentStats: "피해 증폭·판정",
      percentStatsHelp: "딜 증가량이 고정식으로 계산되는 항목만 표시합니다.", attackIncrease: "공격력 증가율",
      damageAmp: "피해 증폭", weaponDamageAmp: "무기 피해 증폭", pveAmp: "PVE 피해 증폭", bossAmp: "보스 피해 증폭",
      criticalDamageAmp: "치명타 피해 증폭", perfect: "완벽", hardHit: "강타",
      frontAmp: "전방 피해 증폭", backAmp: "후방 피해 증폭", calculate: "효율 계산", calculating: "계산 중…",
      combatAssumptions: "전투 가정", combatAssumptionsHelp: "강타·치명타 피해의 기대값에만 사용됩니다.",
      criticalChance: "치명타 발동률", partyHardHit: "파티 강타 버프", bossHardHitResistance: "보스 강타 저항",
      resultKicker: "내 캐릭터 기준", resultTitle: "스탯 효율 순위", waitingTitle: "내 스탯을 붙여넣어 주세요",
      waitingDescription: "피해 증가에 직접 연결된 스탯만 서버에서 계산합니다.", resultGuide: "+1, +10, +1%p처럼 같은 단위끼리 비교하세요.",
      easyTitle: "사용 방법", easyOne: "딜미터기 처치 기록 상단에서 ‘내 스탯 복사’를 누릅니다.",
      easyTwo: "이 페이지 상단 입력칸에 붙여넣습니다.", easyThree: "필요하면 수치를 바꾼 뒤 다시 계산해 효율 변화를 비교합니다.",
      ready: "계산 완료", source: "{job} 현재 스탯 기준", invalid: "필수 공격 스탯을 확인해 주세요.",
      unavailable: "계산 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      statWindowAttack: "게임 표시 공격력", effectiveAttack: "보스 유효 공격력", expectedDamage: "기대 피해 지수",
    },
    en: {
      title: "Stat Efficiency Calculator", subtitle: "Compare only stats that directly increase expected damage.",
      importTitle: "Paste stats copied from NotMeter", importDescription: "Use Copy My Stats in Kill Records, then paste here to fill only damage-related stats.",
      importPlaceholder: "Click here and press Ctrl+V", importWaiting: "Waiting for copied stats",
      importSuccess: "{job} · Filled {count} damage stats", importInvalid: "This is not a valid NotMeter stat copy.",
      noticeTitle: "Displayed stats", notice: "Only stats that directly change expected damage in the fixed formula are shown. Unverified accuracy, defense, cooldown, combat speed, elemental amplification, soulstone, and penetration values are excluded.",
      divineStats: "Damage-linked divine stats", divineStatsHelp: "Only stats directly connected to the fixed formula are shown.",
      power: "Power", destruction: "Destruction", justice: "Justice", wisdom: "Wisdom",
      powerGrowth: "+0.1%p Attack Increase per point", destructionGrowth: "+0.2%p Attack Increase per point",
      justiceGrowth: "+0.2%p Perfect per point", wisdomGrowth: "+0.2%p Hard Hit per point",
      attackStats: "Attack values", attackStatsHelp: "Filled automatically by Copy My Stats.",
      attack: "Attack", additionalAttack: "Additional Attack", minimumAttack: "Minimum Attack", maximumAttack: "Maximum Attack",
      pveAttack: "PVE Attack", bossAttack: "Boss Attack", percentStats: "Damage amplification and rolls",
      percentStatsHelp: "Only effects with a fixed damage formula are shown.", attackIncrease: "Attack Increase",
      damageAmp: "Damage Amplification", weaponDamageAmp: "Weapon Damage Amplification", pveAmp: "PVE Damage Amplification", bossAmp: "Boss Damage Amplification",
      criticalDamageAmp: "Critical Damage Amplification", perfect: "Perfect", hardHit: "Hard Hit",
      frontAmp: "Front Damage Amplification", backAmp: "Back Damage Amplification", calculate: "Calculate", calculating: "Calculating…",
      combatAssumptions: "Combat assumptions", combatAssumptionsHelp: "Used only for expected Hard Hit and critical damage.",
      criticalChance: "Critical proc rate", partyHardHit: "Party Hard Hit buff", bossHardHitResistance: "Boss Hard Hit resistance",
      resultKicker: "YOUR CHARACTER", resultTitle: "Stat efficiency", waitingTitle: "Paste your stats",
      waitingDescription: "Only direct damage stats are calculated on the server.", resultGuide: "Compare results within the same +1, +10, or +1%p unit.",
      easyTitle: "How to use", easyOne: "Select Copy My Stats at the top of Kill Records.", easyTwo: "Paste it into the field above.",
      easyThree: "Change a value and calculate again to compare upgrades.", ready: "Ready", source: "Current stats · {job}",
      invalid: "Check the required attack values.", unavailable: "Could not reach the calculator. Try again shortly.",
      statWindowAttack: "Displayed Attack", effectiveAttack: "Effective Boss Attack", expectedDamage: "Expected Damage Index",
    },
    "zh-TW": {
      title: "屬性效率計算器", subtitle: "只比較會直接提高預期傷害的屬性。",
      importTitle: "貼上從 NotMeter 複製的角色屬性", importDescription: "在討伐紀錄上方按下「複製我的屬性」，再貼到這裡即可只填入傷害相關屬性。",
      importPlaceholder: "點擊此處並按 Ctrl+V", importWaiting: "等待貼上屬性",
      importSuccess: "{job} · 已填入 {count} 項傷害屬性", importInvalid: "這不是有效的 NotMeter 屬性資料。",
      noticeTitle: "顯示標準", notice: "只顯示固定公式中會直接改變預期傷害的屬性。命中、防禦、冷卻、戰鬥速度、屬性增幅、封魂石與貫穿等尚未驗證的項目不會出現在介面與排名中。",
      divineStats: "傷害連動主神屬性", divineStatsHelp: "只顯示與固定公式直接連動的項目。",
      power: "威力", destruction: "破壞", justice: "正義", wisdom: "智慧",
      powerGrowth: "每點攻擊力增加 +0.1%p", destructionGrowth: "每點攻擊力增加 +0.2%p",
      justiceGrowth: "每點完美 +0.2%p", wisdomGrowth: "每點強擊 +0.2%p",
      attackStats: "攻擊數值", attackStatsHelp: "使用複製功能即可自動填入。",
      attack: "攻擊力", additionalAttack: "追加攻擊力", minimumAttack: "最小攻擊力", maximumAttack: "最大攻擊力",
      pveAttack: "PVE 攻擊力", bossAttack: "首領攻擊力", percentStats: "傷害增幅與判定",
      percentStatsHelp: "只顯示可用固定公式計算傷害增幅的項目。", attackIncrease: "攻擊力增加率",
      damageAmp: "傷害增幅", weaponDamageAmp: "武器傷害增幅", pveAmp: "PVE 傷害增幅", bossAmp: "首領傷害增幅",
      criticalDamageAmp: "暴擊傷害增幅", perfect: "完美", hardHit: "強擊",
      frontAmp: "正面傷害增幅", backAmp: "後方傷害增幅", calculate: "計算效率", calculating: "計算中…",
      combatAssumptions: "戰鬥假設", combatAssumptionsHelp: "只用於強擊與暴擊傷害的期望值。",
      criticalChance: "暴擊發動率", partyHardHit: "隊伍強擊增益", bossHardHitResistance: "首領強擊抗性",
      resultKicker: "目前角色基準", resultTitle: "屬性效率排名", waitingTitle: "請貼上角色屬性",
      waitingDescription: "只有直接影響傷害的屬性會在伺服器計算。", resultGuide: "請在相同的 +1、+10 或 +1%p 單位內比較。",
      easyTitle: "使用方式", easyOne: "在 NotMeter 討伐紀錄上方按下「複製我的屬性」。", easyTwo: "貼到本頁上方輸入框。",
      easyThree: "調整數值後再次計算，即可比較效率變化。", ready: "計算完成", source: "{job} 目前屬性基準",
      invalid: "請確認必要的攻擊數值。", unavailable: "無法連線至計算服務，請稍後再試。",
      statWindowAttack: "遊戲顯示攻擊力", effectiveAttack: "首領有效攻擊力", expectedDamage: "預期傷害指數",
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
  const submitButton = form.querySelector("button[type=submit]");
  let locale = resolveLocale();
  let baselineDivine = null;
  let recalculateTimer = 0;
  let requestController = null;

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
    surface.querySelectorAll("[data-stat-i18n]").forEach(element => {
      element.textContent = t(element.dataset.statI18n);
    });
    surface.querySelectorAll("[data-stat-i18n-placeholder]").forEach(element => {
      element.setAttribute("placeholder", t(element.dataset.statI18nPlaceholder));
    });
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

  function applyClipboardProfile(profile) {
    document.getElementById("stat-job").value = String(profile.jobName || "").trim();
    for (const name of SUPPORTED_INPUTS) setField(name, numeric(profile, name));
    baselineDivine = Object.fromEntries(["power", "destruction", "justice", "wisdom"].map(name => [name, numeric(profile, name)]));
    importStatus.textContent = t("importSuccess", { job: profile.jobName || "—", count: SUPPORTED_INPUTS.length });
    importStatus.className = "stat-import-status success";
    form.classList.remove("was-submitted");
    form.requestSubmit();
  }

  function value(name) {
    return numeric(Object.fromEntries(new FormData(form)), name);
  }

  function requestPayload() {
    const divine = baselineDivine || {
      power: value("power"), destruction: value("destruction"), justice: value("justice"), wisdom: value("wisdom"),
    };
    const attackIncreaseDelta = (value("power") - divine.power) * 0.1 + (value("destruction") - divine.destruction) * 0.2;
    const perfectDelta = (value("justice") - divine.justice) * 0.2;
    const hardHitDelta = (value("wisdom") - divine.wisdom) * 0.2;
    return {
      jobName: document.getElementById("stat-job").value || "unknown",
      attack: value("attack"), additionalAttack: value("additionalAttack"),
      minimumAttack: value("minimumAttack"), maximumAttack: value("maximumAttack"),
      pveAttack: value("pveAttack"), bossAttack: value("bossAttack"),
      attackIncreasePercent: value("attackIncreasePercent") + attackIncreaseDelta,
      damageAmplificationPercent: value("damageAmplificationPercent"),
      weaponDamageAmplificationPercent: value("weaponDamageAmplificationPercent"),
      pveDamageAmplificationPercent: value("pveDamageAmplificationPercent"),
      bossDamageAmplificationPercent: value("bossDamageAmplificationPercent"),
      criticalDamageAmplificationPercent: value("criticalDamageAmplificationPercent"),
      perfectPercent: value("perfectPercent") + perfectDelta,
      hardHitPercent: value("hardHitPercent") + hardHitDelta,
      frontDamageAmplificationPercent: value("frontDamageAmplificationPercent"),
      backDamageAmplificationPercent: value("backDamageAmplificationPercent"),
      raceDamageAmplificationPercent: 0, criticalChancePercent: value("criticalChancePercent"),
      frontAttackRatePercent: 100, backAttackRatePercent: 100, attackType: "none",
      combatAttackIncreasePercent: 0, partyDamageAmplificationPercent: 0,
      bossDamageTolerancePercent: 0, partyHardHitPercent: value("partyHardHitPercent"),
      bossHardHitResistancePercent: value("bossHardHitResistancePercent"),
    };
  }

  function formatNumber(value, maximumFractionDigits = 0) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(Number(value) || 0);
  }

  function renderResult(result) {
    resultEmpty.hidden = true;
    resultSummary.hidden = false;
    resultList.hidden = false;
    confidence.textContent = t("ready");
    confidence.className = "confidence high";
    resultSource.textContent = t("source", { job: result.jobName || "—" });
    formulaVersion.textContent = result.formulaVersion || "—";
    resultSummary.replaceChildren(...[
      ["statWindowAttack", result.statWindowAttack],
      ["effectiveAttack", result.effectiveAttack],
      ["expectedDamage", result.expectedDamage],
    ].map(([label, amount]) => {
      const card = document.createElement("article");
      const name = document.createElement("span");
      const number = document.createElement("strong");
      name.textContent = t(label);
      number.textContent = formatNumber(amount, 2);
      card.append(name, number);
      return card;
    }));

    const effects = Array.isArray(result.effects) ? result.effects : [];
    resultList.replaceChildren(...EFFECT_GROUPS.map(([unit, title]) => {
      const section = document.createElement("section");
      section.className = "result-effect-group";
      const heading = document.createElement("h4");
      heading.textContent = title;
      const grid = document.createElement("div");
      grid.className = "result-effect-grid";
      effects.filter(effect => effect.unit === unit)
        .sort((left, right) => Number(right.gainPercent) - Number(left.gainPercent))
        .forEach((effect, index) => {
          const card = document.createElement("article");
          const rank = document.createElement("b");
          const copy = document.createElement("div");
          const name = document.createElement("span");
          const gain = document.createElement("strong");
          rank.textContent = String(index + 1);
          name.textContent = EFFECT_NAMES[effect.key] || effect.key;
          gain.textContent = `+${formatNumber(effect.gainPercent, 4)}%`;
          copy.append(name, gain);
          card.append(rank, copy);
          grid.append(card);
        });
      section.append(heading, grid);
      return section;
    }));
  }

  async function calculate() {
    form.classList.add("was-submitted");
    if (!form.checkValidity() || value("maximumAttack") < value("minimumAttack")) {
      document.getElementById("form-error").textContent = t("invalid");
      document.getElementById("form-error").hidden = false;
      return;
    }
    document.getElementById("form-error").hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = t("calculating");
    requestController?.abort();
    requestController = new AbortController();
    const timeout = window.setTimeout(() => requestController.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(API_URL, {
        method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload()), signal: requestController.signal,
      });
      const result = await response.json();
      if (!response.ok || result?.status !== "ready") throw new Error(result?.error || "invalid");
      renderResult(result);
    } catch (error) {
      if (error?.name !== "AbortError") console.warn("stat calculation failed", error);
      document.getElementById("form-error").textContent = t(error?.message === "invalid" ? "invalid" : "unavailable");
      document.getElementById("form-error").hidden = false;
    } finally {
      window.clearTimeout(timeout);
      submitButton.disabled = false;
      submitButton.textContent = t("calculate");
    }
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
  form.addEventListener("submit", event => { event.preventDefault(); void calculate(); });
  form.addEventListener("input", event => {
    if (event.target === importInput || !baselineDivine || !form.checkValidity()) return;
    window.clearTimeout(recalculateTimer);
    recalculateTimer = window.setTimeout(() => form.requestSubmit(), RECALCULATE_DELAY_MS);
  });

  applyLocale();
  window.NotMeterStatEfficiency = {
    activate() { applyLocale(); },
    setLocale(value) {
      locale = value === "en" || value === "zh-TW" ? value : "ko";
      applyLocale();
    },
  };
})();
