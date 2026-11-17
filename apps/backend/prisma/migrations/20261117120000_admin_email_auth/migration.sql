-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('ACTIVATE', 'RESET');

-- CreateTable
CREATE TABLE "whitelisted_emails" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT,
    "activated_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "added_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whitelisted_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whitelisted_emails_email_key" ON "whitelisted_emails"("email");

-- CreateIndex
CREATE INDEX "otp_codes_email_purpose_idx" ON "otp_codes"("email", "purpose");

