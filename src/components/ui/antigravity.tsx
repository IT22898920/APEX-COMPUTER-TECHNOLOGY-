'use client'

/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

// Global mouse position store
const mouseStore = { x: 0, y: 0, normalizedX: 0, normalizedY: 0 }

interface AntigravityInnerProps {
  count?: number
  magnetRadius?: number
  ringRadius?: number
  waveSpeed?: number
  waveAmplitude?: number
  particleSize?: number
  lerpSpeed?: number
  color?: string
  autoAnimate?: boolean
  particleVariance?: number
  rotationSpeed?: number
  depthFactor?: number
  pulseSpeed?: number
  particleShape?: 'capsule' | 'sphere' | 'box' | 'tetrahedron'
  fieldStrength?: number
}

interface Particle {
  t: number
  factor: number
  speed: number
  xFactor: number
  yFactor: number
  zFactor: number
  mx: number
  my: number
  mz: number
  cx: number
  cy: number
  cz: number
  vx: number
  vy: number
  vz: number
  randomRadiusOffset: number
}

function AntigravityInner({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#FF9FFC',
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10
}: AntigravityInnerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const globalRotationRef = useRef(0)
  const smoothMouse = useRef({ x: 0, y: 0 })

  const particles = useMemo(() => {
    const temp: Particle[] = []
    const width = viewport.width || 100
    const height = viewport.height || 100

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -50 + Math.random() * 100
      const yFactor = -50 + Math.random() * 100
      const zFactor = -50 + Math.random() * 100

      const x = (Math.random() - 0.5) * width
      const y = (Math.random() - 0.5) * height
      const z = (Math.random() - 0.5) * 20

      const randomRadiusOffset = (Math.random() - 0.5) * 2

      temp.push({
        t,
        factor,
        speed,
        xFactor,
        yFactor,
        zFactor,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        vx: 0,
        vy: 0,
        vz: 0,
        randomRadiusOffset
      })
    }
    return temp
  }, [count, viewport.width, viewport.height])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const time = state.clock.getElapsedTime()

    // Update global rotation
    globalRotationRef.current += rotationSpeed * 0.01
    const globalRotation = globalRotationRef.current

    // Get target position
    let targetX = 0
    let targetY = 0

    if (autoAnimate) {
      // Auto-animate mouse position in a circular pattern
      const animSpeed = 0.5
      targetX = Math.sin(time * animSpeed) * (viewport.width * 0.3)
      targetY = Math.cos(time * animSpeed) * (viewport.height * 0.3)
    } else {
      // Use mouse position from global store
      targetX = mouseStore.normalizedX * (viewport.width * 0.5)
      targetY = mouseStore.normalizedY * (viewport.height * 0.5)
    }

    // Smooth the mouse movement
    smoothMouse.current.x += (targetX - smoothMouse.current.x) * 0.1
    smoothMouse.current.y += (targetY - smoothMouse.current.y) * 0.1
    targetX = smoothMouse.current.x
    targetY = smoothMouse.current.y

    particles.forEach((particle, i) => {
      let { t, speed, mx, my, mz, cz, randomRadiusOffset } = particle

      t = particle.t += speed / 2

      const projectionFactor = 1 - cz / 50
      const projectedTargetX = targetX * projectionFactor
      const projectedTargetY = targetY * projectionFactor

      const dx = mx - projectedTargetX
      const dy = my - projectedTargetY
      const dist = Math.sqrt(dx * dx + dy * dy)

      let targetPos = { x: mx, y: my, z: mz * depthFactor }

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation

        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude)
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1))

        const currentRingRadius = ringRadius + wave + deviation

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle)
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle)
        targetPos.z = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor)
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed

      dummy.position.set(particle.cx, particle.cy, particle.cz)

      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz)
      dummy.rotateX(Math.PI / 2)

      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
      )

      const distFromRing = Math.abs(currentDistToMouse - ringRadius)
      let scaleFactor = 1 - distFromRing / 10

      scaleFactor = Math.max(0, Math.min(1, scaleFactor))

      const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize
      dummy.scale.set(finalScale, finalScale, finalScale)

      dummy.updateMatrix()

      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === 'capsule' && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === 'sphere' && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === 'box' && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === 'tetrahedron' && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

interface AntigravityProps extends AntigravityInnerProps {
  className?: string
}

export default function Antigravity({ className, autoAnimate = false, ...props }: AntigravityProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoAnimate) return // Don't track mouse if auto-animating

    const handleMouseMove = (e: MouseEvent) => {
      // Get normalized mouse position (-1 to 1)
      mouseStore.x = e.clientX
      mouseStore.y = e.clientY
      mouseStore.normalizedX = (e.clientX / window.innerWidth) * 2 - 1
      mouseStore.normalizedY = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [autoAnimate])

  return (
    <div ref={containerRef} className={`w-full h-full ${className || ''}`}>
      <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
        <AntigravityInner autoAnimate={autoAnimate} {...props} />
      </Canvas>
    </div>
  )
}
