import { create } from 'zustand'

export type WizardStep = 1 | 2 | 3 | 4

interface WizardState {
  step: WizardStep
  jdDocId: string | null
  cvDocId: string | null
  setStep: (step: WizardStep) => void
  setJdDocId: (id: string) => void
  setCvDocId: (id: string) => void
  goNext: () => void
  goBack: () => void
  reset: () => void
}

const initialState = {
  step: 1 as WizardStep,
  jdDocId: null as string | null,
  cvDocId: null as string | null,
}

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setJdDocId: (id) => set({ jdDocId: id }),
  setCvDocId: (id) => set({ cvDocId: id }),
  goNext: () => set((s) => ({ step: Math.min(4, s.step + 1) as WizardStep })),
  goBack: () => set((s) => ({ step: Math.max(1, s.step - 1) as WizardStep })),
  reset: () => set({ ...initialState }),
}))
