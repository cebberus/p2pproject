import React, { createContext, useState, useContext, useEffect } from 'react';
import Loading from './Loading';

const LoadingContext = createContext();

export const useLoading = () => {
  return useContext(LoadingContext);
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setDelayedLoading(true);
    } else {
      timer = setTimeout(() => {
        setDelayedLoading(false);
      }, 100); // 500 milisegundos de delay
    }

    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {delayedLoading && <Loading />}
    </LoadingContext.Provider>
  );
};

