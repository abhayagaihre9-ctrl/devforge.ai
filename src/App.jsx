import { useState } from "react";
import Sidebar from "./components/Sidebar";
import AgentChat from "./components/AgentChat";
import DatabasePanel from "./components/DatabasePanel";
import DeployPanel from "./components/DeployPanel";
import AdsPanel from "./components/AdsPanel";
import CodePreview from "./components/CodePreview";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("agent");
  const [generatedCode, setGeneratedCode] = useState({ frontend: "", backend: "" });
  const [projectName, setProjectName] = useState("my-project");

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">DevForge <span className="logo-ai">AI</span></span>
        </div>
        <input
          className="project-name-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="project-name"
        />
        <div className="topbar-right">
          <span className="badge">Free</span>
          <span className="status-dot green" /> Live
        </div>
      </header>

      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="content-area">
          {activeTab === "agent" && (
            <AgentChat
              projectName={projectName}
              onCodeGenerated={setGeneratedCode}
            />
          )}
          {activeTab === "preview" && (
            <CodePreview code={generatedCode} projectName={projectName} />
          )}
          {activeTab === "database" && <DatabasePanel projectName={projectName} />}
          {activeTab === "deploy" && (
            <DeployPanel projectName={projectName} code={generatedCode} />
          )}
          {activeTab === "ads" && <AdsPanel projectName={projectName} />}
        </main>
      </div>
    </div>
  );
}
