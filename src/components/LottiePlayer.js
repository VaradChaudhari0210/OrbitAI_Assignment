"use client"

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function LottiePlayer() {
  return (
    <DotLottieReact
      src="/logo.lottie"
      loop
      autoplay
      style={{ width: '100%', height: '100%' }}
    />
  )
}
