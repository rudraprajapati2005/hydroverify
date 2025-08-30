import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

const Batches = () => {
  const { user, hasRole } = useAuth();
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    filterBatches();
  }, [batches, searchTerm, statusFilter]);

  const fetchBatches = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockBatches = [
        {
          id: '1',
          batchNumber: 'BATCH-001',
          kgProduced: 1500,
          kwhUsed: 45000,
          region: 'North America',
          productionDate: new Date('2024-01-15'),
          status: 'verified',
          verificationResult: {
            kwhPerKg: 30,
            trustScore: 95,
            carbonIntensity: 2.1,
            anomalyFlags: []
          },
          producer: { name: 'Green Hydrogen Corp', company: 'GHC' },
          verifiedAt: new Date('2024-01-16'),
          verifiedBy: 'Sarah Certifier'
        },
        {
          id: '2',
          batchNumber: 'BATCH-002',
          kgProduced: 2200,
          kwhUsed: 66000,
          region: 'Europe',
          productionDate: new Date('2024-01-14'),
          status: 'pending',
          verificationResult: null,
          producer: { name: 'EcoFuel Ltd', company: 'EFL' },
          verifiedAt: null,
          verifiedBy: null
        },
        {
          id: '3',
          batchNumber: 'BATCH-003',
          kgProduced: 1800,
          kwhUsed: 54000,
          region: 'Asia Pacific',
          productionDate: new Date('2024-01-13'),
          status: 'rejected',
          verificationResult: {
            kwhPerKg: 35,
            trustScore: 45,
            carbonIntensity: 4.2,
            anomalyFlags: ['high_carbon_intensity', 'suspicious_efficiency']
          },
          producer: { name: 'HydroTech Solutions', company: 'HTS' },
          verifiedAt: new Date('2024-01-14'),
          verifiedBy: 'Sarah Certifier',
          rejectionReason: 'Carbon intensity exceeds threshold'
        }
      ];
      
      setBatches(mockBatches);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBatches = () => {
    let filtered = batches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.producer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(batch => batch.status === statusFilter);
    }

    setFilteredBatches(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEfficiencyColor = (kwhPerKg) => {
    if (kwhPerKg <= 30) return 'text-green-600';
    if (kwhPerKg <= 35) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Batches</h1>
            <p className="mt-2 text-gray-600">
              Manage and monitor hydrogen production batches
            </p>
          </div>
          
          {hasRole('producer') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:ring-green-500">
                  <option value="">All Regions</option>
                  <option value="north-america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia-pacific">Asia Pacific</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Batches List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {filteredBatches.length} Batch{filteredBatches.length !== 1 ? 'es' : ''}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trust Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {batch.batchNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {format(batch.productionDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {batch.producer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {batch.producer.company}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          <Package className="inline h-4 w-4 mr-1" />
                          {batch.kgProduced.toLocaleString()} kg
                        </div>
                        <div className="text-sm text-gray-500">
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                          {batch.kwhUsed.toLocaleString()} kWh
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {batch.verificationResult ? (
                        <div className={`text-sm font-medium ${getEfficiencyColor(batch.verificationResult.kwhPerKg)}`}>
                          {batch.verificationResult.kwhPerKg} kWh/kg
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Pending</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {batch.verificationResult ? (
                        <div className={`text-sm font-medium ${getTrustScoreColor(batch.verificationResult.trustScore)}`}>
                          {batch.verificationResult.trustScore}%
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Pending</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(batch.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {hasRole('certifier') && batch.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBatches.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first batch.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Batches;
