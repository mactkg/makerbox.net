import { FC } from "react"

type Props = {
  title?: string
  description?: string
}
const OGP: FC<Props> = ({ title, description }) => {
  const ogpTitle = title ? `${title} - makerbox.net` : "makerbox.net"

  return (
    <>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@mactkg" />
      <meta name="twitter:creator" content="@mactkg" />
      <meta property="og:title" content={ogpTitle} />
      { description && <meta property="og:description" content={description} /> }
    </>
  )
}
export default OGP
