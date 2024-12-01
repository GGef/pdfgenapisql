/*
  Warnings:

  - Added the required column `dateImported` to the `imports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `imports` ADD COLUMN `dateImported` DATETIME(3) NOT NULL;
