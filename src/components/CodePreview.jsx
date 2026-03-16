import { useState } from "react";

export default function CodePreview({ code, projectName }) {
  const [activeTab, setActiveTab] = useState("frontend");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "frontend", label: "📄 Frontend (App.jsx)", content: code?.frontend },
    { id: "backend", label: "⚙️ Backend (server.js)", content: code?.backend },
  ];

  const current = tabs.find((t) => t.id === activeTab);

  const copyCode = () => {
    if (current?.content) {
      navigator.clipboard.writeText(current.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    if (!current?.content) return;
    const filename = activeTab === "frontend" ? "App.jsx" : "server.js";
    const blob = new Blob([current.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!code?.frontend && !code?.backend) {
    return (
      <div className="welcome-screen">
        <div className="welcome-logo">💻</div>
        <div className="welcome-title">No code yet</div>
        <div className="welcome-sub">
          Go to the <strong>Agent</strong> tab and describe your app. The generated code will appear here, ready to download.
        </div>
      </div>
    );
  }

  return (
    <div className="code-preview">
      <div className="code-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`code-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.content && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "1px 6px",
                  background: "var(--accent)33",
                  color: "var(--accent)",
                  borderRadius: 10,
                  fontSize: 10,
                }}
              >
                {tab.content.split("\n").length} lines
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            className="code-tab"
            onClick={copyCode}
            disabled={!current?.content}
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
          <button
            className="code-tab"
            onClick={downloadFile}
            disabled={!current?.content}
          >
            ⬇ Download
          </button>
        </div>
      </div>
      <div className="code-area">
        {current?.content
          ? current.content
          : `// No ${activeTab} code generated yet.\n// Go to the Agent tab and describe your app!`}
      </div>
    </div>
  );
}
