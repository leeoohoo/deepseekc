#!/usr/bin/env python3
import re

def main():
    file_path = 'client/src/pages/Home.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find line index of "Common Commands Section" comment
    target_line = None
    for i, line in enumerate(lines):
        if 'Common Commands Section' in line:
            target_line = i
            break
    if target_line is None:
        print('Could not find Common Commands Section')
        return
    
    # Insert new section before this line
    new_section = '''      {/* UI Showcase Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              界面展示 <span className="gradient-text">四种核心界面</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              精心设计的 Electron 界面，覆盖 CLI 工具的所有核心使用场景
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:border-primary-800/50 transition-all duration-300 group"
            >
              <div className="border border-dark-700 rounded-lg overflow-hidden mb-4">
                <img 
                  src={DashboardSVG} 
                  alt="Dashboard 界面"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">主管理台</h3>
              <p className="text-dark-300 mb-6">整合式管理界面，集中展示会话面板、事件流、文件改动、最近对话和 tmux 管理功能。</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 text-dark-300 text-sm">
                <span>Dashboard</span>
              </div>
            </motion.div>

            {/* File Browser */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:border-primary-800/50 transition-all duration-300 group"
            >
              <div className="border border-dark-700 rounded-lg overflow-hidden mb-4">
                <img 
                  src={FileBrowserSVG} 
                  alt="File Browser 界面"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">文件浏览器</h3>
              <p className="text-dark-300 mb-6">智能文件管理界面，支持目录树导航、代码高亮预览和变更记录可视化。</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 text-dark-300 text-sm">
                <span>File Browser</span>
              </div>
            </motion.div>

            {/* Floating Island */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:border-primary-800/50 transition-all duration-300 group"
            >
              <div className="border border-dark-700 rounded-lg overflow-hidden mb-4">
                <img 
                  src={FloatingIslandSVG} 
                  alt="Floating Island 界面"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">浮动岛交互</h3>
              <p className="text-dark-300 mb-6">沉浸式交互面板，提供终端选择器、消息输入、UI 提示表单和快捷操作按钮。</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 text-dark-300 text-sm">
                <span>Floating Island</span>
              </div>
            </motion.div>

            {/* Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="card p-6 text-center hover:border-primary-800/50 transition-all duration-300 group"
            >
              <div className="border border-dark-700 rounded-lg overflow-hidden mb-4">
                <img 
                  src={ConfigurationSVG} 
                  alt="Configuration 界面"
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">配置管理</h3>
              <p className="text-dark-300 mb-6">集中式配置界面，管理模型参数、MCP 服务器、子代理启用和提示词编辑器。</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 text-dark-300 text-sm">
                <span>Configuration</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/ui-showcase"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
            >
              <Monitor className="w-5 h-5" />
              查看所有界面详情
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
'''
    # Insert new lines
    for line in reversed(new_section.split('\n')):
        lines.insert(target_line, line + '\n')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('UI Showcase section added successfully')

if __name__ == '__main__':
    main()