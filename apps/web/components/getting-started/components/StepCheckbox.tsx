import { Button } from "@calcom/ui";

import { useQueryState } from "@components/getting-started/query-state";

function useCheckboxState(key: string, value: string) {
  const [values, setValue] = useQueryState(key);

  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      setValue([...values, value]);
    } else {
      setValue(values.filter((v) => v !== value));
    }
  };

  return { isChecked: values.includes(value), onCheckedChange };
}

type CheckboxProps = {
  title: string;
  queryKey: string;
  value: string;
};

export const StepCheckbox = (props: CheckboxProps) => {
  const { title, queryKey, value } = props;
  const { isChecked, onCheckedChange } = useCheckboxState(queryKey, value);
  return (
    <Button
      role="checkbox"
      onClick={() => onCheckedChange(!isChecked)}
      color={isChecked ? "primary" : "secondary"}
      className="border-brand-600 m-2 h-16 justify-center rounded-md p-3 shadow-md transition-colors duration-300">
      {title}
    </Button>
  );
};
