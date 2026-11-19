import { useState, type CSSProperties } from "react";
import "./../styles/common.module.scss";
import "./../styles/components/colorpicker.scss";
import { namespace } from "./../styles/namespace";
import { COLOR_PALETTES, type ColorPalette } from "./../data/colorPalettes";
import { Select } from "./Menu";
import { Popover } from "./Popover";

const CSS_NS = namespace;
const ALPHA_MIN = 0;
const ALPHA_MAX = 100;

/** RGBA 颜色：r/g/b 为 0-255，a 为 0-1 */
interface Rgba {
    r: number; // 红
    g: number; // 绿
    b: number; // 蓝
    a: number; // 透明度
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");

const isRgba = (value: Rgba) => ![value.r, value.g, value.b, value.a].some((item) => Number.isNaN(item));

/** 解析颜色：支持 #rgb / #rgba / #rrggbb / #rrggbbaa / rgb() / rgba() / transparent */
const parseColor = (input: string): Rgba | null => {
    const text = (input || "").trim().toLowerCase();
    if (!text) {
        return null;
    }
    if (text === "transparent") {
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    const hexMatch = text.match(/^#([0-9a-f]{3,8})$/);
    if (hexMatch) {
        const matched = hexMatch[1];
        const hex =
            matched.length === 3 || matched.length === 4
                ? matched
                      .split("")
                      .map((char) => char + char)
                      .join("")
                : matched;
        if (hex.length !== 6 && hex.length !== 8) {
            return null;
        }
        const channel = (index: number) => parseInt(hex.slice(index, index + 2), 16);
        return { r: channel(0), g: channel(2), b: channel(4), a: hex.length === 8 ? channel(6) / 255 : 1 };
    }

    const rgbMatch = text.match(/^rgba?\(([^)]+)\)$/);
    if (!rgbMatch) {
        return null;
    }
    const parts = rgbMatch[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) {
        return null;
    }
    const percent = (raw: string) => raw.endsWith("%");
    const channel = (raw: string) => clamp(parseFloat(raw), 0, percent(raw) ? 100 : 255) * (percent(raw) ? 2.55 : 1);
    const alphaPart = parts[3];
    const alpha = alphaPart === undefined ? 1 : percent(alphaPart) ? clamp(parseFloat(alphaPart), 0, 100) / 100 : clamp(parseFloat(alphaPart), 0, 1);
    const color = {
        r: Math.round(channel(parts[0])),
        g: Math.round(channel(parts[1])),
        b: Math.round(channel(parts[2])),
        a: alpha,
    };
    return isRgba(color) ? color : null;
};

/** 输出颜色：不透明时 6 位 HEX，带透明度时 8 位 HEX */
const formatHex = ({ r, g, b, a }: Rgba, withAlpha: boolean): string => {
    const alpha = Math.round(clamp(a, 0, 1) * 255);
    const rgb = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return withAlpha && alpha < 255 ? `${rgb}${toHex(alpha)}` : rgb;
};

const toCssColor = ({ r, g, b, a }: Rgba) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${clamp(a, 0, 1)})`;

/** 清洗输入的 HEX：只保留合法字符，最多 6 位（支持透明度时 8 位） */
const cleanHex = (raw: string, allowAlpha: boolean): string =>
    raw
        .replace(/#/g, "")
        .replace(/[^0-9a-fA-F]/g, "")
        .slice(0, allowAlpha ? 8 : 6);

/** 标准化输入的 HEX：3 位简写补全成 6 位，4 位简写补全成 8 位 */
const normalizeHex = (raw: string, allowAlpha: boolean): string => {
    const cleaned = cleanHex(raw, allowAlpha);
    return cleaned.length === 3 || (allowAlpha && cleaned.length === 4)
        ? cleaned
              .split("")
              .map((char) => char + char)
              .join("")
        : cleaned;
};

/** HEX 输入框展示值：支持透明度时固定 8 位，否则 6 位 */
const formatInputHex = ({ r, g, b, a }: Rgba, allowAlpha: boolean): string => {
    const rgb = `${toHex(r)}${toHex(g)}${toHex(b)}`;
    return allowAlpha ? `${rgb}${toHex(clamp(a, 0, 1) * 255)}` : rgb;
};

/** 颜色值是否自带透明度通道（#rgba / #rrggbbaa / rgba() / transparent） */
const hasAlphaColor = (input: string): boolean => {
    const text = input.trim().toLowerCase();
    if (text === "transparent") {
        return true;
    }
    if (/^#([0-9a-f]{4}|[0-9a-f]{8})$/.test(text)) {
        return true;
    }
    const rgbaMatch = text.match(/^rgba\(([^)]+)\)$/);
    return Boolean(rgbaMatch && rgbaMatch[1].split(/[\s,/]+/).filter(Boolean).length >= 4);
};

/** HEX 输入框：合法值才回写，非法输入失焦后还原 */
const HexInput = ({
    color,
    allowAlpha,
    disabled,
    onChange,
}: {
    color: Rgba | null; // 当前颜色
    allowAlpha: boolean; // 是否展示透明度
    disabled?: boolean; // 是否禁用
    onChange: (rgb: string) => void; // 输入合法值后回写
}) => {
    const current = color ? formatInputHex(color, allowAlpha) : "";
    const [text, setText] = useState(current);
    const [synced, setSynced] = useState(current);

    // 外部颜色变化时（如点选色板、拖动透明度）同步输入框内容
    if (synced !== current) {
        setSynced(current);
        setText(current);
    }

    const commit = (raw: string) => {
        const cleaned = normalizeHex(raw, allowAlpha);
        // 支持透明度时，6 位输入沿用当前透明度（未设置时按不透明处理）
        const hex = allowAlpha && cleaned.length === 6 ? `${cleaned}${toHex((color?.a ?? 1) * 255)}` : cleaned;
        if (hex.length !== (allowAlpha ? 8 : 6)) {
            setText(current);
            return;
        }
        setText(hex);
        onChange(`#${hex}`);
    };

    return (
        <label className={`${CSS_NS}-color-hex`}>
            <span className={`${CSS_NS}-color-hex-prefix`}>#</span>
            <input
                className={`${CSS_NS}-color-hex-input`}
                value={text}
                placeholder="HEX"
                maxLength={allowAlpha ? 9 : 7}
                disabled={disabled}
                aria-label="颜色 HEX 值"
                onChange={(event) => {
                    const raw = event.target.value;
                    setText(raw);
                    const hex = cleanHex(raw, allowAlpha);
                    if (hex.length === (allowAlpha ? 8 : 6)) {
                        onChange(`#${hex}`);
                    }
                }}
                onBlur={(event) => commit(event.target.value)}
            />
        </label>
    );
};

