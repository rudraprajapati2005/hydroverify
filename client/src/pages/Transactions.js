import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Search, Filter, Download, Eye, DollarSign, CreditCard, Package, Shield } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TransactionStatusBadge from '../components/StatusBadge.js';

const Transactions = () => {
  const { user, hasRole } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Mock data for demonstration
  const mockTransactions = [
    {
      id: '1',
      transactionId: 'TXN-2024-001',
      type: 'CREDIT_PURCHASE',
      fromUser: { name: 'Green Energy Corp', email: 'contact@greenenergy.com' },
      toUser: { name: 'Hydrogen Producer Ltd', email: 'info@hproducer.com' },
      amount: 150.00,
      currency: 'USD',
      creditAmount: 1000,
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      metadata: { description: 'Purchase of 1000 kg hydrogen credits' }
    },
    {
      id: '2',
      transactionId: 'TXN-2024-002',
      type: 'CREDIT_TRANSFER',
      fromUser: { name: 'Green Energy Corp', email: 'contact@greenenergy.com' },
      toUser: { name: 'Eco Solutions Inc', email: 'hello@ecosolutions.com' },
      amount: 0,
      currency: 'USD',
      creditAmount: 500,
      status: 'completed',
      createdAt: new Date('2024-01-14'),
      metadata: { description: 'Transfer of 500 kg hydrogen credits' }
    },
    {
      id: '3',
      transactionId: 'TXN-2024-003',
      type: 'BATCH_VERIFICATION',
      batchId: { batchNumber: 'BATCH-2024-001', kgProduced: 1500 },
      amount: 75.00,
      currency: 'USD',
      status: 'completed',
      createdAt: new Date('2024-01-13'),
      metadata: { description: 'Verification of batch BATCH-2024-001' }
    },
    {
      id: '4',
      transactionId: 'TXN-2024-004',
      type: 'CREDIT_RETIREMENT',
      creditId: { creditId: 'CREDIT-001', supply: 200 },
      amount: 0,
      currency: 'USD',
      creditAmount: 200,
      status: 'completed',
      createdAt: new Date('2024-01-12'),
      metadata: { description: 'Retirement of 200 kg hydrogen credits' }
    },
    {
      id: '5',
      transactionId: 'TXN-2024-005',
      type: 'CREDIT_PURCHASE',
      fromUser: { name: 'Green Energy Corp', email: 'contact@greenenergy.com' },
      toUser: { name: 'Clean Fuel Co', email: 'sales@cleanfuel.com' },
      amount: 300.00,
      currency: 'USD',
      creditAmount: 2000,
      status: 'pending',
      createdAt: new Date('2024-01-11'),
      metadata: { description: 'Purchase of 2000 kg hydrogen credits' }
    }
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for now
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
      } catch (error) {
        toast.error('Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    // Filter transactions based on search and filters
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.fromUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.toUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(txn => txn.type === typeFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(txn => 
        format(new Date(txn.createdAt), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd')
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter, dateFilter]);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'CREDIT_PURCHASE':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'CREDIT_TRANSFER':
        return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'CREDIT_RETIREMENT':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'BATCH_VERIFICATION':
        return <Package className="h-5 w-5 text-orange-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'CREDIT_PURCHASE':
        return 'Credit Purchase';
      case 'CREDIT_TRANSFER':
        return 'Credit Transfer';
      case 'CREDIT_RETIREMENT':
        return 'Credit Retirement';
      case 'BATCH_VERIFICATION':
        return 'Batch Verification';
      default:
        return type;
    }
  };

  const getTransactionSummary = (transaction) => {
    switch (transaction.type) {
      case 'CREDIT_PURCHASE':
        return `${transaction.fromUser?.name} → ${transaction.toUser?.name}`;
      case 'CREDIT_TRANSFER':
        return `${transaction.fromUser?.name} → ${transaction.toUser?.name}`;
      case 'CREDIT_RETIREMENT':
        return `Retired by ${transaction.fromUser?.name || 'Unknown'}`;
      case 'BATCH_VERIFICATION':
        return `Batch ${transaction.batchId?.batchNumber}`;
      default:
        return 'Transaction';
    }
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Export functionality coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your transaction history
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Types</option>
              <option value="CREDIT_PURCHASE">Credit Purchase</option>
              <option value="CREDIT_TRANSFER">Credit Transfer</option>
              <option value="CREDIT_RETIREMENT">Credit Retirement</option>
              <option value="BATCH_VERIFICATION">Batch Verification</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transaction History ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {transaction.transactionId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTransactionSummary(transaction)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    {transaction.creditAmount && (
                      <div className="text-xs text-gray-500">
                        {transaction.creditAmount} kg credits
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.amount > 0 ? (
                        <span className="font-medium">
                          {transaction.amount.toFixed(2)} {transaction.currency}
                        </span>
                      ) : (
                        <span className="text-gray-500">Free</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TransactionStatusBadge status={transaction.status} type="transaction" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || typeFilter || dateFilter
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first transaction.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
