/**
 * 应用状态管理
 * 使用Zustand库实现全局状态管理，包含导航、音高检测、设置等状态
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PitchResult, AnalysisData, ViewType, ChartSettings, AppSettings } from '@/types';
import { MicrophonePitchDetector } from '@/lib/pitchDetector';
import { DEFAULT_SETTINGS, COLOR_SCHEMES } from '@/constants';

/**
 * 应用状态接口
 * 定义应用的全局状态和操作方法
 */
interface AppState {
  // 导航相关
  currentView: ViewType;              // 当前视图
  setCurrentView: (view: ViewType) => void; // 设置当前视图
  
  // 音高检测状态
  isDetecting: boolean;               // 是否正在检测
  setIsDetecting: (detecting: boolean) => void; // 设置检测状态
  
  // 当前音高
  currentPitch: PitchResult | null;   // 当前音高结果
  setCurrentPitch: (pitch: PitchResult | null) => void; // 设置当前音高
  
  // 分析数据
  analysisData: AnalysisData | null;  // 分析数据
  setAnalysisData: (data: AnalysisData | null) => void; // 设置分析数据
  
  // 设置
  settings: AppSettings;              // 应用设置
  updateSettings: (settings: Partial<AppSettings>) => void; // 更新应用设置
  updateChartSettings: (settings: Partial<ChartSettings>) => void; // 更新图表设置
  
  // 频谱数据（用于可视化）
  spectrumData: Uint8Array | null;    // 频谱数据
  setSpectrumData: (data: Uint8Array | null) => void; // 设置频谱数据
  
  // 音高跟踪历史
  pitchTrackingHistory: PitchResult[]; // 音高跟踪历史记录
  addPitchToTrackingHistory: (pitch: PitchResult) => void; // 添加音高到历史记录
  clearPitchTrackingHistory: () => void; // 清空音高历史记录
  
  // 检测器实例
  detector: MicrophonePitchDetector | null;  // 音高检测器实例
  setDetector: (detector: MicrophonePitchDetector | null) => void; // 设置检测器实例
  
  // 开始/停止检测
  startDetection: () => Promise<void>; // 开始检测
  stopDetection: () => void;           // 停止检测
}

/**
 * 默认设置
 * 应用的初始配置
 */
const defaultSettings: AppSettings = DEFAULT_SETTINGS;

/**
 * 应用状态存储
 * 使用Zustand创建并持久化状态
 * @returns 应用状态钩子函数
 */
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      /**
       * 导航相关状态
       */
      currentView: 'pitch-tracking',
      /**
       * 设置当前视图
       * @param view 视图类型
       */
      setCurrentView: (view) => set({ currentView: view }),
      
      /**
       * 检测状态
       */
      isDetecting: false,
      /**
       * 设置检测状态
       * @param detecting 是否正在检测
       */
      setIsDetecting: (detecting) => set({ isDetecting: detecting }),
      
      /**
       * 当前音高结果
       */
      currentPitch: null,
      /**
       * 设置当前音高
       * @param pitch 音高结果
       */
      setCurrentPitch: (pitch) => set({ currentPitch: pitch }),
      
      /**
       * 分析数据
       */
      analysisData: null,
      /**
       * 设置分析数据
       * @param data 分析数据
       */
      setAnalysisData: (data) => set({ analysisData: data }),
      
      /**
       * 应用设置
       */
      settings: defaultSettings,
      /**
       * 更新应用设置
       * @param settings 部分应用设置
       */
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      /**
       * 更新图表设置
       * @param settings 部分图表设置
       */
      updateChartSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            chart: { ...state.settings.chart, ...settings },
          },
        })),
      
      /**
       * 频谱数据（用于可视化）
       */
      spectrumData: null,
      /**
       * 设置频谱数据
       * @param data 频谱数据
       */
      setSpectrumData: (data) => set({ spectrumData: data }),
      
      /**
       * 音高跟踪历史记录
       */
      pitchTrackingHistory: [],
      /**
       * 添加音高到历史记录
       * @param pitch 音高结果
       */
      addPitchToTrackingHistory: (pitch) =>
        set((state) => ({
          // 保持历史记录最多300条
          pitchTrackingHistory: [...state.pitchTrackingHistory.slice(-299), pitch],
        })),
      /**
       * 清空音高历史记录
       */
      clearPitchTrackingHistory: () => set({ pitchTrackingHistory: [] }),
      
      /**
       * 音高检测器实例
       */
      detector: null,
      /**
       * 设置检测器实例
       * @param detector 音高检测器实例
       */
      setDetector: (detector) => set({ detector }),
      
      /**
       * 开始音高检测
       * @returns Promise<void>
       */
      startDetection: async () => {
        const state = get();
        // 如果已经在检测中，直接返回
        if (state.isDetecting) return;
        
        try {
          let detector = state.detector;
          // 如果没有检测器实例，创建一个新的
          if (!detector) {
            detector = new MicrophonePitchDetector((result) => {
              // 更新当前音高
              set({ currentPitch: result });
              // 添加到历史记录
              get().addPitchToTrackingHistory(result);
            });
            set({ detector });
          }
          
          // 启动检测器
          await detector.start();
          // 更新检测状态
          set({ isDetecting: true });
        } catch (error) {
          console.error('Failed to start detection:', error);
          throw error;
        }
      },
      
      /**
       * 停止音高检测
       */
      stopDetection: () => {
        const state = get();
        // 如果没有在检测或没有检测器实例，直接返回
        if (!state.isDetecting || !state.detector) return;
        
        // 停止检测器
        state.detector.stop();
        // 更新状态
        set({ 
          isDetecting: false,
          currentPitch: null
        });
      },
    }),
    {
      /**
       * 持久化配置
       */
      // 存储名称
      name: 'pitchdetect-settings',
      // 只持久化settings部分
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

/**
 * 图表颜色方案
 * 定义不同主题的颜色配置
 */
export const colorSchemes = COLOR_SCHEMES;
