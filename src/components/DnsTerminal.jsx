import { useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE, NAMESERVERS } from '../data/site.js'
import { RECORDS_RESPONSE_SAMPLE } from '../data/api.js'

const TYPE_SPEED = 22
const LEAD_IN = 400
const HOLD_MS = 9000

/**
 * The sequence is a fixed list; render position is derived from two counters
 * rather than accumulated into state. That removes the per-character
 * `prev.map()` over a growing array and the random keys that made React
 * unmount and rebuild every line on each tick.
 */
const SEQUENCE = [
  { kind: 'cmd', text: `dig +short ${RECORDS_RESPONSE_SAMPLE.domain} A @${NAMESERVERS[0]}` },
  { kind: 'out', text: ';; apex ALIAS → project.onrender.com.', delay: 420 },
  { kind: 'out', text: '76.76.21.21', delay: 260, tone: 'accent' },
  { kind: 'out', text: `;; ANSWER from ${NAMESERVERS[0]} in 8ms`, delay: 120, tone: 'dim' },
  { kind: 'gap' },
  {
    kind: 'cmd',
    text: `curl ${API_BASE}/domains/$ID/records \\\n    -H "Authorization: Bearer $KEY"`,
  },
  {
    kind: 'json',
    delay: 260,
    lines: [
      '{',
      `  "domain": "${RECORDS_RESPONSE_SAMPLE.domain}",`,
      `  "records": ${RECORDS_RESPONSE_SAMPLE.records},`,
      `  "limit": ${RECORDS_RESPONSE_SAMPLE.limit},`,
      `  "status": "${RECORDS_RESPONSE_SAMPLE.status}",`,
      `  "nameservers": [${NAMESERVERS.map((n) => `"${n}"`).join(', ')}]`,
      '}',
    ],
  },
]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/** How many units of a step are revealed: characters for text, lines for JSON. */
const fullCount = (step) => (step.kind === 'json' ? step.lines.length : (step.text?.length ?? 0))

/** Everything up to `index`, plus a partially revealed version of `index`. */
function buildLines(index, typed) {
  const lines = []
  for (let i = 0; i < index && i < SEQUENCE.length; i++) {
    lines.push({ key: `s${i}`, step: SEQUENCE[i], count: fullCount(SEQUENCE[i]) })
  }
  if (index < SEQUENCE.length) {
    lines.push({ key: `s${index}`, step: SEQUENCE[index], count: typed })
  }
  return lines
}

export default function DnsTerminal() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(0)
  const [run, setRun] = useState(0)
  const [inView, setInView] = useState(false)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const ref = useRef(null)

  // Do not animate while off-screen or in a background tab: this loop never
  // stops on its own, so without the gate it burns a rAF-equivalent every
  // 22ms for the entire time the visitor is on another tab.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || document.hidden) return
    if (reduced) {
      // One render of the finished output, no typing, no replay.
      setIndex(SEQUENCE.length)
      setTyped(0)
      return
    }

    let cancelled = false
    setIndex(0)
    setTyped(0)

    async function play() {
      await sleep(LEAD_IN)
      if (cancelled) return

      for (let i = 0; i < SEQUENCE.length; i++) {
        if (cancelled) return
        const step = SEQUENCE[i]
        setIndex(i)

        if (step.kind === 'cmd') {
          setTyped(0)
          for (let c = 1; c <= step.text.length; c++) {
            if (cancelled) return
            setTyped(c)
            await sleep(TYPE_SPEED)
          }
          await sleep(280)
          setIndex(i + 1)
          continue
        }

        if (step.kind === 'json') {
          setTyped(0)
          for (let c = 1; c <= step.lines.length; c++) {
            if (cancelled) return
            setTyped(c)
            await sleep(70)
          }
          await sleep(200)
          setIndex(i + 1)
          continue
        }

        await sleep(step.delay ?? 0)
        if (cancelled) return
        setIndex(i + 1)
      }

      await sleep(HOLD_MS)
      if (!cancelled) setRun((n) => n + 1)
    }

    play()
    return () => {
      cancelled = true
    }
  }, [run, inView, reduced])

  useEffect(() => {
    const onVisible = () => setRun((n) => n + 1)
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const lines = buildLines(index, typed)

  return (
    <div className="terminal" ref={ref} role="img" aria-label={LABEL}>
      <div className="terminal__bar" aria-hidden="true">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--gold" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">zsh — {NAMESERVERS[0]}</span>
      </div>

      <div className="terminal__body" aria-hidden="true">
        {lines.map(({ key, step, count }) => (
          <div key={key} className={`terminal__line terminal__line--${step.kind}`}>
            {step.kind === 'cmd' && (
              <>
                <span className="terminal__prompt">$</span> {step.text.slice(0, count)}
              </>
            )}
            {step.kind === 'out' && (
              <span className={step.tone ? `terminal__line--${step.tone}` : undefined}>
                {step.text}
              </span>
            )}
            {step.kind === 'json' &&
              step.lines.slice(0, count).map((line) => (
                <span key={line} className="terminal__json">
                  {line}
                </span>
              ))}
            {step.kind === 'gap' && <>&nbsp;</>}
          </div>
        ))}
        <span className="terminal__cursor" />
      </div>
    </div>
  )
}

const LABEL = `Terminal demonstration: a dig query resolving an apex ALIAS record to an IPv4 address in 8 milliseconds, followed by a REST API request returning a zone with 847 of 1,000 records used.`
