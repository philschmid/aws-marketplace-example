import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { Endpoint } from '../pages/api/endpoints';

export const EndpointContext = createContext<Endpoint[] | any[]>([]);

export const EndpointProvider = ({ children }: { children: JSX.Element }) => {
  const [endpoints, setEndpoints] = useState([]);

  return (
    // @ts-ignore
    <EndpointContext.Provider value={[endpoints, setEndpoints]}>
      {children}
    </EndpointContext.Provider>
  );
};

export const useEndpointContext = () => {
  const [endpoints, setEndpoints] = useContext(EndpointContext);

  const handleEndpoints = (value: Endpoint) => {
    setEndpoints(value);
  };

  return { endpoints, handleEndpoints };
};
