'use client'

import React from 'react'

interface AdBannerProps {
  className?: string
  align?: 'center' | 'left' | 'right'
}

export function AdBanner({ className = '', align = 'center' }: AdBannerProps) {
  const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left'

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
          Sponsored
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60 p-1.5 shadow-sm transition-all hover:border-border">
        <iframe
          src="https://ad-swap.web.app/frame.html?site=ezwb30EtErrO29y5MfOa&theme=dark"
          style={{ border: 0, width: '300px', height: '130px', maxWidth: '100%', display: 'block' }}
          loading="lazy"
          sandbox="allow-scripts allow-popups"
          title="Ad"
        />
      </div>
    </div>
  )
}
