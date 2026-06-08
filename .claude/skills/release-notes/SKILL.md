---
name: release-notes
description: Generate App Store and Google Play "What's New" release notes by comparing main against the previous minor version tag
version: 1.0.0
---

## When to use

Use this skill when the user says "create release notes", "write release notes", or similar.

## Steps

### 1. Determine the comparison tag

Read the current version from `package.json` (`version` field). Parse it as `X.Y.Z`.

Find the correct base tag:
- Target minor version = `Y - 1`
- Run `git tag --list "X.(Y-1).*" --sort=version:refname` to list all tags for the previous minor
- Use the **first** (lowest) tag in that list as the base — e.g. if current is `1.8.0`, find the first `1.7.x` tag

### 2. Collect changes

```bash
git log <base-tag>..main --oneline
git diff <base-tag>..main -- package.json
```

Categorise commits into:
- **User-facing**: new features, bug fixes, UI/UX changes, performance improvements
- **Internal only**: `ci:`, `chore:`, dependency bumps, tooling, build pipeline

### 3. Write the release notes

Write two versions — **English** and **Slovenian** — for App Store and Google Play.

**Tone and style rules** (match exactly):
- No emojis whatsoever
- Dry, understated, slightly deadpan humour — with a touch of fun
- Short punchy bullet points for changes
- Wrap with a one-line opener and a one-line closer
- If all changes are internal/invisible to users, lean into that — acknowledge nothing changed visibly, with quiet confidence
- Never use marketing language or hype
- Never mention specific platforms (iOS, Android) — notes are shared across both stores
- When describing bug fixes, **never frame them as the team's fault or as failures** — bugs are external villains that were defeated, not mistakes that were admitted. Keep the tone playful and confident, never apologetic

**Example (English):**
```
Quiet. Clean. Unapologetic.

• Poked around in the dark corners and fixed what didn't belong there.
• A few bugs tried to hide. They failed.
• Things work better now. We'll leave it at that.

Not a lot to say. Just a lot done.
```

**Example (Slovenian):**
```
Tiho. Čisto. Brez opravičil.

• Pokukali smo v temne kotičke in odpravili, kar ni sodilo tja.
• Nekaj hroščev se je skušalo skriti. Niso uspeli.
• Stvari delujejo bolje. Pustimo pri tem.

Ni veliko za povedati. Narejenega pa je bilo veliko.
```

Output both versions clearly labelled, ready to paste into the store listing.
