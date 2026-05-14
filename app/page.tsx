"use client";

import React, { useState, useRef } from "react";

const STEPS = ["Style", "Personal", "Experience", "Education", "Skills", "Extras"];

const THEMES = [
  { id: "classic", label: "Classic" },
  { id: "banking", label: "Banking" },
  { id: "casual", label: "Casual" },
  { id: "oldstyle", label: "Oldstyle" },
];

const COLORS = [
  { id: "blue", label: "Blue", hex: "#2563eb" },
  { id: "burgundy", label: "Burgundy", hex: "#7c2d40" },
  { id: "green", label: "Green", hex: "#15803d" },
  { id: "orange", label: "Orange", hex: "#ea580c" },
  { id: "grey", label: "Grey", hex: "#6b7280" },
];

const EXTRAS = [
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "awards", label: "Awards" },
];

const JOB_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Product Manager", "UI/UX Designer", "DevOps Engineer",
  "Project Manager", "Data Analyst", "Machine Learning Engineer", "Marketing Manager",
  "Sales Executive", "Graphic Designer", "Operations Manager", "Business Analyst",
  "Financial Analyst", "Human Resources Manager", "Accountant", "Consultant",
  "System Administrator", "Network Engineer", "Cybersecurity Analyst", "Quality Assurance Engineer",
  "Research Assistant", "Teacher", "Nurse", "Doctor", "Architect", "Civil Engineer"
];

function esc(s: string | undefined | null): string {
  return (s || "").replace(/[&%$#_{}~^\\]/g, (c) => ({
    "&": "\\&", "%": "\\%", "$": "\\$", "#": "\\#",
    "_": "\\_", "{": "\\{", "}": "\\}", "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}", "\\": "\\textbackslash{}",
  }[c] || c));
}

function buildLatex(form: any): string {
  const { style, color, personal, summary, experience, education, skills, projects, certifications, languages, awards, extras } = form;

  const expSection = experience.length ? `
\\section{Experience}
${experience.map((e: any) => {
    const bullets = e.desc ? e.desc.split(";").map((b: string) => b.trim()).filter(Boolean).map((b: string) => `  \\item ${esc(b)}`).join("\n") : "";
    return `\\cventry{${esc(e.from)}--${esc(e.to)}}{${esc(e.title)}}{${esc(e.org)}}{}{}{${bullets ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : ""}}`;
  }).join("\n")}` : "";

  const eduSection = education.length ? `
\\section{Education}
${education.map((e: any) => `\\cventry{${esc(e.from)}--${esc(e.to)}}{${esc(e.deg)}}{${esc(e.org)}}{}{${esc(e.note)}}{}`).join("\n")}` : "";

  const skillsSection = skills ? `
\\section{Skills}
${skills.split("|").map((g: string) => {
    const items = g.split(",").map((s: string) => esc(s.trim())).filter(Boolean).join(", ");
    return `\\cvitem{}{${items}}`;
  }).join("\n")}` : "";

  const projSection = extras.includes("projects") && projects.length ? `
\\section{Projects}
${projects.map((p: any) => `\\cvitem{${esc(p.year)} — ${esc(p.name)}}{${esc(p.desc)}}`).join("\n")}` : "";

  const certSection = extras.includes("certifications") && certifications.length ? `
\\section{Certifications}
${certifications.map((c: any) => `\\cvitem{${esc(c.year)}}{${esc(c.name)} — ${esc(c.org)}}`).join("\n")}` : "";

  const langSection = extras.includes("languages") && languages.length ? `
\\section{Languages}
${languages.map((l: any) => `\\cvitem{${esc(l.name)}}{${esc(l.level)}}`).join("\n")}` : "";

  const awardSection = extras.includes("awards") && awards.length ? `
\\section{Awards}
${awards.map((a: any) => `\\cvitem{${esc(a.year)}}{${esc(a.name)} — ${esc(a.org)}}`).join("\n")}` : "";

  return `\\documentclass[11pt,a4paper,${style}]{moderncv}
\\moderncvtheme[${color}]{${style}}
\\usepackage[utf8]{inputenc}
\\usepackage[scale=0.85]{geometry}

\\firstname{${esc(personal.fname)}}
\\familyname{${esc(personal.lname)}}
${personal.title ? `\\title{${esc(personal.title)}}` : ""}
${personal.phone ? `\\phone{${esc(personal.phone)}}` : ""}
${personal.email ? `\\email{${esc(personal.email)}}` : ""}
${personal.location ? `\\address{${esc(personal.location)}}{}` : ""}
${personal.website ? `\\homepage{${esc(personal.website)}}` : ""}
${personal.photo ? `\\photo[80pt][0.4pt]{photo}` : ""}

\\begin{document}
\\maketitle
${summary ? `\n\\section{Summary}\n\\cvitem{}{${esc(summary)}}` : ""}
${expSection}
${eduSection}
${skillsSection}
${projSection}
${certSection}
${langSection}
${awardSection}
\\end{document}`;
}

