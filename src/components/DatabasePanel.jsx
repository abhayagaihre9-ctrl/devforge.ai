import { useState } from "react";

const DB_PROVIDERS = [
  {
    id: "firestore",
    name: "Firebase Firestore",
    icon: "🔥",
    color: "#f59e0b",
    free: true,
    desc: "Google's NoSQL real-time database. Free tier: 1GB storage, 50k reads/day",
    envVars: ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_PROJECT_ID"],
    snippet: `// Firebase Firestore Setup
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Add more from your Firebase console
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Example CRUD operations
export const addItem = (col, data) => addDoc(collection(db, col), data);
export const getItems = (col) => getDocs(collection(db, col));
export const updateItem = (col, id, data) => updateDoc(doc(db, col, id), data);
export const deleteItem = (col, id) => deleteDoc(doc(db, col, id));`,
  },
  {
    id: "supabase",
    name: "Supabase (PostgreSQL)",
    icon: "⚡",
    color: "#10b981",
    free: true,
    desc: "Open source Firebase alternative. Free tier: 500MB DB, 1GB file storage",
    envVars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
    snippet: `// Supabase Setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example CRUD operations
export const getItems = (table) => supabase.from(table).select('*');
export const addItem = (table, data) => supabase.from(table).insert(data);
export const updateItem = (table, id, data) => supabase.from(table).update(data).eq('id', id);
export const deleteItem = (table, id) => supabase.from(table).delete().eq('id', id);`,
  },
  {
    id: "neon",
    name: "Neon (Serverless PostgreSQL)",
    icon: "🟢",
    color: "#06b6d4",
    free: true,
    desc: "Serverless Postgres. Free tier: 512MB storage, unlimited connections",
    envVars: ["DATABASE_URL"],
    snippet: `// Neon PostgreSQL Setup (Backend/API routes)
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Create table
await sql\`CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)\`;

// CRUD operations
export const getItems = () => sql\`SELECT * FROM items ORDER BY created_at DESC\`;
export const addItem = (name) => sql\`INSERT INTO items (name) VALUES (\${name}) RETURNING *\`;
export const deleteItem = (id) => sql\`DELETE FROM items WHERE id = \${id}\`;`,
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    icon: "🍃",
    color: "#10b981",
    free: true,
    desc: "Cloud MongoDB. Free tier: 512MB, shared cluster (M0)",
    envVars: ["MONGODB_URI"],
    snippet: `// MongoDB Atlas Setup (Backend)
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('myapp');

export const connectDB = async () => {
  await client.connect();
  console.log('MongoDB connected');
};

// CRUD operations
export const getItems = (col) => db.collection(col).find({}).toArray();
export const addItem = (col, data) => db.collection(col).insertOne({ ...data, createdAt: new Date() });
export const updateItem = (col, id, data) => db.collection(col).updateOne({ _id: id }, { \$set: data });
export const deleteItem = (col, id) => db.collection(col).deleteOne({ _id: id });`,
  },
  {
    id: "turso",
    name: "Turso (SQLite Edge)",
    icon: "🔷",
    color: "#7c3aed",
    free: true,
    desc: "Edge SQLite database. Free tier: 500 DBs, 9GB storage",
    envVars: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
    snippet: `// Turso (LibSQL) Setup
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create table
await db.execute(\`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)\`);

// CRUD operations
export const getItems = () => db.execute('SELECT * FROM items ORDER BY created_at DESC');
export const addItem = (name) => db.execute({ sql: 'INSERT INTO items (name) VALUES (?)', args: [name] });
export const deleteItem = (id) => db.execute({ sql: 'DELETE FROM items WHERE id = ?', args: [id] });`,
  },
  {
    id: "planetscale",
    name: "PlanetScale (MySQL)",
    icon: "🌍",
    color: "#f59e0b",
    free: true,
    desc: "Serverless MySQL platform. Free hobby tier available",
    envVars: ["DATABASE_HOST", "DATABASE_USERNAME", "DATABASE_PASSWORD"],
    snippet: `// PlanetScale MySQL Setup (Backend)
import { connect } from '@planetscale/database';

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
};

const conn = connect(config);

// Create table
await conn.execute(\`CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)\`);

// CRUD operations
export const getItems = () => conn.execute('SELECT * FROM items ORDER BY created_at DESC');
export const addItem = (name) => conn.execute('INSERT INTO items (name) VALUES (?)', [name]);
export const deleteItem = (id) => conn.execute('DELETE FROM items WHERE id = ?', [id]);`,
  },
];

