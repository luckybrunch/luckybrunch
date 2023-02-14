import { DesktopComputerIcon, HomeIcon, CheckIcon } from "@heroicons/react/solid";
import { IdentityProvider } from "@prisma/client";
import crypto from "crypto";
import MarkdownIt from "markdown-it";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
  Meta,
  showToast,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
  Editor,
  Checkbox,
} from "@calcom/ui";

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
  name: string;
  email: string;
  companyName: string;
  bio: string;
  addressLine1: string;
  addressLine2: string;
  zip: string;
  city: string;
  country: string;
  // check design update later on for specilization fields
};

const InformationPage = () => {
  const { t } = useLocale();
  const utils = trpc.useContext();
  const { data: user, isLoading } = trpc.viewer.me.useQuery();
  const { data: avatar, isLoading: isLoadingAvatar } = trpc.viewer.avatar.useQuery();
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: () => {
      showToast(t("settings_updated_successfully"), "success");
      utils.viewer.me.invalidate();
      utils.viewer.avatar.invalidate();
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
  });

  if (isLoading || !user || isLoadingAvatar || !avatar)
    return (
      <Shell title={t("lb_information_title")} subtitle={t("lb_information_subtitle")}>
        <SkeletonLoader />
      </Shell>
    );

  const defaultValues = {
    avatar: avatar.avatar || "",
    name: user.name || "",
    email: user.email || "",
    bio: user.bio || "",
    companyName: user.companyName || "",
    addressLine1: user.addressLine1 || "",
    addressLine2: user.addressLine2 || "",
    zip: user.zip || "",
    city: user.city || "",
    country: user.country || "",
  };

  return (
    <Shell heading={t("lb_information_title")} subtitle={t("lb_information_subtitle")}>
      <ProfileForm
        key={JSON.stringify(defaultValues)}
        defaultValues={defaultValues}
        onSubmit={(values) => {
          mutation.mutate(values);
        }}
      />
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
        <div className="mt-8 lg:w-2/4">
          <TextField className="lg:w-full" label={t("full_name")} {...formMethods.register("name")} />
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
        <h4 className="text-lg font-bold">{t("lb_specialities")}</h4>
        <h6 className="text-sm text-gray-700">{t("lb_specialities_hint")}</h6>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-bold">{t("lb_place_work")}</h4>
      </div>

      <div className="mt-2 font-bold lg:flex">
        <Button StartIcon={HomeIcon} color="secondary" type="submit">
          {t("lb_home")}
        </Button>
        <Button className="ml-10" StartIcon={DesktopComputerIcon} color="secondary" type="submit">
          {t("lb_online")}
        </Button>
      </div>
      <div className="text-right">
        <Button disabled={isDisabled} color="primary" className="mt-8" type="submit">
          {t("update")}
        </Button>
      </div>
    </Form>
  );
};

export default InformationPage;
