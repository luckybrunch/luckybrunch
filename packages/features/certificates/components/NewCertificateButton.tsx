import { useState } from "react";
import { FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  TextField,
  Form,
  Label,
  Select,
  TextArea,
} from "@calcom/ui";
import { FiAlertTriangle, FiPlus } from "@calcom/ui/components/icon";

export function NewCertificateButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File[] | null>(null);

  const documentTypeOptions = [
    { value: "JPG", label: "JPG" },
    { value: "PDF", label: "PDF" },
    { value: "PNG", label: "PNG" },
  ];

  type FormValues = {
    certificate_name: string;
    document_type: string;
    description: string;
  };

  const defaultValues = {
    certificate_name: "",
    document_type: "",
    description: "",
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;

  // FILE UPLOAD ⬇ ️

  // WHAT IS THE useFileReader FOR? for the actual upload?

  //   type ReadAsMethod = "readAsText" | "readAsDataURL" | "readAsArrayBuffer" | "readAsBinaryString";
  //   interface FileEvent<T = Element> extends FormEvent<T> {
  //     target: EventTarget & T;
  //   }

  //   type UseFileReaderProps = {
  //     method: ReadAsMethod;
  //     onLoad?: (result: unknown) => void;
  //   };

  //   const useFileReader = (options: UseFileReaderProps) => {
  //     const { method = "readAsText", onLoad } = options;
  //     const [loading, setLoading] = useState<boolean>(false);
  //     const [error, setError] = useState<DOMException | null>(null);
  //     const [result, setResult] = useState<string | ArrayBuffer | null>(null);

  //     useEffect(() => {
  //       console.log(file?.name);
  //       if (!file && result) {
  //         setResult(null);
  //       }
  //     }, [file, result]);

  //     useEffect(() => {
  //       if (!file) {
  //         return;
  //       }

  //       const reader = new FileReader();
  //       reader.onloadstart = () => setLoading(true);
  //       reader.onloadend = () => setLoading(false);
  //       reader.onerror = () => setError(reader.error);

  //       reader.onload = (e: ProgressEvent<FileReader>) => {
  //         setResult(e.target?.result ?? null);
  //         if (onLoad) {
  //           onLoad(e.target?.result ?? null);
  //         }
  //       };
  //       reader[method](file);
  //     }, [file, method, onLoad]);

  //     return [{ result, error, file, loading }, setFile] as const;
  //   };

  //   const [{ result }, setFile] = useFileReader({
  //     method: "readAsDataURL",
  //   });

  const onInputFile = (e: FormEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files?.length) {
      return;
    }
    if (file) {
      setFile([...file, e.currentTarget.files[0]]);
    } else {
      setFile([e.currentTarget.files[0]]);
    }
    console.log("file:", file);
  };

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) {
          formMethods.reset();
        }
        setOpen(open);
      }}>
      <DialogTrigger asChild>
        <Button data-testid="delete-account" color="primary" className="mt-1 border-2" StartIcon={FiPlus}>
          {t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent title={t("lb_certificate_new_dialog_title")} type="creation" Icon={FiAlertTriangle}>
        <>
          <Form form={formMethods} handleSubmit={() => console.log("Hey")}>
            <div className="flex items-start justify-between">
              <div>
                <Label className="mt-8 text-gray-900">
                  <>{t("lb_certificate_update_label")}</>
                </Label>
                {file &&
                  file?.map((file) => (
                    <div
                      key={getRandomInt(60)}
                      className="text-gray mt-2 flex items-center text-sm text-gray-700">
                      {file.name}
                    </div>
                  ))}
              </div>

              <div className="flex items-center">
                <label className="mt-8 rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-medium leading-4 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 dark:border-gray-800 dark:bg-transparent dark:text-white dark:hover:bg-gray-900">
                  <input
                    onInput={onInputFile}
                    type="file"
                    name="certificate-upload"
                    placeholder={t("lb_certificate_upload_placeholder")}
                    className="pointer-events-none absolute mt-4 opacity-0"
                    accept="image/*"
                  />
                  {t("choose_a_file")}
                </label>
              </div>
            </div>
            <div className="mt-8">
              <TextField
                label={t("lb_certificate_name")}
                hint={t("lb_certificate_hint")}
                {...formMethods.register("certificate_name")}
              />
            </div>

            <Controller
              // This name prop, I don't get
              name="document_type"
              control={formMethods.control}
              render={({ field: { value } }) => (
                <>
                  <Label className="mt-8 text-gray-900">
                    <>{t("lb_certificate_document_type")}</>
                  </Label>
                  <Select
                    value={value}
                    options={documentTypeOptions}
                    onChange={(event) => {
                      if (event) formMethods.setValue("document_type", { ...event });
                    }}
                  />
                  <div className="text-gray mt-2 flex items-center text-sm text-gray-700">
                    {t("lb_certificate_document_type_hint")}
                  </div>
                </>
              )}
            />
            <div className="mt-8">
              <Label className="mt-8 text-gray-900">
                <>{t("lb_certificate_desc")}</>
              </Label>
              <TextArea />
            </div>

            <DialogFooter>
              <Button disabled={isDisabled} color="primary" type="submit">
                {t("update")}
              </Button>
              <DialogClose />
            </DialogFooter>
          </Form>
        </>
      </DialogContent>
    </Dialog>
  );
}
