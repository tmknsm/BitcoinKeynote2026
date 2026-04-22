import { useEffect, useRef, useCallback, useState } from "react"

const FIELD_W = 354
const FIELD_H = 560
const FIELD_Y = 0

function hash2d(ix, iy) {
  let h = ix * 374761393 + iy * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return (h & 0x7fffffff) / 0x7fffffff
}

function smoothNoise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const n00 = hash2d(ix, iy)
  const n10 = hash2d(ix + 1, iy)
  const n01 = hash2d(ix, iy + 1)
  const n11 = hash2d(ix + 1, iy + 1)
  const nx0 = n00 + (n10 - n00) * sx
  const nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sy
}

function fbmNoise(x, y, octaves) {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxVal = 0
  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency) * amplitude
    maxVal += amplitude
    amplitude *= 0.5
    frequency *= 2
  }
  return value / maxVal
}

export function ParticleField({
  width = 393,
  height = 844,
  bgColor = "#01E014",
  particleColor = "0, 0, 0",
  activated = false,
  onFreezeRequest = false,
  onFreezeComplete,
  avatarSrc,
  nameSrc,
  personName,
  broadcastMode = false,
  chaserEnabled = true,
  onAvatarClick,
  dispersing = false,
  payWave = false,
  clearAvatars = false,
  selectAvatarRef,
  nuxMode = false,
  nuxError = false,
  noBluetooth = false,
  hideName = false,
  colorMode = "dark",
  nuxErrorImageUrl,
  bluetoothIconUrl,
  avatarImageUrl,
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(0)
  const particlesRef = useRef([])
  const activatedRef = useRef(activated)
  const chaserEnabledRef = useRef(chaserEnabled)
  const chaserOpacityRef = useRef(0)
  const nuxModeRef = useRef(nuxMode)
  const nuxErrorRef = useRef(nuxError)
  const nuxErrorImgRef = useRef(null)
  const nuxErrorPixelDataRef = useRef(null)
  const noBluetoothRef = useRef(noBluetooth)
  const colorModeRef = useRef(colorMode)
  const btIconRef = useRef({ x: 100, y: 150, vx: 1.2, vy: 0.9, imgLoaded: false })
  const btImgRef = useRef(null)
  const btPixelDataRef = useRef(null)
  const btImgW = 83
  const btImgH = 128
  const fadeInRef = useRef(0)
  const scrollOffsetRef = useRef(0)
  const frozenCirclesRef = useRef([])
  const nextIdRef = useRef(1)
  const searchCircleRef = useRef({
    x: 0, y: 0, vx: 0, vy: 0,
    phaseA: Math.random() * Math.PI * 2,
    phaseB: Math.random() * Math.PI * 2,
    phaseC: Math.random() * Math.PI * 2,
    phaseD: Math.random() * Math.PI * 2,
    initialized: false, frozen: false, frozenUntil: 0,
  })
  const SEARCH_RADIUS = 12

  const dispersingRef = useRef(false)
  const disperseStartRef = useRef(0)
  const payWaveRef = useRef(false)
  const payWaveStartRef = useRef(0)

  const [avatarOverlays, setAvatarOverlays] = useState([])

  const freezeHandledRef = useRef(false)
  const broadcastPhaseRef = useRef("idle")
  const broadcastStartRef = useRef(0)
  const [showBroadcastAvatar, setShowBroadcastAvatar] = useState(false)
  const [broadcastAvatarScale, setBroadcastAvatarScale] = useState(0)

  useEffect(() => {
    activatedRef.current = activated
    if (!activated) { frozenCirclesRef.current = []; setAvatarOverlays([]) }
  }, [activated])

  useEffect(() => { chaserEnabledRef.current = chaserEnabled }, [chaserEnabled])
  useEffect(() => { nuxModeRef.current = nuxMode }, [nuxMode])
  useEffect(() => { noBluetoothRef.current = noBluetooth }, [noBluetooth])
  useEffect(() => { colorModeRef.current = colorMode }, [colorMode])
  useEffect(() => { nuxErrorRef.current = nuxError }, [nuxError])

  useEffect(() => {
    if (!nuxErrorImageUrl) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = nuxErrorImageUrl
    img.onload = () => {
      nuxErrorImgRef.current = img
      const offscreen = document.createElement("canvas")
      offscreen.width = 200; offscreen.height = 200
      const offCtx = offscreen.getContext("2d")
      if (offCtx) { offCtx.drawImage(img, 0, 0, 200, 200); nuxErrorPixelDataRef.current = offCtx.getImageData(0, 0, 200, 200) }
    }
  }, [nuxErrorImageUrl])

  useEffect(() => {
    if (!bluetoothIconUrl) return
    const img = new Image()
    img.src = bluetoothIconUrl
    img.onload = () => {
      btImgRef.current = img; btIconRef.current.imgLoaded = true
      const offscreen = document.createElement("canvas")
      offscreen.width = btImgW; offscreen.height = btImgH
      const offCtx = offscreen.getContext("2d")
      if (offCtx) { offCtx.drawImage(img, 0, 0, btImgW, btImgH); btPixelDataRef.current = offCtx.getImageData(0, 0, btImgW, btImgH) }
    }
  }, [bluetoothIconUrl])

  useEffect(() => {
    if (dispersing && !dispersingRef.current) { dispersingRef.current = true; disperseStartRef.current = performance.now() }
    else if (!dispersing) { dispersingRef.current = false }
  }, [dispersing])

  useEffect(() => {
    if (payWave && !payWaveRef.current) { payWaveRef.current = true; payWaveStartRef.current = performance.now() }
    else if (!payWave) { payWaveRef.current = false }
  }, [payWave])

  useEffect(() => {
    if (selectAvatarRef) {
      selectAvatarRef.current = () => {
        if (avatarOverlays.length > 0) {
          const last = avatarOverlays[avatarOverlays.length - 1]
          onAvatarClick?.(last.x, last.y, last.avatarSrc)
        }
      }
    }
  }, [avatarOverlays, onAvatarClick, selectAvatarRef])

  useEffect(() => {
    if (clearAvatars) { frozenCirclesRef.current = []; setAvatarOverlays([]) }
  }, [clearAvatars])

  useEffect(() => {
    if (broadcastMode) {
      frozenCirclesRef.current = []; setAvatarOverlays([])
      broadcastPhaseRef.current = "collapse"; broadcastStartRef.current = performance.now()
      setShowBroadcastAvatar(false); setBroadcastAvatarScale(0)
      setTimeout(() => {
        broadcastPhaseRef.current = "radiate"; broadcastStartRef.current = performance.now()
        setShowBroadcastAvatar(true)
        requestAnimationFrame(() => { requestAnimationFrame(() => { setBroadcastAvatarScale(1) }) })
      }, 2100)
    } else {
      if (broadcastPhaseRef.current === "radiate" || broadcastPhaseRef.current === "collapse") {
        broadcastPhaseRef.current = "dissolve"; broadcastStartRef.current = performance.now()
        setShowBroadcastAvatar(false)
        setTimeout(() => { broadcastPhaseRef.current = "idle" }, 2000)
      } else {
        broadcastPhaseRef.current = "idle"; setShowBroadcastAvatar(false)
      }
    }
  }, [broadcastMode])

  useEffect(() => {
    if (onFreezeRequest && !freezeHandledRef.current) {
      freezeHandledRef.current = true
      const sc = searchCircleRef.current
      const cx = sc.x, cy = sc.y
      const frozenId = nextIdRef.current++
      setTimeout(() => {
        frozenCirclesRef.current.push({ id: frozenId, x: cx, y: cy, radius: 0, targetRadius: 22, opacity: 0 })
        setAvatarOverlays((prev) => [...prev, { id: frozenId, x: cx, y: cy, radius: 22, opacity: 0, showName: false, avatarSrc: avatarSrc || "", name: personName || "" }])
        requestAnimationFrame(() => { setAvatarOverlays((prev) => prev.map((a) => (a.id === frozenId ? { ...a, opacity: 1 } : a))) })
      }, 200)
      setTimeout(() => { setAvatarOverlays((prev) => prev.map((a) => (a.id === frozenId ? { ...a, showName: true } : a))) }, 800)
      setTimeout(() => { sc.frozen = false; onFreezeComplete?.() }, 3000)
    }
    if (!onFreezeRequest) { freezeHandledRef.current = false }
  }, [onFreezeRequest, onFreezeComplete, width, height])

  const circleTargetsRef = useRef([])

  const initParticles = useCallback(() => {
    const particles = []
    const dotSize = 3, gap = 12, step = dotSize + gap, overflow = 6
    const cols = Math.floor(width / step) + overflow * 2
    const rows = Math.floor(height / step) + overflow * 2
    const fieldLeft = (width - cols * step) / 2
    const fieldTop = (height - rows * step) / 2
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = fieldLeft + col * step + step / 2 + (Math.random() - 0.5) * 1.5
        const y = fieldTop + row * step + step / 2 + (Math.random() - 0.5) * 1.5
        particles.push({
          homeX: x, homeY: y, x, y, vx: 0, vy: 0,
          phaseX: Math.random() * Math.PI * 2, phaseY: Math.random() * Math.PI * 2,
          freqX: 0.104 + Math.random() * 0.13, freqY: 0.104 + Math.random() * 0.13,
          ampX: 0.12 + Math.random() * 0.18, ampY: 0.12 + Math.random() * 0.18,
          size: 3, opacity: 1,
          transDelay: Math.random() * 0.6, transScatterX: (Math.random() - 0.5) * 120, transScatterY: (Math.random() - 0.5) * 120,
          zRainDelay: Math.random() * 1.0, zStartScale: 1.3 + Math.random() * 0.7, payWaveIntensity: 0, chaserIntensity: 0, btIntensity: 0, btColorHit: 0, nuxErrorHit: 0,
          zSpawnAngle: Math.random() * Math.PI * 2, zSpawnDist: 6 + Math.random() * 14,
        })
      }
    }

    const totalParticles = particles.length
    const avatarRadius = 28, maxVisibleRadius = 165, numVisibleRings = 9
    const visibleRingStep = (maxVisibleRadius - avatarRadius) / numVisibleRings
    const dotSpacing = 15
    const targets = []
    for (let r = 0; r < numVisibleRings; r++) {
      const radius = avatarRadius + (r + 1) * visibleRingStep
      const circumference = 2 * Math.PI * radius
      const count = Math.max(6, Math.round(circumference / dotSpacing))
      for (let s = 0; s < count; s++) { targets.push({ angle: (s / count) * Math.PI * 2, radius, ringIndex: r, opacity: 1 }) }
    }
    const overflowRingStep = visibleRingStep
    let overflowRing = 0
    while (targets.length < totalParticles) {
      overflowRing++
      const radius = maxVisibleRadius + overflowRing * overflowRingStep
      const circumference = 2 * Math.PI * radius
      const count = Math.max(6, Math.round(circumference / dotSpacing))
      const fadeT = Math.min(1, overflowRing / 3)
      const ringOpacity = Math.max(0, 1 - fadeT)
      for (let s = 0; s < count && targets.length < totalParticles; s++) { targets.push({ angle: (s / count) * Math.PI * 2, radius, ringIndex: numVisibleRings + overflowRing, opacity: ringOpacity }) }
    }
    circleTargetsRef.current = targets
    return particles
  }, [width])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr; canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    particlesRef.current = initParticles()
    let lastTime = performance.now()
    const scrollSpeed = 0.15

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const isActive = activatedRef.current
      if (isActive && fadeInRef.current < 1) { fadeInRef.current = Math.min(1, fadeInRef.current + dt * 0.4) }
      else if (!isActive && fadeInRef.current > 0) { fadeInRef.current = Math.max(0, fadeInRef.current - dt * 1.5) }
      scrollOffsetRef.current += scrollSpeed
      const frozenCircles = frozenCirclesRef.current
      for (const fc of frozenCircles) { fc.radius += (fc.targetRadius - fc.radius) * dt * 5; fc.opacity = Math.min(1, fc.opacity + dt * 3) }
      ctx.clearRect(0, 0, width, height)
      if (fadeInRef.current <= 0) { animRef.current = requestAnimationFrame(animate); return }
      const globalAlpha = fadeInRef.current
      const particles = particlesRef.current
      const fieldLeft = (width - FIELD_W) / 2
      const sc = searchCircleRef.current
      const fieldCenterX = fieldLeft + FIELD_W / 2
      const fieldCenterY = FIELD_Y + FIELD_H / 2
      if (!sc.initialized) { sc.x = fieldCenterX; sc.y = fieldCenterY; sc.initialized = true }
      if (chaserEnabledRef.current && chaserOpacityRef.current < 1) { chaserOpacityRef.current = Math.min(1, chaserOpacityRef.current + dt * 1.2) }
      else if (!chaserEnabledRef.current) { chaserOpacityRef.current = 0; sc.x = fieldCenterX; sc.y = fieldCenterY }

      if (!sc.frozen && chaserEnabledRef.current) {
        if (nuxModeRef.current) { sc.x = fieldCenterX; sc.y = fieldCenterY; sc.vx = 0; sc.vy = 0; sc.phaseA += dt }
        else {
          const wanderSpeed = 0.012
          sc.phaseA += wanderSpeed * 1.0 * dt * 60; sc.phaseB += wanderSpeed * 1.7 * dt * 60
          sc.phaseC += wanderSpeed * 0.6 * dt * 60; sc.phaseD += wanderSpeed * 2.3 * dt * 60
          const wanderRangeX = FIELD_W * 0.42, wanderRangeY = FIELD_H * 0.42
          const targetCX = fieldCenterX + Math.sin(sc.phaseA) * wanderRangeX * 0.6 + Math.sin(sc.phaseB * 1.3 + 0.7) * wanderRangeX * 0.3 + Math.cos(sc.phaseC * 0.8 + 2.1) * wanderRangeX * 0.15
          const targetCY = fieldCenterY + Math.cos(sc.phaseA * 0.9 + 1.2) * wanderRangeY * 0.5 + Math.sin(sc.phaseD * 1.1 + 0.4) * wanderRangeY * 0.35 + Math.cos(sc.phaseB * 0.7 + 3.0) * wanderRangeY * 0.15
          const springK = 6.0, damp = 0.82
          sc.vx += (targetCX - sc.x) * springK * dt; sc.vy += (targetCY - sc.y) * springK * dt
          sc.vx *= damp; sc.vy *= damp
          sc.x += sc.vx * dt * 60; sc.y += sc.vy * dt * 60
          const pad = SEARCH_RADIUS + 10
          sc.x = Math.max(fieldLeft + pad, Math.min(fieldLeft + FIELD_W - pad, sc.x))
          sc.y = Math.max(FIELD_Y + pad, Math.min(FIELD_Y + FIELD_H - pad, sc.y))
        }
      }

      let nuxPulse = 0
      if (nuxModeRef.current) { const cycleTime = 3.05; const t = sc.phaseA % cycleTime; if (t < 1.2) { const p2 = t / 1.2; nuxPulse = p2 * p2 * (3 - 2 * p2) } else if (t < 1.95) { const p2 = (t - 1.2) / 0.75; nuxPulse = 1 - p2 * p2 * (3 - 2 * p2) } }
      let nuxErrorPulse = 0
      if (nuxErrorRef.current) { const cycleTime = 3.05; const t = sc.phaseA % cycleTime; if (t < 1.2) { const p2 = t / 1.2; nuxErrorPulse = p2 * p2 * (3 - 2 * p2) } else if (t < 1.95) { const p2 = (t - 1.2) / 0.75; nuxErrorPulse = 1 - p2 * p2 * (3 - 2 * p2) } }
      const effectiveSearchRadius = nuxModeRef.current ? SEARCH_RADIUS * nuxPulse : SEARCH_RADIUS
      const nuxErrorImgSize = 200
      const nuxErrorCX = fieldCenterX, nuxErrorCY = fieldCenterY
      const searchCX = sc.x, searchCY = sc.y
      const searchInfluence = effectiveSearchRadius * 3.5

      const bt = btIconRef.current
      const btCX = fieldCenterX, btCY = fieldCenterY
      let btPulse = 0
      if (noBluetoothRef.current) {
        bt.vx += dt; const cycleTime = 5.3; const t = bt.vx % cycleTime
        if (t < 2) { const p2 = t / 2; btPulse = p2 * p2 * (3 - 2 * p2) } else if (t < 3.5) { const p2 = (t - 2) / 1.5; btPulse = 1 - p2 * p2 * (3 - 2 * p2) }
      }
      const btScale = 1 + btPulse * 0.5
      const btDrawW = btImgW * btScale, btDrawH = btImgH * btScale
      bt.x = fieldCenterX - btDrawW / 2; bt.y = fieldCenterY - btDrawH / 2

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        let targetX = p.homeX, targetY = p.homeY
        let scanElevation = 0
        const chaserAlpha = chaserOpacityRef.current
        const displacementStrength = nuxModeRef.current ? 12 * nuxPulse : 12
        if (broadcastPhaseRef.current === "idle" && isActive && chaserAlpha > 0 && !nuxErrorRef.current) {
          const dxSc = p.homeX - searchCX, dySc = p.homeY - searchCY
          const distFromCircle = Math.sqrt(dxSc * dxSc + dySc * dySc)
          if (distFromCircle < searchInfluence) {
            const proximity = 1 - distFromCircle / searchInfluence
            const bell = proximity * proximity * (3 - 2 * proximity)
            scanElevation = bell * chaserAlpha
            targetY -= bell * displacementStrength * chaserAlpha
            p.chaserIntensity = Math.max(p.chaserIntensity, bell * chaserAlpha)
          }
        }
        p.btColorHit = 0
        if (noBluetoothRef.current && isActive && btPixelDataRef.current && btPulse > 0.01) {
          const relX = (p.homeX - bt.x) / btScale, relY = (p.homeY - bt.y) / btScale
          const pxX = Math.floor(relX), pxY = Math.floor(relY)
          if (pxX >= 0 && pxX < btImgW && pxY >= 0 && pxY < btImgH) {
            const idx = (pxY * btImgW + pxX) * 4
            const alpha = btPixelDataRef.current.data[idx + 3]
            if (alpha > 30) {
              const intensity = (alpha / 255) * btPulse
              p.btColorHit = intensity; p.btIntensity = Math.max(p.btIntensity, intensity)
              const dxBt = p.homeX - btCX, dyBt = p.homeY - btCY
              const dist = Math.sqrt(dxBt * dxBt + dyBt * dyBt)
              if (dist > 0.1) { const nx = dxBt / dist, ny = dyBt / dist; targetX += nx * intensity * 7; targetY += ny * intensity * 7 }
            }
          }
        }
        if (p.btIntensity > 0 && !noBluetoothRef.current) { p.btIntensity = Math.max(0, p.btIntensity - dt * 2) }
        else if (p.btIntensity > 0) { p.btIntensity = Math.max(0, p.btIntensity - dt * 0.8) }

        if (nuxErrorRef.current && isActive && nuxErrorPixelDataRef.current) {
          const relX = p.homeX - (nuxErrorCX - nuxErrorImgSize / 2), relY = p.homeY - (nuxErrorCY - nuxErrorImgSize / 2)
          const pxX = Math.floor(relX), pxY = Math.floor(relY)
          if (pxX >= 0 && pxX < nuxErrorImgSize && pxY >= 0 && pxY < nuxErrorImgSize) {
            const idx = (pxY * nuxErrorImgSize + pxX) * 4
            const r = nuxErrorPixelDataRef.current.data[idx], g = nuxErrorPixelDataRef.current.data[idx + 1], b = nuxErrorPixelDataRef.current.data[idx + 2]
            const alpha = nuxErrorPixelDataRef.current.data[idx + 3]
            const brightness = (r + g + b) / (3 * 255)
            const isShape = alpha > 30 && r > 200 && g > 200 && b > 200
            const dxErr = p.homeX - nuxErrorCX, dyErr = p.homeY - nuxErrorCY
            const dist = Math.sqrt(dxErr * dxErr + dyErr * dyErr)
            if (alpha > 10 && brightness > 0.05 && dist > 0.1) { const nx = dxErr / dist, ny = dyErr / dist; const topoLift = brightness * 1.5; targetX += nx * topoLift; targetY += ny * topoLift }
            if (isShape) {
              p.nuxErrorHit = 1
              const seed = p.homeX * 0.1 + p.homeY * 0.13; const oscTime = now * 0.004
              const oscX = Math.sin(oscTime + seed) * 2, oscY = Math.sin(oscTime * 1.2 + seed * 1.5) * 1.5
              if (dist > 0.1) { const nx = dxErr / dist, ny = dyErr / dist; targetX += nx * 3 + oscX; targetY += ny * 3 + oscY } else { targetX += oscX; targetY += oscY }
            } else { p.nuxErrorHit = 0 }
          } else { p.nuxErrorHit = 0 }
        } else if (!nuxErrorRef.current) { p.nuxErrorHit = 0 }

        if (p.chaserIntensity > 0) { p.chaserIntensity = Math.max(0, p.chaserIntensity - dt * 1.0) }

        const bPhase = broadcastPhaseRef.current
        let slotOpacity = 1
        if (bPhase !== "idle") {
          const centerX = width / 2, centerY = height / 2
          const elapsed = (now - broadcastStartRef.current) / 1000
          const circleTargets = circleTargetsRef.current
          const slot = circleTargets[i % circleTargets.length]
          const jitterAngle = slot.angle, dotRadius = slot.radius
          slotOpacity = slot.opacity
          const dotTargetX = centerX + Math.cos(jitterAngle) * dotRadius
          const dotTargetY = centerY + Math.sin(jitterAngle) * dotRadius

          if (bPhase === "collapse") {
            const delayed = Math.max(0, elapsed - p.transDelay * 0.05); const duration = 2.0
            const t = Math.min(1, delayed / duration); const ease = (1 - Math.cos(t * Math.PI)) * 0.5
            const fromX = p.homeX, fromY = p.homeY
            const scatterStrength = Math.sin(t * Math.PI)
            targetX = fromX + (dotTargetX - fromX) * ease + p.transScatterX * scatterStrength
            targetY = fromY + (dotTargetY - fromY) * ease + p.transScatterY * scatterStrength
            slotOpacity = 1 - (1 - slot.opacity) * ease
          } else if (bPhase === "radiate") {
            targetX = centerX + Math.cos(jitterAngle) * dotRadius
            targetY = centerY + Math.sin(jitterAngle) * dotRadius

            if (payWaveRef.current) {
              const pwElapsed = (now - payWaveStartRef.current) / 1000
              const pwCx = width / 2, pwStartY = 478, pwEndY = height / 2
              const travelDist = pwStartY - pwEndY, travelDuration = 1.32, circleRadius = 34
              const beforeX = targetX, beforeY = targetY

              if (pwElapsed < travelDuration) {
                const t = pwElapsed / travelDuration; const ease = t * t * (3 - 2 * t)
                const ballY = pwStartY - travelDist * ease
                const dx = targetX - pwCx, dy = targetY - ballY, dist = Math.sqrt(dx * dx + dy * dy)
                if (dist < circleRadius * 3 && dist > 0.1) {
                  const proximity = 1 - dist / (circleRadius * 3); const pushForce = proximity * proximity * 60
                  const nx = dx / dist, ny = dy / dist
                  targetX += nx * pushForce; targetY += ny * pushForce * 0.3
                }
              }
              if (pwElapsed < travelDuration + 2.475) {
                const t = Math.min(1, pwElapsed / travelDuration); const ease = t * t * (3 - 2 * t)
                const ballY = pwStartY - travelDist * ease
                if (targetY > ballY && targetY < pwStartY + 20) {
                  const trailDist = targetY - ballY, maxTrail = pwStartY - ballY + 20
                  const recoveryProgress = pwElapsed < travelDuration ? 0 : Math.min(1, (pwElapsed - travelDuration) / 2.475)
                  const trailProximityX = Math.abs(targetX - pwCx)
                  if (trailProximityX < circleRadius * 3) {
                    const xFactor = 1 - trailProximityX / (circleRadius * 3); const trailFactor = 1 - trailDist / maxTrail
                    const splitForce = xFactor * trailFactor * (1 - recoveryProgress) * 34
                    targetX += (targetX >= pwCx ? 1 : -1) * splitForce
                  }
                }
              }
              {
                const ringDuration = 2.97
                if (pwElapsed < ringDuration) {
                  const t = pwElapsed / ringDuration; const ease = 1 - (1 - t) * (1 - t)
                  const ringRadius = 16 + ease * 984; const ringStroke = 20 + (1 - t) * 10
                  const dx = targetX - pwCx, dy = targetY - pwStartY, dist = Math.sqrt(dx * dx + dy * dy)
                  const distFromRing = Math.abs(dist - ringRadius)
                  if (distFromRing < ringStroke && dist > 0.1) {
                    const ringStrength = 1 - distFromRing / ringStroke; const fade = Math.max(0, 1 - t)
                    const push = ringStrength * fade * 12; const nx = dx / dist, ny = dy / dist
                    targetX += nx * push; targetY += ny * push
                  }
                }
              }
              const totalDisp = Math.sqrt((targetX - beforeX) ** 2 + (targetY - beforeY) ** 2)
              p.payWaveIntensity = Math.min(1, totalDisp / 30)
            } else {
              if (p.payWaveIntensity > 0) { p.payWaveIntensity = Math.max(0, p.payWaveIntensity - dt * 2) }
            }
          } else if (bPhase === "dissolve") {
            const delayed = Math.max(0, elapsed - p.transDelay); const t = Math.min(1, delayed / 2.0)
            const ease = t * t * (3 - 2 * t)
            slotOpacity = slot.opacity + (1 - slot.opacity) * ease
            const circleX = centerX + Math.cos(jitterAngle) * dotRadius, circleY = centerY + Math.sin(jitterAngle) * dotRadius
            const topoX = targetX, topoY = targetY
            const scatterFade = t < 0.35 ? t / 0.35 : 1 - (t - 0.35) / 0.65
            const scatterEase = scatterFade * scatterFade * (3 - 2 * scatterFade)
            const midX = (circleX + topoX) / 2 + p.transScatterX * scatterEase * 0.7
            const midY = (circleY + topoY) / 2 + p.transScatterY * scatterEase * 0.7
            if (t < 0.35) { const subT = t / 0.35; const subEase = subT * subT * (3 - 2 * subT); targetX = circleX + (midX - circleX) * subEase; targetY = circleY + (midY - circleY) * subEase }
            else { const subT = (t - 0.35) / 0.65; const subEase = subT * subT * (3 - 2 * subT); targetX = midX + (topoX - midX) * subEase; targetY = midY + (topoY - midY) * subEase }
          }
        }

        if (bPhase !== "collapse") for (const fc of frozenCircles) {
          const influenceR = fc.radius * 3.0
          const dx = targetX - fc.x, dy = targetY - fc.y, dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < influenceR && dist > 0.1) {
            const normDx = dx / dist, normDy = dy / dist
            let pushStrength
            if (dist < fc.radius) { pushStrength = (influenceR - dist) * 1.5 }
            else { const t = (dist - fc.radius) / (influenceR - fc.radius); pushStrength = 0.5 * (1 + Math.cos(t * Math.PI)) * fc.radius * 0.8 }
            targetX += normDx * pushStrength * fc.opacity; targetY += normDy * pushStrength * fc.opacity
          }
        }

        p.vx = 0; p.vy = 0; p.x = targetX; p.y = targetY
        const inBroadcast = bPhase !== "idle"

        let waveAlphaBoost = 0
        if (inBroadcast && bPhase === "radiate") {
          const cX = width / 2, cY = height / 2; const elapsed = (now - broadcastStartRef.current) / 1000
          const waveSpeed = 100, waveInterval = 2.0, waveWidth = 50
          const numWaves = Math.floor(elapsed / waveInterval) + 1
          const currentDist = Math.sqrt((p.x - cX) ** 2 + (p.y - cY) ** 2)
          for (let w = 0; w < numWaves; w++) {
            const waveAge = elapsed - w * waveInterval; if (waveAge < 0) continue
            const waveFront = waveAge * waveSpeed; const distFromWave = Math.abs(currentDist - waveFront)
            if (distFromWave < waveWidth) { const strength = 1 - distFromWave / waveWidth; const fade = Math.max(0, 1 - waveAge / 5); waveAlphaBoost = Math.max(waveAlphaBoost, strength * fade) }
          }
        }

        const topoAlpha = inBroadcast ? 0.35 + waveAlphaBoost * 0.55 : 0.30
        const broadcastFade = inBroadcast ? slotOpacity : 1
        const alpha = topoAlpha * globalAlpha * broadcastFade
        if (alpha < 0.01) continue
        let sizeMultiplier = 1.0 + scanElevation * 0.8
        let drawX = Math.round(p.x), drawY = Math.round(p.y)
        let fadeInAlpha = 1
        if (bPhase === "idle" && globalAlpha < 1 && globalAlpha > 0) {
          const introTime = globalAlpha * 3.0; const delayed = Math.max(0, introTime - p.zRainDelay)
          const tAlpha = Math.min(1, delayed / 0.5); if (tAlpha < 0.01) continue
          fadeInAlpha = tAlpha * tAlpha * (3 - 2 * tAlpha)
          const tSlide = Math.min(1, delayed / 1.3); const easeSlide = tSlide * tSlide * (3 - 2 * tSlide)
          const cx2 = width * 0.5, cy2 = height * 0.5
          const dx2 = p.x - cx2, dy2 = p.y - cy2, dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          const maxDist = Math.sqrt(cx2 * cx2 + cy2 * cy2); const distRatio = dist2 / maxDist
          const push = distRatio * 156 * (1 - easeSlide)
          if (dist2 > 0) { drawX = p.x + (dx2 / dist2) * push; drawY = p.y + (dy2 / dist2) * push }
        }

        let disperseAlpha = 1, disperseScale = 1
        if (dispersingRef.current) {
          const elapsed = (now - disperseStartRef.current) / 1000; const t = Math.min(1, elapsed / 0.6); const ease = t * t * (3 - 2 * t)
          disperseAlpha = 1 - ease; disperseScale = 1 - ease * 0.7; if (disperseAlpha < 0.01) continue
        }

        const baseAlpha = (inBroadcast ? alpha : Math.min(1, alpha + scanElevation * 0.65)) * fadeInAlpha * disperseAlpha
        const pwI = p.payWaveIntensity, cI = p.chaserIntensity * 0.3
        const caIntensity = Math.max(pwI, cI)
        const waveScale = 1 + pwI * 0.5, btDotScale = 1 + p.btIntensity * 0.7
        const dotR = p.size * 0.5 * sizeMultiplier * disperseScale * waveScale * btDotScale
        const isLightMode = colorModeRef.current === "light"

        if (caIntensity > 0.05) {
          const caOffset = caIntensity * 3.5
          ctx.globalCompositeOperation = isLightMode ? "multiply" : "lighter"
          ctx.globalAlpha = baseAlpha * 0.7; ctx.fillStyle = isLightMode ? `rgb(180, 40, 40)` : `rgb(255, 60, 60)`
          ctx.beginPath(); ctx.arc(drawX - caOffset, drawY - caOffset * 0.3, dotR, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = baseAlpha * 0.7; ctx.fillStyle = isLightMode ? `rgb(40, 180, 40)` : `rgb(60, 255, 60)`
          ctx.beginPath(); ctx.arc(drawX, drawY + caOffset * 0.2, dotR, 0, Math.PI * 2); ctx.fill()
          ctx.globalAlpha = baseAlpha * 0.7; ctx.fillStyle = isLightMode ? `rgb(40, 40, 180)` : `rgb(60, 60, 255)`
          ctx.beginPath(); ctx.arc(drawX + caOffset, drawY + caOffset * 0.3, dotR, 0, Math.PI * 2); ctx.fill()
          ctx.globalCompositeOperation = "source-over"
        } else {
          if (p.nuxErrorHit > 0.5) {
            const sizeSeed = p.homeX * 0.12 + p.homeY * 0.15; const sizeOsc = Math.sin(now * 0.002 + sizeSeed); const sizeScale = 1.15 + sizeOsc * 0.15
            ctx.globalAlpha = 1; ctx.fillStyle = `rgb(255, 50, 50)`; ctx.beginPath(); ctx.arc(drawX, drawY, dotR * sizeScale, 0, Math.PI * 2); ctx.fill()
          } else {
            if (p.btColorHit > 0.05) { const btAlpha = baseAlpha + (1 - baseAlpha) * p.btColorHit * 0.7; ctx.globalAlpha = btAlpha; ctx.fillStyle = isLightMode ? `rgb(30, 30, 30)` : `rgb(255, 255, 255)` }
            else { ctx.globalAlpha = baseAlpha; ctx.fillStyle = isLightMode ? `rgb(80, 80, 80)` : `rgb(${particleColor})` }
            ctx.beginPath(); ctx.arc(drawX, drawY, dotR, 0, Math.PI * 2); ctx.fill()
          }
        }
        ctx.globalAlpha = 1
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(animRef.current) }
  }, [width, height, bgColor, particleColor, initParticles])

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} style={{ width, height, pointerEvents: 'none' }} />
      {!dispersing && avatarOverlays.map((overlay) => (
        <div key={overlay.id}>
          <img
            src={overlay.avatarSrc}
            alt="Found person"
            data-ap-nb-avatar={overlay.name}
            onClick={(e) => { e.stopPropagation(); if (overlay.opacity > 0 && onAvatarClick) onAvatarClick(overlay.x, overlay.y, overlay.avatarSrc) }}
            style={{
              position: 'absolute', cursor: 'pointer', borderRadius: '50%', objectFit: 'cover',
              left: overlay.x, top: overlay.y, width: 48, height: 48,
              opacity: overlay.opacity, transition: 'opacity 500ms ease-in-out',
              animation: overlay.opacity > 0 ? 'avatar-pulse 3s ease-in-out infinite' : 'none',
              pointerEvents: overlay.opacity > 0 ? 'auto' : 'none',
            }}
            crossOrigin="anonymous"
          />
          {overlay.name && (
            <span
              style={{
                position: 'absolute', pointerEvents: 'none',
                left: overlay.x, top: overlay.y + 32,
                fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16,
                color: colorMode === "light" ? "#000000" : "#ffffff",
                whiteSpace: 'nowrap', letterSpacing: '0.02em',
                transform: `translateX(-50%) ${overlay.showName ? 'scale(1)' : 'scale(0)'}`,
                opacity: hideName ? 0 : (overlay.showName ? 1 : 0),
                transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease-out',
              }}
            >
              {overlay.name}
            </span>
          )}
        </div>
      ))}
      {showBroadcastAvatar && avatarImageUrl && (
        <div
          style={{
            position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            left: width / 2 - 24, top: height / 2 - 24, width: 48, height: 48,
            opacity: broadcastAvatarScale,
            transform: `scale(${broadcastAvatarScale})`,
            transition: 'transform 900ms cubic-bezier(0.25, 1.015, 0.5, 1), opacity 500ms ease-in-out',
          }}
        >
          <img
            src={avatarImageUrl} alt="Your avatar"
            style={{ borderRadius: '50%', objectFit: 'cover', width: 48, height: 48 }}
            crossOrigin="anonymous"
          />
        </div>
      )}
    </div>
  )
}
