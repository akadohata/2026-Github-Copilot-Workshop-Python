# Pomodoro Web App Architecture

## 目的
Flask と HTML/CSS/JavaScript を用いて、UI モックに忠実で拡張可能な Pomodoro タイマー Web アプリを構築する。

## 設計方針
- フロント主導: タイマー状態はブラウザ側で管理する。
- バックエンドは配信と設定の受け皿: まずはテンプレート配信中心、必要に応じて API を追加。
- ルーティングはシンプルに保つ: 基本は `GET /` のみ。

## ディレクトリ構成（Pomodoro 関連は 1.pomodoro/ 配下）
- 1.pomodoro/app.py
- 1.pomodoro/templates/index.html
- 1.pomodoro/static/css/style.css
- 1.pomodoro/static/js/app.js
- 1.pomodoro/static/assets/

### ユニットテスト性を高める追加構成
- 1.pomodoro/static/js/core/state.js
- 1.pomodoro/static/js/core/timer.js
- 1.pomodoro/static/js/adapters/clock.js
- 1.pomodoro/static/js/adapters/storage.js
- 1.pomodoro/static/js/ui/render.js

## 役割分担
### Flask（app.py）
- `GET /` でテンプレート配信。
- 初期設定（作業/休憩時間、テーマなど）をテンプレートに渡す。
- 将来的に設定保存や履歴保存の API を追加可能。

### フロントエンド
- HTML: UI モックに忠実な構造を定義。
- CSS: CSS 変数で配色/タイポグラフィ/余白を統一管理。
- JS: タイマー状態管理、ユーザー操作、UI 反映。

## フロントエンド内部設計
### 状態モデル
- `mode`: `work` / `shortBreak` / `longBreak`
- `status`: `idle` / `running` / `paused`
- `remainingSeconds`
- `cycleCount`（長休憩判定用）

### 主要関数
- `startTimer()`, `pauseTimer()`, `resetTimer()`
- `switchMode(nextMode)`
- `tick()`（1 秒ごと）
- `render(state)`（UI 更新の集約）

## ユニットテスト性のための改善点
- 状態遷移ロジックは純粋関数に分離する。
- UI 更新は `render` に集約し、状態更新と切り離す。
- `setInterval` や現在時刻参照は `clock` インターフェース化して差し替え可能にする。
- `localStorage` は `storage` モジュール経由にしてテスト時に差し替えられるようにする。
- イベントハンドラは薄くし、状態更新ロジックはコアに集約する。

## 必須機能（追加要件）
- 履歴と可視化のためのダッシュボードを提供する。

## アクセシビリティ要件
- マウスクリックで開始/停止ができる。
- キーボード操作: `S` で開始、`I` で停止、`E` で終了。

## 将来拡張の API 例
- `GET /api/settings` 初期設定取得
- `POST /api/settings` 設定保存
- `POST /api/logs` セッション履歴保存

## 進行手順の推奨
1. UI モックの DOM 構造を `index.html` に再現。
2. CSS でレイアウトと配色を確定。
3. JS でタイマー機能を実装。
4. 必要に応じて Flask 側に API を追加。
