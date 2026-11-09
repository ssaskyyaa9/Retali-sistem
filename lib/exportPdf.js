/**
 * Helper untuk mengexport materi (title, sub_title, description, content) langsung ke PDF
 * menggunakan browser print preview dengan format cetak profesional yang bersih, rapi, dan enak dilihat.
 */
export function exportMateriToPDF({
  title,
  sub_title,
  description,
  content,
}) {
  if (typeof window === "undefined") return;

  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const formatContent = (html) => {
    if (!html || html.trim() === "" || html === "<p><br></p>") {
      return "<p style='color: #64748b; font-style: italic; margin: 0;'>Belum ada materi penjelasan yang diisi.</p>";
    }
    return html.replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ");
  };

  const cleanTitle = (title || "Materi").trim();
  const cleanSubtitle = sub_title ? String(sub_title).trim() : "";
  const cleanDescription = description ? String(description).trim() : "";
  const cleanContent = formatContent(content);

  // Hapus iframe print lama jika masih ada di DOM
  const existingFrame = document.getElementById("retali-print-frame");
  if (existingFrame) {
    try {
      existingFrame.remove();
    } catch {
      // Abaikan jika gagal menghapus
    }
  }

  // Buat iframe tersembunyi untuk mencetak konten
  const iframe = document.createElement("iframe");
  iframe.id = "retali-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    alert("Gagal memuat dokumen cetak PDF.");
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cleanTitle)}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    @media print {
      html, body {
        background: #ffffff !important;
        color: #0f172a !important;
        width: 100% !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13.5px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Bagian Header Dokumen: Title, Sub Title, Description */
    .doc-header {
      margin: 0 0 16px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      letter-spacing: -0.025em;
      margin: 0 0 8px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-subtitle {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      line-height: 1.4;
      margin: 0 0 12px 0;
      letter-spacing: -0.01em;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-description {
      font-size: 13.5px;
      line-height: 1.65;
      color: #475569;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3.5px solid #2563eb;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 12px 0 0 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Garis Pembatas Header dan Content */
    .doc-divider {
      border: 0;
      height: 1px;
      background-color: #e2e8f0;
      margin: 20px 0 24px 0;
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Konten Materi */
    .doc-content {
      color: #1e293b;
      font-size: 13.5px;
      line-height: 1.75;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .doc-content p {
      margin: 0 0 14px 0;
      line-height: 1.75;
    }
    .doc-content p:last-child {
      margin-bottom: 0;
    }
    .doc-content h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 24px 0 10px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-content h2 {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 20px 0 8px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-content h3 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 16px 0 6px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-content h4, .doc-content h5, .doc-content h6 {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 14px 0 4px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .doc-content ul {
      list-style-type: disc;
      padding-left: 24px;
      margin: 0 0 14px 0;
    }
    .doc-content ol {
      list-style-type: decimal;
      padding-left: 24px;
      margin: 0 0 14px 0;
    }
    .doc-content li {
      margin-bottom: 6px;
      line-height: 1.7;
    }
    .doc-content li::marker {
      color: #64748b;
    }
    .doc-content blockquote {
      border-left: 3.5px solid #cbd5e1;
      background-color: #f8fafc;
      padding: 10px 16px;
      margin: 16px 0;
      color: #475569;
      font-style: italic;
      border-radius: 0 6px 6px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 16px auto;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 13px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-content table th, .doc-content table td {
      border: 1px solid #cbd5e1;
      padding: 9px 12px;
      text-align: left;
      vertical-align: top;
    }
    .doc-content table th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }
    .doc-content table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .doc-content a {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .doc-content code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .doc-content pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      line-height: 1.6;
      background-color: #0f172a;
      color: #f8fafc;
      padding: 14px 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .doc-content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }
    .doc-content hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }

    /* Format alignment & indent dari editor Quill */
    .doc-content .ql-align-center { text-align: center; }
    .doc-content .ql-align-right { text-align: right; }
    .doc-content .ql-align-justify { text-align: justify; }
    .doc-content .ql-indent-1 { padding-left: 24px; }
    .doc-content .ql-indent-2 { padding-left: 48px; }
    .doc-content .ql-indent-3 { padding-left: 72px; }
    .doc-content .ql-indent-4 { padding-left: 96px; }
    .doc-content .ql-indent-5 { padding-left: 120px; }
    .doc-content .ql-indent-6 { padding-left: 144px; }
    .doc-content .ql-indent-7 { padding-left: 168px; }
    .doc-content .ql-indent-8 { padding-left: 192px; }
    .doc-content .ql-size-small { font-size: 11.5px; }
    .doc-content .ql-size-large { font-size: 17px; }
    .doc-content .ql-size-huge { font-size: 22px; }
  </style>
</head>
<body>
  <header class="doc-header">
    <h1 class="doc-title">${escapeHtml(cleanTitle)}</h1>
    ${cleanSubtitle ? `<div class="doc-subtitle">${escapeHtml(cleanSubtitle)}</div>` : ""}
    ${cleanDescription ? `<div class="doc-description">${escapeHtml(cleanDescription)}</div>` : ""}
  </header>
  <hr class="doc-divider" />
  <main class="doc-content">
    ${cleanContent}
  </main>
</body>
</html>`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Gagal print via iframe, menggunakan fallback window:", e);
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();
        printWin.print();
      }
    }
  };

  // Pastikan gambar selesai dimuat sebelum membuka dialog print
  const images = doc.images;
  if (images && images.length > 0) {
    let loadedCount = 0;
    const totalImages = images.length;
    const handleImageDone = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setTimeout(triggerPrint, 150);
      }
    };

    for (let i = 0; i < totalImages; i++) {
      const img = images[i];
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener("load", handleImageDone);
        img.addEventListener("error", handleImageDone);
      }
    }

    if (loadedCount >= totalImages) {
      setTimeout(triggerPrint, 250);
    } else {
      setTimeout(triggerPrint, 1200);
    }
  } else {
    setTimeout(triggerPrint, 250);
  }
}
