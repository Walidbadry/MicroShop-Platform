const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

app.use("/api/users", createProxyMiddleware({
  target: "http://users:3001",
  changeOrigin: true,
  pathRewrite: { "^/api/users": "" }
}));
app.use("/api/orders", createProxyMiddleware({
  target: "http://orders:3003",
  changeOrigin: true,
  pathRewrite: { "^/api/orders": "" }
}));

app.listen(8080, () => console.log("Gateway running on 8080"));
