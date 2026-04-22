import { useState, useCallback, useRef, useEffect } from 'react'
import Lottie from 'lottie-react'
import { ADial } from '../assets/components/arcade/ADial'
import { ATitleBarSub } from '../assets/components/arcade/ATitleBarSub'
import { AInputChip } from '../assets/components/arcade/AInputChip'
import { AInputChipGrid } from '../assets/components/arcade/AInputChipGrid'
import { AListUnordered } from '../assets/components/arcade/AListUnordered'
import { AHeaderPage } from '../assets/components/arcade/AHeaderPage'
import { AIcon } from '../assets/components/arcade/AIcon'
import { useAutopilot } from '../assets/components/autopilot'
import statusBarImg from '../assets/images/status-bar.png'
import loaderDark from './assets/loader-dark.json'
import heroImg from './assets/hero@2x.png'
import './receive-as-bitcoin.css'

const CHIP_OPTIONS = [100, 1000, 2500, 5000, 10000]

function bpsToPercent(bps) { return Math.round(bps / 100) }
function snap(value, step) { return Math.round(value / step) * step }

/* ── Intro screen ── */

function IntroScreen({ onContinue }) {
  return (
    <div className="receive-btc-intro">
      <ATitleBarSub type="parent" />
      <div className="receive-btc-intro__hero">
        <img src={heroImg} alt="" className="receive-btc-intro__hero-img" style={{ width: 390 }} />
      </div>
      <h1 className="receive-btc-intro__headline">Bitcoin every time someone pays you</h1>
      <div className="receive-btc-intro__spacer-32" />
      <AListUnordered
        size="compact"
        items={[
          { icon: <AIcon name="investing" set={24} />, label: 'Automatically invest in bitcoin', body: 'Receive a percentage of each payment as bitcoin with no fees.' },
          { icon: <AIcon name="transfer-p2p" set={24} />, label: 'Receive or request', body: 'Get bitcoin no matter how payments come in.' },
          { icon: <AIcon name="wallet" set={24} />, label: 'All in one place', body: 'Bitcoin arrives right here in your bitcoin balance.' },
        ]}
      />
      <div className="receive-btc-intro__footer">
        <button className="receive-btc-cta ap-rb-intro-continue" onClick={onContinue}>Continue</button>
      </div>
    </div>
  )
}

/* ── Dial screen ── */

function DialScreen({ bps, onBpsChange, onBack, onContinue }) {
  const [dragging, setDragging] = useState(false)
  const animRef = useRef(0)
  const percent = bpsToPercent(bps)
  const selectedChipIndex = dragging ? -1 : CHIP_OPTIONS.indexOf(bps)

  const animateTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current)
    const start = performance.now()
    const from = bps
    const duration = 250
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      onBpsChange(Math.round((from + (target - from) * ease) / 100) * 100)
      if (t < 1) animRef.current = requestAnimationFrame(step)
    }
    animRef.current = requestAnimationFrame(step)
  }, [bps, onBpsChange])

  const onDialChange = useCallback((v) => { onBpsChange(snap(v * 10000, 100)) }, [onBpsChange])

  return (
    <div className="receive-btc-dial-screen">
      <ATitleBarSub type="child" onNavigationPress={onBack} />
      <div className="receive-btc-dial-area">
        <ADial
          value={bps / 10000}
          onChange={onDialChange}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
        >
          <span className="receive-btc-percent">{percent}%</span>
          <span className="receive-btc-subtitle">of each payment</span>
        </ADial>
      </div>
      <div className="receive-btc-chips-area">
        <AInputChipGrid>
          {CHIP_OPTIONS.map((opt, i) => (
            <AInputChip key={opt} className={`ap-rb-chip-${bpsToPercent(opt)}`} selected={i === selectedChipIndex} onClick={() => animateTo(opt)}>
              {bpsToPercent(opt)}%
            </AInputChip>
          ))}
          <AInputChip icon={<AIcon name="pending" set={24} />} onClick={() => {}} />
        </AInputChipGrid>
      </div>
      <div className="receive-btc-footer">
        <button className="receive-btc-cta ap-rb-dial-continue" data-disabled={bps === 0} onClick={bps === 0 ? undefined : onContinue}>Continue</button>
      </div>
    </div>
  )
}

/* ── Confirm screen ── */

function ConfirmScreen({ percent, onBack, onConfirm }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t) }, [])

  if (loading) {
    return (
      <div className="receive-btc-confirm receive-btc-confirm--loading">
        <Lottie animationData={loaderDark} loop style={{ width: 56, height: 56 }} />
      </div>
    )
  }

  return (
    <div className="receive-btc-confirm">
      <ATitleBarSub type="child" onNavigationPress={onBack} />
      <AHeaderPage
        avatar={<div className="receive-btc-green-avatar"><AIcon name="currency-btc" set={32} /></div>}
        header={`Receive ${percent}% of each payment as bitcoin`}
        body="Total amount will vary based on the price of bitcoin and the amount of money received from payments."
      />
      <div className="receive-btc-confirm__spacer" />
      <AListUnordered items={[
        { label: 'Percentage', value: `${percent}%` },
        { label: 'Funding Source', value: 'Payments' },
        { label: 'BTC Amount', value: 'Varies' },
        { label: 'BTC Price', value: 'Varies' },
        { label: 'Fees', value: '$0.00' },
      ]} />
      <div className="receive-btc-confirm__footer">
        <button className="receive-btc-cta ap-rb-confirm" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  )
}

