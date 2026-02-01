---
name: threejs-fundamentals
description: Three.js scene setup, cameras, renderer, and 3D basics. Use when setting up 3D scenes, creating cameras, configuring renderers, or working with 3D objects and transforms.
---

# Three.js Fundamentals

Core concepts and best practices for Three.js 3D development.

## Quick Start

```javascript
import * as THREE from "three";

// Create scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Add a mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add light
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

camera.position.z = 5;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

## Core Classes

### Scene

Container for all 3D objects, lights, and cameras.

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0xffffff, 1, 100);
```

### Cameras

**PerspectiveCamera** - Most common, simulates human eye.

```javascript
const camera = new THREE.PerspectiveCamera(
  75, // Field of view (degrees)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000, // Far clipping plane
);

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
```

**OrthographicCamera** - No perspective distortion, good for isometric views.

```javascript
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000,
);
```

### WebGLRenderer

```javascript
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Render
renderer.render(scene, camera);
```

### Mesh

Combines geometry and material.

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);

mesh.position.set(x, y, z);
mesh.rotation.set(x, y, z);
mesh.scale.set(x, y, z);
mesh.castShadow = true;
mesh.receiveShadow = true;

scene.add(mesh);
```

### Group

Empty container for organizing objects.

```javascript
const group = new THREE.Group();
group.add(mesh1);
group.add(mesh2);
scene.add(group);

// Transform entire group
group.position.x = 5;
group.rotation.y = Math.PI / 4;
```

## Coordinate System

Three.js uses a **right-handed coordinate system**:

- **+X** points right
- **+Y** points up
- **+Z** points toward viewer (out of screen)

```javascript
// Axes helper (Red=X, Green=Y, Blue=Z)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

## Materials

```javascript
// Basic (unlit)
new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Standard (PBR)
new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0.5,
  roughness: 0.5,
  map: texture,
});

// Physical (advanced PBR)
new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  metalness: 0,
  roughness: 0.1,
  transmission: 1,
  thickness: 0.5,
});
```

## Lights

```javascript
// Ambient - illuminates all objects equally
const ambient = new THREE.AmbientLight(0xffffff, 0.5);

// Directional - parallel rays (like sun)
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
dirLight.castShadow = true;

// Point - emits in all directions
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);

// Spot - cone of light
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 4;
```

## Common Patterns

### Animation Loop

```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  
  mesh.rotation.y += delta * 0.5;
  
  renderer.render(scene, camera);
}
animate();
```

### Responsive Canvas

```javascript
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener("resize", onWindowResize);
```

### Cleanup

```javascript
function dispose() {
  mesh.geometry.dispose();
  mesh.material.dispose();
  texture.dispose();
  scene.remove(mesh);
  renderer.dispose();
}
```

## React Integration (React Three Fiber)

This project uses React Three Fiber for the 3D closet rail:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export const Scene3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      <OrbitControls />
    </Canvas>
  );
};
```

## Best Practices

1. **Dispose properly**: Always dispose geometries, materials, and textures
2. **Limit draw calls**: Merge static geometries, use instancing
3. **Optimize textures**: Use power-of-2 sizes, enable mipmaps
4. **Use proper materials**: MeshBasicMaterial for unlit, MeshStandardMaterial for PBR
5. **Enable frustum culling**: Default on, ensures off-screen objects aren't rendered
6. **Profile performance**: Use renderer.info to track draw calls and triangles
7. **Reuse materials**: Share materials between meshes when possible

## Performance Tips

```javascript
// Merge static geometries
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const merged = mergeGeometries([geo1, geo2, geo3]);

// Instancing for repeated objects
const count = 1000;
const mesh = new THREE.InstancedMesh(geometry, material, count);
for (let i = 0; i < count; i++) {
  mesh.setMatrixAt(i, matrix);
}
mesh.instanceMatrix.needsUpdate = true;

// LOD (Level of Detail)
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);
lod.addLevel(medDetailMesh, 50);
lod.addLevel(lowDetailMesh, 100);
```

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei Helpers](https://github.com/pmndrs/drei)

## Related Skills

This skill covers Three.js fundamentals. For more specific topics, refer to:
- Geometry creation and manipulation
- Material properties and shaders
- Lighting and shadows
- Animation and physics
- Loaders and asset management
