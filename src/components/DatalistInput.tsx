import React, { useState, useEffect, useId, useRef, useImperativeHandle } from "react";
import { useLocalStorage } from "..";
import { Popover } from "./Popover";
import { ENTRY_TYPE_ITEM, Menu } from "./Menu";
import type { MenuEntry } from "./Menu";
import { namespace } from "./../styles/namespace";

export interface DataListOption {
    value: string;
    label?: string;
}

/**
 * 支持历史记录的输入框组件，用户可以输入内容并从下拉列表中选择历史记录或匹配的选项。
 */
export interface DataListInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSelect"> {
    options: (string | DataListOption)[];
    value?: string;
    type?: "text" | "search";
    onChange?: (value: string) => void;
    onSelect?: (value: string) => void;
    maxItems?: number;
}

/** 将 label 中与 query 匹配的部分用 <span class="matched"> 包裹，用于高亮 */
const highlightMatch = (label: string, query: string): React.ReactNode => {
    if (!query) {
        return label;
    }
    return label.split(new RegExp(`(${query})`, "gi")).map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="matched">
                {part}
            </span>
        ) : (
            part
        ),
    );
};

export const DataListInput: React.FC<DataListInputProps> = ({
    options,
    value: controlledValue,
    onChange,
    onSelect,
    maxItems = 8,
    type = "text",
    ...inputProps
}) => {
    const [internalValue, setInternalValue] = useState(controlledValue || "");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const listboxId = useId();
    const containerRef = useRef<HTMLDivElement>(null);

    // 统一受控与非受控状态
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // 标准化选项数据
    const normalizedOptions: DataListOption[] = options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt));

    // 展示全部选项（不按输入过滤），最多 maxItems 条
    const displayedOptions = normalizedOptions.slice(0, maxItems);

    // 用户输入的关键词，用于高亮匹配部分
    const matchQuery = currentValue.trim().toLowerCase();

    // 第一个匹配项的索引，用于滚动到视口内
    const firstMatchIndex = matchQuery ? displayedOptions.findIndex((opt) => (opt.label || opt.value).toLowerCase().includes(matchQuery)) : -1;

    const menuEntries: MenuEntry[] =
        displayedOptions.length > 0
            ? displayedOptions.map((opt, index) => {
                  const label = opt.label || opt.value;
                  return {
                      type: ENTRY_TYPE_ITEM,
                      value: opt.value,
                      label,
                      children: highlightMatch(label, matchQuery),
                      checked: index === highlightedIndex ? true : null,
                  };
              })
            : [
                  {
                      type: ENTRY_TYPE_ITEM,
                      value: "__empty__",
                      label: "暂无可用选项",
                      children: "暂无可用选项",
                      disabled: true,
                      checked: null,
                  },
              ];

    const handleOpenChange = (nextOpen: boolean) => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
            setHighlightedIndex(-1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleSelectOption = (optionValue: string) => {
        if (!isControlled) {
            setInternalValue(optionValue);
        }
        onChange?.(optionValue);
        onSelect?.(optionValue);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || displayedOptions.length === 0) {
            if (e.key === "ArrowDown") {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < displayedOptions.length - 1 ? prev + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : displayedOptions.length - 1));
                break;
            case "Enter":
                if (highlightedIndex >= 0 && highlightedIndex < displayedOptions.length) {
                    e.preventDefault();
                    handleSelectOption(displayedOptions[highlightedIndex].value);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // 打开下拉后，将第一个匹配项滚动到视口内
    useEffect(() => {
        if (!isOpen || firstMatchIndex < 0) {
            return;
        }

        const listbox = document.getElementById(listboxId);
        const items = listbox?.querySelectorAll<HTMLElement>(`.${namespace}-menu-item`);
        const target = items?.[firstMatchIndex];

        if (target) {
            target.scrollIntoView({ block: "nearest" });
        }
    }, [isOpen, firstMatchIndex, listboxId]);

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <input
                    type={type}
                    {...inputProps}
                    value={currentValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-haspopup="listbox"
                    role="combobox"
                />
            </Popover.Trigger>
            <Popover.Content id={listboxId} onCloseBy={(target) => !containerRef.current?.contains(target)}>
                <Menu items={menuEntries} showChecker={false}/>
            </Popover.Content>
        </Popover>
    );
};

/** 将指定值（默认当前输入值）写入历史记录 */
export interface HistoryInputHandle {
    commit: (value?: string) => void;
}

export const HistoryInput = ({
    value: controlledValue,
    onChange,
    onSelect,
    maxItems = 8,
    ref,
    ...inputProps
}: Omit<DataListInputProps, "options"> & { ref?: React.Ref<HistoryInputHandle> }) => {
    const [histories, setHistories] = useLocalStorage<string[]>("history-input-values", []);
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(controlledValue || "");

    useEffect(() => {
        if (isControlled) {
            setInternalValue(controlledValue || "");
        }
    }, [controlledValue, isControlled]);

    const currentValue = isControlled ? controlledValue || "" : internalValue;

    const commit = (nextValue: string) => {
        const normalizedValue = nextValue.trim();

        if (!normalizedValue) {
            return;
        }

        setHistories((previousHistories) => {
            const recentHistories = previousHistories.filter((history) => history !== normalizedValue);

            return [normalizedValue, ...recentHistories].slice(0, maxItems);
        });
    };

    // 记录历史改由外部调用：暴露 commitHistory，默认写入当前输入值
    useImperativeHandle(
        ref,
        () => ({
            commit: (value?: string) => commit(value ?? currentValue),
        }),
        [commit, currentValue],
    );

    const handleChange = (nextValue: string) => {
        if (!isControlled) {
            setInternalValue(nextValue);
        }
        onChange?.(nextValue);
    };

    const handleSelect = (nextValue: string) => {
        if (!isControlled) {
            setInternalValue(nextValue);
        }
        commit(nextValue);
        onSelect?.(nextValue);
    };

    return (
        <DataListInput
            value={currentValue}
            onChange={handleChange}
            onSelect={handleSelect}
            options={histories.slice(0, maxItems)}
            {...inputProps}
        />
    );
};
