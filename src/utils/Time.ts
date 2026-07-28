export function prettyTimeDuration(totalSeconds: number) {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainSeconds = seconds % 60;

	const parts: string[] = [];
	if (days > 0) {
		parts.push(`${days}d`);
	}
	if (hours > 0 || parts.length > 0) {
		parts.push(`${hours}h`);
	}
	if (minutes > 0 || parts.length > 0) {
		parts.push(`${minutes}m`);
	}
	parts.push(`${remainSeconds}s`);
	return parts.join(" ");
}
