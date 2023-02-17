import { NewCertificateButton, SubmitForReviewButton } from "@calcom/features/certificates";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
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
import { FiDownload, FiEdit, FiFile, FiTrash2 } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

export type List =
  | {
      title: string;
      name: string;
      description: string;
    }[]
  | undefined;

export default function CertificatesPage() {
  const { t } = useLocale();
  const WithQuery = withQuery(trpc.viewer.profile.getCertificates);

  return (
    <Shell
      heading={t("lb_certificate_heading")}
      subtitle={t("lb_certificate_subtitle")}
      CTA={<NewCertificateButton />}>
      <WithQuery
        empty={() => (
          <EmptyScreen
            Icon={FiFile}
            headline={t("lb_certificate_empty_state_heading")}
            description={t("lb_certificate_empty_state_desc")}
            buttonRaw={<NewCertificateButton />}
          />
        )}
        success={({ data }) => (
          <List>
            {data
              .map((certificate) => ({
                ...certificate,
                title: certificate.name || certificate.name,
              }))
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
      />
      <SubmitForReviewButton />
    </Shell>
  );
}
