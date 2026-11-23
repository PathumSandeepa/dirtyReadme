export type CustomizePartId = "header" | "about" | "stack" | "links" | "creature";

export interface CustomizePartMeta {
  id: CustomizePartId;
  group: "text-stack" | "creature";
  label: string;
  description: string;
  nextLabel: string;
}

export const CUSTOMIZE_PARTS: CustomizePartMeta[] = [
  {
    id: "header",
    group: "text-stack",
    label: "Header",
    description: "Edit your profile heading, role tagline and text alignment.",
    nextLabel: "Next part: About",
  },
  {
    id: "about",
    group: "text-stack",
    label: "About",
    description: "Insert dynamic values, templates and images into your intro.",
    nextLabel: "Next part: Tech stack",
  },
  {
    id: "stack",
    group: "text-stack",
    label: "Tech stack",
    description: "Group badges into cards and pick from 202 skills.",
    nextLabel: "Next part: Links",
  },
  {
    id: "links",
    group: "text-stack",
    label: "Links",
    description: "Add social, writing and portfolio link badges.",
    nextLabel: "Next part: Creature",
  },
  {
    id: "creature",
    group: "creature",
    label: "Creature",
    description: "Customize your animated creature or upload a custom banner image.",
    nextLabel: "Continue to publish",
  },
];

export function isCustomizePartId(value: string): value is CustomizePartId {
  return (
    value === "header" ||
    value === "about" ||
    value === "stack" ||
    value === "links" ||
    value === "creature"
  );
}
