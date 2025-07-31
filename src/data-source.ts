import "reflect-metadata"; // Необходим для работы TypeORM с декораторами (например, @Entity, @Column)
import { DataSource } from "typeorm"; // Импортируем класс DataSource из TypeORM
import dotenv from "dotenv"; // Импортируем библиотеку dotenv для загрузки переменных окружения из файла .env

dotenv.config(); // Загружаем переменные окружения из файла .env в process.env

// Создаем и экспортируем экземпляр DataSource, который будет использоваться для подключения к базе данных
export const AppDataSource = new DataSource({
  type: "postgres", // Указываем тип базы данных - PostgreSQL
  host: process.env.DB_HOST, // Хост базы данных, берется из переменной окружения DB_HOST
  port: parseInt(process.env.DB_PORT || "5432"), // Порт базы данных, берется из DB_PORT. Если не указан, по умолчанию 5432. Преобразуется в число.
  username: process.env.DB_USER, // Имя пользователя для подключения к базе данных, берется из DB_USER
  password: process.env.DB_PASSWORD, // Пароль для подключения к базе данных, берется из DB_PASSWORD
  database: process.env.DB_NAME, // Имя базы данных, берется из DB_NAME
  synchronize: true, // Автоматически синхронизировать схему базы данных с сущностями.
  // ВНИМАНИЕ: Для продакшн-среды это должно быть 'false', и вместо этого используются миграции для управления изменениями схемы.
  logging: true, // Включает логирование SQL-запросов и других операций TypeORM в консоль
  entities: ["src/entities/*.ts"], // Пути к файлам сущностей (моделей), которые TypeORM будет использовать для создания таблиц
  migrations: ["src/migrations/*.ts"], // Пути к файлам миграций, которые используются для управления изменениями схемы базы данных
  subscribers: [], // Пути к файлам подписчиков, которые позволяют реагировать на события базы данных (например, до или после сохранения сущности)
});
