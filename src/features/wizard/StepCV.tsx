import { DocumentInputStep } from './DocumentInputStep'
import { useWizardStore } from './store'

/** Wizard step 2 — CV input. Back returns to step 1, keeping jdDocId. */
export function StepCV() {
  const setCvDocId = useWizardStore((s) => s.setCvDocId)
  const goNext = useWizardStore((s) => s.goNext)
  const goBack = useWizardStore((s) => s.goBack)

  return (
    <DocumentInputStep
      kind="CV"
      onBack={goBack}
      onNext={(docId) => {
        setCvDocId(docId)
        goNext()
      }}
    />
  )
}
