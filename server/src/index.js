import app from "./app.js";

const port = process.env.PORT || 4000;
const host = "0.0.0.0";

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(port, host, () => {
  console.log(`🚀 Server ready on ${host}:${port}`);
});
