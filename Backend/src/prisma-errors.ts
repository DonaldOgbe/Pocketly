// P2002 is Prisma's unique constraint violation. Catching it beats a
// findUnique-then-create, which races two concurrent requests.
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}
