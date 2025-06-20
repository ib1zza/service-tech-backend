import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

export const sendTelegramNotification = async (message: string, chatId?: string) => {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;

    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    const targetChatId = chatId || process.env.TELEGRAM_SERVICE_CHAT_ID;

    if (!targetChatId) return;

    try {
        await bot.sendMessage(targetChatId, message);
    } catch (error) {
        console.error("Telegram notification error:", error);
    }
};
