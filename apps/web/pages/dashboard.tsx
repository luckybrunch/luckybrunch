import { ClockIcon, DesktopComputerIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";

import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Divider, EmptyScreen, List, ListItem, ListItemText, ListItemTitle } from "@calcom/ui";
import {
  FiCheck,
  FiClock,
  FiExternalLink,
  FiFile,
  FiInfo,
  FiPlus,
  FiUpload,
} from "@calcom/ui/components/icon";

export type InfoList = {
  title: string;
  name: string;
  description: string;
  icon: () => JSX.Element;
  isDone: boolean;
}[];

const apps: InfoList = [
  {
    title: "Add your information",
    name: "Test",
    description: "You need to upload your certification to get the access to the platform",
    icon: () => <FiInfo />,
    isDone: false,
  },
  {
    title: "Add your certificates",
    name: "Test",
    description: "You need to upload your certification to get the access to the platform",
    icon: () => <FiFile />,
    isDone: false,
  },
  {
    title: "Add your services",
    name: "Test",
    description: "You need to upload your certification to get the access to the platform",
    icon: () => <FiClock />,
    isDone: true,
  },
];

function UnpublishedDashboard() {
  const [isDone, setIsDone] = useState<InfoList>();
  const [isNotDone, setIsNotDone] = useState<InfoList>();

  useEffect(() => {
    const isDone = apps.filter((value) => value.isDone == true);
    console.log("isDone: ", isDone);
    setIsDone(isDone);
    const isNotDone = apps.filter((value) => value.isDone == false);
    console.log("isNotDone: ", isNotDone);
    setIsNotDone(isNotDone);
  }, []);

  return (
    <>
      <Divider />
      <div className="mb-6 mt-6 flex items-center text-sm">
        <div>
          <p className="font-semibold">Add more information to get more customers</p>
          <p className="text-gray-600">
            To submit your profile for review, you have to complete the following elements:{" "}
          </p>
        </div>
      </div>
      <div className="w-full bg-white sm:mx-0 xl:mt-0">
        <List>
          {isNotDone &&
            isNotDone
              .map((isNotDone) => ({ ...isNotDone, title: isNotDone.title || isNotDone.name }))
              .map((isNotDone) => (
                <ListItem className="flex-col border-0" key={isNotDone.title}>
                  <div className="flex w-full flex-1 items-center space-x-2 p-4 rtl:space-x-reverse">
                    {isNotDone.icon && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        {isNotDone.icon()}
                      </div>
                    )}
                    <div className="flex-grow truncate pl-2">
                      <ListItemTitle
                        component="h3"
                        className="mb-1 space-x-2 truncate text-sm font-medium text-neutral-900">
                        {isNotDone.title}
                      </ListItemTitle>
                      <ListItemText component="p">{isNotDone.description}</ListItemText>
                    </div>
                    <div>
                      <Button
                        color="primary"
                        StartIcon={FiPlus}
                        // disabled={app.isGlobal}
                        // onClick={() => {
                        //   setDeleteCredentialId(app.credentialIds[0]);
                        //   setDeleteAppModal(true);
                        // }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
        </List>
        {isDone && isNotDone && <Divider className="mt-8 mb-8" />}
        <List>
          {isDone &&
            isDone
              .map((isDone) => ({ ...isDone, title: isDone.title || isDone.name }))
              .map((isDone) => (
                <ListItem className="flex-col border-0" key={isDone.title}>
                  <div className="flex w-full flex-1 items-center space-x-2 p-4 rtl:space-x-reverse">
                    {isDone.icon && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        {isDone.icon()}
                      </div>
                    )}
                    <div className="flex-grow truncate pl-2">
                      <ListItemTitle
                        component="h3"
                        className="mb-1 space-x-2 truncate text-sm font-medium text-neutral-900">
                        {isDone.title}
                      </ListItemTitle>
                      <ListItemText component="p">{isDone.description}</ListItemText>
                    </div>
                    <div>
                      <Button
                        color="secondary"
                        StartIcon={FiCheck}
                        // disabled={app.isGlobal}
                        // onClick={() => {
                        //   setDeleteCredentialId(app.credentialIds[0]);
                        //   setDeleteAppModal(true);
                        // }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </ListItem>
              ))}
        </List>
      </div>
    </>
  );
}

function InReview() {
  const { t } = useLocale();
  return (
    <EmptyScreen
      Icon={ClockIcon}
      headline={t("lb_profile_in_review_header", {
        category: t("calendar").toLowerCase(),
      })}
      description={t("lb_profile_in_review_subtitle")}
      buttonRaw={
        <Button color="primary" href="#" StartIcon={FiUpload}>
          {t("lb_remove_from_review")}
        </Button>
        //check icon insertion on button
      }
    />
  );
}

function Published() {
  const { t } = useLocale();
  return (
    <EmptyScreen
      Icon={DesktopComputerIcon}
      headline={t("lb_profile_published_header", {
        category: t("calendar").toLowerCase(),
      })}
      description={t("lb_profile_published_subtitle")}
      buttonRaw={
        <Button color="primary" href="#" StartIcon={FiExternalLink}>
          {t("view_public_page")}
        </Button>
      }
    />
  );
}

export default function DashboardPage() {
  const status: "unpublished" | "in_review" | "published" = "published";

  return (
    <Shell heading="Dashboard" subtitle="Manage settings for your nutritionist profile">
      {{
        unpublished: () => <UnpublishedDashboard />,
        in_review: () => <InReview />,
        published: () => <Published />,
      }[status]()}
    </Shell>
  );
}
