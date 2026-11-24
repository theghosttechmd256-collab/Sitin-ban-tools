
require("dotenv").config();

const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID || "0";
const PASSWORD = process.env.DASHBOARD_PASSWORD;
const PORT = process.env.PORT || 3000;
const API = `https://api.telegram.org/bot${TOKEN}`;
const FILE = "./reports.json";

if (!TOKEN || !PASSWORD) {
  console.error("Missing BOT_TOKEN or DASHBOARD_PASSWORD");
  process.exit(1);
}

// ADMIN AUTHENTICATION
function auth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="SITANI ADMIN"');
    return res.sendStatus(401);
  }

  const credentials = Buffer.from(
    header.slice(6), "base64"
  ).toString();

  const separator = credentials.indexOf(":");

  if (
    credentials.slice(0, separator) !== "admin" ||
    credentials.slice(separator + 1) !== PASSWORD
  ) {
    res.set("WWW-Authenticate", 'Basic realm="SITANI ADMIN"');
    return res.sendStatus(401);
  }

  next();
}

app.use(["/admin", "/api"], auth);

// REPORT STORAGE
function loadReports() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveReport(report) {
  const reports = loadReports();
  reports.push(report);

  fs.writeFileSync(
    FILE,
    JSON.stringify(reports, null, 2)
  );
}

// TELEGRAM API
async function telegram(method, data = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.description);
  }

  return result.result;
}

async function reply(chatId, text) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text
  });
}

