-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'failed');
CREATE TYPE nft_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE nft_status AS ENUM ('pending', 'minted', 'revoked', 'failed');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE menu_category AS ENUM ('classic', 'premium', 'seasonal');
CREATE TYPE menu_size AS ENUM ('small', 'large');
CREATE TYPE reward_tier AS ENUM ('bronze', 'silver', 'gold');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user stats update trigger function
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user if not exists
    INSERT INTO users (wallet_address)
    VALUES (NEW.wallet_address)
    ON CONFLICT (wallet_address) DO NOTHING;

    -- Update user stats
    UPDATE users
    SET 
        total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total,
        last_order_at = NOW()
    WHERE wallet_address = NEW.wallet_address;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE public.users (
    wallet_address text NOT NULL,
    total_orders integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0.00,
    last_order_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT users_pkey PRIMARY KEY (wallet_address)
) TABLESPACE pg_default;

-- Create orders table
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    wallet_address text NOT NULL,
    items jsonb NOT NULL,
    total numeric(10,2) NOT NULL,
    transaction_signature text NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'failed'::text]))
) TABLESPACE pg_default;

-- Create nft_rewards table
CREATE TABLE public.nft_rewards (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    wallet_address text NOT NULL,
    tier public.reward_tier NOT NULL,
    mint_address text,
    metadata_uri text,
    status text NOT NULL DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type text,
    CONSTRAINT nft_rewards_pkey PRIMARY KEY (id),
    CONSTRAINT nft_rewards_mint_address_key UNIQUE (mint_address),
    CONSTRAINT nft_rewards_wallet_address_fkey FOREIGN KEY (wallet_address) REFERENCES users(wallet_address),
    CONSTRAINT nft_rewards_type_check CHECK (type = ANY (ARRAY['purchase_count'::text, 'spend_amount'::text]))
) TABLESPACE pg_default;

-- Create menu_items table
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    size menu_size NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    category menu_category NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
    order_id UUID REFERENCES orders(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'open',
    priority ticket_priority NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admins table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_wallet_address ON public.orders USING btree (wallet_address) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_nft_rewards_wallet_address ON public.nft_rewards USING btree (wallet_address) TABLESPACE pg_default;
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_orders_wallet ON orders(wallet_address);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_nft_rewards_status ON nft_rewards(status);
CREATE INDEX idx_support_tickets_wallet ON support_tickets(wallet_address);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_rewards_updated_at
    BEFORE UPDATE ON nft_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_on_order
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
TO authenticated
USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own NFTs"
ON public.nft_rewards FOR SELECT
TO authenticated
USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Public menu items access" 
ON public.menu_items FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Admin menu items access" 
ON public.menu_items FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Users can view their order items" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (order_id IN (SELECT id FROM orders WHERE wallet_address = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets FOR SELECT 
TO authenticated 
USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create support tickets" 
ON public.support_tickets FOR INSERT 
TO authenticated 
WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Admin full access" 
ON public.users FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Admin orders access" 
ON public.orders FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Admin order items access" 
ON public.order_items FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Admin NFT rewards access" 
ON public.nft_rewards FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Admin tickets access" 
ON public.support_tickets FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

CREATE POLICY "Admin access only" 
ON public.admins FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'sub' IN (SELECT wallet_address FROM admins));

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, size, category, image_url, tags) VALUES
('Classic Lemonade', 'Our signature fresh-squeezed lemonade with the perfect balance of sweet and tart.', 3.99, 'small', 'classic', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859', ARRAY['Bestseller']),
('Strawberry Lemonade', 'Fresh lemonade infused with real strawberries for a fruity twist.', 4.49, 'small', 'premium', 'https://images.unsplash.com/photo-1560089168-6516081f5bf1', ARRAY['Popular']),
('Minty Lemonade', 'Cool and refreshing with a blend of fresh mint leaves.', 4.49, 'small', 'premium', 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87', NULL),
('Peach Lemonade', 'Sweet and refreshing with real peach puree.', 4.99, 'small', 'seasonal', 'https://images.unsplash.com/photo-1497534446932-c925b458314e', ARRAY['Limited Time']),
('Raspberry Lemonade', 'Tart and sweet with fresh raspberry puree.', 4.49, 'small', 'premium', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22', NULL),
('Lavender Lemonade', 'A unique blend with calming lavender essence.', 4.99, 'small', 'seasonal', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', ARRAY['New'])
ON CONFLICT DO NOTHING;
