---
title: ブログシステムを作る(3) - marked.jsでparseしたMarkdownにshikiでSyntax Highlighting
description: Syntax Highlighterのshikiを使ってコードに色をつけます。意外とハマりました。
published_at: 2023-01-15
---

今日は前から試したかった[shiki](https://shiki.matsu.io/)を使ってSyntax Highlightingを実装してみました。

# Shiki - a beautiful syntax highlighter
ShikiはMicrosoftでVS Codeの開発に従事していた[Pine](https://blog.matsu.io/about)さんが実装しているSyntax Highlighterで、仲間内のDiscordで話題になっていたので試してみたいと思っていたものです。

TextMateのgrammerを構文解析に使っているため、[かなりの数の言語](https://github.com/shikijs/shiki/blob/main/docs/languages.md)をハイライトすることができて便利です。

## 使用感
READMEから引っ張ってきたものですが、こんな感じ。HighlighterをAsyncで取ってこないといけないのがちょっと微妙ではあります。
`getHighlighter`で[ThemeやLanguageの情報を非同期で取ってくる](https://github.com/shikijs/shiki/blob/2e4a6c75e7f5f3b6da451cbcdc73234421631b03/packages/shiki/src/highlighter.ts#L55-L58)仕組みになっているので、仕方ない感じも。

```js
const shiki = require('shiki')

shiki
  .getHighlighter({
    theme: 'nord'
  })
  .then(highlighter => {
    console.log(highlighter.codeToHtml(`console.log('shiki');`, { lang: 'js' }))
  })

// <pre class="shiki nord" style="background-color: #2e3440"><code>
//   <!-- Highlighted Code -->
// </code></pre>
```

# Markedと組み合わせて使う
## Markedのハイライト機能を使う
これ、思ったより苦戦しました。まず、元々Markedでrenderしていた部分のコードが以下の通り。

```ts
// https://github.com/mactkg/makerbox.net/blob/eedce8477aa0efa35f8bba85b336f510111a8d7b/lib/blogs/article.ts#L36-L41
async renderHTML(): Promise<string> {
  if (this.renderedHTML) return this.renderedHTML;

  const html = await marked.parse(this.body, { async: true });
  this.renderedHTML = html;
  return html;
}
```

シンプルですね。Markedには[Syntax Highlighting](https://marked.js.org/using_advanced#highlight)の機能があり、これを使えばうまく動きそうです。

```ts
async renderHTML(): Promise<string> {
  if (this.renderedHTML) return this.renderedHTML;

  const html = await marked.parse(this.body, {
    async: true,
    highlight: (code, lang, callback) {
      shiki
        .getHighlighter({ theme: 'nord' })
        .then((highlighter) => {
          const html = highlighter.codeToHtml(code, { lang })
          callback ? callback(html) : null;
        });
    }
  });
  this.renderedHTML = html;
  return html;
}
```

が、これが動かない。。。よくよくみてみると、highlightの第三引数の `callback` が渡ってきていないのです。何事?

highlightの処理は[ここ](https://github.com/markedjs/marked/blob/137d3b4cc040b2d1e806da870d1cc0bd908419a7/src/marked.js#L83-L96)でやっているようなのですが、この処理が呼ばれるのは [`marked.parse` の第三引数にcallback関数が渡っている時だけ](https://github.com/markedjs/marked/blob/137d3b4cc040b2d1e806da870d1cc0bd908419a7/src/marked.js#L39)。

### 動いた！
仕方なく、このようなコードにしました。 `highlight` の中でPromiseを扱う必要がなくなって、見通しも良くなったきも。

```ts
async renderHTML(): Promise<string> {
  if (this.renderedHTML) return this.renderedHTML;

  const highlighter = await shiki.getHighlighter({ theme: 'nord' })
  const html = await marked.parse(this.body, {
    async: true,
    highlight: (code, lang, callback) {
      return highlighter.codeToHtml(code, { lang })
    }
  });
  this.renderedHTML = html;
  return html;
}
```

## スタイリングの調整
ということでひとまずSyntax Highlightingはできたのですが、見た目が微妙な感じになってしまっています。

[![Image from Gyazo](https://i.gyazo.com/c0d92e655ef1308b3a5fd95095007565.png)](https://gyazo.com/c0d92e655ef1308b3a5fd95095007565)

よくよく見てみると、DOM構造がネストしていました。

[![Image from Gyazo](https://i.gyazo.com/0ddd5711723db1a53f67e140781f5540.png)](https://gyazo.com/0ddd5711723db1a53f67e140781f5540)

markedの `highlight` 関数は `<pre>` と `<code>` の中身だけを返すことを想定している一方で、shikiは返してしまっているみたいです。今回は、shikiのカスタマイズ機能を使って実装をしてみます。

### Custom rendering
shikiのREADMEにある、[`Custom rendering of code blocks`](https://github.com/shikijs/shiki#custom-rendering-of-code-blocks)を参考にしながら実装していけば特に迷いませんでした。`codeToThemedTokens` でトークンに分けた後、 `renderToHTML` で描画をすればOK。 `renderToHTML` のオプション引数で描画方式をカスタマイズできる。

```ts
import shiki, { getHighlighter } from 'shiki'

const highlighter = await getHighlighter({
  theme: 'nord',
  langs: ['javascript', 'python']
})

const code = `console.log("Here is your code.");`

const tokens = highlighter.codeToThemedTokens(code, 'javascript')

const html = shiki.renderToHTML(tokens)
```

このブログを書く過程でREADMEがおかしいことに気づいたのでPRを出しました。 [doc: Fix a way to access `renderToHTML` by mactkg · Pull Request #415 · shikijs/shiki](https://github.com/shikijs/shiki/pull/415)

# 完成！
最終的にはこんな感じになりました。

```ts
async renderHTML(): Promise<string> {
  if (this.renderedHTML) return this.renderedHTML;

  const highlighter = await shiki.getHighlighter({
    theme: "github-light",
  });
  const html = await marked(this.body, {
    async: true,
    highlight(code, lang) {
      const tokens = highlighter.codeToThemedTokens(code, lang);
      return shiki.renderToHtml(tokens, {
        elements: {
          pre({ children }) {
            return children;
          },
          code({ children }) {
            return children;
          },
        },
      });
    },
  });

  this.renderedHTML = html;
  return html;
}
```

# まとめ
- marked.jsで書いたMarkdown内のコードブロックをshikiでSyntax Highlightingした
  - markedのasyncを使っていると、highlightオプションのcallbackが配置されない
  - shikiでレンダリングするHTMLは `renderToHTML` を使えばカスタマイズできる
- 早々にmarked脱出しておくと良さそう

次はアクセスカウンタなど動的なアイテムを入れてみたいなあという気がしています。
