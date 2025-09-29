import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

const redis = new Redis();

const PORT = process.env.PORT || 3001;

// Interfaces
interface User {
  id: string; // persistent ID
  username: string; // unique
  socketId?: string; // current connection
}

interface Message {
  from: string; // user ID
  to: string; // user ID
  text: string;
  timestamp?: number;
}

// Redis keys
const USERS_KEY = 'chat:users'; // hash: userId => JSON(User)
const MESSAGES_KEY = 'chat:messages'; // list

// Utility: get users
const getUsers = async (): Promise<User[]> => {
  const rawUsers = await redis.hvals(USERS_KEY);
  return rawUsers.map((u) => JSON.parse(u));
};

// Utility: save user
const saveUser = async (user: User) => {
  await redis.hset(USERS_KEY, user.id, JSON.stringify(user));
};

// Utility: add message
const addMessage = async (message: Message) => {
  message.timestamp = Date.now();
  await redis.rpush(MESSAGES_KEY, JSON.stringify(message));
};

// Utility: get messages between two users
const getMessages = async (from: string, to: string): Promise<Message[]> => {
  const rawMessages = await redis.lrange(MESSAGES_KEY, 0, -1);
  const messages: Message[] = rawMessages.map((m) => JSON.parse(m));
  return messages
    .filter((m) => (m.from === from && m.to === to) || (m.from === to && m.to === from))
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
};

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Login handler
  socket.on('login', async (username: string, callback) => {
    // Try to find user by username
    const rawUsers = await redis.hvals(USERS_KEY);
    let user: User | null = null;

    for (const raw of rawUsers) {
      const parsed: User = JSON.parse(raw);
      if (parsed.username === username) {
        user = parsed;
        break;
      }
    }

    if (!user) {
      // New user
      user = { id: uuidv4(), username };
      console.log(`New user registered: ${username}`);
    }

    // Update current socketId for this session
    user.socketId = socket.id;
    await saveUser(user);

    // Broadcast online users
    const usersList = await getUsers();
    io.emit('users:list', usersList);

    callback({ success: true, user });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    const users = await getUsers();
    const index = users.findIndex((u) => u.socketId === socket.id);
    if (index !== -1) {
      users[index].socketId = undefined; // remove session
      await saveUser(users[index]);
      console.log(`User ${users[index].username} disconnected`);
      io.emit('users:list', users);
    }
  });

  // Get users
  socket.on('users:get', async () => {
    const users = await getUsers();
    socket.emit('users:list', users);
  });

  // Message handler
  socket.on('message', async ({ to, text }, callback) => {
    const users = await getUsers();
    const fromUser = users.find((u) => u.socketId === socket.id);
    if (!fromUser) return callback({ success: false });

    const message: Message = { from: fromUser.id, to, text, timestamp: Date.now() };
    await addMessage(message);

    // Send to target socket if online
    const toUser = users.find((u) => u.id === to && u.socketId);
    if (toUser) {
      io.to(toUser.socketId!).emit('message', message);
    }
    socket.emit('message', message); // echo to sender
    callback({ success: true });
  });

  // Get chat history
  socket.on('messages:get', async ({ from, to }, callback) => {
    const messages = await getMessages(from, to);
    callback(messages);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
