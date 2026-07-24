import { DocumentInputStep } from './DocumentInputStep'
import { useWizardStore } from './store'

/** Wizard step 1 — Job Description input. No Back (first step). */
export function StepJD() {
  const setJdDocId = useWizardStore((s) => s.setJdDocId)
  const goNext = useWizardStore((s) => s.goNext)

  return (
    <DocumentInputStep
      kind="JD"
      onNext={(docId) => {
        setJdDocId(docId)
        goNext()
      }}
    />
  )
}
