import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";
import { AuthService } from "./services/AuthService";
import { AdminService } from "./services/AdminService";
import { ClientService } from "./services/ClientService";
import { StaffService } from "./services/StaffService";
import { AppealService } from "./services/AppealService";
import { POinfoService } from "./services/POinfoService";
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { clientRouter } from "./routes/client.routes";
import { staffRouter } from "./routes/staff.routes";
import { appealRouter } from "./routes/appeal.routes";
import { infoRouter } from "./routes/info.routes";
import swaggerUi from "swagger-ui-express";
import { setupSwagger } from "./swagger";
import { TelegramService } from "./services/TelegramService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация сервисов
const initServices = (dataSource: DataSource) => {
  const telegramService = new TelegramService(dataSource);
  const authService = new AuthService(dataSource);
  const adminService = new AdminService(dataSource);
  const clientService = new ClientService(dataSource, telegramService);
  const staffService = new StaffService(dataSource);
  const appealService = new AppealService(dataSource, telegramService);
  const poinfoService = new POinfoService(dataSource);

  return {
    authService,
    adminService,
    clientService,
    staffService,
    appealService,
    poinfoService,
    telegramService,
  };
};

// Подключение роутов
const setupRoutes = (services: ReturnType<typeof initServices>) => {
  app.use("/api/auth", authRouter(services.authService));
  app.use("/api/admin", adminRouter(services.adminService));
  app.use("/api/clients", clientRouter(services.clientService));
  app.use("/api/staff", staffRouter(services.staffService));
  app.use("/api/appeals", appealRouter(services.appealService));
  app.use("/api/info", infoRouter(services.poinfoService));
};

setupSwagger(app);

// Запуск приложения
const startApp = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected!");

    const services = initServices(AppDataSource);
    setupRoutes(services);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API docs available on http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

// Запускаем приложение
startApp();

// Обработка завершения работы
process.on("SIGINT", async () => {
  await AppDataSource.destroy();
  process.exit(0);
});
