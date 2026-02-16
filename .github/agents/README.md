# Custom Agents

This directory contains custom agent definitions for GitHub Copilot that you can explicitly invoke to perform specialized tasks.

## What are Custom Agents?

Custom agents are specialized AI assistants you explicitly select from a dropdown menu in GitHub Copilot. Unlike agent skills (which are automatically loaded based on context), you choose when to use a custom agent.

**Documentation:** [Create custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)

## Agents in This Repository

### humanizer
**File:** `humanizer.agent.md`

Removes signs of AI-generated writing from text to make it sound more natural and human-written.

Based on [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) guide, this agent identifies and fixes patterns including:
- Inflated symbolism and promotional language
- AI vocabulary words ("crucial", "pivotal", "testament")
- Superficial -ing analyses
- Vague attributions ("experts believe", "studies show")
- Overuse of em dashes and rule of three
- Negative parallelisms and excessive conjunctive phrases

**When to use:** When reviewing or editing documentation, README files, or any text that may contain AI-generated patterns.

### remotion
**File:** `remotion.agent.md`

Expert guidance for creating videos programmatically with Remotion in React.

Remotion is a framework for creating videos using React.js. All output should be valid React code written in TypeScript.

**When to use:** When working with video animations, compositions, or any React-based video content using Remotion.

## Custom Agents vs Agent Skills

This repository uses both concepts, which serve different purposes:

### Custom Agents (this directory)
- **What:** Specialized AI agents you explicitly invoke
- **When:** You select the agent from a dropdown menu
- **Format:** `.github/agents/[name].agent.md`
- **Control:** You decide when to use them

### Agent Skills (`.github/skills/`)
- **What:** Instructions ANY agent can automatically load
- **When:** Copilot decides based on your prompt
- **Format:** `.github/skills/[name]/SKILL.md`
- **Control:** Copilot decides when to load them

Both can coexist! For example, `humanizer` exists as both a custom agent (invoke directly when you want to humanize text) and an agent skill (loaded automatically when Copilot detects AI writing patterns).

## How to Use Custom Agents

1. Open GitHub Copilot in your editor
2. Look for the agent selector dropdown
3. Choose the agent you want to use (e.g., "humanizer")
4. Provide your prompt or content to process
5. The agent will respond with specialized guidance

## Creating New Custom Agents

To create a new custom agent:

1. Create a new file: `.github/agents/[agent-name].agent.md`
2. Add YAML frontmatter with:
   - `name` (required): Display name
   - `description` (required): What the agent does
   - `instructions` (required): Detailed instructions for the agent
3. Optionally include examples, constraints, and tools
4. Test the agent by selecting it in Copilot

## Related Directories

- **`.github/skills/`** - Agent skills that load automatically based on context
- **`.github/workflows/`** - GitHub Actions and agentic workflows
- **`.github/artifacts/`** - Historical development summaries (including humanizer integration docs)

## References

- [GitHub Copilot Custom Agents Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
