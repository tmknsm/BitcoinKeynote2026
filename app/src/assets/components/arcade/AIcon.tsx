import { useEffect, useState, type CSSProperties } from 'react';
import './AIcon.css';

// Eagerly resolve all Arcade icon SVG URLs, keyed by "size/name"
const svgModules = import.meta.glob<string>(
  '/src/assets/icons/arcade/**/*.svg',
  { eager: true, query: '?url', import: 'default' },
);

const iconUrlMap = new Map<string, string>();
for (const [path, url] of Object.entries(svgModules)) {
  // path: /src/assets/icons/arcade/24/check.svg → "24/check"
  const parts = path.split('/');
  const sizeDir = parts[parts.length - 2]; // "16", "24", "32", "navigation"
  const name = parts[parts.length - 1].replace('.svg', '');
  iconUrlMap.set(`${sizeDir}/${name}`, url);
}

export type AIconSize = 16 | 24 | 32;

export interface AIconProps {
  /** Icon name without extension, e.g. "add", "check" */
  name: string;
  /** Icon set size: 16, 24 (default), or 32 */
  set?: AIconSize | 'navigation';
  /** Display size in px (defaults to the set size, or 24) */
  size?: number;
  /** Optional CSS class */
  className?: string;
  /** Optional inline styles — use `color` to tint */
  style?: CSSProperties;
}

export function AIcon({ name, set = 24, size, className, style }: AIconProps) {
  const displaySize = size ?? (set === 'navigation' ? 24 : set);
  const [svg, setSvg] = useState<string | null>(null);
  const url = iconUrlMap.get(`${set}/${name}`);

  useEffect(() => {
    if (!url) return;
    fetch(url)
      .then((r) => r.text())
      .then(setSvg);
  }, [url]);

  if (!url) {
    return <span className={`a-icon a-icon--missing ${className ?? ''}`} style={{ width: displaySize, height: displaySize, ...style }} />;
  }

  if (!svg) {
    return <span className={`a-icon ${className ?? ''}`} style={{ width: displaySize, height: displaySize, ...style }} />;
  }

  return (
    <span
      className={`a-icon ${className ?? ''}`}
      style={{ width: displaySize, height: displaySize, ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
