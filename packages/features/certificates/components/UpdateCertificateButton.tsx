import type { PresignedPost } from "@aws-sdk/s3-presigned-post";
import { useState, useMemo, FormEvent } from "react";
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
  showToast,
} from "@calcom/ui";
import { FiEdit, FiPlus } from "@calcom/ui/components/icon";
import { FiAlertTriangle } from "@calcom/ui/components/icon";

type Cert = {
  id: number;
  name: string;
  fileUrl: string;
  type?: {
    id: number;
    name: string;
  };
};

export function UpdateCertificateButton({ certificate }: { certificate?: Cert }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { data: certificateTypes } = trpc.public.getCertificateTypes.useQuery();
  const { data: signedUrl } = trpc.viewer.coaches.getSignedUrl.useQuery();

  const ctx = trpc.useContext();
  const certificateTypeOptions = certificateTypes?.map((item) => ({ label: item.name, value: item.id }));

  const certificateTypeOptionOther = useMemo(
    () => ({ label: t("lb_certificate_type_other"), value: -1 }),
    [t]
  );
  certificateTypeOptions?.push(certificateTypeOptionOther);

  type CertificateTypeOption = {
    value: number;
    label: string;
  };

  type FormValues = {
    certificate_name: string;
    certificate_type: CertificateTypeOption | null;
  };

  const defaultValues = {
    certificate_name: certificate?.type ? "" : certificate?.name || "",
    certificate_type: certificate?.type
      ? { value: certificate.type.id, label: certificate.type.name }
      : certificate?.name
      ? certificateTypeOptionOther
      : null,
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;

  const uploadCertificate = async (post: PresignedPost, file: Blob) => {
    const { url, fields } = post;
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const upload = await fetch(url, {
        method: "POST",
        body: formData,
      });

      return upload.ok;
    } catch (err) {
      let errorMessage = "";
      // This error is thrown when S3 conditions are not met for the signed url
      if (err instanceof TypeError) {
        errorMessage = t("lb_certificate_upload_error_max_file_size_exceeded");
      } else {
        errorMessage = t("lb_certificate_upload_error_unknown_error");
      }

      throw new Error(errorMessage);
    }
  };

  const mutation = trpc.viewer.profile.updateCertificate.useMutation({
    onSuccess: () => {
      showToast(t("lb_update_certificate_toast"), "success");
      ctx.viewer.profile.getCertificates.invalidate();
      // reset call of react-hook-form doesn't reset <input type="file" />
      setFile(null);
      setOpen(false);
    },
    onError: () => {
      showToast(t("lb_update_certificate_error"), "error");
    },
  });

  const onSubmit = async (input: FormValues) => {
    if (input.certificate_type === null) throw new Error("No certificate type is selected");

    if ((!certificate?.fileUrl && file == null) || file?.length === 0 || signedUrl == null) {
      throw new Error("Certificate isn't selected or an error occurred while uploading");
    }

    try {
      setLoading(true);
      const { post, fileUrl } = signedUrl;
      let uploadSuccess = false;

      if (file) {
        uploadSuccess = await uploadCertificate(post, file[0]);
      }

      if (!uploadSuccess && !certificate?.fileUrl) {
        throw new Error("An error occurred while updating the certificate");
      }

      const certificateForm = {
        certId: certificate ? certificate.id : undefined,
        name: input.certificate_type.value !== -1 ? input.certificate_type.label : input.certificate_name,
        typeId: input.certificate_type.value !== -1 ? input.certificate_type.value : null,
        fileUrl: file ? fileUrl : certificate?.fileUrl ?? "",
      };

      mutation.mutate(certificateForm);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const onInputFile = (e: FormEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files?.length) {
      return;
    }

    setFile([e.currentTarget.files[0]]);
  };

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open && !certificate) {
          formMethods.reset();
        }
        setOpen(open);
      }}>
      <DialogTrigger asChild>
        {certificate ? (
          <Button color="secondary" variant="icon" StartIcon={FiEdit} />
        ) : (
          <Button data-testid="delete-account" color="primary" className="mt-1 border-2" StartIcon={FiPlus}>
            {t("add")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        title={certificate ? t("lb_edit_certificate_dialog_title") : t("lb_add_certificate_dialog_title")}
        type="creation"
        Icon={FiAlertTriangle}>
        <>
          <Form form={formMethods} handleSubmit={onSubmit}>
            <div className="flex items-start justify-between">
              <div>
                <Label className="mt-8 text-gray-900">
                  <>{t("lb_certificate_file_label")}</>
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
                    onChange={onInputFile}
                    type="file"
                    name="certificate-upload"
                    placeholder={t("lb_certificate_upload_placeholder")}
                    className="pointer-events-none absolute mt-4 opacity-0"
                    accept="application/pdf"
                  />
                  {t("choose_a_file")}
                </label>
              </div>
            </div>

            <Controller
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
                      if (value) formMethods.setValue("certificate_type", value, { shouldDirty: true });
                    }}
                  />
                  {error?.type === "required" && <div className="text-red-500">Missing</div>}
                  {value?.value === -1 && (
                    <div className="mt-8">
                      <TextField
                        label={t("lb_certificate_name")}
                        required
                        {...formMethods.register("certificate_name")}
                      />
                    </div>
                  )}
                </>
              )}
            />

            <DialogFooter>
              <Button loading={isLoading} disabled={isDisabled} color="primary" type="submit">
                {certificate ? t("update") : t("add")}
              </Button>
              <DialogClose />
            </DialogFooter>
          </Form>
        </>
      </DialogContent>
    </Dialog>
  );
}
