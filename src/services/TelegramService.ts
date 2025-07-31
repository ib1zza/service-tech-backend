import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import { AdminRepository } from "../repositories/AdminRepository";

dotenv.config();

export class TelegramService {
  private bot: TelegramBot;
  private clientRepo: ClientRepository;
  private adminRepo: AdminRepository;

  constructor(dataSource: DataSource) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");
    }

    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.clientRepo = new ClientRepository(dataSource);
    this.adminRepo = new AdminRepository(dataSource);
    this.setupBot();
  }

  private setupBot() {
    // Обработка команды /start с номером телефона
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;

      if (!match || !match[1]) {
        return this.bot.sendMessage(chatId, "❌ Некорректная ссылка");
      }
      const phone = match[1]; // Номер из ссылки t.me/bot?start=79123456789

      try {
        // Находим клиента по номеру телефона
        const client = await this.clientRepo.getClientByPhone(phone);
        const admin = await this.adminRepo.getAdminByPhone(phone);

        if (!client && !admin) {
          return this.bot.sendMessage(
            chatId,
            "❌ Клиент с таким номером телефона не найден"
          );
        }

        if (client) {
          // Обновляем telegram_id в базе данных
          await this.clientRepo.update(client.id, {
            telegram_id: chatId.toString(),
          });

          this.bot.sendMessage(
            chatId,
            "✅ Вы успешно привязали Telegram-аккаунт к вашему профилю!\n" +
              "Теперь вы будете получать уведомления здесь."
          );

          console.log(`Клиент ${phone} привязал Telegram: chatId=${chatId}`);
        }

        if (admin) {
          // Обновляем telegram_id в базе данных
          await this.adminRepo.update(admin.id, {
            telegram_id: chatId.toString(),
          });

          this.bot.sendMessage(
            chatId,
            "✅ Вы успешно привязали Telegram-аккаунт к вашему профилю!\n" +
              "Теперь вы будете получать уведомления здесь."
          );

          console.log(`Админ ${phone} привязал Telegram: chatId=${chatId}`);
        }
      } catch (error) {
        console.error("Ошибка при обработке /start:", error);
        this.bot.sendMessage(chatId, "⚠ Произошла ошибка, попробуйте позже");
      }
    });

    // Простое эхо для теста
    this.bot.on("message", (msg) => {
      if (!msg.text?.startsWith("/")) {
        this.bot.sendMessage(msg.chat.id, `Вы написали: "${msg.text}"`);
      }
    });
  }

  public async sendMessageToClient(
    phone: string,
    message: string
  ): Promise<boolean> {
    try {
      // Находим клиента по номеру телефона
      const client = await this.clientRepo.getClientByPhone(phone);

      if (!client || !client.telegram_id) {
        console.log(`Клиент ${phone} не привязал Telegram`);
        return false;
      }

      await this.bot.sendMessage(client.telegram_id, message);
      return true;
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      return false;
    }
  }

  public async sendMessageToAdmin(
    phone: string,
    message: string
  ): Promise<boolean> {
    try {
      // Находим админа по номеру телефона
      const admin = await this.adminRepo.getAdminByPhone(phone);

      if (!admin || !admin.telegram_id) {
        console.log(`Админ ${phone} не привязал Telegram`);
        return false;
      }

      await this.bot.sendMessage(admin.telegram_id, message);
      return true;
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      return false;
    }
  }
}
