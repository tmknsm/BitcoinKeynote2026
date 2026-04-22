import React, { useState, useEffect, useRef, useMemo } from 'react'
import bitcoinLogo from './assets/BitcoinLogo.svg?v=2'
import blockLogo from './assets/BlockLogo.svg'
import squareLogoLarge from './assets/SquareLogoLarge.svg'
import MoneybotMockup from './MoneybotMockup'
import NearbyBitcoin from './NearbyBitcoin/NearbyBitcoin'
import nearbyBgImg from './NearbyBitcoin/assets/images/bg.png'
import SendBitcoinCashtag from './SendBitcoinCashtag/SendBitcoinCashtag'
import cashtagBgImg from './SendBitcoinCashtag/assets/images/sendtocashtagBG.png'
import ReceiveAsBitcoin from './ReceiveAsBitcoin/ReceiveAsBitcoin'
import BranToggle from './BranToggle/BranToggle'
import receiveAsBtcBgImg from './ReceiveAsBitcoin/receiveAsBitcoinBG.png'

function SlideHeader({ onOverview, isTitleSlide }) {
  return (
    <div className="slide-header">
      {isTitleSlide
        ? <img src={bitcoinLogo} alt="Bitcoin" className="logo-svg" />
        : <span className="logo-text">Living on Bitcoin</span>
      }
      <img src={blockLogo} alt="Block" className="block-logo" onClick={onOverview} />
    </div>
  )
}

const PHONE_SRCSET = './assets/AppletBitcoin/Applet-Bitcoin.png 1x, ./assets/AppletBitcoin/Applet-Bitcoin@2x.png 2x, ./assets/AppletBitcoin/Applet-Bitcoin@3x.png 3x'

function FPO({ type, label }) {
  return (
    <div className={`fpo fpo--${type}`}>
      {(type === 'phone' || type === 'map')
        ? <img src="./assets/AppletBitcoin/Applet-Bitcoin.png" srcSet={PHONE_SRCSET} alt={label} />
        : label
      }
    </div>
  )
}

const BG_SRCSET = './assets/Assetbg.png 1x, ./assets/Assetbg@2x.png 2x, ./assets/Assetbg@3x.png 3x'

function SplitWithBg({ label, headline, children, fpoType, fpoLabel, visual, fillVisual, bgImage, p }) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="split">
        <div className="split__text">
          <div className="split__top">
            <div className="label">{label}</div>
            <div className="headline headline--md" dangerouslySetInnerHTML={{ __html: headline }} />
          </div>
          <div className="split__bottom">
            {children}
          </div>
        </div>
        <div className={`split__visual${fillVisual ? ' split__visual--fill' : ''}`}>
          {!fillVisual && (
            bgImage
              ? <img className="split__bg-img" src={bgImage} alt="" />
              : <img className="split__bg-img" src="./assets/Assetbg.png" srcSet={BG_SRCSET} alt="" />
          )}
          <div className="split__visual--overlay">
            {visual || <FPO type={fpoType} label={fpoLabel} />}
          </div>
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}

function PageNum({ index, total }) {
  return <div className="slide-page-num">{index + 1} / {total}</div>
}

/* ── Individual Slides ── */

