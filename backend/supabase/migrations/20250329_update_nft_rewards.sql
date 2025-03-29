-- Drop existing nft_rewards table
DROP TABLE IF EXISTS nft_rewards;

-- Create reward_tier enum
DROP TYPE IF EXISTS reward_tier;
CREATE TYPE reward_tier AS ENUM ('purchase_count_bronze', 'purchase_count_silver', 'purchase_count_gold');

-- Recreate nft_rewards table with updated schema
CREATE TABLE nft_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
  tier reward_tier NOT NULL,
  mint_address TEXT UNIQUE,
  metadata_uri TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE nft_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NFT rewards"
  ON nft_rewards FOR SELECT
  USING (wallet_address = auth.jwt() ->> 'sub');

CREATE POLICY "Users can claim their own NFT rewards"
  ON nft_rewards FOR INSERT
  WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- Add updated_at trigger
CREATE TRIGGER update_nft_rewards_updated_at
  BEFORE UPDATE ON nft_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
