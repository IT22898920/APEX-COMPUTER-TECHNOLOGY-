'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

// 3D Laptop Model
function Laptop({ position = [0, 0, 0] as [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={position} rotation={[0.1, -0.3, 0]}>
        {/* Laptop Base */}
        <mesh position={[0, -0.05, 0]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[2.4, 0.08, 1.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Keyboard area */}
        <mesh position={[0, 0, 0.1]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[2.2, 0.02, 1.2]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Trackpad */}
        <mesh position={[0, 0.01, 0.5]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.8, 0.01, 0.5]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.2} />
        </mesh>

        {/* Screen Frame */}
        <group position={[0, 0.9, -0.75]} rotation={[0.3, 0, 0]}>
          <mesh>
            <boxGeometry args={[2.4, 1.5, 0.06]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Screen Display */}
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[2.1, 1.3, 0.01]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.5}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>

          {/* Screen glow */}
          <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#3b82f6" distance={3} />
        </group>
      </group>
    </Float>
  )
}

// 3D Monitor
function Monitor({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + 1) * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef} position={position} scale={0.6}>
        {/* Monitor Screen */}
        <mesh>
          <boxGeometry args={[2.8, 1.8, 0.1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Screen Display */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.5, 1.5, 0.01]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Stand Neck */}
        <mesh position={[0, -1.1, -0.2]}>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Stand Base */}
        <mesh position={[0, -1.4, 0]}>
          <boxGeometry args={[1, 0.08, 0.6]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

// Floating CPU/Processor Chip
function ProcessorChip({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
          {/* Main chip body */}
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial
            color="#059669"
            metalness={0.9}
            roughness={0.1}
            emissive="#059669"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Chip center (die) */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.4]} />
          <meshStandardMaterial
            color="#a3a3a3"
            metalness={1}
            roughness={0.1}
          />
        </mesh>

        {/* Pins/contacts visualization */}
        {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
          [-0.3, -0.1, 0.1, 0.3].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, -0.06, z]}>
              <boxGeometry args={[0.05, 0.02, 0.05]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
          ))
        ))}
      </group>
    </Float>
  )
}

// Floating RAM Stick
function RAMStick({ position, rotation = [0, 0, 0] as [number, number, number] }: {
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={meshRef} position={position} rotation={rotation} scale={0.7}>
        {/* PCB Board */}
        <mesh>
          <boxGeometry args={[2, 0.5, 0.05]} />
          <meshStandardMaterial color="#065f46" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Memory chips */}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0.03]}>
            <boxGeometry args={[0.25, 0.3, 0.04]} />
            <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}

        {/* Gold contacts */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  )
}

// Data Flow Particles
function DataParticles({ count = 80 }) {
  const mesh = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Create particles in a flowing pattern
      const angle = (i / count) * Math.PI * 4
      const radius = 3 + Math.random() * 3
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2

      // Tech colors - cyan, blue, green
      const colorChoice = Math.random()
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.02; colors[i * 3 + 1] = 0.71; colors[i * 3 + 2] = 0.83 // cyan
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.23; colors[i * 3 + 1] = 0.51; colors[i * 3 + 2] = 0.96 // blue
      } else {
        colors[i * 3] = 0.02; colors[i * 3 + 1] = 0.82; colors[i * 3 + 2] = 0.44 // green
      }
    }

    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1

      // Animate particles flowing upward
      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.01
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = -3
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  )
}

// Circuit Board Lines
function CircuitLines() {
  const linesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.05
    }
  })

  const lines = useMemo(() => {
    const lineData = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const length = 2 + Math.random() * 2
      lineData.push({
        start: [Math.cos(angle) * 2, Math.sin(angle) * 2, -2] as [number, number, number],
        end: [Math.cos(angle) * (2 + length), Math.sin(angle) * (2 + length), -2] as [number, number, number],
        color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#3b82f6' : '#10b981'
      })
    }
    return lineData
  }, [])

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[
          (line.start[0] + line.end[0]) / 2,
          (line.start[1] + line.end[1]) / 2,
          line.start[2]
        ]}>
          <boxGeometry args={[
            Math.sqrt(Math.pow(line.end[0] - line.start[0], 2) + Math.pow(line.end[1] - line.start[1], 2)),
            0.02,
            0.02
          ]} />
          <meshStandardMaterial
            color={line.color}
            emissive={line.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main Scene
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -5, 5]} intensity={0.5} color="#3b82f6" />
      <spotLight
        position={[0, 10, 5]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        color="#06b6d4"
      />

      {/* Main Laptop - Center */}
      <Laptop position={[0, 0, 0]} />

      {/* Monitor - Right side */}
      <Monitor position={[3.5, 0.5, -1]} />

      {/* Processor Chip - Floating */}
      <ProcessorChip position={[-3, 1, -0.5]} />

      {/* RAM Stick */}
      <RAMStick position={[-2.5, -1, 0.5]} rotation={[0, 0.5, 0.2]} />

      {/* Data Particles - Background */}
      <DataParticles count={100} />

      {/* Circuit Lines - Background decoration */}
      <CircuitLines />
    </>
  )
}

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
