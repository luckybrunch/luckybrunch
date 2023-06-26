import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";

import { Tag } from "./tag";

export interface OptionItem {
  label: string;
  value: number;
}

export interface ComboboxComponentProps {
  list: OptionItem[];
  selected: OptionItem[];
  setSelected: (value: OptionItem[]) => void;
}

function ComboboxComponent({ list, selected, setSelected }: ComboboxComponentProps) {
  const [query, setQuery] = useState("");

  const filteredList =
    query === "" ? list : list.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  // console.log("filteredList", filteredList);
  // console.log("selected", selected);

  return (
    <>
      {selected.length > 0 && <Tag selected={selected} setSelected={setSelected} />}
      <div className="relative z-10">
        <Combobox value={selected} onChange={setSelected} multiple>
          <div className="relative mt-1">
            <div className="dark:focus-within:ring-whitesm:text-sm dark:bg-darkgray-100 dark:border-darkgray-300 relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white bg-white text-left focus-within:border-0 focus-within:ring-2 focus-within:ring-neutral-800 hover:border-neutral-400">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={(list: OptionItem) => list.label}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}>
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredList.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredList.map((item) => (
                    <Combobox.Option
                      key={item.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? "dark:bg-darkgray-200 dark:text-darkgray-900 bg-gray-100 text-gray-900"
                            : "text-gray-900"
                        }`
                      }
                      value={item}>
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {item.label}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-teal-600" : "text-teal-600"
                              }`}>
                              <FiCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
    </>
  );
}

export default ComboboxComponent;
