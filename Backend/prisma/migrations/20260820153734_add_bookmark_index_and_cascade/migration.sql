-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- CreateIndex
CREATE INDEX "Bookmark_userId_savedAt_idx" ON "Bookmark"("userId", "savedAt");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