function Input({ label, value, onChange, placeholder, type = "text", suggestions }: any) {
  const listId = suggestions ? `list-${label.replace(/\s+/g, '-')}` : undefined;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, color: "#6b7280", fontFamily: "Georgia, serif" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        style={{
          padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
          fontSize: 14, fontFamily: "Georgia, serif", color: "#111",
          background: "#fafafa", outline: "none", width: "100%",
        }}
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s: string) => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, color: "#6b7280", fontFamily: "Georgia, serif" }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
          fontSize: 14, fontFamily: "Georgia, serif", color: "#111",
          background: "#fafafa", resize: "vertical", outline: "none", width: "100%",
        }}
      />
    </div>
  );
}

function Pill({ label, selected, onClick, accent }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: 999, fontSize: 13,
        border: selected ? `1.5px solid ${accent || "#1d4ed8"}` : "1px solid #e5e7eb",
        background: selected ? (accent ? accent + "18" : "#eff6ff") : "#fff",
        color: selected ? (accent || "#1d4ed8") : "#6b7280",
        cursor: "pointer", fontFamily: "Georgia, serif", transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}

function ColorDot({ color, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      title={color.label}
      style={{
        width: 28, height: 28, borderRadius: "50%", background: color.hex,
        border: selected ? `3px solid #111` : "2px solid #e5e7eb",
        cursor: "pointer", outline: "none", transition: "transform .15s",
        transform: selected ? "scale(1.15)" : "scale(1)",
      }}
    />
  );
}

function EntryCard({ children, onRemove, title }: any) {
  return (
    <div style={{
      border: "1px solid #f0e9df", borderRadius: 8, padding: "14px 16px",
      background: "#fdfbf8", marginBottom: 10, position: "relative",
    }}>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, fontFamily: "Georgia, serif" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
      <button
        onClick={onRemove}
        style={{
          position: "absolute", top: 10, right: 12, background: "none",
          border: "none", fontSize: 18, color: "#d1d5db", cursor: "pointer",
          lineHeight: 1, padding: 0,
        }}
      >×</button>
    </div>
  );
}

