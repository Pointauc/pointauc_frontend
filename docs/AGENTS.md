# Documentation Instructions

These instructions apply when working on end-user documentation in the `docs/` folder.

## Audience and Purpose

- Write for non-technical end users.
- Assume readers may be streamers, creators, or operators who want to use the product without understanding the code.
- Focus on helping users understand features, complete tasks, and troubleshoot common issues.

## Writing Style

- Use plain, simple language.
- Write from the user's perspective.
- Keep the tone natural and conversational.
- Avoid jargon, marketing language, and unnecessary technical detail.
- Be direct and easy to scan.

## Structure and Formatting

- Prefer short paragraphs, usually no more than 2 to 3 sentences.
- Use clear headings to organize content.
- Use numbered lists for steps.
- Use bullet lists for features, options, and takeaways.
- Use bold for important terms and italics for UI labels when helpful.
- Format technical values, settings, and commands as inline code or fenced code blocks.
- Use blockquotes for important notes, tips, and warnings.
- Do not add divider lines between headings.

## Optional VitePress Containers

When useful, use the documentation theme containers:

- `::: info Title`
- `::: tip Title`
- `::: warning Title`
- `::: danger Title`
- `::: details Title`

Use them intentionally, not excessively.

## Content Focus

- Explain what users can do with the application.
- Walk through important user flows.
- Cover user-facing configuration options.
- Describe integrations from the user's point of view.
- Include troubleshooting guidance where it helps users recover quickly.

## Tone Guardrails

- Do not write like internal engineering docs.
- Do not assume code knowledge.
- Do not over-explain implementation details unless they directly help the user succeed.
