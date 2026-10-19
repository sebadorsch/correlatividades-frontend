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
  </>
);

export default PageContainer;
