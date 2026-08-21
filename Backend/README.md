# Backend

## Auth

Bearer JWTs. Every token carries a `jti`, and `POST /auth/logout` writes that
`jti` to the `RevokedToken` table, so a token stops working the moment its
session logs out rather than staying valid until it expires. Revocation is
per-token: logging out one device leaves the user's other sessions signed in.
Rows are swept once the token would have expired anyway.

The cost is a denylist lookup on every authenticated request.
