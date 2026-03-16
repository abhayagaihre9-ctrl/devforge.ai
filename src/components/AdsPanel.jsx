import { useState } from "react";

const AD_PROVIDERS = [
  {
    id: "adsense",
    name: "Google AdSense",
    icon: "🟦",
    color: "#4285f4",
    free: true,
    payout: "High CPM",
    desc: "Most popular ad network. Requires site approval (usually 1-3 days for new sites).",
    signup: "https://adsense.google.com",
    snippet: (pubId, slotId) => `<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId || 'ca-pub-XXXXXXXXXXXXXXXX'}"
  crossorigin="anonymous">
</script>

<!-- Ad Unit: Banner -->
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="${pubId || 'ca-pub-XXXXXXXXXXXXXXXX'}"
  data-ad-slot="${slotId || 'XXXXXXXXXX'}"
  data-ad-format="auto"
  data-full-width-responsive="true">
</ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    reactSnippet: (pubId, slotId) => `// Install: npm install react-adsense
import AdSense from 'react-adsense';

function AdBanner() {
  return (
    <AdSense.Google
      client="${pubId || 'ca-pub-XXXXXXXXXXXXXXXX'}"
      slot="${slotId || 'XXXXXXXXXX'}"
      style={{ display: 'block' }}
      format='auto'
      responsive='true'
    />
  );
}

// Also add to your index.html <head>:
// <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId || 'ca-pub-XXXXXXXXXXXXXXXX'}" crossorigin="anonymous"></script>`,
    steps: [
      "Sign up at adsense.google.com with a Google account",
      "Add your website URL and select language",
      "Add the AdSense code to your site's <head>",
      "Wait for approval (1-3 business days for new sites)",
      "Create ad units in your AdSense dashboard",
      "Copy the ad unit code and paste it where you want ads",
    ],
  },
  {
    id: "media-net",
    name: "Media.net (Yahoo/Bing Ads)",
    icon: "🟧",
    color: "#ff6900",
    free: true,
    payout: "Good CPM",
    desc: "Second largest contextual ad network. Good alternative to AdSense.",
    signup: "https://media.net",
    snippet: (pubId) => `<!-- Media.net Ad -->
<script>window._mNHandle = window._mNHandle || {};</script>
<script>window._mNHandle.queue = window._mNHandle.queue || [];</script>
<script async src="//contextual.media.net/dmedianet.js?cid=${pubId || 'YOUR_SITE_ID'}" crossorigin="anonymous"></script>

<div id="YOUR_DIV_ID" style="display:inline-block;"></div>`,
    reactSnippet: () => `// Media.net - Add script to index.html, then use div:
function MediaNetAd({ divId }) {
  return <div id={divId} style={{ display: 'inline-block', minWidth: 300 }} />;
}`,
    steps: [
      "Apply at media.net (approval usually within 48 hours)",
      "Add the Media.net script tag to your HTML head",
      "Create ad units in the Media.net dashboard",
      "Copy the ad div code and place it on your pages",
    ],
  },
  {
    id: "ezoic",
    name: "Ezoic",
    icon: "🟢",
    color: "#00b050",
    free: true,
    payout: "Very High CPM",
    desc: "AI-powered ads. Higher revenue than AdSense. No minimum traffic requirement.",
    signup: "https://ezoic.com",
    snippet: () => `<!-- Ezoic: Add to <head> of every page -->
<script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
<script>
  window.ezstandalone = window.ezstandalone || {};
  ezstandalone.cmd = ezstandalone.cmd || [];
</script>

<!-- Ad Placeholder (replace 101 with your unit ID) -->
<div id="ezoic-pub-ad-placeholder-101"></div>
<script>
  ezstandalone.cmd.push(function() {
    ezstandalone.displayAdsByHandle([101]);
  });
</script>`,
    reactSnippet: () => `// Ezoic in React
import { useEffect } from 'react';

function EzoicAd({ placeholderId }) {
  useEffect(() => {
    if (window.ezstandalone) {
      window.ezstandalone.cmd.push(function() {
        window.ezstandalone.displayAdsByHandle([placeholderId]);
      });
    }
  }, [placeholderId]);

  return <div id={\`ezoic-pub-ad-placeholder-\${placeholderId}\`} />;
}`,
    steps: [
      "Sign up at ezoic.com and verify ownership of your domain",
      "Connect your site via Cloudflare or WordPress plugin",
      "Ezoic's AI will automatically place ads for best revenue",
      "No manual ad placement needed after initial setup",
    ],
  },
  {
    id: "carbon",
    name: "Carbon Ads",
    icon: "🖤",
    color: "#888",
    free: true,
    payout: "Developer-focused",
    desc: "Premium ad network for developer/tech audiences. Clean, non-intrusive ads.",
    signup: "https://carbonads.net",
    snippet: () => `<!-- Carbon Ads -->
<script async type="text/javascript"
  src="//cdn.carbonads.com/carbon.js?serve=REPLACE_WITH_YOUR_CODE&placement=yoursite"
  id="_carbonads_js">
</script>

<style>
#carbonads {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  max-width: 130px;
  background-color: #f1f1f1;
  padding: 1em;
  border-radius: 4px;
  line-height: 1.5;
  font-size: 11px;
}
</style>`,
    reactSnippet: () => `// Carbon Ads in React
import { useEffect } from 'react';

function CarbonAds({ code }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = \`//cdn.carbonads.com/carbon.js?serve=\${code}&placement=yoursite\`;
    script.id = '_carbonads_js';
    document.getElementById('carbon-container')?.appendChild(script);
    return () => script.remove();
  }, [code]);

  return <div id="carbon-container" />;
}`,
    steps: [
      "Apply at carbonads.net (curated - requires tech/design audience)",
      "Get approved (usually 1-2 weeks)",
      "Copy your Carbon Ads script code",
      "Paste into your website where you want the ad block",
    ],
  },
];