export default function DatabasePanel({ projectName }) {
  const [selected, setSelected] = useState(null);
  const [envValues, setEnvValues] = useState({});
  const [copied, setCopied] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState(null);

  const copySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDB = DB_PROVIDERS.find((d) => d.id === selected);

  const generateEnvFile = () => {
    if (!selectedDB) return;
    const lines = selectedDB.envVars.map(
      (v) => `${v}=${envValues[v] || "your_value_here"}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".env.local";
    a.click();
  };

  return (
    <div className="panel">
      <div className="panel-title">🗄️ Database Connection</div>
      <div className="panel-sub">
        Connect your app to a free database. All providers below have generous free tiers — no credit card needed.
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {DB_PROVIDERS.map((db) => (
          <div
            key={db.id}
            className={`deploy-card ${selected === db.id ? "selected" : ""}`}
            onClick={() => setSelected(db.id)}
            style={{
              borderColor: selected === db.id ? db.color : undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: selected === db.id ? db.color : "transparent",
              }}
            />
            <div
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
            >
              <span style={{ fontSize: 22 }}>{db.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{db.name}</div>
                {db.free && <span className="tag tag-green">Free Tier</span>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
              {db.desc}
            </div>
          </div>
        ))}
      </div>

      {selectedDB && (
        <>
          <div className="card">
            <div className="card-title">
              {selectedDB.icon} {selectedDB.name} — Connection Setup
            </div>
            <div className="card-desc">
              Fill in your credentials below. These will be saved to a{" "}
              <code style={{ color: "var(--accent2)" }}>.env.local</code> file.
            </div>

            <div className="grid-2">
              {selectedDB.envVars.map((v) => (
                <div key={v} className="input-group">
                  <div className="input-label">{v}</div>
                  <input
                    type="text"
                    className="text-input"
                    placeholder={`Enter your ${v}`}
                    value={envValues[v] || ""}
                    onChange={(e) =>
                      setEnvValues((prev) => ({ ...prev, [v]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={generateEnvFile}>
                ⬇ Download .env.local
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setActiveSnippet(selected)}
              >
                {activeSnippet === selected ? "Hide Code" : "📋 Show Code Snippet"}
              </button>
            </div>
          </div>

          {activeSnippet === selected && (
            <div className="card">
              <div className="card-title">📋 Connection Code</div>
              <div className="card-desc">
                Copy this into your project's{" "}
                <code style={{ color: "var(--accent2)" }}>src/lib/db.js</code>
              </div>
              <div className="code-block" style={{ position: "relative" }}>
                <button
                  className="copy-btn"
                  onClick={() => copySnippet(selectedDB.snippet)}
                >
                  {copied ? "✅ Copied!" : "Copy"}
                </button>
                {selectedDB.snippet}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title">📦 Install Package</div>
            <div className="card-desc">Run this in your project terminal:</div>
            <div className="code-block">
              {selectedDB.id === "firestore" && "npm install firebase"}
              {selectedDB.id === "supabase" && "npm install @supabase/supabase-js"}
              {selectedDB.id === "neon" && "npm install @neondatabase/serverless"}
              {selectedDB.id === "mongodb" && "npm install mongodb"}
              {selectedDB.id === "turso" && "npm install @libsql/client"}
              {selectedDB.id === "planetscale" && "npm install @planetscale/database"}
            </div>
          </div>

          <div className="card">
            <div className="card-title">🔗 Where to get free credentials</div>
            <div className="steps">
              {selectedDB.id === "firestore" && (
                <>
                  <div className="step">
                    <div className="step-num">1</div>
                    <div className="step-content">
                      <div className="step-title">Go to Firebase Console</div>
                      <div className="step-desc">
                        Visit console.firebase.google.com → Create project → Add web app
                      </div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <div className="step-title">Enable Firestore</div>
                      <div className="step-desc">
                        Build → Firestore Database → Create database → Start in test mode
                      </div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">3</div>
                    <div className="step-content">
                      <div className="step-title">Copy credentials</div>
                      <div className="step-desc">
                        Project Settings → Your apps → Firebase SDK snippet → Config
                      </div>
                    </div>
                  </div>
                </>
              )}
              {selectedDB.id === "supabase" && (
                <>
                  <div className="step">
                    <div className="step-num">1</div>
                    <div className="step-content">
                      <div className="step-title">Create Supabase project</div>
                      <div className="step-desc">Visit supabase.com → New project (free plan)</div>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <div className="step-title">Get API credentials</div>
                      <div className="step-desc">
                        Settings → API → Copy URL and anon/public key
                      </div>
                    </div>
                  </div>
                </>
              )}
              {(selectedDB.id === "neon" ||
                selectedDB.id === "mongodb" ||
                selectedDB.id === "turso" ||
                selectedDB.id === "planetscale") && (
                <div className="step">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <div className="step-title">
                      Sign up at{" "}
                      {selectedDB.id === "neon" && "neon.tech"}
                      {selectedDB.id === "mongodb" && "mongodb.com/atlas"}
                      {selectedDB.id === "turso" && "turso.tech"}
                      {selectedDB.id === "planetscale" && "planetscale.com"}
                    </div>
                    <div className="step-desc">
                      Create a free account → New database → Copy connection string
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
