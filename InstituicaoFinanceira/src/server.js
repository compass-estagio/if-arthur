const app = require('./app');

const PORT = process.env.PORT || 3000;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Para Vercel (serverless functions)
module.exports = app;
