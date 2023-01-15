---
title: ブログシステムを作る(1) - 枠組みを作る
description: Next.jsを使ってブログシステムとか、Webサイトを作っています
published_at: 2023-01-05
---

# 動機

旅行先で見つけたお気に入りの紹介したい酒場があったりだとか、[雑多な Scrapbox](https://scrapbox.io/mactkg-pub/)以上にコンテンツにフォーカスした形で Web サイトを作っておきたいなあという気持ちが芽生えてきていた。

[2022 AdventCalendar 2022](https://adventar.org/calendars/7814)や[Message Passing](https://messagepassing.github.io/)などでアウトプットでよくアウトプットをお見かけしていた[kzys さんの Web サイト](https://8-p.info/)が[いい](https://thoughts.8-p.info/)[感じ](https://blog.8-p.info/)なので、正月休みを使って何かやってみようという気になったのだった。

[Orca]を作っている[100r.co](https://100r.co/site/home.html)のサイトもいい感じである。

高校の頃に取っておいたこのドメインをしばらく放置し続けていたので、Web サイトをちゃんと作ろうということでとりあえずプロジェクトを作ることにした。markdown で書き留められるブログシステムと、ちょっとしたページがホストできるような感じでいければ良いことにした。

# 技術選定

せっかくなので、最近追いかけられていなかった Svelte だとか、Solid だとか、はたまた Hono + Cloudflare あたりのアーキテクチャに手を出そうと思ったのだが、ブログ記事を読んでなんとなく Hydration を何とかしたいのだと理解した。結局ブログっていうユースケースだと Jekyll や Hugo のようにプリレンダーしておいて、配信する（つまり今風に言えば、SSG だよね）ができれば良いのかなと思い、それだったら手慣れている Next.js を使えば良いだろう。と考えた。

SSG するんだったら大した DB も不要かということで、よくあるブログシステムをスクラッチで書いてみる、という感じになった。

まあ何か他のことがしたくなったら、いい感じにその時アーキテクチャを考えればよいだろうし。

# 今日やったこと

いったん、markdown を書いてページで見れるような枠組みを作ることができた。あとはスタイルを当てていけばなんとかなりそう。

[![](https://gyazo.com/c0c6e49f8ab5a5add1bc8994d34015e7/thumb/200)](https://gyazo.com/c0c6e49f8ab5a5add1bc8994d34015e7)

[![Image from Gyazo](https://gyazo.com/8139704498a130b7363be03614c12839/thumb/200)](https://gyazo.com/8139704498a130b7363be03614c12839)

いかにもテストっぽい。

## init

とりあえず、init。init は、 `npx create-next-app@latest . --ts` でできる。特に特筆することはない。

## ブログシステムのデータ置き場を考える

まずは制約から。今回は SSG を使ってみたいので、SSG しやすい仕組みにしておいた方がよい。具体的には、[getStaticPaths](https://nextjs.org/docs/basic-features/data-fetching/get-static-paths)でパスを一覧できる形になっていなくてはいけない。markdown を読み込まないと URL が知れなかったりするような仕組みだと不便なので、 **URL が決まればパスが決まる。パスが決まれば URL が決まる**という仕組みにするべきだろう。

データ置き場を考える前に URL を検討してみる。とりあえず仮だけど、`makerbox.net/blogs/YYYY-MM-DD-summary` が良いかなというのは軽く考えていた。URL は常にブラウザで見える位置にあるので、ここに日付が入っているのは割とべんりだとおもっていて、大体何時ごろの記事なんだっけ？が URL から辿れるのは便利。同じ日に複数書きたいこともあるだろうから、かるい summary が入れられると良いだろう。

とはいえ、実データも同じような階層構造にするとしんどい。例えば毎週日記を書いたら、2 年で 100 ファイルちょっとになる。そんなには書かないとしても、めちゃめちゃ混雑しているディレクトリを触り続けるのは嫌だ。大体年単位くらいでストックしておけば良いだろうと雑に決めたので、

- ディレクトリ: `data/blogs/[year]/[name].md`
  - name は基本的には`month-day-summary.md`にする
- URL: `/blogs/[year]/[name]`

ということにした。

## ブログ記事のデータ読み書きロジックを作る

Next.js をいじる前に、ブログ記事のデータを読み書きするところを作った。とりあえず、ファイルを一覧したり、ファイルを開いてパースしたりするようなやつ。テストスイートを入れるのがめんどくさかったので、そのファイルが直で実行されたら実行されるテストをファイルの末尾に描くスタイルで行くことにした。

そのファイルが直に実行されているかは、 `require.main === module` を比較すれば良いとドキュメントに書いてある。

> When a file is run directly from Node.js, require.main is set to its module. That means that it is possible to determine whether a file has been run directly by testing require.main === module.
> [Modules: CommonJS modules | Node.js v19.3.0 Documentation](https://nodejs.org/api/modules.html#accessing-the-main-module)

そこに [`node:assert`](https://nodejs.org/api/assert.html) でアサートをする。

```javascript
function fn() {
  return 42;
}

if (require.main === module) {
  assert.equal(fn(), 42);
}
```

## markdown をパースする

markdown をパースするのは何がいいのかざっと調べていて、 `marked`や`markdown-it`などが見つかったけれど、`marked`の方がアクティブっぽかったのでそっちを使うことにした。が、`remark`というパッケージが最近台頭してきていたことに後から気づいたので、そのうち載せ替えるかもしれない。

参考: [Remark で広げる Markdown の世界](https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol2/spring-raining/index.html)

### markdown に Property をつける

Jekyll などは markdown の頭に yaml 形式でプロパティを与えることができるのだが、これは `front-matter` などのパッケージを使って Node のプロジェクトでもサポートすることができる。`front-matter` にテキストを与えると、良い感じにパースした結果を返却してくれる。

```js
import fm from "front-matter";

interface Prop {
  title: string;
  description: string;
}

const { attributes, body } = fm<Prop>(`---
title: This is title
description: The great article
---
Hello world`);

console.log(attributes); // { title: 'This is title', description: 'The great article' }
console.log(body); // Hello world
```

Generics に対応していて interface を渡すと型をつけて返してくれるのは嬉しいところ。一旦タイトルと説明文、公開日を入れられるようにしてみた。タグとかやり始めるとめんどくさいなあと思っている。

## おわりー

今日はこんなとこ。今度はスタイルをいい感じに当てたり、JSX 書いたりするって感じかなー。なるべくコアの機能は lib に寄せていこうと思っているので、いざという時は Solid とか他のフレームワークに移動できるといいな。
