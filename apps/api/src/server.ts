import fastify from './app.js';
import { config } from './config/index.js';

const start = async () => {
  try {
    await fastify.listen({ port: config.apiPort, host: '0.0.0.0' });
    console.log(`API server running on http://localhost:${config.apiPort}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
