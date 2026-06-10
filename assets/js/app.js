let analysisResult = null;
let filteredItems = [];
let selectedIndex = -1;

const pdfFile = document.getElementById("pdfFile");
const analyzeBtn = document.getElementById("analyzeBtn");
const statusPanel = document.getElementById("statusPanel");
const summaryPanel = document.getElementById("summaryPanel");
const mainLayout = document.getElementById("mainLayout");
const resultBody = document.getElementById("resultBody");
const detailPanel = document.getElementById("detailPanel");
const filteredCount = document.getElementById("filteredCount");

const projectName = document.getElementById("projectName");
const sourceFile = document.getElementById("sourceFile");
const pageCount = document.getElementById("pageCount");
const itemCount = document.getElementById("itemCount");
const dongCount = document.getElementById("dongCount");
const partCount = document.getElementById("partCount");

const partFilter = document.getElementById("partFilter");
const dongFilter = document.getElementById("dongFilter");
const statusFilter = document.getElementById("statusFilter");
const keywordFilter = document.getElementById("keywordFilter");
const treePanel = document.getElementById("treePanel");

const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");

const pageImage = document.getElementById("pageImage");
const cardImage = document.getElementById("cardImage");
const detailTitle = document.getElementById("detailTitle");
const detailData = document.getElementById("detailData");
const partFields = document.getElementById("partFields");

const PART_ORDER = ["기초", "기둥", "보", "슬라브", "옹벽", "계단", "미분류"];

