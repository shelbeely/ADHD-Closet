'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Item {
  id: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
}

interface HangingCardProps {
  item: Item;
  position: [number, number, number];
  onClick?: () => void;
}

function HangingCard({ item, position, onClick }: HangingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [hovered, setHovered] = useState(false);

  // Load texture lazily
  useEffect(() => {
    if (item.thumbnailUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        item.thumbnailUrl,
        (loadedTexture) => {
          setTexture(loadedTexture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
        }
      );
    }
  }, [item.thumbnailUrl]);

  // Hover animation
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  }, [hovered]);

  return (
    <group position={position}>
      {/* Hanger hook */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Card with item image */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1, 1.2]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            emissive={hovered ? '#4a148c' : '#000000'}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        ) : (
          <meshStandardMaterial
            color="#e8d6f0"
            side={THREE.DoubleSide}
            emissive={hovered ? '#4a148c' : '#000000'}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        )}
      </mesh>

      {/* Card shadow/backing */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.02, 1.22]} />
        <meshStandardMaterial color="#333333" side={THREE.DoubleSide} />
      </mesh>

      {/* Label below card */}
      <mesh position={[0, -0.8, 0]}>
        <planeGeometry args={[1, 0.2]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Rail({ length }: { length: number }) {
  return (
    <group>
      {/* Horizontal rail */}
      <mesh position={[length / 2, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, length, 16]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Left support */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Right support */}
      <mesh position={[length, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
}

function Scene({ items, onItemClick }: { items: Item[]; onItemClick?: (item: Item) => void }) {
  const spacing = 1.5; // Space between hanging items
  const railLength = Math.max(items.length * spacing, 5);

  return (
    <>
      {/* Lighting setup for Material Design 3 feel */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Rail structure */}
      <Rail length={railLength} />

      {/* Hanging items */}
      {items.map((item, index) => (
        <HangingCard
          key={item.id}
          item={item}
          position={[index * spacing + spacing / 2, 0, 0]}
          onClick={() => onItemClick?.(item)}
        />
      ))}

      {/* Floor for depth perception */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[railLength / 2, -0.7, 0]} receiveShadow>
        <planeGeometry args={[railLength + 2, 6]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Camera and controls */}
      <PerspectiveCamera makeDefault position={[railLength / 2, 1, 4]} fov={60} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
        target={[railLength / 2, 0, 0]}
      />
    </>
  );
}

interface ClosetRailProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
  className?: string;
}

export default function ClosetRail({ items, onItemClick, className = '' }: ClosetRailProps) {
  const [isClient, setIsClient] = useState(false);

  // Only render Three.js on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-surface-container rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-on-surface-variant text-center p-8">
          <div className="text-6xl mb-4">👔</div>
          <p className="text-title-medium">Loading 3D Closet Rail...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`bg-surface-container rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-on-surface-variant text-center p-8">
          <div className="text-6xl mb-4">🪝</div>
          <p className="text-title-medium mb-2">Your closet rail is empty</p>
          <p className="text-body-medium">Add some items to see them hanging here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container rounded-2xl overflow-hidden ${className}`}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene items={items} onItemClick={onItemClick} />
        </Suspense>
      </Canvas>
      
      {/* ADHD-optimized controls hint (progressive disclosure) */}
      <div className="absolute bottom-4 left-4 bg-surface-variant/90 backdrop-blur-sm rounded-xl px-3 py-2 text-on-surface-variant text-label-small">
        <p className="font-medium mb-1">Controls:</p>
        <p>🖱️ Drag to rotate • Scroll to zoom • Click items to view</p>
      </div>
    </div>
  );
}
