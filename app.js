import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs";

const state = {
  pdfDoc: null,
  pdfFileName: "",
  pageImages: new Map(),
  pageViewports: new Map(),
  results: [],
  selectedIndex: -1,
  apiModel: "",
  rawByPage: new Map(),
};

const $ = (id) => document.getElementById(id);

const partOrder = ["기초", "기둥", "보", "슬라브", "옹벽", "계단"];

function setProgress(text) {
  $("progress").textContent = text;
  $("summaryStatus").textContent = text;
}

function maskKey(key) {
  if (!key || key.length < 12) return "미등록";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach(k => set.add(k));
    return set;
  }, new Set()));
  return [
    headers.map(csvEscape).join(","),
    ...rows.map(row => headers.map(h => csvEscape(row[h])).join(","))
  ].join("\n");
}

function flattenResults() {
  const rows = [];
  for (const item of state.results) {
    const extracted = Array.isArray(item.extracted) ? item.extracted : [];
    if (!extracted.length) {
      rows.push(baseRow(item));
      continue;
    }
    for (const row of extracted) {
      rows.push({ ...baseRow(item), ...row });
    }
  }
  return rows;
}

function baseRow(item) {
  return {
    상태: item.status,
    파트: item.partName,
    동명: item.dongName,
    Page: item.pageNo,
    Card: item.cardIndex,
    명칭: item.name,
    부호: item.symbol,
    요약: item.summary,
  };
}

function parsePages(text, pageCount) {
  const value = (text || "").trim();
  if (!value) return [];
  const set = new Set();
  for (const part of value.split(",")) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(v => parseInt(v.trim(), 10));
      if (Number.isFinite(a) && Number.isFinite(b)) {
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
          if (i >= 1 && i <= pageCount) set.add(i);
        }
      }
    } else {
      const n = parseInt(part.trim(), 10);
      if (Number.isFinite(n) && n >= 1 && n <= pageCount) set.add(n);
    }
  }
  return [...set].sort((a, b) => a - b);
}

function fieldSchema(partName) {
  if (partName === "기초") return { "두께": "", "우마철근": "", "상부 부근": "", "하부 부근": "", "상부 주근": "", "하부 주근": "", "보강근": "" };
  if (partName === "기둥") return { "가로 사이즈": "", "세로 사이즈": "", "주근 규격": "", "주근 개소": "", "보조주근 규격": "", "보조주근 개소": "", "상부 삽입비율": "", "중앙 삽입비율": "", "하부 삽입비율": "", "대근 상": "", "대근 중": "", "대근 하": "", "보조대근 형태": "", "보조대근 X개소": "", "보조대근 Y개소": "", "보조대근 총개소": "" };
  if (partName === "슬라브") return { "두께": "", "상부 주근": "", "상부 부근": "", "하부 주근": "", "하부 부근": "", "데크 여부": "" };
  if (partName === "옹벽") return { "두께": "", "수직철근 외부": "", "수직철근 내부": "", "수평철근 외부": "", "수평철근 내부": "", "상부 CUT근": "", "하부 CUT근": "", "폭고정근1": "", "폭고정근2": "", "U.C형 Bar": "", "수직보강": "", "수평보강": "" };
  return { "비고": "" };
}

