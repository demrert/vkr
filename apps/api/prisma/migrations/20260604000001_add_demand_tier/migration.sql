-- CreateEnum
CREATE TYPE "DemandTier" AS ENUM ('S', 'A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "profession_skills" ADD COLUMN "demand_tier" "DemandTier" NOT NULL DEFAULT 'B';
