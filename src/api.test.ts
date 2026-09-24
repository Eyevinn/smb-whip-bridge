import api from './api';

describe('healthcheck api', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns 200 when SMB is reachable', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(new Response('[]', { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const server = api({
      title: 'my awesome service',
      sfuUrl: 'http://smb.example/conferences/',
      sfuApiKey: 'secret-key'
    });
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('OK');

    // Verify we probed the derived SFU URL with the SMB auth headers.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe('http://smb.example/conferences/');
    expect(calledInit.headers).toMatchObject({
      'X-APIkey': 'secret-key',
      Authorization: 'Bearer secret-key'
    });
    expect(calledInit.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns 503 with a reason when SMB is unreachable', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('ECONNREFUSED')) as unknown as typeof fetch;

    const server = api({
      title: 'my awesome service',
      sfuUrl: 'http://smb.example/conferences/'
    });
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(503);
    expect(response.body).toContain('SMB connectivity check failed');
    expect(response.body).toContain('ECONNREFUSED');
  });

  it('returns 503 when SMB responds with a non-2xx status', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response('nope', { status: 500 })
      ) as unknown as typeof fetch;

    const server = api({
      title: 'my awesome service',
      sfuUrl: 'http://smb.example/conferences/'
    });
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(503);
    expect(response.body).toContain('HTTP 500');
  });
});