function rowsSchema(partName) {
  if (partName === "보") {
    return [
      { "위치 구분": "내단부", "상부근": "", "하부근": "", "늑근": "", "보조늑근 수직": "", "보조늑근 수평": "", "보조근1": "", "보조근2": "" },
      { "위치 구분": "중앙부", "상부근": "", "하부근": "", "늑근": "", "보조늑근 수직": "", "보조늑근 수평": "", "보조근1": "", "보조근2": "" },
      { "위치 구분": "외단부", "상부근": "", "하부근": "", "늑근": "", "보조늑근 수직": "", "보조늑근 수평": "", "보조근1": "", "보조근2": "" },
    ];
  }
  if (partName === "계단") {
    return [
      { "구간": "참부", "배근구분": "주근", "위치": "", "두께": "", "철근규격": "", "간격": "", "보강근": "" },
      { "구간": "참부", "배근구분": "부근", "위치": "", "두께": "", "철근규격": "", "간격": "", "보강근": "" },
      { "구간": "계단부", "배근구분": "주근", "위치": "", "두께": "", "철근규격": "", "간격": "", "보강근": "" },
      { "구간": "계단부", "배근구분": "부근", "위치": "", "두께": "", "철근규격": "", "간격": "", "보강근": "" },
      { "구간": "보강근", "배근구분": "보강근", "위치": "", "두께": "", "철근규격": "", "간격": "", "보강근": "" },
    ];
  }
  return [];
}

function buildPrompt(pageNo, dongName, partName, expectedCards) {
  const expected = expectedCards.map((c, i) => `${i + 1}. 명칭=${c[0]}, 부호=${c[1]}`).join("\n");
  return `
너는 건축 구조 배근자료 PDF 페이지 분석 엔진이다.
이미지 1장은 배근 카드가 3열 x 2행 또는 일부 빈칸 구조로 배치된 PDF 페이지이다.
고정 좌표로 자르지 말고, 이미지 전체를 보고 실제 카드 테두리와 카드 제목 위치를 찾아라.

페이지 정보:
- Page: ${pageNo}
- 동명: ${dongName}
- 파트: ${partName}

기대 카드 목록:
${expected}

작업:
1. 페이지 전체 이미지에서 유효 카드만 찾는다. 빈 카드 제외.
2. 카드별 bbox를 이미지 픽셀 기준 [x1,y1,x2,y2]로 반환한다.
3. 각 카드 안의 철근값을 읽어 fields 또는 rows에 입력한다.
4. card_index는 왼쪽 위부터 오른쪽 1,2,3 / 아래 4,5,6이다.
5. H16 [4]는 H16-4EA, H10 @ 200은 H10@200, H29 @ 200은 H29@200으로 통일한다.
6. 값이 없거나 '-'이면 빈 문자열로 둔다.
7. 반드시 JSON object만 반환한다.

fields 기본 형식:
${JSON.stringify(fieldSchema(partName), null, 2)}

rows 기본 형식:
${JSON.stringify(rowsSchema(partName), null, 2)}

반환:
{
  "cards": [
    {
      "card_index": 1,
      "name": "",
      "symbol": "",
      "bbox": [0,0,0,0],
      "fields": {},
      "rows": [],
      "confidence": 0.0,
      "note": ""
    }
  ]
}
`;
}

async function listModels(apiKey) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map(m => m.name.replace("models/", ""));
}

async function selectModel(apiKey, selected) {
  if (selected && selected !== "auto") return selected;
  const models = await listModels(apiKey);
  const preferred = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-pro", "gemini-2.0-flash-lite"];
  for (const p of preferred) if (models.includes(p)) return p;
  const flash = models.find(m => m.toLowerCase().includes("flash"));
  return flash || models[0];
}

