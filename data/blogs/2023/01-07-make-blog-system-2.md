---
title: ブログシステムを作る(2) - スタイリングとDeploy
description: tailwindとCSS Modulesをつかって見た目のお手入れをして、サイトを公開しました。
published_at: 2023-01-07
---

ブログの大枠ができたので、今日はレイアウトを作ったり、GitHub Actions でデプロイできるようにしました。

# スタイリング

## CSS のスタックを検討する

色々みてみたけど、CSS in JS は脱出したりするのがめんどくさそうということで、素朴に[tailwindcss](https://tailwindcss.com/)を使ってみることにした。最初はどうなのだろうと懐疑的だったけれども、Next.js が[サポートしている CSS Modules](https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css)と組み合わせたら結構[いい感じ](https://github.com/mactkg/makerbox.net/blob/main/components/blogs/article.module.scss)になった。

例えばこの markdown を表示するコンポーネントのスタイルは[`article.module.scss`](https://github.com/mactkg/makerbox.net/blob/main/components/blogs/article.module.scss)で定義してある。このファイルは tailwind の[`@apply` directive](https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply)を使って CSS を定義して、モジュールを[コンポーネントで読み込まれスタイルを割り当てる](https://github.com/mactkg/makerbox.net/blob/1406d27542fcdd190af630ac6a131ecfae029a16/components/blogs/Article.tsx#L2-L5)、ということをしている。

```scss
/* article.module.scss */
.article {
  h1 {
    @apply text-2xl py-4 mt-8 underline underline-offset-4;
  }
  h2 {
    @apply text-xl py-3 mt-8;
  }
  /* ... */
}
```

```ts
// Article.tsx
import { FC } from "react";
import style from "./article.module.scss";

const Article: FC<{ html: string }> = ({ html }) => {
  return (
    <div
      className={style.article}
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );
};
export default Article;
```

tailwind は後から色のテーマとかをいい感じに[カスタマイズできる](https://tailwindcss.com/docs/customizing-colors#using-custom-colors)みたいなので、なるべく tailwindcss の指定方法を活用していくと良さげ。

## Layout ファイルを作る

基本的には各ページ揃った見た目にしたかったので、`components/common`を作って Layout ファイルを作った。おいおいこのプロジェクトは Web プロジェクトの実験場にしたいと思っていたので、Layout ファイルをグローバルに適用するのは少し憚られたけれども、どうしてもグローバルにしたい場合は `pages/_app.js` をいい感じにすればいいと思い思い切って[全体に Layout 適応をした。](https://github.com/mactkg/makerbox.net/blob/1406d27542fcdd190af630ac6a131ecfae029a16/pages/_app.tsx)

Next.js の公式サイトにも Layout の指南はあるので、いざという時には参考にできそう: [Basic Features: Layouts | Next.js](https://nextjs.org/docs/basic-features/layouts)

# GitHub Actions でデプロイする

デプロイ先は一旦最もお手軽そうな GitHub Actions で。スクリプト自体は[GitHub に公開したので](https://github.com/mactkg/makerbox.net/blob/d4926a14679281eb91b8cc7c3966f38a03e2e61b/.github/workflows/deploy-gh-pages.yml)そちらでみてもらうとして。

昔と比べると色々変わっていた。変わっていたところで言うと...

- カスタムドメインを使うには[ドメインの認証が必要](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- gh-pages branch で公開される運用とは別に、[actions/deploy-pages](https://github.com/actions/deploy-pages)を使った方式が登場

というあたり。他にも GitHub Actions の `GITHUB_TOKEN` の[permission を workflow/job ごとに指定できる](https://docs.github.com/ja/actions/security-guides/automatic-token-authentication#modifying-the-permissions-for-the-github_token)ようになっていたり、進化していた（前からできたっけ？）。

ということでひとまず公開できる形になった。他にもやりたいことがあるので [`TODO`](https://github.com/mactkg/makerbox.net/blob/main/TODO) に記載している。

# もの書きスペースの使い分け

[Scrapbox](https://scrapbox.io/mactkg-pub/)、[はてなブログ](https://mactkg.hateblo.jp/)、[Zenn](https://zenn.dev/mactkg)と、パッと思いつくだけでも、ものを書くスペースはいくつかあるのだけれども、なんとなくそれぞれこんな感じで使い分けられればと考えている。

- Zenn: ちょっとした Tips、例えば GITHUB_TOKEN の Permission の話など
- Scrapbox: ちょっとしたメモ
- はてなブログとこのブログ: 迷い中
  - 基本的にはてなブログの方が購読者が多いので、あっちはもう少し大作置き場みたいな感じにするかもしれない
  - そんなに使い分けできるのかは不明。でもはてなブログと比べて軽いのは気に入っている

いつまで続くかはわからないけど、長く続けられるといいですね。
