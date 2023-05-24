import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, ListItem } from "@calcom/ui";
import { FiArrowLeft, FiArrowRight } from "@calcom/ui/components/icon";

import type { FieldDiffMetada } from "../lib/getDiffMetadata";

const translationKeys = {
  name: "full_name",
  bio: "lb_biography",
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
  revertChange: (type: "revertNew" | "revertChange", field: string) => void;
  isLoading: boolean;
};

const NewAddition = (props: Pick<FieldDiffMetada, "newValue">) => {
  return (
    <>
      <p className="inline bg-green-100 p-1">{props.newValue}</p>
    </>
  );
};

const Change = (props: Pick<FieldDiffMetada, "oldValue" | "newValue">) => {
  return (
    <>
      <p className="inline bg-red-100 p-1 line-through">{props.oldValue}</p>
      <FiArrowRight className="inline-block h-[20px] w-[30px] px-1" />
      <p className="inline bg-green-100 p-1">{props.newValue}</p>
    </>
  );
};

const Deletion = (props: Pick<FieldDiffMetada, "oldValue">) => {
  return (
    <>
      <p className="inline bg-red-100 p-1 line-through">{props.oldValue}</p>
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
          <h2 className="mb-2 font-semibold capitalize">{t(translationKeys[field])}</h2>
          <div>
            {isNew && <NewAddition newValue={newValue} />}
            {isDeleted && <Deletion oldValue={oldValue} />}
            {!isDeleted && !isNew && <Change oldValue={oldValue} newValue={newValue} />}
          </div>
        </div>
        <Button
          disabled={isLoading}
          StartIcon={FiArrowLeft}
          onClick={() => {
            const type = isNew ? "revertNew" : "revertChange";
            revertChange(type, field);
          }}>
          {t("lb_revert")}
        </Button>
      </div>
    </ListItem>
  );
}
