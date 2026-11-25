import React, { FC, ReactNode } from 'react';
import Navbar from "../Navbar/Navbar";

type PageContainerProps = {
  children: ReactNode;
};

const PageContainer: FC<PageContainerProps> = ({ children }) => (
  <>
    <Navbar />
    <main className="canvas">
      {children}
    </main>
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>¿Encontraste un error o querés sumar algo?</span>
        <a href="mailto:sebastian.adorsch@gmail.com">sebastian.adorsch@gmail.com</a>
      </div>
    </footer>
  </>
);

export default PageContainer;
