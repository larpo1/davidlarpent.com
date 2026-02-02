# Quick Reference: Test Task Checklist

**Use this checklist for EVERY test task**

---

## Before Starting

- [ ] Implementation task is marked [x] complete
- [ ] Implementation exists and works (manual test passed)
- [ ] Read current test count: `npm test 2>&1 | grep "passing"`

---

## While Writing Tests

- [ ] Created/updated test file at specified path
- [ ] Implemented ALL test scenarios from task description
- [ ] Followed test code examples provided
- [ ] Tests use correct locators and assertions
- [ ] No hardcoded values (use variables from task)

---

## Before Marking [x] Complete

### 1. Run Tests
```bash
npm test
```

### 2. Verify Test Count
```bash
npm test 2>&1 | grep "passing"
```
- [ ] Count matches "Expected Test Count" from task
- [ ] Delta matches expected increase

### 3. Check File Exists
```bash
ls tests/
```
- [ ] Test file exists at path specified in task

### 4. Verify All Scenarios Covered
- [ ] Re-read "Tests to Add" section
- [ ] Count test blocks in file
- [ ] Confirm all scenarios implemented

### 5. Verify Build Passes
```bash
npm run build
```
- [ ] Build succeeds with no errors

---

## Verification Checklist Template

Copy this into test tasks:

```markdown
- **Verification Checklist:**
  - [ ] File tests/[feature].spec.ts created/updated
  - [ ] Run `npm test` - all tests pass
  - [ ] Test count matches expected (verify with grep)
  - [ ] All test scenarios from spec implemented
  - [ ] Build passes (`npm run build`)
```

---

## Common Mistakes to Avoid

❌ **Marking [x] when tests fail**
- Tests must ALL pass before marking complete

❌ **Marking [x] without checking test count**
- Count MUST match expected (use grep to verify)

❌ **Skipping test scenarios**
- If task says "4 tests", you must write 4 tests
- No partial completion

❌ **Creating test file but leaving it empty**
- File exists ≠ tests written
- Must implement all scenarios

❌ **Forgetting to run npm test**
- ALWAYS run before marking [x]
- No exceptions

---

## If Tests Fail

1. **Read the error message**
   - Playwright shows which test failed and why

2. **Check test-results/ directory**
   - Visual test failures show screenshots
   - Compare actual vs expected

3. **Fix the test or the implementation**
   - If implementation broken: fix implementation first
   - If test broken: fix test code

4. **Re-run tests**
   - Must see all passing before continuing

5. **If stuck after 3 attempts**
   - Create STUCK.md with what you tried
   - Move to next task
   - Ask for help

---

## Test Count Quick Reference

**Current baseline:** 88 passing tests

| Task | Expected Count | Delta |
|------|----------------|-------|
| Test: LinkedIn copy button | 90 passing | +2 |
| Test: Substack copy + API | 94 passing | +4 |
| Test: Syndication styling | 95 passing | +1 |

**Commands:**
```bash
# Get current count
npm test 2>&1 | grep "passing"

# Update this reference when baseline changes
# New baseline = previous Expected Count
```

---

## Post-Completion Audit

After marking task [x]:

- [ ] Re-read task description
- [ ] Verify EVERY bullet point completed
- [ ] Check "Files:" section - all files exist
- [ ] Check commit message matches template
- [ ] If ANY item incomplete: Uncheck [x] and complete it

---

## Example: Good vs Bad

### ❌ Bad Process
```
1. Write 2 out of 4 tests
2. Tests pass
3. Mark [x] complete
4. Move to next task
```
**Result:** Incomplete work, test count doesn't match

### ✅ Good Process
```
1. Read task: "4 tests required, 88 → 92"
2. Write all 4 tests
3. Run `npm test` - verify 92 passing
4. Check all verification items
5. Mark [x] complete
6. Move to next task
```
**Result:** Complete work, test count matches, quality assured

---

**REMEMBER:** Tests are NOT optional. Every test task MUST be completed before moving on.

---

**END OF QUICK REFERENCE**
