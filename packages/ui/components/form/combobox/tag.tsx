import { FiX } from "react-icons/fi";

import { OptionItem } from "./Combobox";

export interface TagProps {
  selected: OptionItem[];
  setSelected: (value: OptionItem[]) => void;
}

export function Tag({ selected, setSelected }: TagProps) {
  const handleRemoveTag = (tag: OptionItem) => {
    const updatedTags = selected.filter((item) => item !== tag);
    setSelected(updatedTags);
  };

  return (
    <>
      <div className="flex w-full justify-end">
        {selected.length > 0 && (
          <button className="rounded-md border border-gray-300 px-1 py-1" onClick={() => setSelected([])}>
            <FiX className="h-4 h-4 w-4 self-center text-gray-700" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {selected.map((tag) => (
          <div
            key={tag.value}
            className="dark:bg-darkgray-200 dark:text-darkgray-900 flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
            <p>{tag.label}</p>
            <button onClick={() => handleRemoveTag(tag)}>
              <FiX className="ml-2 h-4 w-4 self-center text-gray-700" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
