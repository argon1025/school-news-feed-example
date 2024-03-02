/*
  Warnings:

  - You are about to drop the `UserNewsFeed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNewsFeed" DROP CONSTRAINT "UserNewsFeed_userId_fkey";

-- DropTable
DROP TABLE "UserNewsFeed";

-- CreateTable
CREATE TABLE "NewsFeed" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NewsFeed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewsFeed" ADD CONSTRAINT "NewsFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
