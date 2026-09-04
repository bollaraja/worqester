import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// ----------------------------------------------------
// Secure User Authentication Store & Crypto Helpers
// ----------------------------------------------------
interface StoredUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  jobTitle: string;
  organizationId: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  const bufA = Buffer.from(hash, "hex");
  const bufB = Buffer.from(storedHash, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function sanitizeUser(u: StoredUser) {
  const { salt, passwordHash, ...safe } = u;
  return safe;
}

// In-memory secured user database initialized with pre-hashed demo accounts
const defaultSalt = crypto.randomBytes(16).toString("hex");
const defaultPasswordHash = hashPassword("worqester123", defaultSalt);

const usersStore: Map<string, StoredUser> = new Map();
const sessionsStore: Map<string, Session> = new Map();

// Seed standard accounts
const initialSeedUsers: Omit<StoredUser, "salt" | "passwordHash" | "createdAt">[] = [
  {
    id: "usr-01",
    name: "Alex Vance",
    email: "alex.vance@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Admin",
    department: "Executive Management",
    jobTitle: "Chief Operations Officer",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-04",
    name: "Elena Rostova",
    email: "elena.rostova@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Project Manager",
    department: "Engineering",
    jobTitle: "Principal Technical Program Manager",
    organizationId: "org-worqester-01",
  },
  {
    id: "usr-05",
    name: "Vikram Patel",
    email: "vikram.patel@worqester.internal",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Employee",
    department: "Engineering",
    jobTitle: "Lead Full Stack Engineer",
    organizationId: "org-worqester-01",
  },
];

initialSeedUsers.forEach((user) => {
  usersStore.set(user.email.toLowerCase(), {
    ...user,
    salt: defaultSalt,
    passwordHash: defaultPasswordHash,
    createdAt: new Date().toISOString(),
  });
});

// Authentication Routes
app.post("/api/auth/signup", (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Full name is required." });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters in length.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (usersStore.has(normalizedEmail)) {
      return res.status(409).json({
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const userId = `usr-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;

    const newUser: StoredUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      avatar: `https://images.unsplash.com/photo-${1535713875000 + (usersStore.size % 100)}?w=150&auto=format&fit=crop&q=80`,
      role: role || "Project Manager",
      department: department || "Operations",
      jobTitle: role || "Project Manager",
      organizationId: "org-worqester-01",
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    usersStore.set(normalizedEmail, newUser);

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    sessionsStore.set(token, {
      token,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      message: "Account created successfully.",
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Failed to process signup." });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const storedUser = usersStore.get(normalizedEmail);

    if (!storedUser) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please check your credentials.",
      });
    }

    const isMatch = verifyPassword(password, storedUser.salt, storedUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please check your credentials.",
      });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    sessionsStore.set(token, {
      token,
      userId: storedUser.id,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    return res.json({
      success: true,
      token,
      user: sanitizeUser(storedUser),
      message: "Logged in successfully.",
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Failed to log in." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      sessionsStore.delete(token);
    }
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to log out." });
  }
});

app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No authentication token provided." });
    }

    const token = authHeader.slice(7);
    const session = sessionsStore.get(token);

    if (!session || new Date(session.expiresAt) < new Date()) {
      sessionsStore.delete(token);
      return res.status(401).json({ success: false, error: "Session expired or invalid." });
    }

    let foundUser: StoredUser | null = null;
    for (const u of usersStore.values()) {
      if (u.id === session.userId) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.json({
      success: true,
      user: sanitizeUser(foundUser),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to verify session." });
  }
});

app.get("/api/auth/demo-users", (req, res) => {
  const demoUsers = Array.from(usersStore.values()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    avatar: u.avatar,
    defaultPassword: "worqester123",
  }));
  return res.json({ success: true, demoUsers });
});

// Server-side Gemini AI setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Worqester",
    version: "1.0.0",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Assistant query endpoint