interface ColorPanelProps {
    color: Rgba | null; // 当前颜色，null 表示未设置
    hasValue: boolean; // 是否已设置颜色（含无法解析的值）
    fallback: Rgba; // 未设置时的初始色
    palettes: ColorPalette[]; // 调色板
    allowEmpty: boolean; // 是否允许清空
    allowAlpha: boolean; // 是否显示透明度
    disabled?: boolean; // 是否禁用
    onChange: (value: string) => void; // 颜色变化（清空时为 ""）
}

/** 颜色面板：取色器 + HEX + 透明度 + 调色板 */
const ColorPanel = ({ color, hasValue, fallback, palettes, allowEmpty, allowAlpha, disabled, onChange }: ColorPanelProps) => {
    const [paletteKey, setPaletteKey] = useState(palettes[0]?.key ?? "");
    const palette = palettes.find((item) => item.key === paletteKey) ?? palettes[0];
    const base = color ?? fallback;
    const alpha = color?.a ?? 1;
    const currentHex = color ? formatHex(color, false) : "";

    const emit = (next: Rgba) => onChange(formatHex({ ...next, a: allowAlpha ? next.a : 1 }, true));
    const pickRgb = (rgb: string) => {
        const parsed = parseColor(rgb);
        if (parsed) {
            // 输入值自带透明度时沿用输入，否则保留当前透明度
            emit({ ...parsed, a: hasAlphaColor(rgb) ? parsed.a : alpha });
        }
    };

    return (
        <div className={`${CSS_NS}-color-panel`}>
            <div className={`${CSS_NS}-color-panel-title`}>自定义</div>
            <div className={`${CSS_NS}-color-custom`}>
                <label className={`${CSS_NS}-color-native`} title="点击选择颜色">
                    <span
                        className={`${CSS_NS}-color-native-fill${color ? "" : " is-empty"}`}
                        style={color ? { background: toCssColor(color) } : undefined}
                    />
                    <input
                        type="color"
                        value={formatHex(base, false)}
                        disabled={disabled}
                        aria-label="取色"
                        onChange={(event) => pickRgb(event.target.value)}
                    />
                </label>
                <HexInput color={color} allowAlpha={allowAlpha} disabled={disabled} onChange={pickRgb} />
                {allowEmpty && (
                    <button
                        className={`${CSS_NS}-color-clear`}
                        type="button"
                        title="清空"
                        aria-label="清空"
                        disabled={disabled || !hasValue}
                        onClick={() => onChange("")}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 7h16" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                            <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                )}
            </div>
            {allowAlpha && (
                <label className={`${CSS_NS}-color-alpha`}>
                    <span className={`${CSS_NS}-color-alpha-label`}>透明度</span>
                    <input
                        className={`${CSS_NS}-color-alpha-range`}
                        type="range"
                        min={ALPHA_MIN}
                        max={ALPHA_MAX}
                        step={1}
                        value={Math.round(alpha * 100)}
                        disabled={disabled}
                        aria-label="透明度"
                        style={{ [`--${CSS_NS}-color-alpha`]: toCssColor({ ...base, a: 1 }) } as CSSProperties}
                        onChange={(event) => emit({ ...base, a: Number(event.target.value) / 100 })}
                    />
                    <span className={`${CSS_NS}-color-alpha-value`}>{Math.round(alpha * 100)}%</span>
                </label>
            )}
            {palette && (
                <>
                    <div className={`${CSS_NS}-color-palette-head`}>
                        <Select
                            items={palettes.map((item) => ({ value: item.key, label: item.label }))}
                            value={palette.key}
                            disabled={disabled}
                            triggerClassName={`${CSS_NS}-color-palette-select`}
                            onChange={(value) => typeof value === "string" && setPaletteKey(value)}
                        />
                    </div>
                    <div
                        className={`${CSS_NS}-color-swatches${palette.columnSize ? " is-columns" : ""}`}
                        style={
                            palette.columnSize ? { gridTemplateRows: `repeat(${palette.columnSize}, var(--${CSS_NS}-color-picker-swatch-size))` } : undefined
                        }
                    >
                        {palette.colors.map((item, index) => (
                            <button
                                key={`${palette.key}-${item}-${index}`}
                                className={`${CSS_NS}-color-swatch${currentHex === item.toLowerCase() ? " is-active" : ""}`}
                                type="button"
                                style={{ background: item }}
                                title={palette.names?.[index] ? `${palette.names[index]} · ${item}` : item}
                                disabled={disabled}
                                onClick={() => pickRgb(item)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export interface ColorPickerProps {
    value: string; // 当前颜色，空字符串表示未设置
    onChange: (value: string) => void; // 颜色变化回调，清空时为 ""
    fallback?: string; // 未设置时的初始色，默认 #ffffff
    allowEmpty?: boolean; // 是否允许清空，默认 true
    allowAlpha?: boolean; // 是否支持透明度，默认 true
    emptyLabel?: string; // 清空按钮提示文案，默认 "默认"
    palettes?: ColorPalette[]; // 自定义调色板，默认使用内置调色板
    title?: string; // 触发器提示文案
    className?: string; // 触发器附加类名
    disabled?: boolean; // 是否禁用
}

/**
 * 颜色选择器：色块触发器 + 弹层面板，支持透明度（HEX8）与空值
 */
export const ColorPicker = ({
    value,
    onChange,
    fallback = "#ffffff",
    allowEmpty = true,
    allowAlpha = false,
    palettes = COLOR_PALETTES,
    title,
    className,
    disabled = false,
}: ColorPickerProps) => {
    const color = parseColor(value);
    const fallbackColor = parseColor(fallback) ?? { r: 255, g: 255, b: 255, a: 1 };
    const tip = title ?? (color ? formatHex(color, allowAlpha) : allowEmpty ? "未设置" : formatHex(fallbackColor, allowAlpha));

    return (
        <Popover disabled={disabled}>
            <Popover.Trigger>
                <button
                    className={`${CSS_NS}-color-picker-trigger${className ? " " + className : ""}`}
                    type="button"
                    title={tip}
                    aria-label={tip}
                    disabled={disabled}
                >
                    <span className={`${CSS_NS}-color-picker-swatch${color ? "" : " is-empty"}`}>
                        {color && <span className={`${CSS_NS}-color-picker-swatch-fill`} style={{ background: toCssColor(color) }} />}
                    </span>
                    <svg className={`${CSS_NS}-color-picker-caret`} viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Content className={`${CSS_NS}-color-popover`}>
                <ColorPanel
                    color={color}
                    hasValue={Boolean(value)}
                    fallback={fallbackColor}
                    palettes={palettes}
                    allowEmpty={allowEmpty}
                    allowAlpha={allowAlpha}
                    disabled={disabled}
                    onChange={onChange}
                />
            </Popover.Content>
        </Popover>
    );
};
