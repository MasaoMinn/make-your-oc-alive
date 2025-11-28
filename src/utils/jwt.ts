import { sign, verify, JwtPayload, Algorithm, SignOptions } from "jsonwebtoken";

const DEFAULT_EXPIRES_IN = "7d";

export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return secret;
}

export function signAuthToken(
  userId: string | number,
  name: string,
  expiresIn: SignOptions["expiresIn"] = DEFAULT_EXPIRES_IN
): string {
  const secret = requireJwtSecret();
  const payload = { sub: String(userId), name } as const;
  const algorithm: Algorithm = "HS256";
  return sign(payload, secret, { algorithm, expiresIn });
}

export function verifyAuthToken(token: string): JwtPayload & { sub: string; name: string } {
  const secret = requireJwtSecret();
  const algorithm: Algorithm = "HS256";
  const decoded = verify(token, secret, { algorithms: [algorithm] });
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as JwtPayload & { sub: string; name: string };
}


