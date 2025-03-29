# 🍋 Joey's Lemonades

## The Story

Meet Joey, a young entrepreneur with a dream of running the most innovative lemonade stand in her neighborhood. What started as a simple stand has transformed into a modern digital storefront, combining the charm of a traditional lemonade stand with cutting-edge web3 technology. Through this platform, Joey can serve her delicious handcrafted lemonades while rewarding her loyal customers with unique NFT collectibles.

## 🌟 Features

### Core Functionality
- **Order Management System**: Real-time order processing and tracking
- **Inventory Control**: Automated stock management and alerts
- **Payment Processing**: Secure Solana blockchain transactions
- **User Authentication**: Wallet-based authentication system

### Web3 Integration
- **NFT Rewards Program**: Tiered loyalty system with Bronze, Silver, and Gold NFTs
- **Wallet Integration**: Support for multiple Solana wallet providers
- **Blockchain Transactions**: Real-time transaction monitoring and confirmation

### Administrative Tools
- **Dashboard Analytics**: Real-time sales and inventory metrics
- **Order Management**: Comprehensive order processing workflow
- **Menu Management**: Dynamic menu updates and pricing controls
- **Customer Management**: User activity tracking and reward management

### Technical Features
- **Responsive Design**: Mobile-first, cross-device compatible interface
- **Real-time Updates**: WebSocket integration for live order status
- **Offline Support**: Progressive Web App capabilities
- **Performance Optimization**: Server-side rendering and code splitting

## 🛠 Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: Chakra UI for modern, accessible components
- **State Management**: React Context API for cart and wallet states
- **Web3 Integration**: Solana Web3.js and Wallet Adapter
- **Styling**: CSS-in-JS with Chakra UI's style props

### Backend
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful endpoints with Express.js
- **Blockchain**: Solana (Devnet)
- **NFT Management**: Metaplex for NFT creation and management
- **File Storage**: Bundlr for decentralized storage

### Database Setup

The project uses Supabase for database management. The schema includes:

#### Core Tables
- **users**: Customer profiles with order statistics
- **menu_items**: Available lemonade products with variants
- **orders** & **order_items**: Order management with line items
- **nft_rewards**: NFT-based loyalty program tracking
- **support_tickets**: Customer support system
- **admins**: Administrative access control

#### Key Features
- Enum types for consistent data validation
- Automatic timestamp management
- User statistics tracking
- Row Level Security (RLS) policies
- Comprehensive indexing strategy
- Referential integrity with foreign keys

Follow these steps to set up your database:

1. Install and configure Supabase CLI:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Initialize Supabase in your project
   supabase init
   ```

2. Set up local development:
   ```bash
   # Start local Supabase services
   supabase start

   # This will output local connection details:
   # API URL: http://localhost:54321
   # GraphQL URL: http://localhost:54321/graphql/v1
   # Studio URL: http://localhost:54323
   # Inbucket URL: http://localhost:54324
   ```

3. Create a new project at [Supabase](https://supabase.com) and note down your project reference ID

4. Set up environment variables:
   ```env
   # Frontend (.env.local)
   # For development (local Supabase)
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key

   # For production
   # NEXT_PUBLIC_SUPABASE_URL=your_project_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_project_anon_key

   # Backend (.env)
   # For development (local Supabase)
   SUPABASE_URL=http://localhost:54321
   SUPABASE_SERVICE_KEY=your_local_service_key

   # For production
   # SUPABASE_URL=your_project_url
   # SUPABASE_SERVICE_KEY=your_project_service_key
   ```

5. Initialize your database:
   ```bash
   # For local development
   supabase db reset

   # For production
   supabase link --project-ref your-project-ref
   supabase db push
   ```

The migration will set up:
- Complete database schema with all tables
- Enum types for data validation
- Indexes for query optimization
- Triggers for automated updates
- RLS policies for security
- Initial admin user
- Sample menu items

Development Commands:
```bash
# Start/Stop local services
supabase start
supabase stop

# Database management
supabase db reset        # Reset to clean state
supabase db diff        # View pending changes
supabase migration new  # Create new migration

# Access local dashboard
open http://localhost:54323
```

### Authentication & Security
- **Wallet Authentication**: Solana Wallet Adapter
- **API Security**: JWT tokens for protected endpoints
- **Role-Based Access**: Admin and customer role separation

## 🚀 Getting Started

### Prerequisites
- Node.js v20.2.1
- npm or yarn
- Solana CLI tools
- A Solana wallet (Phantom recommended)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/joeys-lemonades.git
cd joeys-lemonades
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_STORE_WALLET=your_store_wallet_public_key
```

Backend (.env):
```env
PORT=5001
SOLANA_RPC_URL=https://api.devnet.solana.com
STORE_WALLET_PRIVATE_KEY=your_store_wallet_private_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Start the development servers:

```bash
# Backend
cd backend
npm run dev

# Frontend (in a new terminal)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 🔧 Development

### Project Structure
```
joeys-lemonades/
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages and layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API and blockchain services
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
└── backend/
    ├── src/
    │   ├── routes/        # API routes
    │   ├── controllers/   # Business logic
    │   ├── services/      # External service integrations
    │   └── models/        # Data models
    └── config/            # Configuration files
```

### Key Components
- **SharedCard**: Consistent card design across the application
- **WalletConnect**: Solana wallet connection component
- **NFTService**: NFT minting and management service
- **CartContext**: Shopping cart state management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to Cascade, the Codeium AI assistant, for vibing with this project and helping create a modern, secure, and scalable lemonade stand on the blockchain. Your expertise in Next.js, Supabase, and Solana made this project not just functional, but also a joy to develop.

Keep spreading that digital lemonade! 🍋✨

- Solana Foundation for blockchain infrastructure
- Metaplex for NFT tooling
- Supabase for database solutions
- Chakra UI for component library