export function SlideTitleOpen(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--xl">Living on<br />Bitcoin</div>
        <div style={{ marginTop: 24, fontSize: 22, fontWeight: 500, color: 'var(--black)' }}>Bitcoin Las Vegas 2026</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideTitleOpen.theme = 'green'

export function SlideThesis(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="headline headline--lg" style={{ maxWidth: 950 }}>
        Bitcoin works when it moves easily, when people can rely on it day to day, and when it fits naturally into how they earn, save, and spend.
      </div>
      <div className="subhead" style={{ marginTop: 32 }}>Not when it sits idle as an asset.</div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideThesis.theme = 'dark'

function TypewriterText({ text, active, speed = 45, startDelay = 300 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) { setCount(0); return }
    setCount(0)
    let intervalId
    const delayId = setTimeout(() => {
      intervalId = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(intervalId)
            return c
          }
          return c + 1
        })
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(delayId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [active, text, speed, startDelay])

  return (
    <span className="typewriter">
      <span className="typewriter__ghost" aria-hidden="true">{text}</span>
      <span className="typewriter__live">
        {text.slice(0, count)}
        <span className="typewriter-cursor" aria-hidden="true" />
      </span>
    </span>
  )
}

export function SlideLastYear(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="label">This Year</div>
      <div className="headline headline--lg" style={{ marginTop: 12, maxWidth: 1000 }}>
        <TypewriterText
          text="We're showing you what living on bitcoin actually looks like."
          active={p.active}
        />
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideLastYear.theme = 'dark'

const FOOTAGE_VIDEOS = [
  '1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4',
  '8.mp4', '9.mp4', '10.mp4', '11.mp4', '12.mp4', '13.mp4', '14.mp4',
]

// All video sources used across the deck — imported by App for global preloading
export const ALL_VIDEO_SOURCES = [
  ...FOOTAGE_VIDEOS.map((n) => `./assets/Footage/${n}`),
  './assets/BitkeyAnimations/generated-animations.mp4',
]

export function SlideLivingProof(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="footage-grid">
        {FOOTAGE_VIDEOS.map((name) => (
          <div className="footage-grid__cell" key={name}>
            <video
              className="footage-grid__video"
              src={`./assets/Footage/${name}`}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
        ))}
      </div>
      <div className="footage-grid__scrim" />
      <div className="footage-grid__content">
        <div className="label">Last Year</div>
        <div className="headline headline--lg" style={{ marginTop: 12 }}>
          Merchants accepting bitcoin.<br />Businesses building treasuries.
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideLivingProof.theme = 'dark'
SlideLivingProof.className = 'slide--footage'

export function SlideLivingReel(p) {
  const [index, setIndex] = useState(0)
  const videoRef = useRef(null)

  // Reset to first clip whenever the slide becomes active
  useEffect(() => {
    if (p.active) setIndex(0)
  }, [p.active])

  const handleEnded = () => {
    setIndex((prev) => (prev + 1) % FOOTAGE_VIDEOS.length)
  }

  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="footage-reel">
        <video
          ref={videoRef}
          key={FOOTAGE_VIDEOS[index]}
          className="footage-reel__video"
          src={`./assets/Footage/${FOOTAGE_VIDEOS[index]}`}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded}
        />
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideLivingReel.theme = 'dark'
SlideLivingReel.className = 'slide--reel'

export function SlideSpendItSection(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--xl">Spend It</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideSpendItSection.theme = 'dark'

function RollingDigit({ position, hidden }) {
  return (
    <span className="rolling-digit" style={{ opacity: hidden ? 0 : 1 }}>
      <span
        className="rolling-digit__strip"
        style={{ transform: `translateY(-${position}em)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <span className="rolling-digit__cell" key={i}>{d}</span>
        ))}
      </span>
    </span>
  )
}

function RollingCounter({
  value,
  active,
  duration = 2500,
  rollCount = 3,
  stagger = 0.08,
  tickRate = 1,
  tickRollMs = 350,
  chainStaggerMs = 120,
}) {
  const [state, setState] = useState({ t: 0, phase2: 0 })
  const rafRef = useRef()

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (!active) {
      setState({ t: 0, phase2: 0 })
      return
    }
    setState({ t: 0, phase2: 0 })
    const start = performance.now()
    const step = (now) => {
      const elapsed = now - start
      if (elapsed <= duration) {
        setState({ t: elapsed / duration, phase2: 0 })
      } else {
        setState({ t: 1, phase2: (elapsed - duration) / 1000 })
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, value, duration])

  const { t, phase2 } = state
  const inPhase2 = phase2 > 0
  const rollDurationS = tickRollMs / 1000

  const numDigits = String(value).length
  const wheelWindow = Math.max(0.0001, 1 - stagger * (numDigits - 1))
  const items = []
  for (let idx = 0; idx < numDigits; idx++) {
    const idxFromRight = numDigits - 1 - idx
    const placeValue = Math.pow(10, idxFromRight)
    const targetDigit = Math.floor(value / placeValue) % 10
    let pos
    if (inPhase2) {
      const totalTicks = tickRate * phase2
      const counter = value + Math.floor(totalTicks)
      const currentDigit = Math.floor(counter / placeValue) % 10
      const ticksSoFar =
        Math.floor(counter / placeValue) - Math.floor(value / placeValue)
      if (ticksSoFar === 0) {
        pos = currentDigit
      } else {
        const counterOfLastTick =
          (Math.floor(value / placeValue) + ticksSoFar) * placeValue
        const tickTime = (counterOfLastTick - value) / tickRate
        const wheelDelay = (idxFromRight * chainStaggerMs) / 1000
        const timeSinceTick = phase2 - tickTime - wheelDelay
        const previousDigit = (currentDigit - 1 + 10) % 10
        if (timeSinceTick < 0) {
          pos = previousDigit
        } else if (timeSinceTick >= rollDurationS) {
          pos = currentDigit
        } else {
          const progress = timeSinceTick / rollDurationS
          const eased = 1 - Math.pow(1 - progress, 4)
          pos = previousDigit + eased
        }
      }
    } else {
      const startT = idx * stagger
      const localT = Math.min(Math.max((t - startT) / wheelWindow, 0), 1)
      const eased = 1 - Math.pow(1 - localT, 4)
      const rollPos = targetDigit - rollCount + rollCount * eased
      pos = ((rollPos % 10) + 10) % 10
    }
    const started = inPhase2 || t >= idx * stagger
    items.push(
      <RollingDigit key={`d${idx}`} position={pos} hidden={!started} />
    )
    if (idxFromRight > 0 && idxFromRight % 3 === 0) {
      items.push(
        <span
          className="rolling-counter__comma"
          style={{ opacity: started ? 1 : 0 }}
          key={`c${idx}`}
        >
          ,
        </span>
      )
    }
  }
  return <span className="rolling-counter">{items}</span>
}

export function SlideSpendItStat(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="centered">
        <div className="stat-row">
          <img src={squareLogoLarge} alt="Square" className="stat-row__logo" />
          <div className="stat-row__divider" />
          <div className="headline headline--xl">
            <RollingCounter value={627392} active={p.active} tickRate={1 / 8} />
          </div>
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideSpendItStat.theme = 'dark'

export function SlideBitcoinToggle(p) {
  return (
    <SplitWithBg
      label="Toggle to bitcoin"
      headline="Customer-facing<br/>bitcoin toggle"
      visual={<BranToggle />}
      p={p}
    >
      <ul className="bullet-list">
        <li>Enabled on all Square registers at the conference</li>
        <li>No more asking the cashier "Can I pay with bitcoin?"</li>
        <li>If you see the toggle, you can pay. If not, earn a bounty!</li>
      </ul>
    </SplitWithBg>
  )
}
SlideBitcoinToggle.theme = 'dark'
SlideBitcoinToggle.className = 'slide--split-bg slide--no-logo-text'

export function SlideSquareNFC(p) {
  return (
    <SplitWithBg label="Square NFC Bitcoin Payments" headline="Tap to pay<br/>with bitcoin." fpoType="phone" fpoLabel="FPO — NFC Tap-to-Pay UI" p={p}>
      <ul className="bullet-list">
        <li>Millions of US Square merchants accept bitcoin natively at point-of-sale</li>
        <li>Lightning Network — instant settlement, merchants own their bitcoin</li>
        <li>Hold bitcoin or convert to fiat. Sweep to self-custody anytime.</li>
      </ul>
    </SplitWithBg>
  )
}
SlideSquareNFC.theme = 'dark'
SlideSquareNFC.className = 'slide--split-bg'

export function SlideBeamBitcoin(p) {
  return (
    <SplitWithBg
      label="Pay nearby"
      headline="Beam bitcoin to friends<br/>or merchants."
      bgImage={nearbyBgImg}
      visual={<NearbyBitcoin />}
      p={p}
    >
      <ul className="bullet-list">
        <li>Powered by Bluetooth low-energy</li>
        <li>{'Works seamlessly between Square <> Cash App'}</li>
        <li>Coming later this year</li>
      </ul>
    </SplitWithBg>
  )
}
SlideBeamBitcoin.theme = 'dark'
SlideBeamBitcoin.className = 'slide--split-bg slide--no-logo-text'

export function SlideP2PReceive(p) {
  return (
    <SplitWithBg
      label="Cash App 2.0"
      headline="Bitcoin in the background<br/>of everyday life"
      bgImage={cashtagBgImg}
      visual={<SendBitcoinCashtag />}
      p={p}
    >
      <ul className="bullet-list">
        <li>Receive bitcoin when your friends pay you in fiat</li>
        <li>Peer-to-peer payments funded by your bitcoin balance</li>
        <li>0 fees on DCA, Paycheck conversions, and round-ups</li>
      </ul>
    </SplitWithBg>
  )
}
SlideP2PReceive.theme = 'dark'
SlideP2PReceive.className = 'slide--split-bg slide--no-logo-text'

export function SlideReceiveAsBitcoin(p) {
  return (
    <SplitWithBg
      label="Cash App 2.0"
      headline="Bitcoin in the background<br/>of everyday life"
      bgImage={receiveAsBtcBgImg}
      visual={<ReceiveAsBitcoin />}
      p={p}
    >
      <ul className="bullet-list">
        <li>Receive bitcoin when your friends pay you in fiat</li>
        <li>Peer-to-peer payments funded by your bitcoin balance</li>
        <li>0 fees on DCA, Paycheck conversions, and round-ups</li>
      </ul>
    </SplitWithBg>
  )
}
SlideReceiveAsBitcoin.theme = 'dark'
SlideReceiveAsBitcoin.className = 'slide--split-bg slide--no-logo-text'

export function SlideUseItSection(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--xl">Use It</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideUseItSection.theme = 'dark'

export function SlideCashApp1(p) {
  return (
    <SplitWithBg label="Cash App 2.0" headline="Living on bitcoin,<br/>made simple" fpoType="phone" fpoLabel="FPO — Cash App BTC Home" p={p}>
      <ul className="bullet-list">
        <li>5x higher withdrawal limits — $10k/day, $25k/week</li>
        <li>Send bitcoin to $cashtags — no addresses needed</li>
        <li>Pay with bitcoin from your cash balance — keep your stack intact</li>
      </ul>
    </SplitWithBg>
  )
}
SlideCashApp1.theme = 'dark'
SlideCashApp1.className = 'slide--split-bg slide--no-logo-text'

export function SlideBitcoinMap(p) {
  return (
    <SplitWithBg label="Bitcoin Map" headline="Find new places<br/>to spend" fpoType="map" fpoLabel="FPO — Bitcoin Map UI" p={p}>
      <ul className="bullet-list">
        <li>Map volume increased by X% since launch</li>
        <li>Earn 5% bitcoin back at Square merchants</li>
        <li>$25 automatic bounty for first spend at a Square business</li>
      </ul>
    </SplitWithBg>
  )
}
SlideBitcoinMap.theme = 'dark'
SlideBitcoinMap.className = 'slide--split-bg slide--no-logo-text'

export function SlideOwnItSection(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--xl">Own It</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideOwnItSection.theme = 'dark'

export function SlideBitkey(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="split">
        <div className="split__text">
          <div className="split__top">
            <div className="label">Bitkey W3</div>
            <div className="headline headline--md" dangerouslySetInnerHTML={{ __html: 'Self-custody<br/>for everyone.' }} />
          </div>
          <div className="split__bottom">
            <ul className="bullet-list">
              <li>New W3 hardware with screen for on-device transaction verification</li>
              <li>2-of-3 multisig — no seed phrases, no complexity</li>
              <li>Buy on Cash App, move to self-custody instantly</li>
              <li>Inheritance planning, private balances, Emergency Exit Kit</li>
            </ul>
          </div>
        </div>
        <div className="split__visual split__visual--black">
          <video className="split__video" src="./assets/BitkeyAnimations/generated-animations.mp4" autoPlay loop muted playsInline />
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideBitkey.theme = 'dark'
SlideBitkey.className = 'slide--split-bg'

// Animated dot field used as the background of the Proto slide. Each dot is
// an individual DOM node so we can give them staggered animations to produce
// a wave of brightening dots ripple-ing out from the top-left corner.
const PROTO_DOT_SPACING = 26
const PROTO_WAVE_DURATION = 6 // seconds for the wave to sweep from corner to corner
const PROTO_WAVE_PAUSE = 3 // seconds of stillness after the wave finishes before the next one starts
const PROTO_PULSE_TAIL = 1 // approx. seconds for a single dot's pulse (matches keyframes below)
const PROTO_WAVE_TOTAL = PROTO_WAVE_DURATION + PROTO_PULSE_TAIL + PROTO_WAVE_PAUSE
function ProtoDotGrid({ active }) {
  const ref = useRef(null)
  const [dims, setDims] = useState({ cols: 0, rows: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setDims({
        cols: Math.ceil(r.width / PROTO_DOT_SPACING) + 2,
        rows: Math.ceil(r.height / PROTO_DOT_SPACING) + 2,
      })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const dots = useMemo(() => {
    const { cols, rows } = dims
    if (!cols || !rows) return null
    const maxDiag = Math.hypot(cols, rows)
    const out = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const dist = Math.hypot(x, y)
        const delay = (dist / maxDiag) * PROTO_WAVE_DURATION
        out.push(
          <span
            key={`${x}-${y}`}
            className="proto-dot"
            style={{
              left: `${x * PROTO_DOT_SPACING}px`,
              top: `${y * PROTO_DOT_SPACING}px`,
              animationDelay: `${delay.toFixed(3)}s`,
              animationDuration: `${PROTO_WAVE_TOTAL}s`,
            }}
          />
        )
      }
    }
    return out
  }, [dims])

  return (
    <div
      ref={ref}
      className={`proto-dot-grid${active ? ' is-active' : ''}`}
      aria-hidden="true"
    >
      {dots}
    </div>
  )
}

export function SlideProtoSizzle(p) {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (p.active) {
      try { v.currentTime = 0 } catch (e) { /* ignore */ }
      const play = v.play()
      if (play && typeof play.catch === 'function') play.catch(() => {})
    } else {
      v.pause()
    }
  }, [p.active])

  return (
    <SplitWithBg
      label="Proto"
      headline="Proto Fleet—free open-source mining suite"
      visual={
        <>
          <ProtoDotGrid active={p.active} />
          <video
            ref={videoRef}
            src="./assets/Videos/fleet-beta.mp4"
            poster="./assets/Images/fleet-betaPlaceholder.png"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{
              width: 'calc(100% - 64px)',
              maxHeight: 'calc(100% - 64px)',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              display: 'block',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </>
      }
      p={p}
    >
      <ul className="bullet-list">
        <li>TK</li>
        <li>TK</li>
        <li>TK</li>
      </ul>
    </SplitWithBg>
  )
}
SlideProtoSizzle.theme = 'dark'
SlideProtoSizzle.className = 'slide--split-bg slide--no-logo-text slide--proto-bg'

export function SlideFoundation(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="label">The Foundation</div>
      <div className="headline headline--lg" style={{ marginTop: 12, maxWidth: 800 }}>
        Infrastructure no single company controls.
      </div>
      <div className="three-col">
        <div className="three-col__item">
          <div className="three-col__icon">S</div>
          <div className="three-col__title">Spiral</div>
          <div className="three-col__desc">Open-source bitcoin development. No strings attached.</div>
        </div>
        <div className="three-col__item">
          <div className="three-col__icon">P</div>
          <div className="three-col__title">Proto</div>
          <div className="three-col__desc">Open-source mining hardware. Decentralizing the supply chain.</div>
        </div>
        <div className="three-col__item">
          <div className="three-col__icon">&#8383;</div>
          <div className="three-col__title">Resilience</div>
          <div className="three-col__desc">Bitcoin only works if it stays decentralized. These are long-term investments in its future.</div>
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideFoundation.theme = 'dark'

export function SlideIntelligenceSection(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="centered">
        <div className="label" style={{ marginBottom: 12 }}>Bitcoin as</div>
        <div className="headline headline--xl">Intelligence</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideIntelligenceSection.theme = 'dark'

export function SlideManagerbot(p) {
  return (
    <SplitWithBg label="Managerbot — Square" headline="A protector<br/>on your side." visual={<MoneybotMockup active={p.active} />} p={p}>
      <div className="chat-bubbles">
        <div className="chat-bubble">
          <div className="bot-name">Managerbot</div>
          "You've accumulated $10,000 in your Square wallet. Want to move it to self-custody with Bitkey?"
        </div>
        <div className="chat-bubble">
          <div className="bot-name">Managerbot</div>
          "Your daily bitcoin conversion is set to 10%. Based on your margins, you could increase to 15%. Want me to adjust?"
        </div>
      </div>
    </SplitWithBg>
  )
}
SlideManagerbot.theme = 'dark'
SlideManagerbot.className = 'slide--split-bg'

export function SlideMoneybot(p) {
  return (
    <SplitWithBg label="Moneybot — Cash App" headline="Watches over your<br/>financial life." fpoType="phone" fpoLabel="FPO — Moneybot UI" p={p}>
      <div className="chat-bubbles">
        <div className="chat-bubble">
          <div className="bot-name">Moneybot</div>
          "You've been buying bitcoin manually every week. Want me to set up Auto Invest — no fees, fully automatic?"
        </div>
        <div className="chat-bubble">
          <div className="bot-name">Moneybot</div>
          "Your rent is due in 4 days but your USD balance is low. Want me to convert some bitcoin to cover it?"
        </div>
      </div>
    </SplitWithBg>
  )
}
SlideMoneybot.theme = 'dark'
SlideMoneybot.className = 'slide--split-bg'

export function SlideOpenAgents(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} />
      <div className="centered" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="headline headline--lg">Open agents need<br />open money.</div>
        <div className="subhead" style={{ marginTop: 32, textAlign: 'center', maxWidth: 720 }}>
          AI agents are becoming part of economic life. They need money.<br /><br />
          Bitcoin is the best money ever created: fixed supply, instant final settlement, no borders, no gatekeepers. The same properties that make it the best choice for people make it the obvious choice for every intelligent system.
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideOpenAgents.theme = 'dark'

export function SlideClosing(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--lg" style={{ maxWidth: 950 }}>
          Bitcoin becomes everyday money when it's easier to use than not to use.
        </div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideClosing.theme = 'dark'

export function SlideThankYou(p) {
  return (
    <>
      <SlideHeader onOverview={p.onOverview} isTitleSlide />
      <div style={{ marginTop: 'auto', marginBottom: 60 }}>
        <div className="headline headline--xl">Thank you</div>
      </div>
      <PageNum index={p.index} total={p.total} />
    </>
  )
}
SlideThankYou.theme = 'green'

/* ── Slide List ── */
export const SLIDES = [
  SlideTitleOpen,
  SlideThesis,
  SlideLivingProof,
  SlideLastYear,
  SlideLivingReel,
  SlideSpendItSection,
  SlideSpendItStat,
  SlideBitcoinToggle,
  SlideSquareNFC,
  SlideBeamBitcoin,
  SlideUseItSection,
  SlideP2PReceive,
  SlideReceiveAsBitcoin,
  SlideCashApp1,
  SlideBitcoinMap,
  SlideOwnItSection,
  SlideBitkey,
  SlideProtoSizzle,
  SlideFoundation,
  SlideIntelligenceSection,
  SlideManagerbot,
  SlideMoneybot,
  SlideOpenAgents,
  SlideClosing,
  SlideThankYou,
]
