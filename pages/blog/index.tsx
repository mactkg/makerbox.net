import { NextPage } from 'next';
import Link from 'next/link';
import { FC } from 'react';
import { getAllArticles, openArticle } from '../../lib/blogs';

type Props = {
  articles: ArticleSummaryProp[];
};

type ArticleSummaryProp = {
  title: string
  slug: string
  published_at: string
}

const ArticleSummary: FC<ArticleSummaryProp> = ({title, slug, published_at}) => {
  return (
    <li>
      <Link href={`/blog/${slug}`}>
        <p>{published_at} - {title}</p>
      </Link>
    </li>
  )
}

const ArticleList: NextPage<Props> = ({ articles }) => {
  return (
      <ul>
          {articles.map((article, i) => (
            <ArticleSummary key={i} {...article}/>
          ))}
      </ul>
  );
};

export const getStaticProps = async() => {
  const articlePath: string[] = await getAllArticles();
  const articles: ArticleSummaryProp[] = await Promise.all(articlePath.map(async path => {
    const article = await openArticle(path);
    return {
      title: article.attributes.title,
      slug: article.slug,
      published_at: article.attributes.published_at.toDateString()
    }
  }))

  return {
    props: { articles: articles.reverse() }
  };
}

export default ArticleList;
