import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, ListItem } from "@calcom/ui";
import { Badge } from "@calcom/ui";
import { FiArrowLeft, FiArrowRight } from "@calcom/ui/components/icon";

import type { FieldDiffMetada } from "../lib/getDiffMetadata";

const translationKeys = {
  firstName: "lb_first_name",
  lastName: "lb_last_name",
  bio: "lb_biography",
  avatar: "avatar",
  companyName: "lb_company_name",
  addressLine1: "address",
  addressLine2: "address",
  zip: "lb_zip_code",
  city: "lb_city",
  country: "lb_country",
  appointmentTypes: "lb_appointmenttypes_label",
};

type ProfileDiffProps = {
  diffMetadata: FieldDiffMetada;
  revertChange: (field: string) => void;
  isLoading: boolean;
};

const NewAddition = (props: Pick<FieldDiffMetada, "newValue">) => {
  return (
    <>
      <Badge variant="lb_green">{props.newValue}</Badge>
    </>
  );
};

const Change = (props: Pick<FieldDiffMetada, "oldValue" | "newValue">) => {
  return (
    <>
      <Badge variant="lb_green">{props.oldValue}</Badge>
      <FiArrowRight className="inline-block h-[20px] w-[30px] px-1" />
      <Badge variant="lb_green">{props.newValue}</Badge>
    </>
  );
};

const Deletion = (props: Pick<FieldDiffMetada, "oldValue">) => {
  return (
    <>
      <Badge variant="red" withDot={true}>
        {props.oldValue}
      </Badge>
    </>
  );
};

export function ProfileDiff(props: ProfileDiffProps) {
  const { t } = useLocale();
  const { diffMetadata, revertChange, isLoading } = props;
  const { field, isNew, isDeleted, newValue, oldValue } = diffMetadata;

  return (
    <ListItem rounded={false} className="block flex-col border-0 md:border-0">
      <div className="flex items-center justify-between">
        <div className="flex max-w-[65%] flex-col p-1">
          <h3 className="mb-1 text-sm font-medium capitalize text-neutral-900">
            {t(translationKeys[field])}
          </h3>
          <div>
            {isNew && <NewAddition newValue={newValue} />}
            {isDeleted && <Deletion oldValue={oldValue} />}
            {!isDeleted && !isNew && <Change oldValue={oldValue} newValue={newValue} />}
          </div>
        </div>
        <Button
          color="secondary"
          disabled={isLoading}
          StartIcon={FiArrowLeft}
          onClick={() => {
            revertChange(field);
          }}>
          {t("lb_revert")}
        </Button>
      </div>
    </ListItem>
  );
}
