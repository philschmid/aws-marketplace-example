import { createContext, useContext, useState } from 'react';
import { Endpoint } from '../pages/api/endpoints';

export const EndpointContext = createContext<{
  endpoints: Endpoint[];
  setEndpoints: (newValue: Endpoint[]) => void;
}>({
  endpoints: [],
  setEndpoints: () => undefined,
});

export const EndpointProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  return (
    // @ts-ignore
    <EndpointContext.Provider value={{ endpoints, setEndpoints }}>
      {children}
    </EndpointContext.Provider>
  );
};

export const useEndpointContext = () => {
  const { endpoints, setEndpoints } = useContext(EndpointContext);

  const handleEndpoints = (value: Endpoint[]) => {
    setEndpoints(value);
  };

  return { endpoints, handleEndpoints };
};
