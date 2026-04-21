const swaggerJSDoc = require("swagger-jsdoc");

const definition = {
  openapi: "3.0.0",
  info: {
    title: "Office Task Manager API",
    version: "1.0.0",
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "jwt",
      },
    },
  },
  security: [{ cookieAuth: [] }],
};

const options = {
  definition,
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };

