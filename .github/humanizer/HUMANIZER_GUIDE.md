# Humanizer Guide for Documentation

This guide helps identify and remove AI-generated writing patterns from our documentation, based on the [blader/humanizer](https://github.com/blader/humanizer) skill and Wikipedia's "Signs of AI writing" guide.

## Key Principles

1. **Identify AI patterns** - Scan for the patterns listed below
2. **Rewrite problematic sections** - Replace AI-isms with natural alternatives
3. **Preserve meaning** - Keep the core message intact
4. **Maintain voice** - Match the intended tone (technical documentation should be clear and direct)
5. **Add clarity** - Remove fluff and be specific

## Common AI Patterns to Avoid

### Content Patterns

1. **Significance inflation**: Avoid "marking a pivotal moment", "vital role", "testament to"
   - Bad: "marking a pivotal moment in the evolution of..."
   - Good: "was established in 1989 to..."

2. **Promotional language**: Avoid "nestled", "boasts", "vibrant", "stunning"
   - Bad: "nestled within the breathtaking region"
   - Good: "located in the region"

3. **Vague attributions**: Be specific with sources
   - Bad: "Experts believe it plays a crucial role"
   - Good: "according to the 2024 user survey..."

### Language Patterns

4. **AI vocabulary**: Limit use of "Additionally", "crucial", "delve", "enhance", "fostering", "landscape" (abstract), "pivotal", "showcase", "testament", "underscore", "vibrant"
   - Bad: "Additionally, this serves as a testament to..."
   - Good: "This also shows..."

5. **Copula avoidance**: Use "is"/"are" instead of "serves as", "boasts", "features"
   - Bad: "serves as an exhibition space"
   - Good: "is an exhibition space"

6. **Rule of three**: Don't force everything into groups of three
   - Natural: List the actual number of items needed

### Style Patterns

7. **Em dash overuse**: Use commas or periods instead
   - Bad: "institutions—not the people—yet this continues—"
   - Good: "institutions, not the people, but this continues."

8. **Formulaic challenges**: Replace generic "Despite challenges... continues to thrive" with specific facts
   - Bad: "Despite challenges, the project continues to thrive"
   - Good: "The project addressed authentication issues in v2.0"

## For Technical Documentation

- Be direct and specific
- Use active voice when possible
- Include concrete examples
- Avoid marketing speak
- State facts without embellishment
- Use "is" and "are" naturally
- Don't inflate significance - let the work speak for itself

## Application to This Repository

When reviewing documentation:
1. Search for AI vocabulary words
2. Replace vague claims with specific facts
3. Simplify inflated language
4. Use concrete examples
5. Be direct about what the software does

Remember: Good technical documentation is clear, concise, and factual. It doesn't need to sell itself.
