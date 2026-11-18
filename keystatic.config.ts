import { config, collection, singleton, fields } from "@keystatic/core";

/**
 * Content model for the portfolio.
 * - In development the admin at /keystatic edits files on disk.
 * - In production it commits to GitHub (set NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO="owner/repo"),
 *   which triggers a Vercel redeploy. See HANDOVER.md.
 */
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO as
  | `${string}/${string}`
  | undefined;

export const VIDEO_CATEGORIES = [
  { label: "Live Streams", value: "live-streams" },
  { label: "Church & Event Coverage", value: "church-event" },
  { label: "Band & Music", value: "band-music" },
  { label: "Edited Content", value: "edited" },
] as const;

export const PHOTO_ALBUMS = [
  { label: "Events", value: "events" },
  { label: "Portraits", value: "portraits" },
  { label: "Church & Worship", value: "church-worship" },
  { label: "Band & Music", value: "band-music" },
  { label: "Behind the Scenes", value: "behind-the-scenes" },
] as const;

export const PROJECT_TAGS = [
  { label: "Web Development", value: "web-dev" },
  { label: "Cybersecurity", value: "cybersecurity" },
  { label: "Study Tools", value: "study-tools" },
] as const;

const linkItem = fields.object({
  label: fields.text({ label: "Label" }),
  url: fields.url({ label: "URL" }),
});

