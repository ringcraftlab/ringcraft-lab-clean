import { type ReactElement } from 'react'

export interface BrandMarkProps {
  size?: number
  className?: string
}

export default function BrandMark({ size = 18, className }: BrandMarkProps): ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect
        x="5.5"
        y="3.5"
        width="13"
        height="17"
        rx="2"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M5.5 3.5v17" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
      <circle cx="4" cy="7.5" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="4" cy="12" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="4" cy="16.5" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path
        d="M8.5 8h7M8.5 11.5h5.5M8.5 15h7"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M14.5 15.5l4-4 1.4 1.4-4 4-1.8.4.4-1.8z"
        fill="currentColor"
        fillOpacity="0.85"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  )
}
