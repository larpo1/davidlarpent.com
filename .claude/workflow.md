# Workflow — davidlarpent.com

## Sprint Process

Tasks live in `.claude/sprint.md`. CLAUDE.md stays clean.

1. Read CLAUDE.md for project context
2. Read `.claude/sprint.md` for current tasks
3. Pick the next incomplete task (top to bottom)
4. Complete it fully before moving on
5. Verify before marking complete (see below)
6. Commit with clear message
7. Push to GitHub
8. Move to next task

## Task Verification

Two tiers — light verify keeps the dev server alive:

```bash
npm run verify:light   # Tests only. Per task. Non-destructive.
npm run verify         # Full build + tests. Sprint end only (kills dev server).
```

Before marking ANY task `[x]`:

1. Run `npm run verify:light` — must pass
2. If task creates new tests: verify test count increased
3. Check all files in task's "Files:" section exist
4. Re-read the task description — verify EVERY requirement completed
5. Only then mark `[x]`

Run full `npm run verify` only when ALL tasks are done (sprint completion).

### Post-Completion Audit

After marking `[x]`, verify:
- Every bullet point completed
- All files exist
- Commit message matches template
- If tests mentioned: run `npm test` and verify count
- If ANY item incomplete: uncheck and complete it

## Test Task Template

Test tasks are ALWAYS separate from implementation tasks.

```markdown
- [ ] **Test: [Feature Name]**
      - **Blocked By:** [Implementation task] (must be [x])
      - **Test File:** tests/[feature].spec.ts
      - **Current Test Count:** [N] passing
      - **Expected Test Count:** [N + delta] passing

      - **Tests to Add:**
        1. [Scenario 1]
        2. [Scenario 2]

      - **Verification Checklist:**
        - [ ] Test file created/updated
        - [ ] `npm test` passes
        - [ ] Test count matches expected
        - [ ] All scenarios implemented

      - **Files:** tests/[feature].spec.ts
      - **Commit:** `test: Add [feature] tests`
```

## Lessons Learned

1. **Ralph skips tests unless they are separate tasks.** Always create a dedicated test task with expected test counts. Never embed test requirements inside an implementation task.
2. **Test user behavior, not implementation.** Bad: `expect(button).not.toBeVisible()`. Good: verify the user can complete the full interaction cycle.
3. **Ralph marks tasks complete prematurely.** The post-completion audit step exists because of this. Enforce it.

## Process Rules

- Implementation and testing are SEPARATE tasks with SEPARATE checkboxes
- Every test task specifies: current test count, expected test count, delta
- Cannot mark `[x]` without running `npm test` and verifying count
- If you want Ralph to do something, make it a separate task with observable success criteria

## When Stuck

If you've tried 3+ approaches and can't progress:

1. Create `STUCK.md` with what you tried
2. Skip to the next task
3. If no more tasks, output: `<promise>STUCK</promise>`

## Sprint Completion

When ALL tasks are complete and build passes:

1. Final commit
2. Output exactly: `<promise>DONE</promise>`