// ADMIN DASHBOARD
app.get("/admin", (req, res) => {
  res.type("html").send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SITANI BAN BOT</title>
<style>
body {
  margin:0;
  padding:20px;
  background:#080b18;
  color:white;
  font-family:Arial,sans-serif;
}
h1 {
  color:#ff3434;
  text-align:center;
}
.cards {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;
}
.card,.report {
  background:#171c30;
  padding:18px;
  border-radius:14px;
  margin-bottom:12px;
  overflow-wrap:anywhere;
}
.number {
  font-size:27px;
  color:#ff4545;
}
button {
  border:0;
  padding:12px;
  margin:5px;
  border-radius:7px;
  color:white;
  cursor:pointer;
}
.approve {background:#087d51}
.reject {background:#a52336}
small {color:#aab1c8}
</style>
</head>
<body>

<h1>👻 SITANI BAN BOT</h1>
<p align="center">PRIVATE ADMIN DASHBOARD</p>

<div class="cards">
<div class="card">TOTAL
<div class="number" id="total">0</div></div>

<div class="card">PENDING
<div class="number" id="pending">0</div></div>

<div class="card">APPROVED
<div class="number" id="approved">0</div></div>

<div class="card">REJECTED
<div class="number" id="rejected">0</div></div>
</div>

<h2>📋 REPORT REQUESTS</h2>
<div id="reports">Loading...</div>

<script>
async function updateStatus(id,status) {
  const response = await fetch(
    "/api/reports/" + encodeURIComponent(id),
    {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({status})
    }
  );

  if (!response.ok) {
    alert("Update failed");
    return;
  }

  load();
}

async function load() {
  const response = await fetch("/api/reports");

  if (!response.ok) return;

  const reports = await response.json();

  document.getElementById("total").textContent =
    reports.length;

  document.getElementById("pending").textContent =
    reports.filter(r=>r.status==="Pending review").length;

  document.getElementById("approved").textContent =
    reports.filter(r=>r.status==="Approved").length;

  document.getElementById("rejected").textContent =
    reports.filter(r=>r.status==="Rejected").length;

  const container = document.getElementById("reports");
  container.replaceChildren();

  reports.slice().reverse().forEach(r => {
    const card = document.createElement("div");
    card.className = "report";

    const title = document.createElement("h3");
    title.textContent = r.id;

    const phone = document.createElement("p");
    phone.textContent = "Number: " + r.targetNumber;

    const description = document.createElement("p");
    description.textContent = "Complaint: " + r.description;

    const status = document.createElement("p");
    status.textContent = "Status: " + r.status;

    const date = document.createElement("small");
    date.textContent = r.date;

    card.append(title,phone,description,status,date);

    if (r.status === "Pending review") {
      const approve = document.createElement("button");
      approve.className = "approve";
      approve.textContent = "Approve review";
      approve.onclick = () =>
        updateStatus(r.id,"Approved");

      const reject = document.createElement("button");
      reject.className = "reject";
      reject.textContent = "Reject";
      reject.onclick = () =>
        updateStatus(r.id,"Rejected");

      card.append(approve,reject);
    }

    container.append(card);
  });

  if (!reports.length) {
    container.textContent = "No requests yet.";
  }
}

load();
</script>
</body>
</html>
  `);
});

// DASHBOARD API
app.get("/api/reports", (req,res) => {
  res.json(loadReports());
});

app.post("/api/reports/:id", (req,res) => {
  const {status} = req.body;

  if (!["Approved","Rejected"].includes(status)) {
    return res.status(400).json({
      error:"Invalid status"
    });
  }

  const reports = loadReports();
  const report = reports.find(
    r => r.id === req.params.id
  );

  if (!report) return res.sendStatus(404);

  report.status = status;

  fs.writeFileSync(
    FILE,
    JSON.stringify(reports,null,2)
  );

  res.json({success:true});
});

// TELEGRAM BOT
const waiting = new Map();
let offset = 0;

async function handleMessage(msg) {
  if (!msg.text || !msg.chat || !msg.from) return;

  const chatId = msg.chat.id;
  const userId = String(msg.from.id);
  const text = msg.text.trim();
  const command = text.toLowerCase();

  if (command === "/start") {
    waiting.delete(userId);

    return reply(chatId,
      "👻 WELCOME TO SITANI BAN BOT\n\n" +
      "📋 /report - Submit a complaint\n" +
      "📊 /status - Check your requests\n" +
      "🆔 /id - Your Telegram ID\n" +
      "❓ /help - Help menu"
    );
  }

  if (command === "/help") {
    return reply(chatId,
      "👻 SITANI BAN BOT\n\n" +
      "/report - Submit a complaint\n" +
      "/status - Check request status\n" +
      "/cancel - Cancel submission"
    );
  }

  if (command === "/id") {
    return reply(chatId,
      "Your Telegram ID: " + userId
    );
  }

  if (command === "/report") {
    waiting.set(userId,{step:"number"});

    return reply(chatId,
      "📋 SITANI REPORT CENTER\n\n" +
      "Enter the WhatsApp number in international format.\n" +
      "Example: +256700000000\n\n" +
      "This creates a complaint for review only."
    );
  }

  if (command === "/cancel") {
    waiting.delete(userId);
    return reply(chatId,"Submission cancelled.");
  }

  if (command === "/status") {
    const reports = loadReports().filter(
      r => r.userId === userId
    );

    if (!reports.length) {
      return reply(chatId,"No submitted requests found.");
    }

    return reply(chatId,
      reports.map(r => r.id + " — " + r.status).join("\n")
    );
  }

  const session = waiting.get(userId);

  if (!session) {
    return reply(chatId,
      "Send /start to open SITANI BAN BOT."
    );
  }

  // CORRECT PHONE NUMBER VALIDATION
  if (session.step === "number") {

    const number = text.replace(/[\s()-]/g,"");

    if (!/^\+[1-9]\d{7,14}$/.test(number)) {
      return reply(chatId,
        "❌ Invalid number format.\n" +
        "Example: +256757805176\n" +
        "Please try again."
      );
    }

    session.number = number;
    session.step = "description";

    return reply(chatId,
      "✅ NUMBER ACCEPTED\n\n" +
      "Now describe the genuine abuse or problem.\n" +
      "False complaints are not allowed."
    );
  }

  // SAVE COMPLAINT
  if (session.step === "description") {

    const report = {
      id:"SIT-" + Date.now(),
      userId,
      targetNumber:session.number,
      description:text.slice(0,2000),
      status:"Pending review",
      date:new Date().toISOString()
    };

    saveReport(report);
    waiting.delete(userId);

    await reply(chatId,
      "✅ REQUEST RECEIVED\n\n" +
      "Reference: " + report.id +
      "\nStatus: Pending review"
    );

    if (ADMIN_ID !== "0") {
      await reply(ADMIN_ID,
        "📥 NEW SITANI REQUEST\n\n" +
        "Reference: " + report.id +
        "\nNumber: " + report.targetNumber +
        "\nStatus: Pending review"
      );
    }
  }
}

// START BOT
async function startBot() {
  const me = await telegram("getMe");

  console.log("👻 SITANI BAN BOT ONLINE");
  console.log("Bot: @" + me.username);

  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout:30,
        allowed_updates:["message"]
      });

      for (const update of updates) {
        offset = update.update_id + 1;

        if (update.message) {
          try {
            await handleMessage(update.message);
          } catch (error) {
            console.error(error.message);
          }
        }
      }

    } catch (error) {
      console.error("Telegram error:",error.message);

      await new Promise(resolve =>
        setTimeout(resolve,3000)
      );
    }
  }
}

app.listen(PORT,"0.0.0.0",() => {
  console.log("SITANI dashboard running on port " + PORT);
});

startBot().catch(console.error);
    
