import cors from "cors";
import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";

dotenv.config(); // Load biến môi trường từ .env

console.log("API Key from .env:", process.env.OPENAI_API_KEY); // Debug API Key

const app = express();
const port = 3000;

// Bật CORS để tránh lỗi từ frontend
app.use(cors());
app.use(express.json());

// Kiểm tra API Key trước khi khởi tạo OpenAI
if (!process.env.OPENAI_API_KEY) {
    console.error("LỖI: API Key không được tìm thấy trong .env!");
    process.exit(1); // Dừng server nếu không có API Key
}

// Khởi tạo OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/tts", async (req, res) => {
    try {
        const { text, voice } = req.body;
        console.log("Received text:", text);
        console.log("Voice:", voice || "alloy");

        // Gửi yêu cầu TTS đến OpenAI API
        const response = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: voice || "alloy",
            response_format: "mp3", // Đảm bảo phản hồi là file MP3
        });

        // Đọc dữ liệu âm thanh từ phản hồi
        const audioBuffer = Buffer.from(await response.arrayBuffer());

        // Gửi dữ liệu MP3 về client
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", audioBuffer.length);
        res.send(audioBuffer);
    } catch (error) {
        console.error("Error during OpenAI request:", error);
        res.status(500).json({ error: error.message });
    }
});

// Lắng nghe yêu cầu ở cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
