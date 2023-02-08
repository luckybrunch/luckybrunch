import { useEffect, useState } from "react";

import { NewCertificateButton } from "@calcom/features/certificates";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemTitle,
  EmptyScreen,
  ButtonGroup,
  Tooltip,
} from "@calcom/ui";
import { FiDownload, FiEdit, FiFile, FiTrash2, FiUpload } from "@calcom/ui/components/icon";

export type List =
  | {
      title: string;
      name: string;
      description: string;
    }[]
  | undefined;

const certificatesInfo: List = [
  {
    title: "Certificate #1",
    name: "Test",
    description: "Here you can see all your active certificates",
  },
  {
    title: "Certificate #2",
    name: "Test",
    description: "Here you can see all your active certificates",
  },
  {
    title: "Certificate #3",
    name: "Test",
    description: "Here you can see all your active certificates",
  },
];

export default function CertificatesPage() {
  const { t } = useLocale();
  const [certificates, setCertificates] = useState<List>();

  useEffect(() => {
    // setCertificates(certificatesInfo);
  }, []);

  return (
    <Shell
      heading={t("lb_certificate_heading")}
      subtitle={t("lb_certificate_subtitle")}
      CTA={<NewCertificateButton />}>
      {/* EMPTY STATE */}
      {!certificates ? (
        <EmptyScreen
          Icon={FiFile}
          headline={t("lb_certificate_empty_state_heading")}
          description={t("lb_certificate_empty_state_desc")}
          buttonRaw={<NewCertificateButton />}
        />
      ) : (
        // LIST STATE
        <List>
          {certificates &&
            certificates
              .map((certificate) => ({ ...certificate, title: certificate.title || certificate.name }))
              .map((certificate) => (
                <ListItem className="flex-col border-0" key={certificate.title}>
                  <div className="flex w-full flex-1 items-center space-x-2 p-4 rtl:space-x-reverse">
                    <div className="flex-grow truncate pl-2">
                      <ListItemTitle
                        component="h3"
                        className="mb-1 space-x-2 truncate text-sm font-medium text-neutral-900">
                        {certificate.title}
                      </ListItemTitle>
                      <ListItemText component="p">{certificate.description}</ListItemText>
                    </div>
                    <div>
                      <ButtonGroup combined>
                        <Tooltip content={t("edit")}>
                          <Button color="secondary" target="_blank" StartIcon={FiEdit} />
                        </Tooltip>
                        <Tooltip content={t("download")}>
                          <Button color="secondary" StartIcon={FiDownload} />
                        </Tooltip>
                        <Tooltip content={t("delete")}>
                          <Button color="secondary" StartIcon={FiTrash2} />
                        </Tooltip>
                      </ButtonGroup>
                    </div>
                  </div>
                </ListItem>
              ))}
        </List>
      )}
      {/* SUBMIT FOR REVIEW BUTTON */}
      {certificates && (
        <div className="flex grow justify-end">
          <Button
            // disabled={isDisabled}
            type="submit"
            // loading={mutation.isLoading}
            color="primary"
            className="mt-12"
            StartIcon={FiUpload}>
            {t("lb_submit_for_review")}
          </Button>
        </div>
      )}
    </Shell>
  );
}
