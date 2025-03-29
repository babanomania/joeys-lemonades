# Backend Structure Document

This document outlines the backend setup of Joey's Lemonade Stand app. It details the architecture, data management practices, API endpoints, hosting solutions, infrastructure, security measures, and ongoing monitoring to ensure a secure, scalable, and fun experience for kids and families.

## 1. Backend Architecture

The backend is designed to be modular, scalable, and easy to maintain. It uses a modern serverless approach combined with cloud-managed services. Key design aspects include:

*   **Modularity:** Clearly separated services for handling transactions, user management, NFT minting, and customer support. Each module communicates via well-defined API endpoints.
*   **Service Integration:** The app leverages Supabase for data management and uses Solana devnet for payment processing and NFT rewards.
*   **Scalability & Performance:** The use of cloud services ensures that the backend can scale to accommodate increased usage. This includes scaling of the database on Supabase as well as serverless API endpoints which allow dynamic scaling based on demand.
*   **Maintainability:** Clean separation of concerns with detailed logging and monitoring means that issues can be identified and resolved quickly. The architecture encourages reusability and easy updates.

## 2. Database Management

The app uses Supabase as the backend data platform. Supabase is built on PostgreSQL, ensuring robust relational data management and ease of use.

*   **Database Technology:** PostgreSQL (through Supabase)

*   **Data Storage Components:**

    *   **Transaction Histories:** Logging every transaction including purchases and NFT redemptions.
    *   **Customer Data:** Information on users (customers, admins) including wallet addresses and transaction history.
    *   **Reward & NFT Statuses:** Tracking eligibility, minting history, and redemption of NFTs.

*   **Data Management Practices:**

    *   **Regular Backups:** Periodic automated backups to ensure data recovery.
    *   **Data Validation:** Strict API level validations to ensure data integrity before being recorded in the database.
    *   **Security:** Use of encrypted connections and role-based access to protect sensitive data.

## 3. Database Schema

Below is a human-readable overview of the database schema along with sample SQL definitions for a PostgreSQL setup.

### Human-Readable Schema Overview:

*   **Users Table:**

    *   Contains user information (customer, admin, staff).
    *   Fields: User ID, Name, Email, Role, Wallet Address, etc.

*   **Transactions Table:**

    *   Logs all transactions including purchase details, amount, and timestamp.
    *   Fields: Transaction ID, User ID (foreign key), Product Details (lemonade type, size, customizations), Amount, Payment Status, Timestamp.

*   **Rewards Table:**

    *   Tracks NFT rewards information such as eligibility, minting status, and redemption.
    *   Fields: Reward ID, User ID (foreign key), Transaction Count, Total Spent, NFT Minted (yes/no), Redemption Status, Timestamp.

### Sample SQL Schema (PostgreSQL):

