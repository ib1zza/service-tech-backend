import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import { serve, setup } from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Service Tech API',
            version: "1.0.0",
            description: 'API для системы управления заявками сервисного центра',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Укажите путь к вашим роутам
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', serve, setup(swaggerSpec));
};
