import { useState, useEffect, useRef, useCallback } from 'react'
import Lottie from 'lottie-react'
import { ATitleBarSub } from '../assets/components/arcade/ATitleBarSub'
import { ABottomNavigation } from '../assets/components/arcade/ABottomNavigation'
import { AButtonDefault } from '../assets/components/arcade/AButtonDefault'
import { AButtonDefaultGroup } from '../assets/components/arcade/AButtonDefaultGroup'
import { AButtonCTA } from '../assets/components/arcade/AButtonCTA'
import { AButtonCTAGroup } from '../assets/components/arcade/AButtonCTAGroup'
import { ACell } from '../assets/components/arcade/ACell'
import { AHeaderPage } from '../assets/components/arcade/AHeaderPage'
import { AListUnordered } from '../assets/components/arcade/AListUnordered'
import { ASheet } from '../assets/components/arcade/ASheet'
import { AIcon } from '../assets/components/arcade/AIcon'
import { useAutopilot } from '../assets/components/autopilot'
import { nina, zach, jeremy, isabel } from '../assets/images/avatars'
import statusBarImg from '../assets/images/status-bar.png'
import loaderDark from './assets/loader-dark.json'
import './send-bitcoin-cashtag-page.css'

/* ── Helpers ── */

function Chart() {
  return (
    <div className="send-btc-chart">
      <svg viewBox="0 0 386 136" fill="none" preserveAspectRatio="none">
        <polyline
          points="4,120 20,118 36,115 52,116 68,110 84,108 100,112 116,106 132,100 148,98 164,95 180,88 196,82 212,78 228,72 244,68 260,62 276,55 292,50 308,48 324,44 340,36 356,30 372,22 386,16"
          stroke="var(--arcade-data-trend-positive)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

function FilterBar() {
  const [active, setActive] = useState(0)
  const labels = ['1D', '1W', '1M', '1Y', 'ALL']
  return (
    <div className="send-btc-filters">
      <div className="send-btc-filters__bar">
        {labels.map((label, i) => (
          <button
            key={label}
            className={`send-btc-filters__chip${i === active ? ' send-btc-filters__chip--active' : ''}`}
            onClick={() => setActive(i)}
          >{label}</button>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ title, body }) {
  return (
    <div className="send-btc-section-header">
      <h3 className="send-btc-section-header__title">{title}</h3>
      {body && <p className="send-btc-section-header__body">{body}</p>}
    </div>
  )
}

function CellAvatar({ icon }) {
  return (
    <div className="send-btc-cell-avatar">
      <AIcon name={icon} set={24} />
    </div>
  )
}

function GreenAvatar({ icon }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--arcade-bg-brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--arcade-icon-inverse)',
    }}>
      <AIcon name={icon} set={32} />
    </div>
  )
}

const push = <AIcon name="push" set={24} />

/* ── Flow types ── */

const CONTACTS = [
  { name: 'Nina Thompson', short: 'Nina T.', cashtag: '$nina', image: nina },
  { name: 'Zach Taylor', short: 'Zach T.', cashtag: '$zachattack', image: zach },
  { name: 'Jeremy Reyes', short: 'Jeremy R.', cashtag: '$jerbear', image: jeremy },
  { name: 'Isabel Collins', short: 'Isabel C.', cashtag: '$izzybb', image: isabel },
]

const BTC_PRICE = 73458.87
const SATS_PER_BTC = 100_000_000
const MAX_DIGITS = 7

function satsToUsd(sats) { return (sats * BTC_PRICE) / SATS_PER_BTC }
function formatUsd(usdValue) { return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }
function formatSats(sats) { return '\u20BF' + sats.toLocaleString() }

/* ── Main ── */

export default function SendBitcoinCashtag() {
  const phoneRef = useRef(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [step, setStep] = useState('send-receive')
  const [digits, setDigits] = useState([])
  const [contact, setContact] = useState(null)

  const sats = Number(digits.join('')) || 0
  const usdValue = satsToUsd(sats)
  const usd = formatUsd(usdValue)
  const btc = formatSats(sats)
  const amountLabel = `Send ${usd} (${btc})`

  useEffect(() => {
    if (step === 'confirm-loading') { const t = setTimeout(() => setStep('confirm'), 1200); return () => clearTimeout(t) }
    if (step === 'send-loading') { const t = setTimeout(() => setStep('success'), 1200); return () => clearTimeout(t) }
  }, [step])

  const openSheet = useCallback(() => {
    setStep('send-receive'); setDigits([]); setContact(null); setSheetOpen(true)
  }, [])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
    setTimeout(() => { setStep('send-receive'); setDigits([]); setContact(null) }, 400)
  }, [])

  const tapKey = useCallback((k) => {
    if (k === '<') setDigits(d => d.slice(0, -1))
    else if (digits.length < MAX_DIGITS) setDigits(d => [...d, Number(k)])
  }, [digits.length])

  const selectContact = useCallback((c) => { setContact(c); setStep('for') }, [])

  const back = useCallback(() => {
    if (step === 'send-receive') closeSheet()
    else if (step === 'keypad') setStep('send-receive')
    else if (step === 'to') setStep('keypad')
    else if (step === 'for') setStep('to')
    else if (step === 'confirm') setStep('for')
  }, [step, closeSheet])

  // ── Autopilot ──
  const autopilot = useAutopilot(phoneRef, async ({ alive, sleep, moveTo, tap }) => {
    setSheetOpen(false); setStep('send-receive'); setDigits([]); setContact(null)
    await sleep(500)

    if (!(await moveTo('.ap-open-sheet'))) return
    await tap(); setSheetOpen(true); await sleep(650)

    if (!(await moveTo('.ap-send-cta'))) return
    await tap(); setStep('keypad'); await sleep(500)

    for (const d of ['1', '2', '3', '4']) {
      if (!alive()) return
      if (!(await moveTo(`[data-ap-key="${d}"]`))) return
      await tap(); setDigits(prev => [...prev, Number(d)]); await sleep(200)
    }

    if (!(await moveTo('.ap-next'))) return
    await tap(); setStep('to'); await sleep(500)

    if (!(await moveTo('.ap-contact-nina'))) return
    await tap(); setContact(CONTACTS[0]); setStep('for'); await sleep(500)

    if (!(await moveTo('.ap-pay'))) return
    await tap(); setStep('confirm-loading'); await sleep(1500)

    if (!(await moveTo('.ap-confirm'))) return
    await tap(); setStep('send-loading'); await sleep(1500)

    await sleep(800)
    if (!(await moveTo('.ap-done'))) return
    await tap(); setSheetOpen(false); await sleep(500)
    setStep('send-receive'); setDigits([]); setContact(null); await sleep(800)
  }, { initial: true })

  /* ── Sheet header ── */
  const header = (() => {
    if (step === 'send-receive') return undefined
    if (step === 'keypad') {
      return (
        <ATitleBarSub
          type="parent"
          onNavigationPress={closeSheet}
          actions={[<AIcon key="qr" name="scan-qr" set="navigation" />]}
        />
      )
    }
    if (step === 'to') {
      return (
        <div>
          <ATitleBarSub type="child" onNavigationPress={back} />
          <div style={{ padding: '8px 16px 0' }}>
            <h2 className="arcade-type-display-page-title" style={{ margin: 0, color: 'var(--arcade-text-standard)' }}>
              {amountLabel} <span style={{ color: 'var(--arcade-text-subtle)' }}>to</span>
            </h2>
          </div>
        </div>
      )
    }
    if (step === 'for' && contact) {
      return (
        <div>
          <ATitleBarSub type="child" onNavigationPress={back} />
          <div style={{ padding: '8px 16px 0' }}>
            <h2 className="arcade-type-display-page-title" style={{ margin: 0, color: 'var(--arcade-text-standard)' }}>
              {amountLabel} <span style={{ color: 'var(--arcade-text-subtle)' }}>to</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <img src={contact.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <span className="arcade-type-display-page-title" style={{ color: 'var(--arcade-text-standard)' }}>{contact.short}</span>
              <span className="arcade-type-display-page-title" style={{ color: 'var(--arcade-text-subtle)' }}>for</span>
            </div>
            <p className="arcade-type-display-page-title" style={{ margin: '4px 0 0', color: 'var(--arcade-text-standard)' }}>Bitcoin payment</p>
          </div>
        </div>
      )
    }
    if (step === 'confirm') return <ATitleBarSub type="child" onNavigationPress={back} />
    if (step === 'success') return <ATitleBarSub type="child" onNavigationPress={closeSheet} />
    return undefined
  })()

  /* ── Sheet footer ── */
  const footer = (() => {
    if (step === 'send-receive') {
      return (
        <AButtonCTAGroup orientation="horizontal">
          <AButtonCTA className="ap-send-cta" onClick={() => setStep('keypad')}>Send</AButtonCTA>
          <AButtonCTA onClick={() => {}}>Receive</AButtonCTA>
        </AButtonCTAGroup>
      )
    }
    if (step === 'keypad') {
      return (
        <AButtonCTAGroup>
          <AButtonCTA className="ap-next" onClick={() => setStep('to')} disabled={sats === 0}>Next</AButtonCTA>
        </AButtonCTAGroup>
      )
    }
    if (step === 'for') {
      return (
        <AButtonCTAGroup
          disclaimer={
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--arcade-bg-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AIcon name="currency-btc" set={16} style={{ color: 'var(--arcade-icon-inverse)' }} />
                </div>
                <span className="arcade-type-body-label-md" style={{ color: 'var(--arcade-text-standard)' }}>Bitcoin balance</span>
                <span className="arcade-type-body-md" style={{ color: 'var(--arcade-text-subtle)' }}>$2,392.59</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--arcade-text-subtle)', margin: '24px 0 0', textAlign: 'center' }}>
                Payments can{'\u2019'}t be canceled once they{'\u2019'}re sent.
              </p>
            </>
          }
        >
          <AButtonCTA className="ap-pay" onClick={() => setStep('confirm-loading')}>Pay</AButtonCTA>
        </AButtonCTAGroup>
      )
    }
    if (step === 'confirm') {
      return (
        <AButtonCTAGroup
          disclaimer={
            <p style={{ fontSize: 12, color: 'var(--arcade-text-subtle)', margin: 0, textAlign: 'center' }}>
              All bitcoin transfers are final. <span style={{ color: 'var(--arcade-text-standard)', textDecoration: 'underline' }}>See disclosures</span>
            </p>
          }
        >
          <AButtonCTA className="ap-confirm" onClick={() => setStep('send-loading')}>Confirm and send</AButtonCTA>
        </AButtonCTAGroup>
      )
    }
    if (step === 'success') {
      return (
        <AButtonCTAGroup>
          <AButtonCTA className="ap-done" onClick={closeSheet}>Done</AButtonCTA>
        </AButtonCTAGroup>
      )
    }
    return undefined
  })()

  const SHEET_H = {
    'send-receive': 246, 'keypad': 780, 'to': 620, 'for': 620,
    'confirm-loading': 780, 'confirm': 780, 'send-loading': 780, 'success': 780,
  }

  const body = (() => {
    if (step === 'send-receive') {
      return (
        <div style={{ padding: '0 16px 8px' }}>
          <p style={{ fontSize: 16, color: 'var(--arcade-text-subtle)', margin: '0 0 24px' }}>Transact with any bitcoin wallet</p>
        </div>
      )
    }
    if (step === 'keypad') {
      return (
        <div className="send-btc-keypad-body">
          <div className="send-btc-keypad__amount">
            <span className="send-btc-keypad__btc">{sats > 0 ? btc : '\u20BF0'}</span>
            <span className="send-btc-keypad__usd">{sats > 0 ? `${usd} USD` : '$0.00 USD'} {'\u21C5'}</span>
          </div>
          <div className="send-btc-keypad__grid">
            {['1','2','3','4','5','6','7','8','9','.','0','<'].map(k => (
              <button key={k} className="send-btc-keypad__key" data-ap-key={k} onClick={() => k !== '.' ? tapKey(k) : undefined}>
                {k === '.' ? <span className="send-btc-keypad__dot" /> : k === '<' ? <AIcon name="back-centered" set={24} /> : k}
              </button>
            ))}
          </div>
        </div>
      )
    }
    if (step === 'to') {
      return (
        <div>
          <div style={{ padding: '24px 16px 12px' }}>
            <div className="send-btc-search">
              <AIcon name="search" set={24} style={{ color: 'var(--arcade-icon-extra-subtle)' }} />
              <span style={{ color: 'var(--arcade-text-subtle)', fontSize: 16 }}>BTC address, Lightning invoice, $cashtag</span>
            </div>
          </div>
          {CONTACTS.slice(0, 2).map(c => (
            <ACell
              key={c.cashtag}
              className={c.cashtag === '$nina' ? 'ap-contact-nina' : undefined}
              image={c.image}
              label={c.name}
              body={c.cashtag}
              accessory={push}
              onClick={() => selectContact(c)}
            />
          ))}
          <div style={{ height: 24 }} />
          <SectionHeader title="Contacts" />
          {CONTACTS.slice(2).map(c => (
            <ACell
              key={c.cashtag}
              image={c.image}
              label={c.name}
              body={c.cashtag}
              accessory={push}
              onClick={() => selectContact(c)}
            />
          ))}
        </div>
      )
    }
    if (step === 'for') return <div />
    if (step === 'confirm-loading' || step === 'send-loading') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Lottie animationData={loaderDark} loop style={{ width: 56, height: 56 }} />
        </div>
      )
    }
    if (step === 'confirm' && contact) {
      return (
        <div style={{ paddingTop: 16 }}>
          <AHeaderPage avatar={<GreenAvatar icon="currency-btc" />} header={`${amountLabel} to ${contact.short}`} />
          <div style={{ height: 24 }} />
          <AListUnordered items={[
            { label: 'To', value: contact.name },
            { label: 'Amount', value: btc },
            { label: 'USD equivalent', value: usd },
            { label: 'Arrives', value: 'Instant' },
          ]} />
          <div style={{ height: 24 }} />
          <AListUnordered items={[
            { label: 'Fees', value: '$0.00' },
            { label: 'Total', value: `${usd} (${btc})` },
          ]} />
        </div>
      )
    }
    if (step === 'success' && contact) {
      return (
        <div style={{ paddingTop: 16 }}>
          <AHeaderPage avatar={<GreenAvatar icon="check" />} header={`You sent ${usd} (${btc}) to ${contact.short}`} />
        </div>
      )
    }
    return null
  })()

  return (
    <div style={{
      position: 'relative', width: 390, height: 844,
      borderRadius: 48, overflow: 'hidden',
      transform: 'scale(0.75)', transformOrigin: 'center', flexShrink: 0,
    }}>
      <div ref={phoneRef} className="send-btc-proto dark force-dark">
        <div className="send-btc-scroll">
          <div className="send-btc-sticky-header">
            <div className="send-btc-status-bar" />
            <div style={{ height: 16 }} />
            <ATitleBarSub
              type="child"
              actions={[
                <AIcon key="map" name="map" set={24} />,
                <AIcon key="qr" name="scan-qr" set="navigation" />,
              ]}
            />
          </div>

          <div className="send-btc-spacer-32" />
          <div className="send-btc-hero">
            <p className="send-btc-hero__section-title">Bitcoin</p>
            <h1 className="send-btc-hero__numeral">$2,392.59</h1>
            <div className="send-btc-hero__body">
              <span className="send-btc-hero__body-text">{'\u20BF'}3,174,712</span>
              <AIcon name="transfer-p2p" set={16} />
            </div>
          </div>
          <div className="send-btc-spacer-32" />
          <div className="send-btc-price">
            <div className="send-btc-price__row">
              <AIcon name="ticker-up" set={16} />
              <span className="send-btc-price__label">3.07% today</span>
            </div>
            <span className="send-btc-price__usd">$73,458.87 USD</span>
          </div>
          <div className="send-btc-spacer-48" />
          <Chart />
          <div className="send-btc-spacer-48" />
          <FilterBar />
          <div className="send-btc-spacer-32" />
          <div className="send-btc-buttons">
            <AButtonDefaultGroup orientation="horizontal">
              <AButtonDefault prominence="prominent">Buy</AButtonDefault>
              <AButtonDefault prominence="prominent">Sell</AButtonDefault>
              <AButtonDefault className="ap-open-sheet" prominence="prominent" icon={<AIcon name="transfer-p2p" set={24} />} onClick={openSheet} />
            </AButtonDefaultGroup>
          </div>
          <div className="send-btc-divider" />
          <SectionHeader title="Grow bitcoin over time" body="You have stacked $10.32 this month" />
          <div style={{ height: 8 }} />
          <ACell asset={<CellAvatar icon="round-ups" />} label="Bitcoin Round Ups" body="2 for $.05 total" accessory={push} />
          <ACell asset={<CellAvatar icon="recurring-automatic" />} label="Auto Invest" body="$10 weekly on Friday" accessory={push} />
          <ACell asset={<CellAvatar icon="deposit" />} label="Paid in bitcoin" body="Invest your direct deposits" accessory={push} />
          <div className="send-btc-divider" />
          <SectionHeader title="Ways to use bitcoin" />
          <div style={{ height: 8 }} />
          <ACell asset={<CellAvatar icon="location" />} label="Pay with bitcoin" body="Find nearby businesses that accept bitcoin" accessory={push} />
          <ACell asset={<CellAvatar icon="wallet" />} label="Deposit bitcoin" body="Get your bitcoin address" accessory={push} />
          <div className="send-btc-divider" />
          <SectionHeader title="Settings" />
          <div style={{ height: 8 }} />
          <ACell
            label="Display currency"
            accessory={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="arcade-type-body-md" style={{ color: 'var(--arcade-text-standard)' }}>BTC</span>
                <AIcon name="push" set={24} />
              </div>
            }
          />
          <ACell label="Price alerts" accessory={push} />
          <div className="send-btc-divider" />
          <div style={{ padding: '0 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--arcade-text-subtle)', margin: 0 }}>
              Bitcoin services by Block, Inc. See{' '}
              <span style={{ color: 'var(--arcade-text-standard)', textDecoration: 'underline', fontWeight: 500 }}>disclosures</span>.
            </p>
          </div>
          <div className="send-btc-spacer-32" />
          <div className="send-btc-nav-spacer" />
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <ABottomNavigation activeTab="money" />
        </div>

        <ASheet
          open={sheetOpen}
          onClose={closeSheet}
          className="send-btc-flow-sheet"
          height={SHEET_H[step]}
          title={step === 'send-receive' ? 'Send or receive' : undefined}
          header={step !== 'send-receive' ? header : undefined}
          footer={footer}
        >
          {body}
        </ASheet>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 110 }}>
          <img src={statusBarImg} alt="" style={{ width: '100%', filter: 'invert(1)' }} draggable={false} />
        </div>

        {autopilot.cursor}
      </div>
    </div>
  )
}
