#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");

function parseArgs(argv) {
  const args = {
    input: "",
    pdf: "",
    html: "",
    logo: "",
    browser: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--") && !args.input) {
      args.input = part;
      continue;
    }

    if (part === "--pdf") {
      args.pdf = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (part === "--html") {
      args.html = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (part === "--logo") {
      args.logo = argv[i + 1] || "";
      i += 1;
      continue;
    }

    if (part === "--browser") {
      args.browser = argv[i + 1] || "";
      i += 1;
      continue;
    }
  }

  if (!args.input) {
    throw new Error(
      'Usage: node ./scripts/export-report-pdf.js "<report.md>" [--pdf "<report.pdf>"] [--html "<report.html>"] [--logo "<logo.png>"] [--browser "<msedge.exe>"]',
    );
  }

  return args;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value) {
  let output = escapeHtml(value);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return output;
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => renderInline(cell.trim()));
}

function isTableDivider(line) {
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell.replace(/&amp;/g, "&")));
}

function renderTable(lines) {
  const rows = lines.map(splitTableRow);
  const filteredRows = rows.filter((row) => row.some((cell) => cell.length > 0));
  if (filteredRows.length === 0) {
    return "";
  }

  const header = filteredRows[0];
  const bodyRows = filteredRows
    .slice(1)
    .filter((row, index) => !(index === 0 && isTableDivider(lines[1] || "")));

  const headHtml = `<thead><tr>${header.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>`;
  const bodyHtml = bodyRows.length
    ? `<tbody>${bodyRows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")}</tbody>`
    : "";

  return `<table>${headHtml}${bodyHtml}</table>`;
}

function renderMarkdown(markdown, fallbackTitle) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = "";
  let table = [];
  let codeBlock = [];
  let inCodeBlock = false;
  let title = fallbackTitle;

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }

    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (text) {
      blocks.push(`<p>${renderInline(text)}</p>`);
    }
    paragraph = [];
  }

  function flushList() {
    if (!list.length) {
      return;
    }

    const tag = listType === "ol" ? "ol" : "ul";
    blocks.push(
      `<${tag}>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`,
    );
    list = [];
    listType = "";
  }

  function flushTable() {
    if (!table.length) {
      return;
    }

    blocks.push(renderTable(table));
    table = [];
  }

  function flushCodeBlock() {
    if (!codeBlock.length) {
      return;
    }

    blocks.push(`<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`);
    codeBlock = [];
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      flushTable();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlock.push(rawLine);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushTable();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      if (level === 1 && headingText) {
        title = headingText;
      }
      blocks.push(`<h${level}>${renderInline(headingText)}</h${level}>`);
      continue;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph();
      flushList();
      table.push(trimmed);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushTable();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      list.push(ulMatch[1]);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushTable();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      list.push(olMatch[1]);
      continue;
    }

    flushList();
    flushTable();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushTable();
  flushCodeBlock();

  return {
    title,
    htmlBody: blocks.join("\n"),
  };
}

function detectLogo(inputPath, explicitLogo, skillDir) {
  const inputDir = path.dirname(inputPath);
  const candidates = [];

  if (explicitLogo) {
    candidates.push(path.resolve(explicitLogo));
  }

  candidates.push(path.join(skillDir, "assets", "logo.png"));
  candidates.push(path.join(skillDir, "logo.png"));
  candidates.push(path.join(inputDir, "logo.png"));

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return "";
}

