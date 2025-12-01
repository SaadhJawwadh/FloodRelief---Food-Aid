import React from 'react';
import { FoodRequest, UrgencyLevel } from '../types';
import { MapPin, Phone, Users, AlertCircle, Clock } from 'lucide-react';

interface RequestCardProps {
  request: FoodRequest;
  onViewDetails: (request: FoodRequest) => void;
}

const UrgencyBadge: React.FC<{ level: UrgencyLevel }> = ({ level }) => {
  const styles = {
    [UrgencyLevel.CRITICAL]: 'bg-red-100 text-red-700 border-red-200',
    [UrgencyLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [UrgencyLevel.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [UrgencyLevel.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level]}`}>
      {level.toUpperCase()}
    </span>
  );
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           <h3 className="font-bold text-slate-900 line-clamp-1">{request.requesterName}</h3>
        </div>
        <UrgencyBadge level={request.urgency} />
      </div>

      <div className="space-y-3 mb-4 flex-grow">
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
          <span className="line-clamp-2">{request.location}</span>
        </div>
        
        {request.contactNumber && (
          <div className="py-1">
            <a 
              href={`tel:${request.contactNumber}`} 
              className="flex items-center gap-2 w-fit font-mono font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 hover:shadow-sm border border-green-200 transition-all duration-200 cursor-pointer group"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4 shrink-0 text-green-600 group-hover:scale-110 transition-transform" />
              {request.contactNumber}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Users className="w-4 h-4 shrink-0 text-slate-40