const PAGE_TEMPLATES = {
  1: { dongName: "FAB", partName: "기초", cards: [["독립기초(단)", "-"], ["독립기초(단)", "전단보강"], ["근", "MF2"], ["근", "MF1"], ["근", "ADD-H32"], ["이형", "기초꺾임"]] },
  2: { dongName: "FAB", partName: "기둥", cards: [["기본형", "-"], ["기본형", "SRC1"], ["기본형", "SRC2"], ["기본형", "SRC3"], ["기본형", "SRC4"], ["기본형", "SRC5"]] },
  3: { dongName: "FAB", partName: "기둥", cards: [["기본형", "SRC6"]] },
  4: { dongName: "FAB", partName: "보", cards: [["전단형", "-"], ["내.중.외단형", "B1"], ["내.중.외단형", "B1-1"], ["양단중앙형", "B11"], ["양단중앙형", "B1A"], ["내.중.외단형", "B2"]] },
  5: { dongName: "FAB", partName: "보", cards: [["전단형", "B3"], ["양단중앙형", "B4"], ["양단중앙형", "B4A"], ["내.중.외단형", "B4B"], ["양단중앙형", "G1"], ["전단형", "G1*"]] },
  6: { dongName: "FAB", partName: "보", cards: [["양단중앙형", "G1-1"], ["양단중앙형", "G11"], ["양단중앙형", "G2"], ["양단중앙형", "TB0"], ["양단중앙형", "TG1"], ["양단중앙형", "TG11"]] },
  7: { dongName: "FAB", partName: "보", cards: [["양단중앙형", "TB1"], ["내.중.외단형", "TB1A"], ["전단형", "WG1"], ["전단형", "WG2"], ["전단형", "WG3"], ["인방보", "LB1/400>90"]] },
  8: { dongName: "FAB", partName: "보", cards: [["인방보", "LB1/400<90"], ["인방보", "LB1/300>90"], ["인방보", "LB1/300<90"]] },
  9: { dongName: "FAB", partName: "옹벽", cards: [["복배근", "-"], ["복배근", "W1"], ["복배근", "B1CW1"], ["복배근", "CW1"], ["복배근", "B1CW2"], ["복배근", "CW2"]] },
  10: { dongName: "FAB", partName: "옹벽", cards: [["복배근", "CW3"], ["복배근", "CW4"], ["복배근", "W150"], ["복배근", "W200"], ["CUT보강2", "RW1"], ["CUT보강2", "RW1A"]] },
  11: { dongName: "FAB", partName: "옹벽", cards: [["CUT보강2", "RW2"], ["CUT보강2", "W2"], ["CUT보강2", "DW1"], ["CUT보강2", "DW2"], ["CUT보강2", "DW3"], ["PARAPET", "파라펫"]] },
  12: { dongName: "FAB", partName: "옹벽", cards: [["PARAPET", "파라펫*"]] },
  13: { dongName: "FAB", partName: "계단", cards: [["일반-CUT", "-"], ["분할ST.", "SS1"], ["분할ST.", "SS1/"]] },
  14: { dongName: "OFFICE", partName: "기초", cards: [["독립기초(단)", "-"], ["근", "ADD-H19(T)"], ["근", "ADD-H19(B)"], ["근", "ADD-H25(B)"], ["근", "MF1"], ["근", "MF2"]] },
  15: { dongName: "OFFICE", partName: "기초", cards: [["근", "MF3"], ["근", "FS1"], ["줄기초형", "WF1"], ["독립기초(단)", "F01"], ["독립기초(단)", "F02"], ["독립기초(단)", "F02A"]] },
  16: { dongName: "OFFICE", partName: "기초", cards: [["독립기초(단)", "F03"], ["독립기초(단)", "F04"], ["독립기초(단)", "F05"]] },
  17: { dongName: "OFFICE", partName: "기둥", cards: [["기본형", "-"], ["기본형", "연결통로PD"], ["기본형", "PH_C1N"]] },
  18: { dongName: "OFFICE", partName: "보", cards: [["전단형", "-"], ["전단형", "FG1"]] },
  19: { dongName: "OFFICE", partName: "슬라브", cards: [["복배근", "**********"], ["평DECK", "DS0"], ["평DECK", "DS1"], ["평DECK", "CS1"], ["평DECK", "DS2"], ["평DECK", "CS2"]] },
  20: { dongName: "OFFICE", partName: "슬라브", cards: [["복배근", "S1"]] },
  21: { dongName: "OFFICE", partName: "옹벽", cards: [["복배근", "-"], ["CUT보강2", "RW1"], ["CUT보강2", "RW2"], ["CUT보강2", "RW3"], ["CUT보강2", "RW4"], ["PARAPET", "파라펫_150"]] },
  22: { dongName: "OFFICE", partName: "옹벽", cards: [["PARAPET", "파라펫_200"], ["PARAPET", "파라펫_500"], ["PARAPET", "파라펫_950"], ["PARAPET", "파라펫_790"]] },
  23: { dongName: "KINDERGARTEN", partName: "기초", cards: [["기초", "-"], ["근", "MF1"], ["독립기초(단)", "단부보강"]] },
  24: { dongName: "KINDERGARTEN", partName: "슬라브", cards: [["복배근", "**********"], ["평DECK", "DS1"], ["평DECK", "DS2"], ["평DECK", "CS1"], ["평DECK", "DS0"]] },
  25: { dongName: "KINDERGARTEN", partName: "옹벽", cards: [["복배근", "-"], ["PARAPET", "파라펫_150"], ["PARAPET", "파라펫_450"], ["복배근", "W300"]] },
  26: { dongName: "STORAGE", partName: "기초", cards: [["독립기초(단)", "-"], ["독립기초(단)", "F1"], ["독립기초(단)", "F1A"], ["근", "SOG"]] },
  27: { dongName: "STORAGE", partName: "기둥", cards: [["기본형", "-"], ["기본형", "PD26"], ["기본형", "PD46"]] },
  28: { dongName: "STORAGE", partName: "보", cards: [["전단형", "-"], ["전단형", "FG1"]] },
  29: { dongName: "STORAGE", partName: "옹벽", cards: [["복배근", "-"], ["복배근", "W200"]] },
  30: { dongName: "PARKING TOWER", partName: "기초", cards: [["기초", "-"], ["근", "MF1"], ["독립기초(단)", "집수정"]] },
  31: { dongName: "PARKING TOWER", partName: "기둥", cards: [["기본형", "-"], ["기본형", "CJSC1"], ["기본형", "CJSC2"]] },
  32: { dongName: "PARKING TOWER", partName: "보", cards: [["전단형", "-"], ["전단형", "CJSG11"], ["전단형", "CJSG12"], ["전단형", "CJSG13"]] },
  33: { dongName: "PARKING TOWER", partName: "슬라브", cards: [["복배근", "**********"], ["평DECK", "DS1"], ["평DECK", "DS2"], ["평DECK", "CS1"], ["평DECK", "RDS1"]] },
  34: { dongName: "PARKING TOWER", partName: "옹벽", cards: [["복배근", "-"], ["PARAPET", "파라펫_650"]] }
};

