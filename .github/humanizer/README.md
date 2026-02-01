# Humanizer Integration

This directory contains resources from the [blader/humanizer](https://github.com/blader/humanizer) project to help maintain clear, natural documentation that avoids AI-generated writing patterns.

## What is Humanizer?

Humanizer is a writing guide based on [Wikipedia's "Signs of AI writing"](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup. It identifies and removes patterns that make text sound artificially generated.

## Files in This Directory

- **`SKILL.md`**: The complete humanizer skill file from the original repository
- **`HUMANIZER_GUIDE.md`**: A simplified guide tailored for this project's documentation

## Why This Matters

Good technical documentation should be:
- **Clear and direct**: Say what you mean without embellishment
- **Specific**: Use concrete examples and facts
- **Natural**: Sound like a real person wrote it
- **Helpful**: Focus on what users need to know

AI-generated text often includes:
- Inflated significance ("marking a pivotal moment")
- Vague attributions ("experts believe")
- Overused vocabulary ("additionally", "crucial", "landscape")
- Copula avoidance ("serves as" instead of "is")
- Promotional language ("boasts", "nestled in")

## Documentation Review Process

When reviewing or writing documentation:

1. **Check for AI vocabulary**: Search for words like "crucial", "pivotal", "testament", "showcase", "underscore", "landscape" (abstract use)

2. **Replace vague claims with specifics**:
   - Bad: "This is a crucial component that serves as the backbone"
   - Good: "This component handles user authentication"

3. **Use simple verbs**:
   - Bad: "serves as", "boasts", "features"
   - Good: "is", "has", "includes"

4. **Be direct**:
   - Bad: "Additionally, it's worth noting that this approach facilitates..."
   - Good: "This approach also..."

5. **Remove promotional language**:
   - Bad: "nestled in the heart of", "vibrant", "stunning", "groundbreaking"
   - Good: State facts without embellishment

## Changes Made to This Repository

The documentation in this repository was already quite clean and well-written. We made minimal improvements:

### TUTORIAL.md
- **Before**: "Adding items to your closet is fast and friction-free—designed with ADHD in mind!"
- **After**: "Adding items is fast and easy—just a few taps to get started."
- **Why**: More direct and natural, less marketing-speak

### FAQ.md
- **Before**: "especially designed for people with ADHD"
- **After**: "Built with ADHD users in mind."
- **Why**: Simpler, clearer statement

## General Findings

Most of the documentation was already well-written with:
- Clear, direct language
- Specific technical details
- Minimal promotional language
- Natural voice

This is a good example of technical documentation that doesn't rely on AI patterns.

## Using These Resources

### For New Documentation

Before writing new documentation:
1. Read `HUMANIZER_GUIDE.md` for common patterns to avoid
2. Write naturally and directly
3. Review your text against the guide
4. Have someone else read it - does it sound natural?

### For Reviewing Existing Documentation

When reviewing pull requests:
1. Check for AI vocabulary words (grep is your friend)
2. Look for vague attributions
3. Ensure claims are backed by specifics
4. Verify language is direct and clear

### Quick Grep Commands

```bash
# Check for common AI vocabulary in markdown files
grep -i "crucial\|pivotal\|testament\|showcase\|underscore\|serves as\|boasts" *.md

# Check for promotional language
grep -i "nestled\|vibrant\|stunning\|groundbreaking\|breathtaking" *.md

# Check for vague attributions
grep -i "experts believe\|studies show\|research indicates" *.md
```

## References

- [Original Humanizer Repository](https://github.com/blader/humanizer)
- [Wikipedia: Signs of AI Writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
- [Softaworks Agent Toolkit](https://github.com/softaworks/agent-toolkit) - Contains additional useful writing skills
- [GitHub Copilot Agents Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Remotion AI Skills Documentation](https://www.remotion.dev/docs/ai/skills) - Standard format for AI agent skills

## Contributing

When contributing documentation to this project:
- Focus on clarity over cleverness
- Be specific and concrete
- Avoid marketing speak
- Write like you're explaining to a friend
- Read your text out loud - does it sound natural?

Remember: The goal is helpful documentation that users can understand quickly. Technical documentation doesn't need to "sell" itself - it needs to inform and guide.
