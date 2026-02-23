/**
 * 音高检测辅助工具函数
 */

import { NOTE_NAMES, NOTE_COLORS } from '@/constants';

/**
 * 获取音符颜色（用于可视化）
 * @param note 音符名称，如"C4"
 * @returns 对应的颜色值
 */
export function getNoteColor(note: string): string {
  const noteBase = note.replace(/\d/, '');
  return NOTE_COLORS[noteBase] || '#666666';
}

/**
 * 将频率转换为音符名称（最接近的）
 * @param frequency 频率值（Hz）
 * @returns 对应的音符名称，如"C4"
 */
export function frequencyToNote(frequency: number): string {
  if (frequency <= 0) return '--';
  const midiNumber = Math.round(69 + 12 * Math.log2(frequency / 440));
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return NOTE_NAMES[noteIndex] + octave;
}
