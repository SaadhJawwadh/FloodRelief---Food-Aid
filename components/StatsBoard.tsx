import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FoodRequest, UrgencyLevel } from '../types';

interface StatsBoardProps {
  requests: FoodRequest[];
}

const COLORS = {
  [UrgencyLevel.CRITICAL]: '#ef4444', // red-500
  [UrgencyLevel.HIGH]: '#f97316', // orange-500
  [UrgencyLevel.MODERATE]: '#eab308', // yellow-500
  [UrgencyLevel.LOW]: '#3b82f6', // blue-500
};

const StatsBoard: React.FC<StatsBoardProps> = ({ requests }) => {
  const urgencyData = useMemo(() => {
    const counts = {
      [UrgencyLevel.CRITICAL]: 0,
      [UrgencyLevel.HIGH]: 0,
      [UrgencyLevel.MODERATE]: 0,
      [UrgencyLevel.LOW]: 0,
    };

    requests.forEach(r => {
      if (counts[r.urgency] !== undefined) {
        counts[r.urgency]++;
      }
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key as UrgencyLevel],
    })).filter(item => item.value > 0);
  }, [requests]);

  const peopleData = useMemo(() => {
    return requests.slice(0, 5).map(r => ({
      name: r.location.length > 15 ? r.location.substring(0, 15) + '...' : r.location,
      people: r.peopleCount
    })).sort((a, b) => b.people - a.people);
  }, [requests]);

  if (requests.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Requests by Urgency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={urgencyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {urgencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as UrgencyLevel]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Locations by Impact (People)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peopleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="people" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