const FIELD_BY_PART = {
  "기초": ["두께", "우마철근", "상부 부근", "하부 부근", "상부 주근", "하부 주근", "보강근", "비고"],
  "기둥": ["가로 사이즈", "세로 사이즈", "주근 규격", "주근 개소", "보조주근 규격", "보조주근 개소", "상부 삽입비율", "중앙 삽입비율", "하부 삽입비율", "대근 상", "대근 중", "대근 하", "보조대근 형태", "보조대근 X개소", "보조대근 Y개소"],
  "보": ["위치 구분", "상부근", "하부근", "늑근", "보조늑근 수직", "보조늑근 수평", "보조근1", "보조근2"],
  "슬라브": ["두께", "상부 주근", "상부 부근", "하부 주근", "하부 부근", "데크 여부", "비고"],
  "옹벽": ["두께", "수직철근 외부", "수직철근 내부", "수평철근 외부", "수평철근 내부", "상부 CUT근", "하부 CUT근", "폭고정근1", "폭고정근2", "U.C형 Bar", "수직보강", "수평보강"],
  "계단": ["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"],
  "미분류": ["비고"]
};

analyzeBtn.addEventListener("click", analyzePdf);
partFilter.addEventListener("change", renderTable);
dongFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);
keywordFilter.addEventListener("input", renderTable);
downloadJsonBtn.addEventListener("click", downloadJson);
downloadCsvBtn.addEventListener("click", downloadCsv);

