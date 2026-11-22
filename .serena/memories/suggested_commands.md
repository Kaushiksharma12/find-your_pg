# Suggested Commands & CLI Notes

## Development & Build
- `npm run dev`: Start local Next.js development server at `http://localhost:3000`.
- `npm run build`: Compile Next.js production build and check type errors.
- `npm run start`: Launch production server build.
- `npm run lint`: Execute ESLint checks across project.

## Context7 Documentation Lookup (Windows PowerShell)
- Non-interactive library query: `npx -y ctx7@latest library "<name>" "<query>"`
- Fetch docs: `npx -y ctx7@latest docs "<libraryId>" "<query>"`

## Windows Environment Notes
- Shell is PowerShell on Windows OS.
- Use `npx -y` to auto-confirm package execution prompts in non-interactive terminal steps.
- Always use absolute paths or double-quoted relative paths when navigating directories in scripts.
