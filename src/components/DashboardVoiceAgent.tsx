'use client'

import { VoiceAgent } from './VoiceAgent'

interface DashboardVoiceAgentProps {
  plan: string
}

export function DashboardVoiceAgent({ plan }: DashboardVoiceAgentProps) {
  return (
    <VoiceAgent
      isVisitor={false}
      sessionUrl={null}
      userPlan={plan}
    />
  )
}
