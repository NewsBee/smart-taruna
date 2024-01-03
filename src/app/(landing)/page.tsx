"use client"

import { HomeFeature, HomeHero, HomePopularCourse, HomeTestimonial } from '@/components/home'
import React from 'react'

export default function LandingPage() {
  return (
    <div>
      <HomeHero/>
      {/* <HomePopularCourse/> */}
      <HomeFeature/>
      <HomeTestimonial/>
    </div>
  )
}
