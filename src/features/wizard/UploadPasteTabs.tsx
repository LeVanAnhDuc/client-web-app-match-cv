import { Input, Segmented, Upload } from 'antd'
import { UploadCloud } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import type { UploadFile, UploadProps } from 'antd'

const { Dragger } = Upload
const { TextArea } = Input

export type InputMode = 'upload' | 'paste'

interface UploadPasteTabsProps {
  mode: InputMode
  onModeChange: (mode: InputMode) => void
  file: File | null
  onFileChange: (file: File | null) => void
  pastedText: string
  onPastedTextChange: (text: string) => void
  maxSizeLabel: string
}

/** Upload/Paste segmented switcher — dropzone or textarea (mock §7 Input tabs). */
export function UploadPasteTabs({
  mode,
  onModeChange,
  file,
  onFileChange,
  pastedText,
  onPastedTextChange,
  maxSizeLabel,
}: UploadPasteTabsProps) {
  const { t } = useTranslation()

  const fileList: Array<UploadFile> = file
    ? [{ uid: file.name, name: file.name, status: 'done' }]
    : []

  const draggerProps: UploadProps = {
    accept: '.pdf,.docx',
    multiple: false,
    showUploadList: false,
    fileList,
    beforeUpload: (selected) => {
      onFileChange(selected)
      return false
    },
    onRemove: () => onFileChange(null),
  }

  return (
    <div className="mb-8">
      <Segmented
        value={mode}
        onChange={(value) => onModeChange(value as InputMode)}
        options={[
          { label: t('input.tab.upload'), value: 'upload' },
          { label: t('input.tab.paste'), value: 'paste' },
        ]}
        className="mb-8"
      />

      {mode === 'upload' ? (
        <Dragger {...draggerProps} className="mb-10 !border-dashed !rounded-2xl">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
              <UploadCloud size={28} />
            </div>
            <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              {file ? (
                file.name
              ) : (
                <Trans
                  i18nKey="dropzone.title"
                  components={{
                    highlight: <span className="text-blue-600 dark:text-indigo-400" />,
                  }}
                />
              )}
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              {t('dropzone.hint', { max: maxSizeLabel })}
            </p>
          </div>
        </Dragger>
      ) : (
        <TextArea
          value={pastedText}
          onChange={(e) => onPastedTextChange(e.target.value)}
          rows={8}
          placeholder={t('paste.placeholder')}
          className="mb-10 !rounded-2xl"
        />
      )}
    </div>
  )
}
