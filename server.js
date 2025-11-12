import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js"

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://health-up-weld.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
