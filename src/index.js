import express from 'express'
import { apiReference } from '@scalar/express-api-reference'
import {PORT}  from './config.js'
import userRoutes from './routes/user.routes.js'
import { openapiSpec } from './openapi.js'

const app = express();
app.use(express.json());

app.get('/openapi.json', (req, res) => res.json(openapiSpec));

//si ingresa a http://localhost:4000/ redirecciona a scalar (opcional no es necesario instalar lo)
app.get('/', (req, res) => res.redirect('/docs')); 
app.use('/docs', apiReference({ spec: { url: '/openapi.json' } }));

app.use(userRoutes);
app.listen(PORT);
console.log('server on port', PORT);