import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load biến môi trường từ .env
dotenv.config();

const app = express();
const port = 3000;

// Bật CORS để tránh lỗi từ frontend
app.use(cors());
app.use(express.json());

// Kiểm tra API Key có tải từ .env không
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
        if (!text) return res.status(400).json({ error: "Vui lòng nhập văn bản!" });

        console.log("Nhận văn bản:", text);
        console.log("Giọng đọc:", voice || "alloy");

        // Gửi yêu cầu TTS đến OpenAI API
        const response = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: voice || "alloy",
            response_format: "mp3",
        });

        // Đọc dữ liệu âm thanh từ phản hồi
        const audioBuffer = Buffer.from(await response.arrayBuffer());

        // Gửi dữ liệu MP3 về client
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", audioBuffer.length);
        res.send(audioBuffer);

    } catch (error) {
        console.error(" Lỗi khi gọi OpenAI API:", error);

        // Kiểm tra lỗi API Key sai
        if (error.code === "invalid_api_key") {
            return res.status(401).json({ error: "API Key không hợp lệ!" });
        }

        res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
    }
});

// Lắng nghe yêu cầu ở cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
    console.log("API Key từ .env:", process.env.OPENAI_API_KEY ? "Đã tải" : " Chưa tải");
});
