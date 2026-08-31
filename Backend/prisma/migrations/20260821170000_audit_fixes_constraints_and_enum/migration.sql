-- CreateEnum
CREATE TYPE "MetadataStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- Cast the existing column rather than dropping it, so saved bookmarks keep
-- the status they already resolved to. Anything unrecognised becomes FAILED,
-- which is the state a bookmark with no usable metadata should be in.
UPDATE "Bookmark"
SET "metadataStatus" = 'FAILED'
WHERE "metadataStatus" NOT IN ('PENDING', 'SUCCESS', 'FAILED');

ALTER TABLE "Bookmark"
  ALTER COLUMN "metadataStatus" DROP DEFAULT,
  ALTER COLUMN "metadataStatus" TYPE "MetadataStatus"
    USING "metadataStatus"::"MetadataStatus",
  ALTER COLUMN "metadataStatus" SET DEFAULT 'PENDING';

-- Collections could previously share a name. Suffix the later ones so the
-- unique index below can be created without discarding anyone's collection.
WITH duplicates AS (
  SELECT id,
         row_number() OVER (PARTITION BY "userId", name ORDER BY "createdAt", id) AS position
  FROM "Collection"
)
UPDATE "Collection" c
SET name = c.name || ' (' || d.position || ')'
FROM duplicates d
WHERE c.id = d.id AND d.position > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_name_key" ON "Collection"("userId", "name");