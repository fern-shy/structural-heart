export const guideTagline = "A visual guide for structural heart procedures.";

export const authors = "Co-authored by Mias Pretorius and Stefan Pretorius.";

export const authorCopy = [
  "This guide is a visual reference for structural heart procedures: short sequences of images, video, and captions for teaching and case review.",
  "Work through a procedure slide by slide. Captions sit with the image they describe, and search jumps straight to the slide that contains a phrase.",
];

export type Release = {
  version: string;
  date: string;
  items: string[];
};

/**
 * One entry per release, newest first. When cutting a release, bump `version`
 * in app.json to match the top entry (see docs/content-editing-guide.md).
 */
export const changelog: Release[] = [
  {
    version: "1.1.0",
    date: "November 2026",
    items: [
      "References lists the authors and a contact email.",
      "The app now opens in light mode, with a Dark mode switch on References. Text slides use dark text on white.",
      "A thin bar under the header shows where you are in a procedure's slides.",
      "If a slide can't load, it says so and offers Retry and a Report problem button that emails the details.",
      "If the procedures can't load on first launch, the app says so and offers Retry.",
    ],
  },
  {
    version: "1.0.0",
    date: "2025–2026",
    items: [
      "Procedures grouped by category, with nested sub-procedures.",
      "Image, video, and text slides with captions.",
      "Tap a slide to view it fullscreen, or turn the phone sideways; turning back keeps the slide you were on.",
      "Search matches procedure titles, notes, and slide text, then opens the matching slide.",
      "Content loads from the cloud and is kept on the device for quick, offline startup.",
      "Images and videos show an error with a Retry button if they fail to load.",
      "Web version at structural-heart.web.app.",
      "Content editor for adding and arranging procedures and slides.",
    ],
  },
];

export const contactEmail = "stefanjacobp@gmail.com";

export const contactCopy = [
  "For a missing slide, a wrong caption, or a procedure to add, email:",
];

export const legalCopy = [
  "This guide is for education. It is not a medical device, not a diagnosis, and not a treatment recommendation.",
  "It does not replace institutional protocol, device labeling, or the judgment of the treating team. Confirm indications, sizing, and technique with current source material before using any of it in patient care.",
  "Images and video remain the property of their authors and are shown here for teaching.",
];