async function checkApi() {
  const apiKey = $("apiKey").value.trim();
  if (!apiKey) {
    $("apiStatus").textContent = "API Key가 없습니다.";
    return;
  }
  try {
    const model = await selectModel(apiKey, $("modelSelect").value);
    state.apiModel = model;
    const body = {
      contents: [{ parts: [{ text: 'Return only this JSON: {"ok": true}' }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 64, responseMimeType: "application/json" },
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    $("apiStatus").textContent = `연결 성공 / 모델: ${model} / Key: ${maskKey(apiKey)}`;
  } catch (err) {
    $("apiStatus").textContent = `연결 오류: ${err.message}`;
  }
}

async function loadPdf(file) {
  const buffer = await file.arrayBuffer();
  state.pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  state.pdfFileName = file.name;
  state.pageImages.clear();
  state.pageViewports.clear();
  $("pdfInfo").textContent = `${file.name} / ${state.pdfDoc.numPages} pages`;
  $("summaryPages").textContent = state.pdfDoc.numPages;
  $("summaryProject").textContent = $("projectName").value || file.name;
}

async function renderPageImage(pageNo, scale = 3) {
  if (state.pageImages.has(pageNo)) return state.pageImages.get(pageNo);

  const page = await state.pdfDoc.getPage(pageNo);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;

  const dataUrl = canvas.toDataURL("image/png");
  state.pageImages.set(pageNo, { dataUrl, width: canvas.width, height: canvas.height });
  state.pageViewports.set(pageNo, viewport);
  return state.pageImages.get(pageNo);
}

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(",")[1];
}

async function analyzePage(pageNo, apiKey, model) {
  const template = window.PAGE_TEMPLATES[pageNo];
  if (!template) return [];

  const [dongName, partName, expectedCards] = template;
  if (!expectedCards.length) return [];

  const image = await renderPageImage(pageNo, 3);
  const prompt = buildPrompt(pageNo, dongName, partName, expectedCards);

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/png", data: dataUrlToBase64(image.dataUrl) } }
      ]
    }],
    generationConfig: { temperature: 0, topP: 0.1, topK: 1, maxOutputTokens: 8192, responseMimeType: "application/json" },
  };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  const raw = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
  state.rawByPage.set(pageNo, raw);

  let parsed = JSON.parse(raw);
  const apiCards = Array.isArray(parsed.cards) ? parsed.cards : [];

  return expectedCards.map((expected, idx) => {
    const cardIndex = idx + 1;
    const apiCard = matchCard(apiCards, cardIndex, expected[0], expected[1]);
    const extracted = cardToRows(apiCard, partName);
    const summary = summarize(extracted);

    return {
      status: apiCard ? "PageAPI완료" : "PageAPI확인필요",
      pageNo,
      cardIndex,
      partName,
      dongName,
      name: apiCard?.name || expected[0],
      symbol: apiCard?.symbol || expected[1],
      bbox: apiCard?.bbox || null,
      extracted,
      summary,
      confidence: apiCard?.confidence || 0,
      raw,
    };
  });
}

function matchCard(cards, index, name, symbol) {
  return cards.find(c => Number(c.card_index) === index)
    || cards.find(c => String(c.symbol || "").trim() === String(symbol || "").trim())
    || cards.find(c => String(c.name || "").trim() === String(name || "").trim())
    || null;
}

function cardToRows(card, partName) {
  if (!card) return [];
  if (Array.isArray(card.rows) && card.rows.length) return card.rows;
  if (card.fields && typeof card.fields === "object") return [card.fields];
  return [];
}

function summarize(rows) {
  const vals = [];
  for (const row of rows || []) {
    for (const [k, v] of Object.entries(row)) {
      if (v && !["위치 구분", "구간", "배근구분"].includes(k)) vals.push(`${k}:${v}`);
    }
  }
  return vals.slice(0, 4).join(" / ");
}

async function analyze() {
  if (!state.pdfDoc) return alert("PDF를 먼저 선택하세요.");
  const apiKey = $("apiKey").value.trim();
  if (!apiKey) return alert("Gemini API Key를 입력하세요.");

  const model = await selectModel(apiKey, $("modelSelect").value);
  state.apiModel = model;

  let pages = [];
  const range = $("rangeSelect").value;
  if (range === "all") {
    pages = Array.from({ length: state.pdfDoc.numPages }, (_, i) => i + 1);
  } else if (range === "current") {
    const selected = state.results[state.selectedIndex];
    pages = selected ? [selected.pageNo] : [1];
  } else {
    pages = parsePages($("customPages").value, state.pdfDoc.numPages);
  }

  if (!pages.length) return alert("분석할 페이지가 없습니다.");

  for (const pageNo of pages) {
    setProgress(`${pageNo}/${state.pdfDoc.numPages} 페이지 분석 중`);
    try {
      const pageResults = await analyzePage(pageNo, apiKey, model);
      state.results = state.results.filter(r => r.pageNo !== pageNo).concat(pageResults);
      state.results.sort((a, b) => a.pageNo - b.pageNo || a.cardIndex - b.cardIndex);
      renderAll();
    } catch (err) {
      console.error(err);
      alert(`${pageNo}페이지 분석 오류:\n${err.message.slice(0, 1000)}`);
    }
  }

  setProgress(`분석 완료 / 모델: ${model}`);
}

