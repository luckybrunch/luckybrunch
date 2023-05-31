import { useState } from "react";

import { Button } from "@calcom/ui";

type Option = { title: string };
// To hopefully not override a field given from component side
type InternalOption = { _id: symbol; _isSelected: boolean };

export function useCheckboxOptions<T extends Option>(opts: T[], maxAllowedSelectionCount = 4) {
  const [options, setOptions] = useState<(T & InternalOption)[]>(
    opts.map((option) => {
      return {
        ...option,
        _id: Symbol(),
        _isSelected: false,
      };
    })
  );

  const toggleSelection = (optionId: symbol) => {
    setOptions((options) => {
      return options.map((option) => {
        let _isSelected = option._id === optionId ? !option._isSelected : option._isSelected;

        // If total number of selected elements equal to max limit, do not allow for more
        if (
          option._id === optionId &&
          _isSelected &&
          options.filter((option) => option._isSelected).length + 1 > maxAllowedSelectionCount
        ) {
          _isSelected = false;
        }

        return {
          ...option,
          _isSelected,
        };
      });
    });
  };

  return { options, toggleSelection, selectionCount: options.filter((option) => option._isSelected).length };
}

type CheckboxProps = {
  isActive: boolean;
  toggle: () => void;
  title: string;
};

export const StepCheckbox = (props: CheckboxProps) => {
  const { isActive, toggle, title } = props;
  return (
    <Button
      role="checkbox"
      onClick={toggle}
      color={isActive ? "primary" : "secondary"}
      className="border-brand-600 m-2 w-fit rounded-md p-3 capitalize shadow-md transition-colors duration-300">
      {title}
    </Button>
  );
};
