import { createFileRoute } from '@tanstack/react-router'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import '../i18n'

export function HomeComponent() {
  const { t } = useTranslation()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">{t('appName')}</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <Button type="primary" className="mt-4">
        {t('start')}
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/')({ component: HomeComponent })
