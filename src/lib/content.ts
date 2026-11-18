import "server-only";
import path from "node:path";
import sharp from "sharp";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig, { PHOTO_ALBUMS, PROJECT_TAGS, VIDEO_CATEGORIES } from "../../keystatic.config";
import { parseVideoUrl } from "./video";

const reader = createReader(process.cwd(), keystaticConfig);

const byDateDesc = (a?: string | null, b?: string | null) => (b ?? "").localeCompare(a ?? "");

export const getSite = cache(async () => {
  const site = await reader.singletons.site.readOrThrow();
  const whatsappLink = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, "")}` : null;
  return { ...site, whatsappLink };
});

export const getHome = cache(() => reader.singletons.home.readOrThrow());
export const getAbout = cache(() => reader.singletons.about.readOrThrow());
export const getCyber = cache(() => reader.singletons.cyber.readOrThrow());
export const getServices = cache(() => reader.singletons.services.readOrThrow());

export type Video = Awaited<ReturnType<typeof getVideos>>[number];
export const getVideos = cache(async () => {
  const all = await reader.collections.videos.all();
  return all
    .map(({ slug, entry }) => {
      const parsed = parseVideoUrl(entry.url);
      if (!parsed) return null;
      return {
        slug,
        ...entry,
        ...parsed,
        thumbnail: entry.thumbnail || parsed.thumbnail,
        categoryLabel: VIDEO_CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => byDateDesc(a.date, b.date));
});

export type Photo = Awaited<ReturnType<typeof getPhotos>>[number];
export const getPhotos = cache(async () => {
  const all = await reader.collections.photos.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      ...entry,
      albumLabel: PHOTO_ALBUMS.find((a) => a.value === entry.album)?.label ?? entry.album,
    }))
    .sort((a, b) => byDateDesc(a.date, b.date));
});

export const getBeforeAfter = cache(async () => {
  const all = await reader.collections.beforeAfter.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry }));
});

export const getStreamEvents = cache(async () => {
  const all = await reader.collections.streamEvents.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry }));
});

export type Project = Awaited<ReturnType<typeof getProjects>>[number];
export const getProjects = cache(async () => {
  const all = await reader.collections.projects.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      ...entry,
      tagLabels: entry.tags.map((t) => PROJECT_TAGS.find((p) => p.value === t)?.label ?? t),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

export const getCertifications = cache(async () => {
  const all = await reader.collections.certifications.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

export const getLearningLog = cache(async () => {
  const all = await reader.collections.learningLog.all();
  return all.map(({ slug, entry }) => ({ slug, ...entry })).sort((a, b) => byDateDesc(a.date, b.date));
});

export { PHOTO_ALBUMS, PROJECT_TAGS, VIDEO_CATEGORIES };

export function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ---------- image metadata (dimensions + tiny blur placeholder), memoised per server instance

type ImageMeta = { src: string; width: number; height: number; blurDataURL?: string };
const metaCache = new Map<string, Promise<ImageMeta>>();

export function getImageMeta(src: string): Promise<ImageMeta> {
  let hit = metaCache.get(src);
  if (!hit) {
    hit = (async () => {
      try {
        const publicDir = path.join(process.cwd(), "public");
        const file = path.resolve(publicDir, decodeURI(src).replace(/^\/+/, ""));
        if (!file.startsWith(publicDir + path.sep)) throw new Error("outside public/");
        const img = sharp(file);
        const { width = 1600, height = 1067 } = await img.metadata();
        const tiny = await img.resize(16).webp({ quality: 40 }).toBuffer();
        return { src, width, height, blurDataURL: `data:image/webp;base64,${tiny.toString("base64")}` };
      } catch {
        return { src, width: 1600, height: 1067 };
      }
    })();
    metaCache.set(src, hit);
  }
  return hit;
}
