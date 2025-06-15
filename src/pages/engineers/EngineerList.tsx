import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface Engineer {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  currentCapacity: number;
  maxCapacity: number;
}

const EngineerList: React.FC = () => {
  const { data: engineers, isLoading, error } = useQuery<Engineer[]>({
    queryKey: ['engineers'],
    queryFn: async () => {
      const response = await api.get('/engineers');
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading engineers...</div>;
  }

  if (error) {
    return <div>Error loading engineers: {error.toString()}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Engineers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineers?.map((engineer) => (
          <div
            key={engineer._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{engineer.name}</h2>
            <p className="text-gray-600 mb-2">{engineer.email}</p>
            <p className="text-gray-600 mb-4">{engineer.role}</p>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {engineer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Capacity</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    engineer.currentCapacity >= engineer.maxCapacity
                      ? 'bg-red-500'
                      : engineer.currentCapacity >= engineer.maxCapacity * 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${(engineer.currentCapacity / engineer.maxCapacity) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {engineer.currentCapacity}/{engineer.maxCapacity} hours
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineerList; 