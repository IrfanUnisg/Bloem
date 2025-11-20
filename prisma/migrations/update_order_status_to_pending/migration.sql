-- Update default status for orders table from RESERVED to PENDING
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Update comment to reflect new simplified status flow
COMMENT ON COLUMN "orders"."status" IS 'PENDING (awaiting payment), COMPLETED (paid and items sold), CANCELLED';
