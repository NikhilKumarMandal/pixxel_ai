-- CreateEnum
CREATE TYPE "public"."TrainingStatus" AS ENUM ('starting', 'processing', 'succeeded', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "public"."Genders" AS ENUM ('man', 'women');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "model_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" TEXT NOT NULL,
    "modelId" TEXT,
    "modelName" TEXT,
    "triggerWord" TEXT,
    "version" TEXT,
    "trainingSatus" "public"."TrainingStatus",
    "trainingSteps" INTEGER DEFAULT 0,
    "trainingTime" TEXT,
    "gender" "public"."Genders" DEFAULT 'man',
    "trainingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
