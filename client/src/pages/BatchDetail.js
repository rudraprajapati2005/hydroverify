import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Shield,
  Activity,
  BarChart3,
  Users,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockBatch = {
        id: id,
        batchNumber: 'BATCH-001',
        kgProduced: 1500,
        kwhUsed: 45000,
        region: 'North America',
        productionDate: new Date('2024-01-15'),
        status: 'pending',
        certificateFiles: [
          { name: 'production_certificate.pdf', url: '#', size: '2.3 MB' },
          { name: 'energy_consumption.pdf', url: '#', size: '1.8 MB' },
          { name: 'quality_assurance.pdf', url: '#', size: '3.1 MB' }
        ],
        evidenceHash: '0x7a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c2d3e4f5a6b7c8d9e0f1a2',
        verificationResult: null,
        rejectionReason: null,
        notes: 'High-quality hydrogen production batch with excellent efficiency metrics.',
        producer: {
          id: 'user-1',
          name: 'Green Hydrogen Corp',
          company: 'GHC',
          email: 'contact@greenhydrogen.com',
          region: 'North America'
        },
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z')
      };
      
      setBatch(mockBatch);
    } catch (error) {
      console.error('Failed to fetch batch details:', error);
      toast.error('Failed to load batch details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (action) => {
    if (action === 'reject' && !verificationNotes.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update batch status
      setBatch(prev => ({
        ...prev,
        status: action === 'approve' ? 'verified' : 'rejected',
        verificationResult: action === 'approve' ? {
          kwhPerKg: 30,
          trustScore: 95,
          carbonIntensity: 2.1,
          anomalyFlags: [],
          verifiedAt: new Date(),
          verifiedBy: user.name
        } : null,
        rejectionReason: action === 'reject' ? verificationNotes : null,
        verifiedAt: action === 'approve' ? new Date() : null,
        verifiedBy: action === 'approve' ? user.name : null
      }));

      toast.success(`Batch ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowVerificationModal(false);
      setVerificationNotes('');
    } catch (error) {
      toast.error('Failed to process verification');
    } finally {
      setIsSubmitting(false);
    }
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-2" />
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

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Batch Not Found</h2>
          <p className="text-gray-600 mb-6">The batch you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/batches')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
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
            onClick={() => navigate('/batches')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.batchNumber}</h1>
              <p className="mt-2 text-gray-600">
                Hydrogen production batch details and verification status
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {getStatusBadge(batch.status)}
              
              {hasRole('certifier') && batch.status === 'pending' && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Batch
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Production Details</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{batch.kgProduced.toLocaleString()} kg</p>
                      <p className="text-sm text-gray-500">Hydrogen Produced</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{batch.kwhUsed.toLocaleString()} kWh</p>
                      <p className="text-sm text-gray-500">Energy Consumed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(batch.productionDate, 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">Production Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{batch.region}</p>
                      <p className="text-sm text-gray-500">Region</p>
                    </div>
                  </div>
                </div>
                
                {batch.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{batch.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Results */}
            {batch.verificationResult && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Verification Results</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getEfficiencyColor(batch.verificationResult.kwhPerKg)}`}>
                        {batch.verificationResult.kwhPerKg} kWh/kg
                      </div>
                      <div className="text-sm text-gray-600">Energy Efficiency</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getTrustScoreColor(batch.verificationResult.trustScore)}`}>
                        {batch.verificationResult.trustScore}%
                      </div>
                      <div className="text-sm text-gray-600">Trust Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {batch.verificationResult.carbonIntensity} CO₂/kg
                      </div>
                      <div className="text-sm text-gray-600">Carbon Intensity</div>
                    </div>
                  </div>
                  
                  {batch.verificationResult.anomalyFlags.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="text-sm font-medium text-yellow-800">Anomaly Flags</h4>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {batch.verificationResult.anomalyFlags.map((flag, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            <span>{flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Verified by:</span>
                        <span className="ml-2 font-medium text-gray-900">{batch.verifiedBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Verified at:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {format(batch.verifiedAt, 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Details */}
            {batch.rejectionReason && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Rejection Details</h3>
                </div>
                <div className="p-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                    </div>
                    <p className="text-sm text-red-700">{batch.rejectionReason}</p>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    Rejected by {batch.verifiedBy} on {format(batch.verifiedAt, 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Files */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Certificate Files</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {batch.certificateFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-700">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Producer Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Producer Information</h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mt-2 text-lg font-medium text-gray-900">{batch.producer.name}</h4>
                  <p className="text-sm text-gray-500">{batch.producer.company}</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{batch.producer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{batch.producer.region}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Metadata */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Batch Metadata</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Evidence Hash:</span>
                    <span className="text-gray-900 font-mono text-xs truncate max-w-32">
                      {batch.evidenceHash}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {format(batch.createdAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated:</span>
                    <span className="text-gray-900">
                      {format(batch.updatedAt, 'MMM d, yyyy')}
                    </span>
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
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Eye className="h-4 w-4 mr-2" />
                  View Raw Data
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Activity className="h-4 w-4 mr-2" />
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Batch</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Add any notes about the verification process..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVerification('approve')}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleVerification('reject')}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Reject'}
                  </button>
                  
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
