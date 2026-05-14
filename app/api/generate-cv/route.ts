import { NextResponse } from "next/server";
import latex from "node-latex";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // LaTeX escape helper
    const escapeLatex = (str: string) => {
      if (!str) return "";
      return str.replace(/[&%$#_{}~^\\]/g, (match) => {
        if (match === "\\") return "\\textbackslash{}";
        if (match === "~") return "\\textasciitilde{}";
        if (match === "^") return "\\textasciicircum{}";
        return "\\" + match;
      });
    };

    // Prepare data
    const name = escapeLatex(data.name || "Unknown");
    const email = escapeLatex(data.email || "");
    const phone = escapeLatex(data.phone || "");
    const education = escapeLatex(data.education || "");
    const skills = (data.skills || []).map((s: string) => escapeLatex(s)).join(", ");
    const experience = escapeLatex(data.experience || "");

    // A minimal but clean LaTeX template
    const latexString = `
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
    ${email ? `\\href{mailto:${email}}{${email}}` : ""} ${phone ? `| ${phone}` : ""}
\\end{center}

\\vspace{15pt}

\\section*{Education}
\\noindent
\\textbf{Highest Degree:} \\textit{${education}}

\\vspace{10pt}

\\section*{Skills}
\\noindent
${skills ? skills : "No skills listed."}

\\vspace{10pt}

\\section*{Professional Experience}
\\noindent
${experience ? experience.split("\n").map((line: string) => line.trim()).filter(Boolean).join("\\\\ ") : "No experience listed."}

\\end{document}
`;

    // Compile LaTeX to PDF
    const pdfStream = latex(latexString, {
      cmd: 'pdflatex',
      errorLogs: true,
      passes: 1
    });
    
    // Convert stream to Buffer
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      pdfStream.on("error", (err) => reject(err));
      pdfStream.on("finish", () => resolve(Buffer.concat(chunks)));
    });

    // Return the generated PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.name.replace(/\s+/g, '_') || 'CV'}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate CV" }, { status: 500 });
  }
}
