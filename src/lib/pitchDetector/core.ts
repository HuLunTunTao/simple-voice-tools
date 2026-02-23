/**
 * 音高检测核心模块
 * 实现基于谐波分析的音高识别算法
 */

import { PITCH_DETECTOR_CONFIG, NOTE_NAMES } from '@/constants';

// 配置常量
export const detectionConfig = PITCH_DETECTOR_CONFIG;

// 音高定义（C2-C7）
export interface PitchInfo {
  note: string;
  frequency: number;
  logFrequency: number;
  midiNumber: number;
}

export const pitchCollection: PitchInfo[] = [];

// 生成十二平均律频率表
for (let octave = 2; octave <= 7; octave++) {
  for (let noteIndex = 0; noteIndex < 12; noteIndex++) {
    const noteName = NOTE_NAMES[noteIndex];
    const midiNumber = (octave + 1) * 12 + noteIndex; // MIDI编号：C2=36, C4=60, A4=69
    const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);
    pitchCollection.push({
      note: noteName + octave,
      frequency: frequency,
      logFrequency: Math.log(frequency),
      midiNumber: midiNumber,
    });
  }
}

/**
 * 音高检测器类
 * 使用谐波分析算法识别音频中的基频
 */
export class PitchAnalyzer {
  private static harmonicMapping: number[][] | null = null; // 缓存：音高→谐波索引映射
  private static startPitchIndex = 0; // 起始音高索引（对应C2）
  private static endPitchIndex = 0; // 结束音高索引（对应C7）

  detectedNote: string | null = null; // 检测结果：音名（如"C4"）
  detectedFrequency = 0; // 检测结果：频率（Hz）
  confidenceScore = 0; // 置信度（0-1）
  totalSignalEnergy = 0; // 总能量（用于信噪比计算）

  constructor(fftData: ArrayLike<number>, sampleRate: number) {
    // 初始化静态映射表（只执行一次）
    if (!PitchAnalyzer.harmonicMapping) {
      this.initializeHarmonicMapping(fftData.length, sampleRate);
    }
    this.processAudioData(fftData as Uint8Array, sampleRate);
  }

  /**
   * 预计算：为每个半音生成其谐波对应的FFT bin索引
   * @param fftLength FFT数据长度
   * @param sampleRate 采样率
   */
  private initializeHarmonicMapping(fftLength: number, sampleRate: number): void {
    PitchAnalyzer.harmonicMapping = [];
    const binSize = sampleRate / detectionConfig.FFT_SIZE;

    // 找出pitchCollection中对应MIN/MAX_FREQ的索引
    PitchAnalyzer.startPitchIndex = pitchCollection.findIndex((p) => p.frequency >= detectionConfig.MIN_FREQ);
    PitchAnalyzer.endPitchIndex = pitchCollection.findIndex((p) => p.frequency > detectionConfig.MAX_FREQ);

    for (let i = PitchAnalyzer.startPitchIndex; i < PitchAnalyzer.endPitchIndex; i++) {
      const pitch = pitchCollection[i];
      const harmonicIndices: number[] = [];

      // 计算前LEVEL_N个谐波
      for (let harmonicLevel = 1; harmonicLevel < detectionConfig.LEVEL_N; harmonicLevel++) {
        const harmonicFreq = pitch.frequency * harmonicLevel;
        if (harmonicFreq > 7000) break; // 忽略>7kHz的高次谐波

        // 频率 → FFT bin索引
        const index = Math.round(harmonicFreq / binSize);
        if (index < fftLength) {
          harmonicIndices.push(index);
        }
      }
      PitchAnalyzer.harmonicMapping.push(harmonicIndices);
    }
  }

