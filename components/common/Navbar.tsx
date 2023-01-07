import Link from "next/link";
import { FC } from "react"

const Title = () => {
    return <h1 className="text-xl font-light text-neutral-700">makerbox.net</h1>
}

const Navbar: FC<{}> = () => {
    return <header className="flex p-4 bg-neutral-100">
        <div className="flex">
            <Link href="/">
                <Title />
            </Link>
        </div>
    </header>;
}

export default Navbar;
