/*
  Warnings:

  - Added the required column `schoolMemberId` to the `SchoolNews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SchoolNews" ADD COLUMN     "schoolMemberId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SchoolNews" ADD CONSTRAINT "SchoolNews_schoolMemberId_fkey" FOREIGN KEY ("schoolMemberId") REFERENCES "SchoolMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
