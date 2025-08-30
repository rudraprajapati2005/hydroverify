# 🚀 Green Hydrogen Credits - MERN Stack Application

A comprehensive **Green Hydrogen Credit Management System** built with the MERN stack (MongoDB, Express.js, React, Node.js). This system simulates blockchain and AI verification while providing a complete workflow for managing hydrogen production credits.

## ✨ Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with role-based access control
- **Four user roles**: Producer, Certifier, Buyer, Auditor
- **Secure password hashing** with bcrypt
- **Profile management** and password updates

### 🏭 Producer Dashboard
- **Batch submission** with renewable energy certificates
- **Production data tracking** (kg produced, kWh used, region)
- **Batch status monitoring** (Pending → Approved → Minted → Transferred/Retired)
- **Certificate file uploads**

### 🔍 Certifier Dashboard
- **AI-simulated verification** with trust scores and anomaly detection
- **Batch approval/rejection** workflow
- **Credit minting** after batch approval
- **Verification metrics** (kWh per kg, carbon intensity, trust score)

### 💰 Buyer Dashboard
- **Credit marketplace** with filtering options
- **Credit transfer** between users
- **Credit retirement** with certificate generation
- **Ownership tracking**

### 📊 Auditor Dashboard
- **Public transparency explorer**
- **Complete audit trail** of all transactions
- **Search and filter** capabilities
- **Statistical analytics** and reporting

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 📁 Project Structure

```
green-hydrogen-credits/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── models/                 # MongoDB schemas
│   ├── User.js           # User model
│   ├── Batch.js          # Batch model
│   ├── Credit.js         # Credit model
│   └── CreditEvent.js    # Transaction events
├── routes/                 # API endpoints
│   ├── auth.js           # Authentication routes
│   ├── batches.js        # Batch management
│   ├── credits.js        # Credit operations
│   ├── explorer.js       # Public explorer
│   └── users.js          # User management
├── middleware/             # Custom middleware
│   └── auth.js           # Authentication & authorization
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd green-hydrogen-credits
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/green-hydrogen-credits
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 5. Run the Application
```bash
# Development mode (both backend and frontend)
npm run dev:full

# Or run separately:
# Backend only
npm run dev

# Frontend only (in another terminal)
npm run client
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Default Users

After starting the application, you can create users with different roles:

### Producer
- **Role**: `producer`
- **Permissions**: Submit batches, view own batches, manage profile

### Certifier
- **Role**: `certifier`
- **Permissions**: Verify batches, approve/reject, mint credits, view all batches

### Buyer
- **Role**: `buyer`
- **Permissions**: Browse credits, transfer ownership, retire credits

### Auditor
- **Role**: `auditor`
- **Permissions**: View all data, access explorer, generate reports

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Batches
- `POST /api/batches` - Create new batch (Producer)
- `GET /api/batches` - Get batches (filtered by role)
- `GET /api/batches/:id` - Get batch details
- `GET /api/batches/:id/verify` - Simulate AI verification (Certifier)
- `POST /api/batches/:id/approve` - Approve batch (Certifier)
- `POST /api/batches/:id/reject` - Reject batch (Certifier)
- `POST /api/batches/:id/mint` - Mint credits (Certifier)

### Credits
- `GET /api/credits` - Get available credits (Buyer)
- `GET /api/credits/my-credits` - Get user's credits
- `POST /api/credits/:id/transfer` - Transfer credit ownership
- `POST /api/credits/:id/retire` - Retire credit

### Explorer
- `GET /api/explorer` - Public data explorer
- `GET /api/explorer/search` - Search across all data
- `GET /api/explorer/stats` - System statistics

## 🔒 Security Features

- **JWT authentication** with configurable expiration
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Input validation** with express-validator
- **Security headers** with Helmet
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests

## 🎨 UI/UX Features

- **Responsive design** for all device sizes
- **Modern Material Design** inspired interface
- **Dark/light theme** support
- **Smooth animations** and transitions
- **Interactive charts** and data visualization
- **Real-time notifications** with toast messages
- **Accessible design** with proper ARIA labels

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests (if implemented)
npm test
```

## 📦 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
cd client
npm run build

# Deploy the build folder to your hosting service
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

## 🔮 Future Enhancements

- **Real AI/ML integration** for verification
- **Blockchain integration** (Polygon, Ethereum)
- **Real-time notifications** with WebSockets
- **Advanced analytics** and reporting
- **Mobile app** (React Native)
- **Multi-language support**
- **Advanced file upload** with cloud storage
- **Email notifications** and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **MERN Stack** community for excellent documentation
- **Tailwind CSS** for the beautiful design system
- **React ecosystem** for amazing developer experience
- **MongoDB** for robust database solutions

---

**Built with ❤️ for sustainable energy management**
