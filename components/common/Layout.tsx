import { FC, ReactNode } from 'react'
import Footer from './Footer';
import Navbar from './Navbar'

const Layout: FC<{children: ReactNode}> = ({ children }) => {
    return (
      <div className='flex flex-col min-h-screen'>
        <Navbar />
        <main className="flex-grow p-8">{children}</main>
        <Footer />
      </div>
    )
  }
export default Layout;
