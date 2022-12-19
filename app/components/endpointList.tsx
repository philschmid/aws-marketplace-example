import { TrashIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useEndpointContext } from '../lib/state';
import { Endpoint } from '../pages/api/endpoints';

const defaultState: Endpoint[] = [];

export default function EndpointList() {
  const { data: session } = useSession();
  const { endpoints, handleEndpoints } = useEndpointContext();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/endpoints', { method: 'GET' });
      if (res.status !== 200) {
        // @ts-ignore
        const error = await res.json();
        console.error(error);
        alert(error.error);
      }
      const response = await res.json();
      if (response.endpoints && response.endpoints.length > 0) {
        handleEndpoints(response.endpoints);
      }
    };

    fetchData();
  }, [session]);

  const deleteEndpoint = async (pk: string) => {
    const res = await fetch('/api/endpoints', {
      method: 'DELETE',
      body: JSON.stringify(pk),
    });
    if (res.status !== 200) {
      // @ts-ignore
      const error = await res.json();
      console.error(error);
      alert(error.error);
    }
    const newState = endpoints.filter((endpoint: any) => endpoint.pk !== pk);
    handleEndpoints(newState);
  };

  return endpoints.length > 0 ? (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="p-1.5 w-full inline-block align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-bold text-left dark:text-gray-500 uppercase "
                  >
                    Repository
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-bold text-left dark:text-gray-500 uppercase "
                  >
                    Endpoint Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-bold text-left dark:text-gray-500 uppercase "
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-xs font-bold text-left dark:text-gray-500 uppercase "
                  >
                    <span>Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {endpoints.map((endpoint: any) => {
                  return (
                    <tr key={endpoint.pk}>
                      <td className="px-6 py-4 text-sm font-medium dark:text-gray-200 whitespace-nowrap">
                        {endpoint.repository}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-gray-200 whitespace-nowrap">
                        {endpoint.endpointName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium dark:text-gray-200 whitespace-nowrap">
                        {new Intl.DateTimeFormat('en-US').format(
                          new Date(endpoint.createdAt),
                        )}
                      </td>
                      <td>
                        <TrashIcon
                          onClick={() => deleteEndpoint(endpoint.pk)}
                          className="h-6 w-6 mx-auto  text-red-400 hover:text-red-600 dark:hover:text-red-400 dark:text-red-500 transition duration-200 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
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
