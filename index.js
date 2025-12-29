import express from "express";
import { nanoid } from "nanoid";
import { kv } from "@vercel/kv";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function now(req) {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    return Number(req.headers["x-test-now-ms"]);
  }
  return Date.now();
}

/* ---------- HEALTH ---------- */
app.get("/api/healthz", async (req, res) => {
  try {
    await kv.ping();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

/* ---------- HOME ---------- */
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body>
        <h2>Create Paste</h2>
        <form method="POST" action="/create">
          <textarea name="content" required></textarea><br/>
          <input name="ttl_seconds" placeholder="TTL seconds"/><br/>
          <input name="max_views" placeholder="Max views"/><br/>
          <button>Create</button>
        </form>
      </body>
    </html>
  `);
});

/* ---------- CREATE LOGIC ---------- */
async function createPaste(data, req) {
  const { content, ttl_seconds, max_views } = data;

  if (!content || typeof content !== "string" || !content.trim()) {
    throw new Error("Invalid content");
  }

  const id = nanoid(8);

  await kv.set(`paste:${id}`, {
    content,
    createdAt: now(req),
    ttl_seconds: ttl_seconds ?? null,
    max_views: max_views ?? null,
    views: 0
  });

  return id;
}

/* ---------- CREATE API ---------- */
app.post("/api/pastes", async (req, res) => {
  try {
    const id = await createPaste(req.body, req);
    res.status(201).json({
      id,
      url: `${req.protocol}://${req.get("host")}/p/${id}`
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ---------- CREATE FORM ---------- */
app.post("/create", async (req, res) => {
  try {
    const id = await createPaste(
      {
        content: req.body.content,
        ttl_seconds: req.body.ttl_seconds ? Number(req.body.ttl_seconds) : undefined,
        max_views: req.body.max_views ? Number(req.body.max_views) : undefined
      },
      req
    );
    res.redirect(`/p/${id}`);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

/* ---------- VIEW ---------- */
app.get("/p/:id", async (req, res) => {
  const key = `paste:${req.params.id}`;
  const paste = await kv.get(key);

  if (!paste) return res.status(404).send("Not found");

  paste.views += 1;
  await kv.set(key, paste);

  res.send(`<pre>${paste.content.replace(/</g, "&lt;")}</pre>`);
});

/* 🔥 REQUIRED FOR VERCEL */
export default app;
