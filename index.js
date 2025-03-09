const express = require('express');
const cors = require('cors');
const userRoutes2 = require('./routes/userRoutes2');

const app = express();
// Configuration de CORS
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
// Middleware para parsear JSON
app.use(express.json());
// Rutas
app.use('/api/users2', userRoutes2);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servitor corridor en el puerto ${PORT}`);
});

