# Mobile Codex PR Pipeline

This repository can accept development commands from GitHub Mobile and turn them into pull requests.

## One-time setup

1. Add a repository secret named `OPENAI_API_KEY`.
2. In repository settings, enable GitHub Actions.
3. In repository settings, set Actions workflow permissions to allow read and write permissions.
4. Keep branch protection on `main` so mobile review and merge still happen through PRs.

## Mobile command flow

1. Open or create a GitHub issue from GitHub Mobile.
2. Add a comment that starts with `/codex`.
3. Describe the task in the same comment.

Example:

```text
/codex Fix the weekly stats chart so empty weeks show as 0 instead of disappearing.
```

The workflow will:

- verify that the commenter has write access
- create a `feat/<issue-title>-<issue-number>` branch
- run Codex on the task
- run `npm test -- --watchAll=false`
- run `npm run build`
- push the branch
- open a pull request into `main`

You can then review and merge the PR from GitHub Mobile.

## Manual fallback

If issue comments are inconvenient, run the `Mobile Codex PR` workflow manually from the GitHub Actions tab and fill in the `task` input.

## Safety notes

- The workflow ignores `/codex` comments from users without write access.
- The workflow does not merge to `main`.
- A PR is created only when Codex changes files and the test/build checks pass.
- PR titles use `feat: <issue title>`.
- The OpenAI API key is read from GitHub Secrets and should not be committed.
