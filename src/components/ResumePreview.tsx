import React from "react";
import { ResumeData, WorkExperience, Education } from "../types";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Grid } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const {
    fullName,
    email,
    phone,
    location,
    jobTitle,
    workExperience,
    education,
    skills,
    selectedTemplate,
    hasPaid,
    linkedin,
    summary,
    certifications,
    projects,
    achievements,
    languages,
    references,
  } = data;

  // Repeating Watermark overlay for previews (automatically hidden when printing/downloading PDF!)
  const WatermarkOverlay = () => {
    if (hasPaid) return null;
    return (
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 rotate-[-30deg] scale-150 select-none pointer-events-none opacity-[0.06] z-10 font-sans print:hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center p-8 border-dashed border-gray-400/20">
            <span className="text-3xl font-black text-slate-800 tracking-wider uppercase whitespace-nowrap">
              AlphaCV Preview
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Rendering Helper: Bullet lists
  const renderBullets = (bullets: string[]) => {
    if (!bullets || bullets.length === 0) return null;
    return (
      <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600 font-sans text-xs md:text-[13px] leading-relaxed">
        {bullets.map((bullet, idx) => (
          <li key={idx} id={`bullet-${idx}`}>{bullet}</li>
        ))}
      </ul>
    );
  };

  // Sub-renderer: Summary Section
  const renderSummarySection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans text-slate-705", borderStyle = "border-b border-indigo-50/80") => {
    if (!summary) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>Professional Summary</h2>
        </div>
        <p className={`${bodyFontClass} text-xs md:text-[13px] leading-relaxed whitespace-pre-line`}>{summary}</p>
      </div>
    );
  };

  // Sub-renderer: Projects Section
  const renderProjectsSection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans", borderStyle = "border-b border-indigo-50/80") => {
    if (!projects || projects.length === 0) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-4 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>Key Projects</h2>
        </div>
        <div className="space-y-4">
          {projects.map((proj, idx) => (
            <div key={idx} id={`proj-${idx}`} className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h4 className={`text-[13px] md:text-sm font-bold ${titleColorClass} ${bodyFontClass}`}>
                  {proj.name}
                  {proj.link && (
                    <span className="text-indigo-500 font-normal text-xs pl-1.5 hover:underline font-sans shrink-0">
                      ({proj.link})
                    </span>
                  )}
                </h4>
                {proj.technologies && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded italic font-mono shrink-0">
                    {proj.technologies}
                  </span>
                )}
              </div>
              <p className={`text-xs md:text-[13px] leading-relaxed text-slate-600 ${bodyFontClass}`}>{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Sub-renderer: Certifications Section
  const renderCertificationsSection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans", borderStyle = "border-b border-indigo-50/80") => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>Certifications & Courses</h2>
        </div>
        <ul className={`list-disc pl-5 space-y-1 text-slate-600 text-xs md:text-[13px] leading-relaxed ${bodyFontClass}`}>
          {certifications.map((cert, idx) => (
            <li key={idx} id={`cert-${idx}`}>{cert}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Sub-renderer: Achievements Section
  const renderAchievementsSection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans", borderStyle = "border-b border-indigo-50/80") => {
    if (!achievements || achievements.length === 0) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>Achievements & Awards</h2>
        </div>
        <ul className={`list-disc pl-5 space-y-1 text-slate-600 text-xs md:text-[13px] leading-relaxed ${bodyFontClass}`}>
          {achievements.map((item, idx) => (
            <li key={idx} id={`achievement-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Sub-renderer: Languages Section
  const renderLanguagesSection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans", borderStyle = "border-b border-indigo-50/80", isSidebar = false) => {
    if (!languages || languages.length === 0) return null;
    if (isSidebar) {
      return (
        <div className="mb-6">
          <h3 className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3">Languages</h3>
          <div className="flex flex-col gap-1 text-[11px] md:text-xs text-slate-600 font-sans">
            {languages.map((lang, i) => (
              <span key={i} id={`lang-side-${i}`}>{lang}</span>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>Languages</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang, idx) => (
            <span
              key={idx}
              id={`lang-tag-${idx}`}
              className={`px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200/40 font-semibold ${bodyFontClass}`}
            >
              {lang}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Sub-renderer: References Section
  const renderReferencesSection = (titleColorClass = "text-indigo-900", titleFontClass = "font-sans", bodyFontClass = "font-sans", borderStyle = "border-b border-indigo-50/80") => {
    if (!references) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 ${borderStyle} pb-1.5`}>
          <h2 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${titleColorClass} ${titleFontClass}`}>References</h2>
        </div>
        <p className={`text-xs md:text-[13px] text-slate-600 leading-relaxed italic whitespace-pre-line ${bodyFontClass}`}>
          {references}
        </p>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 1: Modern Professional (Sidebar column + Right detail block)
  // ==========================================
  const renderModernTemplate = () => {
    return (
      <div className="flex h-full min-h-[960px] relative text-slate-800 font-sans transition-all duration-300">
        <WatermarkOverlay />
        
        {/* Left Sidebar */}
        <div className="w-[30%] bg-slate-50 border-r border-slate-100 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Contacts Info */}
            <div className="space-y-4 mb-8">
              <h3 className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3">Contact</h3>
              
              {email && (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-600 break-all">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {linkedin && (
                <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-600 break-all">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest shrink-0 font-sans border border-indigo-500/25 px-1 rounded bg-indigo-500/5">In</span>
                  <span>{linkedin}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      id={`skill-${i}`}
                      className="px-2 py-1 bg-slate-200/60 text-slate-700 text-[10px] md:text-xs rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages in Sidebar */}
            {renderLanguagesSection("text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-3", "font-sans", "font-sans text-slate-600", "", true)}
          </div>

          {/* Tagline footer */}
          <div className="text-[10px] text-slate-400 mt-6 border-t border-slate-100 pt-4 font-sans">
            AlphaCV Platform
          </div>
        </div>

        {/* Right Details Column */}
        <div className="w-[70%] p-8 md:p-10">
          {/* Header */}
          <div className="border-b border-indigo-50/80 pb-6 mb-6">
            <h1 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-none mb-2 font-sans">
              {fullName || "Your Full Name"}
            </h1>
            <p className="text-indigo-600 md:text-md uppercase tracking-wider font-semibold text-xs leading-none">
              {jobTitle || "Your Target Job Title"}
            </p>
          </div>

          {/* Professional Summary */}
          {renderSummarySection("text-indigo-600", "font-sans", "font-sans text-slate-705", "border-b border-indigo-50/80")}

          {/* Work Experience */}
          <div className="mb-8 font-sans">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-1.5">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-900 font-sans">Professional Experience</h2>
            </div>
            {workExperience && workExperience.length > 0 ? (
              <div className="space-y-5">
                {workExperience.map((exp, idx) => (
                  <div key={idx} id={`exp-${idx}`} className="group">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <h4 className="text-[13px] md:text-sm font-extrabold text-slate-800">
                        {exp.role} <span className="font-medium text-slate-500">at {exp.company}</span>
                      </h4>
                      <span className="text-[10px] md:text-xs font-semibold text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded sm:bg-transparent sm:p-0 shrink-0 font-sans">
                        {exp.duration}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No work history added yet. Enter rough details and click Generate to generate instantly!</p>
            )}
          </div>

          {/* Projects */}
          {renderProjectsSection("text-indigo-600", "font-sans", "font-sans", "border-b border-indigo-50/80")}

          {/* Education */}
          <div className="mb-8 font-sans">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-900 font-sans">Education</h2>
            </div>
            {education && education.length > 0 ? (
              <div className="space-y-4 font-sans">
                {education.map((edu, idx) => (
                  <div key={idx} id={`edu-${idx}`} className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-[13px] md:text-sm font-bold text-slate-800">{edu.degree}</h4>
                      <p className="text-[11px] md:text-xs text-slate-500 font-sans">{edu.school}</p>
                      {edu.description && <p className="text-[11px] md:text-xs text-slate-600 mt-0.5 font-sans">{edu.description}</p>}
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 italic shrink-0 font-sans">{edu.duration}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic font-sans">No education details added.</p>
            )}
          </div>

          {/* Certifications, Achievements, References */}
          {renderCertificationsSection("text-indigo-600", "font-sans", "font-sans", "border-b border-indigo-50/80")}
          {renderAchievementsSection("text-indigo-600", "font-sans", "font-sans", "border-b border-indigo-50/80")}
          {renderReferencesSection("text-indigo-600", "font-sans", "font-sans", "border-b border-indigo-50/80")}
        </div>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 2: ATS Clean (High-parsing perfect flow structure)
  // ==========================================
  const renderATSCleanTemplate = () => {
    return (
      <div className="p-8 md:p-12 min-h-[960px] relative text-slate-900 font-sans transition-all duration-300 bg-white">
        <WatermarkOverlay />

        {/* Centered Minimal Header */}
        <div className="text-center pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            {fullName || "YOUR FULL NAME"}
          </h1>
          <p className="text-slate-600 text-xs tracking-widest uppercase font-medium mt-1 mb-3">
            {jobTitle || "TARGET JOB POSITION"}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-sans">
            {email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{email}</span>}
            {phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{phone}</span>}
            {location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{location}</span>}
            {linkedin && <span className="flex items-center gap-1"><span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">[LN]</span> {linkedin}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {renderSummarySection("text-slate-900", "font-sans", "font-sans text-slate-700", "border-b-2 border-slate-900")}

        {/* Section: Professional Experience */}
        <div className="mb-6">
          <h3 className="text-xs md:text-[13px] font-bold tracking-widest text-slate-800 uppercase border-b-2 border-slate-900 pb-1 mb-4">
            Professional Experience
          </h3>
          {workExperience && workExperience.length > 0 ? (
            <div className="space-y-5">
              {workExperience.map((exp, idx) => (
                <div key={idx} id={`exp-${idx}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[13px] md:text-sm font-extrabold text-slate-900">
                      {exp.role.toUpperCase()} <span className="font-normal text-slate-500">| {exp.company}</span>
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold text-slate-500 tracking-wider">
                      {exp.duration}
                    </span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No work history. Input rough texts to populate bullet lines automatically.</p>
          )}
        </div>

        {/* Projects */}
        {renderProjectsSection("text-slate-950", "font-sans", "font-sans", "border-b-2 border-slate-900")}

        {/* Section: Education */}
        <div className="mb-6">
          <h3 className="text-xs md:text-[13px] font-bold tracking-widest text-slate-800 uppercase border-b-2 border-slate-900 pb-1 mb-4">
            Education
          </h3>
          {education && education.length > 0 ? (
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} id={`edu-${idx}`} className="flex justify-between items-start">
                  <div>
                    <span className="text-[13px] md:text-sm font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-[11px] md:text-xs text-slate-500"> - {edu.school}</span>
                    {edu.description && <p className="text-xs text-slate-600 mt-0.5">{edu.description}</p>}
                  </div>
                  <span className="text-[11px] md:text-xs font-semibold text-slate-500 italic shrink-0">
                    {edu.duration}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No credentials added</p>
          )}
        </div>

        {/* Section: Core Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs md:text-[13px] font-bold tracking-widest text-slate-800 uppercase border-b-2 border-slate-900 pb-1 mb-3">
              Technical & Professional Skills
            </h3>
            <p className="text-slate-700 text-xs md:text-[13px] leading-relaxed font-semibold">
              <span className="font-extrabold text-slate-900">Keywords:</span> {skills.join(" • ")}
            </p>
          </div>
        )}

        {/* Certifications, Achievements, Languages, References */}
        {renderCertificationsSection("text-slate-900", "font-sans", "font-sans", "border-b-2 border-slate-900")}
        {renderAchievementsSection("text-slate-900", "font-sans", "font-sans", "border-b-2 border-slate-900")}
        {renderLanguagesSection("text-slate-900", "font-sans", "font-sans", "border-b-2 border-slate-900")}
        {renderReferencesSection("text-slate-900", "font-sans", "font-sans", "border-b-2 border-slate-900")}
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 3: Executive Premium (Serif Font layout - elegant and bold)
  // ==========================================
  const renderExecutiveTemplate = () => {
    return (
      <div className="p-8 md:p-12 min-h-[960px] relative text-[13px] md:text-[14px] text-slate-900 font-serif bg-[#fdfdfc] border border-stone-200/40 transition-all duration-300">
        <WatermarkOverlay />

        {/* Deluxe centered layout */}
        <div className="text-center mb-8 border-b-2 border-stone-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-normal tracking-wide text-stone-900 sm:font-light">
            {fullName || "Your Name"}
          </h1>
          <p className="text-stone-600 text-xs tracking-widest font-sans uppercase font-semibold mt-1 mb-4">
            {jobTitle || "Executive / Director Position"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-stone-500 font-sans text-xs">
            {email && <span className="hover:text-stone-700">{email}</span>}
            {phone && <span>{phone}</span>}
            {location && <span>{location}</span>}
            {linkedin && <span className="hover:text-stone-700">| <span className="font-bold uppercase tracking-wider text-[10px]">linkedin:</span> {linkedin}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {renderSummarySection("text-stone-800", "font-sans", "font-serif text-stone-700 pb-2 mb-2", "border-b border-stone-300")}

        {/* Experience Section */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-stone-800 mb-4 border-b border-stone-200 pb-0.5">
            Key Leadership Experience
          </h3>
          {workExperience && workExperience.length > 0 ? (
            <div className="space-y-6">
              {workExperience.map((exp, idx) => (
                <div key={idx} id={`exp-${idx}`} className="space-y-1">
                  <div className="flex justify-between items-baseline font-sans text-xs">
                    <span className="font-extrabold text-[13px] md:text-sm text-stone-900">
                      {exp.role} <span className="font-light text-stone-500">at {exp.company}</span>
                    </span>
                    <span className="text-[11px] text-stone-400 italic shrink-0">{exp.duration}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 italic font-sans">Experience log represents career achievements.</p>
          )}
        </div>

        {/* Projects Section */}
        {renderProjectsSection("text-stone-800", "font-sans", "font-serif", "border-b border-stone-200")}

        {/* Education Section */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-stone-800 mb-4 border-b border-stone-200 pb-0.5">
            Credentials & Education
          </h3>
          {education && education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} id={`edu-${idx}`} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-stone-900">{edu.degree}</h4>
                    <p className="font-sans text-xs text-stone-500">{edu.school}</p>
                    {edu.description && <p className="text-[12px] text-stone-700 mt-0.5 italic">{edu.description}</p>}
                  </div>
                  <span className="font-sans text-xs text-stone-400 italic shrink-0">{edu.duration}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 italic font-sans">No education credentials entered.</p>
          )}
        </div>

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-stone-800 mb-3 border-b border-stone-200 pb-0.5">
              Proficiencies & Expertise
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-700 text-[12px] uppercase tracking-wide font-sans">
              {skills.join("  •  ")}
            </div>
          </div>
        )}

        {/* Certifications, Achievements, Languages, References */}
        {renderCertificationsSection("text-stone-800", "font-sans", "font-serif", "border-b border-stone-200")}
        {renderAchievementsSection("text-stone-800", "font-sans", "font-serif", "border-b border-stone-200")}
        {renderLanguagesSection("text-stone-800", "font-sans", "font-sans uppercase text-[12px]", "border-b border-stone-200")}
        {renderReferencesSection("text-stone-800", "font-sans", "font-serif", "border-b border-stone-200")}
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 4: Creative Designer (Asymmetrical spacing + modern tag badges)
  // ==========================================
  const renderCreativeTemplate = () => {
    return (
      <div className="p-8 md:p-10 min-h-[960px] relative text-slate-800 font-sans bg-slate-50 border border-slate-100 transition-all duration-300">
        <WatermarkOverlay />

        {/* Modern Rounded Top Block */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3.5xl font-black tracking-tight leading-tight">
                {fullName || "Your Full Name"}
              </h1>
              <p className="text-violet-100 text-xs md:text-sm tracking-wider font-semibold uppercase mt-0.5">
                {jobTitle || "Creative Designer & Developer"}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 text-xs text-violet-100 border-l border-violet-400/30 pl-4">
              {email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-violet-200" />{email}</span>}
              {phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-violet-200" />{phone}</span>}
              {location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-violet-200" />{location}</span>}
            </div>
          </div>
        </div>

        {/* Creative Bento Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Column 1: Skills & Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-slate-200/50 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-widest font-black text-indigo-500 mb-3.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Core Power
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs rounded-full font-bold border border-violet-100/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* General Highlights */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/50 shadow-sm">
              <h3 className="text-[11px] uppercase tracking-widest font-black text-slate-400 mb-2 font-sans">
                Philosophy
              </h3>
              <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed italic">
                "Turning rough challenges into polished outcomes with precision engineering and high-fidelity product design."
              </p>
            </div>
          </div>

          {/* Bento Column 2 & 3: Experience & Studies */}
          <div className="md:col-span-2 space-y-6">
            {/* Experiece */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/50 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-4">
                What I Have Built
              </h2>
              {workExperience && workExperience.length > 0 ? (
                <div className="space-y-6">
                  {workExperience.map((exp, idx) => (
                    <div key={idx} id={`exp-${idx}`} className="relative pl-4 border-l-2 border-indigo-500/30">
                      <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -left-[5px] top-1.5"></div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <h4 className="text-[13px] md:text-sm font-extrabold text-slate-800">
                          {exp.role} <span className="text-indigo-600 font-semibold">@ {exp.company}</span>
                        </h4>
                        <span className="text-[10px] md:text-xs font-semibold text-slate-400 italic shrink-0">
                          {exp.duration}
                        </span>
                      </div>
                      {renderBullets(exp.description)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">Insert career details to render designer cards.</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/50 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 mb-4">
                Education
              </h2>
              {education && education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} id={`edu-${idx}`} className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-[13px] md:text-sm font-bold text-slate-800">{edu.degree}</h4>
                        <p className="text-[11px] md:text-xs text-slate-500">{edu.school}</p>
                        {edu.description && <p className="text-[11px] text-slate-600 mt-1">{edu.description}</p>}
                      </div>
                      <span className="text-[11px] text-slate-400 italic shrink-0">{edu.duration}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No studies loaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 5: Corporate One-Column (Professional solid look)
  // ==========================================
  const renderCorporateTemplate = () => {
    return (
      <div className="p-8 md:p-12 min-h-[960px] relative text-slate-800 font-sans bg-white border-t-8 border-slate-800 transition-all duration-300">
        <WatermarkOverlay />

        {/* Clean Top Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-2.5xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight leading-none mb-1.5">
              {fullName || "Full Name"}
            </h1>
            <p className="text-indigo-700 font-bold uppercase tracking-wider text-xs md:text-sm">
              {jobTitle || "Business Executive"}
            </p>
          </div>

          <div className="text-xs text-slate-500 space-y-1 md:text-right border-l md:border-l-0 md:border-r border-indigo-400/25 pl-4 md:pl-0 md:pr-4">
            {email && <p className="flex items-center md:justify-end gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-700" />{email}</p>}
            {phone && <p className="flex items-center md:justify-end gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-700" />{phone}</p>}
            {location && <p className="flex items-center md:justify-end gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-700" />{location}</p>}
          </div>
        </div>

        {/* Professional timeline experience */}
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-widest font-black text-slate-900 border-l-4 border-slate-800 pl-2.5 mb-4">
            Professional Work History
          </h2>
          {workExperience && workExperience.length > 0 ? (
            <div className="space-y-4">
              {workExperience.map((exp, idx) => (
                <div key={idx} id={`exp-${idx}`} className="group py-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-[13px] md:text-sm text-slate-900">
                      {exp.role} <span className="font-medium text-slate-500">at {exp.company}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 italic shrink-0 font-medium">
                      {exp.duration}
                    </span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic font-sans pl-2.5">Saved resume timeline details will display here.</p>
          )}
        </div>

        {/* Education grid */}
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-widest font-black text-slate-900 border-l-4 border-slate-800 pl-2.5 mb-4">
            Academic Background
          </h2>
          {education && education.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} id={`edu-${idx}`} className="bg-slate-50 p-3.5 rounded border border-slate-100">
                  <h4 className="text-[13px] font-extrabold text-slate-900 leading-snug">{edu.degree}</h4>
                  <p className="text-[11px] text-indigo-700 font-semibold">{edu.school}</p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">{edu.duration}</p>
                  {edu.description && <p className="text-[11px] text-slate-600 mt-1">{edu.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic font-sans pl-2.5">Academic profiles list certifications and degrees.</p>
          )}
        </div>

        {/* Core skills */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest font-black text-slate-900 border-l-4 border-slate-800 pl-2.5 mb-3">
              Capabilities & Competencies
            </h2>
            <div className="flex flex-wrap gap-1.5 pl-2.5">
              {skills.map((skill, idx) => (
                <span key={idx} className="px-2.5 py-0.5 border border-slate-300 rounded-sm text-xs font-semibold text-slate-700 bg-slate-50">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 6: Academic CV / Minimalist Litera
  // ==========================================
  const renderAcademicTemplate = () => {
    return (
      <div className="p-10 md:p-14 min-h-[960px] relative text-stone-900 font-serif bg-white transition-all duration-300 leading-relaxed">
        <WatermarkOverlay />
        
        {/* Academic Central Header */}
        <div className="text-center pb-8 border-b border-stone-200 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 mb-1">
            {fullName || "Professor Name"}
          </h1>
          <p className="text-stone-500 font-sans text-xs tracking-widest uppercase font-semibold mb-4">
            {jobTitle || "Research Scholar / Faculty Lead"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-stone-650 font-sans">
            {email && <span>{email}</span>}
            {phone && <span>{phone}</span>}
            {location && <span>{location}</span>}
          </div>
        </div>

        {/* Areas of Expertise */}
        {skills && skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-stone-800 font-sans text-xs font-black uppercase tracking-widest mb-3 border-b border-stone-150 pb-1">
              Field Expertise & Key Competencies
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-stone-700 text-[13px] italic font-sans font-medium">
              {skills.join("   •   ")}
            </div>
          </div>
        )}

        {/* Academic/Professional Appointments */}
        <div className="mb-8">
          <h2 className="text-stone-800 font-sans text-xs font-black uppercase tracking-widest mb-4 border-b border-stone-150 pb-1">
            Professional Appointments
          </h2>
          {workExperience && workExperience.length > 0 ? (
            <div className="space-y-6">
              {workExperience.map((exp, idx) => (
                <div key={idx} id={`academic-exp-${idx}`} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-stone-900 text-sm">
                      {exp.role} — <span className="italic font-normal text-stone-600">{exp.company}</span>
                    </span>
                    <span className="font-sans text-[11px] text-stone-500 italic shrink-0">{exp.duration}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 italic font-sans">No appointments records found.</p>
          )}
        </div>

        {/* Academic Credentials */}
        <div className="mb-8">
          <h2 className="text-stone-800 font-sans text-xs font-black uppercase tracking-widest mb-4 border-b border-stone-150 pb-1">
            Academic Biography & Credentials
          </h2>
          {education && education.length > 0 ? (
            <div className="space-y-5">
              {education.map((edu, idx) => (
                <div key={idx} id={`academic-edu-${idx}`} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-stone-900 text-sm">
                      {edu.degree}
                    </span>
                    <span className="font-sans text-[11px] text-stone-500 italic shrink-0">{edu.duration}</span>
                  </div>
                  <p className="text-stone-600 text-xs italic">{edu.school}</p>
                  {edu.description && <p className="text-stone-600 text-xs mt-1 leading-relaxed">{edu.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 italic font-sans">No academic publications or degrees added.</p>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 7: Tech / Developer Dense
  // ==========================================
  const renderTechDeveloperTemplate = () => {
    return (
      <div className="p-8 md:p-10 min-h-[960px] relative text-slate-900 font-sans bg-slate-50 border border-slate-200 transition-all duration-300">
        <WatermarkOverlay />

        {/* Terminal Header */}
        <div className="bg-slate-900 rounded-lg p-5 text-white mb-6 border border-slate-800 shadow-sm font-mono">
          <div className="flex items-center justify-between mb-4 text-xs text-slate-500 border-b border-slate-800 pb-2">
            <span className="text-emerald-400">➜ root@alphacv:~</span>
            <span className="text-slate-600">utf-8 • prod-build</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">{fullName || "Developer Name"}</h1>
          <p className="text-emerald-400 text-xs font-bold tracking-wide mt-0.5">{jobTitle || "./software-engineer"}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            {email && <span className="hover:text-emerald-300 transition">Email: {email}</span>}
            {phone && <span>Cell: {phone}</span>}
            {location && <span>Loc: {location}</span>}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
          
          {/* Tech Stack Left Col */}
          <div className="md:col-span-1 space-y-4">
            {skills && skills.length > 0 && (
              <div>
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  [tech_stack]
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-800 font-mono text-[11px] rounded flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience Right Col */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1">
                <span>01.</span> PROFESSIONAL_EXPERIENCE
              </h3>
              {workExperience && workExperience.length > 0 ? (
                <div className="space-y-4">
                  {workExperience.map((exp, idx) => (
                    <div key={idx} id={`tech-exp-${idx}`} className="group">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                        <h4 className="text-[13px] md:text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                          {exp.role} <span className="font-normal text-[11px] text-slate-500 font-mono">:: {exp.company}</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-200 px-1.5 py-0.5 rounded font-black">
                          {exp.duration}
                        </span>
                      </div>
                      {renderBullets(exp.description)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No engineering logs inserted.</p>
              )}
            </div>

            {/* Education */}
            <div>
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1 flex items-center gap-1">
                <span>02.</span> ACADEMIC_STUDIES
              </h3>
              {education && education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} id={`tech-edu-${idx}`} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-[13px] text-slate-900">{edu.degree}</span>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0 bg-slate-200 px-1 text-slate-705">{edu.duration}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono italic">{edu.school}</p>
                      {edu.description && <p className="text-[11px] text-slate-500 mt-1 leading-normal">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No engineering records registered.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 8: Minimalist Flow
  // ==========================================
  const renderMinimalistFlowTemplate = () => {
    return (
      <div className="p-8 md:p-12 min-h-[960px] relative text-slate-800 font-sans bg-white transition-all duration-300">
        <WatermarkOverlay />

        {/* Minimalist Top Align Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              {fullName || "Your Full Name"}
            </h1>
            <p className="text-slate-500 text-xs tracking-widest uppercase font-medium mt-1">
              {jobTitle || "Your Professional Title"}
            </p>
          </div>
          
          <div className="text-[11px] md:text-xs text-slate-500 space-y-1 font-sans">
            {email && <p className="flex items-center gap-1.5">{email}</p>}
            {phone && <p className="flex items-center gap-1.5">{phone}</p>}
            {location && <p className="flex items-center gap-1.5">{location}</p>}
          </div>
        </div>

        {/* One Column Layout */}
        <div className="space-y-8">
          {/* Work experience */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              Relevant Experience
            </h3>
            {workExperience && workExperience.length > 0 ? (
              <div className="space-y-6">
                {workExperience.map((exp, idx) => (
                  <div key={idx} id={`flow-exp-${idx}`} className="group">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                      <h4 className="text-[13px] md:text-sm font-extrabold text-slate-900">
                        {exp.role} <span className="text-slate-400 font-normal">at {exp.company}</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 shrink-0 italic">
                        {exp.duration}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No work history provided yet.</p>
            )}
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
              Education & Certifications
            </h3>
            {education && education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} id={`flow-edu-${idx}`} className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-xs text-slate-500">{edu.school}</p>
                      {edu.description && <p className="text-xs text-slate-655 mt-1">{edu.description}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 italic shrink-0">{edu.duration}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic flex">No academic items.</p>
            )}
          </div>

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                Expertise Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] rounded-lg border border-slate-200/40"
                  >
                    {skill}
                   </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 9: Bold Left Sidebar Accent
  // ==========================================
  const renderBoldAccentTemplate = () => {
    return (
      <div className="flex h-full min-h-[960px] relative text-slate-800 font-sans transition-all duration-300 bg-white">
        <WatermarkOverlay />

        {/* Tall Colored Accent Column */}
        <div className="w-[32%] bg-gradient-to-b from-indigo-900 to-indigo-950 p-6 md:p-8 text-white flex flex-col justify-between">
          <div>
            {/* Header details */}
            <div className="border-b border-indigo-800/60 pb-6 mb-6">
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">
                {fullName || "Your Name"}
              </h1>
              <p className="text-indigo-300 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                {jobTitle || "Your Target Job"}
              </p>
            </div>

            {/* Contacts sidebar */}
            <div className="space-y-4 mb-8">
              <h3 className="text-indigo-400 text-[9px] font-bold tracking-widest uppercase mb-1">Contact Details</h3>
              {email && (
                <div className="text-[11px] text-indigo-100 break-all leading-normal">
                  <p className="text-[9px] text-indigo-400 uppercase tracking-widest">Email</p>
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="text-[11px] text-indigo-100 leading-normal">
                  <p className="text-[9px] text-indigo-400 uppercase tracking-widest">Phone</p>
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="text-[11px] text-indigo-100 leading-normal">
                  <p className="text-[9px] text-indigo-400 uppercase tracking-widest">Location</p>
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div>
                <h3 className="text-indigo-400 text-[9px] font-bold tracking-widest uppercase mb-3">Skills Inventory</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-indigo-800/40 border border-indigo-700/50 text-indigo-200 text-[10px] md:text-xs rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-[9px] text-indigo-400 border-t border-indigo-800/60 pt-4">
            AlphaCV Vector Resume
          </div>
        </div>

        {/* Right Details Column elements */}
        <div className="w-[68%] p-8 md:p-10">
          {/* Work highlights */}
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-900 border-b-2 border-indigo-900 pb-1 mb-4 flex items-center gap-1.5">
              Professional Journey
            </h2>
            {workExperience && workExperience.length > 0 ? (
              <div className="space-y-5">
                {workExperience.map((exp, idx) => (
                  <div key={idx} id={`bold-exp-${idx}`} className="group">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[13px] md:text-sm font-extrabold text-slate-900">
                        {exp.role.toUpperCase()} <span className="font-normal text-slate-500">| {exp.company}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {exp.duration}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic font-sans">Insert operations records or career milestones.</p>
            )}
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-900 border-b-2 border-indigo-900 pb-1 mb-4">
              Academic Background
            </h2>
            {education && education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} id={`bold-edu-${idx}`} className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-[11px] md:text-xs text-indigo-600 font-bold">{edu.school}</p>
                      {edu.description && <p className="text-[11px] md:text-xs text-slate-600 mt-1">{edu.description}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 italic shrink-0">{edu.duration}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic font-sans animate-none">No education entries registered.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get template-specific decorative configuration for the 30-template engine
  const getCustomTemplateConfig = (tName: string) => {
    const configs: Record<string, any> = {
      vintage_journal: {
        isDual: false,
        fonts: { heading: "font-serif", body: "font-serif" },
        colors: {
          containerBg: "bg-[#fdfcf7]",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-amber-900",
          accentBg: "bg-amber-100/40",
          border: "border-amber-900/10",
        },
        styles: { headerCenter: true },
      },
      emerald_forest: {
        isDual: true,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-emerald-950/[0.04]",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-600",
          accentText: "text-emerald-950",
          accentBg: "bg-emerald-100/50",
          border: "border-emerald-100",
        },
        styles: {},
      },
      midnight_obsidian: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-[#fcfcff]",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-600",
          accentText: "text-indigo-950",
          accentBg: "bg-indigo-50",
          border: "border-slate-250",
        },
        styles: {},
      },
      aurora_nordic: {
        isDual: true,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-cyan-50/30",
          textPrimary: "text-cyan-950",
          textSecondary: "text-slate-600",
          accentText: "text-cyan-800",
          accentBg: "bg-cyan-100/40",
          border: "border-cyan-100",
        },
        styles: {},
      },
      royal_heritage: {
        isDual: false,
        fonts: { heading: "font-serif", body: "font-serif" },
        colors: {
          containerBg: "bg-[#fffefe]",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-[#800020]",
          accentBg: "bg-[#800020]/5",
          border: "border-[#800020]/15",
        },
        styles: {},
      },
      sleek_mono: {
        isDual: false,
        fonts: { heading: "font-mono", body: "font-mono" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-gray-900",
          textSecondary: "text-gray-600",
          accentText: "text-black",
          accentBg: "bg-gray-100",
          border: "border-gray-200",
        },
        styles: {},
      },
      warm_terracotta: {
        isDual: true,
        fonts: { heading: "font-serif", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-[#faf6f3]",
          textPrimary: "text-[#3c312a]",
          textSecondary: "text-[#61544c]",
          accentText: "text-[#b46039]",
          accentBg: "bg-[#fbf1eb]",
          border: "border-[#f4e2d8]",
        },
        styles: {},
      },
      cyber_teal: {
        isDual: true,
        fonts: { heading: "font-mono", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-slate-50",
          textPrimary: "text-slate-800",
          textSecondary: "text-slate-600",
          accentText: "text-teal-900",
          accentBg: "bg-teal-50",
          border: "border-teal-100",
        },
        styles: {},
      },
      golden_ratio: {
        isDual: true,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-[#fffdf9]",
          sidebarBg: "bg-amber-50/15",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-[#aa8202]",
          accentBg: "bg-[#fcf7e8]",
          border: "border-amber-200/40",
        },
        styles: {},
      },
      cool_ocean: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-600",
          accentText: "text-blue-900",
          accentBg: "bg-blue-50",
          border: "border-blue-100",
        },
        styles: {},
      },
      slate_compact: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-600",
          accentText: "text-slate-950",
          accentBg: "bg-slate-100",
          border: "border-slate-300",
        },
        styles: {},
      },
      swiss_brutalist: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-black",
          textSecondary: "text-neutral-850",
          accentText: "text-black",
          accentBg: "bg-gray-100",
          border: "border-black",
        },
        styles: {},
      },
      editorial_chic: {
        isDual: false,
        fonts: { heading: "font-serif", body: "font-serif" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-stone-950",
          accentBg: "bg-stone-50",
          border: "border-stone-200",
        },
        styles: {},
      },
      vanguard_impact: {
        isDual: true,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-zinc-100",
          textPrimary: "text-zinc-900",
          textSecondary: "text-zinc-650",
          accentText: "text-black",
          accentBg: "bg-zinc-200",
          border: "border-zinc-350",
        },
        styles: {},
      },
      charcoal_bold: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-[#1a1a1a]",
          textSecondary: "text-[#4a4a4a]",
          accentText: "text-[#060606]",
          accentBg: "bg-neutral-100",
          border: "border-neutral-300",
        },
        styles: {},
      },
      metro_transit: {
        isDual: true,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          sidebarBg: "bg-indigo-950/[0.03]",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-650",
          accentText: "text-indigo-900",
          accentBg: "bg-indigo-50/70",
          border: "border-indigo-100",
        },
        styles: {},
      },
      clean_canvas: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-slate-800",
          textSecondary: "text-slate-500",
          accentText: "text-slate-900",
          accentBg: "bg-slate-50",
          border: "border-transparent",
        },
        styles: {},
      },
      sapphire_elite: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-600",
          accentText: "text-blue-950",
          accentBg: "bg-blue-50/60",
          border: "border-blue-200/40",
        },
        styles: {},
      },
      rose_gold: {
        isDual: true,
        fonts: { heading: "font-serif", body: "font-sans" },
        colors: {
          containerBg: "bg-[#fffefe]",
          sidebarBg: "bg-[#faf5f5]",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-[#b27676]",
          accentBg: "bg-[#fcf0f0]",
          border: "border-[#f2dddd]",
        },
        styles: {},
      },
      eco_growth: {
        isDual: false,
        fonts: { heading: "font-sans", body: "font-sans" },
        colors: {
          containerBg: "bg-white",
          textPrimary: "text-stone-900",
          textSecondary: "text-stone-600",
          accentText: "text-emerald-900",
          accentBg: "bg-emerald-50/70",
          border: "border-emerald-100/60",
        },
        styles: {},
      },
      apex_leader: {
        isDual: false,
        fonts: { heading: "font-serif", body: "font-sans" },
        colors: {
          containerBg: "bg-[#fafafc]",
          textPrimary: "text-slate-900",
          textSecondary: "text-slate-650",
          accentText: "text-[#1b365d]",
          accentBg: "bg-[#1b365d]/5",
          border: "border-[#1b365d]/20",
        },
        styles: {},
      },
    };

    return configs[tName] || configs["vintage_journal"];
  };

  // Render custom design templates based on dynamic configuration
  const renderCustomTemplate = (templateName: string) => {
    const config = getCustomTemplateConfig(templateName);
    
    // Style configurations
    const fontPrimary = config.fonts.body;
    const fontHeading = config.fonts.heading;
    const bgContainer = config.colors.containerBg;
    const textPrimary = config.colors.textPrimary;
    const textSecondary = config.colors.textSecondary;
    const accentText = config.colors.accentText;
    const accentBg = config.colors.accentBg;
    const borderColor = config.colors.border;
    const sidebarBg = config.colors.sidebarBg || "bg-slate-50";

    const customBulletRender = (bullets: string[]) => {
      if (!bullets || bullets.length === 0) return null;
      return (
        <ul className={`list-disc pl-5 mt-1.5 space-y-1 ${textSecondary} ${fontPrimary} text-xs md:text-[13px] leading-relaxed`}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      );
    };

    if (config.isDual) {
      return (
        <div className={`flex h-full min-h-[960px] relative ${textPrimary} ${fontPrimary} ${bgContainer} transition-all duration-300`}>
          <WatermarkOverlay />
          
          {/* Left Sidebar */}
          <div className={`w-[32%] ${sidebarBg} border-r ${borderColor} p-6 md:p-8 flex flex-col justify-between`}>
            <div>
              {/* Header inside sidebar */}
              <div className="mb-6">
                <h1 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${accentText} ${fontHeading} leading-none mb-1.5`}>
                  {fullName}
                </h1>
                <p className={`text-xs md:text-[13px] font-bold tracking-wider uppercase opacity-85 ${fontHeading}`}>
                  {jobTitle}
                </p>
              </div>

              {/* Contacts */}
              <div className="space-y-3.5 mb-8">
                <h3 className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${accentText}`}>Contact</h3>
                {email && (
                  <div className="flex items-center gap-2 text-[11px] md:text-xs break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 text-[11px] md:text-xs">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2 text-[11px] md:text-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>{location}</span>
                  </div>
                )}
                {linkedin && (
                  <div className="flex items-center gap-2 text-[11px] md:text-xs break-all">
                    <span className="text-[10px] font-black border border-indigo-500/30 text-indigo-500 px-1 rounded bg-indigo-500/5 leading-none shrink-0 font-sans">In</span>
                    <span>{linkedin}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {skills && skills.length > 0 && (
                <div className="mb-8">
                  <h3 className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${accentText}`}>Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 ${accentBg} ${accentText} text-[10px] md:text-xs rounded font-bold border border-current/10`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <div className="mb-8">
                  <h3 className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${accentText}`}>Languages</h3>
                  <div className="flex flex-col gap-1 text-[11px] md:text-xs text-slate-700">
                    {languages.map((lang, i) => (
                      <span key={i} className="font-semibold">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-[9px] opacity-40 font-mono">
              Designed with AlphaCV • 30 Templates Edition
            </div>
          </div>

          {/* Right Main column */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {/* Prof Summary */}
            {summary && (
              <div className="mb-6">
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Professional Summary
                </h3>
                <p className={`text-xs md:text-[13px] leading-relaxed whitespace-pre-line ${textSecondary}`}>{summary}</p>
              </div>
            )}

            {/* Experience */}
            <div className="mb-6">
              <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3.5`}>
                Work Experience
              </h3>
              {workExperience && workExperience.length > 0 ? (
                <div className="space-y-4">
                  {workExperience.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h4 className={`text-[13px] md:text-sm font-bold ${textPrimary}`}>
                          {exp.role} <span className="font-normal opacity-70">@ {exp.company}</span>
                        </h4>
                        <span className={`text-[10px] md:text-xs font-semibold ${textSecondary} shrink-0`}>
                          {exp.duration}
                        </span>
                      </div>
                      {customBulletRender(exp.description)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic opacity-60">No work experiences specified.</p>
              )}
            </div>

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3.5`}>
                  Projects
                </h3>
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h4 className={`text-[13px] md:text-sm font-bold ${textPrimary}`}>
                          {proj.name} {proj.link && <span className="font-normal text-xs opacity-60">({proj.link})</span>}
                        </h4>
                        {proj.technologies && (
                          <span className={`text-[9px] ${accentBg} ${accentText} px-1.5 py-0.5 rounded font-mono shrink-0`}>
                            {proj.technologies}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs md:text-[13px] ${textSecondary} leading-relaxed`}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="mb-6">
              <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3.5`}>
                Education
              </h3>
              {education && education.length > 0 ? (
                <div className="space-y-3.5">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`text-[13px] font-bold ${textPrimary}`}>{edu.degree}</h4>
                        <p className={`text-[11px] md:text-xs ${accentText} font-bold`}>{edu.school}</p>
                        {edu.description && <p className={`text-[11px] md:text-xs ${textSecondary} mt-1`}>{edu.description}</p>}
                      </div>
                      <span className={`text-[10px] md:text-xs ${textSecondary} shrink-0`}>{edu.duration}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic opacity-60">No education entries registered.</p>
              )}
            </div>

            {/* Certifications, Achievements, References */}
            {certifications && certifications.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Certifications
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${textSecondary} text-xs md:text-[13px]`}>
                  {certifications.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {achievements && achievements.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Achievements
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${textSecondary} text-xs md:text-[13px]`}>
                  {achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            {references && (
              <div className="mb-6">
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2`}>
                  References
                </h3>
                <p className={`text-xs md:text-[13px] leading-relaxed italic ${textSecondary} whitespace-pre-line`}>{references}</p>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Single Column layout (e.g., standard resume/CV)
      return (
        <div className={`p-8 md:p-12 h-full min-h-[960px] relative ${textPrimary} ${fontPrimary} ${bgContainer} transition-all duration-300`}>
          <WatermarkOverlay />
          
          {/* Main header block */}
          <div className={`mb-8 pb-5 border-b-2 ${borderColor} ${config.styles.headerCenter ? "text-center" : ""}`}>
            <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${accentText} ${fontHeading} mb-2 leading-none`}>
              {fullName}
            </h1>
            <p className={`text-xs md:text-sm font-bold uppercase tracking-widest opacity-85 ${fontHeading}`}>
              {jobTitle}
            </p>
            
            {/* Contact details */}
            <div className={`flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] md:text-xs ${textSecondary} mt-3.5 justify-start ${config.styles.headerCenter ? "justify-center" : ""}`}>
              {email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                  <span>{location}</span>
                </div>
              )}
              {linkedin && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black border border-indigo-500/30 text-indigo-500 px-0.5 rounded leading-none">In</span>
                  <span>{linkedin}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            {summary && (
              <div>
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Professional Summary
                </h3>
                <p className={`text-xs md:text-[13px] leading-relaxed whitespace-pre-line ${textSecondary}`}>{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div>
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Core Expertise & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 text-[11px] md:text-xs font-semibold rounded-lg ${accentBg} ${accentText} border border-current/10`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            <div>
              <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3.5`}>
                Work Experience
              </h3>
              {workExperience && workExperience.length > 0 ? (
                <div className="space-y-5">
                  {workExperience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-[13px] md:text-sm font-bold ${textPrimary}`}>
                          {exp.role.toUpperCase()} <span className="font-normal opacity-75">| {exp.company}</span>
                        </span>
                        <span className={`text-[11px] font-semibold ${textSecondary} shrink-0`}>
                          {exp.duration}
                        </span>
                      </div>
                      {customBulletRender(exp.description)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic opacity-60">No work experiences found.</p>
              )}
            </div>

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div>
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3.5`}>
                  Projects & Portfolios
                </h3>
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h4 className={`text-[13px] md:text-sm font-bold ${textPrimary}`}>
                          {proj.name} {proj.link && <span className="font-normal text-xs opacity-60">({proj.link})</span>}
                        </h4>
                        {proj.technologies && (
                          <span className={`text-[9px] ${accentBg} ${accentText} px-1.5 py-0.5 rounded font-mono shrink-0`}>
                            {proj.technologies}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs md:text-[13px] ${textSecondary} leading-relaxed`}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div>
              <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-3`}>
                Education & Credentials
              </h3>
              {education && education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className={`text-[13px] font-bold ${textPrimary}`}>{edu.degree}</h4>
                        <p className={`text-[11px] md:text-xs ${accentText} font-bold`}>{edu.school}</p>
                        {edu.description && <p className={`text-[11px] md:text-xs ${textSecondary} mt-1`}>{edu.description}</p>}
                      </div>
                      <span className={`text-[10px] md:text-xs ${textSecondary} shrink-0`}>{edu.duration}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] italic opacity-60">No education credentials loaded.</p>
              )}
            </div>

            {/* Grid secondary items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications && certifications.length > 0 && (
                <div>
                  <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                    Certifications
                  </h3>
                  <ul className={`list-disc pl-5 space-y-1 ${textSecondary} text-xs md:text-[13px]`}>
                    {certifications.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {languages && languages.length > 0 && (
                <div>
                  <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((l, i) => (
                      <span key={i} className={`px-2.5 py-1 text-[11px] rounded ${accentBg} ${accentText} font-semibold`}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <div>
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2.5`}>
                  Achievements & Awards
                </h3>
                <ul className={`list-disc pl-5 space-y-1 ${textSecondary} text-xs md:text-[13px]`}>
                  {achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}

            {/* References */}
            {references && (
              <div>
                <h3 className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentText} ${fontHeading} border-b ${borderColor} pb-1 mb-2`}>
                  References
                </h3>
                <p className={`text-xs md:text-[13px] leading-relaxed italic ${textSecondary} whitespace-pre-line`}>{references}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Dispatch based on template parameters (supporting 30 templates!)
  const getActiveTemplate = () => {
    switch (selectedTemplate) {
      case "modern":
        return renderModernTemplate();
      case "ats_clean":
        return renderATSCleanTemplate();
      case "executive":
        return renderExecutiveTemplate();
      case "creative":
        return renderCreativeTemplate();
      case "corporate":
        return renderCorporateTemplate();
      case "academic":
        return renderAcademicTemplate();
      case "tech_developer":
        return renderTechDeveloperTemplate();
      case "minimalist_flow":
        return renderMinimalistFlowTemplate();
      case "bold_accent":
        return renderBoldAccentTemplate();
      default:
        // Render one of the other 21 templates dynamically via the custom templating engine!
        return renderCustomTemplate(selectedTemplate);
    }
  };

  const getFontSizeCSS = (size?: string) => {
    if (!size || size === "medium") return "";
    if (size === "small") {
      return `
        #resume-preview-container .text-xs,
        #resume-preview-container .text-\\[11px\\],
        #resume-preview-container .text-\\[10px\\],
        #resume-preview-container .text-\\[12px\\] {
          font-size: 11px !important;
          line-height: 1.3 !important;
        }
        #resume-preview-container .text-\\[13px\\],
        #resume-preview-container .text-sm,
        #resume-preview-container .text-\\[14px\\] {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }
        #resume-preview-container .text-base {
          font-size: 14px !important;
        }
        #resume-preview-container .text-lg,
        #resume-preview-container h2 {
          font-size: 15px !important;
        }
        #resume-preview-container .text-xl,
        #resume-preview-container h1 {
          font-size: 19px !important;
        }
      `;
    }
    if (size === "large") {
      return `
        #resume-preview-container .text-xs,
        #resume-preview-container .text-\\[11px\\],
        #resume-preview-container .text-\\[10px\\],
        #resume-preview-container .text-\\[12px\\] {
          font-size: 14.5px !important;
          line-height: 1.5 !important;
        }
        #resume-preview-container .text-\\[13px\\],
        #resume-preview-container .text-sm,
        #resume-preview-container .text-\\[14px\\] {
          font-size: 16.5px !important;
          line-height: 1.6 !important;
        }
        #resume-preview-container .text-base {
          font-size: 18.5px !important;
        }
        #resume-preview-container .text-lg {
          font-size: 21.5px !important;
        }
        #resume-preview-container .text-xl,
        #resume-preview-container h1 {
          font-size: 27px !important;
        }
        #resume-preview-container h2 {
          font-size: 21px !important;
        }
      `;
    }
    if (size === "xlarge") {
      return `
        #resume-preview-container .text-xs,
        #resume-preview-container .text-\\[11px\\],
        #resume-preview-container .text-\\[10px\\],
        #resume-preview-container .text-\\[12px\\] {
          font-size: 16.5px !important;
          line-height: 1.6 !important;
        }
        #resume-preview-container .text-\\[13px\\],
        #resume-preview-container .text-sm,
        #resume-preview-container .text-\\[14px\\] {
          font-size: 18.5px !important;
          line-height: 1.7 !important;
        }
        #resume-preview-container .text-base {
          font-size: 21.5px !important;
        }
        #resume-preview-container .text-lg {
          font-size: 24.5px !important;
        }
        #resume-preview-container .text-xl,
        #resume-preview-container h1 {
          font-size: 33px !important;
        }
        #resume-preview-container h2 {
          font-size: 24.5px !important;
        }
      `;
    }
    return "";
  };

  const currentFontSize = data.fontSize || "medium";

  return (
    <div id="resume-preview-container" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
      {currentFontSize !== "medium" && (
        <style dangerouslySetInnerHTML={{ __html: getFontSizeCSS(currentFontSize) }} />
      )}
      {getActiveTemplate()}
    </div>
  );
}
