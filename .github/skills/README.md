# GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot, following the [official GitHub agent skills format](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that Copilot can load when relevant to improve its performance in specialized tasks. Agent Skills is an [open standard](https://github.com/agentskills/agentskills), used by a range of different agents.

## Agent Skills vs Custom Agents

This repository uses both concepts, which serve different purposes:

### Agent Skills (`.github/skills/`)
- **What**: Instructions/resources that ANY agent can load when relevant
- **When to use**: Copilot decides based on your prompt and the skill's description
- **Format**: `.github/skills/[skill-name]/SKILL.md`
- **Documentation**: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

### Custom Agents (`.github/agents/`)
- **What**: Specialized AI agents you can directly invoke with custom prompts and tools
- **When to use**: You explicitly select the agent from a dropdown
- **Format**: `.github/agents/[agent-name].agent.md`
- **Documentation**: [Create custom agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)

Both can coexist! For example, `humanizer` exists as both:
- **Custom agent**: `.github/agents/humanizer.agent.md` - Invoke directly when you want to humanize text
- **Agent skill**: `.github/skills/humanizer/SKILL.md` - Copilot loads automatically when detecting AI writing patterns

## Skills in this Repository

### humanizer

Removes signs of AI-generated writing from text. Use when editing or reviewing text to make it sound more natural and human-written.

Location: `.github/skills/humanizer/SKILL.md`

Based on [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) guide.

## How Skills Work

When performing tasks, Copilot will decide when to use these skills based on your prompt and the skill's description. When Copilot chooses to use a skill, the `SKILL.md` file will be injected in the agent's context, giving the agent access to your instructions.

## Creating New Skills

To create a new skill:

1. Create a subdirectory under `.github/skills/` (e.g., `.github/skills/my-skill/`)
2. Create a `SKILL.md` file with YAML frontmatter containing:
   - `name` (required): A unique identifier (lowercase, hyphens for spaces)
   - `description` (required): What the skill does and when to use it
3. Add instructions, examples, and guidelines in the Markdown body
4. Optionally, add scripts, examples, or resources to the skill's directory

## Related Resources

- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) - About agent skills
- [GitHub Custom Agents Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents) - Create custom agents
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
- [Remotion AI Skills](https://www.remotion.dev/docs/ai/skills) - Standard format for AI agent skills
- [CloudAI-X Three.js Skills](https://github.com/CloudAI-X/threejs-skills) - Three.js skills for Claude Code
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [GitHub Awesome Copilot Collection](https://github.com/github/awesome-copilot)

## Note on Directory Structure

- **`.github/skills/`** - Agent skills (this directory) - Instructions any agent can load automatically
- **`.github/agents/`** - Custom agents - Specialized agents you explicitly invoke

Both directories are valid and serve different purposes according to GitHub's documentation.
