"use client";

import { useMemo, useState } from "react";
import { FilterTabs } from "./filter-tabs";
import { ArrowUpRight, Github } from "./icons";
import { useGridFade } from "@/motion/use-grid-fade";

export type ProjectItem = {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  tagLabels: string[];
  tools: readonly string[];
  github: string | null;
  demo: string | null;
};

export function ProjectsGrid({ projects, tags }: { projects: ProjectItem[]; tags: readonly { value: string; label: string }[] }) {
  const [tag, setTag] = useState("all");
  const visible = useMemo(() => (tag === "all" ? projects : projects.filter((p) => p.tags.includes(tag))), [tag, projects]);
  const ref = useGridFade<HTMLDivElement>(tag);
  const options = [
    { value: "all", label: "All", count: projects.length },
    ...tags.map((t) => ({ ...t, count: projects.filter((p) => p.tags.includes(t.value)).length })),
  ];

  return (
    <>
      <FilterTabs label="Filter projects by category" options={options} value={tag} onChange={setTag} />
      <div className="grid grid--2" ref={ref}>
        {visible.map((p) => (
          <article className="card card--hover project" key={p.slug}>
            <span className="card__index">{p.tagLabels.join(" · ")}</span>
            <h3 className="h3">{p.title}</h3>
            <p>{p.summary}</p>
            <ul className="chip-row" aria-label="Tools used" style={{ listStyle: "none", padding: 0 }}>
              {p.tools.map((t) => (
                <li key={t} className="chip">{t}</li>
              ))}
            </ul>
            <div className="project__links">
              {p.github ? (
                <a href={p.github} target="_blank" rel="noopener noreferrer">
                  <Github /> Code<span className="sr-only"> for {p.title} on GitHub</span>
                </a>
              ) : null}
              {p.demo ? (
                <a href={p.demo} target="_blank" rel="noopener noreferrer">
                  Live demo<span className="sr-only"> of {p.title}</span> <ArrowUpRight />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
