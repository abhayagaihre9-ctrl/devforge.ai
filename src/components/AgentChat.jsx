import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "Build a todo app with React + Firebase",
  "Create a REST API with Node.js + Express",
  "Make a login/auth system",
  "Build an e-commerce product page",
  "Create a blog with markdown support",
  "Make a real-time chat app",
];

const SYSTEM_PROMPT = `You are DevForge AI, an expert full-stack web developer agent. 
Your job is to generate complete, production-ready code for web applications.

When generating code, always:
1. Create both frontend (React/HTML/CSS) and backend (Node.js/Express or Firebase Functions) code
2. Include database schema/setup (Firestore, MySQL, PostgreSQL, MongoDB, or SQLite)
3. Add comments explaining each part
4. Make code deployable to Vercel or Netlify immediately
5. Include environment variable examples (.env.example)
6. Add error handling and loading states

Format your response with clear sections:
### FRONTEND CODE
[complete React/HTML code]

### BACKEND CODE  
[complete Node.js/Express or Firebase Functions code]

### DATABASE SETUP
[schema and connection code]

### ENV VARIABLES
[.env.example content]

### DEPLOY STEPS
[numbered deployment steps]

Be concise but complete. Use modern best practices.`;

export default function AgentChat({ projectName, onCodeGenerated }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      model: "auto",
      content: `Hey! I'm **DevForge AI** — your full-stack development agent. 🚀\n\nTell me what you want to build and I'll generate:\n• Complete frontend + backend code\n• Database setup (MySQL, PostgreSQL, Firebase, MongoDB)\n• One-click deploy config for Vercel/Netlify\n• Google Ads integration snippet\n\nWhat are we building today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAI, setActiveAI] = useState("claude");
  const [apiKeys, setApiKeys] = useState({ claude: "", gemini: "" });
  const [showApiConfig, setShowApiConfig] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callClaudeAPI = async (userMessage, history) => {
    const key = apiKeys.claude || import.meta.env.VITE_CLAUDE_API_KEY;
    if (!key) throw new Error("Claude API key not set. Click ⚙️ API Keys to add it.");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          ...history.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Claude API error");
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const callGeminiAPI = async (userMessage) => {
    const key = apiKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API key not set. Click ⚙️ API Keys to add it.");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT + "\n\nUser request: " + userMessage },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 4096 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Gemini API error");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const extractCode = (responseText) => {
    const frontendMatch = responseText.match(
      /### FRONTEND CODE\n([\s\S]*?)(?=###|$)/
    );
    const backendMatch = responseText.match(
      /### BACKEND CODE\n([\s\S]*?)(?=###|$)/
    );

    return {
      frontend: frontendMatch
        ? frontendMatch[1].trim().replace(/```[\w]*\n?|```/g, "")
        : responseText,
      backend: backendMatch
        ? backendMatch[1].trim().replace(/```[\w]*\n?|```/g, "")
        : "",
    };
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput("");
    const newMessages = [
      ...messages,
      { role: "user", content: userMsg, timestamp: new Date() },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      let responseText;
      const model = activeAI;

      if (model === "claude") {
        responseText = await callClaudeAPI(userMsg, messages);
      } else if (model === "gemini") {
        responseText = await callGeminiAPI(userMsg);
      } else {
        // Auto: try Claude first, fallback to Gemini
        try {
          responseText = await callClaudeAPI(userMsg, messages);
        } catch {
          responseText = await callGeminiAPI(userMsg);
        }
      }

      const extracted = extractCode(responseText);
      onCodeGenerated(extracted);

      setMessages([
        ...newMessages,
        {
          role: "ai",
          model,
          content: responseText,
          code: extracted,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          model: "error",
          content: `❌ Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadCode = (code, filename) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = (code) => {
    if (code.frontend) downloadCode(code.frontend, "App.jsx");
    if (code.backend) setTimeout(() => downloadCode(code.backend, "server.js"), 300);
  };

  const formatContent = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
      .replace(/•/g, "•");
  };

  return (
    <div className="agent-chat">
      {/* Header */}
      <div className="chat-header">
        <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 700 }}>
          AI Model:
        </span>
        <div className="ai-selector">
          {["claude", "gemini", "auto"].map((m) => (
            <button
              key={m}
              className={`ai-btn ${activeAI === m ? "active " + m : ""}`}
              onClick={() => setActiveAI(m)}
            >
              {m === "claude" ? "⚡ Claude" : m === "gemini" ? "✨ Gemini" : "🔄 Auto"}
            </button>
          ))}
        </div>
        <button
          className="action-btn"
          style={{ marginLeft: "auto", fontSize: 12 }}
          onClick={() => setShowApiConfig(!showApiConfig)}
        >
          ⚙️ API Keys
        </button>
      </div>

      {/* API Key Config */}
      {showApiConfig && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg2)",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="input-label" style={{ marginBottom: 6 }}>
              Claude API Key (Anthropic)
            </div>
            <input
              type="password"
              className="text-input"
              placeholder="sk-ant-..."
              value={apiKeys.claude}
              onChange={(e) =>
                setApiKeys((k) => ({ ...k, claude: e.target.value }))
              }
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="input-label" style={{ marginBottom: 6 }}>
              Gemini API Key (Google AI Studio)
            </div>
            <input
              type="password"
              className="text-input"
              placeholder="AIza..."
              value={apiKeys.gemini}
              onChange={(e) =>
                setApiKeys((k) => ({ ...k, gemini: e.target.value }))
              }
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowApiConfig(false)}
          >
            Save Keys
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className={`msg-avatar ${msg.role === "ai" ? "ai" : "user"}`}>
              {msg.role === "ai" ? "🤖" : "👤"}
            </div>
            <div className="msg-content">
              {msg.role === "ai" && msg.model && msg.model !== "error" && (
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text3)",
                    marginBottom: 6,
                    fontFamily: "var(--mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {msg.model === "claude"
                    ? "⚡ Claude"
                    : msg.model === "gemini"
                    ? "✨ Gemini"
                    : "🔄 Auto"}
                </div>
              )}
              <div
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
              {msg.code && (msg.code.frontend || msg.code.backend) && (
                <div className="msg-actions">
                  {msg.code.frontend && (
                    <button
                      className="action-btn"
                      onClick={() => downloadCode(msg.code.frontend, "App.jsx")}
                    >
                      ⬇ Frontend
                    </button>
                  )}
                  {msg.code.backend && (
                    <button
                      className="action-btn"
                      onClick={() => downloadCode(msg.code.backend, "server.js")}
                    >
                      ⬇ Backend
                    </button>
                  )}
                  <button
                    className="action-btn primary"
                    onClick={() => downloadAll(msg.code)}
                  >
                    📦 Download All
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="msg-avatar ai">🤖</div>
            <div className="msg-content">
              <div className="typing">
                <span /><span /><span />
              </div>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>
                Generating your full-stack code...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="quick-prompts">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              className="quick-btn"
              onClick={() => sendMessage(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app... (e.g. 'Build a task manager with user auth and MySQL database')"
            rows={2}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? "⏳" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
