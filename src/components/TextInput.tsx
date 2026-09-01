import { findOne } from "minutool";
import React, { useCallback, useEffect, useId, useImperativeHandle, useRef, useState, useMemo } from "react";
import { useLocalStorage } from "..";
import { highlightText } from "../utils";
import "./../styles/components/textinput.scss";
import { namespace } from "../styles/namespace";
import type { MenuItemData } from "./Menu";
import { Menu, MenuItemDataConvert } from "./Menu";
import { Popover } from "./Popover";

const CSS_NS = namespace + "-datalist-input";
const MATCHED_CLASS = CSS_NS + "-matched";

/**
 * 支持历史记录的输入框组件，用户可以输入内容并从下拉列表中选择历史记录或匹配的选项。
 */
export interface DataListInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSelect" | "value"> {
    options: (string | MenuItemData)[];
    onSelect?: (value: string) => void;
    value?: string;
    type?: "text" | "search" | "email" | "tel"; // 限制为 text、search、email 或 tel 类型
    panelExtension?: React.ReactNode; //面板扩展区域
    open?: boolean; // 受控：外部控制列表显隐
    onOpenChange?: (open: boolean) => void; // 列表显隐变化回调
}

/**
 * 代替 input[list] 的组件，支持自定义下拉列表内容和样式，适合搜索框和高频短文本场景
 * @param options 下拉列表选项，支持字符串或对象形式
 * @param value 受控输入值
 * @param inputProps 其他 input 属性
 */
export const DataListInput: React.FC<DataListInputProps> = ({
    options,
    value: controlledValue,
    type = "text", //默认类型为 text
    onSelect,
    panelExtension,
    open: controlledOpen,
    onOpenChange: onOpenChangeProp,
    ...inputProps
}: DataListInputProps) => {
    const [val, setVal] = useState(controlledValue || "");
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlledOpen = controlledOpen !== undefined;
    const isOpen = isControlledOpen ? controlledOpen : internalOpen;

    // 统一受控与非受控的显隐切换，同时通知外部
    const handleOpenChange = (next: boolean) => {
        if (!isControlledOpen) {
            setInternalOpen(next);
        }
        onOpenChangeProp?.(next);
    };

    const listboxId = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    // 统一受控与非受控状态
    const currentValue = controlledValue !== undefined ? controlledValue : val;

    // 用户输入的关键词，用于高亮匹配部分
    const matchQuery = currentValue.trim().toLowerCase();

    // 标准化选项数据
    const menuEntries: MenuItemData[] = useMemo(() => {
        return options
            .map((opt) => MenuItemDataConvert(opt))
            .map((item) => {
                item.label = highlightText(item.label, matchQuery, MATCHED_CLASS);
                return item;
            });
    }, [options, matchQuery]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        findOne(`#${listboxId} .${MATCHED_CLASS}`)?.scrollIntoView({ block: "nearest" });
    }, [isOpen, currentValue]);

    return (
        <Popover open={isOpen && menuEntries.length > 0} onOpenChange={handleOpenChange}>
            <Popover.Anchor asChild>
                <input
                    ref={inputRef}
                    type={type}
                    {...inputProps}
                    value={currentValue}
                    onFocus={(e) => {
                        handleOpenChange(true);
                        inputProps.onFocus?.(e as React.FocusEvent<HTMLInputElement, Element>);
                    }}
                    onClick={(e) => {
                        handleOpenChange(true);
                        inputProps.onClick?.(e);
                    }}
                    onInput={(e) => {
                        if (!isOpen) {
                            handleOpenChange(true);
                        }
                        setVal((e.target as HTMLInputElement).value);
                        inputProps.onInput?.(e);
                    }}
                    onKeyDown={(e) => {
                        if (isOpen && menuEntries.length > 0 && e.key === "Escape") {
                            handleOpenChange(false);
                        }
                        inputProps.onKeyDown?.(e);
                        return;
                    }}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    role="combobox"
                />
            </Popover.Anchor>
            <Popover.Content
                id={listboxId}
                className={CSS_NS + "-menu"}
                onCloseBy={(target) => {
                    return target !== inputRef.current;
                }}
            >
                <Menu
                    items={menuEntries}
                    onChange={(val) => {
                        setVal(val);
                        handleOpenChange(false);
                        onSelect?.(val);
                    }}
                />
                {panelExtension && <div className={CSS_NS + "-extension"}>{panelExtension}</div>}
            </Popover.Content>
        </Popover>
    );
};

/** 将指定值（默认当前输入值）写入历史记录 */
export interface HistoryInputHandle {
    commit: (value?: string) => void;
    remove: (value: string) => void;
    clear: () => void;
    open: () => void;
    close: () => void;
}

export const HistoryInput = ({
    value: controlledValue,
    maxItems = 20,
    ref,
    storeKey,
    onSelect,
    open: controlledOpen,
    onOpenChange: onOpenChangeProp,
    ...inputProps
}: {
    storeKey: string;
    maxItems?: number;
    ref?: React.Ref<HistoryInputHandle>;
    onSelect?: (value: string) => void;
} & Omit<DataListInputProps, "options">) => {
    const isControlled = controlledValue !== undefined;
    const [histories, setHistories] = useLocalStorage<string[]>(storeKey, []);
    const [val, setVal] = useState(controlledValue || "");
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlledOpen = controlledOpen !== undefined;
    const isOpen = isControlledOpen ? controlledOpen : internalOpen;

    // 统一受控与非受控的显隐切换，同时通知外部
    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!isControlledOpen) {
                setInternalOpen(next);
            }
            onOpenChangeProp?.(next);
        },
        [isControlledOpen, onOpenChangeProp],
    );

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
            remove: (value: string) => {
                setHistories((preHs) => preHs.filter((h) => h !== value));
            },
            clear: () => {
                setHistories([]);
            },
            open: () => handleOpenChange(true),
            close: () => handleOpenChange(false),
        }),
        [commit, currentValue, handleOpenChange],
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
            />
        );
        return item;
    });

    return (
        <DataListInput
            {...inputProps}
            value={isControlled ? controlledValue : undefined}
            open={isOpen}
            onOpenChange={handleOpenChange}
            onInput={(e) => {
                setVal((e.target as HTMLInputElement).value);
                inputProps.onInput?.(e);
            }}
            onSelect={onSelect}
            options={menuEntries}
        />
    );
};
