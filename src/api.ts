import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { FastifyPluginCallback } from 'fastify';

const HealthStatus = Type.String({
  description: 'Health status of the SMB connectivity check'
});

// How long to wait for the SMB REST API before treating the probe as failed,
// so an unreachable SFU never hangs the healthcheck.
const SMB_HEALTHCHECK_TIMEOUT_MS = 2000;

export interface HealthcheckOptions {
  title: string;
  // Base URL of the SMB conferences REST endpoint (the derived `sfuUrl`),
  // threaded in from server.ts rather than re-read from the environment here.
  sfuUrl: string;
  sfuApiKey?: string;
}

const healthcheck: FastifyPluginCallback<HealthcheckOptions> = (
  fastify,
  opts,
  next
) => {
  fastify.get<{ Reply: Static<typeof HealthStatus> }>(
    '/',
    {
      schema: {
        description: 'Verify Symphony Media Bridge connectivity',
        response: {
          200: HealthStatus,
          503: HealthStatus
        }
      }
    },
    async (_, reply) => {
      // Mirror the header shape the whip-endpoint SMB client uses when calling
      // the SFU: an `X-APIkey` header plus a `Bearer` Authorization header when
      // an API key is configured.
      const headers: Record<string, string> = {};
      if (opts.sfuApiKey) {
        headers['X-APIkey'] = opts.sfuApiKey;
        headers['Authorization'] = `Bearer ${opts.sfuApiKey}`;
      }

      try {
        const response = await fetch(opts.sfuUrl, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(SMB_HEALTHCHECK_TIMEOUT_MS)
        });

        if (!response.ok) {
          reply
            .code(503)
            .send(`SMB connectivity check failed: HTTP ${response.status}`);
          return;
        }

        reply.code(200).send(`OK: ${opts.title} can reach SMB`);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        reply.code(503).send(`SMB connectivity check failed: ${reason}`);
      }
    }
  );
  next();
};

export interface ApiOptions {
  title: string;
  sfuUrl: string;
  sfuApiKey?: string;
}

export default (opts: ApiOptions) => {
  const api = fastify({
    ignoreTrailingSlash: true
  }).withTypeProvider<TypeBoxTypeProvider>();

  // register the cors plugin, configure it for better security
  api.register(cors);

  // register the swagger plugins, it will automagically do magic
  api.register(swagger, {
    swagger: {
      info: {
        title: opts.title,
        description: 'hello',
        version: 'v1'
      }
    }
  });
  api.register(swaggerUI, {
    routePrefix: '/docs'
  });

  api.register(healthcheck, {
    title: opts.title,
    sfuUrl: opts.sfuUrl,
    sfuApiKey: opts.sfuApiKey
  });
  // register other API routes here

  return api;
};