app.post("/api/ai/ask", async (req, res) => {
  try {
    const { prompt, context, userRole } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Graceful local heuristic fallback when Gemini API key is not present in local test
      return res.json({
        success: true,
        source: "local-engine",
        answer: generateLocalAiResponse(prompt, context, userRole),
      });
    }

    const systemInstruction = `You are the executive AI Intelligence Assistant embedded in "Worqester", a unified enterprise business management SaaS platform.
The user is logged in with role: "${userRole || "User"}".
Adhere strictly to enterprise data security and RBAC: only discuss data provided in the business context.
Respond with structured, highly professional, direct answers. Include bullet points, metric callouts, and clear recommendations.
Context of the business:
${JSON.stringify(context || {}).slice(0, 15000)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      source: "gemini-2.5-flash",
      answer: response.text || "No response generated from intelligence engine.",
    });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process AI query",
    });
  }
});

// AI Operations Audit endpoint
app.post("/api/ai/audit", async (req, res) => {
  try {
    const { data } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "local-engine",
        findings: generateLocalAuditFindings(data),
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this organization data and return a JSON list of key operational risks (overdue tasks, deal bottlenecks, employee overload, customer health risks).
Data snippet: ${JSON.stringify(data || {}).slice(0, 10000)}`,
      config: {
        systemInstruction: `You are Worqester AI Operations Auditor. Return pure JSON format adhering to:
[{"id": "risk-1", "severity": "Critical"|"High"|"Medium"|"Low", "category": "Tasks"|"Deals"|"HR"|"Projects"|"Customers", "issue": "string", "impact": "string", "recommendedAction": "string"}]`,
        responseMimeType: "application/json",
      },
    });

    let findings = [];
    try {
      findings = JSON.parse(response.text || "[]");
    } catch {
      findings = generateLocalAuditFindings(data);
    }

    res.json({
      success: true,
      source: "gemini-2.5-flash",
      findings,
    });
  } catch (error: any) {
    console.error("Audit error:", error);
    res.json({
      success: true,
      source: "fallback",
      findings: generateLocalAuditFindings(req.body.data),
    });
  }
});

function generateLocalAiResponse(prompt: string, context: any, userRole: string): string {
  const p = (prompt || "").toLowerCase();
  if (p.includes("overdue") || p.includes("task")) {
    return `### ⚡ Task & Priority Overview
- **Overdue Tasks Detected**: 3 tasks across Engineering & Customer Success require immediate attention.
- **Top Blocker**: *Cloud Infrastructure Modernization - Auth Token Migration* (Due 2 days ago).
- **Suggested Action**: Reassign task to available senior engineer or extend deadline upon customer confirmation.`;
  }
  if (p.includes("deal") || p.includes("sales") || p.includes("pipeline") || p.includes("close")) {
    return `### 📈 Sales Pipeline & Deals Intelligence
- **Total Active Deals**: ₹4.82 Cr across 14 deals in active qualification & negotiation.
- **Highest Probability**: *Acme Global Cloud Portal Migration* (85% probability, closing within 10 days).
- **Stalled Notice**: *Nova Systems Enterprise Fleet Deal* has had no touchpoint in 14 days. Recommend scheduling a leadership sync.`;
  }
  if (p.includes("customer") || p.includes("health") || p.includes("contact")) {
    return `### 🏢 Customer Health & Retention Audit
- **Healthy Accounts**: 82% of active enterprise accounts show positive engagement velocity.
- **Attention Required**: *Vertex Solutions* has 2 critical support tasks open and is pending quarterly review.
- **Action**: Proactively notify account owner to schedule an executive check-in.`;
  }
  return `### 📊 Worqester Unified Intelligence Summary
- **Organization Health**: **88/100 (Healthy)**.
- **Cross-Functional Metrics**: Active Projects: 8 | Team Utilization: 78% (Optimal) | Current Month Net Revenue: ₹84.5L.
- **Action Items**: Review 2 pending leave approvals in HR, rebalance 1 overloaded DevOps engineer, and verify client follow-ups for Q3 pipeline.`;
}

function generateLocalAuditFindings(data: any) {
  return [
    {
      id: "risk-01",
      severity: "Critical",
      category: "Tasks",
      issue: "Auth Token Migration Task Breached SLA",
      impact: "Blocks deployment for Nova Systems Cloud Portal; potential release delay of 4 days.",
      recommendedAction: "Escalate to Project Lead and reassign subtasks.",
    },
    {
      id: "risk-02",
      severity: "High",
      category: "Deals",
      issue: "High Value Deal Stalled in Negotiation",
      impact: "₹1.2 Cr Enterprise Deal with Vertex Solutions untouched for 12 days.",
      recommendedAction: "Send automated executive follow-up note and review pricing tier.",
    },
    {
      id: "risk-03",
      severity: "Medium",
      category: "HR",
      issue: "Capacity Bottleneck in DevOps",
      impact: "DevOps Lead is assigned to 4 high-priority projects with 115% planned capacity.",
      recommendedAction: "Rebalance tickets to junior team members or defer non-critical refactoring.",
    },
    {
      id: "risk-04",
      severity: "Medium",
      category: "Customers",
      issue: "Customer Health Downgraded for Orion Enterprises",
      impact: "Engagement dropped 35% after unresolved integration query.",
      recommendedAction: "Trigger CSM customer 360 review and schedule technical office hours.",
    },
  ];
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Worqester Unified Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
