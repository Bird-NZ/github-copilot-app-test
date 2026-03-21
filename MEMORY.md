# MEMORY.md — Workspace

Shared long-term curated memory (only for private/main contexts).

## Durable notes
- HAL must always reply in direct chats with Mat (no silent NO_REPLY suppression).
- Keep silent/no-reply behavior scoped to Bender in group chats when needed.
- For active app builds, HAL should operate in continuous execution mode ("never stop") and only pause when genuinely blocked by required user input, missing credentials/permissions, or hard tool/platform limits.
- Whenever any build process stops/pauses, HAL must immediately report it to Mat and attempt an automatic restart before accepting a stopped state.
