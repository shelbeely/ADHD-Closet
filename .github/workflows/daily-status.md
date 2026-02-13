---
description: |
  Creates a daily status report summarizing repository activity,
  open issues, recent PRs, and project phase progress for Twin Style.

on:
  schedule: daily
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

network: defaults

tools:
  github:
    lockdown: false

safe-outputs:
  create-issue:
    title-prefix: "[daily-status] "
    labels: [report]
    close-older-issues: true
---

# Daily Status Report

Create a daily status report for the Twin Style repository as a GitHub issue.

## Project Context

Twin Style is an ADHD-friendly wardrobe organizer with these development phases:
- ✅ Phase 0-3: Setup, data models, mobile UI, AI jobs (complete)
- 🚧 Phase 4: Desktop power tools (in progress)
- 🚧 Phase 5: Outfit generation (in progress)
- ⏳ Phase 6-8: 3D visualization, export/import, polish (planned)

## What to Include

- **Recent activity**: Issues opened/closed, PRs merged, commits in the last 24 hours
- **Open issues summary**: Count and categories of open issues
- **Phase progress**: Any movement on current development phases
- **Action items**: What needs attention from maintainers
- **Build health**: Status of recent workflow runs

## Style

- Keep it short and scannable — bullet points over paragraphs
- Use emojis sparingly for visual markers (✅ ⚠️ 📋)
- Focus on what changed and what needs attention
- Skip sections with no activity rather than saying "nothing happened"

## Process

1. Gather recent repository activity (last 24 hours)
2. Check open issues and their labels
3. Review recent workflow run statuses
4. Create a GitHub issue with the summary
