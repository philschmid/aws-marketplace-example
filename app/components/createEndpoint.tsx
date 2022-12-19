import { useState } from 'react';
import { useEndpointContext } from '../lib/state';

const defaultState = {
  endpointName: 'test',
  repository: 'philschmid/tiny-distilbert-classification',
  accelerator: 'CPU',
};

export default function CreateForm() {
  const [endpoint, setEndpoint] = useState(defaultState);
  const { endpoints, handleEndpoints } = useEndpointContext();

  const onChange = async (
    attribute: keyof typeof defaultState,
    value: string,
  ) => {
    const newState = { ...endpoint };
    newState[attribute] = value;
    setEndpoint(newState);
  };

  const createEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/endpoints', {
      method: 'POST',
      body: JSON.stringify({ ...endpoint }),
    });
    if (res.status !== 200) {
      // @ts-ignore
      const error = await res.json();
      console.error(error);
      alert(error.error);
    }
    // add endpoint to state
    const createdEndpoint = await res.json();
    // @ts-ignore
    handleEndpoints([...endpoints, createdEndpoint]);
  };

  return (
    <form
      className="shadow-md rounded px-8 pt-6 pb-8 mb-4"
      onSubmit={createEndpoint}
    >
      <div className="flex flex-wrap -mx-3 mb-6 gap-4">
        <div className="mb-4">
          <label className="block  text-sm font-bold mb-2" htmlFor="repository">
            repository
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            id="repository"
            name="repository"
            type="text"
            autoComplete="repository"
            value={endpoint.repository}
            onChange={(e) => onChange('repository', e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="endpointName"
            className="block  text-sm font-bold mb-2"
          >
            EndpointName
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
            id="endpointName"
            name="endpointName"
            type="text"
            autoComplete="endpointName"
            value={endpoint.endpointName}
            onChange={(e) => onChange('endpointName', e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block  text-sm font-bold mb-2"
            htmlFor="accelerator"
          >
            accelerator
          </label>

          <select
            value={endpoint.accelerator}
            onChange={(e) => onChange('accelerator', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="CPU">CPU</option>
            <option value="GPU">GPU</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-100 mb-4 mt-7"
        >
          Create
        </button>
      </div>
    </form>
  );
}
