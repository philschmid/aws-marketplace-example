import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createEndpointInput, Endpoint } from '../pages/api/endpoints';

const defaultState: Endpoint[] = [];

export default function EndpointList() {
  const { data: session } = useSession();
  const [endpoints, setEndpoints] = useState(defaultState);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/endpoints', { method: 'GET' });
      if (res.status !== 200) {
        // @ts-ignore
        const error = await res.json();
        console.error(error);
        alert(error.error);
      }
      const { endpoints } = await res.json();
      if (endpoints && endpoints.length > 0) {
        setEndpoints(endpoints);
      }
    };

    fetchData();
  }, []);

  return endpoints.length > 0 ? (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="p-1.5 w-full inline-block align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(endpoints[0]).map((key) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {endpoints.map((endpoint) => (
                  <tr key={endpoint.endpointName}>
                    {Object.values(endpoint).map((value) => (
                      <td
                        key={value}
                        className="px-6 py-4 text-sm font-medium text-gray-200 whitespace-nowrap"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-2xl">No endpoints found</div>
  );
}
