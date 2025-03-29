import { Connection, PublicKey } from '@solana/web3.js'
import { 
  Metaplex, 
  walletAdapterIdentity, 
  Nft,
  Metadata,
  Sft,
  toMetaplexFile,
  NftWithToken,
  CreateNftInput,
  toBigNumber
} from '@metaplex-foundation/js'
import { WalletContextState } from '@solana/wallet-adapter-react'

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

export interface NFTDetails {
  mintAddress: string;
  ownerAddress: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  image: string;
  mintedAt: Date;
}

export interface NFTStats {
  bronze: number;
  silver: number;
  gold: number;
  total: number;
}

const REWARDS_METADATA: { [key: string]: NFTMetadata } = {
  bronze: {
    name: "Joey's Lemonades Bronze Rewards",
    description: "Earned after 5 purchases at Joey's Lemonades. Enjoy special discounts and early access to seasonal flavors!",
    image: '/nft/bronze-rewards.svg',
    attributes: [
      { trait_type: 'Tier', value: 'Bronze' },
      { trait_type: 'Purchases', value: '5' },
      { trait_type: 'Discount', value: '5%' },
    ],
  },
  silver: {
    name: "Joey's Lemonades Silver Rewards",
    description: "Earned after 10 purchases at Joey's Lemonades. Unlock exclusive flavors and member-only events!",
    image: '/nft/silver-rewards.svg',
    attributes: [
      { trait_type: 'Tier', value: 'Silver' },
      { trait_type: 'Purchases', value: '10' },
      { trait_type: 'Discount', value: '10%' },
    ],
  },
  gold: {
    name: "Joey's Lemonades Gold Rewards",
    description: "Our highest tier reward for 20+ purchases! VIP treatment, maximum discounts, and custom flavor requests!",
    image: '/nft/gold-rewards.svg',
    attributes: [
      { trait_type: 'Tier', value: 'Gold' },
      { trait_type: 'Purchases', value: '20' },
      { trait_type: 'Discount', value: '15%' },
    ],
  },
}

export class NFTService {
  private connection: Connection
  private metaplex: Metaplex

  constructor(wallet: WalletContextState) {
    this.connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com')
    this.metaplex = Metaplex.make(this.connection).use(walletAdapterIdentity(wallet))
  }

  private async uploadMetadata(metadata: NFTMetadata) {
    try {
      // Convert image to Metaplex file
      const response = await fetch(metadata.image)
      const buffer = await response.arrayBuffer()
      const file = toMetaplexFile(buffer, 'image.svg')
      
      // Upload image
      const imageUri = await this.metaplex.storage().upload(file)
      
      // Create and upload metadata
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: metadata.name,
        description: metadata.description,
        image: imageUri,
        attributes: metadata.attributes,
        properties: {
          files: [
            {
              uri: imageUri,
              type: 'image/svg+xml',
            },
          ],
        },
      })

      return uri
    } catch (error) {
      console.error('Error uploading metadata:', error)
      throw error
    }
  }

  async mintNFT(tier: 'bronze' | 'silver' | 'gold') {
    const metadata = REWARDS_METADATA[tier]
    
    try {
      // Upload metadata and get URI
      const uri = await this.uploadMetadata(metadata)
      
      // Create NFT with proper metadata
      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: metadata.name,
        sellerFeeBasisPoints: 0,
        symbol: 'JOEY',
        creators: [
          {
            address: this.metaplex.identity().publicKey,
            share: 100,
          },
        ],
        isMutable: false,
        maxSupply: toBigNumber(1),
      })

      return nft
    } catch (error) {
      console.error('Error minting NFT:', error)
      throw error
    }
  }

  async fetchUserNFTs(owner: PublicKey) {
    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({ owner })
      return nfts.filter(nft => 
        nft.name.includes("Joey's Lemonades") && 
        nft.name.includes('Rewards')
      )
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      throw error
    }
  }

  async fetchNFTStats(): Promise<NFTStats> {
    try {
      const response = await fetch('/api/nft/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch NFT stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching NFT stats:', error);
      throw error;
    }
  }

  async fetchAllNFTs(): Promise<NFTDetails[]> {
    try {
      const storeWallet = new PublicKey(process.env.NEXT_PUBLIC_STORE_WALLET || '')
      const nfts = await this.metaplex.nfts().findAllByCreator({ creator: storeWallet })
      
      const rewardsNFTs = nfts.filter(nft => 
        nft.name.includes("Joey's Lemonades") && 
        nft.name.includes('Rewards')
      )

      const nftDetails = await Promise.all(
        rewardsNFTs.map(async (nft) => {
          // Get full NFT data including token info
          const fullNft = await this.metaplex
            .nfts()
            .findByMint({ mintAddress: nft.address })

          let tier: 'bronze' | 'silver' | 'gold'
          if (nft.name.toLowerCase().includes('bronze')) {
            tier = 'bronze'
          } else if (nft.name.toLowerCase().includes('silver')) {
            tier = 'silver'
          } else {
            tier = 'gold'
          }

          // Get the token account info to find the owner
          const tokenAccounts = await this.connection.getTokenLargestAccounts(nft.address)
          const largestAccount = tokenAccounts.value[0]
          const accountInfo = await this.connection.getParsedAccountInfo(largestAccount.address)
          const owner = (accountInfo.value?.data as any)?.parsed?.info?.owner || ''

          return {
            mintAddress: nft.address.toString(),
            ownerAddress: owner,
            name: nft.name,
            tier,
            image: nft.uri,
            mintedAt: new Date(),
          }
        })
      )

      return nftDetails
    } catch (error) {
      console.error('Error fetching all NFTs:', error)
      throw error
    }
  }
}
