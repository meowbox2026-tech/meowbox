import type { DashboardIconName } from './playerStatusData'

interface PlayerStatusIconProps {
  name: DashboardIconName
  size?: number
}

export function PlayerStatusIcon({ name, size = 18 }: PlayerStatusIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  }

  switch (name) {
    case 'activity':
      return <svg {...common}><path d="M3 12h3l2-7 4 14 2-7h7" /></svg>
    case 'alert':
      return <svg {...common}><path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>
    case 'download':
      return <svg {...common}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></svg>
    case 'filter':
      return <svg {...common}><path d="M4 5h16" /><path d="M7 12h10" /><path d="M10 19h4" /></svg>
    case 'layers':
      return <svg {...common}><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 17 8 4 8-4" /></svg>
    case 'refresh':
      return <svg {...common}><path d="M20 11a8 8 0 0 0-13.7-5.6L4 7.7" /><path d="M4 4v3.7h3.7" /><path d="M4 13a8 8 0 0 0 13.7 5.6l2.3-2.3" /><path d="M20 20v-3.7h-3.7" /></svg>
    case 'spark':
      return <svg {...common}><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" /></svg>
    case 'target':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" /></svg>
    case 'users':
      return <svg {...common}><circle cx="9" cy="9" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 6.5a3 3 0 0 1 0 5.9" /><path d="M17 15a5.5 5.5 0 0 1 3.5 5" /></svg>
  }
}
