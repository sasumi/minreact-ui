import { ReactNode, useState } from "react";
import { reactNodeToString } from "../utils";
import "./../styles/common.module.scss";
import "./../styles/components/menu.scss";
import { namespace } from "./../styles/namespace";
import { AnyButton } from "./Button";
import { Popover } from "./Popover";

export const MENU_ENTRY_TYPE_DIVIDER = "divider";
export const MENU_ENTRY_TYPE_ITEM = "item";

export interface MenuItemData {
    type: typeof MENU_ENTRY_TYPE_ITEM; // 唯一标识类型，表示这是一个菜单项
    value: string; // 唯一标识值，通常用于选中和回调
    label: ReactNode; // 显示文本，默认使用 value

    disabled?: boolean; // 禁用状态，禁用的菜单项无法被选中
    title?: string; // 鼠标悬停时显示的提示文本，默认使用 label
    checked?: boolean | null; // null 表示不显示选中标记，true 显示选中，false 显示未选中
    extension?: React.ReactNode; // 扩展内容，显示在右侧
    onClick?: () => void; // 点击回调函数，点击菜单项时触发
}

export interface MenuDivider {
    type: typeof MENU_ENTRY_TYPE_DIVIDER;
    key?: string;
}

export type MenuEntry = MenuItemData | MenuDivider;

export interface MenuProps {
    items: MenuEntry[];
    value?: string;
    onChange?: (value: string) => void;
    showChecker?: boolean;
    _className?: string; //默认类名，可以覆盖
    className?: string; //额外自定义类名
}

/**
 * 统一将数据转换为 MenuItemData 类型
 * @param data 字符串、对象或 MenuItemData 类型
 * @returns MenuItemData 类型
 * @throws 如果数据类型无效，则抛出错误
 */
export const MenuItemDataConvert = (data: MenuItemData | Partial<MenuItemData> | string): MenuItemData => {
    if (typeof data === "string") {
        return {
            type: MENU_ENTRY_TYPE_ITEM,
            value: data,
            label: data,
        };
    }
    if (typeof data === "object" && data !== null && data.type === MENU_ENTRY_TYPE_ITEM) {
        return data as MenuItemData;
    }
    if (typeof data === "object" && data !== null) {
        return {
            type: MENU_ENTRY_TYPE_ITEM,
            value: data.value,
            label: data.label || data.value,
            title: data.title || data.label || data.value,
            ...data,
        } as MenuItemData;
    }
    throw new Error("MenuItemDataConvert: invalid data type");
};

const MenuImpl = ({ items, value, showChecker, _className = namespace + "-menu", className, onChange }: MenuProps) => {
    const [val, setVal] = useState(value);
    return (
        <div className={_className + (className ? " " + className : "")}>
            {items.map((item, index) => {
                if (item.type === MENU_ENTRY_TYPE_DIVIDER) {
                    return index !== 0 && items[index - 1].type !== MENU_ENTRY_TYPE_DIVIDER ? <MenuDivider key={item.key || index} /> : null;
                } else {
                    return (
                        <MenuItem
                            key={index}
                            {...item}
                            checked={showChecker ? item.value === val : null}
                            type={MENU_ENTRY_TYPE_ITEM}
                            onClick={() => {
                                if (item.disabled) {
                                    return;
                                }
                                setVal(item.value);
                                onChange?.(item.value);
                            }}
                        />
                    );
                }
            })}
        </div>
    );
};

const MenuDivider = () => {
    return <div className={namespace + "-menu-divider"} />;
};

const MenuItemIcon = ({ className }: { className?: string }) => {
    return <span className={namespace + "-menu-item-icon" + (className ? " " + className : "")}></span>;
};

const MenuItem = (itemData: MenuItemData) => {
    itemData = MenuItemDataConvert(itemData);
    return (
        <div
            className={namespace + "-menu-item"}
            key={itemData.value}
            title={itemData.title}
            aria-disabled={itemData.disabled}
            onClick={itemData.onClick}
            tabIndex={itemData.disabled ? -1 : 0}
        >
            {itemData.checked !== null && <MenuItemIcon className={itemData.checked ? namespace + "-menu-item-icon-checked" : ""} />}
            <span className={namespace + "-menu-item-content"}>{itemData.label}</span>
            {itemData.extension && <span className={namespace + "-menu-item-extension"}>{itemData.extension}</span>}
        </div>
    );
};

