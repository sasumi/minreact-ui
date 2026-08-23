import "@/styles/common.module.scss";
import "@/styles/components/menu.scss";
import { namespace } from "@/styles/namespace";
import { Popover } from "./Popover";
import { useState } from "react";

export const ENTRY_TYPE_DIVIDER = "divider";
export const ENTRY_TYPE_ITEM = "item";

export interface MenuItemData {
    type: typeof ENTRY_TYPE_ITEM;
    value: string;
    label: string;
    disabled?: boolean;
    title?: string;
    checked?: boolean | null;
    children?: React.ReactNode;
}

export interface MenuDivider {
    type: typeof ENTRY_TYPE_DIVIDER;
    key?: string;
}

type MenuEntry = MenuItemData | MenuDivider;

interface MenuProps {
    items: MenuEntry[];
    value?: string;
    onChange?: (value: string) => void;
    showChecker?: boolean;
    _className?: string; //默认类名，可以覆盖
}

const MenuImpl = ({ items, value, showChecker, _className = namespace + "-menu", onChange }: MenuProps) => {
    const [val, setVal] = useState(value);
    return (
        <div className={_className}>
            {items.map((item, index) => {
                if (item.type === ENTRY_TYPE_DIVIDER) {
                    return index !== 0 && items[index - 1].type !== ENTRY_TYPE_DIVIDER ? <MenuDivider key={item.key || index} /> : null;
                } else {
                    return (
                        <MenuItem
                            key={item.value}
                            {...item}
                            checked={showChecker ? item.value === val : item.checked}
                            type={ENTRY_TYPE_ITEM}
                            onClick={() => {
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

const MenuItem = ({ value, disabled, title, checked = null, children, onClick }: MenuItemData & { onClick?: () => void }) => {
    return (
        <div
            className={namespace + "-menu-item"}
            key={value}
            title={title || (typeof children === "string" ? (children as string) : undefined)}
            aria-disabled={disabled}
            onClick={onClick}
            tabIndex={disabled ? -1 : 0}
        >
            {checked !== null && <MenuItemIcon className={checked ? namespace + "-menu-item-icon-checked" : ""} />}
            <span className={namespace + "-menu-item-content"}>{children || title}</span>
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
            <Popover.Trigger className={namespace + "-dropdown-menu-trigger"} aria-disabled={disabled}>{trigger}</Popover.Trigger>
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

export const ComboboxMenu = ({
    trigger,
    items,
    value,
    disabled,
    showChecker = true,
    hideOnClick = true,
    onChange,
}: {
    trigger: React.ReactNode;
    items: MenuEntry[];
    value?: string;
    disabled?: boolean;
    showChecker?: boolean;
    onChange?: (val: string) => void;
    hideOnClick?: boolean;
}) => {
    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);

    const filteredItems = items.filter((item) => {
        if (item.type === ENTRY_TYPE_DIVIDER) {
            return true; // 保留分隔符
        } else {
            return item.label.toLowerCase().includes(searchText.toLowerCase());
        }
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger className={namespace + "-combobox-menu-trigger"} aria-disabled={disabled}>{trigger}</Popover.Trigger>
            <Popover.Content className={namespace + "-combobox-menu-content"}>
                <div className={namespace + "-combobox-menu-wrap"}>
                    <input type="search" className={namespace + "-combobox-menu-search"} value={searchText} onChange={(e) => setSearchText(e.target.value)} />

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
