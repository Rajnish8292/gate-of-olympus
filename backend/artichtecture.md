# API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login user and return tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user and invalidate session |
| POST | /api/auth/verify-email | Verify email address |
| POST | /api/auth/forgot-password | Send password reset link |
| POST | /api/auth/reset-password | Reset password using token |



---

## Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/wallet/balance | Get current wallet balance |
| POST | /api/wallet/deposit | Deposit funds (or payment webhook) |
| POST | /api/wallet/withdraw | Withdraw funds from wallet |
| GET | /api/wallet/transactions | Get transaction history |

---

## Game

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | /api/game/spin | Start a spin round | betAmount, clientSeed? |
| POST | /api/game/buy-feature | Buy bonus feature | betAmount |
| GET |  /api/game/round/:roundId | Get round details with history | — |
| POST | /api/game/seed/rotate | Rotate server seed | — |

---

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/rtp | Get RTP statistics |
| GET | /api/admin/audit-log | Get system audit logs |
