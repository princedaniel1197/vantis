'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PersonaKey, PersonaMeta } from '@/lib/lend-personas'
import { PERSONAS, STERLING_PROJECTS, BHARAT_PROJECTS } from '@/lib/lend-personas'
import { LEND_PROJECTS, type LendProject } from '@/lib/lend-portfolio'

interface LendContextType {
  persona: PersonaKey
  setPersona: (key: PersonaKey) => void
  personaMeta: PersonaMeta
  projects: LendProject[]
}

const LendContext = createContext<LendContextType>({
  persona: 'kaveri',
  setPersona: () => {},
  personaMeta: PERSONAS.kaveri,
  projects: LEND_PROJECTS,
})

export function LendContextProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaKey>('kaveri')

  const personaMeta = PERSONAS[persona]
  const projects =
    persona === 'kaveri'   ? LEND_PROJECTS
    : persona === 'sterling' ? STERLING_PROJECTS
    : BHARAT_PROJECTS

  return (
    <LendContext.Provider value={{ persona, setPersona: setPersonaState, personaMeta, projects }}>
      {children}
    </LendContext.Provider>
  )
}

export function useLendContext() {
  return useContext(LendContext)
}
