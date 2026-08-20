/*
  Warnings:

  - Added the required column `domain` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "favicon" TEXT;
