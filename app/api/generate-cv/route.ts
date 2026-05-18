// Force Node.js runtime
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

// ---------------------------------------------------------------------------
// Helper: escape special LaTeX characters in arbitrary user input
// ---------------------------------------------------------------------------
function escapeLatex(str: string): string {
  if (!str) return "";
  return str.replace(/[&%$#_{}~^\\]/g, (match) => {
    if (match === "\\") return "\\textbackslash{}";
    if (match === "~") return "\\textasciitilde{}";
    if (match === "^") return "\\textasciicircum{}";
    return "\\" + match;
  });
}

// ---------------------------------------------------------------------------
// POST /api/generate-cv
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const data = await req.json();

    let latexSource = "";
    
    // Create a temporary directory for pdflatex
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cvbrew-"));
    const texFile = path.join(tmpDir, "main.tex");

    // Check if we are receiving the new 'resources' payload (from moderncv builder)
    if (data.resources && Array.isArray(data.resources)) {
      const mainRes = data.resources.find((r: any) => r.main);
      if (!mainRes) throw new Error("No main resource found in resources array");
      latexSource = mainRes.content;

      // Write other resources (like photo.jpg)
      for (const res of data.resources) {
        if (!res.main && res.path) {
          const content = res.encoding === "base64" ? Buffer.from(res.content, "base64") : res.content;
          await fs.writeFile(path.join(tmpDir, res.path), content);
        }
      }
    } else {
      // Legacy format handling
      const name = escapeLatex(data.name || "Unknown");
      const email = escapeLatex(data.email || "");
      const phone = escapeLatex(data.phone || "");
      const education = escapeLatex(data.education || "");
      const skills = (data.skills as string[] | undefined)?.map(escapeLatex).join(", ");
      const experience = escapeLatex(data.experience || "");

      latexSource = `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\usepackage{hyperref}
\\geometry{margin=1in}

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{${name}}} \\\\
    \\vspace{5pt}
    ${email ? `\\href{mailto:${email}}{${email}}` : ""}%
    ${phone ? ` $|$ ${phone}` : ""}
\\end{center}

\\vspace{15pt}

\\section*{Education}
\\noindent
\\textbf{Highest Degree:} \\textit{${education || "—"}}

\\vspace{10pt}

\\section*{Skills}
\\noindent
${skills || "No skills listed."}

\\vspace{10pt}

\\section*{Professional Experience}
\\noindent
${
  experience
    ? experience.split("\\n").map((l) => l.trim()).filter(Boolean).join("\\\\\\\\ ")
    : "No experience listed."
}

\\end{document}
`;
    }

    // Write main tex file
    await fs.writeFile(texFile, latexSource);

    // Compile using local pdflatex
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      exec("pdflatex -interaction=nonstopmode main.tex", { cwd: tmpDir }, async (error, stdout, stderr) => {
        try {
          const pdfFile = path.join(tmpDir, "main.pdf");
          const pdfData = await fs.readFile(pdfFile);
          resolve(pdfData);
        } catch (err) {
          reject(new Error(`LaTeX compilation failed:\n${stdout}`));
        }
      });
    });

    // Clean up temporary directory (run asynchronously)
    fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    const safeName = (data.name as string | undefined)?.replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "cv";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[generate-cv]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
