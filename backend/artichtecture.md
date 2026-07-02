POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/wallet/balance
POST   /api/wallet/deposit          (or webhook from payment provider)
POST   /api/wallet/withdraw
GET    /api/wallet/transactions

POST   /api/game/spin               (body: betAmount, clientSeed?)
POST   /api/game/buy-feature        (body: betAmount)
GET    /api/game/round/:roundId     (round detail incl. tumble history)
GET    /api/game/verify/:roundId    (provably fair verification)
POST   /api/game/seed/rotate        (rotate server seed, reveal previous)

GET    /api/admin/rtp
GET    /api/admin/audit-log