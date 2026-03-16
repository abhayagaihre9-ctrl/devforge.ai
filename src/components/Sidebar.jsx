export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "agent", icon: "🤖", label: "Agent" },
    { id: "preview", icon: "💻", label: "Code" },
    { id: "database", icon: "🗄️", label: "DB" },
    { id: "deploy", icon: "🚀", label: "Deploy" },
    { id: "ads", icon: "💰", label: "Ads" },
  ];

  return (
    <nav className="sidebar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`sidebar-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          title={tab.label}
        >
          <span style={{ fontSize: 18 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
