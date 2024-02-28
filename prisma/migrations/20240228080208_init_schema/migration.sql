-- CreateEnum
CREATE TYPE "UserRole" AS ENUM('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "SchoolUserRole" AS ENUM('STUDENT', 'TEACHER');

-- CreateTable
CREATE TABLE "UserNewsFeed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),


CONSTRAINT "UserNewsFeed_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),


CONSTRAINT "User_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),


CONSTRAINT "School_pkey" PRIMARY KEY ("id") );

-- CreateTable
CREATE TABLE "SchoolMember" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "role" "SchoolUserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),


CONSTRAINT "SchoolMember_pkey" PRIMARY KEY ("id") );
-- 조건부 인덱스 - schoolId, UserId가 deletedAt이 null인 경우에만 유니크
CREATE UNIQUE INDEX "SchoolMember_schoolId_userId_unique" ON "SchoolMember" ("schoolId", "userId")
WHERE ("deletedAt" IS NULL);

-- CreateTable
CREATE TABLE "SchoolNews" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),


CONSTRAINT "SchoolNews_pkey" PRIMARY KEY ("id") );

-- AddForeignKey
ALTER TABLE "UserNewsFeed"
ADD CONSTRAINT "UserNewsFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolMember"
ADD CONSTRAINT "SchoolMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolMember"
ADD CONSTRAINT "SchoolMember_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolNews"
ADD CONSTRAINT "SchoolNews_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;