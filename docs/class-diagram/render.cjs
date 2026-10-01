const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { Prisma } = require("@prisma/client");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "../..");
const mermaidVersion = "10.9.3";
const labels = {
  "User.attempts": "mengerjakan",
  "User.securityEvents": "memiliki log",
  "User.deletedPackages": "mencatat penghapusan",
  "User.socialLinks": "memiliki profil sosial",
  "Test.packages": "mengelompokkan",
  "Test.attempts": "jenis ujian sesi",
  "Package.questions": "memuat soal",
  "Package.attempts": "dikerjakan dalam",
  "Package.tags": "ditandai",
  "Package.passingGrades": "memiliki ambang lulus",
  "Question.Choices": "memiliki opsi",
  "Question.responses": "dijawab melalui",
  "Attempt.responses": "menyimpan jawaban",
  "Attempt.securityEvents": "mencatat aktivitas",
};

function multiplicity(field) {
  return field.isList ? "0..*" : field.isRequired ? "1" : "0..1";
}

function createDiagram(models) {
  const lines = [
    "%% UML domain class diagram generated from prisma/schema.prisma.",
    "%% Nullable attributes use ?. Relationships are associations, not inheritance.",
    "classDiagram",
    "direction TB",
  ];
  for (const model of models) {
    lines.push(`class ${model.name} {`);
    for (const field of model.fields.filter((item) => item.kind !== "object")) {
      const type = field.type + (field.isRequired ? "" : "?");
      lines.push(`  +${field.name}: ${type}`);
    }
    lines.push("}");
  }

  const visited = new Set();
  for (const model of models) {
    for (const field of model.fields.filter((item) => item.kind === "object")) {
      if (visited.has(field.relationName)) continue;
      const relatedModel = models.find((item) => item.name === field.type);
      const opposite = relatedModel.fields.find((item) => item.relationName === field.relationName);
      if (!opposite) throw new Error(`Missing opposite relation: ${field.relationName}`);
      const label = labels[`${model.name}.${field.name}`] || field.name;
      lines.push(`${model.name} "${multiplicity(opposite)}" -- "${multiplicity(field)}" ${relatedModel.name} : ${label}`);
      visited.add(field.relationName);
    }
  }
  return { source: lines.join("\n") + "\n", relations: visited.size };
}

async function main() {
  const normalize = (text) => text.replace(/\r\n/g, "\n").trim();
  const schema = await fs.readFile(path.join(root, "prisma/schema.prisma"), "utf8");
  const generatedSchema = await fs.readFile(path.join(root, "node_modules/.prisma/client/schema.prisma"), "utf8");
  if (normalize(schema) !== normalize(generatedSchema)) {
    throw new Error("Prisma Client does not match schema.prisma. Generate the client before rendering.");
  }

  const models = Prisma.dmmf.datamodel.models;
  const { source, relations } = createDiagram(models);
  await fs.writeFile(path.join(__dirname, "class-diagram.mmd"), source);

  const bundle = path.join(os.tmpdir(), `smart-taruna-mermaid-${mermaidVersion}.min.js`);
  try {
    await fs.access(bundle);
  } catch {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/mermaid@${mermaidVersion}/dist/mermaid.min.js`);
    if (!response.ok) throw new Error(`Mermaid download failed: ${response.status}`);
    await fs.writeFile(bundle, Buffer.from(await response.arrayBuffer()));
  }

  const browser = await chromium.launch(process.platform === "win32" ? { channel: "msedge" } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Class Diagram Smart Taruna</title><style>body{margin:0;padding:24px;background:white;font-family:Arial,sans-serif;}h1{margin:0 0 8px;font-size:26px;}p{margin:0 0 20px;color:#475569;font-size:14px;}#diagram{display:inline-block;background:white;}svg{display:block;max-width:none;}</style></head><body><h1>Class Diagram Smart Taruna</h1><p>Model domain: ${models.length} kelas | ${relations} relasi sesuai Prisma | ? = atribut opsional</p><div id="diagram"></div></body></html>`);
    await page.addScriptTag({ path: bundle });
    const dimensions = await page.evaluate(async (diagramSource) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "Arial, sans-serif",
        themeVariables: {
          primaryColor: "#ffffff", primaryTextColor: "#111827", primaryBorderColor: "#475569",
          lineColor: "#64748b", secondaryColor: "#f8fafc", tertiaryColor: "#ffffff",
          fontSize: "16px", background: "#ffffff",
        },
        class: { useMaxWidth: false },
      });
      const { svg } = await mermaid.render("smart-taruna-classes", diagramSource);
      document.getElementById("diagram").innerHTML = svg;
      const element = document.querySelector("#diagram svg");
      const box = element.viewBox.baseVal;
      element.setAttribute("width", String(Math.ceil(box.width)));
      element.setAttribute("height", String(Math.ceil(box.height)));
      element.style.maxWidth = "none";
      return { width: Math.ceil(box.width), height: Math.ceil(box.height), svg: element.outerHTML };
    }, source);

    if (errors.length) throw new Error(errors.join("\n"));
    const classNodes = await page.locator("g.node").count();
    if (classNodes !== models.length) throw new Error(`Expected ${models.length} class nodes; rendered ${classNodes}`);
    await fs.writeFile(path.join(__dirname, "class-diagram.svg"), dimensions.svg);
    await page.setViewportSize({ width: dimensions.width + 48, height: Math.min(dimensions.height + 150, 6000) });
    await page.screenshot({ path: path.join(__dirname, "class-diagram.png"), fullPage: true });

    const landscape = dimensions.width > dimensions.height;
    const pageWidth = landscape ? 1587 : 1122;
    const pageHeight = landscape ? 1122 : 1587;
    const scale = Math.min((pageWidth - 76) / dimensions.width, (pageHeight - 155) / dimensions.height);
    await page.addStyleTag({ content: `@page { size: A3 ${landscape ? "landscape" : "portrait"}; margin: 10mm; } body{padding:0;} #diagram{width:${dimensions.width * scale}px;height:${dimensions.height * scale}px;} #diagram svg{transform:scale(${scale});transform-origin:top left;}` });
    const pdf = await page.pdf({ path: path.join(__dirname, "class-diagram.pdf"), preferCSSPageSize: true, printBackground: true });
    const pdfPages = (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    if (pdfPages !== 1) throw new Error(`Expected one PDF page; rendered ${pdfPages}`);
    console.log(JSON.stringify({ models: models.length, attributes: models.reduce((n, item) => n + item.fields.filter((field) => field.kind !== "object").length, 0), relations, width: dimensions.width, height: dimensions.height, pdfPages, files: ["class-diagram.mmd", "class-diagram.svg", "class-diagram.png", "class-diagram.pdf"] }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
