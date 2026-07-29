import { Input, Segmented, Upload } from "antd";
import { UploadCloud } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import type { UploadFile, UploadProps } from "antd";
import type { InputMode } from "#/types/Wizard";

const { Dragger } = Upload;
const { TextArea } = Input;

/** Upload/Paste segmented switcher — dropzone or textarea (mock §7 Input tabs). */
const UploadPasteTabs = ({
  mode,
  onModeChange,
  file,
  onFileChange,
  pastedText,
  onPastedTextChange,
  maxSizeLabel
}: {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  maxSizeLabel: string;
}) => {
  const { t } = useTranslation();

  const fileList: Array<UploadFile> = file
    ? [{ uid: file.name, name: file.name, status: "done" }]
    : [];

  const draggerProps: UploadProps = {
    accept: ".pdf,.docx",
    multiple: false,
    showUploadList: false,
    fileList,
    beforeUpload: (selected) => {
      onFileChange(selected);
      return false;
    },
    onRemove: () => onFileChange(null)
  };

  return (
    <div className="mb-8">
      <Segmented
        value={mode}
        onChange={(value) => onModeChange(value as InputMode)}
        options={[
          { label: t("input.tab.upload"), value: "upload" },
          { label: t("input.tab.paste"), value: "paste" }
        ]}
        className="mb-8"
      />

      {mode === "upload" ? (
        <Dragger {...draggerProps} className="mb-10 !rounded-xl !border-dashed">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-900 dark:text-indigo-400">
              <UploadCloud size={28} />
            </div>
            <p className="mb-1 text-lg font-medium text-slate-900 dark:text-white">
              {file ? (
                file.name
              ) : (
                <Trans
                  i18nKey="dropzone.title"
                  components={{
                    highlight: (
                      <span className="text-blue-600 dark:text-indigo-400" />
                    )
                  }}
                />
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {t("dropzone.hint", { max: maxSizeLabel })}
            </p>
          </div>
        </Dragger>
      ) : (
        <TextArea
          value={pastedText}
          onChange={(e) => onPastedTextChange(e.target.value)}
          rows={8}
          placeholder={t("paste.placeholder")}
          className="mb-10 !rounded-xl"
        />
      )}
    </div>
  );
};

export default UploadPasteTabs;
