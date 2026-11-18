import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('.', import.meta.url));

export default {
  output: 'export',
  trailingSlash: true,
  poweredByHeader: false,
  devIndicators: false,
  images: { unoptimized: true },
  outputFileTracingRoot: source,
  turbopack: { root: source },
  // The build is public and contains no secrets; a content-derived ID also
  // lets an identical checkout reproduce the same static export.
  generateBuildId: async () => process.env.CLEARSIGN_BUILD_ID || null,
};
