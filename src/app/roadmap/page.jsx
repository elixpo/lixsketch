'use client'

import CanvasPageLayout from '@/components/landing/CanvasPageLayout'
import content from '@/content/pages/roadmap.md'

export default function RoadmapPage() {
  return (
    <CanvasPageLayout
      title="LixSketch Roadmap"
      description="What we've shipped, what we're building, and where we're headed. Built in public."
      icon="bx bx-map-alt"
      tags={['roadmap', 'changelog', 'future']}
      breadcrumbs={[
        { label: 'Roadmap' },
      ]}
      backHref="/"
      backLabel="Back to Home"
      content={content}
    />
  )
}
