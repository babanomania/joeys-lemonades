# .windsurfrules

## Project Overview

*   **Type:** Interactive Decentralized Lemonade Stand App (Next.js with Chakra UI)
*   **Description:** A playful yet professional lemonade stand application for children and families, featuring multiple lemonade options, Solana-based payment system, NFT rewards for regular customers, and an integrated support ticket system.
*   **Primary Goal:** To build a fun and interactive lemonade stand app that engages diverse user roles while integrating blockchain payment and NFT reward systems.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14 (App Router): Enforce use of the `app/` directory with nested route folders using `app/[route]/page.tsx` conventions.
    *   Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
    *   Example 2: "Next.js (Pages Router)" → `pages/[route].tsx` pattern (not used in this project)
    *   Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter` (not applicable here)

### Core Directories

*   **Versioned Structure:**

    *   `app/api`: Next.js 14 API routes with Route Handlers for backend integrations such as Supabase and Solana transactions.
    *   `app/auth`: User authentication and wallet connection flows.
    *   `app/dashboard`: Admin and customer dashboards, including support ticket integrations and NFT reward notifications.

### Key Files

*   **Stack-Versioned Patterns:**

    *   `app/dashboard/layout.tsx`: Implements Next.js 14 root layout for the dashboard area (admin and customer views).
    *   `app/auth/login/page.tsx`: Custom login and wallet connection page using server actions.
    *   `app/ordering/page.tsx`: Lemonade selection and ordering flow implementation.

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14: App Router is mandatory; usage of `getInitialProps` is prohibited in favor of server-side actions and route handlers.

## PRD Compliance

*   **Non-Negotiable:**

    *   "Handle wallet connections, transaction confirmations, and error scenarios such as insufficient funds and network issues": Must be implemented using Next.js 14 server actions and Supabase webhook endpoints.
    *   "NFTs should be minted automatically upon meeting the defined customer activity threshold": Enforced via serverless functions and blockchain integration on Solana Devnet.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Next.js 14 Auth Flow → `app/auth/login/page.tsx` uses server actions for secure wallet authentication and session management.
    *   Order flow integrated via `app/ordering/page.tsx` which handles product selection, payment processing on Solana Devnet, and triggers NFT rewards based on purchase history.
    *   Support flow routed through `app/support/page.tsx` to facilitate in-app ticketing and FAQ access.
