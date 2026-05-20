import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Download,
  Plus,
  Trash2,
  Copy,
  Edit,
  LogOut,
  CheckCircle2,
  CreditCard,
  Lock,
  AlertTriangle,
  FileText,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  LayoutGrid,
  MapPin,
  Phone,
  Mail,
  Flame,
  UserCheck,
  Smartphone,
  Activity,
  AlertCircle,
  Loader2
} from "lucide-react";
import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { ResumeData, WorkExperience, Education } from "./types";
import { analyzeResume } from "./utils/atsAnalyzer";
import ResumePreview from "./components/ResumePreview";
import { handleFirestoreError, OperationType } from "./lib/firebaseUtils";

export default function App() {
  // Navigation & User session states
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<"landing" | "dashboard" | "builder">("landing");
  
  // Resumes and current active resume drafting state
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [resumesLoading, setResumesLoading] = useState(false);

  // AIS AI integration status indicators
  const [generatingAI, setGeneratingAI] = useState(false);
  const [optimizingCV, setOptimizingCV] = useState(false);
  const [optSuccessMessage, setOptSuccessMessage] = useState<string | null>(null);
  const [targetJobDesc, setTargetJobDesc] = useState<string>("");
  const [tailoringCV, setTailoringCV] = useState<boolean>(false);
  const [tailorSuccessMessage, setTailorSuccessMessage] = useState<string | null>(null);
  const [tailorErrorMessage, setTailorErrorMessage] = useState<string | null>(null);
  const [enhancingBullet, setEnhancingBullet] = useState<string | null>(null); // bullet identifier
  const [selectedBulletIndex, setSelectedBulletIndex] = useState<{ expIdx: number; bulletIdx: number } | null>(null);
  const [rewriteOption, setRewriteOption] = useState<string>("improve");

  // Manual inputs states for structure addition
  const [newExp, setNewExp] = useState({ role: "", company: "", duration: "", bullet: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", school: "", duration: "", description: "" });
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState({ name: "", link: "", technologies: "", description: "" });
  const [newCert, setNewCert] = useState("");
  const [newAch, setNewAch] = useState("");
  const [newLang, setNewLang] = useState("");
  const [polishingFields, setPolishingFields] = useState<Record<string, boolean>>({});
  const [lastAlignedTitle, setLastAlignedTitle] = useState<string>("");
  const [aligningRole, setAligningRole] = useState(false);
  const [resumeIdToDelete, setResumeIdToDelete] = useState<string | null>(null);
  const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Paystack Integration states
  const [showPaywall, setShowPaywall] = useState(false);
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Paystack Sandbox Simulator states
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorRef, setSimulatorRef] = useState("");
  const [simulatorMpesaPhone, setSimulatorMpesaPhone] = useState("");
  const [simulatigResponse, setSimulatingResponse] = useState(false);

  // Email/Password and Anonymous Auth UI states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Active scorecard calculations
  const auditResult = activeResume ? analyzeResume(activeResume) : { atsScore: 0, humanScore: 0, feedback: [] };

  // Initial user auth watcher
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        setIsGuest(false);
        setView("dashboard");
      }
    });
    return () => unsub();
  }, []);

  // Listen for pay success callbacks in URL params (Paystack Redirection)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("pay_success");
    const resumeId = params.get("resumeId");
    if (success === "true" && resumeId) {
      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 5000);
    }
  }, []);

  // Sync lastAlignedTitle whenever the active draft is loaded
  useEffect(() => {
    if (activeResume?.id) {
      setLastAlignedTitle(activeResume.jobTitle || "");
    } else {
      setLastAlignedTitle("");
    }
  }, [activeResume?.id]);

  // Load resumes based on User session or Guest cookies
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (user.isLocal) {
        const raw = localStorage.getItem(`alphacv_resumes_${user.uid}`);
        setResumes(raw ? JSON.parse(raw) : []);
        setResumesLoading(false);
        return;
      }
      setResumesLoading(true);
      const q = query(collection(db, "resumes"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: ResumeData[] = [];
          snapshot.forEach((snap) => {
            loaded.push({ id: snap.id, ...snap.data() } as ResumeData);
          });
          setResumes(loaded);
          setResumesLoading(false);
        },
        (error) => {
          console.error("Firestore Listen Failed:", error);
          setResumesLoading(false);
        }
      );
      return () => unsubscribe();
    } else if (isGuest) {
      const raw = localStorage.getItem("alphacv_guest_resumes");
      setResumes(raw ? JSON.parse(raw) : []);
      setResumesLoading(false);
    } else {
      setResumes([]);
    }
  }, [user, isGuest, authLoading]);

  // Auth helper: Popups
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Popup Sign in blocked or failed. Opening custom input login panel:", err);
      // Auto open our beautiful multi-option auth modal containing direct email & instant anonymous access
      setAuthError("Google Pop-up was blocked or cancelled. Try signing up with Email or Instant Demo below!");
      setShowAuthModal(true);
    } finally {
      setAuthLoading(false);
    }
  };

  // Safe Anonymous Login Flow
  const handleAnonymousLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await signInAnonymously(auth);
      setShowAuthModal(false);
      setView("dashboard");
    } catch (err: any) {
      // Clean fallback: anonymous is restricted or disabled on this Firebase project, so use local guest mode smoothly.
      console.info("Anonymous sign-in not enabled or restricted (auth/admin-restricted-operation). Using high-performance browser-based local storage seamlessly.");
      setIsGuest(true);
      setShowAuthModal(false);
      setView("dashboard");
    } finally {
      setAuthLoading(false);
    }
  };

  // Email/Password authentication form submit handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setSubmittingAuth(true);
    setAuthError("");
    try {
      if (authMode === "signin") {
        try {
          await signInWithEmailAndPassword(auth, authEmail, authPassword);
        } catch (signInErr: any) {
          // Check if Email/password provider is disabled on this firebase project
          if (signInErr.code === "auth/operation-not-allowed") {
            handleLocalAuthFallback(authEmail, authPassword, "signin");
            return;
          }
          // If the email doesn't exist yet, automatically register them to make signing in seamless for new users
          if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
            try {
              await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            } catch (createErr: any) {
              if (createErr.code === "auth/operation-not-allowed") {
                handleLocalAuthFallback(authEmail, authPassword, "signup");
                return;
              }
              throw createErr;
            }
          } else {
            throw signInErr;
          }
        }
      } else {
        try {
          await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        } catch (createErr: any) {
          if (createErr.code === "auth/operation-not-allowed") {
            handleLocalAuthFallback(authEmail, authPassword, "signup");
            return;
          }
          throw createErr;
        }
      }
      setShowAuthModal(false);
      setView("dashboard");
    } catch (err: any) {
      console.error("Email auth error details:", err);
      let msg = err.message || "Authentication error.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        msg = "Invalid email or matching password.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "A profile with this email address already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password standard must be at least 6 characters.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password sign-in is not enabled yet. Please go to your Firebase Console under Authentication > Sign-in Method and enable 'Email/Password'.";
      }
      setAuthError(msg);
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Local Credential Fallback helper
  const handleLocalAuthFallback = (email: string, pass: string, mode: "signin" | "signup") => {
    const rawUsers = localStorage.getItem("alphacv_local_users");
    const localUsers = rawUsers ? JSON.parse(rawUsers) : {};
    
    if (mode === "signup") {
      if (localUsers[email]) {
        setAuthError("A profile with this email address already exists.");
        return;
      }
      localUsers[email] = pass;
      localStorage.setItem("alphacv_local_users", JSON.stringify(localUsers));
    } else {
      // signin / seamless auto-register
      if (!localUsers[email]) {
        localUsers[email] = pass;
        localStorage.setItem("alphacv_local_users", JSON.stringify(localUsers));
      } else if (localUsers[email] !== pass) {
        setAuthError("Incorrect password for this email profile.");
        return;
      }
    }
    
    const mockUser = { 
      uid: `local_${btoa(email).replace(/=/g, "")}`, 
      email, 
      isLocal: true 
    };
    setUser(mockUser);
    setIsGuest(false);
    setShowAuthModal(false);
    setView("dashboard");
  };

  // Skip Login / Guest Access
  const handleGuestAccess = () => {
    // We now prefer the highly functional Anonymous Auth so they can write & read firestore securely,
    // falling back to local storage only if offline or custom rules block it!
    handleAnonymousLogin();
  };

  // Log Out handler
  const handleLogout = async () => {
    await signOut(auth);
    setIsGuest(false);
    setUser(null);
    setView("landing");
  };

  // Dashboard Action: Create CV
  const handleCreateResume = async () => {
    const timestamp = new Date().toISOString();
    const newResume: ResumeData = {
      id: `cv_${Math.random().toString(36).substring(2, 11)}`,
      userId: user?.uid || "guest_uid",
      title: `Resume ${resumes.length + 1} - Refined`,
      fullName: user?.displayName || "Jane Doe",
      email: user?.email || "jane.doe@example.com",
      phone: "+254 700 000 000",
      location: "Nairobi, Kenya",
      linkedin: "linkedin.com/in/janedoe",
      summary: "Accomplished Software Engineer with deep expertise in full-stack TypeScript development, cloud migration, and reactive user interfaces. Proven track record of spearheading performant system migrations and mentoring engineering teams to design clean, high-performance web microservices.",
      jobTitle: "Software Engineer",
      workExperienceText: "Worked as developer at Tech Corp for 2 years. Programmed web services, increased performance, led software projects.",
      workExperience: [
        {
          role: "Senior Software Engineer",
          company: "Tech Corp",
          duration: "2024 - Present",
          description: [
            "Programmed high-frequency web microservices in TypeScript, reducing response latency by 35%.",
            "Orchestrated cross-functional database migrations, optimizing query times for scalable users.",
            "Led developer standups and mentoring programs to improve clean architecture practices."
          ]
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "Strathmore University",
          duration: "2020 - 2024",
          description: "Graduated with First Class Honors. Specialized in distributed systems."
        }
      ],
      skills: ["React.JS", "NodeJS", "TypeScript", "Database Systems", "API Engineering", "System Architecture"],
      projects: [
        {
          name: "Enterprise Query Accelerator",
          link: "github.com/janedoe/accelerator",
          technologies: "Rust, gRPC, Redis",
          description: "Engineered high-concurrency memory pools in Rust, boosting enterprise read throughput by 400%."
        }
      ],
      certifications: [
        "AWS Solution Architect (Associate)",
        "HashiCorp Terraform Associate Certified"
      ],
      achievements: [
        "First Place Winner at Nairobi Tech Hackathon 2023.",
        "Recipient of Tech Corp 'Rising Star Employee' in Q2 2024."
      ],
      languages: [
        "English (Native)",
        "Swahili (Fluent)"
      ],
      references: "Professional references available upon request.",
      selectedTemplate: "modern",
      hasPaid: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (user) {
      if (user.isLocal) {
        const list = [...resumes, newResume];
        localStorage.setItem(`alphacv_resumes_${user.uid}`, JSON.stringify(list));
        setResumes(list);
      } else {
        try {
          await setDoc(doc(db, "resumes", newResume.id), newResume);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `resumes/${newResume.id}`);
        }
      }
    } else {
      const list = [...resumes, newResume];
      localStorage.setItem("alphacv_guest_resumes", JSON.stringify(list));
      setResumes(list);
    }

    setActiveResume(newResume);
    setView("builder");
  };

  // Dashboard Action: Duplicate CV
  const handleDuplicateResume = async (target: ResumeData) => {
    const timestamp = new Date().toISOString();
    const copy: ResumeData = {
      ...target,
      id: `cv_${Math.random().toString(36).substring(2, 11)}`,
      title: `${target.title} (Copy)`,
      hasPaid: false, // Must repurchase to clear watermark on distinct copies
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (user) {
      if (user.isLocal) {
        const list = [...resumes, copy];
        localStorage.setItem(`alphacv_resumes_${user.uid}`, JSON.stringify(list));
        setResumes(list);
      } else {
        try {
          await setDoc(doc(db, "resumes", copy.id), copy);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `resumes/${copy.id}`);
        }
      }
    } else {
      const list = [...resumes, copy];
      localStorage.setItem("alphacv_guest_resumes", JSON.stringify(list));
      setResumes(list);
    }
  };

  // Dashboard Action: Delete CV
  const handleDeleteResume = async (resumeId: string) => {
    if (activeResume?.id === resumeId) {
      setActiveResume(null);
      setView("dashboard");
    }
    if (user) {
      if (user.isLocal) {
        const list = resumes.filter(r => r.id !== resumeId);
        localStorage.setItem(`alphacv_resumes_${user.uid}`, JSON.stringify(list));
        setResumes(list);
      } else {
        try {
          await deleteDoc(doc(db, "resumes", resumeId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `resumes/${resumeId}`);
        }
      }
    } else {
      const list = resumes.filter(r => r.id !== resumeId);
      localStorage.setItem("alphacv_guest_resumes", JSON.stringify(list));
      setResumes(list);
    }
  };

  // Save changes locally in state & trigger debounced server-sync or instant save
  const syncResumeData = async (updated: ResumeData) => {
    setActiveResume(updated);
    if (user) {
      if (user.isLocal) {
        const list = resumes.map(r => r.id === updated.id ? updated : r);
        localStorage.setItem(`alphacv_resumes_${user.uid}`, JSON.stringify(list));
        setResumes(list);
      } else {
        try {
          // Instant write to Firestore
          await setDoc(doc(db, "resumes", updated.id), {
            ...updated,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `resumes/${updated.id}`);
        }
      }
    } else {
      const list = resumes.map(r => r.id === updated.id ? updated : r);
      localStorage.setItem("alphacv_guest_resumes", JSON.stringify(list));
      setResumes(list);
    }
  };

  // AI Prompt rewrites rough texts into highly engineered lists
  const triggerAIRewrite = async () => {
    if (!activeResume) return;
    setGeneratingAI(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roughText: activeResume.workExperienceText,
          fullName: activeResume.fullName,
          email: activeResume.email,
          phone: activeResume.phone,
          location: activeResume.location,
          jobTitle: activeResume.jobTitle
        })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI translation service returned an error.");

      if (body.success && body.data) {
        const { jobTitle, workExperience, education, skills } = body.data;
        const updated: ResumeData = {
          ...activeResume,
          jobTitle: jobTitle || activeResume.jobTitle,
          workExperience: workExperience || activeResume.workExperience,
          education: education || activeResume.education,
          skills: skills || activeResume.skills
        };
        await syncResumeData(updated);
      }
    } catch (err: any) {
      alert(`AI rewrite failed: ${err.message || err}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Full-scale deep humanization and ATS keyword optimization
  const triggerFullCVOptimization = async () => {
    if (!activeResume) return;
    setOptimizingCV(true);
    setOptSuccessMessage(null);
    try {
      const response = await fetch("/api/gemini/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: activeResume.fullName,
          jobTitle: activeResume.jobTitle,
          summary: activeResume.summary,
          workExperience: activeResume.workExperience,
          skills: activeResume.skills,
          projects: activeResume.projects || [],
          certifications: activeResume.certifications || [],
          achievements: activeResume.achievements || [],
          languages: activeResume.languages || [],
          references: activeResume.references || ""
        })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI full optimization service returned an error.");

      if (body.success && body.data) {
        const {
          jobTitle,
          summary,
          workExperience,
          skills,
          projects,
          certifications,
          achievements,
          languages,
          references
        } = body.data;

        const updated: ResumeData = {
          ...activeResume,
          jobTitle: jobTitle || activeResume.jobTitle,
          summary: summary || activeResume.summary,
          workExperience: workExperience || activeResume.workExperience,
          skills: skills || activeResume.skills,
          projects: projects || activeResume.projects,
          certifications: certifications || activeResume.certifications,
          achievements: achievements || activeResume.achievements,
          languages: languages || activeResume.languages,
          references: references || activeResume.references
        };

        await syncResumeData(updated);
        setOptSuccessMessage("CV successfully humanized and optimized for 90%+ ATS compatibleness!");
        setTimeout(() => setOptSuccessMessage(null), 8000);
      }
    } catch (err: any) {
      alert(`Optimization failed: ${err.message || err}`);
    } finally {
      setOptimizingCV(false);
    }
  };

  // Humanize and optimize entire resume tailored to a specific job description
  const triggerJobSpecificCVOptimization = async () => {
    if (!activeResume) return;
    if (!targetJobDesc.trim()) {
      setTailorErrorMessage("Please paste or type a Target Job Description / requirements first!");
      setTimeout(() => setTailorErrorMessage(null), 6000);
      return;
    }
    setTailoringCV(true);
    setTailorSuccessMessage(null);
    setTailorErrorMessage(null);
    try {
      const response = await fetch("/api/gemini/optimize-for-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: targetJobDesc,
          fullName: activeResume.fullName,
          jobTitle: activeResume.jobTitle,
          summary: activeResume.summary,
          workExperience: activeResume.workExperience,
          skills: activeResume.skills,
          projects: activeResume.projects || []
        })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI job optimization service returned an error.");

      if (body.success && body.data) {
        const {
          jobTitle,
          summary,
          workExperience,
          skills,
          projects
        } = body.data;

        const updated: ResumeData = {
          ...activeResume,
          jobTitle: jobTitle || activeResume.jobTitle,
          summary: summary || activeResume.summary,
          workExperience: workExperience || activeResume.workExperience,
          skills: skills || activeResume.skills,
          projects: projects || activeResume.projects
        };

        await syncResumeData(updated);
        setTailorSuccessMessage("CV successfully tailored & polished to match the target job requirements!");
        setTimeout(() => setTailorSuccessMessage(null), 8000);
      }
    } catch (err: any) {
      setTailorErrorMessage(`Job tailoring failed: ${err.message || err}`);
    } finally {
      setTailoringCV(false);
    }
  };

  // Real-time alignment of entire resume to a new Target Job Title
  const alignResumeToJobTitle = async () => {
    if (!activeResume || !activeResume.jobTitle || !activeResume.jobTitle.trim()) return;
    setAligningRole(true);
    try {
      const response = await fetch("/api/gemini/align-job-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newJobTitle: activeResume.jobTitle,
          summary: activeResume.summary,
          workExperience: activeResume.workExperience,
          skills: activeResume.skills,
          projects: activeResume.projects || []
        })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI role alignment service returned an error.");

      if (body.success && body.data) {
        const { summary, skills, workExperience, projects } = body.data;

        const updated: ResumeData = {
          ...activeResume,
          summary: summary || activeResume.summary,
          skills: skills || activeResume.skills,
          workExperience: workExperience || activeResume.workExperience,
          projects: projects || activeResume.projects
        };

        await syncResumeData(updated);
        setLastAlignedTitle(activeResume.jobTitle);
        setOptSuccessMessage(`Success! Entire resume aligned, customized, and adapted to "${activeResume.jobTitle}" in real-time!`);
        setTimeout(() => setOptSuccessMessage(null), 8500);
      }
    } catch (err: any) {
      alert(`Role alignment failed: ${err.message || err}`);
    } finally {
      setAligningRole(false);
    }
  };

  // AI Atomic Enhancers (Improve, ATS Phrasing, Shorten, Expand, Humanize)
  const enhanceSelectedBullet = async (type: string) => {
    if (!activeResume || selectedBulletIndex === null) return;
    const { expIdx, bulletIdx } = selectedBulletIndex;
    const bulletToImprove = activeResume.workExperience[expIdx].description[bulletIdx];
    
    setEnhancingBullet(type);
    try {
      const response = await fetch("/api/gemini/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bulletToImprove, type })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI enhancer failed.");

      if (body.success && body.enhancedText) {
        const updatedExpList = [...activeResume.workExperience];
        updatedExpList[expIdx].description[bulletIdx] = body.enhancedText;
        
        await syncResumeData({
          ...activeResume,
          workExperience: updatedExpList
        });
      }
    } catch (err: any) {
      alert(`Enhancement failed: ${err.message}`);
    } finally {
      setEnhancingBullet(null);
    }
  };

  // Generic Field-Level AI Polishing helper
  const polishSingleField = async (
    fieldId: string,
    currentValue: string,
    onSuccess: (polishedText: string) => void,
    customTypeInput?: string
  ) => {
    if (!currentValue || !currentValue.trim()) {
      alert("Please key in some text first before attempting to polish with AI!");
      return;
    }
    setPolishingFields((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const fieldType = customTypeInput || "improve";
      const response = await fetch("/api/gemini/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentValue, type: fieldType })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "AI field polish service returned an error.");

      if (body.success && body.enhancedText) {
        onSuccess(body.enhancedText);
      }
    } catch (err: any) {
      alert(`AI Polish failed: ${err.message || err}`);
    } finally {
      setPolishingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  // manual item updates: append experience
  const addManualJob = () => {
    if (!activeResume || !newExp.role || !newExp.company) return;
    const newJob: WorkExperience = {
      role: newExp.role,
      company: newExp.company,
      duration: newExp.duration || "Present",
      description: newExp.bullet ? [newExp.bullet] : ["Developed innovative software applications."]
    };
    syncResumeData({
      ...activeResume,
      workExperience: [...activeResume.workExperience, newJob]
    });
    setNewExp({ role: "", company: "", duration: "", bullet: "" });
  };

  // manual item updates: append education
  const addManualEdu = () => {
    if (!activeResume || !newEdu.degree || !newEdu.school) return;
    const educationalNode: Education = {
      degree: newEdu.degree,
      school: newEdu.school,
      duration: newEdu.duration || "N/A",
      description: newEdu.description
    };
    syncResumeData({
      ...activeResume,
      education: [...activeResume.education, educationalNode]
    });
    setNewEdu({ degree: "", school: "", duration: "", description: "" });
  };

  // manual item updates: append skill
  const addManualSkill = () => {
    if (!activeResume || !newSkill.trim()) return;
    if (activeResume.skills.includes(newSkill.trim())) return;
    syncResumeData({
      ...activeResume,
      skills: [...activeResume.skills, newSkill.trim()]
    });
    setNewSkill("");
  };

  // manual item updates: append project
  const addManualProject = () => {
    if (!activeResume || !newProject.name) return;
    const projectNode = {
      name: newProject.name,
      link: newProject.link,
      technologies: newProject.technologies,
      description: newProject.description
    };
    syncResumeData({
      ...activeResume,
      projects: [...(activeResume.projects || []), projectNode]
    });
    setNewProject({ name: "", link: "", technologies: "", description: "" });
  };

  // manual item updates: append certification
  const addManualCert = () => {
    if (!activeResume || !newCert.trim()) return;
    syncResumeData({
      ...activeResume,
      certifications: [...(activeResume.certifications || []), newCert.trim()]
    });
    setNewCert("");
  };

  // manual item updates: append achievement
  const addManualAch = () => {
    if (!activeResume || !newAch.trim()) return;
    syncResumeData({
      ...activeResume,
      achievements: [...(activeResume.achievements || []), newAch.trim()]
    });
    setNewAch("");
  };

  // manual item updates: append language
  const addManualLang = () => {
    if (!activeResume || !newLang.trim()) return;
    syncResumeData({
      ...activeResume,
      languages: [...(activeResume.languages || []), newLang.trim()]
    });
    setNewLang("");
  };

  // Payment Setup initialization: Paystack
  const initializeUnlockPayment = async () => {
    if (!activeResume) return;
    setPaystackLoading(true);
    
    const paymentEmail = activeResume.email || user?.email || "customer@example.com";
    
    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: paymentEmail, resumeId: activeResume.id })
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Payment initialisation timed out.");

      if (body.success) {
        if (body.isSimulated) {
          // Open beautiful Integrated Sandbox Simulator
          setSimulatorRef(body.reference);
          setShowSimulator(true);
        } else {
          // Redirect the tab to Paystack secure checkout page
          window.location.href = body.authorization_url;
        }
      }
    } catch (err: any) {
      alert(`Payment failed to boot: ${err.message}`);
    } finally {
      setPaystackLoading(false);
    }
  };

  // Verify Sandbox payments inside integrated pane
  const verifySimulatedPayment = async () => {
    if (!activeResume || !simulatorRef) return;
    setSimulatingResponse(true);
    try {
      const response = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: simulatorRef })
      });

      const body = await response.json();
      if (body.success && body.status === "success") {
        // Unlock PDF document watermark
        const unlocked: ResumeData = { ...activeResume, hasPaid: true };
        await syncResumeData(unlocked);
        
        setShowSimulator(false);
        setShowPaywall(false);
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 5000);
      }
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimulatingResponse(false);
    }
  };

  // Trigger high fidelity system print output
  const triggerPDFDownloadAndPrint = () => {
    if (!activeResume) return;
    window.print();
  };

  // Template change instantly re-renders preview canvas
  const updateActiveTemplate = (templateName: any) => {
    if (!activeResume) return;
    syncResumeData({ ...activeResume, selectedTemplate: templateName });
  };

  // Helper duplication experience items
  const duplicateExpElement = (idx: number) => {
    if (!activeResume) return;
    const target = activeResume.workExperience[idx];
    syncResumeData({
      ...activeResume,
      workExperience: [...activeResume.workExperience, { ...target }]
    });
  };

  // Remove experience items
  const removeExpElement = (idx: number) => {
    if (!activeResume) return;
    const f = activeResume.workExperience.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, workExperience: f });
    setSelectedBulletIndex(null);
  };

  // Remove education elements
  const removeEducationElement = (idx: number) => {
    if (!activeResume) return;
    const f = activeResume.education.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, education: f });
  };

  // Remove skills badges
  const removeSkillElement = (idx: number) => {
    if (!activeResume) return;
    const f = activeResume.skills.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, skills: f });
  };

  // Remove projects elements
  const removeProjectElement = (idx: number) => {
    if (!activeResume || !activeResume.projects) return;
    const f = activeResume.projects.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, projects: f });
  };

  // Remove certifications elements
  const removeCertElement = (idx: number) => {
    if (!activeResume || !activeResume.certifications) return;
    const f = activeResume.certifications.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, certifications: f });
  };

  // Remove achievements elements
  const removeAchElement = (idx: number) => {
    if (!activeResume || !activeResume.achievements) return;
    const f = activeResume.achievements.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, achievements: f });
  };

  // Remove languages elements
  const removeLangElement = (idx: number) => {
    if (!activeResume || !activeResume.languages) return;
    const f = activeResume.languages.filter((_, i) => i !== idx);
    syncResumeData({ ...activeResume, languages: f });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Success Toast Alert */}
      {paymentSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white py-3.5 px-6 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-400 font-display animate-bounce">
          <CheckCircle2 className="w-5.5 h-5.5 text-white" />
          <div>
            <p className="font-bold text-sm">Payment Confirmed!</p>
            <p className="text-emerald-100 text-xs text-[11px]">Watermark removed. PDF print initialized.</p>
          </div>
        </div>
      )}

      {/* ==========================================
         LANDING VIEW SCREEN
         ========================================== */}
      {view === "landing" && (
        <div id="landing-root-view" className="flex flex-col flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Subtle background nodes */}
          <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/5 z-20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-display font-extrabold text-lg md:text-xl tracking-tight text-white">
                AlphaCV <span className="text-indigo-500 text-xs md:text-sm bg-indigo-500/10 px-2 py-0.5 rounded ml-1 font-semibold">AI SaaS</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs md:text-sm text-slate-400 hover:text-white px-3 py-1.5 transition font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs md:text-sm font-bold tracking-wide text-white transition flex items-center gap-2 shadow-indigo-600/20 shadow-md transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Hero Content */}
          <main className="max-w-7xl mx-auto w-full px-6 py-16 md:py-24 text-center z-10 flex-grow flex flex-col justify-center">
            
            {/* Visual SaaS Pill badge */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-6 mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ATS-Optimized Resume Rewriting Platform
            </div>

            <h1 className="text-4xl md:text-6.5xl font-display font-black text-white tracking-tight leading-none max-w-4xl mx-auto mb-6">
              Convert Rough Career Writing Into Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">ATS Resumes</span> Instantly
            </h1>
            
            <p className="text-slate-400 text-sm md:text-lg max-w-2.5xl mx-auto leading-relaxed mb-10 font-sans">
              Enter rough notes, dates, or messy emails in Kenya. AlphaCV’s AI restructures everything into high-performing bullet points, action verbs, and matching templates automatically.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm md:text-base px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xl transform hover:-translate-y-0.5"
              >
                Create My Resume Free
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              </button>
              
              <button
                onClick={handleGuestAccess}
                className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-sm md:text-base px-8 py-3.5 rounded-xl border border-white/5 transition flex items-center justify-center gap-2"
              >
                Try Developer Sandbox
              </button>
            </div>

            {/* Core Specs Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto pt-10 border-t border-white/5">
              <div className="p-6 bg-slate-950/40 rounded-xl border border-white/5 text-left">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg w-max mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-display font-extrabold text-white text-base mb-1.5">AI Professional Writer</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Translates messy unstructured outlines into verified action bullets.</p>
              </div>
              
              <div className="p-6 bg-slate-950/40 rounded-xl border border-white/5 text-left">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg w-max mb-4">
                  <LayoutGrid className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-display font-extrabold text-white text-base mb-1.5">AlphaCV Luxury Layouts</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Modern, ATS Clean, Executive, Designer, Academic, Tech, and Minimalist templates update dynamically.</p>
              </div>

              <div className="p-6 bg-slate-950/40 rounded-xl border border-white/5 text-left">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg w-max mb-4">
                  < Smartphone className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-display font-extrabold text-white text-base mb-1.5">M-Pesa payments</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">Affordable premium unlocks at 100 KES via instant Paystack.</p>
              </div>

              <div className="p-6 bg-slate-950/40 rounded-xl border border-white/5 text-left">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg w-max mb-4">
                  <Download className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-display font-extrabold text-white text-base mb-1.5">Vector PDF Output</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">High precision PDF templates ready for instant hiring portals.</p>
              </div>
            </section>
          </main>

          {/* Soft Footer */}
          <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500">
            © 2026 AlphaCV AI platform. ATS Optimized. All rights reserved.
          </footer>
        </div>
      )}

      {/* ==========================================
         DASHBOARD VIEW SCREEN
         ========================================== */}
      {view === "dashboard" && (
        <div id="dashboard-root-view" className="flex flex-col flex-1 max-w-6xl mx-auto w-full px-6 py-8">
          
          {/* Header Dashboard panel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 bg-slate-950/50 p-6 rounded-xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg font-black text-white text-lg font-display">
                {user?.displayName ? user.displayName.charAt(0) : "G"}
              </div>
              <div>
                <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                  Welcome to AlphaCV, {user?.displayName || "Guest Professional"}
                  {isGuest && <span className="text-[10px] bg-slate-800 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold">Simulator Client</span>}
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Logged in as: <span className="text-slate-200">{user?.email || "sandbox_local_guest"}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCreateResume}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer shadow-indigo-600/15 shadow"
              >
                <Plus className="w-4 h-4" /> Create New CV
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs md:text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          {/* CVs Grid */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <h3 className="font-display font-extrabold text-base md:text-lg text-white flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-500" />
                Your Saved Resumes ({resumes.length})
              </h3>
            </div>

            {resumesLoading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-slate-950/10 rounded-2xl border border-dashed border-white/5">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-400 font-display">Syncing layout indices from cloud database...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 md:p-24 bg-slate-950/20 rounded-2xl border border-dashed border-white/5 text-center">
                <div className="w-16 h-16 bg-slate-800/80 rounded-xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-display font-extrabold text-white text-lg mb-2">No resumes found</h4>
                <p className="text-slate-400 max-w-sm text-xs md:text-sm leading-relaxed mb-6 font-sans">
                  You haven't added any professional CV structures yet. Build your premium resume from rough career outlines inside seconds!
                </p>
                <button
                  onClick={handleCreateResume}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg text-white font-extrabold text-xs md:text-sm tracking-wide transition shadow shadow-indigo-600/20"
                >
                  Create My First CV
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    id={`resume-card-${resume.id}`}
                    className="relative overflow-hidden bg-slate-950/40 p-5 rounded-xl border border-white/5 hover:border-slate-800 flex flex-col justify-between transition group hover:-translate-y-0.5"
                  >
                    {resumeIdToDelete === resume.id && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm p-5 flex flex-col justify-between z-10 animate-fade-in border border-red-500/20">
                        <div className="flex flex-col gap-2">
                          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <h4 className="font-display font-black text-white text-sm uppercase tracking-wider mt-2">
                            Delete this Resume?
                          </h4>
                          <p className="text-slate-400 text-xs leading-relaxed font-sans">
                            This action is permanent. It will delete "<strong className="text-white">{resume.title}</strong>" from your saved drafts.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setResumeIdToDelete(null)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setResumeIdToDelete(null);
                              await handleDeleteResume(resume.id);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded transition cursor-pointer shadow-lg shadow-red-600/20"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      {/* Badge detail */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          {resume.selectedTemplate} theme
                        </div>
                        {resume.hasPaid && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/15">
                            Premium Unlocked
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-black text-white text-base leading-tight mb-2 uppercase group-hover:text-indigo-400 transition">
                        {resume.title}
                      </h4>
                      <p className="text-slate-400 text-xs font-sans line-clamp-1">
                        Role: <span className="text-slate-300 font-semibold">{resume.jobTitle}</span>
                      </p>
                      <p className="text-slate-500 text-[11px] font-sans mt-1">
                        Modified: {new Date(resume.updatedAt?.toString() || new Date()).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions button block */}
                    <div className="flex gap-1.5 border-t border-white/5 pt-4 mt-6">
                      <button
                        onClick={() => {
                          setActiveResume(resume);
                          setView("builder");
                        }}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-400" /> Open Draft
                      </button>

                      <button
                        onClick={() => handleDuplicateResume(resume)}
                        title="Duplicate CV"
                        className="bg-slate-800/60 hover:bg-slate-700 text-slate-300 p-2 rounded transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setResumeIdToDelete(resume.id)}
                        title="Delete CV"
                        className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 p-2 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
         LIVE BUILDER CANVAS / SPLIT WRITER
         ========================================== */}
      {view === "builder" && activeResume && (
        <div id="main-layout-root" className="flex flex-col flex-1 print:p-0 print:m-0 print:bg-white">
                  {/* Action Header Nav */}
          <nav id="builder-navigation-header" className="bg-slate-950/60 p-3 md:p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 z-20 sticky top-0 backdrop-blur-md">
            <div className="flex items-center justify-between md:justify-start gap-4">
              <button
                onClick={() => setView("dashboard")}
                className="text-slate-400 hover:text-indigo-400 font-display font-medium text-xs md:text-sm flex items-center gap-1 shrink-0"
              >
                ← <span className="hidden sm:inline">Back to Dashboard</span><span className="inline sm:hidden">Exit</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-800"></div>
              <input
                type="text"
                value={activeResume.title}
                onChange={(e) => syncResumeData({ ...activeResume, title: e.target.value })}
                className="bg-transparent hover:bg-slate-900 border border-transparent rounded px-2.5 py-1 text-xs md:text-sm font-bold text-white uppercase focus:outline-none focus:bg-slate-950 focus:border-indigo-500 w-full max-w-[120px] sm:max-w-[180px] md:w-56 text-ellipsis"
              />
            </div>

            {/* Template Selector Dropdown & Action Controls (30 Unique Theme Configurations) */}
            <div className="flex items-center gap-2 select-none overflow-x-auto no-scrollbar md:overflow-visible">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">Active Theme: </span>
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={activeResume.selectedTemplate}
                  onChange={(e) => updateActiveTemplate(e.target.value as any)}
                  className="w-full bg-slate-900 text-white border border-slate-800 rounded-lg px-2.5 py-2 text-[11px] md:text-xs font-bold leading-none cursor-pointer hover:bg-slate-800 hover:border-indigo-500 focus:outline-none focus:border-indigo-500 font-sans uppercase tracking-wider shadow-lg max-w-[140px] sm:max-w-[180px] md:max-w-[300px] text-ellipsis"
                >
                  <optgroup label="Standard Templates" className="bg-slate-950 text-slate-400 font-sans uppercase tracking-wider text-[10px]">
                    <option value="modern" className="bg-slate-950 text-white">Modern Professional (Dual)</option>
                    <option value="ats_clean" className="bg-slate-950 text-white">ATS Standard Clean (Single)</option>
                    <option value="executive" className="bg-slate-950 text-white">Executive Premium Serif (Single)</option>
                    <option value="creative" className="bg-slate-950 text-white">Creative Designer (Dual)</option>
                    <option value="corporate" className="bg-slate-950 text-white">Corporate One-Column (Single)</option>
                    <option value="academic" className="bg-slate-950 text-white">Academic CV / Litera (Single)</option>
                    <option value="tech_developer" className="bg-slate-950 text-white">Tech Dense Developer (Single)</option>
                    <option value="minimalist_flow" className="bg-slate-950 text-white">Minimalist Flow (Single)</option>
                    <option value="bold_accent" className="bg-slate-950 text-white">Bold Left Accent (Dual)</option>
                  </optgroup>
                  <optgroup label="Creative & Executive Portfolio Themes" className="bg-slate-950 text-slate-400 font-sans uppercase tracking-wider text-[10px]">
                    <option value="vintage_journal" className="bg-slate-950 text-white">Vintage Editorial Serif (Single)</option>
                    <option value="emerald_forest" className="bg-slate-950 text-white">Emerald Forest Accent (Dual)</option>
                    <option value="midnight_obsidian" className="bg-slate-950 text-white">Midnight Obsidian Contrast (Single)</option>
                    <option value="aurora_nordic" className="bg-slate-950 text-white">Aurora Nordic Teal (Dual)</option>
                    <option value="royal_heritage" className="bg-slate-950 text-white">Royal Heritage Burgundy (Single)</option>
                    <option value="sleek_mono" className="bg-slate-950 text-white">Sleek JetBrains Mono (Single)</option>
                    <option value="warm_terracotta" className="bg-slate-950 text-white">Warm Terracotta Clay (Dual)</option>
                    <option value="cyber_teal" className="bg-slate-950 text-white">Cyber Neo-Teal Grid (Dual)</option>
                    <option value="golden_ratio" className="bg-slate-950 text-white">Golden Ratio Aesthetic (Dual)</option>
                    <option value="cool_ocean" className="bg-slate-950 text-white">Ocean Breeze Modern (Single)</option>
                    <option value="slate_compact" className="bg-slate-950 text-white">ATS High Density Slate (Single)</option>
                    <option value="swiss_brutalist" className="bg-slate-950 text-white">Swiss Brutalist Block (Single)</option>
                    <option value="editorial_chic" className="bg-slate-950 text-white">Luxury Editorial Chic (Single)</option>
                    <option value="vanguard_impact" className="bg-slate-950 text-white">Vanguard Heavy Left (Dual)</option>
                    <option value="charcoal_bold" className="bg-slate-950 text-white">Charcoal Carbon Block (Single)</option>
                    <option value="metro_transit" className="bg-slate-950 text-white">Metro Swiss Rail (Dual)</option>
                    <option value="clean_canvas" className="bg-slate-950 text-white">Pure Air Space Canvas (Single)</option>
                    <option value="sapphire_elite" className="bg-slate-950 text-white">Sophisticated Sapphire (Single)</option>
                    <option value="rose_gold" className="bg-slate-950 text-white">Elegant Rose Gold Serif (Dual)</option>
                    <option value="eco_growth" className="bg-slate-950 text-white">Organic Eco Sage (Single)</option>
                    <option value="apex_leader" className="bg-slate-950 text-white">Executive Apex Leader (Single)</option>
                  </optgroup>
                </select>
              </div>

              {/* Font Size Selector Option */}
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={activeResume.fontSize || "medium"}
                  onChange={(e) => syncResumeData({ ...activeResume, fontSize: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg px-2 py-2 text-[11px] md:text-xs font-bold leading-none cursor-pointer focus:outline-none focus:border-indigo-500 text-white font-sans uppercase tracking-wider shadow-lg max-w-[90px] sm:max-w-[120px]"
                  title="Choose Font Size"
                >
                  <option value="small" className="bg-slate-950 text-white">🔠 Small</option>
                  <option value="medium" className="bg-slate-950 text-white">🔠 Medium</option>
                  <option value="large" className="bg-slate-950 text-white">🔠 Large</option>
                  <option value="xlarge" className="bg-slate-950 text-white">🔠 XL</option>
                </select>
              </div>

              {/* PDF Print Download Button */}
              <button
                onClick={() => setShowDownloadConfirmation(true)}
                className="bg-emerald-600 hover:bg-emerald-500 font-extrabold text-[11px] md:text-xs px-3 py-2 rounded-lg text-white transition flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export PDF</span><span className="inline sm:hidden">PDF</span>
              </button>
            </div>
          </nav>

          {/* Interactive Mobile Tabs Toggle Switches */}
          <div className="lg:hidden flex bg-slate-950 border-b border-white/5 sticky top-[57px] md:top-[68px] z-20 p-2 gap-2">
            <button
              onClick={() => setMobileTab("edit")}
              className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                mobileTab === "edit"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              Edit Resume Form
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 py-1.5 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                mobileTab === "preview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Preview CV
            </button>
          </div>

          {/* Dual Column workspace layout split-screen */}
          <div className="flex-1 flex flex-col lg:flex-row relative">
            
            {/* Left Column forms */}
            <aside 
              id="editor-sidebar-panel" 
              className={`w-full lg:w-[45%] bg-slate-950/20 border-r border-white/5 p-4 md:p-8 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-76px)] flex flex-col gap-6 md:gap-8 pb-16 ${
                mobileTab === "edit" ? "flex" : "hidden lg:flex"
              }`}
            >
              
              {/* ATS SCORECARD & HUMANIZATION COGNITION PANEL */}
              <div id="ats-audit-intelligence" className="bg-slate-950/60 rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xs tracking-wider text-white uppercase leading-tight">ATS & Humanization Audit</h3>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">Real-time scanner metrics to guarantee interview calls.</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    90%+ Pass Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* ATS Meter */}
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ATS Pass Rate</span>
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-slate-800" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" className={`${
                          auditResult.atsScore >= 90 ? "text-emerald-500" : auditResult.atsScore >= 70 ? "text-amber-400" : "text-red-500"
                        } transition-all duration-1000`} strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * auditResult.atsScore) / 100} />
                      </svg>
                      <span className="absolute text-sm font-black text-white font-mono">{auditResult.atsScore}%</span>
                    </div>
                    <span className={`text-[9.5px] font-extrabold uppercase tracking-wide mt-2 px-1.5 py-0.5 rounded ${
                      auditResult.atsScore >= 90 ? "bg-emerald-500/10 text-emerald-400" : auditResult.atsScore >= 70 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {auditResult.atsScore >= 90 ? "Excellent Profile" : auditResult.atsScore >= 70 ? "Fair - Needs Metrics" : "Needs Optimization"}
                    </span>
                  </div>

                  {/* Humanization Index */}
                  <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Humanized Index</span>
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-slate-800" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" className={`${
                          auditResult.humanScore >= 90 ? "text-emerald-500" : auditResult.humanScore >= 70 ? "text-amber-500" : "text-red-500"
                        } transition-all duration-1000`} strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * auditResult.humanScore) / 100} />
                      </svg>
                      <span className="absolute text-sm font-black text-white font-mono">{auditResult.humanScore}%</span>
                    </div>
                    <span className={`text-[9.5px] font-extrabold uppercase tracking-wide mt-2 px-1.5 py-0.5 rounded ${
                      auditResult.humanScore >= 90 ? "bg-emerald-500/10 text-emerald-400" : auditResult.humanScore >= 70 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {auditResult.humanScore >= 90 ? "Thoroughly Natural" : "Traces of AI jargon"}
                    </span>
                  </div>
                </div>

                {/* Dynamically Show Live Role Alignment Progress */}
                {aligningRole && (
                  <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-3 rounded-xl text-[11px] font-semibold text-center flex flex-col items-center justify-center gap-2 animate-pulse">
                    <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[10px] tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      <span>Gemini Auto-Syncing Content...</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-4/5 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[9px] text-slate-400 animate-pulse">Adapting summary, experiences, and skills to "{activeResume.jobTitle}" in real-time...</span>
                  </div>
                )}

                {/* Optimizing and Status feedback */}
                {optSuccessMessage && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {optSuccessMessage}
                  </div>
                )}

                {/* Main Action Trigger Block */}
                <button
                  type="button"
                  disabled={optimizingCV}
                  onClick={triggerFullCVOptimization}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    optimizingCV
                      ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 cursor-wait"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
                  }`}
                >
                  {optimizingCV ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing with Gemini Core...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                      <span>✨ Auto-Optimize & Humanize (Target 90%+)</span>
                    </>
                  )}
                </button>

                {/* Optimization status message details */}
                {optimizingCV && (
                  <p className="text-[9px] text-center text-slate-400 mt-2 font-mono leading-tight">
                    ⚡ Translating passive phrasing, injecting metric outcomes, purging ChatGPT cliches & formatting for high-pass parsers...
                  </p>
                )}

                {/* Suggestions Breakdown */}
                <div className="mt-5 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1">Recommended Optimization Checks:</span>
                  <div className="max-h-52 overflow-y-auto no-scrollbar space-y-2">
                    {auditResult.feedback.map((item, i) => (
                      <div key={i} className="flex gap-2.5 p-2 bg-slate-900/30 rounded-lg border border-white/5 text-[11px] leading-relaxed">
                        <span className="shrink-0 mt-0.5">
                          {item.severity === "success" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : item.severity === "warning" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </span>
                        <div className="flex-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                            item.category === "ats" ? "text-indigo-400" : "text-pink-400"
                          } mr-1`}>
                            [{item.category === "ats" ? "ATS" : "Human"}]
                          </span>
                          <span className="text-slate-350 font-sans">{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* JOB-SPECIFIC AI CV OPTIMIZER/POLISHER PILLAR */}
              <div id="job-specific-cv-tailoring" className="bg-slate-950/60 rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xs tracking-wider text-white uppercase leading-tight">Tailor CV to Job Description</h3>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium">Let Gemini align your CV structures, summary, and experience to perfectly match requirements.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="target-job-desc-textarea" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Job Summary / Requirements:</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTargetJobDesc(
`Job Summary:
Seeking a creative, results-driven Digital Marketer to manage and optimize our client's online presence remotely. You will design and execute campaigns across multiple digital channels, analyze performance, and drive engagements, leads, and conversions.

Responsibilities:
- Implement and manage campaigns in SEO, PPC, social media (Facebook Business Manager), and email marketing.
- Monitor and analyze campaign performance and web traffic with Google Analytics.
- Conduct keyword research, on-page organic SEO, and competitive analysis.

Requirements:
- 3-5 years of proven experience as a Digital Marketer.
- Strong knowledge of SEO, Google Ads, Facebook Business Manager, and automation tools.
- Excellent copywriting skills and analytical mindset.`
                          )}
                          className="text-[9px] bg-purple-950 hover:bg-purple-900 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-800 transition cursor-pointer"
                        >
                          📋 Marketer Sample
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetJobDesc(
`Software Engineer (React & TypeScript) Summary:
We are looking for a creative Full-Stack React Engineer to architect clean interfaces and robust state systems.

Responsibilities:
- Design performance-sensitive React client architectures with beautiful animations.
- Craft reusable components, manage state machines, and support API endpoints.
- Conduct code reviews and support agile software delivery.

Requirements:
- Heavy production knowledge of modern ES6 TypeScript, React, and Tailwind CSS.
- Understanding of full-stack API systems or local database synchronies.`
                          )}
                          className="text-[9px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-800 transition cursor-pointer"
                        >
                          📋 Dev Sample
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="target-job-desc-textarea"
                      rows={4}
                      value={targetJobDesc}
                      onChange={(e) => setTargetJobDesc(e.target.value)}
                      placeholder="Paste any target job summary or requirements copy-pasted directly from LinkedIn, Indeed, etc. here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 border-t border-b border-white/5 py-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center pr-1">Fields aligned:</span>
                    <span className="text-[8px] font-extrabold uppercase bg-purple-900/40 text-purple-300 border border-purple-800/40 px-1.5 py-0.5 rounded">🎯 Job Title</span>
                    <span className="text-[8px] font-extrabold uppercase bg-indigo-900/40 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded">⚡ Summary</span>
                    <span className="text-[8px] font-extrabold uppercase bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.5 rounded">🛠️ Skills Autofill</span>
                    <span className="text-[8px] font-extrabold uppercase bg-pink-900/40 text-pink-300 border border-pink-800/40 px-1.5 py-0.5 rounded">⭐ Work Verbs</span>
                  </div>

                  {tailorSuccessMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-[11px] font-semibold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {tailorSuccessMessage}
                    </div>
                  )}

                  {tailorErrorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-[11px] font-semibold text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {tailorErrorMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={tailoringCV}
                    onClick={triggerJobSpecificCVOptimization}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                      tailoringCV
                        ? "bg-purple-600/30 text-purple-300 border border-purple-500/20 cursor-wait"
                        : "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-650/25 hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
                    }`}
                  >
                    {tailoringCV ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-200" />
                        <span>Autofilling aligned core fields with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-200" />
                        <span>✨ AI Tailor & Autofill Fields</span>
                      </>
                    )}
                  </button>

                  {tailoringCV && (
                    <p className="text-[9px] text-center text-slate-400 mt-2 font-mono leading-tight">
                      ⚡ Extracting keywords, adapting work history bullet descriptions, reconstructing skills array & rewriting professional summary in real-time...
                    </p>
                  )}
                </div>
              </div>

              {/* Pillar 1: Contact Details */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-5 pb-2 border-b border-indigo-500/10">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><BookOpen className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Personal Profiles</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={activeResume.fullName}
                      onChange={(e) => syncResumeData({ ...activeResume, fullName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      value={activeResume.email}
                      onChange={(e) => syncResumeData({ ...activeResume, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">Phone (KES Region)</label>
                    <input
                      type="text"
                      value={activeResume.phone}
                      onChange={(e) => syncResumeData({ ...activeResume, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">Location</label>
                    <input
                      type="text"
                      value={activeResume.location}
                      onChange={(e) => syncResumeData({ ...activeResume, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={activeResume.linkedin || ""}
                      onChange={(e) => syncResumeData({ ...activeResume, linkedin: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-slate-400 text-[11px] font-bold uppercase tracking-wider">Target Job Title</label>
                      <button
                        type="button"
                        disabled={polishingFields["jobTitle"]}
                        onClick={() => polishSingleField("jobTitle", activeResume.jobTitle, (val) => syncResumeData({ ...activeResume, jobTitle: val }), "professional")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition font-bold"
                      >
                        {polishingFields["jobTitle"] ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Polishing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Polish Title
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={activeResume.jobTitle}
                      onChange={(e) => syncResumeData({ ...activeResume, jobTitle: e.target.value })}
                      onBlur={() => {
                        if (activeResume.jobTitle && activeResume.jobTitle.trim() && activeResume.jobTitle !== lastAlignedTitle) {
                          alignResumeToJobTitle();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (activeResume.jobTitle && activeResume.jobTitle.trim() && activeResume.jobTitle !== lastAlignedTitle) {
                            alignResumeToJobTitle();
                          }
                        }
                      }}
                      placeholder="e.g. Project Manager, Software Engineer"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans font-bold"
                    />
                    {activeResume.jobTitle && lastAlignedTitle && activeResume.jobTitle.trim() !== lastAlignedTitle.trim() && (
                      <div className="mt-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 animate-slide-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          <p className="font-sans leading-relaxed">
                            Awaiting sync to <strong className="text-white">"{activeResume.jobTitle}"</strong>. Align experiences now?
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={aligningRole}
                          onClick={alignResumeToJobTitle}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider rounded-lg text-[9px] shrink-0 transition flex items-center gap-1 cursor-pointer"
                        >
                          {aligningRole ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={3} />
                              <span>Aligning...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-indigo-200" />
                              <span>Auto-Align CV</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Professional Summary Edit form */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-4 border-b border-indigo-500/10 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><FileText className="w-4 h-4" /></div>
                    <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase font-sans">Professional Summary</h3>
                  </div>
                  <button
                    type="button"
                    disabled={polishingFields["summary"]}
                    onClick={() => polishSingleField("summary", activeResume.summary || "", (val) => syncResumeData({ ...activeResume, summary: val }), "improve")}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition font-bold"
                  >
                    {polishingFields["summary"] ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Polishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Polish Summary
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                    Provide a short paragraph (3–5 lines) that explains who you are professionally, your key skills, and your career goals.
                  </p>
                  <textarea
                    value={activeResume.summary || ""}
                    onChange={(e) => syncResumeData({ ...activeResume, summary: e.target.value })}
                    placeholder="Example: Motivated software developer with experience in React and Node.js..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3.5 py-2.5 text-white bg-slate-900 border-slate-800 focus:outline-none focus:border-indigo-500 text-xs font-sans leading-relaxed"
                  />
                </div>
              </section>

              {/* Pillar 2: The Core Concept: Messy text input converter using Gemini AI */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 pb-1">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Sparkles className="w-4 h-4 animate-bounce" /></div>
                    <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">AI Magic Drafting Prompt</h3>
                  </div>
                  
                  {generatingAI && (
                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded">
                      Processing AI...
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs text-[11px] leading-relaxed font-sans mb-3.5">
                  Paste raw, unstructured bullet points, experience logs, or draft notes. Our Gemini AI engine instantly parses formatting and restructures elements into ATS proof bullet points!
                </p>

                <textarea
                  value={activeResume.workExperienceText}
                  onChange={(e) => syncResumeData({ ...activeResume, workExperienceText: e.target.value })}
                  placeholder="Example: worked as lead engineer at cloud systems in nairobi from 2021 to 2024. optimized backend query pipelines, built dashboards, did mentoring of devs and got featured..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans tracking-wide leading-relaxed mb-4"
                ></textarea>

                <button
                  type="button"
                  disabled={generatingAI}
                  onClick={triggerAIRewrite}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-black text-xs md:text-sm py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-indigo-600/15 shadow-md transform active:scale-[0.98]"
                >
                  {generatingAI ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 text-white animate-spin" />
                      Optimizing ATS CV Bullet Points...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                      Generate CV structure with AI ✨
                    </>
                  )}
                </button>
              </section>

              {/* Pillar 3: Active Structured Elements & Bullet Enhancers */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Briefcase className="w-4 h-4" /></div>
                    <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Experience timeline ({activeResume.workExperience.length})</h3>
                  </div>
                </div>

                {activeResume.workExperience.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No experiences added. Use the AI Magic drafting prompt to write professional lines instantly.</p>
                ) : (
                  <div className="space-y-4">
                    {activeResume.workExperience.map((exp, jobIdx) => (
                      <div key={jobIdx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <span className="text-xs font-black text-white block uppercase tracking-wide">{exp.role}</span>
                            <span className="text-[11px] text-slate-400 block">{exp.company} • {exp.duration}</span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => duplicateExpElement(jobIdx)}
                              title="Duplicate job element"
                              className="text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 p-1.5 rounded transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExpElement(jobIdx)}
                              className="text-[11px] bg-red-950/20 hover:bg-red-900 text-red-400 p-1.5 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bullets & Enhancer Toolbars */}
                        <div className="space-y-2.5">
                          {exp.description.map((bullet, bulletIdx) => {
                            const isCurrentlySelected = selectedBulletIndex?.expIdx === jobIdx && selectedBulletIndex?.bulletIdx === bulletIdx;
                            return (
                              <div key={bulletIdx} className="relative group">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const updatedList = [...activeResume.workExperience];
                                    updatedList[jobIdx].description[bulletIdx] = e.target.value;
                                    syncResumeData({ ...activeResume, workExperience: updatedList });
                                  }}
                                  onFocus={() => setSelectedBulletIndex({ expIdx: jobIdx, bulletIdx })}
                                  rows={2}
                                  className={`w-full bg-slate-950/80 border text-[11px] md:text-xs rounded p-2.5 font-sans leading-relaxed text-slate-200 transition focus:outline-none focus:border-indigo-500 ${
                                    isCurrentlySelected ? "border-indigo-500 ring-1 ring-indigo-500/20" : "border-slate-800"
                                  }`}
                                />
                                
                                {/* Micro AI Enhancers action drawer */}
                                {isCurrentlySelected && (
                                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-2 items-center justify-between z-10 relative">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* Main Re-write using AI button */}
                                      <button
                                        type="button"
                                        disabled={enhancingBullet !== null}
                                        onClick={() => enhanceSelectedBullet(rewriteOption)}
                                        className="text-[10px] md:text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                                      >
                                        {enhancingBullet ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                        ) : (
                                          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                                        )}
                                        <span>Re-write using AI</span>
                                      </button>

                                      {/* Options Dropdown */}
                                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg px-2.5 py-1 transition">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase select-none">Style:</span>
                                        <select
                                          value={rewriteOption}
                                          onChange={(e) => setRewriteOption(e.target.value)}
                                          className="bg-transparent text-white text-[10px] md:text-xs font-bold focus:outline-none cursor-pointer uppercase tracking-wider pr-1"
                                          disabled={enhancingBullet !== null}
                                        >
                                          <option value="improve" className="bg-slate-950 text-white">Improve</option>
                                          <option value="ats" className="bg-slate-950 text-white">ATS Phrasing</option>
                                          <option value="professional" className="bg-slate-950 text-white">Professional</option>
                                          <option value="shorten" className="bg-slate-950 text-white">Shorten</option>
                                          <option value="expand" className="bg-slate-950 text-white">Expand</option>
                                          <option value="humanize" className="bg-slate-950 text-white">Humanize</option>
                                        </select>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedBulletIndex(null)}
                                      className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-900/50 hover:bg-slate-900 rounded-lg transition"
                                    >
                                      Close
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Micro Job Appender Form */}
                <div className="mt-5 pt-5 border-t border-slate-800 bg-slate-900/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white uppercase">Add Custom Experience Manually</span>
                    {(newExp.role || newExp.bullet) && (
                      <button
                        type="button"
                        disabled={polishingFields["newExpRole"] || polishingFields["newExpBullet"]}
                        onClick={async () => {
                          if (newExp.role) {
                            await polishSingleField("newExpRole", newExp.role, (val) => setNewExp(prev => ({ ...prev, role: val })), "professional");
                          }
                          if (newExp.bullet) {
                            await polishSingleField("newExpBullet", newExp.bullet, (val) => setNewExp(prev => ({ ...prev, bullet: val })), "improve");
                          }
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-350 flex items-center gap-1 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition"
                      >
                        {polishingFields["newExpRole"] || polishingFields["newExpBullet"] ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Polishing Draft...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-indigo-300" />
                            <span>AI Polish Inputs</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. Systems Engineer)"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2021 - 2024)"
                    value={newExp.duration}
                    onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full mb-2"
                  />
                  <div className="relative">
                    <textarea
                      placeholder="Add professional action bullet point"
                      value={newExp.bullet}
                      onChange={(e) => setNewExp({ ...newExp, bullet: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full h-12 mb-2 font-sans pr-10"
                    />
                    {newExp.bullet && (
                      <button
                        type="button"
                        disabled={polishingFields["newExpBulletDetail"]}
                        onClick={() => polishSingleField("newExpBulletDetail", newExp.bullet, (val) => setNewExp(prev => ({ ...prev, bullet: val })), "ats")}
                        title="Rewrite with strong ATS keywords"
                        className="absolute right-2.5 top-2 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer"
                      >
                        {polishingFields["newExpBulletDetail"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={addManualJob}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2 rounded transition cursor-pointer"
                  >
                    Save Experience
                  </button>
                </div>
              </section>

              {/* Pillar 3.5: Projects Manual Modules */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Layers className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Projects & Portfolio ({activeResume.projects?.length || 0})</h3>
                </div>

                {activeResume.projects && activeResume.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 flex justify-between items-start gap-4 mb-3 text-xs">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white block">{proj.name}</span>
                        {proj.link && <span className="text-indigo-400 text-[10px] lowercase font-mono">{proj.link}</span>}
                      </div>
                      {proj.technologies && <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mt-0.5">{proj.technologies}</p>}
                      {proj.description && <p className="text-slate-400 text-[11px] mt-1 italic">{proj.description}</p>}
                    </div>
                    <button
                      onClick={() => removeProjectElement(idx)}
                      className="text-red-400 hover:text-red-300 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Projects Form */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase">Project Details</span>
                    {(newProject.name || newProject.description) && (
                      <button
                        type="button"
                        disabled={polishingFields["newProjectName"] || polishingFields["newProjectDesc"]}
                        onClick={async () => {
                          if (newProject.name) {
                            await polishSingleField("newProjectName", newProject.name, (val) => setNewProject(prev => ({ ...prev, name: val })), "professional");
                          }
                          if (newProject.description) {
                            await polishSingleField("newProjectDesc", newProject.description, (val) => setNewProject(prev => ({ ...prev, description: val })), "improve");
                          }
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-350 flex items-center gap-1 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition"
                      >
                        {polishingFields["newProjectName"] || polishingFields["newProjectDesc"] ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            <span>Polishing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Polish Inputs</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Project URL / Link"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Technologies Used (e.g. React, Python, AWS)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full mb-2"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Brief Project Description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full mb-2 pr-10"
                    />
                    {newProject.description && (
                      <button
                        type="button"
                        disabled={polishingFields["newProjectDescDirect"]}
                        onClick={() => polishSingleField("newProjectDescDirect", newProject.description, (val) => setNewProject(prev => ({ ...prev, description: val })), "improve")}
                        title="Rewrite with AI"
                        className="absolute right-2.5 top-1 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer"
                      >
                        {polishingFields["newProjectDescDirect"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={addManualProject}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2 rounded transition cursor-pointer"
                  >
                    Save Portfolio Project
                  </button>
                </div>
              </section>

              {/* Pillar 4: Skills Manual list */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Award className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Professional Proficiencies</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeResume.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300 font-sans"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkillElement(idx)}
                        className="text-[10px] text-slate-500 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    placeholder="Add Skill Keyword (e.g. Docker, Rust)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualSkill()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white pr-10"
                  />
                  {newSkill && (
                    <button
                      type="button"
                      disabled={polishingFields["newSkill"]}
                      onClick={() => polishSingleField("newSkill", newSkill, (val) => setNewSkill(val), "professional")}
                      title="AI Polish Skill Keyword"
                      className="absolute right-16 top-1.5 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer z-10"
                    >
                      {polishingFields["newSkill"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={addManualSkill}
                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded text-white text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* Pillar 4.2: Certifications Manual list */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Award className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Certifications ({activeResume.certifications?.length || 0})</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeResume.certifications && activeResume.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300 font-sans"
                    >
                      {cert}
                      <button
                        onClick={() => removeCertElement(idx)}
                        className="text-[10px] text-slate-500 hover:text-white font-sans"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    placeholder="Add Certification (e.g. AWS Solutions Architect)"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualCert()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 pr-10"
                  />
                  {newCert && (
                    <button
                      type="button"
                      disabled={polishingFields["newCert"]}
                      onClick={() => polishSingleField("newCert", newCert, (val) => setNewCert(val), "professional")}
                      title="AI Polish Certification"
                      className="absolute right-16 top-1.5 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer z-10"
                    >
                      {polishingFields["newCert"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={addManualCert}
                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded text-white text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* Pillar 4.3: Achievements Manual list */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><Sparkles className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Achievements & Awards ({activeResume.achievements?.length || 0})</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeResume.achievements && activeResume.achievements.map((ach, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300 font-sans"
                    >
                      {ach}
                      <button
                        onClick={() => removeAchElement(idx)}
                        className="text-[10px] text-slate-500 hover:text-white font-sans"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    placeholder="Add Achievement (e.g. Hackathon Winner)"
                    value={newAch}
                    onChange={(e) => setNewAch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualAch()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 pr-10"
                  />
                  {newAch && (
                    <button
                      type="button"
                      disabled={polishingFields["newAch"]}
                      onClick={() => polishSingleField("newAch", newAch, (val) => setNewAch(val), "improve")}
                      title="AI Polish Achievement"
                      className="absolute right-16 top-1.5 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer z-10"
                    >
                      {polishingFields["newAch"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={addManualAch}
                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded text-white text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* Pillar 5: Education Manual modules */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><GraduationCap className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Credentials & Academics</h3>
                </div>

                {activeResume.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 flex justify-between items-start gap-4 mb-3 text-xs">
                    <div>
                      <span className="font-bold text-white block">{edu.degree}</span>
                      <span className="text-slate-400 text-[11px] font-sans">{edu.school} • {edu.duration}</span>
                    </div>
                    <button
                      onClick={() => removeEducationElement(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Academic Form */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Degree/Qualification"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="School/College"
                      value={newEdu.school}
                      onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2018 - 2022)"
                    value={newEdu.duration}
                    onChange={(e) => setNewEdu({ ...newEdu, duration: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full mb-2"
                  />
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Core details (e.g., GPA 3.8 / First Class)"
                      value={newEdu.description}
                      onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white w-full mb-2 pr-10"
                    />
                    {newEdu.description && (
                      <button
                        type="button"
                        disabled={polishingFields["newEduDesc"]}
                        onClick={() => polishSingleField("newEduDesc", newEdu.description, (val) => setNewEdu(prev => ({ ...prev, description: val })), "improve")}
                        title="AI Polish Academic description"
                        className="absolute right-2.5 top-1 bg-slate-800 hover:bg-slate-700 p-1 rounded text-indigo-400 hover:text-white transition cursor-pointer"
                      >
                        {polishingFields["newEduDesc"] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={addManualEdu}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white py-2 rounded transition cursor-pointer"
                  >
                    Save Academic Credentials
                  </button>
                </div>
              </section>

              {/* Pillar 5.2: Languages Manual list */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><BookOpen className="w-4 h-4" /></div>
                  <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase">Languages ({activeResume.languages?.length || 0})</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeResume.languages && activeResume.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300 font-sans"
                    >
                      {lang}
                      <button
                        onClick={() => removeLangElement(idx)}
                        className="text-[10px] text-slate-500 hover:text-white font-sans"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Language (e.g. English - Native)"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addManualLang()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    onClick={addManualLang}
                    className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </section>

              {/* Pillar 5.3: References edit field */}
              <section className="bg-slate-950/40 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><FileText className="w-4 h-4" /></div>
                    <h3 className="font-display font-extrabold text-sm tracking-widest text-white uppercase font-sans">References</h3>
                  </div>
                  {activeResume.references && (
                    <button
                      type="button"
                      disabled={polishingFields["references"]}
                      onClick={() => polishSingleField("references", activeResume.references || "", (val) => syncResumeData({ ...activeResume, references: val }), "improve")}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition font-bold"
                    >
                      {polishingFields["references"] ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Polish References
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <textarea
                    value={activeResume.references || ""}
                    onChange={(e) => syncResumeData({ ...activeResume, references: e.target.value })}
                    placeholder="Specify professional references, or type 'Available upon request'."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-sans leading-relaxed"
                  />
                </div>
              </section>

            </aside>

            {/* Right Column: Live High-fidelity Document preview canvas with watermark info */}
            <main className={`flex-1 bg-slate-950 p-4 md:p-10 flex flex-col items-center justify-start overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-76px)] gap-6 ${
              mobileTab === "preview" ? "flex" : "hidden lg:flex"
            }`}>
              <style dangerouslySetInnerHTML={{ __html: `
                @media screen and (max-width: 420px) {
                  #print-resume-area-container {
                    zoom: 0.42;
                  }
                }
                @media screen and (min-width: 421px) and (max-width: 540px) {
                  #print-resume-area-container {
                    zoom: 0.52;
                  }
                }
                @media screen and (min-width: 541px) and (max-width: 768px) {
                  #print-resume-area-container {
                    zoom: 0.68;
                  }
                }
                @media screen and (min-width: 769px) and (max-width: 1023px) {
                  #print-resume-area-container {
                    zoom: 0.85;
                  }
                }
              `}} />
              <div id="print-resume-area-container" className="w-full max-w-[800px] scale-100 origin-top h-auto shadow-2xl">
                <ResumePreview data={activeResume} />
              </div>

              {/* Elegant dynamic info banner informing that the watermark will automatically disappear on printing or saving to PDF */}
              <div className="w-full max-w-[800px] bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3 text-slate-300 shadow-xl print:hidden animation-fadeIn">
                <div className="bg-indigo-600/10 p-2.5 rounded-lg text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-xs md:text-sm text-indigo-300 uppercase tracking-widest leading-normal">✨ Professional Clean Export</p>
                  <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed mt-1">
                    The draft watermark is only shown for the interactive builder preview to secure user workflows. The downloaded PDF / printed physical copy will be 150% ultra-sharp, professional, and fully <strong className="text-emerald-400 font-extrabold uppercase">watermark-free</strong>!
                  </p>
                </div>
              </div>
            </main>

          </div>
        </div>
      )}

      {/* ==========================================
         PAYWALL INTEGRATION MODAL OVERLAY
         ========================================== */}
      {showPaywall && activeResume && (
        <div id="custom-paywall-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-zoomIn">
            
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-indigo-600 to-indigo-700"></div>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 text-indigo-400">
                <Lock className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="font-display font-black text-xl md:text-2xl text-white">Unlock Premium Copy</h3>
              <p className="text-slate-400 text-xs md:text-sm font-sans mt-1">Ready to download? Pay KES 100 once for life.</p>
            </div>

            {/* Feature lists included */}
            <div className="space-y-4 mb-8 bg-slate-950/40 p-4.5 rounded-xl border border-white/5 text-xs md:text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Remove diagonal Preview Watermark</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">High Resolution Vector PDF layout</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Unlock all 30 Premium Templates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Lifetime updates & storage</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-center justify-between text-sm md:text-base font-display font-black border-y border-white/5 py-4 mb-8">
              <span className="text-slate-400">Amount Due:</span>
              <span className="text-white text-xl md:text-2xl text-indigo-400">KES 100</span>
            </div>

            {/* Paystack actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPaywall(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-lg transition"
              >
                Tweak CV More
              </button>
              
              <button
                type="button"
                disabled={paystackLoading}
                onClick={initializeUnlockPayment}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs md:text-sm py-3 rounded-lg text-center shadow shadow-indigo-600/2 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {paystackLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Unlock with Paystack
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         PAYSTACK INTEGRATED SANDBOX SIMULATOR
         ========================================== */}
      {showSimulator && (
        <div id="sandbox-checkout-panel" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-zoomIn font-sans">
            
            {/* Header simulated info */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Paystack KES sandbox wrapper</span>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="text-slate-500 hover:text-white text-xs"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-amber-500/20 flex gap-3 text-xs md:text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-extrabold text-amber-400 leading-tight">Mock Simulation Activated</p>
                <p className="text-slate-400 mt-1">The Paystack API Key was left unconfigured. We launched our local simulator so you can verify payment hooks easily!</p>
              </div>
            </div>

            {/* M-Pesa Simulated fields */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">M-Pesa Mobile Number</label>
                <div className="flex gap-2">
                  <span className="bg-slate-800 border border-slate-700 px-3 py-2 text-xs rounded text-slate-300 md:text-sm leading-8 flex items-center">+254</span>
                  <input
                    type="tel"
                    placeholder="712345678"
                    value={simulatorMpesaPhone}
                    onChange={(e) => setSimulatorMpesaPhone(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs md:text-sm"
                  />
                </div>
              </div>

              {/* Mock credit card detail block */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Simulated Card Details</p>
                <div className="text-xs text-slate-400 font-mono space-y-1">
                  <p>Number: <span className="text-slate-200 font-bold">4000 1234 5678 9010</span></p>
                  <p>Expiry: <span className="text-slate-200">12 / 28</span> | CVV: <span className="text-slate-200">123</span></p>
                </div>
              </div>
            </div>

            {/* Sandbox triggers */}
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={simulatigResponse}
                onClick={verifySimulatedPayment}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs md:text-sm py-3.5 rounded-lg text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {simulatigResponse ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Smartphone className="w-4.5 h-4.5" />
                    Simulate Payment Approved
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          SANDBOX SECURE AUTHENTICATION FLOWS MODAL
         ========================================== */}
      {showAuthModal && (
        <div id="secure-auth-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-zoomIn font-sans">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-widest leading-none mt-0.5">Access Account</span>
              </div>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError("");
                }}
                className="text-slate-500 hover:text-white transition text-xs font-semibold px-2 py-1 rounded hover:bg-slate-850"
              >
                ✕ Close
              </button>
            </div>

            {authError && (
              <div className="mb-5 bg-red-950/30 border border-red-500/20 p-3 rounded-lg text-[11px] text-red-300 flex items-start gap-2 leading-normal">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign In inside modal first */}
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-lg border border-indigo-500 tracking-wide flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Continue with Google
              </button>
              <p className="text-[10px] text-slate-500 font-medium leading-normal text-center">
                Note: Standard popups may fail in sandboxes. If Google Sign-In fails, please use Instant Demo below!
              </p>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-x-0 h-[1px] bg-white/5"></div>
              <span className="relative bg-slate-900 px-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">ALTERNATIVE DEMO/OFFLINE ACCESS</span>
            </div>

            {/* Non-popup / Alternative access methods */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAnonymousLogin}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <UserCheck className="w-4 h-4 text-white" />
                Instant Secure Demo Access ✨
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setShowAuthModal(false);
                  setIsGuest(true);
                  setView("dashboard");
                }}
                className="w-full text-slate-500 hover:text-slate-400 text-[10px] font-bold py-1 tracking-wide text-center uppercase"
              >
                Or Continue as standard Offline Guest
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* PDF Download and Print Confirmation Modal */}
      {showDownloadConfirmation && activeResume && (
        <div id="download-confirmation-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {!activeResume.hasPaid ? (
              <>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 text-indigo-400">
                    <Lock className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <h3 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-wider">Unlock & Download</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-sans mt-2 text-center">
                    This resume draft requires a one-time payment of <strong className="text-indigo-400">KES 100</strong> to download watermark-free.
                  </p>
                </div>

                <div className="space-y-3 mb-6 bg-slate-950/30 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Specifically building document: <span className="text-white font-extrabold">"{activeResume.title}"</span>.
                  </p>
                  <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Remove diagonal "Preview" watermark</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>High-resolution vector PDF export</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Unlock all 30 Premium ATS Templates</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDownloadConfirmation(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-lg transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={paystackLoading}
                    onClick={async () => {
                      setShowDownloadConfirmation(false);
                      await initializeUnlockPayment();
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    {paystackLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay KES 100
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 text-emerald-400">
                    <Download className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-wider">Confirm Download</h3>
                  <p className="text-slate-400 text-xs md:text-sm font-sans mt-2 text-center">
                    Are you sure you want to download/print this resume?
                  </p>
                </div>

                <div className="space-y-3 mb-6 bg-slate-950/30 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                  <p className="leading-relaxed font-sans">
                    Specifically building document: <span className="text-white font-extrabold font-serif">"{activeResume.title}"</span>.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    This triggers the browser print engine with high-fidelity system rules. You can select "Save as PDF" as your destination.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDownloadConfirmation(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 rounded-lg transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDownloadConfirmation(false);
                      triggerPDFDownloadAndPrint();
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg transition cursor-pointer shadow-lg shadow-emerald-600/20 text-center font-display"
                  >
                    Yes, Proceed
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
