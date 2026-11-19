/** 颜色调色板：主题色按列（同一色系）展示，其余按 10 列平铺 */
export interface ColorPalette {
    key: string; // 调色板标识
    label: string; // 调色板名称
    colors: string[]; // 色值列表
    names?: string[]; // 与 colors 一一对应的名称（hover 提示用）
    columnSize?: number; // 每列个数（按列分组展示时使用）
}

/** 主题色：每列同一色系（主色 + 深浅变化） */
const THEME_COLUMNS: string[][] = [
    ["#ffffff", "#f2f2f2", "#d8d8d8", "#bfbfbf", "#a5a5a5", "#7f7f7f"],
    ["#000000", "#7f7f7f", "#595959", "#3f3f3f", "#262626", "#0c0c0c"],
    ["#e8e8e8", "#d0d0d0", "#aeaeae", "#747474", "#3a3a3a", "#171717"],
    ["#0e2841", "#dbe9f7", "#a6c9eb", "#4d94d8", "#215e99", "#153d64"],
    ["#156082", "#c1e4f5", "#83caeb", "#45b0e1", "#0f4861", "#0a3041"],
    ["#e97132", "#fae2d6", "#f6c6ac", "#f1a984", "#bf4f14", "#7f340d"],
    ["#196b24", "#c1f0c8", "#84e291", "#47d45a", "#12501b", "#0c3512"],
    ["#0f9ed5", "#caedfb", "#95dcf7", "#60cbf3", "#0b769f", "#074f6a"],
    ["#a02b93", "#f1ceee", "#e49edd", "#d76dcc", "#78206e", "#501549"],
    ["#4ea72e", "#d9f2d0", "#b3e5a1", "#8ed873", "#3a7d22", "#265316"],
];

/** 潘通（Pantone）年度代表色 */
const PANTONE_COLORS = [
    "#9bb7d4", "#c74375", "#bf1932", "#7bc4c4", "#e2583e", "#53b0ae", "#decdb9", "#9b1b30",
    "#5a5b9f", "#f0c05a", "#45b5aa", "#d94f70", "#dd4124", "#009473", "#b163a3", "#955251",
    "#f7cac9", "#91a8d0", "#88b04b", "#5f4b8b", "#ff6f61", "#0f4c81", "#939597", "#f5df4d",
    "#6667ab", "#be3455", "#ffbe98", "#a47864",
];

const PANTONE_NAMES = [
    "Cerulean 2000",
    "Fuchsia Rose 2001",
    "True Red 2002",
    "Aqua Sky 2003",
    "Tigerlily 2004",
    "Blue Turquoise 2005",
    "Sand Dollar 2006",
    "Chili Pepper 2007",
    "Blue Iris 2008",
    "Mimosa 2009",
    "Turquoise 2010",
    "Honeysuckle 2011",
    "Tangerine Tango 2012",
    "Emerald 2013",
    "Radiant Orchid 2014",
    "Marsala 2015",
    "Rose Quartz 2016",
    "Serenity 2016",
    "Greenery 2017",
    "Ultra Violet 2018",
    "Living Coral 2019",
    "Classic Blue 2020",
    "Ultimate Gray 2021",
    "Illuminating 2021",
    "Very Peri 2022",
    "Viva Magenta 2023",
    "Peach Fuzz 2024",
    "Mocha Mousse 2025",
];

/** 莫兰迪色（低饱和度灰调） */
const MORANDI_COLORS = [
    "#a3b1b8", "#a8b5a2", "#c9ada7", "#d8c3a5", "#b7a9c0", "#b98e8a", "#8e9aaf", "#93a5a0",
    "#c8b6a6", "#b9bec3", "#d3c1c0", "#8c9a93", "#9ba3b8", "#e3d5ca", "#a6907c", "#a9b4b0",
    "#9e9e9e", "#c4b7cb", "#cbb9a8", "#b8c4bb",
];

const MORANDI_NAMES = [
    "雾灰蓝",
    "灰豆绿",
    "干枯玫瑰",
    "燕麦",
    "灰紫",
    "豆沙",
    "雾霾蓝",
    "灰绿",
    "浅驼",
    "石灰",
    "灰粉",
    "苔绿",
    "灰蓝紫",
    "米灰",
    "灰褐",
    "灰青",
    "烟灰",
    "淡灰紫",
    "奶咖",
    "雾绿",
];

/** 中国传统色 */
const CHINESE_COLORS = [
    "#9d2933", "#ff461f", "#ed5736", "#f00056", "#f47983", "#db5a6b", "#f20c00", "#c93756",
    "#8c4356", "#c83c23", "#ffa400", "#ffa631", "#ff8c31", "#ff8936", "#ffb61e", "#ffc773",
    "#f0c239", "#ffa54f", "#bcd4e6", "#789262", "#48c0a3", "#1bd1a5", "#7fecad", "#1685a9",
    "#70f3ff", "#177cb0", "#4c8dae", "#2e4e7e", "#425066", "#4c221b", "#50616d", "#fffbf0",
    "#d6ecf0", "#f2ecde", "#e9f1f6", "#f0fcff", "#3d3b4f", "#392f41",
];

const CHINESE_NAMES = [
    "胭脂",
    "朱砂",
    "妃色",
    "品红",
    "桃红",
    "海棠红",
    "石榴红",
    "樱桃色",
    "绛紫",
    "绯红",
    "橙黄",
    "杏黄",
    "杏红",
    "橘黄",
    "藤黄",
    "姜黄",
    "缃色",
    "雄黄",
    "松花色",
    "竹青",
    "青碧",
    "碧色",
    "缥色",
    "石青",
    "蔚蓝",
    "靛青",
    "群青",
    "藏青",
    "黛蓝",
    "紫檀",
    "墨色",
    "象牙白",
    "月白",
    "缟",
    "霜色",
    "雪白",
    "玄青",
    "乌黑",
];

/** 颜色选择器内置的调色板，可通过 ColorPicker 的 palettes 属性替换 */
export const COLOR_PALETTES: ColorPalette[] = [
    {
        key: "theme",
        label: "主题色",
        colors: THEME_COLUMNS.flat(),
        columnSize: 6,
    },
    {
        key: "standard",
        label: "标准色",
        colors: ["#c00000", "#ee0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0"],
    },
    {
        key: "pantone",
        label: "潘通色",
        colors: PANTONE_COLORS,
        names: PANTONE_NAMES,
    },
    {
        key: "morandi",
        label: "莫兰迪",
        colors: MORANDI_COLORS,
        names: MORANDI_NAMES,
    },
    {
        key: "chinese",
        label: "中国色",
        colors: CHINESE_COLORS,
        names: CHINESE_NAMES,
    },
];
