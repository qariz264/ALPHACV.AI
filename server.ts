import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Global API endpoints go FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI CV Generation Route: Converts rough text inputs into highly structured ATS-friendly elements
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { roughText, fullName, email, phone, location, jobTitle } = req.body;

    if (!roughText) {
      return res.status(400).json({ error: "Rough text input is required to generate resume." });
    }

    const ai = getGeminiClient();

    // Use gemini-3.5-flash for high speed and exceptional structured mapping performance
    const prompt = `
      You are an expert resume developer and ATS optimization architect.
      Analyze the following rough career/work history and generate professional CV details.

      Candidate details provided:
      - Full name: ${fullName || "Candidate Name"}
      - Email: ${email || "email@example.com"}
      - Phone: ${phone || ""}
      - Location: ${location || ""}
      - Job Title (Target): ${jobTitle || "Professional Developer / Specialist"}

      Rough text input given by the candidate:
      """
      ${roughText}
      """

      Transform this rough text and inputs into:
      1. An optimized Target Job Title.
      2. A polished array of work experiences. Each work experience must contain specific roles, company names, estimated duration, and 3-4 professional, human-sounding bullet points focusing on actions and measurable outcomes (using strong verbs, avoiding AI clichés like 'spearheaded', 'synergy', 'delighted').
      3. An array of educations. If the rough text or input lists colleges, parse them, or suggest realistic general structures based on their experience.
      4. A clean array of 6-8 relevant professional core skills deduced from their career path.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["jobTitle", "workExperience", "education", "skills"],
          properties: {
            jobTitle: {
              type: Type.STRING,
              description: "The refined, highly professional ATS-friendly job title."
            },
            workExperience: {
              type: Type.ARRAY,
              description: "Array of structured work experiences.",
              items: {
                type: Type.OBJECT,
                required: ["role", "company", "duration", "description"],
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "Estimated timeline, e.g., '2021 - Present' or 'June 2018 - Dec 2020'" },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 refined, impact-focused, human-sounding resume bullet points."
                  }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              description: "Array of structured qualifications.",
              items: {
                type: Type.OBJECT,
                required: ["degree", "school", "duration", "description"],
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "e.g., '2016 - 2020'" },
                  description: { type: Type.STRING, description: "Core details or honors" }
                }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "6 to 8 specialized technical and soft skills."
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate resume content" });
  }
});

// AI Enhancement Route: Handles specific atomic alterations (Shorten, Humanize, Professionalize, Expand, etc.)
app.post("/api/gemini/enhance", async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Input text is required to enhance." });
    }

    const ai = getGeminiClient();

    let enhancementPrompt = "";
    switch (type) {
      case "improve":
        enhancementPrompt = "Rewrite the following resume text to improve flow, impact, and overall polished executive quality.";
        break;
      case "ats":
        enhancementPrompt = "Enhance the following text to pack it with strong keywords, clear phrasing, and action verbs preferred by modern ATS algorithms.";
        break;
      case "professional":
        enhancementPrompt = "Rephrase this content to sound highly professional, formal, and authoritative, suitable for industry leaders.";
        break;
      case "shorten":
        enhancementPrompt = "Condense the following content clearly while maintaining high impact. Make it concise and punchy.";
        break;
      case "expand":
        enhancementPrompt = "Expand on the following bullet points to elaborate on methodology, tool integration, and business results.";
        break;
      case "humanize":
        enhancementPrompt = "Rewrite this text to sound thoroughly human-written. Purge typical AI buzzwords ('testament', 'delve', 'moreover', 'synergy', 'spearheaded') and adopt a clean, genuine, yet professional tone.";
        break;
      default:
        enhancementPrompt = "Polish and format the following resume bullet points elegantly.";
    }

    const prompt = `
      You are a champion resume editor and human resources specialist.
      Task: ${enhancementPrompt}

      Input Text (one or more bullet points):
      """
      ${text}
      """

      Return ONLY the rewritten, enhanced text with NO introductory remarks, quotes, or markdown annotations.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ success: true, enhancedText: response.text?.trim() });
  } catch (error: any) {
    console.error("AI Enhancement Error:", error);
    res.status(500).json({ error: error?.message || "Failed to enhance content" });
  }
});

