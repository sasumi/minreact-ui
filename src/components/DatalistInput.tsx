import { findOne } from "minutool";
import React, { useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { useLocalStorage } from "..";
import { highlightText } from "../utils";
import "./../styles/components/datalistinput.scss";
import { namespace } from "./../styles/namespace";
import type { MenuItemData } from "./Menu";
import { Menu, MenuItemDataConvert } from "./Menu";
import { Popover } from "./Popover";

export interface DataListOption {
    value: string;
    label?: string;
}

const MATCHED_CLASS = namespace + "-datalist-input-matched";

/**
 * 支持历史记录的输入框组件，用户可以输入内容并从下拉列表中选择历史记录或匹配的选项。
 */
export interface DataListInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    options: (string | DataListOption)[];
    value?: string;
    type?: "text" | "search";
}

/**
 * 代替 input[list] 的组件，支持自定义下拉列表内容和样式，适合搜索框和高频短文本场景
 * @param options 下拉列表选项，支持字符串或对象形式
 * @param value 受控输入值
 * @param inputProps 其他 input 属性
 */
export const DataListInput: React.FC<DataListInputProps> = ({ options, value: controlledValue, ...inputProps }) => {
    const [val, setVal] = useState(controlledValue || "");
    const [isOpen, setIsOpen] = useState(false);
    const listboxId = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    // 统一受控与非受控状态
    const currentValue = controlledValue !== undefined ? controlledValue : val;

    // 用户输入的关键词，用于高亮匹配部分
    const matchQuery = currentValue.trim().toLowerCase();

    // 标准化选项数据
    const menuEntries: MenuItemData[] = options
        .map((opt) => MenuItemDataConvert(opt))
        .map((item) => {
            item.children = highlightText(item.label || item.value, matchQuery, MATCHED_CLASS);
            return item;
        });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || menuEntries.length === 0) {
            return;
        }
        if (e.key === "Escape") {
            setIsOpen(false);
            return;
        }
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        findOne(`#${listboxId} .${MATCHED_CLASS}`)?.scrollIntoView({ block: "nearest" });
    }, [isOpen, currentValue]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Anchor asChild>
                <input
                    ref={inputRef}
                    {...{ type: "text", ...inputProps }}
                    value={currentValue}
                    onFocus={() => {
                        setIsOpen(true);
                    }}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                    onInput={(e) => {
                        setVal((e.target as HTMLInputElement).value);
                        if (!isOpen) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                />
            </Popover.Anchor>
            <Popover.Content
                id={listboxId}
                onCloseBy={(target) => {
                    return target !== inputRef.current;
                }}
            >
                <Menu
                    items={menuEntries}
                    onChange={(val) => {
                        setVal(val);
                        setIsOpen(false);
                    }}
                />
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
    maxItems = 8,
    ref,
    saveKey = "history-input-values",
    ...inputProps
}: {
    maxItems?: number;
    ref?: React.Ref<HistoryInputHandle>;
    saveKey?: string;
} & Omit<DataListInputProps, "options">) => {
    const isControlled = controlledValue !== undefined;
    const [histories, setHistories] = useLocalStorage<string[]>(saveKey, []);
    const [val, setVal] = useState(controlledValue || "");

    useEffect(() => {
        if (isControlled) {
            setVal(controlledValue || "");
        }
    }, [controlledValue, isControlled]);

    const currentValue = isControlled ? controlledValue || "" : val;

    const commit = (nextValue: string) => {
        const val = nextValue.trim();
        if (!val) {
            return;
        }
        setHistories((preHs) => {
            const recentHistories = preHs.filter((history) => history !== val);
            return [val, ...recentHistories].slice(0, maxItems);
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

    const menuEntries: MenuItemData[] = histories.map((history) => {
        const item = MenuItemDataConvert(history);
        item.extension = (
            <span
                className={namespace + "-datalist-input-history-delete"}
                onClick={(e) => {
                    e.stopPropagation();
                    setHistories((preHs) => preHs.filter((h) => h !== history));
                }}
            >
                ×
            </span>
        );
        return item;
    });

    return <DataListInput value={currentValue} options={menuEntries} {...inputProps} />;
};
