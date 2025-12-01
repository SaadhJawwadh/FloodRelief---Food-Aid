import React from 'react';
import { FoodRequest, UrgencyLevel } from '../types';
import { X, MapPin, Phone, Users, Calendar, AlertTriangle, MessageSquare } from 'lucide-react';

interface RequestDetailsModalProps {
  request: FoodRequest;
  onClose: () => void;
}

const UrgencyBadge: React.FC<{ level: UrgencyLevel }> = ({ level }) => {
  const styles = {
    [UrgencyLevel.CRITICAL]: 'bg-red-100 text-red-700 border-red-200',
    [UrgencyLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
    [UrgencyLevel.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [UrgencyLevel.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[level]}`}>
      {level.toUpperCase()}
    </span>
  );
};

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900 line-clamp-1">{request.requesterName}</h2>
              <UrgencyBadge level={request.urgency} />
            </div>
            <div className="flex items-center text-slate-500 gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(request.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
              </div>
              <p className="font-medium text-slate-900">{request.location}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Impact</span>
              </div>
              <p className="font-medium text-slate-900">~{request.peopleCount} People</p>
            </div>
            
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Contact</span>
              </div>
              {request.contactNumber ? (
                 <a href={`tel:${request.contactNumber}`} className="text-lg font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 w-fit">
                    {request.contactNumber}
                    <span className="text-xs font-normal text-slate-400 no-underline">(Click to call)</span>
                 </a>
              ) : (
                <p className="text-slate-400 italic">No contact number available</p>
              )}
            </div>
          </div>

          {/* Needs Section */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Reported Needs
            </h3>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-slate-800">
              {request.needs}
            </div>
          </div>

          {/* Original Text */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Original Message
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {request.originalText}
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
                Close
            </button>
            {request.contactNumber && (
                <a 
                    href={`tel:${request.contactNumber}`}
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Phone className="w-4 h-4" />
                    Call Now
                </a>
            )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;