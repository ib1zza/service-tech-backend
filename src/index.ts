import "reflect-metadata"; // Необходим для работы TypeORM с декораторами (например, @Entity, @Column)
import express from "express"; // Импортируем фреймворк Express для создания веб-сервера
import cors from "cors"; // Импортируем middleware CORS для обработки запросов из разных доменов
import dotenv from "dotenv"; // Импортируем библиотеку dotenv для загрузки переменных окружения
import { DataSource } from "typeorm"; // Импортируем класс DataSource из TypeORM
import { AppDataSource } from "./data-source"; // Импортируем настроенный экземпляр DataSource для подключения к БД

// Импортируем все сервисы, которые будут использоваться в приложении
import { AuthService } from "./services/AuthService";
import { AdminService } from "./services/AdminService";
import { ClientService } from "./services/ClientService";
import { StaffService } from "./services/StaffService";
import { AppealService } from "./services/AppealService";
import { POinfoService } from "./services/POinfoService";
import { TelegramService } from "./services/TelegramService";

// Импортируем все роутеры для обработки HTTP-запросов
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { clientRouter } from "./routes/client.routes";
import { staffRouter } from "./routes/staff.routes";
import { appealRouter } from "./routes/appeal.routes";
import { infoRouter } from "./routes/info.routes";

// Импортируем библиотеки для Swagger UI (документации API)
import swaggerUi from "swagger-ui-express";
import { setupSwagger } from "./swagger";

dotenv.config(); // Загружаем переменные окружения из файла .env в process.env

const app = express(); // Создаем экземпляр Express приложения
const PORT = process.env.PORT || 5000; // Определяем порт, на котором будет работать сервер (по умолчанию 5000)

// Middleware - промежуточное ПО для обработки запросов
app.use(cors()); // Включаем CORS для разрешения кросс-доменных запросов
app.use(express.json()); // Включаем парсер JSON для обработки входящих запросов с JSON-телами

/**
 * Инициализирует все сервисы приложения, передавая им необходимый DataSource
 * и другие зависимости (например, TelegramService для ClientService и AppealService).
 * Это пример паттерна Inversion of Control (IoC) или Dependency Injection (DI).
 * @param dataSource Экземпляр TypeORM DataSource для работы с базой данных.
 * @returns Объект со всеми инициализированными сервисами.
 */
const initServices = (dataSource: DataSource) => {
  // Инициализируем TelegramService первым, так как он является зависимостью для других сервисов
  const telegramService = new TelegramService(dataSource);
  const authService = new AuthService(dataSource);
  const adminService = new AdminService(dataSource);
  // ClientService зависит от TelegramService для отправки уведомлений
  const clientService = new ClientService(dataSource, telegramService);
  const staffService = new StaffService(dataSource);
  // AppealService также зависит от TelegramService
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

/**
 * Настраивает роуты приложения, связывая их с соответствующими сервисами.
 * Каждый роутер получает свой сервис в качестве зависимости.
 * @param services Объект, содержащий все инициализированные сервисы.
 */
const setupRoutes = (services: ReturnType<typeof initServices>) => {
  // Подключаем роутеры к приложению по определенным базовым путям
  app.use("/api/auth", authRouter(services.authService));
  app.use("/api/admin", adminRouter(services.adminService));
  app.use("/api/clients", clientRouter(services.clientService));
  app.use("/api/staff", staffRouter(services.staffService));
  app.use("/api/appeals", appealRouter(services.appealService));
  app.use("/api/info", infoRouter(services.poinfoService));
};

// Настраиваем Swagger для автоматической генерации и отображения документации API
setupSwagger(app);

/**
 * Асинхронная функция для запуска всего приложения.
 * Включает инициализацию базы данных, сервисов, роутов и запуск сервера.
 */
const startApp = async () => {
  try {
    // Инициализируем соединение с базой данных через TypeORM DataSource
    await AppDataSource.initialize();
    console.log("Database connected!"); // Логируем успешное подключение к БД

    // Инициализируем все сервисы
    const services = initServices(AppDataSource);
    // Настраиваем все роуты, используя инициализированные сервисы
    setupRoutes(services);

    // Запускаем Express сервер на указанном порту
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`); // Логируем адрес сервера
      console.log(`API docs available on http://localhost:${PORT}/api-docs`); // Логируем адрес документации API
    });
  } catch (error) {
    // Обработка ошибок, если запуск приложения не удался (например, проблемы с БД)
    console.error("Application startup failed:", error);
    process.exit(1); // Завершаем процесс с кодом ошибки
  }
};

// Вызываем функцию для запуска приложения
startApp();

// Обработка сигнала SIGINT (например, Ctrl+C) для корректного завершения работы приложения
process.on("SIGINT", async () => {
  // Закрываем соединение с базой данных перед завершением процесса
  await AppDataSource.destroy();
  console.log("Database connection closed.");
  process.exit(0); // Завершаем процесс без ошибок
});
