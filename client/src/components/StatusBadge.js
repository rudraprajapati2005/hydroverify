import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, Shield, Package, CreditCard } from 'lucide-react';

const StatusBadge = ({ status, type = 'default', size = 'md' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      // Batch statuses
      batch: {
        pending: {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        },
        verified: {
          label: 'Verified',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        },
        rejected: {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        },
        approved: {
          label: 'Approved',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle
        },
        processing: {
          label: 'Processing',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Package
        }
      },
      
      // Credit statuses
      credit: {
        available: {
          label: 'Available',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CreditCard
        },
        transferred: {
          label: 'Transferred',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CreditCard
        },
        retired: {
          label: 'Retired',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Shield
        },
        locked: {
          label: 'Locked',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: CreditCard
        },
        expired: {
          label: 'Expired',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        }
      },
      
      // Transaction statuses
      transaction: {
        pending: {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        },
        processing: {
          label: 'Processing',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package
        },
        completed: {
          label: 'Completed',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        },
        failed: {
          label: 'Failed',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        },
        cancelled: {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle
        }
      },
      
      // User statuses
      user: {
        active: {
          label: 'Active',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        },
        inactive: {
          label: 'Inactive',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle
        },
        suspended: {
          label: 'Suspended',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle
        },
        pending: {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        }
      },
      
      // Default statuses
      default: {
        success: {
          label: 'Success',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        },
        warning: {
          label: 'Warning',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle
        },
        error: {
          label: 'Error',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        },
        info: {
          label: 'Info',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package
        }
      }
    };
    
    return configs[type]?.[status] || configs.default[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Package
    };
  };
  
  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-2 text-sm';
      default: // md
        return 'px-2.5 py-1 text-sm';
    }
  };
  
  const config = getStatusConfig(status, type);
  const IconComponent = config.icon;
  const sizeClasses = getSizeClasses(size);
  
  return (
    <span className={`inline-flex items-center ${sizeClasses} font-medium rounded-full border ${config.color}`}>
      <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} mr-1.5`} />
      {config.label}
    </span>
  );
};

// Convenience components for common status types
export const BatchStatusBadge = ({ status, size }) => (
  <StatusBadge status={status} type="batch" size={size} />
);

export const CreditStatusBadge = ({ status, size }) => (
  <StatusBadge status={status} type="credit" size={size} />
);

export const TransactionStatusBadge = ({ status, size }) => (
  <StatusBadge status={status} type="transaction" size={size} />
);

export const UserStatusBadge = ({ status, size }) => (
  <StatusBadge status={status} type="user" size={size} />
);

export default StatusBadge;