  /**
   * 主检测流程
   * @param fftData FFT频谱数据
   * @param sampleRate 采样率
   */
  private processAudioData(fftData: Uint8Array, sampleRate: number): void {
    // 1. 识别频谱中的所有显著峰值（局部最大值）
    const { peakMarkers, highestEnergy } = this.identifySpectralPeaks(fftData);

    // 能量阈值过滤：如果最大峰值不够高，视为静音
    if (highestEnergy < detectionConfig.MIN_ENERGY) {
      return; // detectedNote保持null
    }

    // 2. 谐波累加：为每个候选音高计算得分
    let bestScore = 0;
    let bestPitch: PitchInfo | null = null;

    for (let i = 0; i < PitchAnalyzer.harmonicMapping!.length; i++) {
      const harmonics = PitchAnalyzer.harmonicMapping![i];
      let score = 0;
      let harmonicPenalty = 1; // 缺失谐波惩罚计数器

      for (let level = 0; level < harmonics.length; level++) {
        const binIndex = harmonics[level];
        const value = fftData[binIndex];

        // 只累加被标记为峰值的bin（抑制噪声）
        if (peakMarkers[binIndex]) {
          // 高次谐波权重递减（除以harmonicPenalty）
          score += value / harmonicPenalty;
        } else if (level > 0 || binIndex < 30) {
          // 基频缺失或低频区谐波缺失，增加惩罚
          harmonicPenalty++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestPitch = pitchCollection[PitchAnalyzer.startPitchIndex + i];
      }
    }

    // 3. 人声验证：确保该频段能量占主导（排除噪声）
    if (bestPitch) {
      const vocalEnergy = this.calculateVocalEnergy(bestPitch, fftData, sampleRate);
      if (vocalEnergy >= this.totalSignalEnergy / detectionConfig.WEIGHT_THRESHOLD) {
        this.detectedNote = bestPitch.note;
        this.detectedFrequency = bestPitch.frequency;
        this.confidenceScore = Math.min(bestScore / 255, 1); // 归一化置信度
      }
    }
  }

  /**
   * 峰值检测：找出频谱中的局部最大值
   * @param fftData FFT频谱数据
   * @returns 峰值标记数组和最高能量值
   */
  private identifySpectralPeaks(fftData: Uint8Array): { peakMarkers: Int8Array; highestEnergy: number } {
    const dataLength = fftData.length;
    const peakMarkers = new Int8Array(dataLength);
    // 最高能量索引（用于内部计算）
    let highestEnergy = 0;
    this.totalSignalEnergy = 0;

    // 计算总能量，找出全局最高峰值
    for (let i = 9; i < dataLength - 2; i++) {
      // 跳过极低频段（9≈200Hz以下）
      const value = fftData[i];
      this.totalSignalEnergy += value;
      if (value > highestEnergy) {
        highestEnergy = value;
        // 记录最高能量索引（用于内部计算）
      }
    }

    // 判断是否为局部峰值
    const isLocalPeak = (index: number, direction: number): boolean => {
      if (fftData[index] < highestEnergy - 70) return false; // 低于峰值70视为无效
      for (let i = 1; i <= 2; i++) {
        const neighbor = index + direction * i;
        if (neighbor < 0 || neighbor >= dataLength) break;
        if (fftData[neighbor] > fftData[index]) return false;
        if (fftData[neighbor] < fftData[index]) return true;
      }
      return false;
    };

    // 检查两侧是否有足够下降（确保是独立的峰）
    const hasSufficientDrop = (index: number, direction: number): boolean => {
      const threshold = fftData[index] - 30;
      for (let i = 1; i < detectionConfig.VOCAL_RANGE; i++) {
        const j = index + i * direction;
        if (j < 0) break;
        if (fftData[j] < threshold) return true;
      }
      return false;
    };

    // 计算局部平均能量
    const calculateAverageEnergy = (from: number, to: number): number => {
      from = Math.max(0, from);
      let sum = 0;
      for (let i = from; i <= to && i < dataLength; i++) sum += fftData[i];
      return sum / (to - from + 1);
    };

    // 遍历所有频点，标记峰值
    for (let i = 1; i < dataLength - 1; i++) {
      if (
        isLocalPeak(i, 1) &&
        isLocalPeak(i, -1) &&
        hasSufficientDrop(i, 1) &&
        hasSufficientDrop(i, -1) &&
        fftData[i] > calculateAverageEnergy(i - detectionConfig.VOCAL_RANGE, i + detectionConfig.VOCAL_RANGE) + 10
      ) {
        // 标记峰值及其邻域（TOP_RANGE=3）
        for (let j = i - detectionConfig.TOP_RANGE; j <= i + detectionConfig.TOP_RANGE; j++) {
          if (j >= 0 && j < dataLength) peakMarkers[j] = 1;
        }
      }
    }

    return { peakMarkers, highestEnergy };
  }

  /**
   * 计算候选音高附近的总能量（用于过滤噪声）
   * @param pitch 候选音高信息
   * @param fftData FFT频谱数据
   * @param sampleRate 采样率
   * @returns 人声能量值
   */
  private calculateVocalEnergy(
    pitch: PitchInfo,
    fftData: Uint8Array,
    sampleRate: number
  ): number {
    // 频率 → FFT索引
    const binSize = sampleRate / detectionConfig.FFT_SIZE;
    const centerIndex = Math.round(pitch.frequency / binSize);
    const range = detectionConfig.VOCAL_RANGE; // 上下各8个半音

    let energy = 0;
    for (let i = -range; i <= range; i++) {
      const index = centerIndex + i;
      if (index > 0 && index < fftData.length) {
        energy += fftData[index];
      }
    }
    return energy;
  }
}
