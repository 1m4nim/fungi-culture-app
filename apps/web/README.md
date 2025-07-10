# 開発ログ（2025年7月3日〜10日）

## 7月3日（木）
- Firestore にテキストと画像のログを保存するアプリの開発を開始
- Firebase プロジェクト作成、Firestore の初期設定
- ログの入力・表示機能を仮実装

## 7月4日（金）
- Firebase Storage を使って画像アップロード機能を追加
- Firestore に画像 URL を保存するように実装
- 画像プレビュー機能も追加

## 7月5日（土）
- ログの編集・削除機能を追加
- モーダル表示で編集可能に
- Firestore クエリに `orderBy` を追加して新しい順に表示

## 7月6日（日）
- 作成日時を表示（`toLocaleString()` で整形）
- フォーム入力のバリデーション（メモ未入力時にアラート）

## 7月7日（月）
- 画像の削除機能を追加（Storage 上の画像も削除）
- Firebase Emulator の導入を検討（ローカル動作のため）

## 7月8日（火）
- CORS ポリシーによる画像アップロードエラーが発生
- `gsutil cors set` で設定しようとしたがバケットが見つからず失敗

## 7月9日（水）
- Firebase CLI, gcloud CLI のインストールと設定
- `gsutil` の本来のコマンドが動作せず混乱
- Firebase Storage の使用を断念し、Base64 で画像を Firestore に保存する方向へ方針変更

## 7月10日（木）
- `LogForm.tsx` を全面修正
  - 画像はアップロードせず Base64 文字列として Firestore に保存
  - 表示・編集時も同様に Base64 を使用
- Firebase Storage の依存を完全に削除し、CORS 問題を回避
