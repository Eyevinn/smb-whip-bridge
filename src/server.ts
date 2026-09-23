import { BroadcasterClient, WhipEndpoint } from '@eyevinn/whip-endpoint';
import createApi from './api';

if (!process.env.SMB_URL) {
  throw new Error('SMB_URL environment variable is required');
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;
// The WhipEndpoint keeps its Fastify instance private and exposes no way to
// register extra routes, so the healthcheck app is mounted on its own port.
const HEALTHCHECK_PORT = process.env.HEALTHCHECK_PORT
  ? Number(process.env.HEALTHCHECK_PORT)
  : 8081;

const server = new WhipEndpoint({
  port: PORT,
  enabledWrtcPlugins: ['sfu-broadcaster']
});
const sfuUrl = new URL('/conferences/', process.env.SMB_URL);
server.setOriginSfuUrl(sfuUrl.toString());
if (process.env.SMB_API_KEY) {
  server.setSfuApiKey(process.env.SMB_API_KEY);
}
if (process.env.WHEP_ENDPOINT_URL) {
  const whepChannelApiUrl = new URL('/api', process.env.WHEP_ENDPOINT_URL);
  const whepClient = new BroadcasterClient(whepChannelApiUrl.toString());
  server.registerBroadcasterClient({
    client: whepClient,
    sfuUrl: sfuUrl.toString()
  });
}

server.listen();

const healthApp = createApi({ title: 'smb-whip-bridge' });
healthApp.listen({ port: HEALTHCHECK_PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    healthApp.log.error(err);
    process.exit(1);
  }
});

export default server;
export { healthApp };
