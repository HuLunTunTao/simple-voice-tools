/**
 * 应用常量定义
 * 包含应用中使用的各种常量配置
 */

/**
 * 音高检测配置常量
 * 定义音高检测算法的参数配置
 */
export const PITCH_DETECTOR_CONFIG = {
  /**
   * FFT点数，决定频率分辨率（约10.8Hz@44.1kHz）
   */
  FFT_SIZE: 4096, 
  /**
   * 默认采样率，实际从AudioContext获取
   */
  SAMPLE_RATE: 44100, 
  /**
   * C2 ≈ 65.41Hz，最低检测频率
   */
  MIN_FREQ: 65, 
  /**
   * C7 ≈ 2093Hz，最高检测频率
   */
  MAX_FREQ: 2093, 
  /**
   * 音高容差范围（半音）
   */
  VOCAL_RANGE: 8, 
  /**
   * 峰值标记范围
   */
  TOP_RANGE: 3, 
  /**
   * 最大谐波次数
   */
  LEVEL_N: 20, 
  /**
   * 峰值能量阈值（过滤静音/噪声）
   */
  MIN_ENERGY: 150, 
  /**
   * 人声能量占比阈值（越高越严格）
   */
  WEIGHT_THRESHOLD: 30, 
};

/**
 * 音符名称列表
 */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * 颜色方案配置
 * 定义不同主题的颜色配置
 */
export const COLOR_SCHEMES = {
  /**
   * 默认颜色方案
   */
  default: {
    primary: '#333333',
    secondary: '#666666',
    gradient: ['#333333', '#666666', '#999999'],
  },
  /**
   * 海洋主题颜色方案
   */
  ocean: {
    primary: '#0066CC',
    secondary: '#00A3CC',
    gradient: ['#0066CC', '#0088CC', '#00A3CC'],
  },
  /**
   * 火焰主题颜色方案
   */
  flame: {
    primary: '#FF4500',
    secondary: '#FF8C00',
    gradient: ['#FF4500', '#FF6B35', '#FF8C00'],
  },
  /**
   * 森林主题颜色方案
   */
  forest: {
    primary: '#228B22',
    secondary: '#32CD32',
    gradient: ['#228B22', '#2E8B57', '#32CD32'],
  },
  /**
   * 紫色主题颜色方案
   */
  purple: {
    primary: '#6B46C1',
    secondary: '#9F7AEA',
    gradient: ['#6B46C1', '#805AD5', '#9F7AEA'],
  },
};

/**
 * 音符颜色映射
 * 为每个音符定义对应的颜色
 */
export const NOTE_COLORS: Record<string, string> = {
  C: '#FF6B6B',
  'C#': '#FF8E53',
  D: '#FFC93C',
  'D#': '#6BCB77',
  E: '#4D96FF',
  F: '#9B59B6',
  'F#': '#E74C3C',
  G: '#F39C12',
  'G#': '#27AE60',
  A: '#2980B9',
  'A#': '#8E44AD',
  B: '#C0392B',
};

/**
 * 默认应用设置
 * 应用的初始配置
 */
export const DEFAULT_SETTINGS = {
  /**
   * 主题模式
   */
  theme: 'system' as const,
  /**
   * 图表配置
   */
  chart: {
    /**
     * 最小频率
     */
    minFreq: 50,
    /**
     * 最大频率
     */
    maxFreq: 1050,
    /**
     * 是否显示网格
     */
    showGrid: false,
    /**
     * 是否显示标签
     */
    showLabels: false,
    /**
     * 线条宽度
     */
    lineWidth: 2,
    /**
     * 颜色方案
     */
    colorScheme: 'default' as const,
  },
  /**
   * 检测灵敏度
   */
  sensitivity: 0.5,
  /**
   * 最小能量阈值
   */
  minEnergy: 150,
  /**
   * 禅模式
   */
  zenMode: false,
};

/**
 * 导航菜单项配置
 */
export const NAV_ITEMS = [
  { id: 'pitch-tracking' as const, label: '实时音高跟踪', icon: 'Waves' as const },
  { id: 'spectrum' as const, label: '频谱图', icon: 'Waves' as const },
  { id: 'analysis' as const, label: '结果分析', icon: 'BarChart3' as const },
  { id: 'settings' as const, label: '设置', icon: 'Settings' as const },
];
