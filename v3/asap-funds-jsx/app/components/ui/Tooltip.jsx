'use client'

import { useState } from 'react'

export function Tooltip({ children, content }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && content && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap z-50">
          {content}
        </div>
      )}
    </div>
  )
}