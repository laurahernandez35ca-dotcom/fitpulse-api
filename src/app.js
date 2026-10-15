const express = require('express');
const cors = require('cors');
const clasesRoutes = require('./routes/clases.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const authRoutes = require('./routes/auth.routes');
const paquetesRoutes = require('./routes/paquetes.routes');
const reservasRoutes = require('./routes/reservas.routes');
const comprasRoutes = require('./routes/compras.routes');
const ventasRoutes = require('./routes/ventas.routes');
const resenasRoutes = require('./routes/resenas.routes');
const etiquetasRoutes = require('./routes/etiquetas.routes');
const anidadasRoutes = require('./routes/anidadas.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ mensaje: 'API FitPulse funcionando' }));
app.use('/clases', clasesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/auth', authRoutes);
app.use('/paquetes', paquetesRoutes);
app.use('/reservations', reservasRoutes);
app.use('/purchases', comprasRoutes);
app.use('/sales', ventasRoutes);
app.use('/reviews', resenasRoutes);
app.use('/tags', etiquetasRoutes);
app.use('/', anidadasRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
  }
  next(err);
});

module.exports = app;