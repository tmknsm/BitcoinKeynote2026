import { type ReactNode, type PointerEvent as ReactPointerEvent, useRef, useState, useEffect, useCallback } from 'react';
import './ASheet.css';

export interface ASheetProps {
  /** Whether the sheet is visible. */
  open: boolean;
  /** Called when the dimmer is tapped or the sheet is dragged to dismiss. */
  onClose?: () => void;
  /** Sheet title — renders a default page-title header. */
  title?: string;
  /** Custom header content — overrides title when provided. */
  header?: ReactNode;
  /** Fixed footer content (e.g., CTA button). */
  footer?: ReactNode;
  /** Scrollable body content. Height animates smoothly when content changes. */
  children: ReactNode;
  /** Sizing: 'hug' fits content, 'maximum' fills most of the screen. */
  detent?: 'hug' | 'maximum';
  /** Explicit sheet panel height in px. Overrides detent/auto-sizing. Animates between values. */
  height?: number;
  /** Disable auto-measuring. The sheet height is driven entirely by the content's own height/CSS. Transitions still animate. */
  manualHeight?: boolean;
  /** Optional CSS class on the sheet panel. */
  className?: string;
}

const DISMISS_THRESHOLD = 80;

export function ASheet({
  open,
  onClose,
  title,
  header,
  footer,
  children,
  detent = 'hug',
  height: explicitHeight,
  manualHeight = false,
  className,
}: ASheetProps) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState<number | null>(null);
  const canAnimate = useRef(false);
  const [animClass, setAnimClass] = useState(false);

  // Drag state
  const dragging = useRef(false);
  const dragStartY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Measure the full inner content (header + body + footer) as one unit
  // Skipped when manualHeight is true — the consumer controls sizing via CSS/inline styles
  useEffect(() => {
    if (manualHeight || !measureRef.current || detent !== 'hug') return;
    canAnimate.current = false;
    setAnimClass(false);

    const ro = new ResizeObserver(() => {
      if (!measureRef.current) return;
      const h = measureRef.current.getBoundingClientRect().height;
      setInnerHeight(h);
      if (!canAnimate.current) {
        canAnimate.current = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimClass(true));
        });
      }
    });
    ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [detent, visible, manualHeight]);

  // Open/close
  useEffect(() => {
    if (open) {
      setVisible(true);
      canAnimate.current = false;
      setAnimClass(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true));
      });
    } else if (visible) {
      setActive(false);
      const timer = setTimeout(() => {
        setVisible(false);
        setInnerHeight(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Drag handlers
  const onDragStart = useCallback((e: ReactPointerEvent) => {
    dragging.current = true;
    dragStartY.current = e.clientY;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onDragMove = useCallback((e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const dy = Math.max(0, e.clientY - dragStartY.current);
    setDragOffset(dy);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);

    if (dragOffset > DISMISS_THRESHOLD) {
      onClose?.();
    }
    setDragOffset(0);
  }, [dragOffset, onClose]);

  const handleDimmerClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!visible) return null;

  const isHug = detent === 'hug';

  const sheetClasses = [
    'a-sheet',
    isHug ? 'a-sheet--hug' : 'a-sheet--maximum',
    isDragging && 'a-sheet--dragging',
    className,
  ].filter(Boolean).join(' ');

  const innerClasses = [
    'a-sheet__inner',
    (animClass || manualHeight) && 'a-sheet__inner--animated',
  ].filter(Boolean).join(' ');

  const hasHeader = !!(title || header);

  const sheetStyle: React.CSSProperties = {};
  if (isDragging) sheetStyle.transform = `translateY(${dragOffset}px)`;
  if (explicitHeight != null) sheetStyle.height = explicitHeight;

  return (
    <div className={`a-sheet-wrapper${active ? ' a-sheet-wrapper--open' : ''}`}>
      <div className="a-sheet-dimmer" onClick={handleDimmerClick} />
      <div className={sheetClasses} style={Object.keys(sheetStyle).length ? sheetStyle : undefined} ref={sheetRef}>
        <div
          className="a-sheet__handle-frame"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div className="a-sheet__handle" />
        </div>
        <div
          className={innerClasses}
          style={isHug && !manualHeight && innerHeight !== null ? { height: innerHeight } : undefined}
        >
          <div ref={measureRef}>
            {hasHeader && (
              <div className="a-sheet__header">
                {header || (
                  <div className="a-sheet__header-default">
                    <h2 className="a-sheet__title">{title}</h2>
                  </div>
                )}
              </div>
            )}
            <div className="a-sheet__body">{children}</div>
            {footer && (
              <div className="a-sheet__footer">{footer}</div>
            )}
            <div className="a-sheet__safe-area" />
          </div>
        </div>
      </div>
    </div>
  );
}

ASheet.displayName = 'ASheet';
