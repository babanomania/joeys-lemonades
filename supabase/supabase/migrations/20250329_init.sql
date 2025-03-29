-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    transaction_signature TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create nft_rewards table
CREATE TABLE nft_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    token_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('purchase_count', 'spend_amount')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'minted', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create users table for tracking customer stats
CREATE TABLE users (
    wallet_address TEXT PRIMARY KEY,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_orders_wallet_address ON orders(wallet_address);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_nft_rewards_wallet_address ON nft_rewards(wallet_address);
CREATE INDEX idx_nft_rewards_status ON nft_rewards(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_rewards_updated_at
    BEFORE UPDATE ON nft_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user stats on order confirmation
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' THEN
        INSERT INTO users (wallet_address, total_orders, total_spent, last_order_at)
        VALUES (
            NEW.wallet_address,
            1,
            NEW.total,
            NEW.created_at
        )
        ON CONFLICT (wallet_address)
        DO UPDATE SET
            total_orders = users.total_orders + 1,
            total_spent = users.total_spent + NEW.total,
            last_order_at = NEW.created_at;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating user stats
CREATE TRIGGER update_user_stats_on_order
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
