import React from 'react';

// 导入SVG文件
import DashboardSVG from '../assets/svg/dashboard.svg';
import FileBrowserSVG from '../assets/svg/file-browser.svg';
import FloatingIslandSVG from '../assets/svg/floating-island.svg';
import ConfigurationSVG from '../assets/svg/configuration.svg';

const SVGTest = () => {
  return (
    <div className="p-8 bg-dark-950 min-h-screen">
      <h1 className="text-3xl font-bold text-dark-100 mb-2">DeepSeek CLI UI 示意图</h1>
      <p className="text-dark-400 mb-8">用于官网展示的Electron UI界面SVG示意图</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">1. 主管理台界面</h2>
          <div className="border border-dark-700 rounded-lg overflow-hidden">
            <img src={DashboardSVG} alt="DeepSeek CLI 主管理台界面" className="w-full h-auto" />
          </div>
          <p className="text-dark-300 mt-4 text-sm">
            包含顶部导航、左侧管理菜单、主内容区域显示会话面板（事件流、文件改动、最近对话、tmux管理）。
          </p>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">2. 文件浏览器界面</h2>
          <div className="border border-dark-700 rounded-lg overflow-hidden">
            <img src={FileBrowserSVG} alt="DeepSeek CLI 文件浏览器界面" className="w-full h-auto" />
          </div>
          <p className="text-dark-300 mt-4 text-sm">
            左侧目录树（带变更高亮），右侧文件预览区（代码高亮显示），底部变更记录面板。
          </p>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">3. 浮动岛交互界面</h2>
          <div className="border border-dark-700 rounded-lg overflow-hidden">
            <img src={FloatingIslandSVG} alt="DeepSeek CLI 浮动岛交互界面" className="w-full h-auto" />
          </div>
          <p className="text-dark-300 mt-4 text-sm">
            位于屏幕底部中央的浮动面板，包含终端选择器、消息输入框、UI提示表单、目录选择、操作按钮。
          </p>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-100 mb-4">4. 配置管理界面</h2>
          <div className="border border-dark-700 rounded-lg overflow-hidden">
            <img src={ConfigurationSVG} alt="DeepSeek CLI 配置管理界面" className="w-full h-auto" />
          </div>
          <p className="text-dark-300 mt-4 text-sm">
            模型配置表格、MCP Server列表、Sub-agent启用开关、Prompt编辑器。
          </p>
        </div>
      </div>
      
      <div className="mt-12 card p-6">
        <h2 className="text-xl font-semibold text-dark-100 mb-4">SVG技术细节</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-800 rounded-lg">
            <div className="text-primary-500 font-mono text-sm">尺寸</div>
            <div className="text-dark-200">800×500px</div>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <div className="text-primary-500 font-mono text-sm">颜色主题</div>
            <div className="text-dark-200">#0f172a → #1e293b</div>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <div className="text-primary-500 font-mono text-sm">字体</div>
            <div className="text-dark-200">Inter + JetBrains Mono</div>
          </div>
          <div className="p-4 bg-dark-800 rounded-lg">
            <div className="text-primary-500 font-mono text-sm">标注</div>
            <div className="text-dark-200">每个SVG 4-5个标注</div>
          </div>
        </div>
        <p className="text-dark-300 mt-6 text-sm">
          这些SVG可直接在React中使用，支持深色主题、扁平化设计风格，清晰展示了DeepSeek CLI UI的核心功能。
        </p>
      </div>
    </div>
  );
};

export default SVGTest;