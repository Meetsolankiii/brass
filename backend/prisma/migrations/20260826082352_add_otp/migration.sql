-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN "otp_code" TEXT;
ALTER TABLE "admin_users" ADD COLUMN "otp_expires_at" DATETIME;
