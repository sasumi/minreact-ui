import { useEffect, useMemo, useState } from "react";
import holidays from "../assets/holiday.json";

/** 节假日配置项，对应 holiday.json 里的一条数据 */
export interface HolidayConfigItem {
    /** 假期名称，如「春节」 */
    name: string;
    /** 假期开始日期，格式 YYYY-MM-DD */
    startDate: string;
    /** 假期结束日期，格式 YYYY-MM-DD */
    endDate: string;
    /** 节日当天，缺省时取 startDate；当天显示 name，假期内其余日期显示放假标记 */
    date?: string;
    /** 调休上班日，格式 YYYY-MM-DD，显示调休标记 */
    workdays?: string[];
    /** 假期说明，仅作数据存档 */
    description?: string;
}

/** 内置的法定节假日数据（src/assets/holiday.json，定期更新），holiday 传 true 时使用 */
const BUILT_IN_HOLIDAYS: HolidayConfigItem[] = holidays;

/** 农历模块的类型，只在模块内部使用 */
type LunarModule = typeof import("lunar-javascript");

/** 模块级缓存，多个面板共用一次加载；失败时清空以便下次重试 */
let lunarModulePromise: Promise<LunarModule> | null = null;

/** 按需加载 lunar-javascript，未启用农历时不会请求这个 chunk */
const loadLunarModule = () => {
    if (!lunarModulePromise) {
        lunarModulePromise = import("lunar-javascript").catch((error) => {
            lunarModulePromise = null;
            throw error;
        });
    }
    return lunarModulePromise;
};

/** 启用时异步加载农历模块，返回 null 表示尚未就绪或加载失败 */
const useLunarModule = (enabled: boolean): LunarModule | null => {
    const [module, setModule] = useState<LunarModule | null>(null);
    useEffect(() => {
        if (!enabled || module) {
            return;
        }
        let alive = true;
        loadLunarModule().then(
            (loaded) => {
                if (alive) {
                    setModule(loaded);
                }
            },
            () => undefined, // 加载失败时静默降级为不显示农历
        );
        return () => {
            alive = false;
        };
    }, [enabled, module]);
    return enabled ? module : null;
};

/** 补零到两位 */
const pad2 = (value: number) => String(value).padStart(2, "0");

/** 日期键，格式 YYYY-MM-DD */
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** 解析 YYYY-MM-DD；手动构造本地时间，避免 new Date(string) 的时区偏移 */
const parseDateKey = (key: string) => {
    const [year, month, date] = key.split("-").map(Number);
    return new Date(year, month - 1, date);
};

/** 日期下方的附加信息，优先级：节假日 > 节气 > 农历 */
export interface CalendarDayInfo {
    /** 展示文本 */
    text: string;
    /** 类别，仅用于配色 */
    kind: "holiday" | "workday" | "term" | "lunar";
}

/** 把节假日配置摊平成「日期 → 展示信息」映射，键为 YYYY-MM-DD */
const buildHolidayMap = (items: HolidayConfigItem[], holidayText: string, workdayText: string) => {
    const map = new Map<string, CalendarDayInfo>();
    for (const item of items) {
        const festivalDate = item.date ?? item.startDate;
        const endTime = parseDateKey(item.endDate).getTime();
        for (const cursor = parseDateKey(item.startDate); cursor.getTime() <= endTime; cursor.setDate(cursor.getDate() + 1)) {
            const key = toDateKey(cursor);
            map.set(key, key === festivalDate ? { text: item.name, kind: "holiday" } : { text: holidayText, kind: "holiday" });
        }
        // 调休上班日写在假期之后，保证调休标记不被假期区间覆盖
        for (const workday of item.workdays ?? []) {
            map.set(workday, { text: workdayText, kind: "workday" });
        }
    }
    return map;
};

/**
 * 取某天的节气或农历文本
 * @param date 待查询的日期
 * @param module 农历模块，未就绪或加载失败时为 null
 * @param solarTerm 是否启用节气
 * @param showLunar 是否启用农历
 * @returns 节气优先于农历；两个开关都关闭或都没有可显示内容时返回 null
 */
const getLunarInfo = (date: Date, module: LunarModule | null, solarTerm: boolean, showLunar: boolean): CalendarDayInfo | null => {
    if (!module) {
        return null;
    }
    const day = module.Solar.fromDate(date).getLunar();
    if (solarTerm) {
        const jieQi = day.getJieQi();
        if (jieQi) {
            return { text: jieQi, kind: "term" };
        }
    }
    if (!showLunar) {
        return null;
    }
    const [festival] = day.getFestivals();
    if (festival) {
        return { text: festival, kind: "lunar" };
    }
    // 农历初一显示月份（如「正月」），其余显示日期（如「初二」）
    return { text: day.getDay() === 1 ? `${day.getMonthInChinese()}月` : day.getDayInChinese(), kind: "lunar" };
};

/** 日历附加信息查询选项 */
export interface CalendarDayInfoOptions {
    /** 是否显示农历（含农历节日），默认 false；启用时按需加载 lunar-javascript */
    lunar?: boolean;
    /** 是否显示节气，默认 false；与 lunar 同时开启时优先显示节气 */
    solarTerm?: boolean;
    /** 节假日数据：传 true 使用内置的 holiday.json（会定期更新），传数组使用自定义数据，默认不启用 */
    holiday?: boolean | HolidayConfigItem[];
    /** 放假标记文案，默认「休」 */
    holidayText?: string;
    /** 调休上班标记文案，默认「补」 */
    workdayText?: string;
}

/**
 * 批量查询若干天的日历附加信息，规则与日期面板一致：节假日 > 节气 > 农历
 * @param dates 待查询的日期，数组里的空值直接返回 null
 * @param options 显示开关
 * @returns 与 dates 等长的数组，对应日期没有可显示内容时该位为 null
 */
export const useCalendarDayInfo = (
    dates: (Date | null | undefined)[],
    options: CalendarDayInfoOptions = {}
): (CalendarDayInfo | null)[] => {
    const { lunar = false, solarTerm = false, holiday = false, holidayText = "休", workdayText = "补" } = options;
    // 农历与节气共用 lunar-javascript，任一开启才按需加载，未启用时不会请求对应 chunk
    const lunarModule = useLunarModule(lunar || solarTerm);
    const holidayItems = holiday === true ? BUILT_IN_HOLIDAYS : holiday || null;
    const holidayMap = useMemo(
        () => (holidayItems ? buildHolidayMap(holidayItems, holidayText, workdayText) : null),
        [holidayItems, holidayText, workdayText]
    );
    if (!holidayMap && !lunarModule) {
        return dates.map(() => null);
    }
    return dates.map((date) =>
        date ? (holidayMap?.get(toDateKey(date)) ?? getLunarInfo(date, lunarModule, solarTerm, lunar)) : null
    );
};
