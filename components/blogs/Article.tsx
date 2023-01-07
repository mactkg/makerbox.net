import { FC } from "react"
import style from "./article.module.scss"

const Article: FC<{html: string}> = ({ html }) => {
    return <div className={style.article} dangerouslySetInnerHTML={{__html: html}}></div>
}
export default Article;
