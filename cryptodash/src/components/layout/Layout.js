import React from 'react';
import Loading from './Loading';
import { useLoading } from './LoadingContext'; // Asumiendo que estás usando el contexto que mencioné anteriormente

const Layout = ({ children }) => {
  const { isLoading } = useLoading();

  return (
    <div className="layout-container">
      {children}
      {isLoading && <Loading />}
    </div>
  );
};

export default Layout;
