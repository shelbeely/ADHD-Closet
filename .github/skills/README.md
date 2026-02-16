# GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot, following the [official GitHub agent skills format](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).

## What are Agent Skills?

Agent Skills are folders of instructions, scripts, and resources that Copilot can load when relevant to improve its performance in specialized tasks. Agent Skills is an [open standard](https://github.com/agentskills/agentskills), used by a range of different agents.

## Skills.sh Integration

This repository integrates with [skills.sh](https://skills.sh) — a registry of reusable agent skills from the community. The coding agent environment has Node.js 22 and the **find-skills** skill installed.

### What is the find-skills Skill?

The `find-skills` skill is an **agent instruction set** (not the CLI itself) that teaches agents:
- When to search for skills (user asks "how do I do X", "find a skill for X", etc.)
- How to effectively search and present skills to users
- Common skill categories and search patterns
- How to help users install and use discovered skills

The skills CLI (`npx skills`) is available via Node.js/npm, while the find-skills **skill** provides the knowledge for agents to use it effectively.

### Two Types of Skills

**1. Local Skills (This Directory)**
- Project-specific skills stored in `.github/skills/`
- Automatically available to all agents
- Maintained as part of the repository
- Examples: humanizer, remotion, threejs-fundamentals, **find-skills** (installed from registry)

**2. Registry Skills (skills.sh)**
- Community skills from https://skills.sh
- Installed on-demand via `npx skills add <owner/repo@skill>`
- Extend agent capabilities dynamically
- Examples: testing frameworks, deployment scripts, documentation tools

### How Agents Should Use Skills

**Priority Order:**
1. **Check local skills first** - Browse `.github/skills/` for project-specific capabilities
2. **Search registry** - Run `npx skills find` (interactive) or `npx skills find <keyword>` (search)
3. **Install if useful** - Add registry skills with `npx skills add <owner/repo@skill>`
4. **Use the skill** - Follow the skill's instructions and examples

**When to search (from find-skills skill):**

Search when the user:
- Asks "how do I do X" where X might be a common task
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment)

### Discovering Registry Skills

The Skills CLI provides powerful search capabilities:

```bash
# Interactive search with fuzzy finder (fzf-style)
npx skills find

# Search by keyword
npx skills find "react testing"
npx skills find "API documentation"
npx skills find "pr review"
npx skills find "changelog"

# Example output:
# Install with npx skills add <owner/repo@skill>
#
# vercel-labs/agent-skills@vercel-react-best-practices
# https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

**Common skill categories:**
- Web Development: react, nextjs, typescript, css, tailwind
- Testing: testing, jest, playwright, e2e
- DevOps: deploy, docker, kubernetes, ci-cd
- Documentation: docs, readme, changelog, api-docs
- Code Quality: review, lint, refactor, best-practices
- Design: ui, ux, design-system, accessibility
- Productivity: workflow, automation, git

### Installing Registry Skills

Install skills from the registry when they match your needs:

```bash
# Install a specific skill using @syntax
npx skills add vercel-labs/agent-skills@frontend-design

# Non-interactive installation (CI/CD friendly)
npx skills add vercel-labs/agent-skills@frontend-design -y

# Install globally (user-level)
npx skills add vercel-labs/agent-skills@frontend-design -g -y

# Install to specific agents
npx skills add vercel-labs/agent-skills --agent claude-code --agent cursor

# Install all skills from a repository
npx skills add vercel-labs/agent-skills --all

# List available skills without installing
npx skills add vercel-labs/agent-skills --list
```

**Note:** The find-skills skill is pre-installed in the Copilot environment (see `.github/workflows/copilot-setup-steps.yml`). It provides agent instructions for effective skill discovery.

### When to Search for Skills

Before writing significant new code, search for relevant skills:

- Implementing tests → `npx skills find "testing"`
- Writing API docs → `npx skills find "API documentation"`
- Creating build scripts → `npx skills find "build automation"`
- Adding CI/CD → `npx skills find "deployment"`
- Setting up monitoring → `npx skills find "observability"`
- Implementing auth → `npx skills find "authentication"`

### Skill-First Development

Follow this workflow:
1. **Search first** - Check local skills and registry before coding
2. **Reuse existing** - Prefer tested skills over custom implementations
3. **Install dynamically** - Add registry skills during development
4. **Document useful finds** - Update this README with helpful registry skills

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

### remotion-best-practices

Best practices for creating videos programmatically with Remotion in React. Use when working with video animations, compositions, or React-based video content.

Location: `.github/skills/remotion/SKILL.md`

Covers core Remotion concepts including compositions, animations, sequencing, assets, and Three.js integration. Based on [Remotion official skills](https://github.com/remotion-dev/remotion/tree/main/packages/skills).

### threejs-fundamentals

Three.js scene setup, cameras, renderer, and 3D basics. Use when setting up 3D scenes, creating cameras, configuring renderers, or working with 3D objects and transforms.

Location: `.github/skills/threejs-fundamentals/SKILL.md`

Essential for working with the 3D closet rail visualization in this project. Covers scene setup, materials, lights, React Three Fiber integration, and performance optimization. Based on [CloudAI-X Three.js skills](https://github.com/CloudAI-X/threejs-skills).

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

- [Skills.sh](https://skills.sh) - Registry of reusable agent skills
- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) - About agent skills
- [GitHub Custom Agents Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents) - Create custom agents
- [Agent Skills Open Standard](https://github.com/agentskills/agentskills)
- [Remotion AI Skills](https://www.remotion.dev/docs/ai/skills) - Standard format for AI agent skills
- [CloudAI-X Three.js Skills](https://github.com/CloudAI-X/threejs-skills) - Three.js skills for Claude Code
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [GitHub Awesome Copilot Collection](https://github.com/github/awesome-copilot)

## Useful Registry Skills

This section documents useful skills discovered from the registry that have been evaluated for this project.

### Pre-installed Skills

- **vercel-labs/skills/find-skills** - Agent instruction set for skill discovery (pre-installed in Copilot environment)
  - Teaches agents when and how to search for skills
  - Provides patterns for presenting skills to users
  - Includes common skill categories and search tips
  - Source: https://skills.sh/vercel-labs/skills/find-skills

### Official Skills Repositories

- **vercel-labs/agent-skills** - Official Vercel Labs agent skills collection
  - Browse at: https://github.com/vercel-labs/agent-skills
  - Install specific skills: `npx skills add vercel-labs/agent-skills@<skill-name>`
  - Install all: `npx skills add vercel-labs/agent-skills --all`
  - List available: `npx skills add vercel-labs/agent-skills --list`

### Recommended Skills to Explore

When working on specific features, consider searching for these types of skills:

- **React/Next.js**: `npx skills find "react"` or `npx skills find "nextjs"`
  - Example: `vercel-labs/agent-skills@vercel-react-best-practices`
- **Testing**: `npx skills find "testing"` - Unit tests, integration tests, E2E tests
- **API Documentation**: `npx skills find "api docs"` - OpenAPI, Swagger, REST documentation
- **Database**: `npx skills find "database"` - Migrations, seeding, optimization
- **Deployment**: `npx skills find "deploy"` - CI/CD, Docker, cloud platforms
- **Security**: `npx skills find "security"` - Authentication, authorization, vulnerability scanning
- **Performance**: `npx skills find "performance"` - Optimization, profiling, monitoring
- **TypeScript**: `npx skills find "typescript"` - TypeScript best practices and patterns
- **Code Quality**: `npx skills find "review"` or `npx skills find "lint"`
  - Example: PR review skills, code quality checks

### How to Discover More

```bash
# Interactive browsing with fuzzy finder
npx skills find

# Browse the skills catalog online
open https://skills.sh
```

**Note:** This section can be expanded as useful skills are discovered and validated for the project. When you find a useful skill, document it here with installation instructions.

## Note on Directory Structure

- **`.github/skills/`** - Agent skills (this directory) - Instructions any agent can load automatically
- **`.github/agents/`** - Custom agents - Specialized agents you explicitly invoke

Both directories are valid and serve different purposes according to GitHub's documentation.
