/**
 * 工具函数
 * 包含应用中使用的通用工具函数
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，然后使用 twMerge 合并冲突的类名
 * 
 * @param inputs 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
