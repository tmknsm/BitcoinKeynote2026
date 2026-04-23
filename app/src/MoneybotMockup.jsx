import React from 'react'
import { motion, AnimatePresence } from 'motion/react'

import iconNavMenu from './assets/Nav-Menu.svg'
import iconNavFilter from './assets/Nav-Filter.svg'
import iconNavSearch from './assets/Nav-Search.svg'
import iconNavMore from './assets/Nav-More.svg'
import iconAutoPlay from './assets/Automation-Play.svg'
import iconAutoSuggestion from './assets/Automation-Suggestion.svg'
import iconAutoPaused from './assets/Automation-Paused.svg'
import iconInlineCard from './assets/Inline-Card.svg'
import iconInlineRotate from './assets/Inline-Rotate.svg'
import iconInlineUSD from './assets/Inline-USD.svg'
import iconSpaceBitcoin from './assets/Space-Bitcoin.svg'
import iconSpaceMinus from './assets/Space-Minus.svg'
import iconSpaceStore from './assets/Space-Store.svg'

/* ─── Springs ─── */
const springIn = { type: 'spring', stiffness: 450, damping: 30, mass: 0.7 }
const springOut = { type: 'spring', stiffness: 600, damping: 38, mass: 0.5 }
const springContainer = { type: 'spring', stiffness: 220, damping: 28, mass: 1 }

const REST = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }

/* ─── Layer: each child animates individually via custom delay ─── */
function L({ children, custom = 0, skip }) {
  return (
    <motion.div
      initial={skip ? REST : { opacity: 0, y: 16, scale: 0.97, filter: 'blur(5px)' }}
      animate={{ ...REST, transition: { ...springIn, delay: custom * 0.025 } }}
      exit={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(5px)',
        transition: { ...springOut, delay: custom * 0.01 } }}
    >
      {children}
    </motion.div>
  )
}

