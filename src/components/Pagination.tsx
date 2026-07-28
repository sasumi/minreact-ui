import { useEffect, useRef, useState } from "react";
import { SpanButton } from "@/components/Button";
import "@/styles/com.pagination.scss";
import { useTranslation } from "react-i18next";

interface PaginationProps {
	page?: number;
	pageSize: number;
	total: number;
	disabled?: boolean;
	onChange?: (p: number) => void;
}

export function Pagination({ page = 1, pageSize, total = 0, disabled = false, onChange = () => {} }: PaginationProps) {
	const { t } = useTranslation(["component"]);
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
		<div className="pagination" aria-disabled={disabled}>
			<span className="pg-current" title={t("component:pagination.itemsPerPage", { num: pageSize })}>
				<SpanButton
					className="pg-page-jumper"
					onClick={() => {
						let n = prompt(t("component:pagination.jumpToPage"));
						if (n === null) {
							return;
						}
						const num = parseInt(n);
						if (isNaN(num)) {
							alert(t("component:pagination.invalidPageNumber"));
							return;
						}
						if (num < 1 || num > totalPages) {
							alert(t("component:pagination.pageNumberOutOfRange", { TOTAL_PAGE: totalPages }));
							return;
						}
						setP(num);
					}}
				>
					{t("component:pagination.pageInfo", { CURRENT_PAGE: p, TOTAL_PAGE: totalPages })}
				</SpanButton>
				{t("component:pagination.totalItems", { num: total })}
			</span>
			<SpanButton
				className="button button-small button-outlined icon icon-left"
				onClick={() => {
					p > 1 && setP(p - 1);
				}}
				disabled={p == 1}
			></SpanButton>
			<SpanButton
				className="button button-small button-outlined icon icon-right"
				onClick={() => {
					p < totalPages && setP(p + 1);
				}}
				disabled={p == totalPages}
			></SpanButton>
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
