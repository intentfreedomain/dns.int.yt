import { ICONS } from './icons.js'

/**
 * Inline SVG icon. Replaces the Font Awesome CDN stylesheet + webfont that the
 * site used to load: no third-party request, no icon-font download, no
 * layout-shifting fallback, and icons inherit `currentColor`.
 */
export default function Icon({ name, size = 16, className = '', ...rest }) {
  const icon = ICONS[name]
  if (!icon) return null

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={icon.path} />
    </svg>
  )
}
