#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ポモドーロタイマーアプリケーション
視覚的フィードバック強化版（パターンA）
"""

from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

# テンプレートフォルダの設定
template_folder = os.path.join(os.path.dirname(__file__), 'templates')
static_folder = os.path.join(os.path.dirname(__file__), 'static')
app.template_folder = template_folder
app.static_folder = static_folder

# デフォルト設定
DEFAULT_WORK_TIME = 25 * 60  # 25分（秒単位）
DEFAULT_BREAK_TIME = 5 * 60   # 5分（秒単位）

@app.route('/')
def index():
    """メインページを表示"""
    return render_template('index.html', 
                         work_time=DEFAULT_WORK_TIME,
                         break_time=DEFAULT_BREAK_TIME)

@app.route('/api/config')
def get_config():
    """設定情報をJSON形式で返す"""
    return jsonify({
        'workTime': DEFAULT_WORK_TIME,
        'breakTime': DEFAULT_BREAK_TIME
    })

if __name__ == '__main__':
    # テンプレートとstaticディレクトリを作成
    os.makedirs(template_folder, exist_ok=True)
    os.makedirs(static_folder, exist_ok=True)
    os.makedirs(os.path.join(static_folder, 'css'), exist_ok=True)
    os.makedirs(os.path.join(static_folder, 'js'), exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
