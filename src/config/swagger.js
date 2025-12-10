import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Tournois E-sport',
            version: '1.0.0',
            description: 'API de gestion de tournois, équipes et inscriptions e-sport.',
            contact: {
                name: 'Support API',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Serveur de développement',
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

