import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router';
import { io } from 'socket.io-client';

import config from '../config';

// Routes
import Chat from './Chat';
import Home from './Home';

const socket = io(config.SOCKET_ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });

export default function Routes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<Home socket={socket} />} />
        <Route path="/chat/:userId" element={<Chat socket={socket} />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}
