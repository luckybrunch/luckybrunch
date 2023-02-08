import { DesktopComputerIcon, HomeIcon, CheckIcon } from "@heroicons/react/solid";
import { IdentityProvider } from "@prisma/client";
import crypto from "crypto";
import MarkdownIt from "markdown-it";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Shell from "@calcom/features/shell/Shell";
import { ErrorCode } from "@calcom/lib/auth";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import turndownService from "@calcom/lib/turndownService";
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

import { ssrInit } from "@server/lib/ssr";

const md = new MarkdownIt("default", { html: true, breaks: true });

//check Emil, keep or modify?:
const SkeletonLoader = ({ title, description }: { title: string; description: string }) => {
  return (
    <SkeletonContainer>
      <Meta title={title} description={description} />
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
  first_name: string;
  last_name: string;
  company_name: string;
  biography: string;
  street_name_number: string; //change to allow numbers
  zip_code: number;
  city: string; //ort translation correct?
  to_be_inputed_later: string; // check design update later on
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
      setTempFormValues(null);
    },
    onError: () => {
      showToast(t("error_updating_settings"), "error");
    },
  });

  const [tempFormValues, setTempFormValues] = useState<FormValues | null>(null);

  const isCALIdentityProviver = user?.identityProvider === IdentityProvider.CAL;

  const errorMessages: { [key: string]: string } = {
    [ErrorCode.SecondFactorRequired]: t("2fa_enabled_instructions"),
    [ErrorCode.IncorrectPassword]: `${t("incorrect_password")} ${t("please_try_again")}`,
    [ErrorCode.UserNotFound]: t("no_account_exists"),
    [ErrorCode.IncorrectTwoFactorCode]: `${t("incorrect_2fa_code")} ${t("please_try_again")}`,
    [ErrorCode.InternalServerError]: `${t("something_went_wrong")} ${t("please_try_again_and_contact_us")}`,
    [ErrorCode.ThirdPartyIdentityProviderEnabled]: t("account_created_with_identity_provider"),
  };

  if (isLoading || !user || isLoadingAvatar || !avatar)
    return (
      <SkeletonLoader
        title={t("Information")}
        description={t("Information description", { appName: APP_NAME })}
      />
    );

  //correct the name from database later on => first_name = user.first_name
  const defaultValues = {
    avatar: avatar.avatar || "",
    first_name: user.name || "",
    last_name: user.name || "",
    company_name: user.name || "",
    biography: user.name || "",
    street_name_number: user.name || "",
    zip_code: user.name || "",
    city: user.name || "",
  };

  return (
    <>
      <Meta
        title={t("lb_information_title")}
        description={t("lb_information_subtitle", { appName: APP_NAME })}
      />

      <ProfileForm key={JSON.stringify(defaultValues)} defaultValues={defaultValues} />
      <hr className="my-6 border-gray-200" />
    </>
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
    .update(defaultValues.first_name || "example@example.com")
    .digest("hex");

  const formMethods = useForm<FormValues>({
    defaultValues,
  });

  const {
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const isDisabled = isSubmitting || !isDirty;

  return (
    <Shell title={t("lb_information_title")}>
      <Form form={formMethods} handleSubmit={onSubmit}>
        <div className="flex items-center">
          <Controller
            control={formMethods.control}
            name="avatar"
            render={({ field: { value } }) => (
              <>
                <Avatar alt="" imageSrc={value} gravatarFallbackMd5={emailMd5} size="md" />

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
          {" "}
          <div className="mt-8 lg:w-2/4">
            <TextField
              className="lg:w-full"
              label={t("lb_first_name")}
              {...formMethods.register("first_name")}
            />
          </div>
          <div className="mt-8 lg:ml-2 lg:w-2/4">
            <TextField
              className="lg:w-full"
              label={t("lb_last_name")}
              {...formMethods.register("last_name")}
            />
          </div>
        </div>

        <div className="mt-8 lg:mt-2">
          <TextField label={t("lb_company_name")} {...formMethods.register("company_name")} />
        </div>
        <div className="mt-8 lg:mt-2">
          <Label>{t("lb_biography")}</Label>
          <Editor
            //check with Emil about Hint, use paragraph?
            getText={() => md.render(formMethods.getValues("biography") || "")}
            setText={(value: string) => {
              formMethods.setValue("biography", turndownService.turndown(value), { shouldDirty: true });
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
            <TextField label={t("lb_street_name_number")} {...formMethods.register("street_name_number")} />
          </div>
          <div className="mt-8 lg:ml-2 lg:w-2/4">
            <TextField label={t("lb_zip_code")} {...formMethods.register("zip_code")} />
          </div>
        </div>
        <div className="mt-8 lg:mt-2">
          <TextField label={t("lb_city")} {...formMethods.register("city")} />
        </div>

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

        <div className=" lg:flex">
          <div className="mt-8 lg:w-2/4">
            <TextField label={t("lb_to_be_inputed_later")} {...formMethods.register("to_be_inputed_later")} />
          </div>
          <div className="mt-8 lg:ml-2 lg:w-2/4">
            <TextField label={t("lb_to_be_inputed_later")} {...formMethods.register("to_be_inputed_later")} />
          </div>
        </div>
        <div className="mt-8 lg:mt-2">
          <TextField label={t("lb_to_be_inputed_later")} {...formMethods.register("to_be_inputed_later")} />
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
        <div className=" text-right">
          {" "}
          <Button
            className=" mt-8 bg-green-700"
            StartIcon={CheckIcon}
            disabled={isDisabled}
            color="primary"
            type="submit">
            {t("save")}
          </Button>
        </div>
      </Form>
    </Shell>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const ssr = await ssrInit(context);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};

export default InformationPage;
