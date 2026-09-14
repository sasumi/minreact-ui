import { formatSize } from "minutool";
import { Toast } from "./Toast";
import { forwardRef } from "react";

type FilePickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    onChange: (file: File | File[]) => void;
    maxSize?: number;
    minSize?: number;
    maxCount?: number;
    multiple?: boolean;
    accept?: string;
};

/**
 * 文件选择组件，需要配合触发元素 label 使用
 * @param onChange 文件选择回调
 * @param maxSize 最大文件大小
 * @param minSize 最小文件大小
 * @param maxCount 最大文件数量
 * @param multiple 是否允许多选
 * @param accept 接受的文件类型
 */
export const FilePicker = forwardRef<HTMLInputElement, FilePickerProps>(
    ({ onChange, maxSize = Infinity, maxCount = undefined, minSize = 0, ...inputProps }: FilePickerProps, ref) => {
        return (
            <input
                {...inputProps}
                type="file"
                ref={ref}
                style={{ display: "none" }}
                onChange={(e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    maxCount = maxCount ?? (inputProps.multiple ? Infinity : 1);
                    if (maxCount > 1) {
                        inputProps.multiple = true;
                    }
                    if (files) {
                        if (files.length > maxCount) {
                            Toast.showWarning(`文件数量过多，最大允许 ${maxCount} 个`);
                            return;
                        }
                        for (const file of files) {
                            if (file.size > maxSize) {
                                Toast.showWarning(`文件过大，最大允许 ${formatSize(maxSize, "KB") + "KB"}`);
                                return;
                            }
                            if (file.size < minSize) {
                                Toast.showWarning(`文件过小，最小要求 ${formatSize(minSize, "KB") + "KB"}`);
                                return;
                            }
                        }
                        onChange(maxCount === 1 ? files[0] : files);
                        files.forEach((file) => onChange(file));
                        (e.target as HTMLInputElement).value = "";
                    }
                }}
            />
        );
    },
);
FilePicker.displayName = "FilePicker";