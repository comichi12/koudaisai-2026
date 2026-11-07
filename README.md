# Grazie!! 工大祭教室ライブ2026

GitHub Pagesで公開できる静的サイトです。ビルド作業は不要です。

## プレビュー
`index.html` をブラウザーで開いてください。Google Fontsが使えない環境でも閲覧できます。

## 公開手順（GitHub Pages）
1. GitHubで新しい公開リポジトリを作り、サイト一式をアップロードします。
2. リポジトリの **Settings → Pages** を開きます。
3. **Deploy from a branch** を選び、`main` ブランチの `/ (root)` を指定して保存します。
4. 数分後に表示される `https://<ユーザー名>.github.io/<リポジトリ名>/` が公開URLです。

独自ドメインを使わない場合、GitHub PagesのURLで無料公開できます。

## あとから差し替える場所
- Instagram / X: `script.js` の `socialUrls` に公式URLを設定してください。未設定のSNSは準備中の案内が出ます。
- タイムテーブル: 公開PDFを `pdf/timetable.pdf` として配置してください。
- バンド紹介: 公開PDFを `pdf/bands.pdf` として配置してください。

PDFを配置する前のリンク先には準備中PDFがありません。PDF公開後は案内文を `index.html` の placeholder-note から削除できます。

## ファイル
- `index.html`: ページ内容
- `style.css`: デザインとスマートフォン対応
- `script.js`: SNSリンク設定
- `pdf/`: PDF配置先
