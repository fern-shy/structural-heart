/**
 * Grants (or revokes) the `admin` custom claim on a Firebase Auth user, which is
 * what `firestore.rules` / `storage.rules` check to allow content writes.
 *
 * Prerequisite: the user must already exist (create them in the Firebase console
 * under Authentication -> Users, or have them sign in once via the editor).
 *
 * Usage:
 *   npm run set-admin -- dad@example.com          # grant admin
 *   npm run set-admin -- dad@example.com --revoke # revoke admin
 *
 * Uses the same serviceAccount.json credentials as the seed script.
 */
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SERVICE_ACCOUNT_PATH = resolve(process.cwd(), "serviceAccount.json");

function init() {
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    initializeApp({
      credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({ credential: applicationDefault() });
  } else {
    throw new Error(
      "No credentials found. Save a service account key as serviceAccount.json " +
        "or set GOOGLE_APPLICATION_CREDENTIALS.",
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith("--"));
  const revoke = args.includes("--revoke");

  if (!email) {
    console.error("Usage: npm run set-admin -- <email> [--revoke]");
    process.exit(1);
  }

  init();
  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, revoke ? {} : { admin: true });

  console.log(
    `${revoke ? "Revoked admin from" : "Granted admin to"} ${email} (uid: ${user.uid}).`,
  );
  console.log(
    "The user must sign out and back in (or the app force-refreshes the token) for it to take effect.",
  );
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
