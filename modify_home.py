#!/usr/bin/env python3
import re
import sys

def main():
    file_path = 'client/src/pages/Home.jsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Define the new terminal mockup + UI preview block
    new_block = '''            {/* UI Preview & Terminal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {/* Terminal Mockup - Reduced Visual Weight */}
              <div className="bg-dark-900/30 border border-dark-800 rounded-2xl backdrop-blur-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-dark-400 text-sm ml-2">{t('home.hero.terminalLabel')}</span>
                </div>
                <div className="space-y-1">
                  {terminalCommands.slice(0, 3).map((cmd, idx) => (
                    <div key={idx} className="font-mono text-dark-300 text-sm">
                      <span className="text-green-400">$</span>{' '}
                      <span className="text-white">{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard UI Preview */}
              <div className="bg-dark-900/30 border border-dark-800 rounded-2xl backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary-900/30">
                    <Monitor className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">现代化界面预览</h3>
                    <p className="text-dark-300 text-sm">直观的可视化操作体验</p>
                  </div>
                </div>
                <div className="border border-dark-700 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={DashboardSVG} 
                    alt="DeepSeek CLI 管理台界面"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-dark-300 text-sm">
                    体验现代化的 Electron 桌面应用，提供强大的可视化功能集成。
                  </p>
                  <Link
                    to="/ui-showcase"
                    className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <Monitor className="w-4 h-4" />
                    查看所有界面
                  </Link>
                </div>
              </div>
            </motion.div>'''
    
    # Find the old block using a regex pattern
    # Look for the comment "Animated Terminal Mockup" and capture up to the closing motion.div with same indentation
    pattern = r'(\s*){/\* Animated Terminal Mockup \*/}(?s:.+?)\1</motion.div>'
    # Simpler: find from comment to the next closing motion.div that is at same indentation level as the opening motion.div after comment.
    # We'll use a more robust approach: locate the start index of comment
    start = content.find('{/* Animated Terminal Mockup */}')
    if start == -1:
        print('Could not find terminal mockup comment')
        sys.exit(1)
    # Find the opening motion.div after the comment (should be next line)
    # We'll find the closing motion.div by counting nested motion.div? There's only one.
    # Let's find the next '</motion.div>' that is preceded by proper indentation (12 spaces?)
    # We'll search from start for '</motion.div>' and assume it's the correct one.
    # We'll need to capture the entire block including the comment and the motion.div.
    # Let's write a regex that matches from comment to the next '</motion.div>' that is at same indentation as the opening line.
    # We'll approximate: capture from start to the next '</motion.div>' that is preceded by newline and 12 spaces.
    # Let's compute indentation: count spaces before comment.
    lines_before = content[:start].split('\n')
    last_line = lines_before[-1] if lines_before else ''
    indent = len(last_line) - len(last_line.lstrip())
    # Build pattern: comment line + any characters until a line with indent spaces then '</motion.div>'
    # Not trivial.
    # Instead, we'll replace using a marker: we can split by lines and find line numbers.
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '{/* Animated Terminal Mockup */}' in line:
            start_line = i
            break
    # Find matching closing motion.div
    # We'll look for lines starting with indent spaces + '</motion.div>'
    # But there may be other motion.div closures earlier.
    # Let's assume the next '</motion.div>' with same indent is the correct one.
    for j in range(start_line, len(lines)):
        if lines[j].strip() == '</motion.div>' and len(lines[j]) - len(lines[j].lstrip()) == indent:
            end_line = j
            break
    else:
        print('Could not find closing motion.div')
        sys.exit(1)
    # Replace lines[start_line:end_line+1] with new_block split by lines
    new_lines = new_block.split('\n')
    lines[start_line:end_line+1] = new_lines
    new_content = '\n'.join(lines)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully updated Hero section')

if __name__ == '__main__':
    main()