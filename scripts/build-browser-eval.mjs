import fs from "node:fs";

const session = fs.readFileSync(".tmp-session.json", "utf8");
const expr = `sessionStorage.setItem(${JSON.stringify(
  "sb-siaktnkaavgefjxgprrf-auth-token"
)}, ${JSON.stringify(session)}); location.href = ${JSON.stringify("/admin/")};`;
fs.writeFileSync(".tmp-browser-eval.js", expr);
console.log("ready", expr.length);