-- Users Table CREATE TABLE users ( user_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, role VARCHAR(50) CHECK (role IN ('Customer', 'Admin', 'Staff')), wallet_address VARCHAR(200) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

-- Transactions Table CREATE TABLE transactions ( transaction_id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, lemonade_type VARCHAR(50) NOT NULL, size VARCHAR(20) NOT NULL, customizations VARCHAR(100), amount DECIMAL(10, 2) NOT NULL, payment_status VARCHAR(50) CHECK (payment_status IN ('Pending', 'Completed', 'Failed')), transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

## -- Rewards Table CREATE TABLE rewards ( reward_id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, transaction_count INTEGER DEFAULT 0, total_spent DECIMAL(10, 2) DEFAULT 0, nft_minted BOOLEAN DEFAULT FALSE, redemption_status VARCHAR(50) CHECK (redemption_status IN ('Not Redeemed', 'Redeemed')), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

## 4. API Design and Endpoints

The backend APIs are designed using REST principles. This makes it straightforward and simple to understand while providing flexibility for future expansion.

*   **API Approach:** RESTful

*   **Key Endpoints Include:**

    *   **User Management:**

        *   POST /api/users/signup - Create a new user account and register wallet details.
        *   POST /api/users/login - Authenticate user credentials.
        *   GET /api/users/profile - Fetch user profile and wallet details.

    *   **Order and Transaction Management:**

        *   POST /api/orders - Submit a new lemonade order including customization options.
        *   GET /api/transactions - Retrieve the transaction history for a user or admin view.

    *   **NFT Rewards and Wallet Integration:**

        *   POST /api/rewards/check - Verify if a customer qualifies for an NFT reward based on purchase and spending thresholds.
        *   POST /api/nft/mint - Trigger NFT minting on the Solana devnet when reward criteria are met.

    *   **Admin Dashboard Operations:**

        *   GET /api/admin/orders - View all incoming orders and transaction statuses.
        *   PUT /api/admin/inventory - Update inventory and pricing details.
        *   GET /api/admin/rewards - Monitor NFT reward statuses and manage redemptions.

    *   **Customer Support:**

        *   POST /api/support/ticket - Submit a support ticket.
        *   GET /api/support/faq - Fetch FAQ details.

## 5. Hosting Solutions

The backend leverages modern cloud hosting solutions to maximize reliability and scalability.

*   **Cloud Provider & Services:**

    *   **Supabase:** For database services and real-time data management.
    *   **Serverless Functions / Vercel:** For hosting API endpoints if additional serverless processing is required.

*   **Benefits:**

    *   **Reliability:** Managed services ensure high uptime and reliability.
    *   **Scalability:** Ability to scale on-demand as usage increases.
    *   **Cost-Effectiveness:** Pay-as-you-go pricing models reduce upfront costs and improve efficiency.

## 6. Infrastructure Components

A range of supporting components work together to ensure the backend performs well and provides a good user experience.

*   **Load Balancers:** Ensure that API requests are evenly distributed, avoiding overloading any single component.
*   **Caching Mechanisms:** Implementation of short-term caching for frequently accessed data (such as menu items) to reduce load on the database and improve response times.
*   **Content Delivery Network (CDN):** Although primarily used for frontend assets, a CDN may cache static content from the backend to enhance global performance.
*   **Serverless Functions:** For handling sporadic tasks such as NFT minting and wallet connectivity on the Solana devnet.

## 7. Security Measures

Ensuring the security of user data and financial transactions is critical, especially when working with blockchain payments and personal data.

*   **Authentication & Authorization:**

    *   Use of secure tokens (JWT) for user sessions.
    *   Role-based access control to differentiate between customers, admins, and staff.

*   **Data Encryption:** All sensitive data (wallet addresses, personal details) are encrypted in transit (via HTTPS) and at rest.

*   **Payment & Transaction Security:**

    *   Integration with Solana devnet ensures that blockchain transactions are secure and verifiable.
    *   Error handling for network issues or insufficient funds.

*   **Database Security:**

    *   Supabase manages database access, with strict policies and encrypted connections to ensure data integrity.

*   **API Security:**

    *   Use of rate-limiting, input validation, and API key management to protect APIs from malicious attacks.

## 8. Monitoring and Maintenance

Continuous monitoring and regular maintenance are essential to keep the backend healthy, secure, and high-performing.

*   **Monitoring Tools:**

    *   Built-in Supabase monitoring for tracking database performance.
    *   Additional tools like Sentry for error tracking and logging for serverless functions.
    *   Cloud provider monitoring dashboards for real-time alerts.

*   **Maintenance Practices:**

    *   Regular software updates and dependency management to fix vulnerabilities.
    *   Routine backups and performance audits.
    *   Automated alert systems for unusual activities or performance issues to facilitate quick responses.

## 9. Conclusion and Overall Backend Summary

The backend of the Joey's Lemonade Stand app is built to provide a secure, scalable, and enjoyable experience for both customers and administrators. In summary:

*   **Technology Stack (Backend):**

    *   Supabase (PostgreSQL)
    *   RESTful API architecture
    *   Solana devnet for blockchain payments and NFT minting

*   **Key Strengths:**

    *   A modular and scalable architecture designed to grow alongside the user base.
    *   Comprehensive data management that logs every transaction and user interaction.
    *   A robust security framework, ensuring data integrity and financial safety.
    *   Cloud hosting and infrastructure components that balance cost-effectiveness with performance.

This well-rounded backend setup aligns with the project’s goals of engaging children and families through interactive experiences while ensuring secure and smooth operations behind the scenes. Unique aspects like Solana based payments combined with an automated NFT rewards system set Joey’s Lemonade Stand app apart in the market.

This concludes the Backend Structure Document.
