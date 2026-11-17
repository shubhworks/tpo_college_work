// Small in-memory failure counter (single backend instance). Resets on restart.
const failures = new Map<string, { count: number; resetAt: number }>();

export function isBlocked(key: string, max: number): boolean {
    const entry = failures.get(key);
    if (!entry) return false;
    if (Date.now() > entry.resetAt) {
        failures.delete(key);
        return false;
    }
    return entry.count >= max;
}

export function recordFailure(key: string, windowMs: number) {
    const now = Date.now();
    const entry = failures.get(key);
    if (!entry || now > entry.resetAt) {
        failures.set(key, { count: 1, resetAt: now + windowMs });
    } else {
        entry.count += 1;
    }
}

export function clearFailures(key: string) {
    failures.delete(key);
}