// Full CV Humanization & ATS Optimization Route
app.post("/api/gemini/optimize-cv", async (req, res) => {
  try {
    const {
      fullName,
      jobTitle,
      summary,
      workExperience,
      skills,
      projects,
      certifications,
      achievements,
      languages,
      references
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `
      You are an elite, top-tier Professional CV Writer and technical ATS Evaluator.
      Your task is to take this existing resume data and output a fully humanized, high-performance, ATS-optimized version that scores 90%+ on modern Applicant Tracking Systems.

      CRITICAL PRINCIPLES FOR INTENTIONAL HIGH-PASS ATS & HUMANIZED STYLE:
      1. HUMANIZED TONE & FLOW:
         - Eliminate AI buzzwords, repetitive structures, and typical ChatGPT boilerplate phrases entirely (e.g. do NOT use "stands as a testament", "delve into", "deep dive", "comprehensive ecosystem", "spearheaded synergy", "pioneered game-changing solutions", "passionate team player").
         - Write in clean, professional, metric-driven active business language. Use engaging action verbs at the start of experience bullets (e.g., 'Engineered', 'Overhauled', 'Automated', 'Led', 'Scaled', 'Architected').
      2. 90%+ ATS COMPLIANCE:
         - Keep terms literal and easy for parse algorithms.
         - Ensure professional experiences are impact-oriented. For EACH experience, rewrite bullets to include real-world measurable metrics (e.g., percentages, latencies, dollar volumes, hours saved, capacity increases) or logical metrics where raw numbers aren't provided. Every single job must have at least one bullet with a quantifiable result.
         - Standardize syntax. Ensure roles and company details look perfectly structured.
         - Suggest highly targeted technical and professional skills aligned with the job title.

      Original Resume Data:
      - Full Name: ${fullName || "Candidate"}
      - Target Job Title: ${jobTitle || ""}
      - Summary: ${summary || ""}
      - Work Experiences: ${JSON.stringify(workExperience || [])}
      - Skills: ${JSON.stringify(skills || [])}
      - Projects: ${JSON.stringify(projects || [])}
      - Certifications: ${JSON.stringify(certifications || [])}
      - Achievements: ${JSON.stringify(achievements || [])}
      - Languages: ${JSON.stringify(languages || [])}
      - References: ${references || ""}

      Return a completely rewritten professional suite mapping all items to the schema layout. Preserve existing information but elevate the quality, phrasing, metrics, tech stacks, and tone.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["jobTitle", "summary", "workExperience", "skills", "projects", "certifications", "achievements", "languages", "references"],
          properties: {
            jobTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            workExperience: {
              type: Type.ARRAY,
              description: "Array of structured work experiences.",
              items: {
                type: Type.OBJECT,
                required: ["role", "company", "duration", "description"],
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "e.g., '2021 - Present'" },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 refined, impact-focused, thoroughly human-sounding resume bullet points with action verbs and specific metric outcomes."
                  }
                }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "description", "technologies"],
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  link: { type: Type.STRING }
                }
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            references: { type: Type.STRING }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Full CV Optimization Error:", error);
    res.status(500).json({ error: error?.message || "Failed to fully optimize resume data" });
  }
});

// Real-time alignment of CV structures when Job Title changes
app.post("/api/gemini/align-job-title", async (req, res) => {
  try {
    const {
      newJobTitle,
      summary,
      workExperience,
      skills,
      projects
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `
      You are an expert ATS Optimization tool and elite career strategist.
      The candidate has changed their Target Job Title to: "${newJobTitle}".
      
      We need to dynamically align their existing CV to this new target job title in real time, so that the entire profile reads cohesively.
      
      Tasks:
      1. Rewrite the Professional Summary (or generate a fresh one if empty) to highlight transferrable skills, leadership, and expertise aligned specifically with "${newJobTitle}". Ensure the tone is human, metric-backed, and free of AI slop/clichés.
      2. Re-sequence and update the Skills array. Merge and map the existing skills, adding highly relevant domain expertise and keyword terms required for standard "${newJobTitle}" parser compliance. Return at least 8 strong skills.
      3. For each professional Work Experience item, rewrite or adjust the description bullet points to highlight skills, outcomes, and business impacts aligned with "${newJobTitle}" (e.g., if moving from Software Engineer to Project Manager, frame bullet points to emphasize delivery, leadership, scheduling, coordination, cross-functional communication, or resource allocation alongside technical execution). Ensure bullet points start with strong action verbs.
      4. If projects exist, slightly re-frame descriptions to highlight leadership, product/project alignment, or relevant delivery goals.

      Current User Data:
      - Current Summary: ${summary || ""}
      - Current Work Experiences: ${JSON.stringify(workExperience || [])}
      - Current Skills: ${JSON.stringify(skills || [])}
      - Current Projects: ${JSON.stringify(projects || [])}

      Return a JSON representation mapping directly to the following schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "workExperience", "skills", "projects"],
          properties: {
            summary: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            workExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["role", "company", "duration", "description"],
                properties: {
                  role: { type: Type.STRING, description: "Adapt job title/role subtly if applicable, or keep original name." },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "description", "technologies"],
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  link: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("AI Role Alignment Error:", error);
    res.status(500).json({ error: error?.message || "Failed to align CV to new job title" });
  }
});

// AI CV Tailoring to Job Description / Summary requirements
app.post("/api/gemini/optimize-for-job", async (req, res) => {
  try {
    const {
      jobDescription,
      fullName,
      jobTitle,
      summary,
      workExperience,
      skills,
      projects
    } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required to optimize CV." });
    }

    const ai = getGeminiClient();

    const prompt = `
      You are an elite, top-tier Professional CV Writer and technical ATS Analyst.
      Your task is to take the candidate's existing resume data and optimize/tailor it to perfectly match and rank high for the following target Job Description/Summary:
      
      Target Job Description/Requirements:
      """
      ${jobDescription}
      """
      
      Tasks:
      1. Determine the best, highly-aligned target job title based on the requirements and candidate's experience. Subtly adjust the "jobTitle" if beneficial (e.g. adjust "Developer" to "Senior Frontend Engineer" if the description emphasizes senior frontend roles and matching skills are present).
      2. Rewrite the Professional Summary (or generate a fresh one if empty) to highlight transferrable skills, leadership, and expertise aligned specifically with the key themes of the target Job Description. Ensure the tone is human, metric-backed, professional, and free of AI slop/clichés.
      3. Re-sequence, update, or tailor the Skills array. Merge and map the existing skills, adding highly relevant domain expertise, methodologies, and keyword terms required for standard scanner compliance for this specific job description. Return a list of strong skills (8 to 15 items).
      4. For each Work Experience item, rewrite or adjust the description bullet points to highlight skills, outcomes, and business impacts aligned with the key requirements of the target Job Description (e.g. emphasize metrics, technologies, or leadership elements mentioned in the job description). Ensure bullet points start with strong action verbs.
      5. Adjust project descriptions (if any) to highlight relevant tech stack or delivery achievements matching the target job description.

      Current User Data:
      - Current Title: ${jobTitle || ""}
      - Current Summary: ${summary || ""}
      - Current Work Experiences: ${JSON.stringify(workExperience || [])}
      - Current Skills: ${JSON.stringify(skills || [])}
      - Current Projects: ${JSON.stringify(projects || [])}

      Return a JSON representation mapping directly to the following schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["jobTitle", "summary", "workExperience", "skills", "projects"],
          properties: {
            jobTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            workExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["role", "company", "duration", "description"],
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "description", "technologies"],
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.STRING },
                  link: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Optimize CV to Job Description Error:", error);
    res.status(500).json({ error: error?.message || "Failed to optimize CV for the job description." });
  }
});

// Paystack Kenya Payment Routes (Monetization: 100 KES charge per resume unlock)
app.post("/api/paystack/initialize", async (req, res) => {
  try {
    const { email, resumeId } = req.body;

    if (!email || !resumeId) {
      return res.status(400).json({ error: "Customer email and resumeId are required." });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const amountInKobo = 100 * 100; // 100 KES to Kobo/Cents

    // Gracious Sandbox Fallback: If no Paystack secret is configured, run a simulated checkout flow
    if (!secretKey || secretKey === "MY_PAYSTACK_SECRET_KEY" || secretKey.trim() === "") {
      const mockRef = `sim_ref_${Math.random().toString(36).substring(2, 11)}`;
      return res.json({
        success: true,
        isSimulated: true,
        authorization_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/?pay_sim=true&reference=${mockRef}&resumeId=${resumeId}`,
        reference: mockRef,
      });
    }

    // Call real Paystack API
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency: "KES",
        reference: `alphacv_${resumeId}_${Date.now()}`,
        callback_url: `${process.env.APP_URL || `http://localhost:${PORT}`}/dashboard?pay_success=true&resumeId=${resumeId}`,
        metadata: {
          resumeId,
          custom_fields: [
            {
              display_name: "Resume ID",
              variable_name: "resume_id",
              value: resumeId,
            },
          ],
        },
      }),
    });

    const body = await response.json();
    if (!response.ok || !body.status) {
      return res.status(400).json({ error: body.message || "Paystack initialization failed." });
    }

    res.json({
      success: true,
      isSimulated: false,
      authorization_url: body.data.authorization_url,
      reference: body.data.reference,
    });
  } catch (error: any) {
    console.error("Paystack Initialize Error:", error);
    res.status(500).json({ error: error?.message || "Failed to initialize payment gateway" });
  }
});

app.post("/api/paystack/verify", async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Reference parameter is required." });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // Simulator Verification Response
    if (!secretKey || secretKey === "MY_PAYSTACK_SECRET_KEY" || secretKey.trim() === "" || reference.startsWith("sim_ref_")) {
      return res.json({
        success: true,
        status: "success",
        isSimulated: true,
        data: {
          reference,
          status: "success",
          currency: "KES",
          amount: 10000,
        },
      });
    }

    // Call real Paystack verification
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const body = await response.json();
    if (!response.ok || !body.status) {
      return res.status(400).json({ error: body.message || "Failed to verify transaction." });
    }

    res.json({
      success: true,
      status: body.data.status,
      isSimulated: false,
      data: body.data,
    });
  } catch (error: any) {
    console.error("Paystack Verify Error:", error);
    res.status(500).json({ error: error?.message || "Failed to verify payment with gateway" });
  }
});

// Configure Vite integration inside custom server
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked to Express");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build routing activated");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AlphaCV AI Server] Running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL) {
  console.log("Vercel Serverless environment detected. Serving API as serverless function handler.");
} else {
  setupVite().catch((err) => {
    console.error("Vite server linkage failure:", err);
  });
}

export default app;
