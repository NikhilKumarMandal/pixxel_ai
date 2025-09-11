-- AlterTable
ALTER TABLE "public"."Plan" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "interval" DROP NOT NULL,
ALTER COLUMN "intervalCount" DROP NOT NULL,
ALTER COLUMN "trialInterval" DROP NOT NULL,
ALTER COLUMN "trialIntervalCount" DROP NOT NULL;