export default config({
  storage: githubRepo ? { kind: "github", repo: githubRepo } : { kind: "local" },
  ui: {
    brand: { name: "Jeffrey Agyemang Acheampong" },
    navigation: {
      "Media": ["videos", "photos", "beforeAfter", "streamEvents"],
      "Tech": ["projects", "certifications", "learningLog"],
      "Pages": ["site", "home", "about", "cyber", "services"],
    },
  },
  collections: {
    videos: collection({
      label: "Videos",
      slugField: "title",
      path: "content/videos/*",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        url: fields.url({
          label: "Video link",
          description: "Paste a YouTube or Vimeo link. The thumbnail is fetched automatically for YouTube.",
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: "Category",
          options: [...VIDEO_CATEGORIES],
          defaultValue: "live-streams",
        }),
        date: fields.date({ label: "Date" }),
        venue: fields.text({ label: "Venue or client" }),
        role: fields.text({ label: "My role", description: "e.g. Camera operator, editor, stream operator" }),
        featured: fields.checkbox({
          label: "Featured reel",
          description: "Shown large at the top of the Showcase and on the Home page. Tick only one.",
        }),
        thumbnail: fields.image({
          label: "Custom thumbnail (optional)",
          description: "Needed for Vimeo links. Optional for YouTube.",
          directory: "public/media/videos",
          publicPath: "/media/videos/",
        }),
      },
    }),
    photos: collection({
      label: "Photos",
      slugField: "title",
      path: "content/photos/*",
      columns: ["title", "album"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        image: fields.image({
          label: "Photo",
          directory: "public/media/photos",
          publicPath: "/media/photos/",
          validation: { isRequired: true },
        }),
        alt: fields.text({
          label: "Alt text",
          description: "Describe the photo for screen readers.",
          validation: { length: { min: 1 } },
        }),
        caption: fields.text({ label: "Caption (event or place)" }),
        album: fields.select({ label: "Album", options: [...PHOTO_ALBUMS], defaultValue: "events" }),
        date: fields.date({ label: "Date" }),
        featured: fields.checkbox({ label: "Show on Home page" }),
      },
    }),
    beforeAfter: collection({
      label: "Before / After edits",
      slugField: "title",
      path: "content/before-after/*",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        before: fields.image({
          label: "Before (unedited)",
          directory: "public/media/before-after",
          publicPath: "/media/before-after/",
          validation: { isRequired: true },
        }),
        after: fields.image({
          label: "After (edited)",
          directory: "public/media/before-after",
          publicPath: "/media/before-after/",
          validation: { isRequired: true },
        }),
        alt: fields.text({ label: "Alt text" }),
        caption: fields.text({ label: "What was done", multiline: true }),
      },
    }),
    streamEvents: collection({
      label: "Live stream events",
      slugField: "event",
      path: "content/stream-events/*",
      schema: {
        event: fields.slug({ name: { label: "Event" } }),
        venue: fields.text({ label: "Venue / organisation" }),
        date: fields.text({ label: "When", description: "e.g. Weekly, since 2022 or 14 Mar 2025" }),
        platforms: fields.text({ label: "Platforms", description: "e.g. YouTube Live, Facebook Live" }),
      },
    }),
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        summary: fields.text({ label: "Short description", multiline: true }),
        tags: fields.multiselect({ label: "Categories", options: [...PROJECT_TAGS] }),
        tools: fields.array(fields.text({ label: "Tool" }), {
          label: "Tools used",
          itemLabel: (p) => p.value,
        }),
        github: fields.url({ label: "GitHub link" }),
        demo: fields.url({ label: "Live demo link" }),
        order: fields.integer({ label: "Sort order", defaultValue: 0 }),
      },
    }),
    certifications: collection({
      label: "Certifications & education",
      slugField: "name",
      path: "content/certifications/*",
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        issuer: fields.text({ label: "Issuer" }),
        kind: fields.select({
          label: "Type",
          options: [
            { label: "Certification", value: "cert" },
            { label: "Education", value: "education" },
          ],
          defaultValue: "cert",
        }),
        date: fields.text({ label: "Date", description: "e.g. 2024 or 2023 – present" }),
        verifyUrl: fields.url({ label: "Verification link" }),
        order: fields.integer({ label: "Sort order", defaultValue: 0 }),
      },
    }),
    learningLog: collection({
      label: "Cyber learning log",
      slugField: "title",
      path: "content/learning-log/*",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({ label: "Date" }),
        platform: fields.text({ label: "Platform", description: "e.g. TryHackMe, HackTheBox, personal lab" }),
        summary: fields.text({ label: "What I learned", multiline: true }),
        link: fields.url({ label: "Link (write-up or room)" }),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: "Site settings",
      path: "content/site",
      schema: {
        name: fields.text({ label: "Full name" }),
        shortName: fields.text({ label: "First name", description: "Used in the hero greeting and short labels, e.g. Jeffrey" }),
        title: fields.text({ label: "One-line title" }),
        intro: fields.text({ label: "Home intro paragraph", multiline: true }),
        location: fields.text({ label: "Location" }),
        email: fields.text({ label: "Email" }),
        whatsapp: fields.text({
          label: "WhatsApp number",
          description: "International format, digits only, e.g. 233201234567",
        }),
        socials: fields.array(linkItem, { label: "Social links", itemLabel: (p) => p.fields.label.value }),
        cv: fields.file({ label: "CV (PDF)", directory: "public/media/cv", publicPath: "/media/cv/" }),
      },
    }),
    home: singleton({
      label: "Home page",
      path: "content/home",
      schema: {
        highlights: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            text: fields.text({ label: "Text", multiline: true }),
          }),
          { label: "Key skill highlights", itemLabel: (p) => p.fields.label.value }
        ),
      },
    }),
    about: singleton({
      label: "About page",
      path: "content/about",
      schema: {
        portrait: fields.image({ label: "Portrait", directory: "public/media/about", publicPath: "/media/about/" }),
        story: fields.text({ label: "My story", description: "Leave a blank line between paragraphs.", multiline: true }),
        leadership: fields.array(
          fields.object({
            role: fields.text({ label: "Role" }),
            org: fields.text({ label: "Organisation" }),
            period: fields.text({ label: "Period" }),
            summary: fields.text({ label: "Summary", multiline: true }),
          }),
          { label: "Leadership & experience", itemLabel: (p) => p.fields.role.value }
        ),
        personal: fields.text({ label: "Personal side", multiline: true }),
      },
    }),
    cyber: singleton({
      label: "Cybersecurity page",
      path: "content/cyber",
      schema: {
        intro: fields.text({ label: "Learning journey", multiline: true }),
        goals: fields.array(fields.text({ label: "Goal" }), { label: "Goals", itemLabel: (p) => p.value }),
        topics: fields.array(fields.text({ label: "Topic" }), { label: "Topics I'm studying", itemLabel: (p) => p.value }),
        platforms: fields.array(linkItem, { label: "Practice platforms", itemLabel: (p) => p.fields.label.value }),
      },
    }),
    services: singleton({
      label: "Services page",
      path: "content/services",
      schema: {
        intro: fields.text({ label: "Intro", multiline: true }),
        roles: fields.array(
          fields.object({
            title: fields.text({ label: "Role" }),
            summary: fields.text({ label: "What I do", multiline: true }),
            sample: fields.image({
              label: "Sample image",
              directory: "public/media/services",
              publicPath: "/media/services/",
            }),
          }),
          { label: "Creative roles", itemLabel: (p) => p.fields.title.value }
        ),
        streamingIntro: fields.text({ label: "Live streaming intro", multiline: true }),
        equipment: fields.array(
          fields.object({
            group: fields.text({ label: "Group", description: "e.g. Cameras, Editing, Streaming" }),
            items: fields.array(fields.text({ label: "Item" }), { label: "Items", itemLabel: (p) => p.value }),
          }),
          { label: "Tools & equipment", itemLabel: (p) => p.fields.group.value }
        ),
      },
    }),
  },
});
