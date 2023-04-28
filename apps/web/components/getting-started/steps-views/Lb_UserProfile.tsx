import { ArrowRightIcon } from "@heroicons/react/solid";
import MarkdownIt from "markdown-it";
import { FormEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import turndown from "@calcom/lib/turndownService";
import { trpc } from "@calcom/trpc/react";
import { Button, Editor, ImageUploader, Label } from "@calcom/ui";
import { Avatar } from "@calcom/ui";

import type { IOnboardingPageProps } from "../../../pages/getting-started/[[...step]]";

const md = new MarkdownIt("default", { html: true, breaks: true });

type FormData = {
  bio: string;
  name: string;
};
interface IUserProfileProps {
  user: IOnboardingPageProps["user"];
  nextStep: () => void;
}

const Lb_UserProfile = (props: IUserProfileProps) => {
  const { user, nextStep } = props;
  const { t } = useLocale();
  const utils = trpc.useContext();
  const avatarRef = useRef<HTMLInputElement>(null!);
  const [imageSrc, setImageSrc] = useState<string>(user?.avatar || "");
  const defaultOptions = { required: true, maxLength: 255 };

  const { data: eventTypes } = trpc.viewer.eventTypes.list.useQuery();
  const createEventType = trpc.viewer.eventTypes.create.useMutation();
  const mutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async (_data, context) => {
      if (context.avatar) {
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
          throw error;
        }
        await utils.viewer.me.invalidate();
        nextStep();
      }
      trpc.viewer.profile.setCompletedProfileServices.useMutation();
    },
    onError: (error) => {
      throw error;
    },
  });

  const {
    setValue,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { bio: user?.bio || "", name: user?.name || "" },
  });

  const onSubmit = handleSubmit((data: { bio: string; name: string }) => {
    const { bio, name } = data;
    mutation.mutate({
      name,
      bio,
    });
  });

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
      title: "Beratungsstunde (Zeiteinheit Vorgabe Berater)",
      slug: "beratungsstunde",
      length: 30,
    },
    {
      title: "Ganzheitliche Ernähgrungscoaching (Zeiteinheit Vorgabe Berater)",
      slug: "ernaehrungscoaching",
      length: 30,
    },
    {
      title: "Einkaufscoaching (Zeiteinheit Vorgabe Berater)",
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
    <form onSubmit={onSubmit}>
      {/* image upload */}
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
            target="avatar"
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
      {/* Full name textfield */}
      <div className="mt-8 w-full">
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
          {t("full_name")}
        </label>
        <input
          {...register("name", defaultOptions)}
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          className="w-full rounded-md border border-gray-300 text-sm"
        />
        {errors.name && (
          <p data-testid="required" className="py-2 text-xs text-red-500">
            {t("required")}
          </p>
        )}
      </div>
      <fieldset className="mt-8">
        <Label className="mb-2 block text-sm font-medium text-gray-700">{t("about")}</Label>
        <Editor
          getText={() => md.render(getValues("bio") || user?.bio || "")}
          setText={(value: string) => setValue("bio", turndown(value))}
          excludedToolbarItems={["blockType"]}
        />
        <p className="mt-2 font-sans text-sm font-normal text-gray-600 dark:text-white">
          {t("few_sentences_about_yourself")}
        </p>
      </fieldset>
      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center"
        disabled={mutation.isLoading}>
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </Button>
    </form>
  );
};

export default Lb_UserProfile;
