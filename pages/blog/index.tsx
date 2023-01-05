import { NextPage } from 'next';
import Link from 'next/link';
import { FC } from 'react';
import { getAllArticles, openArticle } from '../../lib/blogs';

type Props = {
  articles: ArticleSummaryProp[];
};

type ArticleSummaryProp = {
  title: string,
  slug: string
}

const ArticleSummary: FC<ArticleSummaryProp> = ({title, slug}) => {
  return (
    <div>
      <Link href={`/blog/${slug}`}>
        <p>{title}</p>
      </Link>
    </div>
  )
}

const ArticleList: NextPage<Props> = ({ articles }) => {
  return (
      <div>
          {articles.map((article, i) => (
            <ArticleSummary key={i} {...article}/>
          ))}
      </div>
  );
};

export const getStaticProps = async() => {
  const articlePath: string[] = await getAllArticles();
  const articles: ArticleSummaryProp[] = await Promise.all(articlePath.map(async path => {
    const article = await openArticle(path);
    return {
      title: article.attributes.title,
      slug: article.slug
    }
  }))

  return {
    props: { articles }
  };
}

export default ArticleList;
