import { useCallback, useRef, useEffect, type ReactNode } from 'react';
import './ADial.css';

export interface ADialProps {
  /** Value from 0 to 1. */
  value: number;
  /** Called with a new value (0–1) during drag. */
  onChange?: (value: number) => void;
  /** Called when the user starts dragging. */
  onDragStart?: () => void;
  /** Called when the user stops dragging. */
  onDragEnd?: () => void;
  /** Content rendered in the center of the dial. */
  children?: ReactNode;
  className?: string;
}

// ViewBox matches 327px CSS render so 1 SVG unit = 1 CSS pixel
const CENTER = 163.5;
const RADIUS = 147;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEWBOX = CENTER * 2;

// Gap layout mirrors cash-ios AllocationChart.CircularLayout
const HANDLE_SIZE = 24;
const ENDCAP = STROKE / 2;
const GAP_12_HALF = 14;
const GAP_POST_HANDLE = HANDLE_SIZE / 2 + ENDCAP + 10;
const TOTAL_SPACING = GAP_12_HALF * 2 + GAP_POST_HANDLE;
const MIN_VISUAL = 0.01; // 1% minimum so green arc is always visible
// Maximum green arc length — leaves the 12 o'clock gap intact
const MAX_GREEN = CIRCUMFERENCE - GAP_12_HALF * 2;
// Dead zone angle (degrees) on each side of 12 o'clock
const DEAD_ZONE = (GAP_12_HALF / CIRCUMFERENCE) * 360;

function clampValue(v: number) {
  return Math.max(0, Math.min(1, v));
}

function visualValue(v: number) {
  return Math.max(MIN_VISUAL, v);
}

function getHandlePosition(value: number) {
  const vis = visualValue(value);
  const greenLen = Math.min(vis * CIRCUMFERENCE, MAX_GREEN);
  const fraction = (GAP_12_HALF + greenLen) / CIRCUMFERENCE;
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

function getArcDash(value: number) {
  const vis = visualValue(value);
  const greenLen = Math.min(vis * CIRCUMFERENCE, MAX_GREEN);
  const grayLen = Math.max(0, CIRCUMFERENCE - greenLen - TOTAL_SPACING);
  return {
    green: {
      dasharray: `${greenLen} ${CIRCUMFERENCE - greenLen}`,
      dashoffset: -GAP_12_HALF,
    },
    gray: {
      dasharray: `${grayLen} ${CIRCUMFERENCE - grayLen}`,
      dashoffset: -(GAP_12_HALF + greenLen + GAP_POST_HANDLE),
    },
  };
}

export const ADial = ({
  value,
  onChange,
  onDragStart,
  onDragEnd,
  children,
  className,
}: ADialProps) => {
  const clamped = clampValue(value);
  const handle = getHandlePosition(clamped);
  const arcs = getArcDash(clamped);

  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const prevAngleRef = useRef(0);
  const dragValueRef = useRef(0);

  const angleFromPointer = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    const angle = angleFromPointer(e.clientX, e.clientY);
    prevAngleRef.current = angle ?? value * 360;
    dragValueRef.current = value;
    onDragStart?.();
  }, [angleFromPointer, value, onDragStart]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const angle = angleFromPointer(e.clientX, e.clientY);
    if (angle === null) return;
    // Snap in the dead zone near 12 o'clock
    const inDeadZone = angle < DEAD_ZONE || angle > 360 - DEAD_ZONE;
    if (inDeadZone) {
      dragValueRef.current = dragValueRef.current > 0.5 ? 1 : 0;
      prevAngleRef.current = angle;
      onChange?.(dragValueRef.current);
      return;
    }
    // Compute shortest-path delta to handle wraparound
    let delta = angle - prevAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    prevAngleRef.current = angle;
    dragValueRef.current = clampValue(dragValueRef.current + delta / 360);
    onChange?.(dragValueRef.current);
  }, [angleFromPointer, onChange]);

  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
    onDragEnd?.();
  }, [onDragEnd]);

  // Prevent scroll while dragging
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if (draggingRef.current) e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  const classes = ['a-dial', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <svg
        ref={svgRef}
        className="a-dial__svg"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      >
        <circle
          className="a-dial__remainder"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeDasharray={arcs.gray.dasharray}
          strokeDashoffset={arcs.gray.dashoffset}
        />
        <circle
          className="a-dial__fill"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          strokeDasharray={arcs.green.dasharray}
          strokeDashoffset={arcs.green.dashoffset}
        />
      </svg>

      <div
        className="a-dial__handle"
        style={{
          left: `${(handle.x / VIEWBOX) * 100}%`,
          top: `${(handle.y / VIEWBOX) * 100}%`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />

      {children && (
        <div className="a-dial__center">
          {children}
        </div>
      )}
    </div>
  );
};

ADial.displayName = 'ADial';