/* ── Success screen ── */

function SuccessScreen({ percent, onDone }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1000); return () => clearTimeout(t) }, [])

  if (loading) {
    return (
      <div className="receive-btc-success receive-btc-success--loading">
        <Lottie animationData={loaderDark} loop style={{ width: 56, height: 56 }} />
      </div>
    )
  }

  return (
    <div className="receive-btc-success">
      <ATitleBarSub type="parent" onNavigationPress={onDone} />
      <AHeaderPage
        avatar={<div className="receive-btc-green-avatar"><AIcon name="check" set={32} /></div>}
        header={`You\u2019ll get ${percent}% of each payment you receive as bitcoin`}
        body="Funds will be made available in your bitcoin balance."
      />
      <div className="receive-btc-success__footer">
        <button className="receive-btc-cta ap-rb-done" onClick={onDone}>Done</button>
      </div>
    </div>
  )
}

/* ── Main ── */

export default function ReceiveAsBitcoin() {
  const phoneRef = useRef(null)
  const [screen, setScreen] = useState('intro')
  const [trans, setTrans] = useState(null)
  const [bps, setBps] = useState(1000)

  const navigate = useCallback((to, dir) => {
    setTrans({ from: screen, to, dir })
    setTimeout(() => { setScreen(to); setTrans(null) }, 400)
  }, [screen])

  // ── Autopilot ──
  const autopilot = useAutopilot(phoneRef, async ({ sleep, moveTo, tap, track }) => {
    setScreen('intro'); setTrans(null); setBps(1000)
    await sleep(600)

    if (!(await moveTo('.ap-rb-intro-continue'))) return
    await tap()
    setTrans({ from: 'intro', to: 'dial', dir: 'forward' })
    await sleep(450); setScreen('dial'); setTrans(null); await sleep(500)

    // Tap 50% chip — animate dial 10% → 50%
    if (!(await moveTo('.ap-rb-chip-50'))) return
    await tap()
    { const from = 1000, to = 5000, steps = 16, stepMs = 16
      for (let i = 1; i <= steps; i++) {
        const t = i / steps; const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        setBps(Math.round((from + (to - from) * ease) / 100) * 100); await sleep(stepMs)
      }
    }
    setBps(5000); await sleep(600)

    // Slide dial handle 50% → 21%
    if (!(await moveTo('.a-dial__handle'))) return
    await sleep(300)
    { const from = 5000, to = 2100, steps = 24, stepMs = 25
      for (let i = 1; i <= steps; i++) {
        const t = i / steps; const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        setBps(Math.round((from + (to - from) * ease) / 100) * 100); track('.a-dial__handle'); await sleep(stepMs)
      }
    }
    setBps(2100); await sleep(400)

    if (!(await moveTo('.ap-rb-dial-continue'))) return
    await tap()
    setTrans({ from: 'dial', to: 'confirm', dir: 'forward' })
    await sleep(450); setScreen('confirm'); setTrans(null); await sleep(900)

    if (!(await moveTo('.ap-rb-confirm'))) return
    await tap()
    setTrans({ from: 'confirm', to: 'success', dir: 'forward' })
    await sleep(450); setScreen('success'); setTrans(null); await sleep(1400)

    if (!(await moveTo('.ap-rb-done'))) return
    await tap()
    setBps(1000)
    setTrans({ from: 'success', to: 'intro', dir: 'back' })
    await sleep(450); setScreen('intro'); setTrans(null); await sleep(700)
  }, { initial: true })

  function cls(s) {
    if (trans) {
      if (s === trans.from) return `receive-btc-screen receive-btc-screen--${trans.dir === 'forward' ? 'exit-left' : 'exit-right'}`
      if (s === trans.to) return `receive-btc-screen receive-btc-screen--${trans.dir === 'forward' ? 'enter-right' : 'enter-left'}`
      return null
    }
    return s === screen ? 'receive-btc-screen' : null
  }

  const introClass = cls('intro')
  const dialClass = cls('dial')
  const confirmClass = cls('confirm')
  const successClass = cls('success')

  return (
    <div style={{
      position: 'relative', width: 390, height: 844,
      borderRadius: 48, overflow: 'hidden',
      transform: 'scale(0.75)', transformOrigin: 'center', flexShrink: 0,
    }}>
      <div ref={phoneRef} className="receive-btc-proto dark force-dark">
        <div className="receive-btc-status-bar" />
        <div className="receive-btc-stage">
          {introClass && <div className={introClass}><IntroScreen onContinue={() => navigate('dial', 'forward')} /></div>}
          {dialClass && <div className={dialClass}><DialScreen bps={bps} onBpsChange={setBps} onBack={() => navigate('intro', 'back')} onContinue={() => navigate('confirm', 'forward')} /></div>}
          {confirmClass && <div className={confirmClass}><ConfirmScreen percent={bpsToPercent(bps)} onBack={() => navigate('dial', 'back')} onConfirm={() => navigate('success', 'forward')} /></div>}
          {successClass && <div className={successClass}><SuccessScreen percent={bpsToPercent(bps)} onDone={() => { setBps(1000); navigate('intro', 'back') }} /></div>}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 110 }}>
          <img src={statusBarImg} alt="" style={{ width: '100%', filter: 'invert(1)' }} draggable={false} />
        </div>
        {autopilot.cursor}
      </div>
    </div>
  )
}
