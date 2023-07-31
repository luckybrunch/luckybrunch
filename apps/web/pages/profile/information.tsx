import crypto from "crypto";
import MarkdownIt from "markdown-it";
import { Controller, useForm } from "react-hook-form";

import { AppointmentType } from "@calcom/features/coaches/types";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import turndown from "@calcom/lib/turndownService";
import { trpc } from "@calcom/trpc/react";
import {
  Avatar,
  Button,
  Form,
  ImageUploader,
  Label,
  Select,
  showToast,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
  Editor,
  Checkbox,
} from "@calcom/ui";

import { TabLayoutForMdAndLess } from "../../components/profile/TabLayoutForMdAndLess";

const md = new MarkdownIt("default", { html: true, breaks: true });

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <div className="flex items-center">
          <SkeletonAvatar className="h-12 w-12 px-4" />
          <SkeletonButton className="h-6 w-32 rounded-md p-5" />
        </div>
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

type FormValues = {
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  bio: string;
  addressLine1: string;
  addressLine2: string;
  zip: string;
  city: string;
  country: string;
  appointmentTypes: string[];
  specializations: number[];
};

const AppointmentTypes = {
  [AppointmentType.ONLINE]: "lb_appointmenttype_online",
  [AppointmentType.OFFICE]: "lb_appointmenttype_office",
  [AppointmentType.HOME]: "lb_appointmenttype_home",
} as const;

const InformationPage = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();
  const { data: avatar, isLoading: isLoadingAvatar } = trpc.viewer.avatar.useQuery();
  const { data: specializations, isLoading: isLoadingSpecializationValues } =
    trpc.viewer.profile.getSpecializations.useQuery();
  const { isLoading: isLoadingSpecializations } = trpc.public.getSpecializations.useQuery();

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      showToast(t("settings_updated_successfully"), "success");
      utils.viewer.me.invalidate();
      utils.viewer.avatar.invalidate();
      utils.viewer.profile.getSpecializations.invalidate();
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
  });

  if (
    isLoading ||
    !user ||
    isLoadingAvatar ||
    !avatar ||
    isLoadingSpecializationValues ||
    isLoadingSpecializations
  )
    return (
      <Shell title={t("lb_information_title")} subtitle={t("lb_information_subtitle")}>
        <SkeletonLoader />
      </Shell>
    );

  const defaultValues = {
    avatar: user.coachProfileDraft?.avatar ?? "",
    email: user.email ?? "",
    firstName: user.coachProfileDraft?.firstName ?? "",
    lastName: user.coachProfileDraft?.lastName ?? "",
    bio: user.coachProfileDraft?.bio ?? "",
    companyName: user.coachProfileDraft?.companyName ?? "",
    addressLine1: user.coachProfileDraft?.addressLine1 ?? "",
    addressLine2: user.coachProfileDraft?.addressLine2 ?? "",
    zip: user.coachProfileDraft?.zip ?? "",
    city: user.coachProfileDraft?.city ?? "",
    country: user.coachProfileDraft?.country ?? "",
    appointmentTypes: (user.coachProfileDraft?.appointmentTypes ?? "")
      .split(",")
      .filter((v) => Object.keys(AppointmentTypes).includes(v)),
    specializations: specializations?.map((item) => item.id) || [],
  };

  return (
    <Shell heading={t("lb_information_title")} subtitle={t("lb_information_subtitle")}>
      <TabLayoutForMdAndLess tabsFor="profile">
        <ProfileForm
          key={JSON.stringify(defaultValues)}
          defaultValues={defaultValues}
          onSubmit={(values) => {
            const { appointmentTypes, ...rest } = values;
            mutation.mutate({
              ...rest,
              appointmentTypes: appointmentTypes.join(","),
            });
          }}
        />
      </TabLayoutForMdAndLess>
    </Shell>
  );
};

