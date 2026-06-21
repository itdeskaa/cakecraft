// Production server for Next.js — works with Hostinger's "Setup Node.js App"
// (Passenger/LiteSpeed) which runs a startup file and provides PORT.
//
// In hPanel → Node.js app, set the "Application startup file" to: server.js
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`✓ CakeCraft running on port ${port}`);
  });
});
