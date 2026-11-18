import type { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Content admin", robots: { index: false, follow: false } };

export default function KeystaticLayout() {
  // Local (file-system) mode is development-only; production needs GitHub mode with the
  // GitHub App credentials in place (see README → Environment variables).
  const prod = process.env.NODE_ENV !== "development";
  const githubReady = Boolean(
    process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET
  );
  if (prod && (config.storage.kind === "local" || !githubReady)) notFound();
  return <KeystaticApp />;
}
