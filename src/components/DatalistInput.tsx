import React, { useState, useEffect, useId } from 'react';
import { useLocalStorage } from '..';
import { Popover } from './Popover';
import { ENTRY_TYPE_ITEM, Menu } from './Menu';
import type { MenuEntry } from './Menu';
import { namespace } from './../styles/namespace';

export interface DataListOption {
    value: string;
    label?: string;
}

/**
 * 支持历史记录的输入框组件，用户可以输入内容并从下拉列表中选择历史记录或匹配的选项。
 */
export interface DataListInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSelect'> {
    options: (string | DataListOption)[];
    value?: string;
    inputType?: 'text' | 'search';
    onChange?: (value: string) => void;
    onSelect?: (value: string) => void;
    maxItems?: number;
}

export const DataListInput: React.FC<DataListInputProps> = ({
    options,
    value: controlledValue,
    onChange,
    onSelect,
    maxItems = 8,
    placeholder = '请输入...',
    className = '',
    inputType = 'text',
    ...inputProps
}) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const listboxId = useId();

    // 统一受控与非受控状态
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // 标准化选项数据
    const normalizedOptions: DataListOption[] = options.map((opt) =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    // 根据当前输入内容进行过滤
    const filteredOptions = normalizedOptions
        .filter((opt) =>
            opt.value.toLowerCase().includes(currentValue.toLowerCase())
        )
        .slice(0, maxItems);

    const inputStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box',
        padding: '0.72rem 0.9rem',
        borderRadius: '0.9rem',
        border: '1px solid rgba(15, 23, 42, 0.16)',
        backgroundColor: '#fff',
        color: '#0f172a',
        outline: 'none',
        transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        ...inputProps.style,
    };

    const menuEntries: MenuEntry[] = filteredOptions.length > 0
        ? filteredOptions.map((opt, index) => ({
            type: ENTRY_TYPE_ITEM,
            value: opt.value,
            label: opt.label || opt.value,
            children: opt.label || opt.value,
            checked: index === highlightedIndex ? true : null,
        }))
        : [{
            type: ENTRY_TYPE_ITEM,
            value: '__empty__',
            label: currentValue.trim() ? '没有匹配项' : '暂无可用选项',
            children: currentValue.trim() ? '没有匹配项' : '暂无可用选项',
            disabled: true,
            checked: null,
        }];

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
        if (!isOpen || filteredOptions.length === 0) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    e.preventDefault();
                    handleSelectOption(filteredOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Anchor asChild>
                <div
                    className={`datalist-input-container ${className}`}
                    style={{ position: 'relative', display: 'inline-block', width: '100%' }}
                >
                    <input
                        {...inputProps}
                        type={inputType}
                        value={currentValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoComplete={inputProps.autoComplete || 'off'}
                        spellCheck={inputProps.spellCheck ?? false}
                        aria-autocomplete="list"
                        aria-expanded={isOpen}
                        aria-controls={listboxId}
                        aria-haspopup="listbox"
                        role="combobox"
                        style={inputStyle}
                    />
                </div>
            </Popover.Anchor>

            <Popover.Content id={listboxId} sideOffset={8} align="start" className="datalist-input-popover">
                <Menu
                    items={menuEntries}
                    showChecker={false}
                    _className={`${namespace}-menu menu datalist-input-menu`}
                />
            </Popover.Content>
        </Popover>
    );
};

export const HistoryInput = ({
    value: controlledValue,
    onChange,
    onSelect,
    maxItems = 8,
    placeholder = '请输入...',
    className = '',
    inputType = 'text',
    onBlur,
    ...inputProps
}: Omit<DataListInputProps, 'options'>) => {
    const [histories, setHistories] = useLocalStorage<string[]>('history-input-values', []);
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(controlledValue || '');

    useEffect(() => {
        if (isControlled) {
            setInternalValue(controlledValue || '');
        }
    }, [controlledValue, isControlled]);

    const currentValue = isControlled ? controlledValue || '' : internalValue;

    const commitHistory = (nextValue: string) => {
        const normalizedValue = nextValue.trim();

        if (!normalizedValue) {
            return;
        }

        setHistories((previousHistories) => {
            const recentHistories = previousHistories.filter(
                (history) => history !== normalizedValue
            );

            return [normalizedValue, ...recentHistories].slice(0, maxItems);
        });
    };

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

        commitHistory(nextValue);
        onSelect?.(nextValue);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        commitHistory(currentValue);
    };

    return <DataListInput
        value={currentValue}
        onChange={handleChange}
        onSelect={handleSelect}
        options={histories.slice(0, maxItems)}
        placeholder={placeholder}
        className={className}
        inputType={inputType}
        onBlur={handleBlur}
        {...inputProps}
    />;
}
