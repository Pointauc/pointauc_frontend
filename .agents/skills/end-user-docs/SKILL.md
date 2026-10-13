---
name: end-user-docs
description: Guide for creating and maintaining end-user documentation, feature guides, and streamer manuals inside the docs/ directory.
---

# End-User Documentation Guide

Use this skill when authoring or editing user manuals, streamer walkthroughs, and help guides inside the `docs/` folder.

## Purpose & Target Audience

- **Audience**: Streamers, content creators, and end users with no technical or programming background.
- **Goal**: Help users understand features, run auctions smoothly, integrate with streaming software (OBS, Twitch, YouTube), and troubleshoot common issues.

## Writing Style & Tone

- **Plain & Accessible**: Avoid developer jargon (e.g. state management, API payload, DOM, hooks). Use user-centric terms (e.g. "settings", "bid list", "wheel animation").
- **Action-Oriented**: Frame instructions from the user's view: "You can set a minimum bid..." rather than "The system processes bids...".
- **Authentic & Direct**: Keep sentences short (2–3 sentences per paragraph). Avoid corporate buzzwords.

## Visual Formatting & Callouts

Use VitePress-compatible markdown containers for highlighted tips and notes:

```markdown
::: info Note
General explanations or background context.
:::

::: tip Pro Tip
Helpful workflow suggestions or best practices for streams.
:::

::: warning Heads Up
Important cautions to prevent unwanted auction behavior.
:::

::: danger Important
Critical warnings to avoid data loss or stream disruptions.
:::
```

### Layout Elements

- **Step-by-step**: Use numbered lists for sequential flows.
- **Tables**: Use tables for configuration settings or comparing options.
- **No Manual Dividers**: Avoid inserting `---` between section headers; the VitePress theme handles spacing.
- **Emojis**: Use sparingly for visual anchoring (e.g., 🎯 Goals, 💡 Tips, ⚠️ Warnings, ✅ Completed steps).