export const DropdownMenu = ({
    trigger,
    items,
    value,
    disabled,
    onChange,
    showChecker,
    hideOnClick = true,
}: {
    trigger: React.ReactNode;
    items: MenuEntry[];
    value?: string;
    disabled?: boolean;
    showChecker?: boolean;
    hideOnClick?: boolean;
    onChange?: (val: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger className={namespace + "-dropdown-menu-trigger"} aria-disabled={disabled}>
                {trigger}
            </Popover.Trigger>
            <Popover.Content className={namespace + "-dropdown-menu-content"}>
                <MenuImpl
                    items={items}
                    onChange={(val) => {
                        onChange?.(val);
                        if (hideOnClick) {
                            setOpen(false);
                        }
                    }}
                    value={value}
                    showChecker={showChecker}
                    _className={namespace + "-dropdown-menu"}
                />
            </Popover.Content>
        </Popover>
    );
};

/**
 * 组合框菜单组件，带搜索框
 * @param trigger 触发器组件
 * @param items 菜单项数组
 * @param value 当前选中值
 * @param disabled 是否禁用
 * @param showChecker 是否显示选中标记
 * @param onChange 选中值变化回调
 * @param hideOnClick 点击选项后是否关闭菜单，默认 true
 */
export const ComboboxMenu = ({
    trigger,
    items,
    value,
    disabled,
    showChecker = true,
    hideOnClick = true,
    placeholder = "搜索...",
    onChange,
}: {
    trigger: React.ReactNode;
    items: MenuEntry[];
    value?: string;
    disabled?: boolean;
    showChecker?: boolean;
    placeholder?: string;
    onChange?: (val: string) => void;
    hideOnClick?: boolean;
}) => {
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);

    const filteredItems = items.filter((item) => {
        if (item.type === MENU_ENTRY_TYPE_DIVIDER) {
            return true; // 保留分隔符
        } else {
            return reactNodeToString(item.label).toLowerCase().includes(searchText.toLowerCase());
        }
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger className={namespace + "-combobox-menu-trigger"} aria-disabled={disabled}>
                {trigger}
            </Popover.Trigger>
            <Popover.Content className={namespace + "-combobox-menu-content"}>
                <div className={namespace + "-combobox-menu-wrap"}>
                    <input
                        type="search"
                        className={namespace + "-combobox-menu-search"}
                        placeholder={placeholder}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <MenuImpl
                        items={filteredItems}
                        onChange={(val) => {
                            onChange?.(val);
                            if (hideOnClick) {
                                setSearchText(""); // 清空搜索框
                                setOpen(false); // 关闭 Popover
                            }
                        }}
                        value={value}
                        showChecker={showChecker}
                        _className={namespace + "-combobox-menu"}
                    />
                </div>
            </Popover.Content>
        </Popover>
    );
};

export const Menu = Object.assign(MenuImpl, {
    Item: MenuItem,
    Divider: MenuDivider,
    Icon: MenuItemIcon,
});

/**
 * Select 选择组件，基于 Popover 实现
 */
export const Select = ({
    items,
    name,
    triggerClassName,
    disabled = false,
    value,
    placeholder = "请选择",
    onChange,
}: {
    items: MenuEntry[];
    name?: string;
    value?: any;
    triggerClassName?: string;
    disabled?: boolean;
    placeholder?: string;
    onChange?: (value: any) => void;
}) => {
    const [val, setVal] = useState(value);

    const trigger = (
        <AnyButton disabled={disabled} className={triggerClassName}>
            {val !== undefined && val !== null
                ? (
                      items.find((item) => {
                          return item.type === MENU_ENTRY_TYPE_ITEM && item.value === val;
                      }) as MenuItemData
                  )?.label
                : placeholder}
            {name && <input type="hidden" name={name} value={val ?? ""} />}
        </AnyButton>
    );

    return (
        <DropdownMenu
            items={items}
            value={val}
            onChange={(v) => {
                setVal(v);
                onChange?.(v);
            }}
            disabled={disabled}
            trigger={trigger}
        />
    );
};
