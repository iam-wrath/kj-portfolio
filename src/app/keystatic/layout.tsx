import type { Metadata } from "next";
import { notFound } from "next/navigation";
import config from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Content admin", robots: { index: false, follow: false } };

export default function KeystaticLayout() {
  // Local (file-system) mode is development-only; production needs GitHub mode.
  if (config.storage.kind === "local" && process.env.NODE_ENV !== "development") notFound();
  return <KeystaticApp />;
}
