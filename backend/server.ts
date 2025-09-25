import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';

import CONFIG from './config';

const app = express();
const router = express.Router();

const httpServer = http.createServer(http);
const io = new IOServer(httpServer);

app.use(router);
app.use(cors({ origin: '*' }));

io.on('connection', (socket) => {});

httpServer.listen(CONFIG.PORT, () => {
  console.log(`Server listening on *:${CONFIG.PORT} 🚀`);
});
