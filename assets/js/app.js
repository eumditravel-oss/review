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

const partFilter = document.getElementById("partFilter");
const dongFilter = document.getElementById("dongFilter");
const statusFilter = document.getElementById("statusFilter");
const keywordFilter = document.getElementById("keywordFilter");

const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");

const cardImage = document.getElementById("cardImage");
const detailTitle = document.getElementById("detailTitle");
const detailData = document.getElementById("detailData");
const rawText = document.getElementById("rawText");

const PART_NAMES = ["기초", "기둥", "보", "슬라브", "옹벽", "계단"];

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

  setStatus("분석 중입니다. PDF 페이지 수에 따라 시간이 걸릴 수 있습니다.", false);
  analyzeBtn.disabled = true;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const result = {
      projectName: "",
      sourceFile: file.name,
      pageCount: pdf.numPages,
      itemCount: 0,
      items: [],
      buildings: []
    };

    const buildingMap = new Map();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus(`분석 중: ${pageNumber} / ${pdf.numPages} Page`, false);

      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");

      const header = extractHeader(pageText, pageNumber);
      if (header.projectName && !result.projectName) {
        result.projectName = header.projectName;
      }

      const viewport = page.getViewport({ scale: 2.0 });
      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");
      pageCanvas.width = viewport.width;
      pageCanvas.height = viewport.height;

      await page.render({
        canvasContext: pageContext,
        viewport
      }).promise;

      const cardBoxes = detectCards(pageCanvas.width, pageCanvas.height);

      for (const box of cardBoxes) {
        const cardCanvas = cropCanvas(pageCanvas, box);
        const cardImageUrl = cardCanvas.toDataURL("image/png");

        const cardText = extractTextInBox(textContent.items, page.view, viewport, box);
        const title = extractCardTitle(cardText);
        const name = title.name;
        const symbol = title.symbol;

        if (!name && !symbol && normalize(cardText).length < 8) {
          continue;
        }

        const partName = classifyPart(header.partName, name, symbol, cardText);
        const dongName = header.dongName || "미확인";
        const status = name || symbol ? "자동추출" : "확인필요";

        const item = {
          page: pageNumber,
          cardIndex: box.cardIndex,
          partName,
          dongName,
          name,
          symbol,
          status,
          summary: summarizeItem(partName, cardText),
          cardImageUrl,
          rawText: normalize(cardText)
        };

        result.items.push(item);

        if (!buildingMap.has(dongName)) {
          buildingMap.set(dongName, new Map());
        }
        const partMap = buildingMap.get(dongName);
        if (!partMap.has(partName)) {
          partMap.set(partName, []);
        }
        partMap.get(partName).push(item);
      }
    }

    result.itemCount = result.items.length;
    result.buildings = Array.from(buildingMap.entries()).map(([dongName, partMap]) => ({
      dongName,
      parts: Array.from(partMap.entries()).map(([partName, items]) => ({
        partName,
        items
      }))
    }));

    analysisResult = result;

    hydrateSummary();
    hydrateFilters();
    renderTable();

    summaryPanel.classList.remove("hidden");
    mainLayout.classList.remove("hidden");

    setStatus("분석이 완료되었습니다.", false);
  } catch (error) {
    console.error(error);
    setStatus(`분석 중 오류가 발생했습니다: ${error.message}`, true);
  } finally {
    analyzeBtn.disabled = false;
  }
}

function extractHeader(text, fallbackPage) {
  const clean = normalize(text);

  const projectMatch = clean.match(/\[공사명\]\s*(.*?)\s*\[동명\]/);
  const dongMatch = clean.match(/\[동명\]\s*(.*?)\s*\(동별범위\)/);
  const pageMatch = clean.match(/(\d+)\s*Page/i);

  let partName = "미분류";
  for (const part of PART_NAMES) {
    if (clean.includes(part)) {
      partName = part;
      break;
    }
  }

  return {
    projectName: projectMatch ? projectMatch[1].trim() : "",
    dongName: dongMatch ? dongMatch[1].trim() : "",
    partName,
    pageNumber: pageMatch ? Number(pageMatch[1]) : fallbackPage
  };
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
  ctx.drawImage(
    sourceCanvas,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    box.width,
    box.height
  );

  return canvas;
}

function extractTextInBox(items, pageView, viewport, box) {
  const result = [];

  for (const item of items) {
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const x = tx[4];
    const y = tx[5];

    if (
      x >= box.x &&
      x <= box.x + box.width &&
      y >= box.y &&
      y <= box.y + box.height
    ) {
      result.push(item.str);
    }
  }

  return result.join(" ");
}

