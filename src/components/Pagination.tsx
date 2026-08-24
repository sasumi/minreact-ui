import { useEffect, useRef, useState } from "react";
import { SpanButton } from "./Button";
import "./../styles/components/pagination.scss";
import { textTranslate } from "./../utils.tsx";
import "./../styles/common.module.scss";
import { namespace } from "./../styles/namespace";
const CSS_NS = namespace + "-pagination";

interface PaginationProps {
    page?: number;
    pageSize: number;
    total: number;
    disabled?: boolean;
    itemsPerPageText?: string;
    jumpToPageText?: string;
    invalidPageNumberText?: string;
    pageNumberOutOfRangeText?: string;
    pageInfoText?: string;
    totalItemsText?: string;
    onChange?: (p: number) => void;
}

export function Pagination({
    page = 1,
    pageSize,
    total = 0,
    disabled = false,
    itemsPerPageText = "每页 {num} 条",
    jumpToPageText = "跳转到第 {num} 页",
    invalidPageNumberText = "无效的页码",
    pageNumberOutOfRangeText = "页码超出范围，总页数为 {TOTAL_PAGE}",
    pageInfoText = "第 {CURRENT_PAGE} / {TOTAL_PAGE} 页",
    totalItemsText = " 共 {num} 条",
    onChange = () => {},
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const [p, setP] = useState(page);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        onChange(p);
    }, [p, onChange]);

    return (
        <div className={`${CSS_NS}`} aria-disabled={disabled}>
            <span className={`${CSS_NS}-current`} title={textTranslate(itemsPerPageText, { num: pageSize })}>
                <SpanButton
                    className={`${CSS_NS}-page-jumper`}
                    onClick={() => {
                        let n = prompt(textTranslate(jumpToPageText, { num: p }));
                        if (n === null) {
                            return;
                        }
                        const num = parseInt(n);
                        if (isNaN(num)) {
                            alert(invalidPageNumberText);
                            return;
                        }
                        if (num < 1 || num > totalPages) {
                            alert(textTranslate(pageNumberOutOfRangeText, { TOTAL_PAGE: totalPages }));
                            return;
                        }
                        setP(num);
                    }}
                >
                    {textTranslate(pageInfoText, { CURRENT_PAGE: p, TOTAL_PAGE: totalPages })}
                </SpanButton>
                {textTranslate(totalItemsText, { num: total })}
            </span>
            <SpanButton
                className={`${CSS_NS}-icon-left`}
                onClick={() => {
                    p > 1 && setP(p - 1);
                }}
                disabled={p == 1}
            />
            <SpanButton
                className={`${CSS_NS}-icon-right`}
                onClick={() => {
                    p < totalPages && setP(p + 1);
                }}
                disabled={p == totalPages}
            />
        </div>
    );
}

export function AllListPaginate({
    all,
    page = 1,
    pageSize = 10,
    disabled = false,
    onChange = () => {},
}: {
    all: any[];
    page?: number;
    pageSize?: number;
    disabled?: boolean;
    onChange?: (p: number, list: any[]) => void;
}) {
    useEffect(() => {
        onChange(page, all.slice((page - 1) * pageSize, page * pageSize));
    }, [all, page, pageSize]);
    return (
        <Pagination
            page={page}
            pageSize={pageSize}
            total={all.length}
            disabled={disabled}
            onChange={(page) => {
                onChange(page, all.slice((page - 1) * pageSize, page * pageSize));
            }}
        />
    );
}
