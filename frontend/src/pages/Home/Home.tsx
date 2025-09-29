import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input, Button, Typography, Space, Card } from 'antd';
import { Socket } from 'socket.io-client';

const { Title } = Typography;

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: { id: string; username: string };
};

export default function Home({ socket }: { socket: Socket }) {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username.trim()) return;

    socket.emit('login', username, (response: LoginResponse) => {
      if (response.success) {
        navigate(`/chat/${username}`);
      } else {
        alert(response.message || 'Login failed');
      }
    });
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Card style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={3}>Welcome to Wave Chat</Title>
          <Input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button type="primary" block onClick={handleJoin}>
            Join Chat
          </Button>
        </Space>
      </Card>
    </div>
  );
}
