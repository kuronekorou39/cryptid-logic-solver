// 地形アイコン
export function ForestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 12h3v8h10v-8h3L12 2zm0 3.5L16.5 11H14v7h-4v-7H7.5L12 5.5z" />
    </svg>
  )
}

export function DesertIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-1 0-2 1-2 2v4c-2 0-3 1-3 2v1c-2 0-3 1-3 3v8h16v-8c0-2-1-3-3-3v-1c0-1-1-2-3-2V4c0-1-1-2-2-2zm0 2c0 0 0 4 0 4h0c0 0 0-4 0-4zm-2 6h4v1h-4v-1zm-3 3h10v7H7v-7z" />
    </svg>
  )
}

export function SwampIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 18h16v2H4v-2zm0-4h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM6 10c0-2 1-4 3-5 1 2 3 3 5 3s4-1 5-3c2 1 3 3 3 5v2H4v-2h2z" />
    </svg>
  )
}

export function MountainIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4L2 20h20L12 4zm0 4l6 10H6l6-10z" />
    </svg>
  )
}

export function WaterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-4 4-6 7-6 10a6 6 0 0012 0c0-3-2-6-6-10zm0 14c-2.2 0-4-1.8-4-4 0-1.5.5-3 2-5l2-2.5 2 2.5c1.5 2 2 3.5 2 5 0 2.2-1.8 4-4 4z" />
    </svg>
  )
}

// 動物アイコン
export function BearIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9 2 6 4 6 7c-2 0-4 2-4 4s2 4 4 4v3c0 2 2 4 6 4s6-2 6-4v-3c2 0 4-2 4-4s-2-4-4-4c0-3-3-5-6-5zm-3 8a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2zm-3 3c1.5 0 2 1 2 1.5S13.5 16 12 16s-2-1-2-1.5.5-1.5 2-1.5z" />
    </svg>
  )
}

export function EagleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L8 6l-4-1 2 4-4 3h5l1 4 4-3 4 3 1-4h5l-4-3 2-4-4 1-4-4zm0 4l2 2-2 1.5L10 8l2-2zm-4 5l2 1-1 2-2-1 1-2zm8 0l1 2-2 1-1-2 2-1z" />
    </svg>
  )
}

export function AnimalIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.5 9.5a2 2 0 104 0 2 2 0 00-4 0zm11 0a2 2 0 104 0 2 2 0 00-4 0zM12 5a3 3 0 00-3 3v1H7v3c0 3 2.5 5 5 5s5-2 5-5V9h-2V8a3 3 0 00-3-3zm0 10c-1.5 0-3-1-3-3v-1h6v1c0 2-1.5 3-3 3z" />
    </svg>
  )
}

// 構造物アイコン - 緑の巨石
export function GreenStoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L6 8v12h12V8l-6-6zm0 3l4 4v9H8V9l4-4z" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  )
}

// 構造物アイコン - 青の巨石
export function BlueStoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L6 8v12h12V8l-6-6zm0 3l4 4v9H8V9l4-4z" />
      <path d="M10 12h4v5h-4z" />
    </svg>
  )
}

// 構造物アイコン - 白の廃墟
export function WhiteShackIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 3.5l5 4.5v7H7v-7l5-4.5z" />
      <path d="M10 14h4v4h-4z" />
    </svg>
  )
}

// 構造物アイコン - 黒の廃墟
export function BlackShackIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 3.5l5 4.5v7H7v-7l5-4.5z" />
      <path d="M9 13h2v2H9zm4 0h2v2h-2z" />
    </svg>
  )
}

export function StructureIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  )
}
