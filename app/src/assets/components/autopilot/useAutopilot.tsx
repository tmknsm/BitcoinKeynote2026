import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import './autopilot.css'

/**
 * Shared autopilot runtime for phone-mockup prototypes.
 *
 * Drives a visible fake cursor over elements inside a phone-mockup and runs an
 * async script on a loop. Locates targets via CSS selectors inside the provided
 * `phoneRef`, and compensates for the phone mockup's CSS scale (100/75/50%) so
 * the cursor lands correctly at any zoom level.
 */

export interface AutopilotAPI {
  /** Returns false once the autopilot has been stopped (toggled off or unmounted). */
  alive: () => boolean
  /** Sleeps for `ms` ms, resolving early if the autopilot is stopped. */
  sleep: (ms: number) => Promise<void>
  /**
   * Animates the cursor to the element matching `selector`, nudged slightly
   * right of center so button labels remain readable.
   * Returns false if the element never appears or autopilot was stopped.
   */
  moveTo: (selector: string, settle?: number) => Promise<boolean>
  /** Plays the cursor tap-pulse animation. */
  tap: () => Promise<void>
  /**
   * Waits for a selector to exist in the DOM. Returns false on timeout or stop.
   */
  waitFor: (selector: string, maxMs?: number) => Promise<boolean>
  /**
   * Instantly repositions the cursor to the element matching `selector`.
   * No delays, no settle — use inside tight animation loops to track a moving element.
   */
  track: (selector: string) => void
}

export type AutopilotScript = (api: AutopilotAPI) => Promise<void>

export interface UseAutopilotOptions {
  /** Label shown next to the toggle in the ellipsis menu. */
  label?: string
  /** Default on/off state. */
  initial?: boolean
}

export interface UseAutopilotResult {
  autopilot: boolean
  setAutopilot: (v: boolean) => void
  /** Toggle element to pass to `<PhoneMockup extraControls={...} />`. */
  controls: ReactNode
  /** Cursor overlay. Render as a child of the element that `phoneRef` points to. */
  cursor: ReactNode
}

export function useAutopilot(
  phoneRef: RefObject<HTMLElement | null>,
  script: AutopilotScript,
  options: UseAutopilotOptions = {},
): UseAutopilotResult {
  const { label = 'Autopilot', initial = false } = options

  const [autopilot, setAutopilot] = useState(initial)
  const autopilotRef = useRef(false)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
    x: 195,
    y: 700,
  })
  const [cursorVisible, setCursorVisible] = useState(false)
  const [cursorClicking, setCursorClicking] = useState(false)
  const [cursorTracking, setCursorTracking] = useState(false)

  // Keep the latest script in a ref so the effect doesn't need it as a dep
  // (scripts are usually inline arrow functions, which would otherwise restart
  // the loop on every render).
  const scriptRef = useRef<AutopilotScript>(script)
  scriptRef.current = script

  useEffect(() => {
    autopilotRef.current = autopilot
    if (!autopilot) {
      setCursorVisible(false)
      return
    }

    let cancelled = false
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const alive = () => !cancelled && autopilotRef.current

    const sleep = (ms: number) =>
      new Promise<void>(resolve => {
        const id = setTimeout(() => { timers.delete(id); resolve() }, ms)
        timers.add(id)
      })

    const waitFor = async (selector: string, maxMs = 2000) => {
      const root = phoneRef.current
      if (!root) return false
      const start = Date.now()
      while (alive() && Date.now() - start < maxMs) {
        const el = root.querySelector(selector) as HTMLElement | null
        if (el) return true
        await sleep(60)
      }
      return false
    }

    const moveTo = async (selector: string, settle = 80) => {
      setCursorTracking(false)
      if (!alive()) return false
      if (settle > 0) await sleep(settle)
      if (!alive()) return false
      const root = phoneRef.current
      if (!root) return false
      const found = await waitFor(selector, 2500)
      if (!found || !alive()) return false
      const el = root.querySelector(selector) as HTMLElement | null
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

    const track = (selector: string) => {
      setCursorTracking(true)
      const root = phoneRef.current
      if (!root) return
      const el = root.querySelector(selector) as HTMLElement | null
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

    const api: AutopilotAPI = { alive, sleep, moveTo, tap, waitFor, track }

    const run = async () => {
      setCursorVisible(true)
      while (alive()) {
        try {
          await scriptRef.current(api)
        } catch (err) {
          // Don't crash the app if a script throws — just stop autopilot.
          // eslint-disable-next-line no-console
          console.warn('[autopilot] script error', err)
          break
        }
        if (!alive()) break
        await sleep(400)
      }
      // Only hide cursor if this run ended naturally (error or toggle-off),
      // not if it was cancelled by a strict-mode remount or effect re-run.
      if (!cancelled) {
        setCursorVisible(false)
      }
    }

    run()
    return () => {
      cancelled = true
      autopilotRef.current = false
      timers.forEach(id => clearTimeout(id))
      timers.clear()
    }
  }, [autopilot, phoneRef])

  const onToggle = useCallback(() => setAutopilot(v => !v), [])

  const controls = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-900">{label}</span>
        <button
          onClick={onToggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            autopilot ? 'bg-green-500' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              autopilot ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    ),
    [autopilot, label, onToggle],
  )

  const cursor = cursorVisible ? (
    <div
      className={`ap-cursor${cursorClicking ? ' ap-cursor--tap' : ''}${cursorTracking ? ' ap-cursor--tracking' : ''}`}
      style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
    />
  ) : null

  return { autopilot, setAutopilot, controls, cursor }
}
