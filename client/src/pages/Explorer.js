import React, { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Calendar,
  Package,
  CreditCard,
  Users,
  Activity,
  Globe,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const Explorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalCredits: 0,
    totalUsers: 0,
    totalVolume: 0,
    averagePrice: 0,
    verifiedBatches: 0,
    retiredCredits: 0
  });
  const [chartData, setChartData] = useState({
    productionTrend: [],
    regionalDistribution: [],
    efficiencyDistribution: [],
    priceTrend: []
  });

  useEffect(() => {
    fetchExplorerData();
  }, []);

  const fetchExplorerData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockStats = {
        totalBatches: 156,
        totalCredits: 2340,
        totalUsers: 89,
        totalVolume: 125000,
        averagePrice: 28.50,
        verifiedBatches: 142,
        retiredCredits: 456
      };
      
      const mockChartData = {
        productionTrend: [
          { month: 'Jan', batches: 12, volume: 8500 },
          { month: 'Feb', batches: 15, volume: 11200 },
          { month: 'Mar', batches: 18, volume: 13800 },
          { month: 'Apr', batches: 22, volume: 16500 },
          { month: 'May', batches: 25, volume: 19200 },
          { month: 'Jun', batches: 28, volume: 21800 },
          { month: 'Jul', batches: 31, volume: 24500 },
          { month: 'Aug', batches: 34, volume: 27200 },
          { month: 'Sep', batches: 37, volume: 29900 },
          { month: 'Oct', batches: 40, volume: 32600 },
          { month: 'Nov', batches: 43, volume: 35300 },
          { month: 'Dec', batches: 46, volume: 38000 }
        ],
        regionalDistribution: [
          { region: 'North America', batches: 45, credits: 780, volume: 42000 },
          { region: 'Europe', batches: 38, credits: 650, volume: 35000 },
          { region: 'Asia Pacific', batches: 42, credits: 720, volume: 38000 },
          { region: 'Latin America', batches: 18, credits: 310, volume: 16000 },
          { region: 'Africa', batches: 13, credits: 220, volume: 12000 }
        ],
        efficiencyDistribution: [
          { range: '20-25 kWh/kg', count: 28, percentage: 18 },
          { range: '25-30 kWh/kg', count: 45, percentage: 29 },
          { range: '30-35 kWh/kg', count: 52, percentage: 33 },
          { range: '35-40 kWh/kg', count: 23, percentage: 15 },
          { range: '40+ kWh/kg', count: 8, percentage: 5 }
        ],
        priceTrend: [
          { month: 'Jan', avgPrice: 25.20, volume: 8500 },
          { month: 'Feb', avgPrice: 26.80, volume: 11200 },
          { month: 'Mar', avgPrice: 27.50, volume: 13800 },
          { month: 'Apr', avgPrice: 28.30, volume: 16500 },
          { month: 'May', avgPrice: 29.10, volume: 19200 },
          { month: 'Jun', avgPrice: 30.20, volume: 21800 },
          { month: 'Jul', avgPrice: 31.50, volume: 24500 },
          { month: 'Aug', avgPrice: 32.80, volume: 27200 },
          { month: 'Sep', avgPrice: 33.20, volume: 29900 },
          { month: 'Oct', avgPrice: 34.10, volume: 32600 },
          { month: 'Nov', avgPrice: 35.00, volume: 35300 },
          { month: 'Dec', avgPrice: 36.50, volume: 38000 }
        ]
      };
      
      setStats(mockStats);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Failed to fetch explorer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

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
          <h1 className="text-3xl font-bold text-gray-900">Data Explorer</h1>
          <p className="mt-2 text-gray-600">
            Explore public data and analytics about the Green Hydrogen Credits system
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <select
                  value={selectedDataType}
                  onChange={(e) => setSelectedDataType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="overview">Overview</option>
                  <option value="production">Production Trends</option>
                  <option value="regional">Regional Analysis</option>
                  <option value="efficiency">Efficiency Metrics</option>
                  <option value="pricing">Price Analysis</option>
                </select>
              </div>
              
              <div>
                <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                  <option value="">All Time Periods</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBatches.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCredits.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% from last month
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15% from last month
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalVolume.toLocaleString()} kg</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +20% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Production Trend Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Production Trend</h3>
              <p className="text-sm text-gray-600">Monthly hydrogen production volume and batch count</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="batches" stroke="#3B82F6" strokeWidth={2} name="Batches" />
                  <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={2} name="Volume (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Regional Distribution</h3>
                <p className="text-sm text-gray-600">Batches and credits by region</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.regionalDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="batches" fill="#3B82F6" name="Batches" />
                    <Bar dataKey="credits" fill="#10B981" name="Credits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Efficiency Distribution</h3>
                <p className="text-sm text-gray-600">Batches by energy efficiency</p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.efficiencyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.efficiencyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Price Trend Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Price Trend</h3>
              <p className="text-sm text-gray-600">Average credit price and trading volume over time</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="avgPrice" stroke="#F59E0B" strokeWidth={2} name="Avg Price ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#8B5CF6" strokeWidth={2} name="Volume (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Key Performance Metrics</h3>
              <p className="text-sm text-gray-600">System performance indicators</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {((stats.verifiedBatches / stats.totalBatches) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Verification Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.verifiedBatches} of {stats.totalBatches} batches verified
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ${stats.averagePrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Average Credit Price</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Market rate per kg of hydrogen
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {((stats.retiredCredits / stats.totalCredits) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Retirement Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.retiredCredits} of {stats.totalCredits} credits retired
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