const ProfileForm = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => void;
}) => {
  const { t } = useLocale();

  const emailMd5 = crypto
    .createHash("md5")
    .update(defaultValues.email || "example@example.com")
    .digest("hex");

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;

  const { data: specializations } = trpc.public.getSpecializations.useQuery();
  const specializationsOptions =
    specializations?.map((item) => ({
      label: item.label,
      value: String(item.id),
    })) ?? [];

  const appointmentTypeOptions = Object.entries(AppointmentTypes).map(([value, label]) => ({
    value,
    label: t(label),
  }));

  return (
    <Form form={formMethods} handleSubmit={onSubmit}>
      <div className="flex items-center">
        <Controller
          control={formMethods.control}
          name="avatar"
          render={({ field: { value } }) => (
            <>
              <Avatar alt="" imageSrc={value} gravatarFallbackMd5={emailMd5} size="lg" />

              <div className="ltr:ml-4 rtl:mr-4">
                {/* button color is already set inside component */}
                <ImageUploader
                  target="avatar"
                  id="avatar-upload"
                  buttonMsg={t("choose_a_file")}
                  handleAvatarChange={(newAvatar) => {
                    formMethods.setValue("avatar", newAvatar, { shouldDirty: true });
                  }}
                  imageSrc={value || undefined}
                />
              </div>
            </>
          )}
        />
      </div>
      <div className=" lg:flex">
        <div className="mt-8 mr-2 lg:w-1/4">
          <TextField
            className="lg:w-full"
            label={t("lb_first_name")}
            {...formMethods.register("firstName")}
          />
        </div>
        <div className="mt-8 lg:w-1/4">
          <TextField className="lg:w-full" label={t("lb_last_name")} {...formMethods.register("lastName")} />
        </div>
      </div>

      <div className="mt-8 lg:mt-2">
        <TextField label={t("lb_company_name")} {...formMethods.register("companyName")} />
      </div>
      <div className="mt-8 lg:mt-2">
        <Label>{t("lb_biography")}</Label>
        <Editor
          getText={() => md.render(formMethods.getValues("bio") || "")}
          setText={(value: string) => {
            formMethods.setValue("bio", turndown(value), { shouldDirty: true });
          }}
          excludedToolbarItems={["blockType"]}
        />
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-bold">{t("lb_work_address")}</h4>
        <h6 className="text-sm text-gray-700">{t("lb_place_work")}</h6>
      </div>
      <div className="lg:flex">
        <div className="mt-8 lg:w-2/4">
          <TextField label={t("lb_street_name_number")} {...formMethods.register("addressLine1")} />
        </div>
        <div className="mt-8 lg:ml-2 lg:w-2/4">
          <TextField label={t("lb_zip_code")} {...formMethods.register("zip")} />
        </div>
      </div>
      <div className="mt-8 lg:mt-2">
        <TextField label={t("lb_city")} {...formMethods.register("city")} />
      </div>

      {/*what logic to implement here? maybe the one commented below*/}
      <div>
        <Checkbox description={t("lb_work_equals_billing_address")} />
        {/* 
        defaultChecked={form.getValues(`steps.${step.stepNumber - 1}.numberRequired`) || false
        }          
        onChange={(e) =>form.setValue(`steps.${step.stepNumber - 1}.numberRequired`, e.target.checked)
        } */}
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-bold">{t("lb_specializations")}</h4>
      </div>

      <div className="mt-5">
        <Controller
          name="specializations"
          control={formMethods.control}
          render={({ field: { value } }) => (
            <>
              <Label className="mt-8 text-gray-900">
                <>{t("lb_specializations_label")}</>
              </Label>

              <Select
                isMulti
                placeholder={t("select")}
                options={specializationsOptions}
                value={value.map((v) => specializationsOptions.find((o) => o.value === String(v)))}
                onChange={(value) => {
                  if (value)
                    formMethods.setValue(
                      "specializations",
                      value
                        .map((v) => v?.value ?? "")
                        .map(Number)
                        .filter(Boolean),
                      {
                        shouldDirty: true,
                      }
                    );
                }}
              />
            </>
          )}
        />
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-bold">{t("lb_place_work")}</h4>
      </div>

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
                  formMethods.setValue("appointmentTypes", value.map((v) => v?.value ?? "").filter(Boolean), {
                    shouldDirty: true,
                  });
              }}
            />
          </>
        )}
      />

      <div className="text-right">
        <Button disabled={isDisabled} color="primary" className="mt-8" type="submit">
          {t("update")}
        </Button>
      </div>
    </Form>
  );
};

export default InformationPage;
