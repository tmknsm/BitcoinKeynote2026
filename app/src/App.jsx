import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { SLIDES, ALL_VIDEO_SOURCES } from './slides'
import closeIcon from './assets/CloseIcon.svg'

const HIDDEN_STORAGE_KEY = 'bitcoin-keynote:hidden-slides'

function loadHiddenSlides() {
  try {
    const stored = JSON.parse(localStorage.getItem(HIDDEN_STORAGE_KEY) || '[]')
    return new Set(Array.isArray(stored) ? stored : [])
  } catch {
    return new Set()
  }
}

function CopyLinkButton({ slideIndex }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}#${slideIndex + 1}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      className={`overview-thumb__copy${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy link to slide ${slideIndex + 1}`}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6.5 9.5a2.5 2.5 0 0 0 3.536 0l2-2a2.5 2.5 0 0 0-3.536-3.536L7.5 4.964" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9.5 6.5a2.5 2.5 0 0 0-3.536 0l-2 2a2.5 2.5 0 0 0 3.536 3.536L8.5 11.036" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  )
}

function HideToggleButton({ slideIndex, isHidden, onToggle }) {
  const handleClick = (e) => {
    e.stopPropagation()
    onToggle(slideIndex)
  }

  return (
    <button
      className={`overview-thumb__hide${isHidden ? ' is-hidden' : ''}`}
      onClick={handleClick}
      title={isHidden ? `Show slide ${slideIndex + 1}` : `Hide slide ${slideIndex + 1}`}
    >
      {isHidden ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M6.1 6.1a2.5 2.5 0 0 0 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M4 4.8C2.5 5.8 1.5 7 1 8c0 0 2.5 5 7 5 1.4 0 2.7-.3 3.8-.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7 3.1C7.3 3 7.6 3 8 3c4.5 0 7 5 7 5-.3.6-.8 1.3-1.4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )}
    </button>
  )
}

