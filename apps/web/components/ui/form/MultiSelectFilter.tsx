import { classNames } from "@calcom/lib";
import {
  Dropdown,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuCheckboxItem,
} from "@calcom/ui";

export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  value: Option["value"][];
  onValueChange: (value: Option["value"][]) => void;
}

export function MultiSelectFilter({ label, options, value, onValueChange }: MultiSelectFilterProps) {
  return (
    <Dropdown>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={classNames(
            "radix-state-open:bg-gray-200 group flex cursor-default select-none appearance-none items-center rounded-full border border-gray-200 px-3 py-2 text-left outline-none hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
            value.length > 0 && "bg-white shadow-sm"
          )}>
          <span className="text-sm font-medium text-gray-600">{label}</span>
          {value.length > 0 ? <span className="ml-2 text-sm text-gray-500">{value.length}</span> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent alignOffset={-6} align="start">
          {options.map((option) => {
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onValueChange([...value, option.value]);
                  } else {
                    onValueChange(value.filter((v) => v !== option.value));
                  }
                }}
                onSelect={(e) => {
                  e.preventDefault();
                }}>
                {option.label}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </Dropdown>
  );
}
