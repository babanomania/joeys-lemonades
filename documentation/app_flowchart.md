flowchart TD
    A[Landing Page] --> B[Sign In / Sign Up]
    B --> C[Wallet Connect]
    C --> D[Main Dashboard]

    D --> E[Browse Menu]
    E --> F[Select Lemonade Option]
    F --> G[Customize Order Options]
    G --> H[Order Confirmation]
    H --> I[Payment Processing]

    I --> J[Wallet Integration & Transaction Submission]
    J --> K{Transaction Successful?}
    K -- Yes --> L[Order Confirmed & NFT Mint Check]
    L --> M[Record Transaction in Supabase]
    M --> N{NFT Threshold Met?}
    N -- Yes --> O[Mint NFT Reward on Solana Devnet]
    O --> P[Update Reward Status]
    P --> D
    N -- No --> D

    K -- No --> Q[Display Error Message]
    Q --> R[Retry Payment or Cancel Order]
    R --> D

    D --> S[Support / Feedback]
    S --> D

    D --> T[Settings & Account Management]
    T --> D

    D --> U[Admin Dashboard]
    U --> M