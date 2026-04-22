import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Simplified autopilot hook for the keynote embed.
 * Always-on — drives a visible cursor over elements inside phoneRef and
 * runs an async script on a loop.
 */
export function useAutopilot(phoneRef, script) {
  const [cursorPos, setCursorPos] = useState({ x: 195, y: 700 })
  const [cursorVisible, setCursorVisible] = useState(false)
  const [cursorClicking, setCursorClicking] = useState(false)
  const [cursorTracking, setCursorTracking] = useState(false)
  const scriptRef = useRef(script)
  scriptRef.current = script

  useEffect(() => {
    let cancelled = false
    const timers = new Set()
    const alive = () => !cancelled

    const sleep = (ms) => new Promise(resolve => {
      const id = setTimeout(() => { timers.delete(id); resolve() }, ms)
      timers.add(id)
    })

    const waitFor = async (selector, maxMs = 2000) => {
      const root = phoneRef.current
      if (!root) return false
      const start = Date.now()
      while (alive() && Date.now() - start < maxMs) {
        if (root.querySelector(selector)) return true
        await sleep(60)
      }
      return false
    }

    const moveTo = async (selector, settle = 80) => {
      setCursorTracking(false)
      if (!alive()) return false
      if (settle > 0) await sleep(settle)
      if (!alive()) return false
      const root = phoneRef.current
      if (!root) return false
      const found = await waitFor(selector, 2500)
      if (!found || !alive()) return false
      const el = root.querySelector(selector)
      if (!el) return false
      const rootRect = root.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const scale = root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1
      const logicalWidth = r.width / scale
      const offsetX = Math.min(logicalWidth / 2 - 16, 36)
      setCursorPos({
        x: (r.left + r.width / 2 - rootRect.left) / scale + offsetX,
        y: (r.top + r.height / 2 - rootRect.top) / scale,
      })
      await sleep(650)
      return alive()
    }

    const tap = async () => {
      if (!alive()) return
      setCursorClicking(true)
      await sleep(160)
      setCursorClicking(false)
      await sleep(120)
    }

    const track = (selector) => {
      setCursorTracking(true)
      const root = phoneRef.current
      if (!root) return
      const el = root.querySelector(selector)
      if (!el) return
      const rootRect = root.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const scale = root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1
      const logicalWidth = r.width / scale
      const offsetX = Math.min(logicalWidth / 2 - 16, 36)
      setCursorPos({
        x: (r.left + r.width / 2 - rootRect.left) / scale + offsetX,
        y: (r.top + r.height / 2 - rootRect.top) / scale,
      })
    }

    const api = { alive, sleep, moveTo, tap, waitFor, track }

    const run = async () => {
      setCursorVisible(true)
      while (alive()) {
        try {
          await scriptRef.current(api)
        } catch (err) {
          console.warn('[autopilot] script error', err)
          break
        }
        if (!alive()) break
        await sleep(400)
      }
      if (!cancelled) setCursorVisible(false)
    }

    run()
    return () => { cancelled = true; timers.forEach(id => clearTimeout(id)); timers.clear() }
  }, [phoneRef])

  const cursor = cursorVisible ? (
    <div
      className={`ap-cursor${cursorClicking ? ' ap-cursor--tap' : ''}${cursorTracking ? ' ap-cursor--tracking' : ''}`}
      style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
    />
  ) : null

  return { cursor }
}
