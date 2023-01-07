import Link from "next/link";
import { FC } from "react"
import style from "./articleHeader.module.scss"

const ArticleHeader: FC<{title: string, published_at: string}> = ({ title, published_at }) => {
    return <header>
        <h1 className={style.title}>{title}</h1>
        <h2>{published_at}</h2>
    </header>
}
export default ArticleHeader;
