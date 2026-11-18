import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const handlers = makeRouteHandler({ config });

/**
 * Local mode writes straight to disk with no login, so it must only ever run in development.
 * In production the admin requires GitHub mode (NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO + GitHub App secrets).
 */
const blocked = config.storage.kind === "local" && process.env.NODE_ENV !== "development";
const notFound = () => new Response("Not Found", { status: 404 });

export const GET = blocked ? notFound : handlers.GET;
export const POST = blocked ? notFound : handlers.POST;
