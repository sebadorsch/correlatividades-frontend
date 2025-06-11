import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import Navbar from "../Navbar/Navbar";

type PageContainerProps = {
  children: ReactNode;
  includeBackButton?: boolean;
};

const PageContainer: FC<PageContainerProps> = ({
  children
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className='container mt-4'>
        {children}
      </div>
    </>
  );
};

export default PageContainer;