function Overview({ open, current, hiddenSlides, onToggleHidden, onSelect, onClose }) {
  const thumbRefs = useRef([])

  useEffect(() => {
    const observers = []
    thumbRefs.current.forEach((frame) => {
      if (!frame) return
      const inner = frame.querySelector('.overview-thumb__inner')
      if (!inner) return
      const scale = () => {
        const w = frame.offsetWidth
        const s = w / 1920
        inner.style.transform = `scale(${s})`
        frame.style.height = `${1080 * s}px`
      }
      scale()
      const ro = new ResizeObserver(scale)
      ro.observe(frame)
      observers.push(ro)
    })
    return () => observers.forEach(ro => ro.disconnect())
  })

  // Compute visible position for each slide so thumbnail labels reflect the live running order
  const visiblePositions = useMemo(() => {
    const positions = new Array(SLIDES.length).fill(-1)
    let p = 0
    SLIDES.forEach((_, i) => {
      if (!hiddenSlides.has(i)) { positions[i] = p; p += 1 }
    })
    return positions
  }, [hiddenSlides])
  const visibleTotal = SLIDES.length - hiddenSlides.size

  return (
    <div className={`overview-overlay${open ? ' open' : ''}`}>
      <div className="overview-header">
        <div className="overview-title">
          All Slides
          {hiddenSlides.size > 0 && (
            <span className="overview-title__sub"> · {hiddenSlides.size} hidden</span>
          )}
        </div>
        <img src={closeIcon} alt="Close" className="overview-close" onClick={onClose} />
      </div>
      <div className="overview-grid">
        {SLIDES.map((SlideComponent, i) => {
          const isHidden = hiddenSlides.has(i)
          const visiblePos = visiblePositions[i]
          return (
            <div
              key={i}
              className={`overview-thumb${i === current ? ' is-current' : ''}${isHidden ? ' is-hidden-thumb' : ''}`}
              onClick={() => { if (!isHidden) onSelect(i) }}
            >
              <div
                className="overview-thumb__frame"
                ref={el => thumbRefs.current[i] = el}
              >
                <div
                  className={`overview-thumb__inner slide slide--${SlideComponent.theme}${SlideComponent.className ? ' ' + SlideComponent.className : ''}`}
                  style={{
                    width: 1920, height: 1080, position: 'absolute',
                    top: 0, left: 0, transformOrigin: '0 0',
                    opacity: 1, pointerEvents: 'none',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: SlideComponent.className?.includes('split-bg') ? '0' : '32px 48px 64px',
                  }}
                >
                  <SlideComponent
                    index={visiblePos >= 0 ? visiblePos : 0}
                    total={visibleTotal || 1}
                    onOverview={() => {}}
                  />
                </div>
              </div>
              <div className="overview-thumb__label">
                <span>
                  {isHidden
                    ? <>Slide {i + 1} <span className="overview-thumb__label-muted">· Hidden</span></>
                    : <>Slide {visiblePos + 1} <span className="overview-thumb__label-muted">of {visibleTotal}</span></>
                  }
                </span>
                <span className="overview-thumb__label-right">
                  {i === current && !isHidden && <span>Current</span>}
                  <HideToggleButton slideIndex={i} isHidden={isHidden} onToggle={onToggleHidden} />
                  <CopyLinkButton slideIndex={i} />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Hidden <video> elements that start downloading every clip the moment the app
// mounts, so by the time we navigate to a video-heavy slide the bytes are in
// the browser cache and playback can begin instantly.
function VideoPreloader() {
  return (
    <div aria-hidden="true" className="video-preloader">
      {ALL_VIDEO_SOURCES.map((src) => (
        <video
          key={src}
          src={src}
          preload="auto"
          muted
          playsInline
          // Never play these instances — they exist purely to warm the cache
          tabIndex={-1}
        />
      ))}
    </div>
  )
}

function getSlideFromHash() {
  const n = parseInt(window.location.hash.replace('#', ''), 10)
  return Number.isFinite(n) && n >= 1 ? n - 1 : 0
}

export default function App() {
  const [current, setCurrent] = useState(getSlideFromHash)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const [hiddenSlides, setHiddenSlides] = useState(loadHiddenSlides)

  // Persist hidden slides
  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify([...hiddenSlides]))
    } catch {}
  }, [hiddenSlides])

  // Build the list of visible SLIDES indices and a mapping for page-number display
  const { visibleIndices, visiblePositions, visibleTotal } = useMemo(() => {
    const vi = []
    const vp = new Array(SLIDES.length).fill(-1)
    SLIDES.forEach((_, i) => {
      if (!hiddenSlides.has(i)) { vp[i] = vi.length; vi.push(i) }
    })
    return { visibleIndices: vi, visiblePositions: vp, visibleTotal: vi.length }
  }, [hiddenSlides])

  const total = SLIDES.length

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, total - 1))
    setCurrent(clamped)
    window.location.hash = `${clamped + 1}`
  }, [total])

  // Step through visible slides only (used by arrow keys)
  const stepVisible = useCallback((direction) => {
    if (visibleIndices.length === 0) return
    // find the visible index at or adjacent to current
    let curPos = visiblePositions[current]
    if (curPos < 0) {
      // current slide is hidden — find nearest visible based on direction
      if (direction > 0) {
        const next = visibleIndices.find(i => i > current)
        if (next !== undefined) { goTo(next); return }
        goTo(visibleIndices[visibleIndices.length - 1]); return
      } else {
        const prev = [...visibleIndices].reverse().find(i => i < current)
        if (prev !== undefined) { goTo(prev); return }
        goTo(visibleIndices[0]); return
      }
    }
    const nextPos = Math.max(0, Math.min(curPos + direction, visibleIndices.length - 1))
    goTo(visibleIndices[nextPos])
  }, [current, visibleIndices, visiblePositions, goTo])

  // If the currently-displayed slide becomes hidden, jump to the nearest visible one
  useEffect(() => {
    if (visibleIndices.length === 0) return
    if (hiddenSlides.has(current)) {
      const next = visibleIndices.find(i => i >= current) ?? visibleIndices[visibleIndices.length - 1]
      goTo(next)
    }
  }, [hiddenSlides, current, visibleIndices, goTo])

  useEffect(() => {
    const onHashChange = () => setCurrent(getSlideFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const toggleOverview = useCallback(() => {
    setOverviewOpen(o => !o)
  }, [])

  const toggleHidden = useCallback((i) => {
    setHiddenSlides(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && overviewOpen) { setOverviewOpen(false); return }
      if (overviewOpen) return
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); stepVisible(1) }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); stepVisible(-1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [stepVisible, overviewOpen])

  return (
    <div className="deck">

      <VideoPreloader />

      {SLIDES.map((SlideComponent, i) => {
        const isHidden = hiddenSlides.has(i)
        const isActive = i === current && !isHidden
        const shownIndex = visiblePositions[i] >= 0 ? visiblePositions[i] : 0
        return (
          <div
            key={i}
            className={`slide slide--${SlideComponent.theme}${SlideComponent.className ? ' ' + SlideComponent.className : ''}${isActive ? ' active' : ''}`}
          >
            <SlideComponent
              index={shownIndex}
              total={visibleTotal || 1}
              active={isActive}
              onOverview={toggleOverview}
            />
          </div>
        )
      })}

      <Overview
        open={overviewOpen}
        current={current}
        hiddenSlides={hiddenSlides}
        onToggleHidden={toggleHidden}
        onSelect={(i) => { goTo(i); setOverviewOpen(false) }}
        onClose={() => setOverviewOpen(false)}
      />
    </div>
  )
}
