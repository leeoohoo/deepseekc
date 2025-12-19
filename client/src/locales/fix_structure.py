#!/usr/bin/env python3
import json
import sys

def fix_en():
    with open('en.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Move architecture, plugins, cta into home
    home = data['home']
    home['architecture'] = data.pop('architecture')
    home['plugins'] = data.pop('plugins')
    home['cta'] = data.pop('cta')
    
    # Ensure commands structure exists (already done)
    # If commands is not nested, adjust (but it should be after previous patch)
    if 'commands' not in home:
        # If heading/subheading/items are still direct keys, move them into commands
        if 'heading' in home and 'subheading' in home and 'items' in home:
            home['commands'] = {
                'heading': home.pop('heading'),
                'subheading': home.pop('subheading'),
                'items': home.pop('items')
            }
    
    with open('en.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def fix_zh():
    with open('zh.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    home = data['home']
    home['architecture'] = data.pop('architecture')
    home['plugins'] = data.pop('plugins')
    home['cta'] = data.pop('cta')
    
    if 'commands' not in home:
        if 'heading' in home and 'subheading' in home and 'items' in home:
            home['commands'] = {
                'heading': home.pop('heading'),
                'subheading': home.pop('subheading'),
                'items': home.pop('items')
            }
    
    with open('zh.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    fix_en()
    fix_zh()
    print("Fixed both en.json and zh.json")