export default function AdsPanel({ projectName }) {
  const [selected, setSelected] = useState("adsense");
  const [pubId, setPubId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [format, setFormat] = useState("html");
  const [copied, setCopied] = useState("");

  const provider = AD_PROVIDERS.find((p) => p.id === selected);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const downloadAdSnippet = () => {
    if (!provider) return;
    const code =
      format === "html"
        ? provider.snippet(pubId, slotId)
        : provider.reactSnippet(pubId, slotId);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      format === "html" ? `${selected}-ad.html` : `${selected}-ad.jsx`;
    a.click();
  };

  return (
    <div className="panel">
      <div className="panel-title">💰 Ads Integration</div>
      <div className="panel-sub">
        Monetize your app with ads. Add any ad provider to your site in minutes — all free to join.
      </div>

      {/* Providers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {AD_PROVIDERS.map((p) => (
          <div
            key={p.id}
            className="ad-provider"
            style={{ borderColor: selected === p.id ? p.color : undefined }}
            onClick={() => setSelected(p.id)}
          >
            <div
              className="ad-provider-icon"
              style={{ background: p.color + "22", border: `1px solid ${p.color}44` }}
            >
              {p.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <span className="tag tag-green">Free</span>
                <span className="tag tag-blue">{p.payout}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                {p.desc}
              </div>
            </div>
            <div
              style={{
                width: 20, height: 20,
                borderRadius: "50%",
                border: `2px solid ${selected === p.id ? p.color : "var(--border)"}`,
                background: selected === p.id ? p.color : "transparent",
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      {provider && (
        <>
          {/* Config */}
          <div className="card">
            <div className="card-title">{provider.icon} Configure {provider.name}</div>

            {provider.id === "adsense" && (
              <div className="grid-2" style={{ marginBottom: 16 }}>
                <div className="input-group">
                  <div className="input-label">Publisher ID</div>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={pubId}
                    onChange={(e) => setPubId(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <div className="input-label">Ad Slot ID</div>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="XXXXXXXXXX"
                    value={slotId}
                    onChange={(e) => setSlotId(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 12 }}>
              <div className="input-label">Code Format</div>
              <select
                className="select-input"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="html">HTML (plain website)</option>
                <option value="react">React Component (.jsx)</option>
              </select>
            </div>
          </div>

          {/* Code snippet */}
          <div className="card">
            <div className="card-title">📋 Ad Code Snippet</div>
            <div className="card-desc">
              {format === "react"
                ? "Add this React component wherever you want the ad to appear"
                : "Paste this HTML where you want the ad to appear on your page"}
            </div>
            <div className="code-block" style={{ position: "relative" }}>
              <button
                className="copy-btn"
                onClick={() =>
                  copyText(
                    format === "html"
                      ? provider.snippet(pubId, slotId)
                      : provider.reactSnippet(pubId, slotId),
                    "snippet"
                  )
                }
              >
                {copied === "snippet" ? "✅ Copied!" : "Copy"}
              </button>
              {format === "html"
                ? provider.snippet(pubId, slotId)
                : provider.reactSnippet(pubId, slotId)}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={downloadAdSnippet}>
                ⬇ Download Snippet
              </button>
              <a
                href={provider.signup}
                target="_blank"
                rel="noreferrer"
                className="btn btn-info"
                style={{ textDecoration: "none" }}
              >
                🔗 Sign up at {provider.name}
              </a>
            </div>
          </div>

          {/* Setup steps */}
          <div className="card">
            <div className="card-title">📋 Setup Steps</div>
            <div className="steps">
              {provider.steps.map((step, i) => (
                <div key={i} className="step">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-content">
                    <div className="step-desc">{step}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multiple ads tip */}
          <div className="card">
            <div className="card-title">💡 Pro Tips</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>
              • <strong style={{ color: "var(--text)" }}>Best positions</strong>: Header, between content sections, and sidebar<br />
              • <strong style={{ color: "var(--text)" }}>Don't overdo it</strong>: 2-3 ad units per page is ideal for UX<br />
              • <strong style={{ color: "var(--text)" }}>Stack providers</strong>: Use Google AdSense + one backup provider<br />
              • <strong style={{ color: "var(--text)" }}>New site?</strong> Try Ezoic first — no traffic minimums, AI optimization<br />
              • <strong style={{ color: "var(--text)" }}>Dev audience?</strong> Carbon Ads pays very well for tech blogs
            </div>
          </div>
        </>
      )}
    </div>
  );
}