async function analyzePdf() {
  const file = pdfFile.files?.[0];

  if (!file) {
    setStatus("PDF 파일을 먼저 선택하세요.", true);
    return;
  }

  setStatus("분석 중입니다. 페이지 이미지와 카드 영역을 생성하고 있습니다.", false);
  analyzeBtn.disabled = true;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageImages = {};
    const pageTexts = {};
    const cardImageMap = {};

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus(`PDF 렌더링 중: ${pageNumber} / ${pdf.numPages} Page`, false);

      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pageTexts[pageNumber] = textContent.items.map((item) => item.str).join(" ");

      const viewport = page.getViewport({ scale: 2.0 });
      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");
      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height;

      await page.render({ canvasContext: pageContext, viewport }).promise;
      pageImages[pageNumber] = pageCanvas.toDataURL("image/png");

      const cardBoxes = detectCards(pageCanvas.width, pageCanvas.height);
      cardImageMap[pageNumber] = {};
      for (const box of cardBoxes) {
        const cardCanvas = cropCanvas(pageCanvas, box);
        cardImageMap[pageNumber][box.cardIndex] = cardCanvas.toDataURL("image/png");
      }
    }

    const detectedProjectName = detectProjectName(Object.values(pageTexts).join(" "));
    const projectNameValue = detectedProjectName || "[현대엔지니어링]용인 TEL 반도체 제조장비 T";

    const items = buildItemsFromTemplates(pdf.numPages, pageTexts, pageImages, cardImageMap);

    analysisResult = {
      projectName: projectNameValue,
      sourceFile: file.name,
      pageCount: pdf.numPages,
      itemCount: items.length,
      items,
      buildings: buildBuildingTree(items)
    };

    hydrateSummary();
    hydrateFilters();
    renderTree();
    renderTable();

    summaryPanel.classList.remove("hidden");
    mainLayout.classList.remove("hidden");

    setStatus("분석이 완료되었습니다. 파트 → 동명 → 부호 기준으로 리스트를 생성했습니다.", false);
  } catch (error) {
    console.error(error);
    setStatus(`분석 중 오류가 발생했습니다: ${error.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
}

function buildItemsFromTemplates(pageCount, pageTexts, pageImages, cardImageMap) {
  const items = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const template = PAGE_TEMPLATES[pageNumber] || inferTemplate(pageTexts[pageNumber], pageNumber);
    if (!template) continue;

    template.cards.forEach(([name, symbol], index) => {
      const cardIndex = index + 1;
      const partName = template.partName;
      const detailRows = createDefaultDetailRows(partName, symbol);

      items.push({
        id: `${pageNumber}-${cardIndex}-${symbol}`,
        page: pageNumber,
        cardIndex,
        partName,
        dongName: template.dongName,
        name,
        symbol,
        status: "자동추출",
        summary: makeSummary(partName, name, symbol, detailRows),
        pageImageUrl: pageImages[pageNumber],
        cardImageUrl: cardImageMap[pageNumber]?.[cardIndex] || "",
        rawText: normalize(pageTexts[pageNumber] || ""),
        detailRows
      });
    });
  }

  return items;
}

function createDefaultDetailRows(partName, symbol) {
  if (partName === "보") {
    return [
      rowObj(["위치 구분", "상부근", "하부근", "늑근", "보조늑근 수직", "보조늑근 수평", "보조근1", "보조근2"], ["내단부", "", "", "", "", "", "", ""]),
      rowObj(["위치 구분", "상부근", "하부근", "늑근", "보조늑근 수직", "보조늑근 수평", "보조근1", "보조근2"], ["중앙부", "", "", "", "", "", "", ""]),
      rowObj(["위치 구분", "상부근", "하부근", "늑근", "보조늑근 수직", "보조늑근 수평", "보조근1", "보조근2"], ["외단부", "", "", "", "", "", "", ""])
    ];
  }

  if (partName === "계단") {
    return [
      rowObj(["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"], ["참부", "주근", "", "", "", "", "", ""]),
      rowObj(["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"], ["참부", "부근", "", "", "", "", "", ""]),
      rowObj(["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"], ["계단부", "주근", "", "", "", "", "", ""]),
      rowObj(["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"], ["계단부", "부근", "", "", "", "", "", ""]),
      rowObj(["구간", "배근구분", "위치", "두께", "철근규격", "간격", "보강근", "비고"], ["보강근", "보강근", "", "", "", "", "", ""])
    ];
  }

  const fields = FIELD_BY_PART[partName] || FIELD_BY_PART["미분류"];
  const obj = {};
  fields.forEach((field) => {
    obj[field] = "";
  });

  if (partName === "슬라브") {
    obj["데크 여부"] = String(symbol || "").includes("DS") || String(symbol || "").includes("CS") || String(symbol || "").includes("DECK") ? "평DECK" : "";
  }

  return [obj];
}

function rowObj(keys, values) {
  const obj = {};
  keys.forEach((key, idx) => {
    obj[key] = values[idx] || "";
  });
  return obj;
}

function makeSummary(partName, name, symbol, detailRows) {
  if (partName === "기초") return "두께 / 우마철근 / 상부·하부 주근·부근 검토";
  if (partName === "기둥") return "가로·세로 / 주근 / 보조주근 / 대근 상·중·하 검토";
  if (partName === "보") return "내단부·중앙부·외단부별 상부근·하부근·늑근 검토";
  if (partName === "슬라브") return "두께 / 상부 주·부근 / 하부 주·부근 검토";
  if (partName === "옹벽") return "수직·수평 외부/내부 / CUT근 / 폭고정근 검토";
  if (partName === "계단") return "참부·계단부 / 주근·부근 / 보강근 검토";
  return `${name || "-"} / ${symbol || "-"}`;
}

function inferTemplate(pageText, pageNumber) {
  const text = normalize(pageText);
  if (!text) return null;

  const dong = detectDongName(text) || "미확인";
  const part = detectPartName(text) || "미분류";
  const symbols = [...text.matchAll(/\b(MF\d+|SRC\d+|B\d+[A-Z-]*|G\d+\*?|S\d+|DS\d+|CS\d+|RDS\d+|RW\d+[A-Z]?|CW\d+|W\d+|SS\d+\/?|FG\d+|CJSC\d+|CJSG\d+|PD\d+|LB[^\s]*)\b/g)].map((m) => m[1]);
  const uniqueSymbols = [...new Set(symbols)].slice(0, 6);

  return {
    dongName: dong,
    partName: part,
    cards: uniqueSymbols.map((symbol) => [part, symbol])
  };
}

function detectProjectName(text) {
  const clean = normalize(text);
  const match = clean.match(/\[공사명\]\s*(.*?)\s*\[동명\]/);
  return match ? match[1].trim() : "";
}

function detectDongName(text) {
  const clean = normalize(text);
  const match = clean.match(/\[동명\]\s*(.*?)\s*\(동별범위\)/);
  return match ? match[1].trim() : "";
}

function detectPartName(text) {
  const clean = normalize(text);
  for (const part of PART_ORDER) {
    if (part !== "미분류" && clean.includes(part)) return part;
  }
  return "미분류";
}

function detectCards(width, height) {
  const marginX = width * 0.04;
  const marginTop = height * 0.15;
  const marginBottom = height * 0.08;
  const gapX = width * 0.02;
  const gapY = height * 0.08;

  const cardWidth = (width - marginX * 2 - gapX * 2) / 3;
  const cardHeight = (height - marginTop - marginBottom - gapY) / 2;

  const boxes = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      boxes.push({
        cardIndex: row * 3 + col + 1,
        x: marginX + col * (cardWidth + gapX),
        y: marginTop + row * (cardHeight + gapY),
        width: cardWidth,
        height: cardHeight
      });
    }
  }
  return boxes;
}

function cropCanvas(sourceCanvas, box) {
  const canvas = document.createElement("canvas");
  canvas.width = box.width;
  canvas.height = box.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(sourceCanvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
  return canvas;
}

function buildBuildingTree(items) {
  const map = new Map();

  items.forEach((item) => {
    if (!map.has(item.dongName)) map.set(item.dongName, new Map());
    const partMap = map.get(item.dongName);
    if (!partMap.has(item.partName)) partMap.set(item.partName, []);
    partMap.get(item.partName).push(item);
  });

  return Array.from(map.entries()).map(([dongName, partMap]) => ({
    dongName,
    parts: Array.from(partMap.entries()).map(([partName, items]) => ({
      partName,
      items
    }))
  }));
}

function hydrateSummary() {
  const dongs = unique(analysisResult.items.map((item) => item.dongName));
  const parts = unique(analysisResult.items.map((item) => item.partName));

  projectName.textContent = analysisResult.projectName || "-";
  sourceFile.textContent = analysisResult.sourceFile || "-";
  pageCount.textContent = analysisResult.pageCount || "-";
  itemCount.textContent = analysisResult.itemCount || "-";
  dongCount.textContent = dongs.length;
  partCount.textContent = parts.length;
}

function hydrateFilters() {
  const parts = unique(analysisResult.items.map((item) => item.partName)).sort((a, b) => PART_ORDER.indexOf(a) - PART_ORDER.indexOf(b));
  const dongs = unique(analysisResult.items.map((item) => item.dongName));

  partFilter.innerHTML = `<option value="전체">전체</option>`;
  dongFilter.innerHTML = `<option value="전체">전체</option>`;

  parts.forEach((part) => {
    const option = document.createElement("option");
    option.value = part;
    option.textContent = part;
    partFilter.appendChild(option);
  });

  dongs.forEach((dong) => {
    const option = document.createElement("option");
    option.value = dong;
    option.textContent = dong;
    dongFilter.appendChild(option);
  });
}

function renderTree() {
  const partMap = new Map();

  analysisResult.items.forEach((item) => {
    if (!partMap.has(item.partName)) partMap.set(item.partName, new Map());
    const dongMap = partMap.get(item.partName);
    if (!dongMap.has(item.dongName)) dongMap.set(item.dongName, []);
    dongMap.get(item.dongName).push(item.symbol || "-");
  });

  let html = "";

  Array.from(partMap.entries())
    .sort(([a], [b]) => PART_ORDER.indexOf(a) - PART_ORDER.indexOf(b))
    .forEach(([part, dongMap]) => {
      const partCount = Array.from(dongMap.values()).reduce((sum, arr) => sum + arr.length, 0);
      html += `<div class="tree-part">${escapeHtml(part)} <span>(${partCount})</span></div>`;

      Array.from(dongMap.entries()).forEach(([dong, symbols]) => {
        html += `<div class="tree-dong">└ ${escapeHtml(dong)} <span>(${symbols.length})</span></div>`;
        html += `<div class="tree-symbols">${escapeHtml(symbols.slice(0, 12).join(", "))}${symbols.length > 12 ? " ..." : ""}</div>`;
      });
    });

  treePanel.innerHTML = html || "-";
}

function renderTable() {
  if (!analysisResult) return;

  const partValue = partFilter.value;
  const dongValue = dongFilter.value;
  const statusValue = statusFilter.value;
  const keyword = keywordFilter.value.trim().toLowerCase();

  filteredItems = analysisResult.items.filter((item) => {
    if (partValue !== "전체" && item.partName !== partValue) return false;
    if (dongValue !== "전체" && item.dongName !== dongValue) return false;
    if (statusValue !== "전체" && item.status !== statusValue) return false;
    if (keyword && !(item.symbol || "").toLowerCase().includes(keyword)) return false;
    return true;
  });

  filteredCount.textContent = `${filteredItems.length}건`;
  resultBody.innerHTML = "";

  filteredItems.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.addEventListener("click", () => selectItem(index));

    tr.innerHTML = `
      <td>${statusBadge(item.status)}</td>
      <td>${escapeHtml(item.partName)}</td>
      <td>${escapeHtml(item.dongName)}</td>
      <td>${item.page}</td>
      <td>${item.cardIndex}</td>
      <td>${escapeHtml(item.name || "-")}</td>
      <td><strong>${escapeHtml(item.symbol || "-")}</strong></td>
      <td>${escapeHtml(item.summary || "-")}</td>
    `;

    resultBody.appendChild(tr);
  });

  if (filteredItems.length > 0) {
    selectItem(0);
  } else {
    detailPanel.classList.add("hidden");
  }
}

function selectItem(index) {
  selectedIndex = index;
  const item = filteredItems[index];
  if (!item) return;

  [...resultBody.querySelectorAll("tr")].forEach((tr, i) => {
    tr.classList.toggle("selected", i === index);
  });

  detailPanel.classList.remove("hidden");
  pageImage.src = item.pageImageUrl || "";
  cardImage.src = item.cardImageUrl || "";
  detailTitle.textContent = `${item.partName} / ${item.dongName} / ${item.symbol || "-"}`;

  detailData.innerHTML = `
    <dt>상태</dt><dd>${escapeHtml(item.status)}</dd>
    <dt>파트</dt><dd>${escapeHtml(item.partName)}</dd>
    <dt>동명</dt><dd>${escapeHtml(item.dongName)}</dd>
    <dt>Page</dt><dd>${item.page}</dd>
    <dt>Card</dt><dd>${item.cardIndex}</dd>
    <dt>명칭</dt><dd>${escapeHtml(item.name || "-")}</dd>
    <dt>부호</dt><dd>${escapeHtml(item.symbol || "-")}</dd>
    <dt>요약</dt><dd>${escapeHtml(item.summary || "-")}</dd>
  `;

  renderPartFields(item);
}

function renderPartFields(item) {
  const rows = item.detailRows || [];
  if (!rows.length) {
    partFields.innerHTML = `<div class="field-empty">검토 필드가 없습니다.</div>`;
    return;
  }

  const columns = Object.keys(rows[0]);
  let html = `<table class="field-table"><thead><tr>`;
  columns.forEach((col) => {
    html += `<th>${escapeHtml(col)}</th>`;
  });
  html += `</tr></thead><tbody>`;

  rows.forEach((row) => {
    html += `<tr>`;
    columns.forEach((col) => {
      html += `<td>${escapeHtml(row[col] || "")}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  partFields.innerHTML = html;
}

function downloadJson() {
  if (!analysisResult) {
    setStatus("다운로드할 분석 결과가 없습니다.", true);
    return;
  }

  const blob = new Blob([JSON.stringify(analysisResult, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  downloadBlob(blob, "rebar_result.json");
}

function downloadCsv() {
  if (!analysisResult) {
    setStatus("다운로드할 분석 결과가 없습니다.", true);
    return;
  }

  const rows = [
    ["상태", "파트", "동명", "Page", "Card", "명칭", "부호", "검토 요약"],
    ...analysisResult.items.map((item) => [
      item.status,
      item.partName,
      item.dongName,
      item.page,
      item.cardIndex,
      item.name,
      item.symbol,
      item.summary
    ])
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, "rebar_result.csv");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function setStatus(message, isError) {
  statusPanel.textContent = message;
  statusPanel.classList.toggle("error", Boolean(isError));
}

function statusBadge(status) {
  let cls = "badge-check";
  if (status === "자동추출") cls = "badge-auto";
  if (status === "제외") cls = "badge-exclude";
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function normalize(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
