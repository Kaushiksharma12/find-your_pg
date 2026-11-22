/**
 * JWT Secret Hardening Tests — lib/auth/session.ts
 *
 * Validates that:
 *  1. A configured secret allows normal sign → verify round-trip.
 *  2. A missing JWT_SECRET throws a clear, explicit error.
 *  3. An empty JWT_SECRET throws a clear, explicit error.
 *  4. A token signed with the old fallback literal is rejected when the real secret is set.
 *
 * Run with: npx tsx lib/auth/session.test.ts
 * Note: does NOT connect to MongoDB or read cookies.
 */

import { SignJWT, jwtVerify } from "jose";
import { signSessionToken, verifySessionToken, SessionUser } from "./session";

// ---------------------------------------------------------------------------
// Minimal inline re-implementation of getSecretKey() logic for test isolation.
// We test the *logic*, not just the import, so we can control process.env.JWT_SECRET
// without module-level caching causing cross-test interference.
// ---------------------------------------------------------------------------

function getSecretKey(envValue: string | undefined): Uint8Array {
  if (!envValue || envValue.trim().length === 0) {
    throw new Error(
      "[StayNest] JWT_SECRET environment variable is not configured. " +
      "Set a strong, random secret in your .env.local file before starting the server."
    );
  }
  return new TextEncoder().encode(envValue);
}

async function signToken(payload: object, secret: Uint8Array): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(token: string, secret: Uint8Array): Promise<object | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

type TestResult = { name: string; passed: boolean; note?: string };
const results: TestResult[] = [];

function assert(name: string, condition: boolean, note?: string) {
  results.push({ name, passed: condition, note });
}

async function run() {
  const REAL_SECRET = "test_secret_that_is_long_enough_to_be_valid_32chars!";
  const OLD_FALLBACK = "staynest_super_secret_jwt_key_2026_production_secure_phrase";

  const sampleUser = { id: "u1", name: "Test User", email: "test@example.com", role: "renter" };

  // ── Test 1: Configured secret — sign → verify round-trip succeeds ──────────
  {
    const key = getSecretKey(REAL_SECRET);
    const token = await signToken(sampleUser, key);
    const verified = await verifyToken(token, key) as Record<string, unknown> | null;
    assert(
      "T1: Configured secret allows sign→verify round-trip",
      verified !== null &&
        verified.id === sampleUser.id &&
        verified.email === sampleUser.email &&
        verified.role === sampleUser.role
    );
  }

  // ── Test 2: Missing secret (undefined) — throws explicit error ──────────────
  {
    let threw = false;
    let message = "";
    try {
      getSecretKey(undefined);
    } catch (e: unknown) {
      threw = true;
      message = e instanceof Error ? e.message : "";
    }
    assert(
      "T2: Missing JWT_SECRET throws explicit Error",
      threw && message.includes("JWT_SECRET"),
      `Error message: "${message}"`
    );
  }

  // ── Test 3: Empty-string secret — throws explicit error ─────────────────────
  {
    let threw = false;
    let message = "";
    try {
      getSecretKey("  ");       // whitespace-only also invalid
    } catch (e: unknown) {
      threw = true;
      message = e instanceof Error ? e.message : "";
    }
    assert(
      "T3: Empty/whitespace JWT_SECRET throws explicit Error",
      threw && message.includes("JWT_SECRET"),
      `Error message: "${message}"`
    );
  }

  // ── Test 4: Token signed with old fallback literal is rejected by real secret ─
  {
    const fallbackKey = new TextEncoder().encode(OLD_FALLBACK);
    const fallbackToken = await signToken(sampleUser, fallbackKey);
    const realKey = getSecretKey(REAL_SECRET);
    const result = await verifyToken(fallbackToken, realKey);
    assert(
      "T4: Token signed with old fallback literal is rejected by configured secret",
      result === null,
      result ? `FAIL — payload leaked: ${JSON.stringify(result)}` : "Correctly rejected"
    );
  }

  // ── Test 5: Token signed with real secret is not accepted by old fallback key ─
  {
    const realKey = getSecretKey(REAL_SECRET);
    const realToken = await signToken(sampleUser, realKey);
    const fallbackKey = new TextEncoder().encode(OLD_FALLBACK);
    const result = await verifyToken(realToken, fallbackKey);
    assert(
      "T5: Token signed with real secret is not accepted by old fallback key",
      result === null,
      result ? `FAIL — payload accepted: ${JSON.stringify(result)}` : "Correctly rejected"
    );
  }

  // ── Test 6: Real lib/auth/session.ts signSessionToken & verifySessionToken ─
  {
    const saved = process.env.JWT_SECRET;
    process.env.JWT_SECRET = REAL_SECRET;
    const sessionUser: SessionUser = { id: "u1", name: "Test User", email: "test@example.com", role: "renter" };
    const realToken = await signSessionToken(sessionUser);
    const verifiedSession = await verifySessionToken(realToken);

    delete process.env.JWT_SECRET;
    let missingThrew = false;
    try {
      await signSessionToken(sessionUser);
    } catch {
      missingThrew = true;
    }
    process.env.JWT_SECRET = saved;

    assert(
      "T6: Real lib/auth/session.ts signSessionToken & verifySessionToken round-trip and missing secret guard",
      verifiedSession !== null && verifiedSession.id === "u1" && missingThrew
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed);

  console.log("\n── JWT Secret Hardening Tests ──");
  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`  ${icon} ${r.name}${r.note ? `  [${r.note}]` : ""}`);
  }
  console.log(`\n  ${passed}/${results.length} passed`);

  if (failed.length > 0) {
    console.error("\n  FAILED tests:");
    for (const f of failed) console.error(`    ✗ ${f.name}`);
    process.exit(1);
  }

  console.log("  All JWT hardening tests passed.\n");
}

run().catch((err) => {
  console.error("Unexpected test runner error:", err);
  process.exit(1);
});
