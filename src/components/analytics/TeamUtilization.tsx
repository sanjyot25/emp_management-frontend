import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Engineer {
  _id: string;
  name: string;
  seniority: string;
  maxCapacity: number;
}

interface Assignment {
  engineerId: Engineer;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

interface TeamUtilizationProps {
  engineers: Engineer[];
  assignments: Assignment[];
}

export default function TeamUtilization({ engineers, assignments }: TeamUtilizationProps) {
  const utilizationData = useMemo(() => {
    const now = new Date();
    
    return engineers.map(engineer => {
      const currentAssignments = assignments.filter(assignment => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);
        return (
          assignment.engineerId._id === engineer._id &&
          startDate <= now &&
          endDate >= now
        );
      });

      const totalAllocation = currentAssignments.reduce(
        (sum, assignment) => sum + assignment.allocationPercentage,
        0
      );

      return {
        name: engineer.name,
        allocation: totalAllocation,
        available: engineer.maxCapacity - totalAllocation,
        overallocated: Math.max(0, totalAllocation - engineer.maxCapacity)
      };
    });
  }, [engineers, assignments]);

  const chartData = {
    labels: utilizationData.map(d => d.name),
    datasets: [
      {
        label: 'Allocated',
        data: utilizationData.map(d => d.allocation),
        backgroundColor: 'rgb(37, 99, 235)',
        stack: 'Stack 0',
      },
      {
        label: 'Available',
        data: utilizationData.map(d => d.available),
        backgroundColor: 'rgb(22, 163, 74)',
        stack: 'Stack 0',
      },
      {
        label: 'Overallocated',
        data: utilizationData.map(d => d.overallocated),
        backgroundColor: 'rgb(220, 38, 38)',
        stack: 'Stack 1',
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Team Utilization',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        min: 0,
        max: 150,
        title: {
          display: true,
          text: 'Allocation %'
        }
      },
    },
  };

  const getUtilizationSummary = () => {
    const total = utilizationData.length;
    const overallocated = utilizationData.filter(d => d.overallocated > 0).length;
    const underutilized = utilizationData.filter(d => d.available > 50).length;
    const optimal = total - overallocated - underutilized;

    return { total, overallocated, underutilized, optimal };
  };

  const summary = getUtilizationSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {summary.overallocated}
            </div>
            <div className="text-sm text-muted-foreground">Overallocated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.optimal}
            </div>
            <div className="text-sm text-muted-foreground">Optimal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {summary.underutilized}
            </div>
            <div className="text-sm text-muted-foreground">Underutilized</div>
          </div>
        </div>
        
        <div className="h-[400px]">
          <Bar options={options} data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
} 