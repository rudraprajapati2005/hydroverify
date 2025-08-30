import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CreditCard, 
  TrendingUp, 
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
  Package
} from 'lucide-react';
import { format } from 'date-fns';

const Credits = () => {
  const { user, hasRole } = useAuth();
  const [credits, setCredits] = useState([]);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    fetchCredits();
  }, []);

  useEffect(() => {
    filterCredits();
  }, [credits, searchTerm, statusFilter, regionFilter]);

  const fetchCredits = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockCredits = [
        {
          id: '1',
          creditId: 'CREDIT-001',
          batchId: 'BATCH-001',
          supply: 1500,
          ownerId: 'user-1',
          ownerName: 'Green Energy Corp',
          status: 'available',
          region: 'North America',
          batchInfo: {
            producer: 'Green Hydrogen Corp',
            productionDate: new Date('2024-01-15'),
            kwhPerKg: 30,
            trustScore: 95,
            carbonIntensity: 2.1
          },
          price: 25.50,
          createdAt: new Date('2024-01-16'),
          transferHistory: []
        },
        {
          id: '2',
          creditId: 'CREDIT-002',
          batchId: 'BATCH-002',
          supply: 2200,
          ownerId: 'user-2',
          ownerName: 'EcoFuel Ltd',
          status: 'available',
          region: 'Europe',
          batchInfo: {
            producer: 'EcoFuel Ltd',
            productionDate: new Date('2024-01-14'),
            kwhPerKg: 32,
            trustScore: 88,
            carbonIntensity: 2.8
          },
          price: 28.75,
          createdAt: new Date('2024-01-15'),
          transferHistory: []
        },
        {
          id: '3',
          creditId: 'CREDIT-003',
          batchId: 'BATCH-003',
          supply: 1800,
          ownerId: 'user-3',
          ownerName: 'HydroTech Solutions',
          status: 'retired',
          region: 'Asia Pacific',
          batchInfo: {
            producer: 'HydroTech Solutions',
            productionDate: new Date('2024-01-13'),
            kwhPerKg: 35,
            trustScore: 45,
            carbonIntensity: 4.2
          },
          price: 22.00,
          createdAt: new Date('2024-01-14'),
          retiredAt: new Date('2024-01-20'),
          retirementReceipt: {
            receiptId: 'RET-001',
            project: 'Carbon Neutral Initiative',
            description: 'Offsetting corporate emissions',
            retiredBy: 'Carbon Neutral Initiative'
          },
          transferHistory: [
            {
              from: 'HydroTech Solutions',
              to: 'Carbon Neutral Initiative',
              amount: 1800,
              date: new Date('2024-01-19')
            }
          ]
        },
        {
          id: '4',
          creditId: 'CREDIT-004',
          batchId: 'BATCH-004',
          supply: 1200,
          ownerId: 'user-4',
          ownerName: 'Clean Energy Partners',
          status: 'transferred',
          region: 'North America',
          batchInfo: {
            producer: 'Clean Energy Partners',
            productionDate: new Date('2024-01-12'),
            kwhPerKg: 28,
            trustScore: 92,
            carbonIntensity: 1.9
          },
          price: 30.00,
          createdAt: new Date('2024-01-13'),
          transferredAt: new Date('2024-01-18'),
          transferHistory: [
            {
              from: 'Clean Energy Partners',
              to: 'Sustainable Industries',
              amount: 1200,
              date: new Date('2024-01-18')
            }
          ]
        }
      ];
      
      setCredits(mockCredits);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCredits = () => {
    let filtered = credits;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(credit =>
        credit.creditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.batchInfo.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(credit => credit.status === statusFilter);
    }

    // Region filter
    if (regionFilter) {
      filtered = filtered.filter(credit => credit.region === regionFilter);
    }

    setFilteredCredits(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      transferred: { color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
      retired: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.available;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hydrogen Credits</h1>
          <p className="mt-2 text-gray-600">
            Browse, purchase, and manage hydrogen credits
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search credits..."
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
                  <option value="available">Available</option>
                  <option value="transferred">Transferred</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Regions</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option value="">All Prices</option>
                  <option value="0-25">$0 - $25</option>
                  <option value="25-50">$25 - $50</option>
                  <option value="50+">$50+</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Credits List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {filteredCredits.length} Credit{filteredCredits.length !== 1 ? 's' : ''}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality Metrics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {filteredCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {credit.creditId}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {format(credit.createdAt, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {credit.ownerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {credit.region}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Package className="inline h-4 w-4 mr-1" />
                        {credit.supply.toLocaleString()} kg
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className={`text-xs ${getEfficiencyColor(credit.batchInfo.kwhPerKg)}`}>
                          {credit.batchInfo.kwhPerKg} kWh/kg
                        </div>
                        <div className={`text-xs ${getTrustScoreColor(credit.batchInfo.trustScore)}`}>
                          {credit.batchInfo.trustScore}% trust
                        </div>
                        <div className="text-xs text-gray-500">
                          {credit.batchInfo.carbonIntensity} CO₂/kg
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        ${credit.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: ${(credit.price * credit.supply).toFixed(2)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(credit.status)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {hasRole('buyer') && credit.status === 'available' && (
                          <button className="text-blue-600 hover:text-blue-900">
                            <TrendingUp className="h-4 w-4" />
                          </button>
                        )}
                        
                        {hasRole('buyer') && credit.status === 'available' && (
                          <button className="text-purple-600 hover:text-purple-900">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCredits.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credits found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || regionFilter
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No credits are currently available.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Credits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {credits.filter(c => c.status === 'available').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Supply</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {credits.reduce((sum, c) => sum + c.supply, 0).toLocaleString()} kg
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Retired Credits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {credits.filter(c => c.status === 'retired').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${(credits.reduce((sum, c) => sum + c.price, 0) / credits.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