function extractCardTitle(cardText) {
  const clean = normalize(cardText);

  let name = "";
  let symbol = "";

  const nameMatch = clean.match(/\[명칭\]\s*:\s*([^\[]+?)\s*(?:\[부호\]|$)/);
  const symbolMatch = clean.match(/\[부호\]\s*:\s*([^\[]+?)(?:\s+\[명칭\]|$)/);

  if (nameMatch) {
    name = trimTitleValue(nameMatch[1]);
  }

  if (symbolMatch) {
    symbol = trimTitleValue(symbolMatch[1]);
  }

  if (!symbol) {
    const simpleSymbol = clean.match(/\b(MF\d+|SRC\d+|B\d+[A-Z-]*|G\d+\*?|S\d+|DS\d+|CS\d+|RDS\d+|RW\d+[A-Z]?|CW\d+|W\d+|SS\d+\/?|FG\d+|CJSC\d+|CJSG\d+|PD\d+|LB[^\s]*)\b/);
    if (simpleSymbol) {
      symbol = simpleSymbol[1];
    }
  }

  return { name, symbol };
}

function trimTitleValue(value) {
  return value
    .replace(/\[.*?\]/g, "")
    .replace(/[:：]/g, "")
    .trim();
}

function classifyPart(headerPart, cardName, symbol, rawText) {
  if (headerPart && headerPart !== "미분류") {
    return headerPart;
  }

  const text = `${cardName} ${symbol} ${rawText}`;

  if (/기초|독립기초|줄기초|MF|WF|SOG/.test(text)) return "기초";
  if (/기둥|기본형|SRC|CJSC|PD/.test(text)) return "기둥";
  if (/보|전단형|내\.중\.외단형|양단중앙형|인방보|LB|FG|B\d|G\d|CJSG|WG|TB/.test(text)) return "보";
  if (/슬라브|복배근|평DECK|DECK|DS|CS|RDS|S\d/.test(text)) return "슬라브";
  if (/옹벽|CUT보강|PARAPET|파라펫|RW|CW|W\d/.test(text)) return "옹벽";
  if (/계단|분할ST|일반-CUT|SS/.test(text)) return "계단";

  return "미분류";
}

function summarizeItem(partName, rawText) {
  const text = normalize(rawText);
  const bars = [...text.matchAll(/H\d+\s*[@-]\s*\d+(?:\s*EA)?/g)].map((m) =>
    m[0].replace(/\s+/g, "")
  );
  const thicknessMatch = text.match(/(?:두께|\[)\s*(\d+(?:\.\d+)?)/);
  const thickness = thicknessMatch ? thicknessMatch[1] : "";

  if (partName === "기초") return `두께 ${thickness || "-"} / 주요철근 ${bars.slice(0, 5).join(", ") || "-"}`;
  if (partName === "기둥") return `주근/대근 ${bars.slice(0, 5).join(", ") || "-"}`;
  if (partName === "보") return `상부근/하부근/늑근 검토 / ${bars.slice(0, 5).join(", ") || "-"}`;
  if (partName === "슬라브") return `두께 ${thickness || "-"} / 상하부근 ${bars.slice(0, 5).join(", ") || "-"}`;
  if (partName === "옹벽") return `두께 ${thickness || "-"} / 수직·수평·CUT근 검토 필요`;
  if (partName === "계단") return `두께 ${thickness || "-"} / 참부·계단부 주근·부근 검토 필요`;

  return text.slice(0, 90);
}

function hydrateSummary() {
  projectName.textContent = analysisResult.projectName || "-";
  sourceFile.textContent = analysisResult.sourceFile || "-";
  pageCount.textContent = analysisResult.pageCount || "-";
  itemCount.textContent = analysisResult.itemCount || "-";
}

function hydrateFilters() {
  const parts = unique(analysisResult.items.map((item) => item.partName));
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
  const item = filteredItems[index];
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
    <dt>요약</dt><dd>${escapeHtml(item.summary || "-")}</dd>
  `;

  rawText.textContent = item.rawText || "";
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
    ["상태", "파트", "동명", "Page", "Card", "명칭", "부호", "주요 정보", "원본 텍스트"],
    ...analysisResult.items.map((item) => [
      item.status,
      item.partName,
      item.dongName,
      item.page,
      item.cardIndex,
      item.name,
      item.symbol,
      item.summary,
      item.rawText
    ])
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8"
  });
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
