---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React. Use when working with video animations, compositions, or React-based video content.
---

# Remotion Best Practices

Best practices for creating videos programmatically with Remotion in React.

## When to use

Use this skill whenever you are dealing with Remotion code to obtain domain-specific knowledge about video creation, animations, and compositions in React.

## Core Concepts

### Compositions

Compositions are the building blocks of Remotion videos. Each composition represents a video with specific dimensions, duration, and frame rate.

```tsx
import { Composition } from 'remotion';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

### Animations

Use `useCurrentFrame()` and `useVideoConfig()` for time-based animations:

```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MyComponent = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return <div style={{ opacity }}>Hello World</div>;
};
```

### Sequencing

Use `<Sequence>` to layout content over time:

```tsx
import { Sequence } from 'remotion';

export const MyVideo = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={60}>
        <Scene1 />
      </Sequence>
      <Sequence from={60} durationInFrames={90}>
        <Scene2 />
      </Sequence>
    </>
  );
};
```

## Key Patterns

### Assets

Import assets using `staticFile()`:

```tsx
import { staticFile, Img, Video, Audio } from 'remotion';

export const MyComponent = () => {
  return (
    <>
      <Img src={staticFile('logo.png')} />
      <Video src={staticFile('video.mp4')} />
      <Audio src={staticFile('audio.mp3')} />
    </>
  );
};
```

### Timing & Easing

```tsx
import { spring, interpolate } from 'remotion';

// Spring animation
const scale = spring({
  frame,
  fps,
  config: {
    damping: 200,
  },
});

// Easing
const position = interpolate(frame, [0, 100], [0, 500], {
  easing: (t) => t * t, // Ease in
});
```

### Text Animations

```tsx
import { interpolate } from 'remotion';

export const TextReveal = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  
  const charsToShow = Math.floor(interpolate(
    frame,
    [0, 30],
    [0, text.length],
    { extrapolateRight: 'clamp' }
  ));

  return <div>{text.slice(0, charsToShow)}</div>;
};
```

### Audio

```tsx
import { Audio } from 'remotion';

export const MyVideo = () => {
  return (
    <>
      <Audio src={staticFile('music.mp3')} volume={0.5} />
      <Audio 
        src={staticFile('voiceover.mp3')} 
        startFrom={30} // Start at frame 30
        endAt={120} // End at frame 120
      />
    </>
  );
};
```

## 3D with Three.js

Remotion works great with Three.js and React Three Fiber:

```tsx
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';

export const ThreeDScene = () => {
  const frame = useCurrentFrame();

  return (
    <ThreeCanvas>
      <ambientLight intensity={0.5} />
      <mesh rotation={[0, frame * 0.01, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </ThreeCanvas>
  );
};
```

## Best Practices

1. **Keep components pure**: Remotion renders each frame independently
2. **Use interpolate() for smooth animations**: Don't increment values directly
3. **Leverage spring() for natural motion**: Better than linear interpolation
4. **Optimize asset loading**: Use staticFile() for all media assets
5. **Test at different frame rates**: Ensure animations work at various fps
6. **Use TypeScript**: Better type safety for props and configurations
7. **Break down into small components**: Reusable, testable, maintainable

## Common Patterns

### Fade In/Out

```tsx
const fadeIn = interpolate(frame, [0, 30], [0, 1]);
const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0]);
const opacity = Math.min(fadeIn, fadeOut);
```

### Scale Animation

```tsx
const scale = spring({
  frame: frame - startFrame,
  fps,
  from: 0,
  to: 1,
  config: { mass: 0.5 },
});
```

### Position Animation

```tsx
const translateY = interpolate(
  frame,
  [0, 30],
  [100, 0],
  { extrapolateRight: 'clamp' }
);
```

## References

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Remotion Examples](https://github.com/remotion-dev/remotion/tree/main/packages/example)
- [Animation API](https://www.remotion.dev/docs/animate)
- [React Three Fiber Integration](https://www.remotion.dev/docs/three)

## Related Skills

This skill covers Remotion fundamentals. For more specific topics, refer to:
- Three.js integration for 3D content
- Audio handling and synchronization
- Advanced animation techniques
- Dynamic composition metadata
