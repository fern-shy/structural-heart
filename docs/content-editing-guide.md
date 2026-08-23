# Editing the App's Content (No Coding Required)

There are two ways to edit content. **Most of the time you should use the
built-in Content Editor** (Option A) — it's a simple web form. The raw Firebase
console (Option B) is always available as a backup.

---

## Option A: The Content Editor (recommended)

A password-protected web page with simple forms for categories, procedures, and
slides. No Firebase console needed.

### One-time setup (developer)

1. Create the editor's login: Firebase console -> **Authentication** -> **Users**
   -> **Add user** (email + password). Enable the **Email/Password** provider
   under Authentication -> Sign-in method if it isn't already.
2. Grant that account edit access (adds the `admin` permission the rules require):

   ```bash
   npm run set-admin -- dad@example.com
   ```

3. Open the editor:
   - Locally: `npx expo start`, press `w` to open web, then go to `/admin`
     (e.g. `http://localhost:8081/admin`).
   - Or publish it as a real website (free on the Spark plan) so he can just
     bookmark a link:

     ```bash
     npx firebase login   # one time, opens the browser
     npm run deploy       # builds the web app and deploys to Firebase Hosting
     ```

     After it finishes, the editor lives at
     **https://structural-heart.web.app/admin** (and `...firebaseapp.com/admin`).
     Re-run `npm run deploy` whenever you change the app code.

### Using it

- Sign in with the email/password from setup.
- **Categories** page: add/rename/reorder/delete top-level sections; click **Open**
  to manage a category's procedures.
- **Procedures** page: add procedures, write their description/long text, nest one
  under another, reorder, and click **Edit slides**.
- **Slides** page: add **Text**, **Image**, or **Video** slides. For image/video,
  paste a Google Drive share link or any direct URL into the link field. Reorder
  with the up/down arrows.
- Changes save to the same database the app reads, so they appear on next app load.

Surgeons using the normal app never see any of this — the editor is behind login.

---

## Option B: The Firebase console (backup / power use)

This section describes managing the procedures, slides, text, and images/videos
directly in the **Firebase console**. You never touch any code, and changes show
up in the app the next time it loads.

- Console: https://console.firebase.google.com
- Two areas you'll use:
  - **Firestore Database** -> the words and structure (categories, procedures, slides)
  - **Storage** -> the actual image and video files

## How the content is organized

Think of it as folders inside folders:

```
Category            (e.g. "3. Mitral Valve")
  └─ Subtopic        (a procedure, e.g. "TMVR")
       └─ Slide      (one image, video, or block of text)
```

In Firestore these are called **collections** and **documents**:

- `categories` -> one document per category
  - `subtopics` -> one document per procedure
    - `slides` -> one document per slide

Every document has an **`order`** number. Items are shown lowest-to-highest
(0, 1, 2, ...). To reorder, just change the numbers.

## Field reference

Category document:

| Field | Required | Example |
| --- | --- | --- |
| `title` | yes | `3. Mitral Valve` |
| `subtitle` | optional | `TEER, TMVR, PVL, LAMPOON` |
| `order` | yes | `2` |

Subtopic (procedure) document:

| Field | Required | Example |
| --- | --- | --- |
| `title` | yes | `TMVR` |
| `description` | optional | `Clinical steps and imaging` |
| `longText` | optional | A longer paragraph shown under the media |
| `parentId` | optional | leave empty for a top-level procedure; set to another subtopic's ID to nest it underneath |
| `order` | yes | `4` |

Slide document — fields depend on `type`:

| Field | image | video | text |
| --- | --- | --- | --- |
| `type` | `image` | `video` | `text` |
| `order` | yes | yes | yes |
| `uri` | yes (file URL) | yes (file URL) | — |
| `caption` | optional | optional | — |
| `isLoop` | — | optional (`true`/`false`) | — |
| `title` | — | — | yes |
| `content` | — | — | yes (the body text) |

## Common tasks

### Add a new image or video to a procedure

1. **Upload the file.** Go to **Storage**, open the `content` folder, and upload
   your image or video. (You can make folders like `mitral-valve/tmvr` to stay
   organized.)
2. **Copy the link.** Click the file you uploaded. On the right, copy the
   **Download URL** (it looks like `https://firebasestorage.googleapis.com/...?alt=media&token=...`).
3. **Create the slide.** Go to **Firestore Database**, open `categories` -> your
   category -> `subtopics` -> your procedure -> `slides`, and click
   **Add document**.
   - Let Firebase auto-generate the document ID.
   - Add field `type` = `image` (or `video`).
   - Add field `uri` = paste the Download URL.
   - Add field `order` = the position you want (next number in the list).
   - Optionally add `caption`.
4. Done. The slide appears in the app on next load.

### Edit the text on a slide

1. Firestore -> navigate to the slide document.
2. Click the `content` (for text slides) or `caption` (for image/video slides)
   field and edit it.
3. Changes save automatically.

### Add a brand-new procedure

1. Firestore -> open the category -> `subtopics` -> **Add document**.
2. Give it an ID (lowercase with dashes, e.g. `mitral-valve-plug`).
3. Add `title`, `order`, and optionally `description`.
4. Open the new procedure, create a `slides` collection inside it, and add slides
   as above.

### Make a procedure a sub-item of another

Set the child procedure's `parentId` field to the **document ID** of the parent
procedure (both must be in the same category). It will then appear nested under
the parent in the app.

### Reorder anything

Change the `order` numbers. Lowest shows first. Leave gaps (10, 20, 30) if you
want room to insert things later.

### Replace a Google Drive image with a hosted one

1. Upload the file to **Storage** and copy its Download URL (steps above).
2. Open the slide and paste the new URL into `uri`, replacing the old Drive link.

## Tips

- IDs can't be renamed after creation — pick a clear one up front, or delete and
  recreate.
- If something doesn't appear, double-check `type` is spelled exactly
  (`image`, `video`, or `text`) and that `order` is a **number**, not text.
- The app keeps a copy of the last content it saw, so it still works offline and
  updates automatically once it's back online.
