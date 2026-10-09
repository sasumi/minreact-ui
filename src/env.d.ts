/// <reference types="vite/client" />

declare module "*.scss";

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/** lunar-javascript 未随包提供类型声明，这里按 TimePicker 用到的最小 API 面补齐 */
declare module "lunar-javascript" {
  /** 农历日期 */
  export class Lunar {
    /** 农历日，初一为 1 */
    getDay(): number;
    /** 农历月的汉字名，如「正」「腊」 */
    getMonthInChinese(): string;
    /** 农历日的汉字名，如「初一」 */
    getDayInChinese(): string;
    /** 当天的节气名，非节气日返回空字符串 */
    getJieQi(): string;
    /** 当天的农历节日名，如「春节」 */
    getFestivals(): string[];
  }

  /** 公历（阳历）日期 */
  export class Solar {
    /** 由 Date 构造 */
    static fromDate(date: Date): Solar;
    /** 转换为对应的农历日期 */
    getLunar(): Lunar;
    /** 当天的公历节日名 */
    getFestivals(): string[];
  }
}