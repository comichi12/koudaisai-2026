# Grazie!! 工大祭教室ライブ2026

公開タイムテーブル・バンド別ページ・担当者用進行画面。Grazie!!ポータルには依存しません。

- 公開サイト: GitHub Pages / HTML・CSS・JavaScript（ビルド不要）
- 進行共有・履歴保存: 独立したCloudflare Workers + D1
- 認証画面なし。担当者ごとの秘密キーを含む専用URLで操作
- 元サイトの暖色を活かし、Grazie!! Webと同じ書体・フッター・ロゴを使用。Material Design 3の形状・余白・状態表示を参考にした独自CSS

## ローカルで確認

Node.js 24以上:

```sh
npm install
npm test
npm run preview
```

表示された `http://127.0.0.1:8788/` と担当者用URLで確認できます。プレビューはローカル専用・メモリDBで、終了するとログが消えます。本番には使わないでください。

## 本番APIの準備

1. Cloudflareにサインインし、D1を作成します。

```sh
npx wrangler login
npx wrangler d1 create koudaisai-live
```

2. 表示されたdatabase_idを`wrangler.toml`へ設定します。
3. `PUBLIC_ORIGIN`は公開サイトのOriginを指定します。GitHub Pagesなら `https://comichi12.github.io`（パスは不要）。複数の場合はカンマ区切り。
4. 担当者ごとに32バイト以上のランダムなキーを生成し、担当者名とキーのJSONをCloudflare Secret `OPERATOR_KEYS`として設定します。秘密キーはGitに含めず、チャットや公開サイトにも掲載しません。

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
npx wrangler secret put OPERATOR_KEYS
```

Secretの値の形式（以下は説明用。実際にはランダムキーを使う）:

```json
{"担当者A":"GENERATE_RANDOM_KEY_FOR_A","担当者B":"GENERATE_RANDOM_KEY_FOR_B"}
```

5. D1にテーブルを作成してWorkerを公開します。

```sh
npm run db:remote
npm run deploy
```

6. `config.js`の`API_BASE`に公開されたWorkerのHTTPS URLを設定し、GitHubへpushします。Cloudflare側とGitHub Pages側の双方が公開されて初めてリアルタイム共有が動作します。

## GitHub Pages

従来どおりmainブランチのルートを公開します。`_config.yml`で`pdf/`やAPI実装・テスト・運用資料を公開成果物から除外します。**`.nojekyll`を追加しないでください。** Actionsを使ってファイルを直接公開する場合も、`pdf/`などを含めず公開ファイルを明示して配置してください。

元からGitにあるタイテPDFは内部のバンド別時刻を含むため、サイトからのリンクを削除しました。Gitの過去履歴やraw URLから既公開データが消えるわけではありません。

## 当日の操作

担当者へ次の形式のURLを個別に共有します。

`https://comichi12.github.io/koudaisai-2026/admin.html#key=担当者のランダムキー`

- ログイン画面はありません。URLを知る人が操作できるので、担当者以外には共有しません。
- 開いた後、キーはURL欄から削除してタブのメモリにのみ保持します。再読み込み時は元の専用URLから開き直してください。
- 公演日とバンドを選択し、開始時に切り替えます。「次の枠へ進む」は休憩・終演を含む次の枠を選びます。
- 観客画面は5秒ごとに進行を取得します。接続に失敗した場合は最後に取得した内容と接続待ちを表示します。
- 誤操作は正しい枠へ切り替え直し、備考へ訂正と記録します。履歴は消さず追記します。
- 同時に操作した場合は、古い状態からの更新を拒否します。最新の進行を確認して再操作してください。
- 終演後「CSVを保存」から全履歴をダウンロードします。日本時間の切替時刻・担当者・備考・次の切替までの秒数を収録します。継続秒数はMCや転換も含む状態の長さで、純粋な演奏時間とは限りません。
- キーを失効するにはCloudflareの`OPERATOR_KEYS`から対象キーを削除・変更します。ポータルの権限には影響しません。

## データの更新

`data.js`の`definitions`に、公演日・部開始時刻・部内出演順・曲目を設定します。正本はC/Grazie!!運営/工大祭のタイテ確定版PDF。1日目はユーザー確認により各部の欄の12:00 / 13:08 / 14:45を採用しています。

**バンド別の予定開始・終了・演奏時間は公開データへ入れません。** 実開始時刻と操作履歴は担当者APIのみで返し、一般向けAPIは現在の枠ID・バージョンだけを返します。

各バンドの紹介文・写真・メンバーは`bands`の該当データへ追加できます。現在、元リポジトリに紹介PDFがなく未提供のため、名前・出演する部・曲目のみ表示します。画像は`assets/`へ置き、`photo`へ相対パスを設定してください。紹介文などを更新する場合はIDを維持してください。

Workerも同じdata.jsを使うため、タイテの変更時はWorkerの再デプロイも必要です。実運用開始後に枠IDを変えると過去ログとの対応が崩れます。履歴を残すイベントは開催後にデータとCSVを保存し、翌年分は新しいDB・データセットへ切り替えてください。

## 公開前確認

デザインはTailwind CSSで管理します。styles/input.cssを編集し、npm run build:cssでstyle.cssを生成して両方コミットしてください。GitHub Pagesでは生成済みCSSを配信するため、ブラウザーでTailwindの実行やCDN読込は不要です。

- WorkerとD1の公開、API_BASE、PUBLIC_ORIGIN、OPERATOR_KEYS
- 担当者用URLから操作し、別端末の公開ページへ反映されること
- 本番でCSVを取得できること
- 公開先の `/pdf/timetable.pdf` が非公開になっていること
- バンド紹介は提供済みの31枚のPNGをそのまま掲載。対応はband-posters.jsで管理し、出演番号は部ごとに数える。

技術仕様: [Cloudflare D1 API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
