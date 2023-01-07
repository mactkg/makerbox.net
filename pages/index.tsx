import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>makerbox.net</title>
        <meta name="description" content="mctk - マクトクのWebサイトです。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ul>
          <li><Link href={"/blog"}>/blog</Link></li>
        </ul>
      </main>
    </>
  )
}
