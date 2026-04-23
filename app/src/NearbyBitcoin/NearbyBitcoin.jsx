import { useState, useCallback, useRef, useEffect } from "react"
import { useAutopilot } from "./useAutopilot.jsx"
import { ParticleField } from "./ParticleField"
import CashSpinner from "./CashSpinner"
import './nearby-bitcoin.css'

// Images
import appBarImg from './assets/images/app-bar.png'
import swapSvg from './assets/images/Swap.svg'
import decimalImg from './assets/images/decimal.png'
import chevronLeftImg from './assets/images/chevron-left.png'
import bottomBarImg from './assets/images/bottom-bar.png'
import paymentConfirmationImg from './assets/images/payment-confirmation.png'
import paymentNotificationImg from './assets/images/payment-notification.png'
import closeIconImg from './assets/images/close-icon.png'
import gearIconImg from './assets/images/gear-icon.png'
import avatarFocusIconImg from './assets/images/avatar-focus-icon.png'
import payBlackBottomInactiveImg from './assets/images/pay-black-bottom-inactive.png'
import tickImg from './assets/images/tick.png'
import payAvatarImg from './assets/images/pay-avatar.png'
import payNewImg from './assets/images/pay-new.png'
import getPaidNewImg from './assets/images/get-paid-new.png'
import closeXImg from './assets/images/close-x.png'
import greenCheckImg from './assets/images/green-check.png'
import profileImg from './assets/images/profile.png'
import avatarJessicaImg from './assets/images/avatar-jessica.png'
import nuxErrorImg from './assets/images/nux-error.png'
import bluetoothIconImg from './assets/images/bluetooth-icon.png'
import avatarImg from './assets/images/avatar.png'
import statusBarImg from '../assets/images/status-bar.png'

const colorMode = "dark"

const NEARBY_INNER_W = 390
const NEARBY_INNER_H = 844
const NEARBY_DESKTOP_SCALE = 0.75

