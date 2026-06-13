const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const fs = require("fs");
const http = require("http");
//const open = require("open").default;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "10mb" })); // allow up to 10 MB

// Increase limit for URL-encoded forms
app.use(express.urlencoded({ limit: "10mb", extended: true }));
const { db } = require("./config/db");

const PORT = process.env.PORT || 8001;

const checkDbConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log(
      `MySQL connected → ${process.env.DB_HOST}:${process.env.DB_PORT}`,
    );
    connection.release();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  }
};


function serveOffline() {
  const offlineContent = "<h1>Server is offline</h1>";
  fs.writeFileSync("offline.html", offlineContent);

  // Use a minimal static server to serve the file

  http
    .createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(offlineContent);
    })
    .listen(5000, () => {
      console.log(`Offline page served on port ${PORT}`);
    });
}


app.get("/", (req, res) => res.send("<h1>Server is running!</h1>"));

try {
  const server = app.listen(PORT, async () => {
    try {
      await checkDbConnection(); // now it exists
      console.log(`Server running on port ${PORT}`);
      //open(`http://localhost:${PORT}`);
    } catch (err) {
      console.error("Error during startup:", err.message);
    }
  });

  server.on("error", (err) => {
    console.error("Server failed:", err.message);
    serveOffline(); // fallback
  });
} catch (err) {
  console.error("Unexpected error:", err);
  serveOffline(); // fallback
}

const school_account = require("./routes/school_account.routes");

app.use("/api", school_account);
