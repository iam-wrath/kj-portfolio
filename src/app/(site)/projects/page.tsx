import type { Metadata } from "next";
import { getProjects, PROJECT_TAGS } from "@/lib/content";
import { CtaBand, PageHead } from "@/components/blocks";
import { ProjectsGrid } from "@/components/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Web development, cybersecurity and study-tool projects — with code on GitHub.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHead title="Things I've built." lead="Coursework, study tools and early security tooling. Filter by category; code is on GitHub." />
      <section className="section" style={{ paddingTop: 0 }} aria-label="Project list">
        <div className="container">
          <ProjectsGrid
            tags={PROJECT_TAGS}
            projects={projects.map((p) => ({
              slug: p.slug,
              title: p.title,
              summary: p.summary,
              tags: p.tags,
              tagLabels: p.tagLabels,
              tools: p.tools,
              github: p.github,
              demo: p.demo,
            }))}
          />
        </div>
      </section>
      <CtaBand title="Looking for a security or IT intern?" text="I learn fast, document what I do and bring a decade of real-world responsibility." />
    </>
  );
}
