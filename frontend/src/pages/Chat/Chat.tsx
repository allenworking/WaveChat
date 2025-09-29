import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input, Button, List, Typography, Space, Select } from 'antd';
import { Socket } from 'socket.io-client';

const { Title } = Typography;

type Message = {
  from: string; // user ID
  text: string;
};

type User = {
  id: string;
  username: string;
};

export default function Chat({ socket }: { socket: Socket }) {
  const { username } = useParams(); // current username
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>(''); // username

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Listen for user list updates and incoming messages
  useEffect(() => {
    socket.on('users:list', (list: User[]) => {
      setUsers(list.filter((u) => u.username !== username));

      // Set current user ID
      const me = list.find((u) => u.username === username);
      if (me) setCurrentUserId(me.id);
    });

    socket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Request current user list
    socket.emit('users:get');

    return () => {
      socket.off('users:list');
      socket.off('message');
    };
  }, [socket, username]);

  // Load chat history when selecting a user
  useEffect(() => {
    if (!currentUserId || !selectedUsername) return;

    const targetUser = users.find((u) => u.username === selectedUsername);
    if (!targetUser) return;

    socket.emit('messages:get', { from: currentUserId, to: targetUser.id }, (chatHistory: Message[]) => {
      setMessages(chatHistory);
    });
  }, [selectedUsername, currentUserId, users, socket]);

  const sendMessage = () => {
    if (!input.trim()) {
      alert('Content cannot be empty!');
      return;
    }

    if (!selectedUsername) {
      alert('Select a target user');
      return;
    }

    if (!currentUserId) return;

    const target = users.find((u) => u.username === selectedUsername);
    if (!target) return;

    socket.emit('message', { to: target.id, text: input }, (res: { success: boolean }) => {
      if (!res.success) alert('Message failed to send');
    });

    setInput('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Chat as {username}</Title>

      <Select
        style={{ width: '100%', marginBottom: 16 }}
        placeholder="Select a user to chat"
        value={selectedUsername}
        onChange={(value) => setSelectedUsername(value)}
      >
        {users.map((user) => (
          <Select.Option key={user.id} value={user.username}>
            {user.username}
          </Select.Option>
        ))}
      </Select>

      <List
        dataSource={messages}
        style={{ marginBottom: 16, height: 400, overflowY: 'auto' }}
        renderItem={(item) => {
          const isMe = item.from === currentUserId;
          return (
            <List.Item style={{ border: 'none', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: isMe ? '#1677ff' : '#f0f0f0',
                  color: isMe ? 'white' : 'black',
                  textAlign: isMe ? 'right' : 'left'
                }}
              >
                {!isMe && <strong>{selectedUsername}: </strong>}
                {item.text}
              </div>
            </List.Item>
          );
        }}
      />

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="Type a message..."
        />
        <Button type="primary" onClick={sendMessage}>
          Send
        </Button>
      </Space.Compact>

      <Button style={{ marginTop: 16 }} onClick={() => navigate('/')}>
        Exit Chat
      </Button>
    </div>
  );
}
