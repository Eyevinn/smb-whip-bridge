module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // fastify 5's `inject` reaches ESM-only packages (cookie, set-cookie-parser)
  // through light-my-request. jest runs under CommonJS, so let ts-jest
  // transpile those packages instead of ignoring them with the rest of
  // node_modules.
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(cookie|set-cookie-parser)/)']
};
