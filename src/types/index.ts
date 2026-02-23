/**
 * 应用公共类型定义
 */

/**
 * 视图类型定义
 * 表示应用中可切换的不同视图
 */
export type ViewType = 'pitch' | 'pitch-history' | 'pitch-tracking' | 'spectrum' | 'analysis' | 'settings';

/**
 * 颜色方案类型定义
 * 用于图表的不同颜色主题
 */
export type ColorScheme = 'default' | 'ocean' | 'flame' | 'forest' | 'purple';

/**
 * 图表设置接口
 * 定义图表相关的配置选项
 */
export interface ChartSettings {
  /**
   * 最低频率
   */
  minFreq: number;
  /**
   * 最高频率
   */
  maxFreq: number;
  /**
   * 是否显示网格
   */
  showGrid: boolean;
  /**
   * 是否显示标签
   */
  showLabels: boolean;
  /**
   * 线条宽度
   */
  lineWidth: number;
  /**
   * 颜色方案
   */
  colorScheme: ColorScheme;
}

/**
 * 应用设置接口
 * 定义应用的全局配置选项
 */
export interface AppSettings {
  /**
   * 主题模式
   */
  theme: 'light' | 'dark' | 'system';
  /**
   * 图表设置
   */
  chart: ChartSettings;
  /**
   * 灵敏度
   */
  sensitivity: number;
  /**
   * 最小能量阈值
   */
  minEnergy: number;
  /**
   * 禅模式
   */
  zenMode: boolean;
}

/**
 * 音高结果接口
 * 表示音高检测的结果
 */
export interface PitchResult {
  /**
   * 频率
   */
  freq: number;
  /**
   * 音符
   */
  note: string;
  /**
   * 置信度
   */
  confidence: number;
  /**
   * 时间戳
   */
  timestamp: number;
}

/**
 * 分析数据接口
 * 表示音高分析的结果数据
 */
export interface AnalysisData {
  /**
   * 平均频率
   */
  averageFreq: number;
  /**
   * 中位数频率
   */
  medianFreq: number;
  /**
   * 最小频率
   */
  minFreq: number;
  /**
   * 最大频率
   */
  maxFreq: number;
  /**
   * 95% 低频
   */
  low95: number;
  /**
   * 95% 高频
   */
  high95: number;
  /**
   * 男性音域百分比
   */
  malePercent: number;
  /**
   * 女性音域百分比
   */
  femalePercent: number;
  /**
   * 中性音域百分比
   */
  neutralPercent: number;
  /**
   * 总样本数
   */
  totalSamples: number;
  /**
   * 音量数据
   */
  volume: {
    /**
     * 环境音量
     */
    environment: number;
    /**
     * 平均音量
     */
    average: number;
    /**
     * 中位数音量
     */
    median: number;
    /**
     * 95% 高音量
     */
    high95: number;
    /**
     * 95% 低音量
     */
    low95: number;
  };
}

/**
 * 导航菜单项类型
 * 定义导航菜单中的每个项目
 */
export type NavItem = {
  /**
   * 视图ID
   */
  id: ViewType;
  /**
   * 菜单标签
   */
  label: string;
  /**
   * 菜单图标组件
   */
  icon: React.ElementType;
};
