import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { writeFile, unlink } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir, homedir } from "node:os";
import { spawn } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || 4177);
const suicaParser = resolve(root, "scripts", "suica_pdf_to_json.py");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/suica-pdf") {
      await handleSuicaPdf(request, response);
      return;
    }

    const pathname = decodeURIComponent(new URL(request.url || "/", `http://localhost:${port}`).pathname);
    const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = resolve(root, requested);

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Local money manager: http://localhost:${port}`);
});

async function handleSuicaPdf(request, response) {
  try {
    const pdfBuffer = await readRequestBody(request);
    if (!pdfBuffer.length) {
      sendJson(response, 400, { error: "PDFが空です" });
      return;
    }

    const pdfPath = resolve(tmpdir(), `suica-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`);
    await writeFile(pdfPath, pdfBuffer);
    try {
      const originalName = decodeURIComponent(String(request.headers["x-file-name"] || ""));
      const parsed = await runPythonParser(pdfPath, originalName);
      sendJson(response, 200, parsed);
    } finally {
      await unlink(pdfPath).catch(() => {});
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message || "PDFを解析できませんでした" });
  }
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) {
        rejectBody(new Error("PDFが大きすぎます"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolveBody(Buffer.concat(chunks)));
    request.on("error", rejectBody);
  });
}

function runPythonParser(pdfPath, originalName) {
  const python = findPython();
  return new Promise((resolveRun, rejectRun) => {
    const args = originalName ? [suicaParser, pdfPath, originalName] : [suicaParser, pdfPath];
    const child = spawn(python, args, {
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString("utf8");
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code !== 0) {
        rejectRun(new Error(stderr.trim() || `PDF parser exited with ${code}`));
        return;
      }
      try {
        resolveRun(JSON.parse(stdout));
      } catch {
        rejectRun(new Error("PDF解析結果を読み込めませんでした"));
      }
    });
  });
}

function findPython() {
  if (process.env.MONEY_MANAGER_PYTHON) return process.env.MONEY_MANAGER_PYTHON;
  const bundled = resolve(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe");
  return bundled;
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}
