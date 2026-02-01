# GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot, following the [official GitHub agent skills format](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that Copilot can load when relevant to improve its performance in specialized tasks. Agent Skills is an [open standard](https://github.com/agentskills/agentskills), used by a range of different agents.

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

- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
- [Remotion AI Skills](https://www.remotion.dev/docs/ai/skills) - Standard format for AI agent skills
- [CloudAI-X Three.js Skills](https://github.com/CloudAI-X/threejs-skills) - Three.js skills for Claude Code
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [GitHub Awesome Copilot Collection](https://github.com/github/awesome-copilot)

## Legacy Note

The `.github/agents/` directory contains an older format. Skills in `.github/skills/` follow the official GitHub standard and will be used by GitHub Copilot.
