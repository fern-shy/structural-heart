import type { Slide } from "./media";

export type Subtopic = {
  id: string;
  title: string;
  description?: string;
  longText?: string;
  slides?: Slide[];
  children?: Subtopic[];
};

export type Category = {
  id: string;
  title: string;
  subtitle?: string;
  subtopics: Subtopic[];
};

export type Content = {
  categories: Category[];
};