async function reAnalyzeSelected() {
  const item = state.results[state.selectedIndex];
  if (!item) return alert("재분석할 카드를 선택하세요.");
  $("rangeSelect").value = "current";
  await analyze();
}

function renderAll() {
  hydrateFilters();
  renderResultTable();
  $("summaryProject").textContent = $("projectName").value || state.pdfFileName || "-";
  $("summaryCards").textContent = state.results.length;
}

function hydrateFilters() {
  const currentPart = $("partFilter").value;
  const currentDong = $("dongFilter").value;
  const parts = [...new Set(state.results.map(r => r.partName).filter(Boolean))]
    .sort((a, b) => (partOrder.indexOf(a) + 100) - (partOrder.indexOf(b) + 100));
  const dongs = [...new Set(state.results.map(r => r.dongName).filter(Boolean))].sort();

  $("partFilter").innerHTML = `<option value="">전체</option>` + parts.map(p => `<option value="${p}">${p}</option>`).join("");
  $("dongFilter").innerHTML = `<option value="">전체</option>` + dongs.map(d => `<option value="${d}">${d}</option>`).join("");
  $("partFilter").value = parts.includes(currentPart) ? currentPart : "";
  $("dongFilter").value = dongs.includes(currentDong) ? currentDong : "";
}

function filteredResults() {
  const part = $("partFilter").value;
  const dong = $("dongFilter").value;
  const symbol = $("symbolFilter").value.trim().toLowerCase();
  return state.results.filter(r => {
    if (part && r.partName !== part) return false;
    if (dong && r.dongName !== dong) return false;
    if (symbol && !String(r.symbol || "").toLowerCase().includes(symbol)) return false;
    return true;
  });
}

