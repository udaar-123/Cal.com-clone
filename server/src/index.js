import app from "./app.js";

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
