import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  ArrowLeft,
  CreditCard,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  Users,
  Package,
  DollarSign,
  ArrowLeftRight,   // ✅ replaced Transfer with ArrowLeftRight
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CreditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [credit, setCredit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreditDetails();
  }, [id]);

  const fetchCreditDetails = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCredit = {
        id: id,
        creditId: 'CREDIT-001',
        batchId: 'BATCH-001',
        supply: 1500,
        ownerId: 'user-1',
        ownerName: 'Green Energy Corp',
        status: 'available',
        region: 'North America',
        price: 25.50,
        batchInfo: {
          producer: 'Green Hydrogen Corp',
          productionDate: new Date('2024-01-15'),
          kwhPerKg: 30,
          trustScore: 95,
          carbonIntensity: 2.1
        },
        createdAt: new Date('2024-01-16'),
        transferHistory: []
      };
      
      setCredit(mockCredit);
    } catch (error) {
      console.error('Failed to fetch credit details:', error);
      toast.error('Failed to load credit details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      transferred: { color: 'bg-blue-100 text-blue-800', icon: ArrowLeftRight }, // ✅ updated
      retired: { color: 'bg-purple-100 text-purple-800', icon: Shield }
    };

    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!credit) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Credit Not Found</h2>
          <p className="text-gray-600 mb-6">The credit you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/credits')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/credits')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credits
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{credit.creditId}</h1>
              <p className="mt-2 text-gray-600">
                Hydrogen credit details and transaction history
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              {getStatusBadge(credit.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Credit Details</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{credit.supply.toLocaleString()} kg</p>
                      <p className="text-sm text-gray-500">Hydrogen Supply</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">${credit.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Price per kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(credit.createdAt, 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">Created Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{credit.region}</p>
                      <p className="text-sm text-gray-500">Region</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Total Value:</strong> ${(credit.price * credit.supply).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Batch Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Source Batch Information</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {credit.batchInfo.kwhPerKg} kWh/kg
                    </div>
                    <div className="text-sm text-gray-600">Energy Efficiency</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {credit.batchInfo.trustScore}%
                    </div>
                    <div className="text-sm text-gray-600">Trust Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {credit.batchInfo.carbonIntensity} CO₂/kg
                    </div>
                    <div className="text-sm text-gray-600">Carbon Intensity</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Producer:</span>
                      <span className="ml-2 font-medium text-gray-900">{credit.batchInfo.producer}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Production Date:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {format(credit.batchInfo.productionDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Current Owner</h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mt-2 text-lg font-medium text-gray-900">{credit.ownerName}</h4>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{credit.region}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                {hasRole('buyer') && credit.status === 'available' && (
                  <>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <ArrowLeftRight className="h-4 w-4 mr-2" /> {/* ✅ updated */}
                      Transfer Credit
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Shield className="h-4 w-4 mr-2" />
                      Retire Credit
                    </button>
                  </>
                )}
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDetail;

