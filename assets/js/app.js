let analysisResult = null;
let filteredItems = [];
let selectedIndex = -1;
let currentItem = null;

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

const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");
const ocrBtn = document.getElementById("ocrBtn");

const cardImage = document.getElementById("cardImage");
const detailTitle = document.getElementById("detailTitle");
const detailData = document.getElementById("detailData");
const partFields = document.getElementById("partFields");
const rawText = document.getElementById("rawText");

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

analyzeBtn.addEventListener("click", analyzePdf);
partFilter.addEventListener("change", renderTable);
dongFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);
keywordFilter.addEventListener("input", renderTable);
downloadJsonBtn.addEventListener("click", downloadJson);
downloadCsvBtn.addEventListener("click", downloadCsv);
ocrBtn.addEventListener("click", runOcrForSelectedCard);

async function analyzePdf() {
  const file = pdfFile.files?.[0];

  if (!file) {
    setStatus("PDF 파일을 먼저 선택하세요.", true);
    return;
  }

  setStatus("분석 중입니다. PDF 텍스트와 카드 영역을 추출하고 있습니다.", false);
  analyzeBtn.disabled = true;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pageData = {};
    const items = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus(`분석 중: ${pageNumber} / ${pdf.numPages} Page`, false);

      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const boxes = detectCards(canvas.width, canvas.height);
      pageData[pageNumber] = { canvas, pageText, textContent, viewport, boxes };

      const template = PAGE_TEMPLATES[pageNumber] || inferTemplate(pageText, pageNumber);

      if (!template) continue;

      template.cards.forEach(([name, symbol], idx) => {
        const cardIndex = idx + 1;
        const box = boxes[idx] || boxes[0];
        const cardCanvas = cropCanvas(canvas, box);
        const cardText = extractTextInBox(textContent.items, viewport, box);
        const mergedText = normalize(`${cardText} ${pageText}`);

        const item = {
          id: `${pageNumber}-${cardIndex}-${symbol}`,
          page: pageNumber,
          cardIndex,
          partName: template.partName,
          dongName: template.dongName,
          name,
          symbol,
          status: "자동추출",
          rawText: normalize(cardText || pageText),
          cardImageUrl: cardCanvas.toDataURL("image/png"),
          extracted: parseByPart(template.partName, normalize(cardText || pageText), name, symbol),
        };

        item.summary = summarizeExtracted(item.partName, item.extracted);
        items.push(item);
      });
    }

    const projectText = Object.values(pageData).map((p) => p.pageText).join(" ");
    const detectedProjectName = detectProjectName(projectText);

    analysisResult = {
      projectName: detectedProjectName || "[현대엔지니어링]용인 TEL 반도체 제조장비 T",
      sourceFile: file.name,
      pageCount: pdf.numPages,
      itemCount: items.length,
      items,
    };

    hydrateSummary();
    hydrateFilters();
    renderTable();

    summaryPanel.classList.remove("hidden");
    mainLayout.classList.remove("hidden");

    setStatus("분석이 완료되었습니다. 값이 비어 있는 항목은 선택 후 OCR 정밀분석을 실행하세요.", false);
  } catch (error) {
    console.error(error);
    setStatus(`분석 중 오류가 발생했습니다: ${error.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
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

function extractTextInBox(items, viewport, box) {
  const result = [];

  for (const item of items) {
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const x = tx[4];
    const y = tx[5];

    if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
      result.push(item.str);
    }
  }

  return result.join(" ");
}

async function runOcrForSelectedCard() {
  if (!currentItem) return;

  setStatus("선택 카드 OCR 정밀분석 중입니다. 잠시 기다리세요.", false);
  ocrBtn.disabled = true;

  try {
    const { data } = await Tesseract.recognize(currentItem.cardImageUrl, "kor+eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setStatus(`OCR 분석 중: ${Math.round(m.progress * 100)}%`, false);
        }
      }
    });

    currentItem.ocrText = normalize(data.text);
    currentItem.rawText = normalize(`${currentItem.rawText}\n\n[OCR]\n${currentItem.ocrText}`);
    currentItem.extracted = mergeExtracted(
      currentItem.extracted,
      parseByPart(currentItem.partName, currentItem.ocrText, currentItem.name, currentItem.symbol)
    );
    currentItem.status = "OCR완료";
    currentItem.summary = summarizeExtracted(currentItem.partName, currentItem.extracted);

    setStatus("OCR 정밀분석이 완료되었습니다.", false);
    renderTable();
    const idx = filteredItems.findIndex((x) => x.id === currentItem.id);
    selectItem(idx >= 0 ? idx : 0);
  } catch (error) {
    console.error(error);
    setStatus(`OCR 분석 중 오류가 발생했습니다: ${error.message}`, true);
  } finally {
    ocrBtn.disabled = false;
  }
}

function parseByPart(partName, text, name, symbol) {
  const clean = normalize(text).replace(/[［］]/g, "[]");
  const rebars = extractRebars(clean);
  const dims = extractNumbersInBrackets(clean);

  if (partName === "기초") return parseFoundation(clean, rebars, dims);
  if (partName === "기둥") return parseColumn(clean, rebars, dims);
  if (partName === "보") return parseBeam(clean, rebars, dims);
  if (partName === "슬라브") return parseSlab(clean, rebars, dims, name, symbol);
  if (partName === "옹벽") return parseWall(clean, rebars, dims);
  if (partName === "계단") return parseStair(clean, rebars, dims);
  return [{ "비고": "" }];
}

function extractRebars(text) {
  const patterns = [
    /H\s*\d+\s*@\s*\d+/gi,
    /H\s*\d+\s*-\s*\d+\s*EA/gi,
    /H\s*\d+\s*\+\s*[^\\s\\]]*?\s*@\s*\d+/gi,
    /H\s*\d+\s*\+\s*H\s*@\s*\d+/gi
  ];

  const values = [];
  patterns.forEach((re) => {
    const matches = text.match(re) || [];
    matches.forEach((m) => values.push(cleanRebar(m)));
  });

  return [...new Set(values)];
}

function cleanRebar(value) {
  return String(value).replace(/\s+/g, "").replace(/[()]/g, "");
}

function extractNumbersInBrackets(text) {
  return [...text.matchAll(/\[(\d+(?:\.\d+)?)\]/g)].map((m) => m[1]);
}

function findThickness(text, dims) {
  const t1 = text.match(/두께\s*[:：]?\s*\[?(\d+(?:\.\d+)?)\]?/);
  if (t1) return t1[1];

  const likely = dims.find((n) => Number(n) >= 0.05 && Number(n) <= 3.0);
  return likely || "";
}

function parseFoundation(text, rebars, dims) {
  const thickness = findThickness(text, dims);
  const chairBar = rebars.find((r) => /@2000/i.test(r)) || "";
  const hBars = rebars.filter((r) => !/@2000/i.test(r));

  return [{
    "두께": thickness,
    "우마철근": chairBar,
    "상부 부근": hBars[0] || "",
    "하부 부근": hBars[1] || "",
    "상부 주근": hBars[2] || "",
    "하부 주근": hBars[3] || "",
    "보강근": hBars.slice(4).join(", "),
    "비고": ""
  }];
}

function parseColumn(text, rebars, dims) {
  const sizeCandidates = dims.filter((n) => Number(n) > 0.1 && Number(n) < 3.0);
  const eaMatches = [...text.matchAll(/H\s*(\d+)\s*-\s*(\d+)\s*EA/gi)];
  const atBars = rebars.filter((r) => /@\d+/.test(r));
  const ratios = [...text.matchAll(/0\.\d+/g)].map((m) => m[0]);
  const shapeMatch = text.match(/형태\s*[:：]?\s*\[?(\d+)\]?/);

  const xMatch = text.match(/X\s*\(?가로\)?\s*[:：]?\s*\[?(\d*)\]?/i);
  const yMatch = text.match(/Y\s*\(?세로\)?\s*[:：]?\s*\[?(\d*)\]?/i);
  const xCount = xMatch?.[1] || "";
  const yCount = yMatch?.[1] || "";
  const total = xCount && yCount ? String(Number(xCount) + Number(yCount)) : "";

  return [{
    "가로 사이즈": sizeCandidates[0] || "",
    "세로 사이즈": sizeCandidates[1] || "",
    "주근 규격": eaMatches[0] ? `H${eaMatches[0][1]}` : "",
    "주근 개소": eaMatches[0] ? `${eaMatches[0][2]}EA` : "",
    "보조주근 규격": eaMatches[1] ? `H${eaMatches[1][1]}` : "",
    "보조주근 개소": eaMatches[1] ? `${eaMatches[1][2]}EA` : "",
    "상부 삽입비율": ratios[0] || "",
    "중앙 삽입비율": ratios[1] || "",
    "하부 삽입비율": ratios[2] || "",
    "대근 상": atBars[0] || "",
    "대근 중": atBars[1] || "",
    "대근 하": atBars[2] || "",
    "보조대근 형태": shapeMatch?.[1] || "",
    "보조대근 X개소": xCount,
    "보조대근 Y개소": yCount,
    "보조대근 총개소": total
  }];
}

function parseBeam(text, rebars, dims) {
  const zones = ["내단부", "중앙부", "외단부"];
  return zones.map((zone, zi) => ({
    "위치 구분": zone,
    "상부근": rebars[zi * 6 + 0] || "",
    "하부근": rebars[zi * 6 + 1] || "",
    "늑근": rebars[zi * 6 + 2] || "",
    "보조늑근 수직": rebars[zi * 6 + 3] || "",
    "보조늑근 수평": rebars[zi * 6 + 4] || "",
    "보조근1": rebars[zi * 6 + 5] || "",
    "보조근2": ""
  }));
}

function parseSlab(text, rebars, dims, name, symbol) {
  return [{
    "두께": findThickness(text, dims),
    "상부 주근": rebars[0] || "",
    "상부 부근": rebars[1] || "",
    "하부 주근": rebars[2] || "",
    "하부 부근": rebars[3] || "",
    "데크 여부": /DECK|평DECK|DS|CS|RDS/i.test(`${text} ${name} ${symbol}`) ? "평DECK" : "",
    "비고": ""
  }];
}

function parseWall(text, rebars, dims) {
  return [{
    "두께": findThickness(text, dims),
    "수직철근 외부": rebars[0] || "",
    "수직철근 내부": rebars[1] || "",
    "수평철근 외부": rebars[2] || "",
    "수평철근 내부": rebars[3] || "",
    "상부 CUT근": rebars[4] || "",
    "하부 CUT근": rebars[5] || "",
    "폭고정근1": rebars.find((r) => /1000/.test(r)) || "",
    "폭고정근2": rebars.find((r) => /200/.test(r)) || "",
    "U.C형 Bar": text.match(/U\\.?C[^\\s]*/i)?.[0] || "",
    "수직보강": "",
    "수평보강": ""
  }];
}

function parseStair(text, rebars, dims) {
  const thickness = findThickness(text, dims);
  return [
    { "구간": "참부", "배근구분": "주근", "위치": "", "두께": thickness, "철근규격": rebars[0] || "", "간격": spacing(rebars[0]), "보강근": "", "비고": "" },
    { "구간": "참부", "배근구분": "부근", "위치": "", "두께": thickness, "철근규격": rebars[1] || "", "간격": spacing(rebars[1]), "보강근": "", "비고": "" },
    { "구간": "계단부", "배근구분": "주근", "위치": "", "두께": thickness, "철근규격": rebars[2] || "", "간격": spacing(rebars[2]), "보강근": "", "비고": "" },
    { "구간": "계단부", "배근구분": "부근", "위치": "", "두께": thickness, "철근규격": rebars[3] || "", "간격": spacing(rebars[3]), "보강근": "", "비고": "" },
    { "구간": "보강근", "배근구분": "보강근", "위치": "", "두께": thickness, "철근규격": "", "간격": "", "보강근": rebars.filter((r) => /EA/i.test(r)).join(", "), "비고": "" }
  ];
}

function spacing(rebar) {
  const m = String(rebar || "").match(/@(\d+)/);
  return m ? `@${m[1]}` : "";
}

function mergeExtracted(oldRows, newRows) {
  return oldRows.map((oldRow, idx) => {
    const newRow = newRows[idx] || {};
    const merged = { ...oldRow };
    Object.keys(merged).forEach((key) => {
      if (!merged[key] && newRow[key]) merged[key] = newRow[key];
    });
    return merged;
  });
}

function summarizeExtracted(partName, rows) {
  const values = [];
  rows.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (value && !["비고"].includes(key)) values.push(`${key}:${value}`);
    });
  });

  if (values.length) return values.slice(0, 6).join(" / ");

  if (partName === "기초") return "두께 / 우마철근 / 상부·하부 주근·부근 추출 필요";
  if (partName === "기둥") return "가로·세로 / 주근 / 보조주근 / 대근 추출 필요";
  if (partName === "보") return "내단부·중앙부·외단부별 철근 추출 필요";
  if (partName === "슬라브") return "두께 / 상부·하부 주근·부근 추출 필요";
  if (partName === "옹벽") return "수직·수평 / CUT근 / 폭고정근 추출 필요";
  if (partName === "계단") return "참부·계단부 / 주근·부근 / 보강근 추출 필요";
  return "추출 필요";
}

function inferTemplate(pageText, pageNumber) {
  const text = normalize(pageText);
  if (!text) return null;

  return {
    dongName: detectDongName(text) || "미확인",
    partName: detectPartName(text) || "미분류",
    cards: extractSymbols(text).map((symbol) => ["", symbol]).slice(0, 6)
  };
}

function extractSymbols(text) {
  return [...new Set([...text.matchAll(/\b(MF\d+|SRC\d+|B\d+[A-Z-]*|G\d+\*?|S\d+|DS\d+|CS\d+|RDS\d+|RW\d+[A-Z]?|CW\d+|W\d+|SS\d+\/?|FG\d+|CJSC\d+|CJSG\d+|PD\d+|LB[^\s]*)\b/g)].map((m) => m[1]))];
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
  currentItem = filteredItems[index];
  const item = currentItem;
  if (!item) return;

  [...resultBody.querySelectorAll("tr")].forEach((tr, i) => {
    tr.classList.toggle("selected", i === index);
  });

  detailPanel.classList.remove("hidden");
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
  `;

  rawText.textContent = item.rawText || "";
  renderPartFields(item);
}

function renderPartFields(item) {
  const rows = item.extracted || [];
  if (!rows.length) {
    partFields.innerHTML = `<div>추출 필드가 없습니다.</div>`;
    return;
  }

  const columns = Object.keys(rows[0]);
  let html = `<table class="field-table"><thead><tr>`;
  columns.forEach((col) => html += `<th>${escapeHtml(col)}</th>`);
  html += `</tr></thead><tbody>`;

  rows.forEach((row, rowIndex) => {
    html += `<tr>`;
    columns.forEach((col) => {
      const value = row[col] || "";
      html += `<td><input class="value-input ${value ? "detected" : ""}" value="${escapeAttr(value)}" data-row="${rowIndex}" data-col="${escapeAttr(col)}" /></td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  partFields.innerHTML = html;

  partFields.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const row = Number(e.target.dataset.row);
      const col = e.target.dataset.col;
      currentItem.extracted[row][col] = e.target.value;
      currentItem.summary = summarizeExtracted(currentItem.partName, currentItem.extracted);
    });
  });
}

function downloadJson() {
  if (!analysisResult) return setStatus("다운로드할 분석 결과가 없습니다.", true);
  const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, "rebar_result.json");
}

function downloadCsv() {
  if (!analysisResult) return setStatus("다운로드할 분석 결과가 없습니다.", true);

  const rows = [["상태", "파트", "동명", "Page", "Card", "명칭", "부호", "필드", "값"]];
  analysisResult.items.forEach((item) => {
    item.extracted.forEach((row, rowIdx) => {
      Object.entries(row).forEach(([key, value]) => {
        rows.push([item.status, item.partName, item.dongName, item.page, item.cardIndex, item.name, item.symbol, key, value]);
      });
    });
  });

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
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function setStatus(message, isError) {
  statusPanel.textContent = message;
  statusPanel.classList.toggle("error", Boolean(isError));
}

function statusBadge(status) {
  let cls = "badge-check";
  if (status === "자동추출") cls = "badge-auto";
  if (status === "OCR완료") cls = "badge-ocr";
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

function escapeAttr(value) {
  return escapeHtml(value);
}
