import fm from "front-matter";
import { marked } from "marked";
import { pathToSlug } from "./files";

export interface ArticleAttribute {
  title: string;
  description: string;
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

    const html = await marked.parse(this.body, { async: true });
    this.renderedHTML = html;
    return html;
  }
}
