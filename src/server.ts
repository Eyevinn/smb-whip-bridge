import { WhipEndpoint } from '@eyevinn/whip-endpoint';

if (!process.env.SMB_URL) {
  throw new Error('SMB_URL environment variable is required');
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

const server = new WhipEndpoint({
  port: PORT,
  enabledWrtcPlugins: ['sfu-broadcaster']
});
server.setOriginSfuUrl(
  new URL('/conferences/', process.env.SMB_URL).toString()
);
if (process.env.SMB_API_KEY) {
  server.setSfuApiKey(process.env.SMB_API_KEY);
}

server.listen();

export default server;