function renderResultTable() {
  const tbody = $("resultTable").querySelector("tbody");
  const rows = filteredResults();
  tbody.innerHTML = rows.map((r) => {
    const realIndex = state.results.indexOf(r);
    return `<tr data-index="${realIndex}" class="${realIndex === state.selectedIndex ? "selected" : ""}">
      <td>${r.status}</td><td>${r.partName}</td><td>${r.dongName}</td>
      <td>${r.pageNo}</td><td>${r.cardIndex}</td><td>${r.name}</td><td>${r.symbol}</td><td>${r.summary}</td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      state.selectedIndex = Number(tr.dataset.index);
      renderResultTable();
      renderDetail();
    });
  });

  if (state.selectedIndex < 0 && state.results.length) {
    state.selectedIndex = 0;
    renderDetail();
  }
}

function renderDetail() {
  const item = state.results[state.selectedIndex];
  if (!item) return;

  const rows = item.extracted || [];
  const headers = [...rows.reduce((set, row) => {
    Object.keys(row).forEach(k => set.add(k));
    return set;
  }, new Set())];

  $("detailTable").querySelector("thead").innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
  $("detailTable").querySelector("tbody").innerHTML = rows.map(row =>
    `<tr>${headers.map(h => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  $("apiRaw").textContent = item.raw || "";

  drawPageAndCrop(item);
}

async function drawPageAndCrop(item) {
  const image = await renderPageImage(item.pageNo, 3);

  const pageCanvas = $("pageCanvas");
  const pageCtx = pageCanvas.getContext("2d");
  const img = await loadImage(image.dataUrl);
  pageCanvas.width = img.width;
  pageCanvas.height = img.height;
  pageCtx.drawImage(img, 0, 0);

  if (item.bbox) {
    const [x1, y1, x2, y2] = item.bbox.map(Number);
    pageCtx.strokeStyle = "#2563eb";
    pageCtx.lineWidth = 8;
    pageCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    const cropCanvas = $("cropCanvas");
    const cropCtx = cropCanvas.getContext("2d");
    const pad = 16;
    const sx = Math.max(0, x1 - pad);
    const sy = Math.max(0, y1 - pad);
    const sw = Math.min(img.width - sx, x2 - x1 + pad * 2);
    const sh = Math.min(img.height - sy, y2 - y1 + pad * 2);
    cropCanvas.width = sw;
    cropCanvas.height = sh;
    cropCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  } else {
    $("cropCanvas").width = 1;
    $("cropCanvas").height = 1;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function saveProject() {
  const data = {
    projectName: $("projectName").value,
    pdfFileName: state.pdfFileName,
    apiModel: state.apiModel,
    results: state.results,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("rebarProject", JSON.stringify(data));
  alert("브라우저에 프로젝트 결과를 저장했습니다. PDF 원본은 저장되지 않습니다.");
}

function loadProject() {
  const raw = localStorage.getItem("rebarProject");
  if (!raw) return alert("저장된 프로젝트가 없습니다.");
  const data = JSON.parse(raw);
  $("projectName").value = data.projectName || "";
  state.pdfFileName = data.pdfFileName || "";
  state.apiModel = data.apiModel || "";
  state.results = data.results || [];
  state.selectedIndex = state.results.length ? 0 : -1;
  renderAll();
  renderDetail();
}

function clearAll() {
  if (!confirm("분석 결과와 화면 상태를 초기화할까요?")) return;
  state.results = [];
  state.selectedIndex = -1;
  state.pageImages.clear();
  state.rawByPage.clear();
  $("resultTable").querySelector("tbody").innerHTML = "";
  $("detailTable").querySelector("thead").innerHTML = "";
  $("detailTable").querySelector("tbody").innerHTML = "";
  $("apiRaw").textContent = "";
  setProgress("초기화 완료");
}

$("pdfInput").addEventListener("change", e => {
  const file = e.target.files?.[0];
  if (file) loadPdf(file).catch(err => alert(err.message));
});
$("btnCheckApi").addEventListener("click", checkApi);
$("btnAnalyze").addEventListener("click", analyze);
$("btnReAnalyzeSelected").addEventListener("click", reAnalyzeSelected);
$("btnSaveProject").addEventListener("click", saveProject);
$("btnLoadProject").addEventListener("click", loadProject);
$("btnClearAll").addEventListener("click", clearAll);
$("partFilter").addEventListener("change", renderResultTable);
$("dongFilter").addEventListener("change", renderResultTable);
$("symbolFilter").addEventListener("input", renderResultTable);
$("btnRememberKey").addEventListener("click", () => {
  localStorage.setItem("geminiApiKey", $("apiKey").value.trim());
  alert("이 브라우저 localStorage에 저장했습니다.");
});
$("btnForgetKey").addEventListener("click", () => {
  localStorage.removeItem("geminiApiKey");
  $("apiKey").value = "";
});
$("btnExportJson").addEventListener("click", () => {
  downloadText("rebar-analysis.json", JSON.stringify({ results: state.results }, null, 2), "application/json;charset=utf-8");
});
$("btnExportCsv").addEventListener("click", () => downloadText("rebar-analysis.csv", "\ufeff" + toCsv(flattenResults()), "text/csv;charset=utf-8"));
$("btnExportExcelCsv").addEventListener("click", () => downloadText("rebar-analysis-excel.csv", "\ufeff" + toCsv(flattenResults()), "text/csv;charset=utf-8"));

const savedKey = localStorage.getItem("geminiApiKey");
if (savedKey) $("apiKey").value = savedKey;
