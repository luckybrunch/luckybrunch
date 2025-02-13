import { ArrowRightIcon } from "@heroicons/react/solid";
import MarkdownIt from "markdown-it";
import { useRouter } from "next/router";
import { FormEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import turndown from "@calcom/lib/turndownService";
import { trpc } from "@calcom/trpc/react";
import { Button, Form, Editor, ImageUploader, Label, showToast } from "@calcom/ui";
import { Avatar } from "@calcom/ui";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

const md = new MarkdownIt("default", { html: true, breaks: true });

type FormData = {
  bio: string;
};
interface IUserProfileProps {
  user: IOnboardingPageProps["user"];
}

const UserProfile = (props: IUserProfileProps) => {
  const { user } = props;
  const { t } = useLocale();
  const avatarRef = useRef<HTMLInputElement>(null!);
  const form = useForm<FormData>({
    defaultValues: { bio: user?.bio || "" },
  });

  const { data: eventTypes } = trpc.viewer.eventTypes.list.useQuery();
  const [imageSrc, setImageSrc] = useState<string>(user?.avatar || "");
  const utils = trpc.useContext();
  const router = useRouter();
  const createEventType = trpc.viewer.eventTypes.create.useMutation();
  const telemetry = useTelemetry();

  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async (_data, context) => {
      if (context.avatar) {
        showToast(t("your_user_profile_updated_successfully"), "success");
        await utils.viewer.me.refetch();
      } else {
        try {
          if (eventTypes?.length === 0) {
            await Promise.all(
              DEFAULT_EVENT_TYPES.map(async (event) => {
                return createEventType.mutate(event);
              })
            );
          }
        } catch (error) {
          console.error(error);
        }

        await utils.viewer.me.refetch();
        router.push("/");
      }
    },
    onError: () => {
      showToast(t("problem_saving_user_profile"), "error");
    },
  });

  const onSubmit = (data: { bio: string }) => {
    const { bio } = data;

    telemetry.event(telemetryEventTypes.onboardingFinished);

    mutation.mutate({
      bio,
      completedOnboarding: true,
    });
  };

  async function updateProfileHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredAvatar = avatarRef.current.value;
    mutation.mutate({
      avatar: enteredAvatar,
    });
  }

  const DEFAULT_EVENT_TYPES = [
    // {
    //   title: t("15min_meeting"),
    //   slug: "15min",
    //   length: 15,
    // },
    // {
    //   title: t("30min_meeting"),
    //   slug: "30min",
    //   length: 30,
    // },
    // {
    //   title: t("secret_meeting"),
    //   slug: "30min",
    //   length: 30,
    // },
    {
      title: "Unverbindliches Erstgespräch",
      slug: "erstgespraech",
      length: 30,
    },
    {
      title: "Erstberatung / Kennenlerngespräch",
      slug: "erstberatung",
      length: 30,
    },
    {
      title: "Beratungsstunde",
      slug: "beratungsstunde",
      length: 30,
    },
    {
      title: "Ganzheitliche Ernähgrungscoaching",
      slug: "ernaehrungscoaching",
      length: 30,
    },
    {
      title: "Einkaufscoaching",
      slug: "einkaufscoaching",
      length: 30,
    },
    {
      title: "Erstellen eines individuellen Ernährungsplanes",
      slug: "ernaehrungsplaene",
      length: 30,
    },
    {
      title: "Ernährungskurse, Seminare, Workshops in Unternehmen",
      slug: "ernaehrungskurse",
      length: 30,
    },
  ];

  return (
    <Form form={form} handleSubmit={onSubmit}>
      <div className="flex flex-row items-center justify-start rtl:justify-end">
        {user && (
          <Avatar
            alt={user.username || "user avatar"}
            gravatarFallbackMd5={user.emailMd5}
            size="lg"
            imageSrc={imageSrc}
          />
        )}
        <input
          ref={avatarRef}
          type="hidden"
          name="avatar"
          id="avatar"
          placeholder="URL"
          className="mt-1 block w-full rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none focus:ring-gray-800"
          defaultValue={imageSrc}
        />
        <div className="flex items-center px-4">
          <ImageUploader
            target={t("profile_picture")}
            id="avatar-upload"
            buttonMsg={t("add_profile_photo")}
            handleAvatarChange={(newAvatar) => {
              avatarRef.current.value = newAvatar;
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              )?.set;
              nativeInputValueSetter?.call(avatarRef.current, newAvatar);
              const ev2 = new Event("input", { bubbles: true });
              avatarRef.current.dispatchEvent(ev2);
              updateProfileHandler(ev2 as unknown as FormEvent<HTMLFormElement>);
              setImageSrc(newAvatar);
            }}
            imageSrc={imageSrc}
          />
        </div>
      </div>
      <fieldset className="mt-8">
        <Label className="mb-2 block text-sm font-medium text-gray-700">{t("about")}</Label>
        <Editor
          getText={() => md.render(form.getValues("bio") || user?.bio || "")}
          setText={(value: string) => form.setValue("bio", turndown(value))}
          excludedToolbarItems={["blockType"]}
        />
        <p className="mt-2 font-sans text-sm font-normal text-gray-600 dark:text-white">
          {t("few_sentences_about_yourself")}
        </p>
      </fieldset>
      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm text-white">
        {t("finish")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </Form>
  );
};

export default UserProfile;
