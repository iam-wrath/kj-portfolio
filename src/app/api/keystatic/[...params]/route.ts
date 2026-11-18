import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

/**
 * Keystatic admin API.
 *
 * - Local mode writes straight to disk with no login, so it only ever runs in development.
 * - GitHub mode needs the GitHub App credentials. If they're missing in production we answer
 *   503 instead of letting Keystatic throw, which would otherwise fail the whole build/deploy.
 *   (In development the route still loads without them so Keystatic can run its app-setup flow.)
 */
const isDev = process.env.NODE_ENV === "development";
const missingGithubSecrets =
  config.storage.kind === "github" &&
  !(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET);

type Handler = (req: Request) => Promise<Response> | Response;
let GET: Handler;
let POST: Handler;

if (config.storage.kind === "local" && !isDev) {
  const notFound = () => new Response("Not Found", { status: 404 });
  GET = notFound;
  POST = notFound;
} else if (missingGithubSecrets && !isDev) {
  const notConfigured = () =>
    new Response("Admin not configured yet: add the Keystatic GitHub App environment variables.", { status: 503 });
  GET = notConfigured;
  POST = notConfigured;
} else {
  ({ GET, POST } = makeRouteHandler({ config }));
}

export { GET, POST };
