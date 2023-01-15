import fm from "front-matter";
import { marked } from "marked";
import shiki from "shiki";
import { pathToSlug } from "./files";

export interface ArticleAttribute {
  title: string;
  description: string;
  published_at: Date;
}

export class Article {
  readonly attributes: ArticleAttribute;
  readonly body: string;
  readonly slug: string;
  private renderedHTML: string | null = null;

  constructor(
    raw: string,
    readonly path: string,
    readonly ctime: Date,
    readonly mtime: Date
  ) {
    const { attributes, body } = fm<ArticleAttribute>(raw);

    this.attributes = attributes;
    this.body = body;

    const slug = pathToSlug(path);
    if (slug === null) {
      throw new Error("invalid path");
    } else {
      this.slug = slug;
    }
  }

  async renderHTML(): Promise<string> {
    if (this.renderedHTML) return this.renderedHTML;

    return new Promise((resolve) => {
      // marked()の第三引数にcallbackが渡っていないと
      // highlight optionがasyncにならないので、callback形式にする。
      // remarkに移してもいいかも。
      // https://github.com/markedjs/marked/blob/4aee878ac913e55941407897a8221040f8817b48/src/marked.js#L39-L106
      marked(
        this.body,
        {
          highlight: this.renderCode,
        },
        (_, result) => {
          this.renderedHTML = result;
          resolve(result);
        }
      );
    });
  }

  // <pre>タグや<code>タグで囲わずにshikiでrenderした結果を返す
  private renderCode(code: string, lang?: string, callback?: Function) {
    const fn = async () => {
      const highlighter = await shiki.getHighlighter({
        theme: "github-light",
      });
      const tokens = highlighter.codeToThemedTokens(code, lang);
      const html = shiki.renderToHtml(tokens, {
        elements: {
          pre({ children }) {
            return children;
          },
          code({ children }) {
            return children;
          },
        },
      });

      callback ? callback(undefined, html) : null;
    };
    fn();
  }
}
