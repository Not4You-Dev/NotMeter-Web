(() => {
  "use strict";

  const WIDTH = 1920;
  const SIDE = 48;
  const COLUMN_GAP = 16;
  const ITEM_GAP = 6;
  const ITEM_HEIGHT = 112;
  const SUMMARY_CELL_COLUMNS = 3;
  const EQUIPMENT_COLUMN_COUNT = 4;
  const SKILL_GROUP_COUNT = 3;
  const SKILL_ROW_HEIGHT = 54;
  const ARCANA_COLUMN_COUNT = 5;
  const ARCANA_CARD_HEIGHT = 228;
  const FONT_FAMILY = '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif';
  const GRADE_COLORS = Object.freeze({
    Common: "#d8e0e4", Rare: "#67ca70", Legend: "#59a9e8",
    Unique: "#f1b455", Epic: "#f27b3b", Mythic: "#ec5a5a",
  });

  async function createBlob(model) {
    if (!model || !Array.isArray(model.gear) || !Array.isArray(model.accessories)) {
      throw new Error("Invalid equipment snapshot model");
    }

    const soulRows = Math.max(1, Math.ceil((model.soulSkills?.length || 0) / SUMMARY_CELL_COLUMNS));
    const stoneRows = Math.max(1, Math.ceil((model.stones?.length || 0) / SUMMARY_CELL_COLUMNS));
    const summaryHeight = 68 + Math.max(soulRows, stoneRows) * 36;
    const itemRows = Math.max(1,
      Math.ceil((model.gear.length + model.accessories.length) / EQUIPMENT_COLUMN_COUNT));
    const itemAreaHeight = 50 + itemRows * ITEM_HEIGHT + Math.max(0, itemRows - 1) * ITEM_GAP;
    const height = 194 + summaryHeight + 22 + itemAreaHeight + 64;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas is unavailable");

    const images = await loadImages(model);
    drawBackground(context, height);
    drawHeader(context, model, images);
    drawSummaryPanels(context, model, summaryHeight, images);
    drawEquipmentColumns(context, model, summaryHeight, images);
    drawFooter(context, model, height);

    return canvasBlob(canvas);
  }

  async function createSkillBlob(model) {
    if (!model || !Array.isArray(model.groups)) throw new Error("Invalid skill snapshot model");
    const rowCount = Math.max(1, ...model.groups.map(group => group.skills?.length || 0));
    const groupHeight = 70 + rowCount * SKILL_ROW_HEIGHT + Math.max(0, rowCount - 1) * ITEM_GAP + 18;
    const height = 194 + groupHeight + 64;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas is unavailable");

    const images = await loadSkillImages(model);
    drawBackground(context, height);
    drawHeader(context, model, images);
    drawSkillGroups(context, model, images, groupHeight);
    drawFooter(context, model, height);
    return canvasBlob(canvas);
  }

  async function createArcanaBlob(model) {
    if (!model || !Array.isArray(model.cards)) throw new Error("Invalid Arcana snapshot model");
    const skillRows = Math.max(1, Math.ceil((model.skillTotals?.length || 0) / SUMMARY_CELL_COLUMNS));
    const statRows = Math.max(1, Math.ceil((model.statTotals?.length || 0) / SUMMARY_CELL_COLUMNS));
    const summaryHeight = 68 + Math.max(skillRows, statRows) * 48;
    const cardRows = Math.max(1, Math.ceil(model.cards.length / ARCANA_COLUMN_COUNT));
    const cardAreaHeight = 50 + cardRows * ARCANA_CARD_HEIGHT + Math.max(0, cardRows - 1) * 10;
    const height = 194 + summaryHeight + 22 + cardAreaHeight + 64;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas is unavailable");

    const images = await loadArcanaImages(model);
    drawBackground(context, height);
    drawHeader(context, model, images);
    drawArcanaSummaryPanels(context, model, summaryHeight, images);
    drawArcanaCards(context, model, summaryHeight, images);
    drawFooter(context, model, height);
    return canvasBlob(canvas);
  }

  function drawSkillGroups(context, model, images, height) {
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP * (SKILL_GROUP_COUNT - 1)) / SKILL_GROUP_COUNT;
    const groups = model.groups.slice(0, SKILL_GROUP_COUNT);
    for (let groupIndex = 0; groupIndex < SKILL_GROUP_COUNT; groupIndex += 1) {
      const group = groups[groupIndex] || { name: "—", totalText: "", countText: "", skills: [] };
      const x = SIDE + groupIndex * (width + COLUMN_GAP);
      const y = 194;
      roundedRect(context, x, y, width, height, 16, "rgba(10, 30, 41, .96)", "#285367");
      context.font = `900 21px ${FONT_FAMILY}`;
      context.fillStyle = "#effbfd";
      context.fillText(group.name || "—", x + 20, y + 32);
      context.font = `900 14px ${FONT_FAMILY}`;
      context.fillStyle = "#5ce5dd";
      context.textAlign = "right";
      context.fillText(group.totalText || "", x + width - 20, y + 28);
      context.font = `700 11px ${FONT_FAMILY}`;
      context.fillStyle = "#7695a3";
      context.fillText(group.countText || "", x + width - 20, y + 47);
      context.textAlign = "left";
      context.fillStyle = "#285367";
      context.fillRect(x + 20, y + 58, width - 40, 1);

      const rows = Array.isArray(group.skills) ? group.skills : [];
      if (!rows.length) {
        context.font = `700 14px ${FONT_FAMILY}`;
        context.fillStyle = "#668592";
        context.fillText(model.labels.none, x + 20, y + 94);
        continue;
      }
      rows.forEach((skill, index) => {
        const rowY = y + 70 + index * (SKILL_ROW_HEIGHT + ITEM_GAP);
        roundedRect(context, x + 14, rowY, width - 28, SKILL_ROW_HEIGHT, 10, "#0a202b", "#1d4353");
        const image = images.get(skill.icon);
        if (image) drawImageCover(context, image, x + 24, rowY + 8, 38, 38, 8);
        else drawImagePlaceholder(context, x + 24, rowY + 8, 38, "");
        context.font = `800 15px ${FONT_FAMILY}`;
        context.fillStyle = "#d8e9ee";
        drawEllipsized(context, skill.name || "—", x + 74, rowY + 32, width - 190);
        context.font = `900 16px ${FONT_FAMILY}`;
        context.fillStyle = "#69e9e1";
        context.textAlign = "right";
        context.fillText(skill.levelText || "—", x + width - 26, rowY + 32);
        context.textAlign = "left";
      });
    }
  }

  function drawArcanaSummaryPanels(context, model, height, images) {
    const y = 194;
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP) / 2;
    drawArcanaSummaryPanel(context, SIDE, y, width, height, model.labels.skillTotals,
      model.labels.skillTotalsNote, model.skillTotals || [], images, true, model.labels.none);
    drawArcanaSummaryPanel(context, SIDE + width + COLUMN_GAP, y, width, height,
      model.labels.statTotals, model.labels.statTotalsNote, model.statTotals || [], images, false, model.labels.none);
  }

  function drawArcanaSummaryPanel(context, x, y, width, height, title, note, rows, images, withIcon, emptyText) {
    roundedRect(context, x, y, width, height, 16, "rgba(10, 30, 41, .96)", "#285367");
    context.font = `900 19px ${FONT_FAMILY}`;
    context.fillStyle = "#effbfd";
    context.fillText(title, x + 20, y + 30);
    context.font = `600 11px ${FONT_FAMILY}`;
    context.fillStyle = "#7f9daa";
    drawEllipsized(context, note, x + 20, y + 50, width - 40);
    if (!rows.length) {
      context.font = `700 14px ${FONT_FAMILY}`;
      context.fillStyle = "#668592";
      context.fillText(emptyText, x + 20, y + 90);
      return;
    }

    const gap = 8;
    const cellWidth = (width - 40 - gap * (SUMMARY_CELL_COLUMNS - 1)) / SUMMARY_CELL_COLUMNS;
    rows.forEach((row, index) => {
      const column = index % SUMMARY_CELL_COLUMNS;
      const line = Math.floor(index / SUMMARY_CELL_COLUMNS);
      const cellX = x + 20 + column * (cellWidth + gap);
      const cellY = y + 60 + line * 48;
      roundedRect(context, cellX, cellY, cellWidth, 40, 8, "#0d2632", "#1c4657");
      let textX = cellX + 9;
      if (withIcon) {
        const image = images.get(row.icon);
        if (image) drawImageCover(context, image, cellX + 5, cellY + 6, 28, 28, 6);
        else drawImagePlaceholder(context, cellX + 5, cellY + 6, 28, "");
        textX = cellX + 40;
      }
      context.font = `700 12px ${FONT_FAMILY}`;
      context.fillStyle = "#cde0e6";
      drawEllipsized(context, row.name || "—", textX, cellY + 17, cellWidth - (textX - cellX) - 64);
      if (row.detailText) {
        context.font = `600 9px ${FONT_FAMILY}`;
        context.fillStyle = "#7595a3";
        drawEllipsized(context, row.detailText, textX, cellY + 32, cellWidth - (textX - cellX) - 8);
      }
      context.font = `900 13px ${FONT_FAMILY}`;
      context.fillStyle = "#62e7df";
      context.textAlign = "right";
      context.fillText(row.valueText || "—", cellX + cellWidth - 8, cellY + 18);
      context.textAlign = "left";
    });
  }

  function drawArcanaCards(context, model, summaryHeight, images) {
    const y = 194 + summaryHeight + 22;
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP * (ARCANA_COLUMN_COUNT - 1)) / ARCANA_COLUMN_COUNT;
    drawEquipmentSectionHeader(context, SIDE, y, WIDTH - SIDE * 2, model.labels.cards,
      model.labels.cardCount);
    model.cards.forEach((card, index) => {
      const column = index % ARCANA_COLUMN_COUNT;
      const row = Math.floor(index / ARCANA_COLUMN_COUNT);
      drawArcanaCard(context, SIDE + column * (width + COLUMN_GAP),
        y + 50 + row * (ARCANA_CARD_HEIGHT + 10), width, card, images);
    });
  }

  function drawArcanaCard(context, x, y, width, card, images) {
    roundedRect(context, x, y, width, ARCANA_CARD_HEIGHT, 12, "#081a24", "#1d4050");
    context.fillStyle = GRADE_COLORS[card.grade] || GRADE_COLORS.Common;
    context.fillRect(x, y + 14, 3, ARCANA_CARD_HEIGHT - 28);
    const icon = images.get(card.icon);
    if (icon) drawImageCover(context, icon, x + 14, y + 14, 52, 52, 7);
    else drawImagePlaceholder(context, x + 14, y + 14, 52, "?");
    context.font = `900 16px ${FONT_FAMILY}`;
    context.fillStyle = GRADE_COLORS[card.grade] || GRADE_COLORS.Common;
    drawEllipsized(context, `${card.enhanceText || ""} ${card.name || "—"}`.trim(), x + 78, y + 31, width - 92);
    context.font = `700 11px ${FONT_FAMILY}`;
    context.fillStyle = "#7897a5";
    drawEllipsized(context, card.slotText || "", x + 78, y + 50, width - 92);
    context.fillStyle = "#244a5a";
    context.fillRect(x + 14, y + 76, width - 28, 1);

    const rows = [
      ...(card.skills || []).map(skill => ({ ...skill, kind: "skill" })),
      ...(card.stats || []).map(value => ({ name: value, kind: "stat" })),
    ].slice(0, 5);
    rows.forEach((row, index) => {
      const rowY = y + 91 + index * 25;
      let textX = x + 22;
      if (row.kind === "skill") {
        const skillIcon = images.get(row.icon);
        if (skillIcon) drawImageCover(context, skillIcon, x + 17, rowY - 13, 20, 20, 4);
        else drawImagePlaceholder(context, x + 17, rowY - 13, 20, "");
        textX = x + 44;
      } else {
        context.fillStyle = "#4edbd3";
        context.fillRect(x + 20, rowY - 5, 4, 4);
        textX = x + 31;
      }
      context.font = `700 12px ${FONT_FAMILY}`;
      context.fillStyle = row.kind === "skill" ? "#cfe5ea" : "#9db9c3";
      drawEllipsized(context, row.name || "—", textX, rowY + 1,
        width - (textX - x) - (row.levelText ? 52 : 15));
      if (row.levelText) {
        context.font = `900 12px ${FONT_FAMILY}`;
        context.fillStyle = "#66e8e0";
        context.textAlign = "right";
        context.fillText(row.levelText, x + width - 16, rowY + 1);
        context.textAlign = "left";
      }
    });
  }

  function drawBackground(context, height) {
    context.fillStyle = "#06111a";
    context.fillRect(0, 0, WIDTH, height);
    const glow = context.createRadialGradient(1240, 60, 20, 1240, 60, 620);
    glow.addColorStop(0, "rgba(51, 222, 211, .16)");
    glow.addColorStop(.45, "rgba(22, 97, 117, .08)");
    glow.addColorStop(1, "rgba(6, 17, 26, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, WIDTH, Math.min(height, 720));
    context.strokeStyle = "rgba(86, 224, 214, .055)";
    context.lineWidth = 1;
    for (let y = 30; y < height; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(WIDTH, y);
      context.stroke();
    }
  }

  function drawHeader(context, model, images) {
    const x = SIDE;
    const y = 38;
    const width = WIDTH - SIDE * 2;
    const height = 132;
    roundedRect(context, x, y, width, height, 18, "#0a1d28", "#2a6574");
    context.fillStyle = "#43ddd5";
    context.fillRect(x, y + 22, 4, height - 44);

    const brand = images.get(model.brandIcon);
    if (brand) drawImageCover(context, brand, x + 24, y + 25, 72, 72, 15);
    else drawImagePlaceholder(context, x + 24, y + 25, 72, "N");

    context.font = `800 15px ${FONT_FAMILY}`;
    context.fillStyle = "#51e1d9";
    context.fillText(model.labels.snapshotKicker, x + 118, y + 31);
    context.font = `900 35px ${FONT_FAMILY}`;
    context.fillStyle = "#f3fbfd";
    drawEllipsized(context, model.characterName || "—", x + 118, y + 76, 700);
    context.font = `700 15px ${FONT_FAMILY}`;
    context.fillStyle = "#9bb6c2";
    drawEllipsized(context, [model.serverName, model.className, model.loadoutType]
      .filter(Boolean).join("  ·  "), x + 118, y + 106, 720);

    const cpX = x + width - 292;
    if (model.headerMetric) {
      const metricX = cpX - 276;
      roundedRect(context, metricX, y + 23, 260, 86, 14, "#071720", "#234e5f");
      context.font = `800 12px ${FONT_FAMILY}`;
      context.fillStyle = "#799aa9";
      context.fillText(model.headerMetric.label || "", metricX + 20, y + 48);
      context.font = `900 27px ${FONT_FAMILY}`;
      context.fillStyle = "#f1d878";
      context.textAlign = "right";
      context.fillText(model.headerMetric.valueText || "—", metricX + 240, y + 84);
      context.textAlign = "left";
    }
    roundedRect(context, cpX, y + 23, 260, 86, 14, "#071720", "#234e5f");
    context.font = `800 12px ${FONT_FAMILY}`;
    context.fillStyle = "#799aa9";
    context.fillText(model.labels.combatPower, cpX + 20, y + 48);
    context.font = `900 27px ${FONT_FAMILY}`;
    context.fillStyle = "#6cece4";
    context.textAlign = "right";
    context.fillText(model.combatPowerText || "—", cpX + 240, y + 78);
    context.font = `700 11px ${FONT_FAMILY}`;
    context.fillStyle = "#88a6b3";
    context.fillText(`${model.labels.itemLevel} ${model.itemLevelText || "—"}`, cpX + 240, y + 98);
    context.textAlign = "left";
  }

  function drawSummaryPanels(context, model, height, images) {
    const y = 194;
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP) / 2;
    drawSummaryPanel(context, SIDE, y, width, height, model.labels.soulSkills,
      model.labels.soulSkillsNote, model.soulSkills || [], images, true, model.labels.none);
    drawSummaryPanel(context, SIDE + width + COLUMN_GAP, y, width, height,
      model.labels.manastoneTotals, model.labels.manastoneTotalsNote,
      model.stones || [], images, false, model.labels.none);
  }

  function drawSummaryPanel(context, x, y, width, height, title, note, rows, images, withIcon, emptyText) {
    roundedRect(context, x, y, width, height, 16, "rgba(10, 30, 41, .96)", "#285367");
    context.font = `900 19px ${FONT_FAMILY}`;
    context.fillStyle = "#effbfd";
    context.fillText(title, x + 20, y + 30);
    context.font = `600 11px ${FONT_FAMILY}`;
    context.fillStyle = "#7f9daa";
    drawEllipsized(context, note, x + 20, y + 50, width - 40);

    if (!rows.length) {
      context.font = `700 14px ${FONT_FAMILY}`;
      context.fillStyle = "#668592";
      context.fillText(emptyText, x + 20, y + 88);
      return;
    }

    const cellGap = 8;
    const cellWidth = (width - 40 - cellGap * (SUMMARY_CELL_COLUMNS - 1)) / SUMMARY_CELL_COLUMNS;
    for (const [index, row] of rows.entries()) {
      const column = index % SUMMARY_CELL_COLUMNS;
      const line = Math.floor(index / SUMMARY_CELL_COLUMNS);
      const cellX = x + 20 + column * (cellWidth + cellGap);
      const cellY = y + 60 + line * 36;
      roundedRect(context, cellX, cellY, cellWidth, 30, 8,
        row.highlight ? "#302b18" : "#0d2632", row.highlight ? "#7b682b" : "#1c4657");
      let textX = cellX + 10;
      if (withIcon) {
        const image = images.get(row.icon);
        if (image) drawImageCover(context, image, cellX + 5, cellY + 3, 24, 24, 5);
        else drawImagePlaceholder(context, cellX + 5, cellY + 3, 24, "");
        textX = cellX + 35;
      }
      context.font = `700 13px ${FONT_FAMILY}`;
      context.fillStyle = "#cde0e6";
      drawEllipsized(context, row.name || "—", textX, cellY + 20,
        cellWidth - (textX - cellX) - 62);
      context.font = `900 14px ${FONT_FAMILY}`;
      context.fillStyle = row.highlight ? "#f5d36d" : "#62e7df";
      context.textAlign = "right";
      context.fillText(row.valueText || "—", cellX + cellWidth - 9, cellY + 20);
      context.textAlign = "left";
    }
  }

  function drawEquipmentColumns(context, model, summaryHeight, images) {
    const y = 194 + summaryHeight + 22;
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP * (EQUIPMENT_COLUMN_COUNT - 1)) /
      EQUIPMENT_COLUMN_COUNT;
    const items = [...model.gear, ...model.accessories];
    const columns = splitItemsIntoColumns(items, EQUIPMENT_COLUMN_COUNT);
    const title = `${model.labels.gear} · ${model.labels.accessories}`;
    const itemCount = [
      `${model.labels.gear} ${model.labels.itemCount.replace("{value}", String(model.gear.length))}`,
      `${model.labels.accessories} ${model.labels.itemCount.replace("{value}", String(model.accessories.length))}`,
    ].join(" · ");

    drawEquipmentSectionHeader(context, SIDE, y, WIDTH - SIDE * 2, title, itemCount);
    for (const [columnIndex, items] of columns.entries()) {
      const x = SIDE + columnIndex * (width + COLUMN_GAP);
      for (const [index, item] of items.entries()) {
        drawEquipmentItem(context, x, y + 50 + index * (ITEM_HEIGHT + ITEM_GAP),
          width, item, images, model.labels);
      }
    }
  }

  function splitItemsIntoColumns(items, count) {
    const rows = Math.max(1, Math.ceil(items.length / count));
    return Array.from({ length: count }, (_, index) =>
      items.slice(index * rows, (index + 1) * rows));
  }

  function drawEquipmentSectionHeader(context, x, y, width, title, itemCount) {
    context.font = `900 19px ${FONT_FAMILY}`;
    context.fillStyle = "#effbfd";
    context.fillText(title, x, y + 25);
    context.font = `800 12px ${FONT_FAMILY}`;
    context.fillStyle = "#54ddd6";
    context.textAlign = "right";
    context.fillText(itemCount, x + width, y + 24);
    context.textAlign = "left";
    context.fillStyle = "#2e6575";
    context.fillRect(x, y + 42, width, 1);
  }

  function drawEquipmentItem(context, x, y, width, item, images, labels) {
    roundedRect(context, x, y, width, ITEM_HEIGHT, 12, "#081a24", "#1d4050");
    context.fillStyle = GRADE_COLORS[item.grade] || GRADE_COLORS.Common;
    context.fillRect(x, y + 14, 3, ITEM_HEIGHT - 28);
    const icon = images.get(item.icon);
    if (icon) drawImageCover(context, icon, x + 12, y + 18, 58, 58, 5);
    else drawImagePlaceholder(context, x + 12, y + 18, 58, "?");

    const textX = x + 82;
    const textWidth = width - 96;
    context.font = `900 17px ${FONT_FAMILY}`;
    context.fillStyle = GRADE_COLORS[item.grade] || GRADE_COLORS.Common;
    drawEllipsized(context, `${item.enhanceText || ""} ${item.name || "—"}`.trim(), textX, y + 26, textWidth);
    context.font = `700 12px ${FONT_FAMILY}`;
    context.fillStyle = "#7596a5";
    drawEllipsized(context, item.slotName || "", textX, y + 44, textWidth);
    context.font = `700 13px ${FONT_FAMILY}`;
    context.fillStyle = "#a9c6d0";
    drawWrappedEllipsized(context, `${labels.itemSoul}  ${item.soulText || labels.none}`,
      textX, y + 63, textWidth, 2, 15);
    context.fillStyle = "#68ddd6";
    drawWrappedEllipsized(context, `${labels.itemStones}  ${item.stoneText || labels.none}`,
      textX, y + 94, textWidth, 2, 15);
  }

  function drawFooter(context, model, height) {
    const y = height - 48;
    context.fillStyle = "#214654";
    context.fillRect(SIDE, y - 14, WIDTH - SIDE * 2, 1);
    context.font = `700 11px ${FONT_FAMILY}`;
    context.fillStyle = "#6f8d9a";
    context.fillText(model.labels.footer, SIDE, y + 12);
    context.textAlign = "right";
    context.fillText(model.updatedAtText || "", WIDTH - SIDE, y + 12);
    context.textAlign = "left";
  }

  async function loadImages(model) {
    const urls = new Set([model.brandIcon, model.jobIcon]);
    for (const row of model.soulSkills || []) if (row.icon) urls.add(row.icon);
    for (const item of [...model.gear, ...model.accessories]) if (item.icon) urls.add(item.icon);
    return loadImageUrls(urls);
  }

  async function loadSkillImages(model) {
    const urls = new Set([model.brandIcon, model.jobIcon]);
    for (const group of model.groups || []) {
      for (const skill of group.skills || []) if (skill.icon) urls.add(skill.icon);
    }
    return loadImageUrls(urls);
  }

  async function loadArcanaImages(model) {
    const urls = new Set([model.brandIcon, model.jobIcon]);
    for (const row of model.skillTotals || []) if (row.icon) urls.add(row.icon);
    for (const card of model.cards || []) {
      if (card.icon) urls.add(card.icon);
      for (const skill of card.skills || []) if (skill.icon) urls.add(skill.icon);
    }
    return loadImageUrls(urls);
  }

  async function loadImageUrls(urls) {
    const loaded = new Map();
    await Promise.all([...urls].filter(Boolean).map(async url => {
      const image = await loadImage(url);
      if (image) loaded.set(url, image);
    }));
    return loaded;
  }

  function loadImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      const timer = window.setTimeout(() => resolve(null), 3500);
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => {
        window.clearTimeout(timer);
        resolve(image);
      };
      image.onerror = () => {
        window.clearTimeout(timer);
        resolve(null);
      };
      image.src = String(url || "");
    });
  }

  function roundedRect(context, x, y, width, height, radius, fill, stroke = "") {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 1;
      context.stroke();
    }
  }

  function drawImageCover(context, image, x, y, width, height, radius) {
    context.save();
    roundedRect(context, x, y, width, height, radius, "#102631");
    context.clip();
    const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / ratio;
    const sourceHeight = height / ratio;
    context.drawImage(image,
      (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
      sourceWidth, sourceHeight, x, y, width, height);
    context.restore();
  }

  function drawImagePlaceholder(context, x, y, size, label) {
    roundedRect(context, x, y, size, size, Math.max(4, size * .15), "#102631", "#285061");
    if (!label) return;
    context.font = `900 ${Math.max(12, size * .3)}px ${FONT_FAMILY}`;
    context.fillStyle = "#5adfd7";
    context.textAlign = "center";
    context.fillText(label, x + size / 2, y + size * .66);
    context.textAlign = "left";
  }

  function drawEllipsized(context, text, x, y, maxWidth) {
    const value = String(text || "");
    if (context.measureText(value).width <= maxWidth) {
      context.fillText(value, x, y);
      return;
    }
    let low = 0;
    let high = value.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (context.measureText(`${value.slice(0, middle)}…`).width <= maxWidth) low = middle;
      else high = middle - 1;
    }
    context.fillText(`${value.slice(0, low)}…`, x, y);
  }

  function drawWrappedEllipsized(context, text, x, y, maxWidth, maxLines, lineHeight) {
    const segments = String(text || "").split(/\s*·\s*/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const segment of segments) {
      const candidate = current ? `${current} · ${segment}` : segment;
      if (!current || context.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = segment;
      }
    }
    if (current) lines.push(current);
    if (!lines.length) lines.push("—");

    const visible = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      visible[maxLines - 1] = `${visible[maxLines - 1]} · ${lines.slice(maxLines).join(" · ")}`;
    }
    visible.forEach((line, index) =>
      drawEllipsized(context, line, x, y + index * lineHeight, maxWidth));
  }

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG creation failed")), "image/png");
    });
  }

  globalThis.NotMeterEquipmentSnapshot = Object.freeze({ createBlob, createSkillBlob, createArcanaBlob });
})();