function imageToDataUri(filePath) {
  if (!filePath) {
    return "";
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType =
    ext === ".svg"
      ? "image/svg+xml"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "image/png";

  const fileBuffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

function buildHtml(title, bodyHtml, logoDataUri) {
  const logoMarkup = logoDataUri
    ? `<div class="report-logo-wrap"><img class="report-logo" src="${logoDataUri}" alt="logo" /></div>`
    : "";

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 14mm 18mm 14mm;
    }

    :root {
      color-scheme: light;
      --text: #111827;
      --muted: #4b5563;
      --line: #d1d5db;
      --line-strong: #9ca3af;
      --header: #f3f4f6;
      --zebra: #fafafa;
      --accent: #0f172a;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: var(--text);
      font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
      font-size: 12px;
      line-height: 1.65;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #fff;
    }

    main {
      position: relative;
    }

    .report-logo-wrap {
      display: flex;
      justify-content: flex-end;
      margin: 0 0 8mm;
    }

    .report-logo {
      max-width: 82px;
      max-height: 24px;
      object-fit: contain;
    }

    h1,
    h2,
    h3,
    h4 {
      color: var(--accent);
      page-break-after: avoid;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 24px;
      line-height: 1.25;
    }

    h2 {
      margin: 22px 0 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--line-strong);
      font-size: 18px;
    }

    h3 {
      margin: 18px 0 8px;
      font-size: 15px;
    }

    p {
      margin: 8px 0;
    }

    ul,
    ol {
      margin: 8px 0 8px 20px;
      padding: 0;
    }

    li {
      margin: 4px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      page-break-inside: auto;
      font-size: 11px;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th,
    td {
      border: 1px solid var(--line);
      padding: 6px 8px;
      vertical-align: top;
      text-align: left;
      word-break: break-word;
    }

    th {
      background: var(--header);
      font-weight: 700;
    }

    tbody tr:nth-child(even) td {
      background: var(--zebra);
    }

    code {
      padding: 1px 4px;
      border-radius: 4px;
      background: #f4f4f5;
      font-family: "Cascadia Mono", Consolas, monospace;
      font-size: 0.95em;
    }

    pre {
      overflow: auto;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8fafc;
    }

    pre code {
      padding: 0;
      background: transparent;
    }

    a {
      color: var(--muted);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    ${logoMarkup}
    ${bodyHtml}
  </main>
</body>
</html>
`;
}

function browserCandidates(explicitBrowser) {
  if (explicitBrowser) {
    return [path.resolve(explicitBrowser)];
  }

  return [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter((candidate) => fs.existsSync(candidate));
}

function cleanupDirectory(dirPath) {
  if (dirPath && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function exportPdf(browserPath, htmlPath, pdfPath) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-pdf-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${userDataDir}`,
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ];

  try {
    const result = spawnSync(browserPath, args, {
      encoding: "utf8",
      timeout: 120000,
      windowsHide: true,
    });

    const pdfReady =
      result.status === 0 &&
      fs.existsSync(pdfPath) &&
      fs.statSync(pdfPath).size > 0;

    return {
      ok: pdfReady,
      status: result.status,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  } finally {
    cleanupDirectory(userDataDir);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const outputBase = inputPath.replace(path.extname(inputPath), "");
  const htmlPath = path.resolve(args.html || `${outputBase}.html`);
  const pdfPath = path.resolve(args.pdf || `${outputBase}.pdf`);
  const skillDir = path.resolve(__dirname, "..");
  const fallbackTitle = path.basename(outputBase);

  const markdown = fs.readFileSync(inputPath, "utf8");
  const logoPath = detectLogo(inputPath, args.logo, skillDir);
  const logoDataUri = imageToDataUri(logoPath);
  const rendered = renderMarkdown(markdown, fallbackTitle);
  const html = buildHtml(rendered.title, rendered.htmlBody, logoDataUri);

  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, "utf8");

  const browsers = browserCandidates(args.browser);
  if (!browsers.length) {
    throw new Error(`No supported browser found. HTML generated at ${htmlPath}`);
  }

  const failures = [];
  for (const browserPath of browsers) {
    const result = exportPdf(browserPath, htmlPath, pdfPath);
    if (result.ok) {
      console.log(`HTML: ${htmlPath}`);
      console.log(`PDF: ${pdfPath}`);
      if (logoPath) {
        console.log(`Logo: ${logoPath}`);
      }
      console.log(`Browser: ${browserPath}`);
      return;
    }

    failures.push(
      `${browserPath}\nstatus=${result.status}\nstdout=${result.stdout.trim()}\nstderr=${result.stderr.trim()}`,
    );
  }

  throw new Error(
    `Failed to export PDF after trying ${browsers.length} browser(s).\nHTML generated at ${htmlPath}\n${failures.join("\n\n")}`,
  );
}

try {
  main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