export default function NearbyBitcoin() {
  const phoneRef = useRef(null)
  const outerRef = useRef(null)
  const [mobileScale, setMobileScale] = useState(null)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const parent = outer.parentElement
    if (!parent) return
    const ro = new ResizeObserver(([entry]) => {
      const isMobile = typeof window !== 'undefined'
        && window.matchMedia('(max-width: 768px)').matches
      if (isMobile) {
        const availW = entry.contentRect.width
        setMobileScale(Math.min(availW / NEARBY_INNER_W, NEARBY_DESKTOP_SCALE))
      } else {
        setMobileScale(null)
      }
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  const effectiveScale = mobileScale != null ? mobileScale : NEARBY_DESKTOP_SCALE
  const [activated, setActivated] = useState(false)
  const [freezeRequest, setFreezeRequest] = useState(false)
  const [bottomToggled, setBottomToggled] = useState(false)
  const [phase, setPhase] = useState("idle-green")
  const hasPlayedScanline = useRef(false)
  const transitioning = useRef(false)
  const scanlineRef = useRef(0)
  const people = useRef([
    { avatarSrc: profileImg, name: "Pink Owl Coffee" },
    { avatarSrc: avatarJessicaImg, name: "Jessica K." },
  ]).current
  const [focusedAvatar, setFocusedAvatar] = useState(null)
  const [avatarAnimating, setAvatarAnimating] = useState(false)
  const [typedDigits, setTypedDigits] = useState([])
  const [paidDigits, setPaidDigits] = useState([])
  const keypadTapped = typedDigits.length > 0
  const MAX_DIGITS = 6
  const [payLoading, setPayLoading] = useState(false)
  const [loaderFadingOut, setLoaderFadingOut] = useState(false)
  const [payComplete, setPayComplete] = useState(false)
  const payCompleteRef = useRef(false)
  const [tickVisible, setTickVisible] = useState(false)
  const [tickDismissed, setTickDismissed] = useState(false)
  const [showPaymentToast, setShowPaymentToast] = useState(false)
  const [payPopoverVisible, setPayPopoverVisible] = useState(false)
  const [payPopoverLoading, setPayPopoverLoading] = useState(true)
  const [payPopoverContent, setPayPopoverContent] = useState(false)
  const paymentToastTimerRef = useRef(null)
  const [payAvatarVisible, setPayAvatarVisible] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const notificationTimerRef = useRef(null)
  const [clearAvatars, setClearAvatars] = useState(false)
  const selectAvatarRef = useRef(null)
  const [payWaveActive, setPayWaveActive] = useState(false)
  const [resettingToScan, setResettingToScan] = useState(false)
  const currentPersonIndexRef = useRef(-1)
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0)

  const handleFreezeComplete = useCallback(() => { setFreezeRequest(false) }, [])

  const handleActivate = useCallback(() => {
    if (transitioning.current) return
    transitioning.current = true
    setPhase("fade-to-white")
    setActivated(true)
    setTimeout(() => setPhase("scanline-dots"), 800)
    setTimeout(() => {
      hasPlayedScanline.current = true
      setPhase("show-bottom")
      setTimeout(() => { setPhase("idle-activated"); transitioning.current = false }, 300)
    }, 2200)
  }, [])

  const handleDeactivateFromFocus = useCallback(() => {
    if (transitioning.current) return
    transitioning.current = true
    const wasPayComplete = payCompleteRef.current
    setTypedDigits([]); setPayLoading(false); setLoaderFadingOut(false); payCompleteRef.current = false
    setPhase("closing-from-focus")
    setPayAvatarVisible(false); setPayWaveActive(false); setNotificationVisible(false)
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current)
    setTimeout(() => {
      setActivated(false); setFocusedAvatar(null); setAvatarAnimating(false); setBottomToggled(false)
      setPayComplete(false); setTickVisible(false); setTickDismissed(false)
      setPayPopoverVisible(false); setPayPopoverLoading(true); setPayPopoverContent(false)
      setPhase("idle-green"); transitioning.current = false
      if (wasPayComplete) {
        if (paymentToastTimerRef.current) clearTimeout(paymentToastTimerRef.current)
        setShowPaymentToast(true)
        paymentToastTimerRef.current = setTimeout(() => { setShowPaymentToast(false); paymentToastTimerRef.current = null }, 3000)
      }
    }, 800)
  }, [])

  const handleAvatarClick = useCallback((avatarX, avatarY, avatarSrc) => {
    if (transitioning.current) return
    transitioning.current = true
    const fieldLeft = (393 - 354) / 2
    const fieldTop = (844 - 560) / 2
    const screenX = fieldLeft + avatarX - 19
    const screenY = fieldTop + avatarY
    const person = people.find(p => p.avatarSrc === avatarSrc) || people[0]
    setFocusedAvatar({ x: screenX, y: screenY, avatarSrc: person.avatarSrc, name: person.name })
    setPhase("avatar-focus")
    requestAnimationFrame(() => { requestAnimationFrame(() => setAvatarAnimating(true)) })
    setTimeout(() => { transitioning.current = false }, 800)
  }, [people])

  useEffect(() => { return () => cancelAnimationFrame(scanlineRef.current) }, [])

  // ── Autopilot ──
  const autopilot = useAutopilot(phoneRef, async ({ alive, sleep, moveTo, tap }) => {
    // Reset to clean state every loop
    setPayPopoverVisible(false); setPayPopoverLoading(true); setPayPopoverContent(false)
    setActivated(false); setBottomToggled(false); setFocusedAvatar(null); setAvatarAnimating(false)
    setTypedDigits([]); setPayComplete(false); setTickVisible(false); setTickDismissed(false)
    payCompleteRef.current = false
    setPayAvatarVisible(false); setPayWaveActive(false); setNotificationVisible(false); setFreezeRequest(false)
    currentPersonIndexRef.current = -1; setCurrentPersonIndex(0)
    setPhase("idle-green"); transitioning.current = false
    await sleep(500)

    if (!(await moveTo(".ap-nb-broadcast-icon"))) return
    await tap()
    handleActivate()
    await sleep(2600)
    if (!alive()) return

    // Freeze — surface Pink Owl
    currentPersonIndexRef.current = 0; setCurrentPersonIndex(0); setFreezeRequest(true)
    await sleep(900)
    if (!alive()) return

    // Click Pink Owl's avatar
    if (!(await moveTo('[data-ap-nb-avatar="Pink Owl Coffee"]'))) return
    await tap()
    selectAvatarRef.current?.()
    await sleep(900)
    if (!alive()) return

    // Type "4567"
    for (const d of ["4", "5", "6", "7"]) {
      if (!alive()) return
      if (!(await moveTo(`[data-ap-nb-digit="${d}"]`))) return
      await tap()
      setTypedDigits(prev => prev.length < MAX_DIGITS ? [...prev, Number(d)] : prev)
      await sleep(220)
    }
    if (!alive()) return

    // Tap Pay
    if (!(await moveTo(".ap-nb-pay"))) return
    await tap()
    setPaidDigits([4, 5, 6, 7])
    setPayPopoverVisible(true); setPayPopoverLoading(true); setPayPopoverContent(false)
    setTimeout(() => {
      setTypedDigits([]); setPayLoading(false); setLoaderFadingOut(false)
      setPayComplete(false); setTickVisible(false); setTickDismissed(false); payCompleteRef.current = false
      setFocusedAvatar(null); setAvatarAnimating(false); setBottomToggled(false); setActivated(false)
      setPayAvatarVisible(false); setPayWaveActive(false); setNotificationVisible(false)
      setPhase("idle-green")
    }, 1000)
    setTimeout(() => { setPayPopoverLoading(false); setTimeout(() => setPayPopoverContent(true), 300) }, 2000)

    await sleep(2500)
    if (!alive()) return

    if (!(await moveTo(".ap-nb-popover-done"))) return
    await tap()
    setPayPopoverVisible(false)
    await sleep(500)
    setPayPopoverLoading(true); setPayPopoverContent(false); transitioning.current = false
    await sleep(700)
  })

  useEffect(() => {
    if (!bottomToggled) {
      setPayAvatarVisible(false); setPayWaveActive(false); setNotificationVisible(false)
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current)
    }
  }, [bottomToggled])

  // Derived state
  const isAvatarFocus = phase === "avatar-focus"
  const isClosingFromFocus = phase === "closing-from-focus"
  const isExitingUI = phase === "exit-ui" || phase === "fade-to-white" || phase === "scanline-dots" || phase === "show-bottom" || phase === "idle-activated" || phase === "fade-out-dots" || isAvatarFocus
  const isWhiteBg = phase === "fade-to-white" || phase === "scanline-dots" || phase === "show-bottom" || phase === "idle-activated" || phase === "fade-out-dots" || (isAvatarFocus && !isClosingFromFocus)
  const isRestoringUI = phase === "restore-ui"
  const showDots = activated && !isClosingFromFocus
  const showChrome = phase === "scanline-dots" || phase === "show-bottom" || phase === "idle-activated" || isAvatarFocus
  const chaserEnabled = phase === "idle-activated"
  const dotsVisible = phase !== "fade-out-dots" && !isClosingFromFocus

  return (
    <div
      ref={outerRef}
      style={{
        position: 'relative',
        width: NEARBY_INNER_W * effectiveScale,
        height: NEARBY_INNER_H * effectiveScale,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
    <div
      style={{
        position: 'absolute', top: 0, left: 0,
        width: NEARBY_INNER_W, height: NEARBY_INNER_H,
        borderRadius: 48,
        overflow: 'hidden',
        transform: `scale(${effectiveScale})`,
        transformOrigin: 'top left',
      }}
    >
      <div
        ref={phoneRef}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: isWhiteBg ? "#000000" : "#01E014",
          transition: isClosingFromFocus
            ? "background-color 500ms ease-in-out"
            : isRestoringUI
              ? "background-color 400ms ease-in-out 200ms"
              : "background-color 1200ms ease-in-out",
        }}
      >
        {/* Status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 110 }}>
          <img src={statusBarImg} alt="" style={{
            width: '100%',
            filter: isWhiteBg ? 'invert(1)' : 'invert(0)',
            transition: isClosingFromFocus
              ? 'filter 500ms ease-in-out'
              : isRestoringUI
                ? 'filter 400ms ease-in-out 200ms'
                : 'filter 1200ms ease-in-out',
          }} draggable={false} />
        </div>

        {/* App bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, paddingTop: 54 }}>
          <img
            src={appBarImg} alt=""
            className="ap-nb-activate"
            style={{
              width: 390, height: 70, cursor: 'pointer',
              opacity: isExitingUI ? 0 : 1,
              transition: isClosingFromFocus ? "opacity 400ms ease-in-out 300ms" : isRestoringUI ? "opacity 350ms ease-in-out 200ms" : "opacity 300ms ease-out",
              pointerEvents: phase === "idle-green" ? "auto" : "none",
            }}
            draggable={false}
          />
          <div
            className="ap-nb-broadcast-icon"
            aria-hidden
            style={{ position: "absolute", top: 62, left: 54, width: 48, height: 48, pointerEvents: "none" }}
          />
        </div>

        {/* Keypad container */}
        {(() => {
          const onBlackScreen = isAvatarFocus && avatarAnimating && !resettingToScan
          const isWhite = onBlackScreen && !isClosingFromFocus
          let keypadTop = 130, keypadOpacity = 1
          if (resettingToScan) { keypadTop = 500; keypadOpacity = 0 }
          else if (onBlackScreen && !isClosingFromFocus) { keypadTop = 190 }
          else if (isClosingFromFocus) { keypadTop = 130 }
          else if (isExitingUI) { keypadTop = 280; keypadOpacity = 0 }
          if (isAvatarFocus && !resettingToScan && !avatarAnimating) { keypadTop = 390; keypadOpacity = 0 }

          const preAnimateAvatar = isAvatarFocus && !avatarAnimating
          const keypadTransition = preAnimateAvatar ? "none"
            : isClosingFromFocus ? "top 500ms ease-out 150ms, opacity 400ms ease-in-out, filter 500ms ease-in-out 150ms"
            : isRestoringUI ? "top 400ms ease-out 250ms, opacity 350ms ease-in-out 250ms, filter 400ms ease-in-out 200ms"
            : onBlackScreen ? "top 750ms cubic-bezier(0.25, 0.1, 0.25, 1) 250ms, opacity 600ms ease-out 250ms, filter 600ms ease-out 250ms"
            : "top 400ms ease-in-out 100ms, opacity 300ms ease-out 100ms, filter 300ms ease-in-out"

          return (
            <div
              style={{
                position: 'absolute', left: 0, right: 0, zIndex: 36,
                top: keypadTop, opacity: keypadOpacity,
                transition: keypadTransition,
                pointerEvents: onBlackScreen || phase === "idle-green" ? "auto" : "none",
                touchAction: phase === "idle-green" ? "none" : "auto",
              }}
            >
              {/* Dollar amount */}
              <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', top: -203, height: 560 - 130 + 142, gap: 16, pointerEvents: 'none' }}>
                <span style={{ fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 100, color: isWhite ? "#ffffff" : "#000000", lineHeight: 1, userSelect: 'none', opacity: payLoading ? 0.2 : 1, transition: "color 400ms ease-in-out, opacity 200ms ease-out", display: 'inline-flex' }}>
                  {!isAvatarFocus ? "$0" : typedDigits.length === 0 ? "₿0" : `₿${Number(typedDigits.join("")).toLocaleString("en-US")}`}
                </span>
                {isAvatarFocus && (() => {
                  const sats = typedDigits.length === 0 ? 0 : Number(typedDigits.join(""))
                  const usd = (sats * 75000) / 100000000
                  const usdStr = usd.toLocaleString("en-US", { style: "currency", currency: "USD" })
                  return (
                    <span style={{ fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: isWhite ? "#ffffff" : "#000000", lineHeight: 1, textAlign: 'center', userSelect: 'none', opacity: payLoading ? 0.2 : 1, transition: "color 400ms ease-in-out, opacity 200ms ease-out", display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {usdStr}
                      <img src={swapSvg} alt="" width={16} height={16} draggable={false} style={{ filter: "none", transition: "filter 400ms ease-in-out" }} />
                    </span>
                  )
                })()}
              </div>

              {/* Number grid */}
              <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', top: 203, pointerEvents: 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: "19px 48px", fontFamily: "'Cash Sans', sans-serif", fontWeight: 600, fontSize: 24, color: isWhite ? "#ffffff" : "#000000", opacity: payLoading ? 0.2 : 1, transition: "color 400ms ease-in-out, opacity 200ms ease-out", userSelect: 'none' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                    const col = (n - 1) % 3
                    const offsetX = col === 0 ? -26 : col === 2 ? 26 : 0
                    const canPress = isAvatarFocus && !payLoading && typedDigits.length < MAX_DIGITS
                    return (
                      <div key={n} data-ap-nb-digit={n} onClick={(e) => { if (!canPress) return; e.stopPropagation(); setTypedDigits((d) => [...d, n]) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, transform: `translateX(${offsetX}px)`, pointerEvents: canPress ? "auto" : "none", cursor: canPress ? "pointer" : "default" }}>
                        {n}
                      </div>
                    )
                  })}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, transform: "translateX(-26px)" }}>
                    <img src={decimalImg} alt="." width={24} height={24} draggable={false} style={{ filter: isWhite ? "none" : "invert(1)", transition: "filter 400ms ease-in-out" }} />
                  </div>
                  {(() => {
                    const canPress = isAvatarFocus && !payLoading && typedDigits.length > 0 && typedDigits.length < MAX_DIGITS
                    return (
                      <div data-ap-nb-digit={0} onClick={(e) => { if (!canPress) return; e.stopPropagation(); setTypedDigits((d) => [...d, 0]) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, pointerEvents: canPress ? "auto" : "none", cursor: canPress ? "pointer" : "default" }}>0</div>
                    )
                  })()}
                  <div onClick={(e) => { if (isAvatarFocus && typedDigits.length > 0 && !payLoading) { e.stopPropagation(); setTypedDigits((d) => d.slice(0, -1)) } }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, transform: "translateX(26px)", pointerEvents: isAvatarFocus && typedDigits.length > 0 && !payLoading ? "auto" : "none", cursor: isAvatarFocus && typedDigits.length > 0 && !payLoading ? "pointer" : "default" }}>
                    <img src={chevronLeftImg} alt="delete" width={24} height={24} draggable={false} style={{ filter: isWhite ? "none" : "invert(1)", transition: "filter 400ms ease-in-out" }} />
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', zIndex: 10, width: '100%', paddingBottom: '123%' }} />
            </div>
          )
        })()}

        {/* Green screen bottom bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          opacity: isExitingUI ? 0 : 1,
          transform: isExitingUI ? "translateY(50px)" : "translateY(0)",
          transition: isClosingFromFocus ? "transform 500ms ease-out 200ms, opacity 400ms ease-in-out 250ms"
            : isRestoringUI ? "transform 400ms ease-out 300ms, opacity 350ms ease-in-out 300ms"
            : "transform 400ms ease-in-out 200ms, opacity 300ms ease-out 150ms",
        }}>
          <img src={bottomBarImg} alt="" style={{ width: '100%' }} draggable={false} />
        </div>

        {/* Payment confirmation toast */}
        <img src={paymentConfirmationImg} alt="" style={{ position: 'absolute', zIndex: 50, width: 375, height: 72, left: '50%', transform: 'translateX(-50%)', top: showPaymentToast ? 60 : -80, opacity: showPaymentToast ? 1 : 0, transition: "top 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 450ms cubic-bezier(0.4, 0, 0.2, 1)", pointerEvents: 'none' }} draggable={false} />

        {/* Dots canvas */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: "translate(-50%, -50%)", width: 354, height: 530, paddingBottom: 4, zIndex: 35, opacity: showDots && dotsVisible && !isAvatarFocus ? 1 : 0, transition: isClosingFromFocus ? "opacity 0ms" : phase === "fade-out-dots" ? "opacity 300ms ease-out" : isAvatarFocus ? "opacity 300ms ease-out" : "opacity 200ms ease-in" }}>
          <ParticleField
            width={354} height={560} bgColor="#000000" particleColor="255, 255, 255"
            activated={activated} onFreezeRequest={freezeRequest} onFreezeComplete={handleFreezeComplete}
            avatarSrc={people[currentPersonIndex].avatarSrc} nameSrc="" personName={people[currentPersonIndex].name}
            broadcastMode={bottomToggled} chaserEnabled={chaserEnabled} onAvatarClick={handleAvatarClick}
            dispersing={isAvatarFocus} payWave={payWaveActive} clearAvatars={clearAvatars}
            selectAvatarRef={selectAvatarRef}
            nuxMode={false} nuxError={false} noBluetooth={false} hideName={false} colorMode={colorMode}
            nuxErrorImageUrl={nuxErrorImg} bluetoothIconUrl={bluetoothIconImg} avatarImageUrl={avatarImg}
          />
        </div>

        {/* Titles */}
        <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 30, display: 'flex', justifyContent: 'center', top: 60, pointerEvents: 'none' }}>
          <span style={{ position: 'absolute', textAlign: 'center', fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "#ffffff", width: 390, top: 13, opacity: chaserEnabled && !bottomToggled && !isAvatarFocus ? 1 : 0, transition: phase === "fade-out-dots" ? "opacity 250ms ease-out" : isAvatarFocus ? "opacity 400ms ease-out" : "opacity 350ms ease-in-out", pointerEvents: 'none' }}>
            Looking nearby
          </span>
          <span style={{ position: 'absolute', textAlign: 'center', fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "#ffffff", width: 390, top: 13, opacity: chaserEnabled && bottomToggled && !isAvatarFocus ? 1 : 0, transition: phase === "fade-out-dots" ? "opacity 250ms ease-out" : isAvatarFocus ? "opacity 400ms ease-out" : bottomToggled ? "opacity 400ms ease-in-out 2100ms" : "opacity 300ms ease-in-out", pointerEvents: 'none' }}>
            {"You're now visible"}
          </span>
        </div>

        {/* iOS-style payment notification */}
        <img src={paymentNotificationImg} alt="" style={{ position: 'absolute', zIndex: 50, left: '50%', width: 390, transform: 'translateX(-50%)', top: notificationVisible ? 70 : -90, opacity: notificationVisible ? 1 : 0, transition: "top 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms ease-in-out", pointerEvents: 'none' }} draggable={false} />

        {/* Close icon - top right */}
        <img src={closeIconImg} alt="" style={{ position: 'absolute', zIndex: 36, right: 16, top: 74, width: 24, height: 24, opacity: showChrome && !isAvatarFocus ? 1 : 0, transition: isAvatarFocus ? "opacity 400ms ease-out" : phase === "fade-out-dots" ? "opacity 250ms ease-out" : "opacity 350ms ease-in-out", pointerEvents: 'none' }} draggable={false} />

        {/* Gear icon - top left */}
        <img src={gearIconImg} alt=""
          style={{ position: 'absolute', zIndex: 40, cursor: 'pointer', left: 16, top: 74, width: 24, height: 24, opacity: isClosingFromFocus ? 0 : !showChrome ? 0 : payLoading ? 0.2 : 1, transition: isClosingFromFocus ? "opacity 250ms ease-out" : phase === "fade-out-dots" ? "opacity 250ms ease-out" : payLoading ? "opacity 200ms ease-out" : "opacity 350ms ease-in-out", pointerEvents: 'none' }}
          draggable={false}
        />

        {/* Focused avatar + name */}
        {focusedAvatar && (
          <div style={{ position: 'absolute', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', left: avatarAnimating ? 393 / 2 - 60 : focusedAvatar.x - 16 - 24, top: avatarAnimating ? 76 : focusedAvatar.y - 24, width: 120, opacity: isClosingFromFocus ? 0 : 1, transition: isClosingFromFocus ? "opacity 150ms ease-out" : avatarAnimating ? "left 700ms ease-in-out, top 700ms ease-in-out, opacity 250ms ease-out" : "none", pointerEvents: 'none' }}>
            <img src={focusedAvatar.avatarSrc} alt="" style={{ borderRadius: '50%', objectFit: 'cover', width: 48, height: 48 }} crossOrigin="anonymous" />
            <span style={{ fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "#ffffff", marginTop: 12, opacity: avatarAnimating ? 1 : 0, transition: "opacity 500ms ease-in-out 300ms", userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              {"Pay " + focusedAvatar.name}
            </span>
          </div>
        )}

        {/* Refresh icon */}
        <img src={avatarFocusIconImg} alt=""
          style={{ position: 'absolute', zIndex: 36, right: 16, top: 74, width: 24, height: 24, opacity: isClosingFromFocus ? 0 : !(isAvatarFocus && avatarAnimating) ? 0 : payLoading ? 0.2 : 1, transition: isClosingFromFocus ? "opacity 250ms ease-out" : payLoading ? "opacity 200ms ease-out" : isAvatarFocus ? "opacity 500ms ease-out 250ms" : "opacity 200ms ease-out", pointerEvents: 'none' }}
          draggable={false}
        />

        {/* Pay black bottom */}
        <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 36, width: '100%', bottom: isAvatarFocus && avatarAnimating && !isClosingFromFocus ? 0 : -120, opacity: isClosingFromFocus ? 0 : !(isAvatarFocus && avatarAnimating) ? 0 : 1, transition: isClosingFromFocus ? "bottom 400ms ease-in, opacity 300ms ease-out" : isAvatarFocus ? "bottom 600ms cubic-bezier(0.4, 0, 0.2, 1) 500ms, opacity 500ms ease-out 500ms" : "bottom 200ms ease-out, opacity 200ms ease-out", pointerEvents: 'none' }}>
          <img src={payBlackBottomInactiveImg} alt="" style={{ position: 'relative', zIndex: 10, width: '100%', opacity: payLoading ? 0.2 : 1, transition: "opacity 200ms ease-out" }} draggable={false} />
          {/* Pay pill - inactive */}
          <div style={{ position: 'absolute', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', top: 0, right: 16, width: 155, height: 52, borderRadius: 9999, backgroundColor: "rgba(255, 255, 255, 0.1)", fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "rgba(255, 255, 255, 0.5)", userSelect: 'none', opacity: keypadTapped ? 0 : 1, transition: "opacity 300ms ease-in-out" }}>Pay</div>
          {/* Pay pill - active */}
          <div className="ap-nb-pay"
            onClick={(e) => {
              if (keypadTapped && !payLoading) {
                e.stopPropagation()
                setPaidDigits(typedDigits)
                setPayPopoverVisible(true); setPayPopoverLoading(true); setPayPopoverContent(false)
                setTimeout(() => { setTypedDigits([]); setPayLoading(false); setLoaderFadingOut(false); setPayComplete(false); setTickVisible(false); setTickDismissed(false); payCompleteRef.current = false; setFocusedAvatar(null); setAvatarAnimating(false); setBottomToggled(false); setActivated(false); setPayAvatarVisible(false); setPayWaveActive(false); setNotificationVisible(false); setPhase("idle-green") }, 1000)
                setTimeout(() => { setPayPopoverLoading(false); setTimeout(() => setPayPopoverContent(true), 300) }, 2000)
              }
            }}
            style={{ position: 'absolute', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', top: 0, right: 16, width: 155, height: 52, borderRadius: 9999, backgroundColor: "#ffffff", fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "#000000", userSelect: 'none', opacity: keypadTapped ? 1 : 0, transition: "opacity 300ms ease-in-out", cursor: keypadTapped ? "pointer" : "default", pointerEvents: keypadTapped ? "auto" : "none" }}
          >
            {payComplete ? (
              <img src={tickImg} alt="done" width={24} height={24} style={{ opacity: tickVisible ? 1 : 0, transform: tickVisible ? "scale(1)" : "scale(0.5)", transition: "opacity 250ms ease-out, transform 250ms ease-out" }} />
            ) : payLoading ? (
              <div style={{ width: 32, height: 32, opacity: loaderFadingOut ? 0 : 1, transition: "opacity 250ms ease-out", color: '#000' }}>
                <CashSpinner size={32} />
              </div>
            ) : "Pay"}
          </div>
        </div>

        {/* Pay avatar */}
        <img src={payAvatarImg} alt="" style={{ position: 'absolute', zIndex: 36, top: 620, left: '50%', width: 256, height: 64, transform: `translateX(-50%) translateY(${payAvatarVisible ? "0px" : "30px"})`, opacity: payAvatarVisible ? 1 : 0, transition: "opacity 400ms ease-in-out, transform 400ms ease-in-out", pointerEvents: 'none' }} draggable={false} />

        {/* Bottom overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 30, width: '100%', cursor: 'pointer', opacity: showChrome && !isAvatarFocus ? 1 : 0, transform: isAvatarFocus ? "translateY(60px)" : "translateY(0)", transition: phase === "fade-out-dots" ? "opacity 250ms ease-out, transform 250ms ease-out" : isAvatarFocus ? "opacity 500ms ease-out, transform 600ms cubic-bezier(0.4, 0, 1, 1)" : "opacity 350ms ease-in-out, transform 350ms ease-in-out", pointerEvents: phase === "idle-activated" ? "auto" : "none" }}>
          <img src={payNewImg} alt="Pay" style={{ width: '100%', display: bottomToggled ? "none" : "block" }} draggable={false} />
          <img src={getPaidNewImg} alt="Get paid" style={{ width: '100%', display: bottomToggled ? "block" : "none" }} draggable={false} />
        </div>

        {/* Pay popover */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: "#000000", borderRadius: 48, transform: payPopoverVisible ? "translateY(0)" : "translateY(100%)", transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)", pointerEvents: payPopoverVisible ? "auto" : "none" }}>
          <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', top: 60, left: 0, width: 390, height: 52, opacity: payPopoverContent ? 1 : 0, transition: "opacity 400ms ease-out" }}>
            <img src={closeXImg} alt="Close" style={{ marginLeft: 16, width: 24, height: 24, cursor: 'pointer' }} onClick={() => { setPayPopoverVisible(false); setTimeout(() => { setPayPopoverLoading(true); setPayPopoverContent(false); transitioning.current = false }, 400) }} />
          </div>
          <img src={greenCheckImg} alt="" style={{ position: 'absolute', top: 132, left: 16, width: 64, height: 64, opacity: payPopoverContent ? 1 : 0, transform: payPopoverContent ? "scale(1)" : "scale(0.8)", transition: "opacity 400ms ease-out, transform 400ms ease-out" }} />
          <p style={{ position: 'absolute', top: 212, left: 16, right: 16, fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 32, lineHeight: '32px', color: "#ffffff", margin: 0, opacity: payPopoverContent ? 1 : 0, transform: payPopoverContent ? "translateY(0)" : "translateY(10px)", transition: "opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms" }}>
            {(() => { const sats = paidDigits.length === 0 ? 0 : Number(paidDigits.join("")); const btcStr = `₿${sats.toLocaleString("en-US")}`; const usd = (sats * 75000) / 100000000; const usdStr = usd.toLocaleString("en-US", { style: "currency", currency: "USD" }); return `You paid ${btcStr} (${usdStr}) to Pink Owl Coffee` })()}
          </p>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: payPopoverLoading ? 1 : 0, transition: "opacity 300ms ease-out", color: '#fff' }}>
            <CashSpinner size={56} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: '0 24px 48px' }}>
            <div style={{ opacity: payPopoverContent ? 1 : 0, transform: payPopoverContent ? "translateY(0)" : "translateY(20px)", transition: "opacity 400ms ease-out 100ms, transform 400ms ease-out 100ms", display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button style={{ width: '100%', height: 52, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 9999, fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "rgba(255,255,255,0.6)", border: 'none', cursor: 'pointer' }}>Receipt</button>
              <button className="ap-nb-popover-done" onClick={() => { setPayPopoverVisible(false); setTimeout(() => { setPayPopoverLoading(true); setPayPopoverContent(false); transitioning.current = false }, 400) }} style={{ width: '100%', height: 52, backgroundColor: "#ffffff", borderRadius: 9999, fontFamily: "'Cash Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "#000000", border: 'none', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>

        {autopilot.cursor}
      </div>
    </div>
    </div>
  )
}
