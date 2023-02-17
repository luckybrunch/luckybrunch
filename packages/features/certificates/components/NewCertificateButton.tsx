import { useState, FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
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
  showToast,
} from "@calcom/ui";
import { FiAlertTriangle, FiPlus } from "@calcom/ui/components/icon";

export function NewCertificateButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File[] | null>(null);
  const { reset } = useForm();

  const { data: certificateTypes } = trpc.viewer.profile.getCertificateTypes.useQuery();
  const ctx = trpc.useContext();
  const certificateTypeOptions = certificateTypes?.map((item) => ({ label: item.name, value: item.id }));

  type CertificateTypeOption = {
    value: number;
    label: string;
  };

  type FormValues = {
    certificate_name: string;
    certificate_type: CertificateTypeOption | null;
    certificate_desc: string;
  };

  const defaultValues = {
    certificate_name: "",
    certificate_type: null,
    certificate_desc: "",
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;

  const mutation = trpc.viewer.profile.addCertificate.useMutation({
    onSuccess: () => {
      showToast(t("settings_updated_successfully"), "success");
      ctx.viewer.profile.getCertificates.invalidate();
      setOpen(false);
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
  });

  const onSubmit = (input: FormValues) => {
    console.log(input);
    if (input.certificate_type === null) throw Error("No certificate selected");

    const certificate = {
      name: input.certificate_name,
      description: input.certificate_desc,
      typeId: input.certificate_type.value,
      fileUrl: "implement later",
    };

    mutation.mutate(certificate);
    reset(input);
  };

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
          <Form form={formMethods} handleSubmit={onSubmit}>
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
                required
                {...formMethods.register("certificate_name")}
              />
            </div>

            <Controller
              // This name prop, I don't get
              name="certificate_type"
              control={formMethods.control}
              rules={{ required: true }}
              render={({ field: { value }, fieldState: { error } }) => (
                <>
                  <Label className="mt-8 text-gray-900">
                    <>{t("lb_certificate_document_type")}</>
                  </Label>
                  <Select
                    value={value}
                    options={certificateTypeOptions}
                    isLoading={certificateTypeOptions === undefined}
                    onChange={(value) => {
                      if (value) formMethods.setValue("certificate_type", value);
                    }}
                  />
                  {error?.type === "required" && <div className="text-red-500">Missing</div>}
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
              <TextArea {...formMethods.register("certificate_desc")} />
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
