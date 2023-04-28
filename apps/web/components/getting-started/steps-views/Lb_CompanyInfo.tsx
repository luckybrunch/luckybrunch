import { ArrowRightIcon } from "@heroicons/react/outline";
import { useForm, Controller } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button, Select, Form, Label } from "@calcom/ui";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

interface IUserSettingsProps {
  user: IOnboardingPageProps["user"];
  nextStep: () => void;
}

const Lb_CompanyInfo = (props: IUserSettingsProps) => {
  const { user, nextStep } = props;
  const { t } = useLocale();
  const utils = trpc.useContext();

  type FormValues = {
    addressLine1: string;
    addressLine2: string;
    companyName: string;
    zip: string;
    city: string;
    appointmentTypes: string[];
  };

  const AppointmentTypes = {
    online: "lb_appointmenttype_online",
    office: "lb_appointmenttype_office",
    home: "lb_appointmenttype_home",
  } as const;

  const defaultOptions = { required: false, maxLength: 255 };

  const appointmentTypeOptions = Object.entries(AppointmentTypes).map(([value, label]) => ({
    value,
    label: t(label),
  }));

  const defaultValues = {
    addressLine1: user?.addressLine1 || "",
    companyName: user?.companyName || "",
    zip: user?.zip || "",
    city: user?.city || "",
    appointmentTypes: (user.appointmentTypes || "")
      .split(",")
      .filter((v) => Object.keys(AppointmentTypes).includes(v)),
  };

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      utils.viewer.me.invalidate();
      nextStep();
    },
    onError: (error) => {
      throw error;
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({
      addressLine1: data.addressLine1,
      zip: data.zip,
      city: data.city,
      companyName: data.companyName,
      appointmentTypes: data.appointmentTypes.join(","),
    });
  };

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="space-y-6">
        {/* Company Name */}
        <div className="w-full">
          <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-gray-700">
            {t("lb_company_name")}
          </label>
          <input
            {...formMethods.register("companyName", defaultOptions)}
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-md border border-gray-300 text-sm"
          />
          {formMethods.formState.errors.companyName && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {t("required")}
            </p>
          )}
        </div>
        {/* Address Line 1 select field */}
        <div className="w-full">
          <label htmlFor="addressLine1" className="mb-2 block text-sm font-medium text-gray-700">
            {t("lb_street_name_number")}
          </label>
          <input
            {...formMethods.register("addressLine1", defaultOptions)}
            id="addressLine1"
            name="addressLine1"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-md border border-gray-300 text-sm"
          />
          {formMethods.formState.errors.addressLine1 && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {t("required")}
            </p>
          )}
        </div>
        {/* Zip & city select field */}
        <div className="flex w-full">
          <div className="mr-4 flex-1">
            <label htmlFor="zip" className="mb-2 block text-sm font-medium text-gray-700">
              {t("lb_zip_code")}
            </label>
            <input
              {...formMethods.register("zip", defaultOptions)}
              id="zip"
              name="zip"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              className="w-full rounded-md border border-gray-300 text-sm"
            />
            {formMethods.formState.errors.zip && (
              <p data-testid="required" className="py-2 text-xs text-red-500">
                {t("required")}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-700">
              {t("lb_city")}
            </label>
            <input
              {...formMethods.register("city", defaultOptions)}
              id="city"
              name="city"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              className="w-full rounded-md border border-gray-300 text-sm"
            />
            {formMethods.formState.errors.city && (
              <p data-testid="required" className="py-2 text-xs text-red-500">
                {t("required")}
              </p>
            )}
          </div>
        </div>
        {/* Appointment Type select field */}
        <div className="w-full">
          <Controller
            name="appointmentTypes"
            control={formMethods.control}
            render={({ field: { value } }) => (
              <>
                <Label className="mt-8 text-gray-900">
                  <>{t("lb_appointmenttypes_label")}</>
                </Label>

                <Select
                  isMulti
                  placeholder={t("select")}
                  options={appointmentTypeOptions}
                  value={value.map((v) => appointmentTypeOptions.find((o) => o.value === v))}
                  onChange={(value) => {
                    if (value)
                      formMethods.setValue(
                        "appointmentTypes",
                        value.map((v) => v?.value ?? "").filter(Boolean),
                        {
                          shouldDirty: true,
                        }
                      );
                  }}
                />
              </>
            )}
          />
          {formMethods.formState.errors.addressLine1 && (
            <p data-testid="required" className="py-2 text-xs text-red-500">
              {t("required")}
            </p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center"
        disabled={mutation.isLoading}>
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};

export { Lb_CompanyInfo };
