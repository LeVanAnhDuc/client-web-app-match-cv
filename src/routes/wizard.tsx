import { createFileRoute } from '@tanstack/react-router'
import { WizardPage } from '#/features/wizard/WizardPage'

export const Route = createFileRoute('/wizard')({ component: WizardPage })
