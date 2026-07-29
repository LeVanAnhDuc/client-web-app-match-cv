import { useWizardStore } from '#/stores'
import DocumentInputStep from '../../components/DocumentInputStep'

/** Wizard step 2 — CV input. Back returns to step 1, keeping jdDocId. */
const StepCV = () => {
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

export default StepCV
