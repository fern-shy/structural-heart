/**
 * One-time / repeatable seed: pushes the bundled content snapshot in
 * `data/content.ts` into Firestore using the Firebase Admin SDK.
 *
 * It flattens the in-memory tree into the collection/subcollection model:
 *   categories/{categoryId}
 *     subtopics/{subtopicId}        (nested children become siblings + parentId)
 *       slides/{slideId}
 * assigning an `order` to every sibling so the app can sort deterministically.
 *
 * Usage:
 *   1. Create a service account key in the Firebase console
 *      (Project settings -> Service accounts -> Generate new private key) and
 *      save it as `serviceAccount.json` in the project root (git-ignored), OR
 *      set GOOGLE_APPLICATION_CREDENTIALS to its path.
 *   2. Run:  npm run seed
 *      Add `-- --wipe` to delete existing content collections first.
 */
import { cert, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import content from "../data/content";
import { COLLECTIONS, type SlideDoc } from "../lib/content/schema";
import type { Slide } from "../types/media";
import type { Subtopic } from "../types/content";

const SERVICE_ACCOUNT_PATH = resolve(process.cwd(), "serviceAccount.json");

function init(): Firestore {
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(
      readFileSync(SERVICE_ACCOUNT_PATH, "utf8"),
    );
    initializeApp({ credential: cert(serviceAccount) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: applicationDefault() });
  } else {
    throw new Error(
      "No credentials found. Save a service account key as serviceAccount.json " +
        "or set GOOGLE_APPLICATION_CREDENTIALS. See script header for details.",
    );
  }
  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

function slideToDoc(slide: Slide, order: number): SlideDoc {
  switch (slide.type) {
    case "text":
      return { type: "text", order, title: slide.title, content: slide.content };
    case "image":
      return { type: "image", order, uri: slide.uri, caption: slide.caption };
    case "video":
      return {
        type: "video",
        order,
        uri: slide.uri,
        caption: slide.caption,
        isLoop: slide.isLoop,
      };
  }
}

async function deleteCollectionDeep(
  db: Firestore,
  path: string,
): Promise<void> {
  const snap = await db.collection(path).get();
  for (const doc of snap.docs) {
    // Recurse into known subcollections before deleting the parent doc.
    for (const sub of [COLLECTIONS.subtopics, COLLECTIONS.slides]) {
      const subSnap = await doc.ref.collection(sub).get();
      if (!subSnap.empty) {
        await deleteCollectionDeep(db, `${doc.ref.path}/${sub}`);
      }
    }
    await doc.ref.delete();
  }
}

/**
 * Writes a subtopic document and its slides, then recurses into children,
 * which are written as siblings in the same subcollection with a parentId.
 */
async function writeSubtopic(
  db: Firestore,
  categoryPath: string,
  subtopic: Subtopic,
  order: number,
  parentId?: string,
): Promise<void> {
  const subRef = db
    .collection(`${categoryPath}/${COLLECTIONS.subtopics}`)
    .doc(subtopic.id);

  await subRef.set({
    title: subtopic.title,
    description: subtopic.description,
    longText: subtopic.longText,
    parentId,
    order,
  });

  if (subtopic.slides?.length) {
    const slidesCol = subRef.collection(COLLECTIONS.slides);
    await Promise.all(
      subtopic.slides.map((slide, i) =>
        slidesCol.doc(slide.id).set(slideToDoc(slide, i)),
      ),
    );
  }

  if (subtopic.children?.length) {
    for (let k = 0; k < subtopic.children.length; k++) {
      await writeSubtopic(
        db,
        categoryPath,
        subtopic.children[k],
        k,
        subtopic.id,
      );
    }
  }
}

async function main(): Promise<void> {
  const wipe = process.argv.includes("--wipe");
  const db = init();

  if (wipe) {
    console.log("Wiping existing categories collection...");
    await deleteCollectionDeep(db, COLLECTIONS.categories);
  }

  let categoryCount = 0;
  let subtopicCount = 0;

  for (let i = 0; i < content.categories.length; i++) {
    const category = content.categories[i];
    const categoryRef = db.collection(COLLECTIONS.categories).doc(category.id);
    await categoryRef.set({
      title: category.title,
      subtitle: category.subtitle,
      order: i,
    });
    categoryCount++;

    for (let j = 0; j < category.subtopics.length; j++) {
      await writeSubtopic(db, categoryRef.path, category.subtopics[j], j);
      subtopicCount++;
    }
  }

  console.log(
    `Seed complete: ${categoryCount} categories, ${subtopicCount} top-level subtopics.`,
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
