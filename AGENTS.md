# Project Memory Instructions

- Append every material technical decision to `.local-notes/technical-decisions-2026-05-23.md`.
- Append every non-trivial troubleshooting investigation to `.local-notes/troubleshooting-log.md`.
- Treat both local logs as append-only: never rewrite, reorder, or delete existing entries unless the user explicitly asks.
- Give every technical decision a stable `TD-###` identifier.
- Give every troubleshooting entry a stable `TR-###` identifier.
- Cross-reference related entries in both directions when a troubleshooting entry leads to a technical decision, or a technical decision is motivated by a troubleshooting entry.
- Use this format for each technical decision entry:

```markdown
## TD-### / YYYY-MM-DD: Decision title

**결정 내용:** ...

**이유 / 배경:** ...

**대안으로 고려했던 것:** ...

**영향받는 문서 / 파일:** ...

**관련 항목:** `TR-###` or `TD-###`
```

- Use this format for each troubleshooting entry:

```markdown
## TR-### / YYYY-MM-DD: Incident title

**증상:** ...

**원인:** ...

**조사 과정:** ...

**해결:** ...

**재발 방지:** ...

**관련 항목:** `TD-###` or `TR-###`
```

- Record decisions even when the user does not explicitly ask, if the work changes architecture, deployment, automation, repository workflow, data model, dependency strategy, test strategy, or operating practice.
- Record troubleshooting even when the user does not explicitly ask, if an issue required investigation, log inspection, reproduction, or a fix that future work may need to remember.
- Keep implementation notes out of the decision log unless they explain why the decision was made.
