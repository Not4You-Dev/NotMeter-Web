(() => {
  "use strict";

  const WIDTH = 1440;
  const SIDE = 48;
  const COLUMN_GAP = 22;
  const ITEM_GAP = 8;
  const ITEM_HEIGHT = 92;
  const FONT_FAMILY = '"Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif';
  const GRADE_COLORS = Object.freeze({
    Common: "#d8e0e4", Rare: "#67ca70", Legend: "#59a9e8",
    Unique: "#f1b455", Epic: "#f27b3b", Mythic: "#ec5a5a",
  });

  async function createBlob(model) {
    if (!model || !Array.isArray(model.gear) || !Array.isArray(model.accessories)) {
      throw new Error("Invalid equipment snapshot model");
    }

    const summaryColumns = 2;
    const soulRows = Math.max(1, Math.ceil((model.soulSkills?.length || 0) / summaryColumns));
    const stoneRows = Math.max(1, Math.ceil((model.stones?.length || 0) / summaryColumns));
    const summaryHeight = 76 + Math.max(soulRows, stoneRows) * 40;
    const itemRows = Math.max(model.gear.length, model.accessories.length, 1);
    const itemAreaHeight = 56 + itemRows * ITEM_HEIGHT + Math.max(0, itemRows - 1) * ITEM_GAP;
    const height = 194 + summaryHeight + 28 + itemAreaHeight + 72;
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
    const cellWidth = (width - 40 - cellGap) / 2;
    for (const [index, row] of rows.entries()) {
      const column = index % 2;
      const line = Math.floor(index / 2);
      const cellX = x + 20 + column * (cellWidth + cellGap);
      const cellY = y + 64 + line * 40;
      roundedRect(context, cellX, cellY, cellWidth, 32, 8,
        row.highlight ? "#302b18" : "#0d2632", row.highlight ? "#7b682b" : "#1c4657");
      let textX = cellX + 10;
      if (withIcon) {
        const image = images.get(row.icon);
        if (image) drawImageCover(context, image, cellX + 5, cellY + 4, 24, 24, 5);
        else drawImagePlaceholder(context, cellX + 5, cellY + 4, 24, "");
        textX = cellX + 36;
      }
      context.font = `700 12px ${FONT_FAMILY}`;
      context.fillStyle = "#cde0e6";
      drawEllipsized(context, row.name || "—", textX, cellY + 21,
        cellWidth - (textX - cellX) - 66);
      context.font = `900 13px ${FONT_FAMILY}`;
      context.fillStyle = row.highlight ? "#f5d36d" : "#62e7df";
      context.textAlign = "right";
      context.fillText(row.valueText || "—", cellX + cellWidth - 9, cellY + 21);
      context.textAlign = "left";
    }
  }

  function drawEquipmentColumns(context, model, summaryHeight, images) {
    const y = 194 + summaryHeight + 28;
    const width = (WIDTH - SIDE * 2 - COLUMN_GAP) / 2;
    drawEquipmentColumn(context, SIDE, y, width, model.labels.gear,
      model.gear, images, model.labels);
    drawEquipmentColumn(context, SIDE + width + COLUMN_GAP, y, width,
      model.labels.accessories, model.accessories, images, model.labels);
  }

  function drawEquipmentColumn(context, x, y, width, title, items, images, labels) {
    context.font = `900 19px ${FONT_FAMILY}`;
    context.fillStyle = "#effbfd";
    context.fillText(title, x, y + 25);
    context.font = `800 12px ${FONT_FAMILY}`;
    context.fillStyle = "#54ddd6";
    context.textAlign = "right";
    context.fillText(labels.itemCount.replace("{value}", String(items.length)), x + width, y + 24);
    context.textAlign = "left";
    context.fillStyle = "#2e6575";
    context.fillRect(x, y + 42, width, 1);

    for (const [index, item] of items.entries()) {
      drawEquipmentItem(context, x, y + 56 + index * (ITEM_HEIGHT + ITEM_GAP), width, item, images, labels);
    }
    if (!items.length) {
      context.font = `700 14px ${FONT_FAMILY}`;
      context.fillStyle = "#668592";
      context.fillText(labels.none, x + 4, y + 82);
    }
  }

  function drawEquipmentItem(context, x, y, width, item, images, labels) {
    roundedRect(context, x, y, width, ITEM_HEIGHT, 12, "#081a24", "#1d4050");
    context.fillStyle = GRADE_COLORS[item.grade] || GRADE_COLORS.Common;
    context.fillRect(x, y + 14, 3, ITEM_HEIGHT - 28);
    const icon = images.get(item.icon);
    if (icon) drawImageCover(context, icon, x + 14, y + 15, 56, 56, 5);
    else drawImagePlaceholder(context, x + 14, y + 15, 56, "?");

    const textX = x + 84;
    const textWidth = width - 100;
    context.font = `900 14px ${FONT_FAMILY}`;
    context.fillStyle = GRADE_COLORS[item.grade] || GRADE_COLORS.Common;
    drawEllipsized(context, `${item.enhanceText || ""} ${item.name || "—"}`.trim(), textX, y + 24, textWidth);
    context.font = `700 10px ${FONT_FAMILY}`;
    context.fillStyle = "#7596a5";
    drawEllipsized(context, item.slotName || "", textX, y + 42, textWidth);
    context.font = `700 11px ${FONT_FAMILY}`;
    context.fillStyle = "#a9c6d0";
    drawEllipsized(context, `${labels.itemSoul}  ${item.soulText || labels.none}`, textX, y + 62, textWidth);
    context.fillStyle = "#68ddd6";
    drawEllipsized(context, `${labels.itemStones}  ${item.stoneText || labels.none}`, textX, y + 80, textWidth);
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

  function canvasBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG creation failed")), "image/png");
    });
  }

  globalThis.NotMeterEquipmentSnapshot = Object.freeze({ createBlob });
})();
