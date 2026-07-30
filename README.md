# 情報カード

タイトル・本文・タグを持つ「情報カード」を登録・検索・閲覧するための個人用Webシステム。

## 構成

- 検索・閲覧・カード詳細はすべて静的サイトとして動作し、GitHub Pagesで公開する
- **登録・編集はローカルの開発サーバー(`npm run dev`)でのみ行う**。GitHub Pagesにデプロイされた本番サイトには登録機能自体が含まれない
- カードは `content/cards/*.md` に1ファイル1カード(YAML frontmatter + Markdown本文)として保存する

## 使い方

### カードを登録・編集する(ローカル)

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開き、「登録」タブからカードを作成・編集する。保存すると `content/cards/` にMarkdownファイルが作成・更新される。

内容を確認したら、通常のgit操作で反映する:

```bash
git add content/cards
git commit -m "add: ○○のカードを追加"
git push
```

pushすると GitHub Actions (`.github/workflows/deploy.yml`) が自動でビルドし、GitHub Pagesに反映される。

### 検索・閲覧のみ(外出先・スマホなど)

GitHub PagesのURLにアクセスするだけでよい。検索・閲覧画面はスマホでも使いやすいレスポンシブデザインになっている。

## GitHub Pagesの設定

1. GitHubにリポジトリを作成しこのプロジェクトをpush
2. リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定
3. `main` ブランチにpushすると自動でデプロイされる

### AIによる補足機能

カード詳細画面の「🔍 AIに補足してもらう」は、Gemini APIキーの入手経路によって2通りの動作をする。

- `npm run dev` のローカル開発サーバーが動いている場合: サーバー側の環境変数 `GEMINI_API_KEY` を使って裏側から呼び出す(ブラウザにキーは渡らない)
- GitHub Pagesなど静的配信のみの環境(スマホ等)の場合: カード詳細画面下部の「🔑 AI機能のAPIキー設定」からGemini APIキーを入力・保存すると、以後はその端末のブラウザから直接Googleへリクエストする。保存したキーはその端末の`localStorage`にのみ残り、リポジトリやサーバーには一切送信されない

## 補足

- 「最終閲覧日」は静的サイトからリポジトリへ書き戻せないため、ブラウザの`localStorage`に端末ごとに記録している(検索・並び替え自体は登録日ベースのため影響なし)
- 初期タグ: 世界史・日本史・地理・倫理・地学・天文・登山・健康・生活(登録画面から自由に追加可能)
