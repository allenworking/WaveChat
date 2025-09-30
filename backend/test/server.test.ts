import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set up mocks BEFORE importing server.ts so the real modules are never used
vi.mock('ioredis', () => {
  // simple in-memory mock for the Redis client methods used by server.ts
  const hvals = vi.fn().mockResolvedValue([]);
  const hset = vi.fn().mockResolvedValue(1);
  const rpush = vi.fn().mockResolvedValue(1);
  const lrange = vi.fn().mockResolvedValue([]);
  return {
    default: vi.fn().mockImplementation(() => ({ hvals, hset, rpush, lrange })),
    __mock: { hvals, hset, rpush, lrange }
  };
});

vi.mock('socket.io', () => {
  let lastServer: any = null;
  const Server = vi.fn(function (this: any, server: any, opts: any) {
    lastServer = this;
    this.on = vi.fn();
    this.emit = vi.fn();
    this.to = vi.fn(() => ({ emit: vi.fn() }));
  });
  return {
    Server,
    __getLastServer: () => lastServer
  };
});

vi.mock('http', () => {
  const listen = vi.fn((port: any, cb?: () => void) => {
    // invoke callback immediately to simulate server.listen completing
    if (cb) cb();
    return { close: vi.fn((cb2?: () => void) => cb2 && cb2()) };
  });
  const createServer = vi.fn(() => ({ listen }));
  const mockModule = { createServer, __listen: listen, __createServer: createServer };
  return { default: mockModule, ...mockModule };
});

describe('backend/server (unit)', () => {
  beforeEach(() => {
    // reset modules so mocks are fresh per test
    vi.resetModules();
  });

  it('initializes http server and socket.io without starting external services', async () => {
    // Import after mocks are registered
    await import('../server');

    const httpMock: any = await import('http');
    const ioMock: any = await import('socket.io');

    // http.createServer should have been called to create the server object
    expect(httpMock.__createServer).toBeDefined();
    expect(httpMock.__createServer).toHaveBeenCalled();

    // socket.io Server ctor should have been called with the (mocked) server
    expect(ioMock.Server).toHaveBeenCalled();
    const last = ioMock.__getLastServer();
    expect(last).toBeDefined();
    // ensure the socket server registered a 'connection' handler
    expect(last.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });
});