export default function CVBuilder() {
  const [step, setStep] = useState(0);
  const [style, setStyle] = useState("classic");
  const [color, setColor] = useState("blue");
  const [personal, setPersonal] = useState({ fname: "", lname: "", title: "", phone: "", email: "", location: "", website: "", photo: "" });
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState([{ id: 1, title: "", org: "", from: "", to: "", desc: "" }]);
  const [education, setEducation] = useState([{ id: 1, deg: "", org: "", from: "", to: "", note: "" }]);
  const [skills, setSkills] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const nextId = useRef(100);

  function pid() { return ++nextId.current; }

  function pField(k: string, v: string) { setPersonal(p => ({ ...p, [k]: v })); }

  function updList(setter: any, id: number, k: string, v: string) {
    setter((list: any[]) => list.map(x => x.id === id ? { ...x, [k]: v } : x));
  }

  function rmList(setter: any, id: number) { setter((list: any[]) => list.filter(x => x.id !== id)); }

  function addExp() { setExperience(e => [...e, { id: pid(), title: "", org: "", from: "", to: "", desc: "" }]); }
  function addEdu() { setEducation(e => [...e, { id: pid(), deg: "", org: "", from: "", to: "", note: "" }]); }
  function addProj() { setProjects(e => [...e, { id: pid(), name: "", year: "", desc: "" }]); }
  function addCert() { setCertifications(e => [...e, { id: pid(), name: "", org: "", year: "" }]); }
  function addLang() { setLanguages(e => [...e, { id: pid(), name: "", level: "" }]); }
  function addAward() { setAwards(e => [...e, { id: pid(), name: "", org: "", year: "" }]); }

  function toggleExtra(id: string) {
    setExtras(e => {
      const next = e.includes(id) ? e.filter(x => x !== id) : [...e, id];
      if (id === "projects" && !e.includes(id) && projects.length === 0) addProj();
      if (id === "certifications" && !e.includes(id) && certifications.length === 0) addCert();
      if (id === "languages" && !e.includes(id) && languages.length === 0) addLang();
      if (id === "awards" && !e.includes(id) && awards.length === 0) addAward();
      return next;
    });
  }

  async function compileAndDownload() {
    setLoading(true);
    setStatus("Generating LaTeX with AI…");
    try {
      const form = { style, color, personal, summary, experience, education, skills, projects, certifications, languages, awards, extras };

      // Step 1: Build LaTeX locally (fast, deterministic)
      const latex = buildLatex(form);

      const resources: any[] = [{ main: true, content: latex }];
      if (personal.photo) {
        resources.push({
          path: "photo.jpg",
          content: personal.photo.split(",")[1],
          encoding: "base64"
        });
      }

      // Step 2: Compile via latex.ytotech.com (free LaTeX API)
      setStatus("Compiling PDF…");
      const compileRes = await fetch("https://latex.ytotech.com/builds/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiler: "pdflatex",
          resources: resources,
        }),
      });

      if (!compileRes.ok) {
        // Fallback: compile via latexonline.cc
        setStatus("Trying alternate compiler…");
        const encoded = encodeURIComponent(latex);
        const fallbackUrl = `https://latexonline.cc/compile?text=${encoded}&command=pdflatex`;
        const fb = await fetch(fallbackUrl);
        if (!fb.ok) throw new Error("Compilation failed");
        const blob = await fb.blob();
        triggerDownload(blob, personal.lname || "cv");
      } else {
        const blob = await compileRes.blob();
        triggerDownload(blob, personal.lname || "cv");
      }

      setStatus("Done!");
    } catch (err) {
      // Both compilers failed — fall back to Claude generating a styled HTML and convert via print
      setStatus("Generating CV as PDF via print…");
      await generateHtmlFallback();
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 3000);
    }
  }

  async function generateHtmlFallback() {
    // Note: The direct Anthropic API call below will likely fail from the browser due to CORS/Auth
    // if you don't use a proxy or provide an API key. Consider using a Next.js API route here.
    const form = { style, color, personal, summary, experience, education, skills, projects, certifications, languages, awards, extras };
    const colorHex = COLORS.find(c => c.id === color)?.hex || "#2563eb";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: `Generate a complete, print-ready HTML CV document for the following data. Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no backticks. Use elegant typography with Google Fonts (Playfair Display for headings, Lato for body). The accent color is ${colorHex}. Make it look like a professional LaTeX moderncv ${style} style CV.
  
  Data: ${JSON.stringify(form, null, 2)}`
          }]
        })
      });
      const data = await res.json();
      const html = data.content?.find((b: any) => b.type === "text")?.text || "";
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 800);
        setStatus("Print dialog opened — save as PDF");
      }
    } catch (error) {
      setStatus("All compile methods failed. Ensure LaTeX backend is available.");
      console.error(error);
    }
  }

  function openInOverleaf() {
    const formParams = { style, color, personal, summary, experience, education, skills, projects, certifications, languages, awards, extras };
    const latex = buildLatex(formParams);
    
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.overleaf.com/docs";
    form.target = "_blank";
    
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "snip";
    input.value = latex;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function triggerDownload(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase()}_cv.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const accentColor = COLORS.find(c => c.id === color)?.hex || "#2563eb";

  const stepContent = [
    // Step 0: Style
    <div key="style" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={sectionLabel}>Template</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {THEMES.map(t => <Pill key={t.id} label={t.label} selected={style === t.id} onClick={() => setStyle(t.id)} accent={accentColor} />)}
        </div>
      </div>
      <div>
        <div style={sectionLabel}>Accent color</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {COLORS.map(c => <ColorDot key={c.id} color={c} selected={color === c.id} onClick={() => setColor(c.id)} />)}
          <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "Georgia, serif" }}>
            {COLORS.find(c => c.id === color)?.label}
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 20px", background: "#fdfbf8", border: "1px solid #f0e9df", borderLeft: `4px solid ${accentColor}`, borderRadius: 8 }}>
        <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "Georgia, serif" }}>
          You've selected <strong style={{ color: "#111" }}>{style}</strong> with <strong style={{ color: accentColor }}>{COLORS.find(c => c.id === color)?.label}</strong> accent — a great choice for professional CVs.
        </div>
      </div>
    </div>,

    // Step 1: Personal
    <div key="personal" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="First name" value={personal.fname} onChange={(v: string) => pField("fname", v)} placeholder="Ada" />
        <Input label="Last name" value={personal.lname} onChange={(v: string) => pField("lname", v)} placeholder="Lovelace" />
      </div>
      <Input label="Job title" value={personal.title} onChange={(v: string) => pField("title", v)} placeholder="Software Engineer" suggestions={JOB_ROLES} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Email" value={personal.email} onChange={(v: string) => pField("email", v)} placeholder="ada@example.com" type="email" />
        <Input label="Phone" value={personal.phone} onChange={(v: string) => pField("phone", v)} placeholder="+1 555 000 0000" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="Location" value={personal.location} onChange={(v: string) => pField("location", v)} placeholder="London, UK" />
        <Input label="Website / LinkedIn" value={personal.website} onChange={(v: string) => pField("website", v)} placeholder="linkedin.com/in/ada" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 12, color: "#6b7280", fontFamily: "Georgia, serif" }}>Profile Picture (Optional)</label>
        <input
          type="file"
          accept="image/jpeg, image/png"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => pField("photo", reader.result as string);
              reader.readAsDataURL(file);
            }
          }}
          style={{
            padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
            fontSize: 14, fontFamily: "Georgia, serif", color: "#111",
            background: "#fafafa", outline: "none", width: "100%",
          }}
        />
      </div>
      <Textarea label="Professional summary (optional)" value={summary} onChange={setSummary} placeholder="Passionate engineer with 5+ years building scalable systems…" />
    </div>,

    // Step 2: Experience
    <div key="exp" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {experience.map((e, i) => (
        <EntryCard key={e.id} title={`Position ${i + 1}`} onRemove={() => rmList(setExperience, e.id)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Job title" value={e.title} onChange={(v: string) => updList(setExperience, e.id, "title", v)} placeholder="Senior Engineer" suggestions={JOB_ROLES} />
            <Input label="Company" value={e.org} onChange={(v: string) => updList(setExperience, e.id, "org", v)} placeholder="Acme Corp" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="From" value={e.from} onChange={(v: string) => updList(setExperience, e.id, "from", v)} placeholder="2021" />
            <Input label="To" value={e.to} onChange={(v: string) => updList(setExperience, e.id, "to", v)} placeholder="Present" />
          </div>
          <Textarea label="Responsibilities (separate with ;)" value={e.desc} onChange={(v: string) => updList(setExperience, e.id, "desc", v)} placeholder="Built scalable APIs; Led team of 5; Reduced latency by 40%" />
        </EntryCard>
      ))}
      <button onClick={addExp} style={addBtnStyle(accentColor)}>+ Add position</button>
    </div>,

    // Step 3: Education
    <div key="edu" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {education.map((e, i) => (
        <EntryCard key={e.id} title={`Degree ${i + 1}`} onRemove={() => rmList(setEducation, e.id)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="Degree" value={e.deg} onChange={(v: string) => updList(setEducation, e.id, "deg", v)} placeholder="B.Sc. Computer Science" />
            <Input label="Institution" value={e.org} onChange={(v: string) => updList(setEducation, e.id, "org", v)} placeholder="MIT" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input label="From" value={e.from} onChange={(v: string) => updList(setEducation, e.id, "from", v)} placeholder="2017" />
            <Input label="To" value={e.to} onChange={(v: string) => updList(setEducation, e.id, "to", v)} placeholder="2021" />
          </div>
          <Input label="Notes (GPA, thesis, etc.)" value={e.note} onChange={(v: string) => updList(setEducation, e.id, "note", v)} placeholder="GPA 3.9 / 4.0" />
        </EntryCard>
      ))}
      <button onClick={addEdu} style={addBtnStyle(accentColor)}>+ Add degree</button>
    </div>,

    // Step 4: Skills
    <div key="skills" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Textarea
        label='Skills — group by category with | separator (e.g. "Python, JS | Docker, AWS | Leadership")'
        value={skills}
        onChange={setSkills}
        placeholder="Python, JavaScript, TypeScript | Docker, AWS, CI/CD | Team Leadership, Agile"
      />
      <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Georgia, serif" }}>
        Each group separated by <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 3 }}>|</code> becomes its own skills row in the CV.
      </div>
    </div>,

    // Step 5: Extras
    <div key="extras" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={sectionLabel}>Optional sections</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EXTRAS.map(x => (
            <Pill key={x.id} label={x.label} selected={extras.includes(x.id)} onClick={() => toggleExtra(x.id)} accent={accentColor} />
          ))}
        </div>
      </div>
      {extras.includes("projects") && (
        <div>
          <div style={sectionLabel}>Projects</div>
          {projects.map((p, i) => (
            <EntryCard key={p.id} title={`Project ${i + 1}`} onRemove={() => rmList(setProjects, p.id)}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                <Input label="Project name" value={p.name} onChange={(v: string) => updList(setProjects, p.id, "name", v)} placeholder="OpenCV Tracker" />
                <Input label="Year" value={p.year} onChange={(v: string) => updList(setProjects, p.id, "year", v)} placeholder="2023" />
              </div>
              <Textarea label="Description" value={p.desc} onChange={(v: string) => updList(setProjects, p.id, "desc", v)} placeholder="Real-time object tracking using OpenCV and Python" />
            </EntryCard>
          ))}
          <button onClick={addProj} style={addBtnStyle(accentColor)}>+ Add project</button>
        </div>
      )}
      {extras.includes("certifications") && (
        <div>
          <div style={sectionLabel}>Certifications</div>
          {certifications.map((c, i) => (
            <EntryCard key={c.id} title={`Cert ${i + 1}`} onRemove={() => rmList(setCertifications, c.id)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Name" value={c.name} onChange={(v: string) => updList(setCertifications, c.id, "name", v)} placeholder="AWS Solutions Architect" />
                <Input label="Issuer" value={c.org} onChange={(v: string) => updList(setCertifications, c.id, "org", v)} placeholder="Amazon" />
              </div>
              <Input label="Year" value={c.year} onChange={(v: string) => updList(setCertifications, c.id, "year", v)} placeholder="2023" />
            </EntryCard>
          ))}
          <button onClick={addCert} style={addBtnStyle(accentColor)}>+ Add certification</button>
        </div>
      )}
      {extras.includes("languages") && (
        <div>
          <div style={sectionLabel}>Languages</div>
          {languages.map((l, i) => (
            <EntryCard key={l.id} title={`Language ${i + 1}`} onRemove={() => rmList(setLanguages, l.id)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Language" value={l.name} onChange={(v: string) => updList(setLanguages, l.id, "name", v)} placeholder="French" />
                <Input label="Level" value={l.level} onChange={(v: string) => updList(setLanguages, l.id, "level", v)} placeholder="Fluent" />
              </div>
            </EntryCard>
          ))}
          <button onClick={addLang} style={addBtnStyle(accentColor)}>+ Add language</button>
        </div>
      )}
      {extras.includes("awards") && (
        <div>
          <div style={sectionLabel}>Awards</div>
          {awards.map((a, i) => (
            <EntryCard key={a.id} title={`Award ${i + 1}`} onRemove={() => rmList(setAwards, a.id)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Award name" value={a.name} onChange={(v: string) => updList(setAwards, a.id, "name", v)} placeholder="Employee of the Year" />
                <Input label="Organisation" value={a.org} onChange={(v: string) => updList(setAwards, a.id, "org", v)} placeholder="Acme Corp" />
              </div>
              <Input label="Year" value={a.year} onChange={(v: string) => updList(setAwards, a.id, "year", v)} placeholder="2022" />
            </EntryCard>
          ))}
          <button onClick={addAward} style={addBtnStyle(accentColor)}>+ Add award</button>
        </div>
      )}
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #e5e7eb", background: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", letterSpacing: "-0.3px" }}>CVbrew</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>LaTeX · PDF export</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              style={{
                padding: "5px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer",
                border: step === i ? `1.5px solid ${accentColor}` : "1px solid #e5e7eb",
                background: step === i ? accentColor : "#fff",
                color: step === i ? "#fff" : "#6b7280",
                fontFamily: "Georgia, serif",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>{STEPS[step]}</div>
          <div style={{ height: 3, background: "#f3f4f6", borderRadius: 99, marginTop: 12 }}>
            <div style={{ height: 3, borderRadius: 99, background: accentColor, width: `${((step + 1) / STEPS.length) * 100}%`, transition: "width .3s" }} />
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
          {stepContent[step]}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ ...navBtn, opacity: step === 0 ? 0.3 : 1 }}
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ ...navBtn, background: accentColor, color: "#fff", border: "none" }}>
              Next →
            </button>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={openInOverleaf}
                style={{
                  ...navBtn, background: "#47A141",
                  color: "#fff", border: "none", minWidth: 160,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Edit in Overleaf
              </button>
              <button
                onClick={compileAndDownload}
                disabled={loading}
                style={{
                  ...navBtn, background: loading ? "#9ca3af" : accentColor,
                  color: "#fff", border: "none", minWidth: 200,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid #fff3", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                    {status || "Generating…"}
                  </>
                ) : "Download CV (PDF)"}
              </button>
            </div>
          )}
        </div>
        {status && !loading && (
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: accentColor, fontFamily: "Georgia, serif" }}>{status}</div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const sectionLabel: React.CSSProperties = { fontSize: 12, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" };
const navBtn: React.CSSProperties = { padding: "10px 24px", borderRadius: 8, fontSize: 14, cursor: "pointer", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontFamily: "Georgia, serif" };
const addBtnStyle = (accent: string): React.CSSProperties => ({
  width: "100%", padding: "8px", border: `1px dashed ${accent}80`, borderRadius: 8,
  background: "none", color: accent, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
  marginTop: 4,
});
