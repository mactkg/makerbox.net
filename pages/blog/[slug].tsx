import { NextPage } from "next";
import Head from "next/head";
import Article from "../../components/blogs/Article";
import ArticleHeader from "../../components/blogs/ArticleHeader";
import { getAllArticles, openArticle, pathToSlug, slugToPath } from "../../lib/blogs";

type Props = {
    title: string
    description: string
    published_at: string
    bodyHTML: string
    slug: string
}

const ArticlePage: NextPage<Props> = ({ title, published_at, bodyHTML, description, slug }) => {
    const ogpTitle = `${title} - makerbox.net`
    return (
        <>
            <Head>
                <title>{ogpTitle}</title>
                <meta name="description" content={description} />
                <meta name="og:title" content={ogpTitle} />
                <meta name="og:description" content={description} />
            </Head>
            <div>
                <ArticleHeader title={title} published_at={published_at} />
                <Article html={bodyHTML}/>
            </div>
        </>
    );
  };

export const getStaticPaths = async () => {
    const articlePath: string[] = await getAllArticles();
    return {
        paths: articlePath.map(path => ({
            params: { slug: pathToSlug(path) }
        })),
        fallback: false
    }
}

export const getStaticProps = async (context: any) => {
    const slug = context.params?.slug
    const path = slugToPath(slug)
    if(!path) {
        return {
            notfound: true
        }
    }

    const article = await openArticle(path);
    return {
        props: {
            title: article.attributes.title,
            description: article.attributes.description,
            published_at: article.attributes.published_at.toDateString(),
            bodyHTML: await article.renderHTML(),
            slug
        }
    };
}

  export default ArticlePage;
