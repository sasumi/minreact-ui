import { Spinner } from "@/components/Spinner";
import { useTranslation } from "react-i18next";

export const PageLoading = () => {
	const { t } = useTranslation("seo");
	return (
		<div className="page-loading">
			<span className="icon icon-logo"></span>
			<div>{t("seo:SITE_NAME")}</div>
		</div>
	);
};

export const DataLoading = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
	const { t } = useTranslation("common");
	const className = ["loading", props.className].filter(Boolean).join(" ");
	props.className = className;
	return (
		<div className={className} {...props}>
			<Spinner run={true} />
			{text || t("common:loading")}
		</div>
	);
};

export const DataEmpty = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
	const { t } = useTranslation("common");
	const className = ["empty", props.className].filter(Boolean).join(" ");
	props.className = className;
	return (
		<span className={className} {...props}>
			{text || t("common:noData")}
		</span>
	);
};

export const RequestError = ({ text, ...props }: { text?: string; [key: string]: any } = {}) => {
	const { t } = useTranslation("const");
	const className = ["request-error", props.className].filter(Boolean).join(" ");
	props.className = className;
	return (
		<span className={className} {...props}>
			{text || t("const:net-request-error")}
		</span>
	);
};
