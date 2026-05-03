const fs = require("fs");
const path = require("path");
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "docs", "smart-taruna-fitur-schema-api.md");
const outputPath = path.join(root, "docs", "smart-taruna-fitur-schema-api.pdf");

const markdown = fs.readFileSync(inputPath, "utf8");

function inlineCodeParts(text) {
  const parts = [];
  const tokens = text.split(/(`[^`]+`)/g);

  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push({
        text: token.slice(1, -1),
        fontSize: 8.5,
        color: "#0f172a",
        background: "#f1f5f9",
      });
    } else {
      parts.push({ text: token });
    }
  }

  return parts;
}

function paragraph(text, margin = [0, 2, 0, 6]) {
  return {
    text: inlineCodeParts(text),
    style: "paragraph",
    margin,
  };
}

function parseMarkdown(md) {
  const content = [];
  const lines = md.split(/\r?\n/);
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    content.push({
      ul: listItems.map((item) => inlineCodeParts(item)),
      style: "list",
      margin: [14, 0, 0, 8],
    });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushList();
      content.push({
        text: line.replace(/^# /, ""),
        style: "title",
        margin: [0, 0, 0, 14],
      });
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      content.push({
        text: line.replace(/^## /, ""),
        style: "heading1",
        margin: [0, 12, 0, 8],
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      content.push({
        text: line.replace(/^### /, ""),
        style: "heading2",
        margin: [0, 8, 0, 6],
      });
      continue;
    }

    if (/^- /.test(line)) {
      listItems.push(line.replace(/^- /, ""));
      continue;
    }

    if (/^\d+\. /.test(line)) {
      flushList();
      content.push(paragraph(line, [0, 1, 0, 3]));
      continue;
    }

    flushList();
    content.push(paragraph(line));
  }

  flushList();
  return content;
}

const docDefinition = {
  pageSize: "A4",
  pageMargins: [42, 54, 42, 54],
  info: {
    title: "Dokumentasi Fitur, Schema Database, dan API Smart Taruna",
    author: "Smart Taruna",
    subject: "Fitur, DB schema, API, dan alur aplikasi",
  },
  footer(currentPage, pageCount) {
    return {
      text: `Smart Taruna CBT - ${currentPage} / ${pageCount}`,
      alignment: "center",
      fontSize: 8,
      color: "#64748b",
    };
  },
  content: parseMarkdown(markdown),
  styles: {
    title: {
      fontSize: 20,
      bold: true,
      color: "#0f172a",
      lineHeight: 1.2,
    },
    heading1: {
      fontSize: 14,
      bold: true,
      color: "#0f172a",
    },
    heading2: {
      fontSize: 11.5,
      bold: true,
      color: "#1e293b",
    },
    paragraph: {
      fontSize: 9.2,
      lineHeight: 1.25,
      color: "#334155",
    },
    list: {
      fontSize: 9.2,
      lineHeight: 1.25,
      color: "#334155",
    },
  },
  defaultStyle: {
    font: "Roboto",
  },
};

const pdfDoc = pdfMake.createPdf(docDefinition);
pdfDoc.getBuffer((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(outputPath);
});
