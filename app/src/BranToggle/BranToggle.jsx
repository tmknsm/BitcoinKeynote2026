import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import iconUSD from './assets/USD24.svg'
import iconBTC from './assets/BTC24.svg'
import iconGlobe from './assets/Globe24.svg'
import iconUp from './assets/Up16.svg'
import iconDown from './assets/Down16.svg'
import qrImg from './assets/QR.png'

const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)'
const T = '0.15s'
const INNER_W = 800
const INNER_H = 500

export default function BranToggle({ active = true }) {
  const [isActive, setIsActive] = useState(false)
  const [selectorStyle, setSelectorStyle] = useState({ left: 4, width: 40 })
  const frameRef = useRef(null)
  const cursorRef = useRef(null)
  const timeoutsRef = useRef([])

  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const toggleTo = useCallback((mode) => {
    if (mode === 'btc') {
      setIsActive(true)
      setSelectorStyle({ left: 4, width: 88 })
      setTimeout(() => setSelectorStyle({ left: 52, width: 40 }), 100)
    } else {
      setIsActive(false)
      setSelectorStyle({ left: 4, width: 88 })
      setTimeout(() => setSelectorStyle({ left: 4, width: 40 }), 100)
    }
  }, [])

  // Auto-start demo loop whenever the slide is active. Always begin from the
  // fiat state ($27.00) and then toggle to bitcoin — slides stay mounted, so
  // without this reset the animation could be mid-cycle on re-entry.
  useEffect(() => {
    const cursor = cursorRef.current
    const frame = frameRef.current
    if (!cursor || !frame) return
    if (!active) {
      cursor.style.opacity = '0'
      return
    }

    // Reset to fiat state at the start of every run.
    setIsActive(false)
    setSelectorStyle({ left: 4, width: 40 })

    const restLeft = 230, restTop = 90
    let cancelled = false

    function getCursorTarget(selector) {
      const el = frame.querySelector(selector)
      if (!el) return { left: restLeft, top: restTop }
      const fRect = frame.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      const s = frame.offsetWidth > 0 ? fRect.width / frame.offsetWidth : 1
      return {
        left: (eRect.left + eRect.width / 2 - fRect.left) / s,
        top: (eRect.top + eRect.height / 2 - fRect.top) / s,
      }
    }

    function moveCursor(left, top) {
      cursor.style.left = left + 'px'
      cursor.style.top = top + 'px'
    }

    async function sleep(ms) {
      return new Promise(r => { const id = setTimeout(r, ms); timeoutsRef.current.push(id) })
    }

    async function loop() {
      cursor.style.opacity = '1'
      moveCursor(restLeft, restTop)

      while (!cancelled) {
        // Rest → move to BTC
        await sleep(2600)
        if (cancelled) return
        const btcPos = getCursorTarget('[data-value="btc"]')
        moveCursor(btcPos.left, btcPos.top)
        await sleep(550)
        if (cancelled) return
        toggleTo('btc')
        await sleep(100)
        if (cancelled) return
        moveCursor(restLeft, restTop)

        // Rest → move to USD
        await sleep(2600)
        if (cancelled) return
        const usdPos = getCursorTarget('[data-value="usd"]')
        moveCursor(usdPos.left, usdPos.top)
        await sleep(550)
        if (cancelled) return
        toggleTo('usd')
        await sleep(100)
        if (cancelled) return
        moveCursor(restLeft, restTop)
      }
    }

    schedule(() => loop(), 400)

    return () => {
      cancelled = true
      timeoutsRef.current.forEach(id => clearTimeout(id))
      timeoutsRef.current = []
    }
  }, [active, toggleTo, schedule])

  // Scale the fixed-size frame to fit its container with 32px horizontal padding
  const wrapRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [wrapHeight, setWrapHeight] = useState(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(([entry]) => {
      const isMobile = typeof window !== 'undefined'
        && window.matchMedia('(max-width: 768px)').matches
      if (isMobile) {
        // Width-driven fit: scale to container width minus 24px on each side,
        // then pin the wrap's height so the device has exactly 24px of frame all around.
        const padEach = 24
        const availW = entry.contentRect.width - padEach * 2
        const newScale = Math.min(availW / INNER_W, 1)
        setScale(newScale)
        setWrapHeight(INNER_H * newScale + padEach * 2)
      } else {
        const padEach = 32
        const availW = entry.contentRect.width - padEach * 2
        const availH = entry.contentRect.height - padEach * 2
        setScale(Math.min(availW / INNER_W, availH / INNER_H, 1))
        setWrapHeight(null)
      }
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: wrapHeight != null ? wrapHeight : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div
      ref={frameRef}
      style={{
        width: INNER_W, height: INNER_H,
        background: '#000',
        padding: '24px 40px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Cash Sans', sans-serif",
        overflow: 'hidden',
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
      }}
    >
      {/* Toggle */}
      <div style={{
        width: 96, height: 48, background: '#333', borderRadius: 100,
        position: 'absolute', top: 24, left: 40,
        padding: 4, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          position: 'absolute', width: selectorStyle.width, height: 40,
          background: '#595959', borderRadius: 100, left: selectorStyle.left,
          transition: `left ${T} ${EASE}, width ${T} ${EASE}`,
        }} />
        <button data-value="usd" style={{
          width: 40, height: 40, border: 'none', background: 'none', borderRadius: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', position: 'relative', zIndex: 1, padding: 0,
        }}>
          <img src={iconUSD} alt="USD" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />
        </button>
        <button data-value="btc" style={{
          width: 40, height: 40, border: 'none', background: 'none', borderRadius: 100,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', position: 'relative', zIndex: 1, padding: 0,
        }}>
          <img src={iconBTC} alt="BTC" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>

      {/* Settings */}
      <div style={{
        height: 48, background: '#333', borderRadius: 100,
        position: 'absolute', top: 24, right: 40,
        padding: '0 12px', display: 'flex', alignItems: 'center',
      }}>
        <img src={iconGlobe} alt="" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />
        <span style={{ fontWeight: 600, fontSize: 16, color: '#fff', marginLeft: 12 }}>Settings</span>
      </div>

      {/* Up arrow + Tap */}
      <img src={iconUp} alt="" style={{ width: 16, height: 16, position: 'absolute', left: '50%', top: 24, transform: 'translateX(-50%)', filter: 'brightness(0) invert(1)' }} />
      <span style={{ position: 'absolute', left: '50%', top: 50, transform: 'translateX(-50%)', fontWeight: 600, fontSize: 25, color: '#fff' }}>Tap</span>

      {/* USD price */}
      <span style={{
        fontWeight: 500, fontSize: 72, color: '#fff',
        opacity: isActive ? 0 : 1,
        transform: isActive ? 'translateY(8px)' : 'translateY(0)',
        transition: `opacity ${T} ${EASE}, transform ${T} ${EASE}`,
      }}>$27.00</span>

      {/* BTC view */}
      <div style={{
        position: 'absolute', left: 40,
        display: 'flex', flexDirection: 'column',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity ${T} ${EASE}, transform ${T} ${EASE}`,
      }}>
        <span style={{ fontWeight: 500, fontSize: 72, color: '#fff' }}>₿26,369</span>
        <span style={{ fontWeight: 400, fontSize: 26, color: '#9B9B9B', marginTop: 8 }}>$27.00</span>
      </div>

      {/* QR container */}
      <div style={{
        position: 'absolute', right: 40, top: 108, width: 296,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scale(1)' : 'scale(0.9)',
        transition: `opacity ${T} ${EASE}, transform ${T} ${EASE}`,
      }}>
        <img src={qrImg} alt="QR" style={{ width: 296, height: 296 }} />
        <span style={{ fontWeight: 500, fontSize: 14, color: '#fff', textAlign: 'center', maxWidth: 296, marginTop: 24 }}>Scan with your Bitcoin Lightning wallet</span>
        <span style={{ fontWeight: 400, fontSize: 14, color: '#9B9B9B', textAlign: 'center', maxWidth: 296, marginTop: 4 }}>USD amounts may vary</span>
      </div>

      {/* Insert + Down arrow */}
      <span style={{
        position: 'absolute', left: '50%', bottom: 50, transform: 'translateX(-50%)',
        fontWeight: 600, fontSize: 25, color: '#fff',
        opacity: isActive ? 0 : 1,
        transition: `opacity ${T} ${EASE}`,
      }}>Insert</span>
      <img src={iconDown} alt="" style={{
        width: 16, height: 16, position: 'absolute', left: '50%', bottom: 24,
        transform: 'translateX(-50%)', filter: 'brightness(0) invert(1)',
        opacity: isActive ? 0 : 1,
        transition: `opacity ${T} ${EASE}`,
      }} />

      {/* Demo cursor — matches autopilot cursor style */}
      <div ref={cursorRef} style={{
        width: 56, height: 56,
        margin: '-28px 0 0 -28px',
        background: 'rgba(255, 255, 255, 0.25)',
        border: '1px solid rgba(255, 255, 255, 1)',
        borderRadius: '50%', position: 'absolute', pointerEvents: 'none',
        opacity: 0, zIndex: 10,
        transition: 'left 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), top 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease',
      }} />
    </div>
    </div>
  )
}