/* Cards: more travel, softer spring, wider stagger */
function Card({ children, custom = 0, skip }) {
  return (
    <motion.div
      initial={skip ? REST : { opacity: 0, y: 28, scale: 0.94, filter: 'blur(6px)' }}
      animate={{ ...REST, transition: { type: 'spring', stiffness: 300, damping: 26, mass: 0.8,
          delay: 0.1 + custom * 0.08 } }}
      exit={{ opacity: 0, y: 28, scale: 0.94, filter: 'blur(6px)',
        transition: { ...springOut, delay: custom * 0.025 } }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Automations (Module A)
   ───────────────────────────────────────────── */
function AutomationsScreen() {
  let i = 0
  return (
    <motion.div className="mm-screen mm-automations"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
      <L custom={i++}>
        <div className="mm-auto-header">
          <div className="mm-auto-tabs">
            <span className="mm-auto-tab mm-auto-tab--active">Bitcoin automations</span>
            <span className="mm-auto-tab">Running soon</span>
            <span className="mm-auto-tab">Suggested</span>
            <span className="mm-auto-tab">Paused</span>
          </div>
          <div className="mm-auto-header-icons">
            <span className="mm-icon-btn"><img src={iconNavFilter} alt="" /></span>
            <span className="mm-icon-btn"><img src={iconNavSearch} alt="" /></span>
          </div>
        </div>
      </L>

      <L custom={i++}><div className="mm-auto-section-label">Running soon</div></L>
      <AutoRow i={i++} icon="play" title="Auto-withdraw to Bitkey" desc="Move bitcoin to your Bitkey wallet automatica..." badge="Every night at midnight" />
      <AutoRow i={i++} icon="play" title="Buy the dip" desc="Auto-buy bitcoin when the price drops more than 5% i..." badge="When BTC drops 5%+ in 24h" />

      <L custom={i++}><div className="mm-auto-section-label mm-auto-section-label--gap">Suggested</div></L>
      <AutoRow i={i++} icon="bolt" title="Daily auto-buy" desc="Automatically convert 10% of each day's card reven..." badge="Daily at close of business" />
      <AutoRow i={i++} icon="bolt" title="Lightning tip jar payout" desc="Sweep accumulated Lightning tips into yo..." badge="When tips reach ₿500,000" />
      <AutoRow i={i++} icon="bolt" title="Fee savings tracker" desc="Calculate how much you saved this week by acc..." badge="Every Friday at 6:00 PM" />
      <AutoRow i={i++} icon="bolt" title="Price alert for payroll" desc="Notify you when bitcoin is up 10%+ so..." badge="When BTC is up 10%+ in 30d" />

      <L custom={i++}><div className="mm-auto-section-label mm-auto-section-label--gap">Paused</div></L>
      <AutoRow i={i++} icon="pause" title="Proof of reserves report" desc="Generate a monthly snapshot of all bitcoin held a..." badge="Monthly on the 1st" />
      <AutoRow i={i++} icon="pause" title="Bitcoin payroll reminder" desc="Remind you to offer bitcoin payroll to employee..." badge="Weekly on Thursday" />
      <AutoRow i={i++} icon="pause" title="Tax lot optimizer" desc="Flag the most tax-efficient bitcoin lots to sell when y..." badge="Before each conversion" />
    </motion.div>
  )
}

const AUTO_ICONS = { play: iconAutoPlay, bolt: iconAutoSuggestion, pause: iconAutoPaused }

function AutoRow({ i, icon, title, desc, badge }) {
  return (
    <L custom={i}>
      <div className="mm-auto-row">
        <div className="mm-auto-row-left">
          <span className="mm-auto-icon"><img src={AUTO_ICONS[icon]} alt="" /></span>
          <span className="mm-auto-row-title">{title}</span>
          <span className="mm-auto-row-desc">{desc}</span>
        </div>
        <span className="mm-auto-badge">{badge}</span>
      </div>
    </L>
  )
}

/* ─────────────────────────────────────────────
   Spaces / Bitcoin Dashboard (Module B)
   ───────────────────────────────────────────── */
function BitcoinDashScreen({ fresh }) {
  let i = 0
  return (
    <motion.div className="mm-screen mm-dashboard"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
      <L custom={i++} skip={fresh}>
        <div className="mm-dash-header">
          <span className="mm-icon-btn mm-icon-btn--lg"><img src={iconNavMenu} alt="" /></span>
          <span className="mm-dash-title-text">Bitcoin</span>
          <div className="mm-dash-nav">
            <span>Buy</span><span>Sell</span><span>Withdraw</span>
            <span className="mm-icon-btn"><img src={iconNavMore} alt="" /></span>
          </div>
        </div>
      </L>

      <L custom={i++} skip={fresh}>
        <div className="mm-dash-hero-title">Bitcoin</div>
      </L>

      <L custom={i++} skip={fresh}>
        <div className="mm-dash-stats">
          <div className="mm-dash-stat">
            <div className="mm-dash-stat-bar mm-dash-stat-bar--active" />
            <div className="mm-dash-stat-label">Balance</div>
            <div className="mm-dash-stat-value">{'\u20BF'}2,556,330</div>
            <div className="mm-dash-stat-sub">$2,556.93</div>
          </div>
          <div className="mm-dash-stat">
            <div className="mm-dash-stat-label mm-dash-stat-label--muted">Payments today</div>
            <div className="mm-dash-stat-value mm-dash-stat-value--muted">23</div>
            <div className="mm-dash-stat-sub mm-dash-stat-sub--green">{'\u25B2'} 7.9%</div>
          </div>
          <div className="mm-dash-stat">
            <div className="mm-dash-stat-label mm-dash-stat-label--muted">Top location</div>
            <div className="mm-dash-stat-value mm-dash-stat-value--muted">Presidio</div>
          </div>
        </div>
      </L>

      <div className="mm-dash-cards">
        <Card custom={0} skip={fresh}>
          <div className="mm-dash-card">
            <div className="mm-dash-card-top">
              <div className="mm-dash-card-avatars">
                <span className="mm-dash-avatar" style={{ background: '#7c3aed', zIndex: 3 }}><img src={iconSpaceStore} alt="" /></span>
                <span className="mm-dash-avatar" style={{ background: '#1eb27a', zIndex: 2 }}><img src={iconSpaceStore} alt="" /></span>
                <span className="mm-dash-avatar" style={{ background: '#ea580c', zIndex: 1 }}><img src={iconSpaceStore} alt="" /></span>
              </div>
              <div className="mm-dash-card-title">Upcoming conversion</div>
              <div className="mm-dash-card-sub">3 Locations</div>
            </div>
            <div className="mm-dash-card-meta">
              <div><img className="mm-inline-icon" src={iconInlineCard} alt="" /> 74 Sales</div>
              <div><img className="mm-inline-icon" src={iconInlineUSD} alt="" /> $2,449.73 Processed</div>
              <div><img className="mm-inline-icon" src={iconInlineRotate} alt="" /> Converting 35-50%</div>
            </div>
          </div>
        </Card>
        <Card custom={1} skip={fresh}>
          <div className="mm-dash-card">
            <div className="mm-dash-card-timestamp">Today, 3:43pm</div>
            <div className="mm-dash-card-bottom">
              <span className="mm-dash-avatar mm-dash-avatar--lg mm-dash-avatar--btc"><img src={iconSpaceBitcoin} alt="" /></span>
              <div className="mm-dash-card-title">Cash App customer</div>
              <div className="mm-dash-card-sub">{'\u20BF'}74,339 / $63.42</div>
            </div>
          </div>
        </Card>
        <Card custom={2} skip={fresh}>
          <div className="mm-dash-card mm-dash-card--clipped">
            <div className="mm-dash-card-timestamp">Today, 2:58pm</div>
            <div className="mm-dash-card-bottom">
              <span className="mm-dash-avatar mm-dash-avatar--lg mm-dash-avatar--minus"><img src={iconSpaceMinus} alt="" /></span>
              <div className="mm-dash-card-title">Withdrawal</div>
              <div className="mm-dash-card-sub">{'\u20BF'}250,000 / $23.42</div>
            </div>
          </div>
        </Card>
      </div>

      <L custom={i += 2} skip={fresh}>
        <div className="mm-dash-insights-header">
          <span>Insights</span>
          <span className="mm-dash-insights-link">View all {'\u203A'}</span>
        </div>
      </L>
      <div className="mm-dash-insights-cards">
        <Card custom={0} skip={fresh}>
          <div className="mm-dash-insight-card">
            <div className="mm-dash-insight-title">Large wallet balance <span className="mm-dash-insight-arrow">{'\u25B2'}</span></div>
            <div className="mm-dash-insight-body">$10,000 in your Square wallet. Move it to self-custody with Bitkey?". <span className="mm-dash-insight-link">Review {'\u2192'}</span></div>
          </div>
        </Card>
        <Card custom={1} skip={fresh}>
          <div className="mm-dash-insight-card">
            <div className="mm-dash-insight-title">Healthy margins at Pink Owl{'\u2014'}Downtown</div>
            <div className="mm-dash-insight-body">Based on your margins, you could increase conversion from 35% to 40%. <span className="mm-dash-insight-link">Review {'\u2192'}</span></div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Orchestrator
   ───────────────────────────────────────────── */
const HOLD_MS = 3200

/* Measure both screens via non-animated hidden clones.
   Retries until visible (parent may be display:none on mount). */
function useMeasure() {
  const refA = React.useRef(null)
  const refB = React.useRef(null)
  const [heights, setHeights] = React.useState(null)

  React.useEffect(() => {
    let cancelled = false
    function tryMeasure() {
      const a = refA.current?.offsetHeight || 0
      const b = refB.current?.offsetHeight || 0
      if (a > 0 && b > 0) {
        if (!cancelled) setHeights({ A: a, B: b })
      } else if (!cancelled) {
        requestAnimationFrame(tryMeasure)
      }
    }
    // Double rAF to ensure initial layout is complete
    requestAnimationFrame(() => requestAnimationFrame(tryMeasure))
    return () => { cancelled = true }
  }, [])

  return { refA, refB, heights }
}

const BASE_WIDTH = 720
const MAX_SCALE = 0.88

function useResponsiveScale(ref, contentHeight) {
  const [scale, setScale] = React.useState(MAX_SCALE)

  React.useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const ro = new ResizeObserver(([entry]) => {
      const isMobile = typeof window !== 'undefined'
        && window.matchMedia('(max-width: 768px)').matches
      // Phone: overlay already supplies 24px breathing room, so fill the full content width.
      // Desktop/tablet: keep the historical 32px each side inset.
      const PADDING = isMobile ? 0 : 32 * 2
      const w = entry.contentRect.width - PADDING
      const h = entry.contentRect.height - PADDING
      const scaleByWidth = w / BASE_WIDTH
      const scaleByHeight = contentHeight > 0 ? h / contentHeight : Infinity
      const maxAllowed = isMobile ? 1 : MAX_SCALE
      const fitted = Math.min(maxAllowed, scaleByWidth, scaleByHeight)
      setScale(Math.max(0.1, fitted))
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [ref, contentHeight])

  return scale
}

export default function MoneybotMockup({ active }) {
  const [screen, setScreen] = React.useState('B')
  const [fresh, setFresh] = React.useState(true)
  const { refA, refB, heights } = useMeasure()
  const containerRef = React.useRef(null)
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth <= 1024)
  const [isPhone, setIsPhone] = React.useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)')
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const onChange = (e) => setIsPhone(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const maxHeight = heights ? Math.max(heights.A, heights.B) : 0
  const contentHeight = maxHeight
  const scale = useResponsiveScale(containerRef, contentHeight)

  const prevActive = React.useRef(false)
  React.useEffect(() => {
    if (active && !prevActive.current) {
      setScreen('B')
      setFresh(true)
    }
    prevActive.current = active
  }, [active])

  React.useEffect(() => {
    if (!active) return
    const id = setTimeout(() => {
      setFresh(false)
      setScreen(s => s === 'A' ? 'B' : 'A')
    }, HOLD_MS)
    return () => clearTimeout(id)
  }, [active, screen])

  const h = heights ? heights[screen] : 'auto'

  const containerStyle = {
    transform: `scale(${scale})`,
    transformOrigin: isPhone ? 'top left' : undefined,
    height: isMobile && heights ? maxHeight : undefined,
    alignItems: isMobile ? 'center' : undefined,
  }

  const outerStyle = isPhone && heights ? {
    width: BASE_WIDTH * scale,
    height: maxHeight * scale,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  } : { display: 'contents' }

  return (
    <div ref={containerRef} style={outerStyle}>
    <div className="mm-container" style={containerStyle}>
      {/* Hidden non-animated clones for measurement */}
      {!heights && (
        <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 720, zIndex: -1 }}>
          <div ref={refA} className="mm-screen mm-automations" style={{ width: 720 }}>
            <AutomationsScreenStatic />
          </div>
          <div ref={refB} className="mm-screen mm-dashboard" style={{ width: 720 }}>
            <DashboardScreenStatic />
          </div>
        </div>
      )}

      <motion.div
        className="mm-sizer"
        animate={{ height: h }}
        transition={fresh ? { duration: 0 } : springContainer}
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        {heights && (
          <AnimatePresence mode="sync">
            {screen === 'A'
              ? <AutomationsScreen key="auto" />
              : <BitcoinDashScreen key="dash" fresh={fresh} />
            }
          </AnimatePresence>
        )}
      </motion.div>
    </div>
    </div>
  )
}

/* ── Static (non-animated) screen clones for measurement ── */
function AutomationsScreenStatic() {
  return <>
    <div className="mm-auto-header">
      <div className="mm-auto-tabs">
        <span className="mm-auto-tab mm-auto-tab--active">Bitcoin automations</span>
        <span className="mm-auto-tab">Running soon</span>
        <span className="mm-auto-tab">Suggested</span>
        <span className="mm-auto-tab">Paused</span>
      </div>
      <div className="mm-auto-header-icons">
        <span className="mm-icon-btn"><img src={iconNavFilter} alt="" /></span>
        <span className="mm-icon-btn"><img src={iconNavSearch} alt="" /></span>
      </div>
    </div>
    <div className="mm-auto-section-label">Running soon</div>
    {[1,2].map(k => <div key={k} className="mm-auto-row"><div className="mm-auto-row-left"><span className="mm-auto-icon"><img src={iconAutoPlay} alt="" /></span><span className="mm-auto-row-title">Row</span><span className="mm-auto-row-desc">Desc</span></div><span className="mm-auto-badge">Badge</span></div>)}
    <div className="mm-auto-section-label mm-auto-section-label--gap">Suggested</div>
    {[1,2,3,4].map(k => <div key={k} className="mm-auto-row"><div className="mm-auto-row-left"><span className="mm-auto-icon"><img src={iconAutoSuggestion} alt="" /></span><span className="mm-auto-row-title">Row</span><span className="mm-auto-row-desc">Desc</span></div><span className="mm-auto-badge">Badge</span></div>)}
    <div className="mm-auto-section-label mm-auto-section-label--gap">Paused</div>
    {[1,2,3].map(k => <div key={k} className="mm-auto-row"><div className="mm-auto-row-left"><span className="mm-auto-icon"><img src={iconAutoPaused} alt="" /></span><span className="mm-auto-row-title">Row</span><span className="mm-auto-row-desc">Desc</span></div><span className="mm-auto-badge">Badge</span></div>)}
  </>
}

function DashboardScreenStatic() {
  return <>
    <div className="mm-dash-header">
      <span className="mm-icon-btn mm-icon-btn--lg"><img src={iconNavMenu} alt="" /></span>
      <span className="mm-dash-title-text">Bitcoin</span>
      <div className="mm-dash-nav"><span>Buy</span><span>Sell</span><span>Withdraw</span><span className="mm-icon-btn"><img src={iconNavMore} alt="" /></span></div>
    </div>
    <div className="mm-dash-hero-title">Bitcoin</div>
    <div className="mm-dash-stats">
      <div className="mm-dash-stat"><div className="mm-dash-stat-bar mm-dash-stat-bar--active" /><div className="mm-dash-stat-label">Balance</div><div className="mm-dash-stat-value">₿2,556,330</div><div className="mm-dash-stat-sub">$2,556.93</div></div>
      <div className="mm-dash-stat"><div className="mm-dash-stat-label mm-dash-stat-label--muted">Payments today</div><div className="mm-dash-stat-value mm-dash-stat-value--muted">23</div><div className="mm-dash-stat-sub mm-dash-stat-sub--green">▲ 7.9%</div></div>
      <div className="mm-dash-stat"><div className="mm-dash-stat-label mm-dash-stat-label--muted">Top location</div><div className="mm-dash-stat-value mm-dash-stat-value--muted">Presidio</div></div>
    </div>
    <div className="mm-dash-cards">
      <div className="mm-dash-card"><div className="mm-dash-card-top"><div className="mm-dash-card-avatars"><span className="mm-dash-avatar" /><span className="mm-dash-avatar" /><span className="mm-dash-avatar" /></div><div className="mm-dash-card-title">Upcoming conversion</div><div className="mm-dash-card-sub">3 Locations</div></div><div className="mm-dash-card-meta"><div>74 Sales</div><div>$2,449.73 Processed</div><div>Converting 35-50%</div></div></div>
      <div className="mm-dash-card"><div className="mm-dash-card-timestamp">Today, 3:43pm</div><div className="mm-dash-card-bottom"><span className="mm-dash-avatar mm-dash-avatar--lg mm-dash-avatar--btc" /><div className="mm-dash-card-title">Cash App customer</div><div className="mm-dash-card-sub">₿74,339 / $63.42</div></div></div>
      <div className="mm-dash-card"><div className="mm-dash-card-timestamp">Today, 2:58pm</div><div className="mm-dash-card-bottom"><span className="mm-dash-avatar mm-dash-avatar--lg mm-dash-avatar--minus" /><div className="mm-dash-card-title">Withdrawal</div><div className="mm-dash-card-sub">₿250,000 / $23.42</div></div></div>
    </div>
    <div className="mm-dash-insights-header"><span>Insights</span><span className="mm-dash-insights-link">View all ›</span></div>
    <div className="mm-dash-insights-cards">
      <div className="mm-dash-insight-card"><div className="mm-dash-insight-title">Large wallet balance</div><div className="mm-dash-insight-body">$10,000 in your Square wallet. Move it to self-custody with Bitkey?". Review →</div></div>
      <div className="mm-dash-insight-card"><div className="mm-dash-insight-title">Healthy margins at Pink Owl—Downtown</div><div className="mm-dash-insight-body">Based on your margins, you could increase conversion from 35% to 40%. Review →</div></div>
    </div>
  </>
}
