// Force Node.js runtime — needed for child-process spawning by node-latex
export const runtime = "nodejs";

import { NextResponse } from "next/server";
// node-latex is listed in serverExternalPackages in next.config.ts so it is
// resolved via native require (not bundled), which is required for it to work.
import latex from "node-latex";

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
// Helper: compile a LaTeX string → Buffer via pdflatex
// ---------------------------------------------------------------------------
function compileLaTeX(latexSource: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const errorLines: string[] = [];

    const pdfStream = latex(latexSource, {
      cmd: "pdflatex",
      passes: 1,
    });

    const chunks: Buffer[] = [];

    pdfStream.on("data", (chunk: Buffer | string) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );

    // node-latex emits 'error' with an Error object when pdflatex fails
    pdfStream.on("error", (err: Error & { log?: string }) => {
      // Attach the raw pdflatex log when available
      const detail = err.log ?? errorLines.join("\n");
      reject(
        new Error(`LaTeX compilation failed: ${err.message}\n${detail}`.trim())
      );
    });

    // 'end' fires after all data has been flushed (unlike 'finish' which is
    // write-side only and may fire before readable consumers receive data)
    pdfStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// ---------------------------------------------------------------------------
// POST /api/generate-cv
// Expects JSON body: { name, email, phone, education, skills[], experience }
// Returns: application/pdf
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Sanitise every field before embedding in LaTeX
    const name = escapeLatex(data.name || "Unknown");
    const email = escapeLatex(data.email || "");
    const phone = escapeLatex(data.phone || "");
    const education = escapeLatex(data.education || "");
    const skills = (data.skills as string[] | undefined)
      ?.map(escapeLatex)
      .join(", ");
    const experience = escapeLatex(data.experience || "");

    const latexSource = `
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
    ? experience
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\\\\ ")
    : "No experience listed."
}

\\end{document}
`;

    const pdfBuffer = await compileLaTeX(latexSource);

    const safeName = (data.name as string | undefined)
      ?.replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "") || "CV";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate CV";
    console.error("[generate-cv]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
