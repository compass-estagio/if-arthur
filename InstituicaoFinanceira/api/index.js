// Este arquivo é o ponto de entrada para as funções serverless do Vercel
const app = require('./app.js');

// Para Vercel, precisamos exportar como uma função handler
module.exports = app;
