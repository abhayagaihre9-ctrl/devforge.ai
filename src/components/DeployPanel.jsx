import { useState } from "react";

const DEPLOY_PLATFORMS = [
  {
    id: "vercel",
    name: "Vercel",
    icon: "▲",
    color: "#ffffff",
    bg: "#000000",
    free: true,
    desc: "Best for React/Next.js. Free tier: unlimited hobby projects, 100GB bandwidth",
    steps: [
      { title: "Install Vercel CLI", cmd: "npm install -g vercel" },
      { title: "Login to Vercel", cmd: "vercel login" },
      { title: "Deploy project", cmd: "vercel --prod" },
      { title: "Set env variables", cmd: "vercel env add VARIABLE_NAME" },
    ],
    config: `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}`,
    configFile: "vercel.json",
  },
  {
    id: "netlify",
    name: "Netlify",
    icon: "◆",
    color: "#00c7b7",
    bg: "#003c41",
    free: true,
    desc: "Great for static sites. Free tier: 100GB bandwidth, 300 build minutes/month",
    steps: [
      { title: "Install Netlify CLI", cmd: "npm install -g netlify-cli" },
      { title: "Login to Netlify", cmd: "netlify login" },
      { title: "Initialize project", cmd: "netlify init" },
      { title: "Deploy to production", cmd: "netlify deploy --prod" },
    ],
    config: `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"`,
    configFile: "netlify.toml",
  },
  {
    id: "github-pages",
    name: "GitHub Pages",
    icon: "🐙",
    color: "#fff",
    bg: "#24292e",
    free: true,
    desc: "Free static hosting for GitHub repos. Unlimited public projects",
    steps: [
      { title: "Install gh-pages", cmd: "npm install --save-dev gh-pages" },
      {
        title: "Add to package.json",
        cmd: '"homepage": "https://username.github.io/repo-name"',
      },
      {
        title: "Add deploy script",
        cmd: '"predeploy": "npm run build", "deploy": "gh-pages -d dist"',
      },
      { title: "Deploy", cmd: "npm run deploy" },
    ],
    config: `# GitHub Actions Deploy
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`,
    configFile: ".github/workflows/deploy.yml",
  },
  {
    id: "firebase-hosting",
    name: "Firebase Hosting",
    icon: "🔥",
    color: "#f59e0b",
    bg: "#1a1200",
    free: true,
    desc: "Google's hosting with CDN. Free: 10GB storage, 360MB/day transfer",
    steps: [
      { title: "Install Firebase CLI", cmd: "npm install -g firebase-tools" },
      { title: "Login to Firebase", cmd: "firebase login" },
      { title: "Initialize hosting", cmd: "firebase init hosting" },
      { title: "Build and deploy", cmd: "npm run build && firebase deploy" },
    ],
    config: `{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
      }
    ]
  }
}`,
    configFile: "firebase.json",
  },
];

export default function DeployPanel({ projectName, code }) {
  const [selected, setSelected] = useState("vercel");
  const [copied, setCopied] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  const platform = DEPLOY_PLATFORMS.find((p) => p.id === selected);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadConfig = () => {
    if (!platform) return;
    const blob = new Blob([platform.config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = platform.configFile;
    a.click();
  };

  const downloadPackageJson = () => {
    const pkg = {
      name: projectName || "my-app",
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        predeploy: "npm run build",
        deploy: "gh-pages -d dist",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
        vite: "^4.4.0",
        "gh-pages": "^5.0.0",
      },
      homepage: `https://yourusername.github.io/${projectName || "my-app"}`,
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "package.json";
    a.click();
  };

  const simulateDeploy = async () => {
    setDeploying(true);
    setDeployStep(0);
    for (let i = 0; i <= platform.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      setDeployStep(i);
    }
    setDeploying(false);
  };

  return (
    <div className="panel">
      <div className="panel-title">🚀 Deploy Your App</div>
      <div className="panel-sub">
        One-click deploy to any platform. All platforms below are free — no credit card required.
      </div>

      {/* Platform selector */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {DEPLOY_PLATFORMS.map((p) => (
          <div
            key={p.id}
            className={`deploy-card ${selected === p.id ? "selected" : ""}`}
            onClick={() => setSelected(p.id)}
            style={{ borderColor: selected === p.id ? p.color : undefined }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: selected === p.id ? p.color : "transparent" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36, height: 36,
                  borderRadius: 8,
                  background: p.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  border: "1px solid var(--border)",
                  color: p.color,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                {p.free && <span className="tag tag-green">Free</span>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {platform && (
        <>
          {/* Steps */}
          <div className="card">
            <div className="card-title">📋 Deploy Steps — {platform.name}</div>
            <div className="card-desc">Follow these steps to deploy your app:</div>
            <div className="steps" style={{ marginBottom: 16 }}>
              {platform.steps.map((step, i) => (
                <div key={i} className="step">
                  <div
                    className="step-num"
                    style={{
                      background: deploying && deployStep > i
                        ? "var(--accent3)33"
                        : "var(--accent)33",
                      borderColor: deploying && deployStep > i
                        ? "var(--accent3)55"
                        : "var(--accent)55",
                      color: deploying && deployStep > i
                        ? "var(--accent3)"
                        : "var(--accent)",
                    }}
                  >
                    {deploying && deployStep > i ? "✓" : i + 1}
                  </div>
                  <div className="step-content">
                    <div className="step-title">{step.title}</div>
                    <div
                      className="code-block"
                      style={{ marginTop: 6, padding: "8px 12px", fontSize: 12 }}
                    >
                      {step.cmd}
                      <button
                        className="copy-btn"
                        style={{ top: 4, right: 6, padding: "2px 8px" }}
                        onClick={() => copyText(step.cmd, `step-${i}`)}
                      >
                        {copied === `step-${i}` ? "✅" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {deploying && (
              <div>
                <div
                  style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6 }}
                >
                  Simulating deployment...{" "}
                  <span style={{ color: "var(--accent2)" }}>
                    Step {deployStep}/{platform.steps.length}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(deployStep / platform.steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Config file */}
          <div className="card">
            <div className="card-title">
              ⚙️ Config File —{" "}
              <code style={{ color: "var(--accent2)", fontSize: 13 }}>
                {platform.configFile}
              </code>
            </div>
            <div className="card-desc">
              Add this file to the root of your project:
            </div>
            <div className="code-block" style={{ position: "relative" }}>
              <button
                className="copy-btn"
                onClick={() => copyText(platform.config, "config")}
              >
                {copied === "config" ? "✅ Copied!" : "Copy"}
              </button>
              {platform.config}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={downloadConfig}>
                ⬇ Download {platform.configFile}
              </button>
              <button className="btn btn-ghost" onClick={downloadPackageJson}>
                ⬇ Download package.json
              </button>
            </div>
          </div>

          {/* Quick download all */}
          <div className="card">
            <div className="card-title">📦 Download Everything</div>
            <div className="card-desc">
              Get all the files you need to deploy this project right now.
            </div>
            <div className="row">
              <button
                className="btn btn-success"
                onClick={() => {
                  downloadConfig();
                  setTimeout(downloadPackageJson, 300);
                }}
              >
                ⬇ Download All Config Files
              </button>
              {(code?.frontend || code?.backend) && (
                <button
                  className="btn btn-info"
                  onClick={() => {
                    if (code.frontend) {
                      const blob = new Blob([code.frontend], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "App.jsx";
                      a.click();
                    }
                  }}
                >
                  ⬇ Download Generated Code
                </button>
              )}
            </div>
          </div>

          {/* Env reminder */}
          <div
            className="card"
            style={{ borderColor: "var(--warn)44", background: "var(--warn)08" }}
          >
            <div className="card-title" style={{ color: "var(--warn)" }}>
              ⚠️ Environment Variables
            </div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
              Don't forget to set your environment variables on{" "}
              <strong style={{ color: "var(--text)" }}>{platform.name}</strong>{" "}
              after deploying! Go to your project's settings → Environment Variables
              and add all the keys from your <code>.env.local</code> file.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
