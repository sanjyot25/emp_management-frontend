import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface Assignment {
  _id: string;
  project: {
    _id: string;
    name: string;
    status: string;
  };
  startDate: string;
  endDate: string;
  allocation: number;
}

interface Engineer {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  currentCapacity: number;
  maxCapacity: number;
  assignments: Assignment[];
}

const EngineerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: engineer, isLoading, error } = useQuery<Engineer>({
    queryKey: ['engineer', id],
    queryFn: async () => {
      const response = await api.get(`/engineers/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Engineer</h2>
          <p className="text-red-600">{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-yellow-800 font-semibold">Engineer Not Found</h2>
          <p className="text-yellow-600">The requested engineer profile could not be found.</p>
        </div>
      </div>
    );
  }

  // Calculate utilization safely
  const utilization =
    typeof engineer.currentCapacity === 'number' &&
    typeof engineer.maxCapacity === 'number' &&
    engineer.maxCapacity > 0
      ? Math.round((engineer.currentCapacity / engineer.maxCapacity) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{engineer.name}</h1>
          <p className="text-gray-600">{engineer.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{engineer.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {engineer.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Capacity</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-500">Current Utilization</p>
                  <p className="text-sm font-medium">
                    {engineer.maxCapacity > 0 ? `${utilization}%` : 'N/A'}
                  </p>
                </div>
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
                      width:
                        engineer.maxCapacity > 0
                          ? `${(engineer.currentCapacity / engineer.maxCapacity) * 100}%`
                          : '0%',
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {engineer.currentCapacity ?? 0}/{engineer.maxCapacity ?? 0} hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Project Assignments</h2>
          <div className="space-y-4">
            {engineer.assignments?.length > 0 ? (
              engineer.assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{assignment.project.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(assignment.startDate).toLocaleDateString()} -{' '}
                        {new Date(assignment.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        assignment.project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : assignment.project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {assignment.project.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Allocation: <span className="font-medium">{assignment.allocation}%</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No project assignments found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDetails; 