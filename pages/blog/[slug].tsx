import { NextPage } from "next";
import Link from "next/link";
import { getAllArticles, openArticle, pathToSlug, slugToPath } from "../../lib/blogs";

type Props = {
    title: string
    bodyHTML: string
    slug: string
}

const ArticlePage: NextPage<Props> = ({ title, bodyHTML, slug }) => {
    return (
        <div>
            <p><Link href={"/blog"}>👈 Blog List</Link></p>
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{__html: bodyHTML}}></div>
        </div>
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
            bodyHTML: await article.renderHTML(),
            slug
        }
    };
}

  export default ArticlePage;
