import { UpdateCertificateButton, SubmitForReviewButton } from "@calcom/features/certificates";
import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import {
  Button,
  List,
  ListItem,
  ListItemTitle,
  EmptyScreen,
  ButtonGroup,
  Tooltip,
  showToast,
} from "@calcom/ui";
import { FiDownload, FiFile, FiTrash2 } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

import { TabLayoutForMdAndLess } from "@components/profile/TabLayoutForMdAndLess";

export type List =
  | {
      title: string;
      name: string;
      description: string;
    }[]
  | undefined;

export default function CertificatesPage() {
  const { t } = useLocale();
  const ctx = trpc.useContext();
  const WithQuery = withQuery(trpc.viewer.profile.getCertificates);
  const mutation = trpc.viewer.profile.deleteCertificate.useMutation({
    onSuccess: () => {
      showToast(t("lb_certificate_deleted_successfully"), "success");
      ctx.viewer.profile.getCertificates.invalidate();
    },
    onError: () => {
      showToast(t("lb_error_deleting_certificate"), "error");
    },
  });

  return (
    <Shell
      heading={t("lb_certificate_heading")}
      subtitle={t("lb_certificate_subtitle")}
      CTA={<UpdateCertificateButton />}>
      <TabLayoutForMdAndLess tabsFor="profile">
        <WithQuery
          empty={() => (
            <EmptyScreen
              Icon={FiFile}
              headline={t("lb_certificate_empty_state_heading")}
              description={t("lb_certificate_empty_state_desc")}
              buttonRaw={<UpdateCertificateButton />}
            />
          )}
          success={({ data }) => (
            <List>
              {data.map((certificate) => (
                <ListItem rounded={false} className="flex-col border-0 md:border-0" key={certificate.name}>
                  <div className="flex w-full flex-1 items-center space-x-2 p-4 rtl:space-x-reverse">
                    <div className="flex-grow truncate pl-2">
                      <ListItemTitle
                        component="h3"
                        className="mb-1 space-x-2 truncate text-sm font-medium text-neutral-900">
                        {certificate.name}
                      </ListItemTitle>
                    </div>
                    <div>
                      <ButtonGroup combined>
                        <Tooltip content={t("edit")}>
                          <UpdateCertificateButton certificate={certificate} />
                          {/* <Button color="secondary" target="_blank" StartIcon={FiEdit} /> */}
                        </Tooltip>
                        <Tooltip content={t("download")}>
                          <Button
                            target="_blank"
                            variant="icon"
                            StartIcon={FiDownload}
                            href={certificate.fileUrl}
                            color="secondary"
                          />
                        </Tooltip>
                        <Tooltip content={t("delete")}>
                          <Button
                            color="secondary"
                            variant="icon"
                            StartIcon={FiTrash2}
                            onClick={() => {
                              mutation.mutate({ id: certificate.id });
                            }}
                          />
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
      </TabLayoutForMdAndLess>
    </Shell>
  );
}
