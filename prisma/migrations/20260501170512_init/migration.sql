CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'AR');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'DRIVER', 'VENDOR_MEMBER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_ORDERS', 'MANAGE_PRODUCTS', 'MANAGE_VENDORS', 'MANAGE_DRIVERS', 'MANAGE_CUSTOMERS', 'MANAGE_TICKETS', 'MANAGE_CONVERSATIONS', 'VIEW_STATISTICS', 'MANAGE_SETTINGS', 'MANAGE_USERS', 'VIEW_FINANCIALS', 'MANAGE_FINANCE', 'MANAGE_PROMOTIONS', 'VIEW_AUDIT_LOGS');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_UPDATE', 'CHAT_MESSAGE', 'PROMOTION', 'SYSTEM', 'PAYMENT', 'TICKET_UPDATE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'LOCATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('ORDER', 'SUPPORT');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('CLOSED', 'OPEN', 'PAUSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VendorMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY', 'ON_DELIVERY', 'ON_BREAK', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DriverShiftStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'MISSED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('DELIVERY_FEE', 'CASH_COLLECTED', 'CASH_HANDED_TO_VENDOR', 'PAYOUT', 'PENALTY', 'BONUS', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "VendorTransactionType" AS ENUM ('ORDER_REVENUE', 'COMMISSION_DEDUCTION', 'CASH_COLLECTED', 'PAYOUT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "StatisticPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'LOOKING_FOR_DRIVER', 'DRIVER_ASSIGNED', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'MOBILE_WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('GENERAL', 'ORDER_ISSUE', 'PAYMENT_ISSUE', 'TECHNICAL_ISSUE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'OTHER');

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "defaultCommissionRate" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "defaultTaxRate" DECIMAL(10,2) NOT NULL DEFAULT 14.00,
    "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "baseDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    "pricePerKm" DECIMAL(10,2) NOT NULL DEFAULT 3.00,
    "maxDeliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "driverSearchRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "autoCancelPendingMins" INTEGER NOT NULL DEFAULT 15,
    "driverAcceptTimeoutSecs" INTEGER NOT NULL DEFAULT 30,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "androidMinVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "androidLatestVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "androidForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "androidStoreUrl" TEXT,
    "iosMinVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "iosLatestVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "iosForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "iosStoreUrl" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "supportWhatsapp" TEXT,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "boundary" geometry(Polygon, 4326) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseDeliveryFeeOverride" DECIMAL(10,2),
    "minOrderAmountOverride" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "title" TEXT,
    "titleAr" TEXT,
    "permissions" "Permission"[],
    "avatar" TEXT,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "userId" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedRt" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "body" TEXT,
    "bodyAr" TEXT,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "chatMessages" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "ticketUpdates" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'ORDER',
    "orderId" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "mediaUrl" TEXT,
    "metadata" JSONB,
    "replyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "orderId" TEXT,
    "vendorId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canOrder" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_vendors" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_products" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "details" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_verticals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_verticals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeNameAr" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "taxId" TEXT,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 10.0,
    "status" "VendorStatus" NOT NULL DEFAULT 'CLOSED',
    "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "verticalId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_members" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "VendorMemberRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "location" geometry(Point, 4326) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "zoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_wallet_transactions" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "VendorTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_statistics" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalCommission" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalTax" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "avgPrepTimeMins" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_statistics" (
    "id" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalAdminRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalDeliveryFees" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "activeCustomers" INTEGER NOT NULL DEFAULT 0,
    "activeDrivers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "imageUrl" TEXT,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DECIMAL(10,2),
    "comparePrice" DECIMAL(10,2),
    "sku" TEXT,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "sku" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_groups" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "product_option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_options" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "priceAdded" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "specialRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item_options" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "cart_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "driverId" TEXT,
    "zoneId" TEXT,
    "driverShiftId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLocation" geometry(Point, 4326) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "specialRequest" TEXT,
    "estimatedPrepTime" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "preparedAt" TIMESTAMP(3),
    "driverAssignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "actualDeliveryTime" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "specialRequest" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_options" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "optionId" TEXT,
    "optionName" TEXT NOT NULL,
    "priceAdded" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "nationalId" TEXT,
    "licenseNumber" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'MOTORCYCLE',
    "vehiclePlate" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "currentLocation" geometry(Point, 4326),
    "lastLocationUpdate" TIMESTAMP(3),
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 5.0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_shifts" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "zoneId" TEXT,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "startingLocation" geometry(Point, 4326),
    "endingLocation" geometry(Point, 4326),
    "status" "DriverShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "breakMinutes" INTEGER,
    "totalEarnings" DECIMAL(10,2),
    "totalDeliveries" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_wallet_transactions" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "orderId" TEXT,
    "driverShiftId" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_statistics" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "onlineHours" DOUBLE PRECISION,
    "totalDispatchesReceived" INTEGER NOT NULL DEFAULT 0,
    "dispatchesAccepted" INTEGER NOT NULL DEFAULT 0,
    "dispatchesRejected" INTEGER NOT NULL DEFAULT 0,
    "dispatchesExpired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_dispatches" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverShiftId" TEXT,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "distanceKm" DOUBLE PRECISION,
    "estimatedEarnings" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT,
    "actionType" "AuditActionType" NOT NULL DEFAULT 'OTHER',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zones_isActive_idx" ON "zones"("isActive");

-- CreateIndex
CREATE INDEX "zones_boundary_idx" ON "zones" USING GIST ("boundary");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "devices_token_key" ON "devices"("token");

-- CreateIndex
CREATE INDEX "devices_userId_idx" ON "devices"("userId");

-- CreateIndex
CREATE INDEX "devices_userId_platform_idx" ON "devices"("userId", "platform");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE INDEX "conversations_orderId_idx" ON "conversations"("orderId");

-- CreateIndex
CREATE INDEX "conversations_vendorId_idx" ON "conversations"("vendorId");

-- CreateIndex
CREATE INDEX "conversations_createdAt_idx" ON "conversations"("createdAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_replyToId_idx" ON "messages"("replyToId");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_conversationId_key" ON "support_tickets"("conversationId");

-- CreateIndex
CREATE INDEX "support_tickets_creatorId_idx" ON "support_tickets"("creatorId");

-- CreateIndex
CREATE INDEX "support_tickets_assigneeId_idx" ON "support_tickets"("assigneeId");

-- CreateIndex
CREATE INDEX "support_tickets_vendorId_idx" ON "support_tickets"("vendorId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_orderId_idx" ON "support_tickets"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- CreateIndex
CREATE INDEX "favorite_vendors_customerId_idx" ON "favorite_vendors"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_vendors_customerId_vendorId_key" ON "favorite_vendors"("customerId", "vendorId");

-- CreateIndex
CREATE INDEX "favorite_products_customerId_idx" ON "favorite_products"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_products_customerId_productId_key" ON "favorite_products"("customerId", "productId");

-- CreateIndex
CREATE INDEX "addresses_customerId_idx" ON "addresses"("customerId");

-- CreateIndex
CREATE INDEX "addresses_location_idx" ON "addresses" USING GIST ("location");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_verticals_slug_key" ON "vendor_verticals"("slug");

-- CreateIndex
CREATE INDEX "vendor_verticals_isActive_sortOrder_idx" ON "vendor_verticals"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_createdAt_idx" ON "vendors"("createdAt");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_verticalId_idx" ON "vendors"("verticalId");

-- CreateIndex
CREATE INDEX "vendors_deletedAt_idx" ON "vendors"("deletedAt");

-- CreateIndex
CREATE INDEX "vendor_members_userId_idx" ON "vendor_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_members_vendorId_userId_key" ON "vendor_members"("vendorId", "userId");

-- CreateIndex
CREATE INDEX "vendor_branches_vendorId_idx" ON "vendor_branches"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_branches_zoneId_idx" ON "vendor_branches"("zoneId");

-- CreateIndex
CREATE INDEX "vendor_branches_vendorId_isOpen_idx" ON "vendor_branches"("vendorId", "isOpen");

-- CreateIndex
CREATE INDEX "vendor_branches_location_idx" ON "vendor_branches" USING GIST ("location");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_vendorId_idx" ON "vendor_wallet_transactions"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_orderId_idx" ON "vendor_wallet_transactions"("orderId");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_createdAt_idx" ON "vendor_wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "vendor_statistics_vendorId_period_idx" ON "vendor_statistics"("vendorId", "period");

-- CreateIndex
CREATE INDEX "vendor_statistics_startDate_endDate_idx" ON "vendor_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_statistics_vendorId_period_startDate_key" ON "vendor_statistics"("vendorId", "period", "startDate");

-- CreateIndex
CREATE INDEX "app_statistics_period_idx" ON "app_statistics"("period");

-- CreateIndex
CREATE INDEX "app_statistics_startDate_endDate_idx" ON "app_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "app_statistics_period_startDate_key" ON "app_statistics"("period", "startDate");

-- CreateIndex
CREATE INDEX "menu_categories_vendorId_isActive_idx" ON "menu_categories"("vendorId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_vendorId_isActive_idx" ON "products"("vendorId", "isActive");

-- CreateIndex
CREATE INDEX "products_vendorId_isActive_isFeatured_idx" ON "products"("vendorId", "isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_isActive_idx" ON "product_variants"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_option_groups_productId_idx" ON "product_option_groups"("productId");

-- CreateIndex
CREATE INDEX "product_option_groups_variantId_idx" ON "product_option_groups"("variantId");

-- CreateIndex
CREATE INDEX "product_options_groupId_idx" ON "product_options"("groupId");

-- CreateIndex
CREATE INDEX "carts_customerId_idx" ON "carts"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_customerId_vendorId_key" ON "carts"("customerId", "vendorId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_item_options_cartItemId_idx" ON "cart_item_options"("cartItemId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_vendorId_idx" ON "orders"("vendorId");

-- CreateIndex
CREATE INDEX "orders_zoneId_idx" ON "orders"("zoneId");

-- CreateIndex
CREATE INDEX "orders_vendorId_status_idx" ON "orders"("vendorId", "status");

-- CreateIndex
CREATE INDEX "orders_driverId_idx" ON "orders"("driverId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_deletedAt_idx" ON "orders"("deletedAt");

-- CreateIndex
CREATE INDEX "orders_deliveryLocation_idx" ON "orders" USING GIST ("deliveryLocation");

-- CreateIndex
CREATE INDEX "order_status_events_orderId_createdAt_idx" ON "order_status_events"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_item_options_orderItemId_idx" ON "order_item_options"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_createdAt_idx" ON "drivers"("createdAt");

-- CreateIndex
CREATE INDEX "drivers_deletedAt_idx" ON "drivers"("deletedAt");

-- CreateIndex
CREATE INDEX "driver_shifts_driverId_idx" ON "driver_shifts"("driverId");

-- CreateIndex
CREATE INDEX "driver_shifts_zoneId_idx" ON "driver_shifts"("zoneId");

-- CreateIndex
CREATE INDEX "driver_shifts_driverId_status_idx" ON "driver_shifts"("driverId", "status");

-- CreateIndex
CREATE INDEX "driver_shifts_shiftDate_idx" ON "driver_shifts"("shiftDate");

-- CreateIndex
CREATE INDEX "driver_shifts_status_idx" ON "driver_shifts"("status");

-- CreateIndex
CREATE INDEX "driver_shifts_startingLocation_idx" ON "driver_shifts" USING GIST ("startingLocation");

-- CreateIndex
CREATE INDEX "driver_shifts_endingLocation_idx" ON "driver_shifts" USING GIST ("endingLocation");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_driverId_idx" ON "driver_wallet_transactions"("driverId");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_orderId_idx" ON "driver_wallet_transactions"("orderId");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_createdAt_idx" ON "driver_wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_driverShiftId_idx" ON "driver_wallet_transactions"("driverShiftId");

-- CreateIndex
CREATE INDEX "driver_statistics_driverId_period_idx" ON "driver_statistics"("driverId", "period");

-- CreateIndex
CREATE INDEX "driver_statistics_startDate_endDate_idx" ON "driver_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "driver_statistics_driverId_period_startDate_key" ON "driver_statistics"("driverId", "period", "startDate");

-- CreateIndex
CREATE INDEX "order_dispatches_orderId_idx" ON "order_dispatches"("orderId");

-- CreateIndex
CREATE INDEX "order_dispatches_driverId_idx" ON "order_dispatches"("driverId");

-- CreateIndex
CREATE INDEX "order_dispatches_driverShiftId_idx" ON "order_dispatches"("driverShiftId");

-- CreateIndex
CREATE INDEX "order_dispatches_status_idx" ON "order_dispatches"("status");

-- CreateIndex
CREATE INDEX "order_dispatches_createdAt_idx" ON "order_dispatches"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_vendorId_idx" ON "audit_logs"("vendorId");

-- CreateIndex
CREATE INDEX "audit_logs_actionType_idx" ON "audit_logs"("actionType");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_vendors" ADD CONSTRAINT "favorite_vendors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_vendors" ADD CONSTRAINT "favorite_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "vendor_verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_branches" ADD CONSTRAINT "vendor_branches_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_branches" ADD CONSTRAINT "vendor_branches_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_wallet_transactions" ADD CONSTRAINT "vendor_wallet_transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_wallet_transactions" ADD CONSTRAINT "vendor_wallet_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_statistics" ADD CONSTRAINT "vendor_statistics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_shifts" ADD CONSTRAINT "driver_shifts_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_shifts" ADD CONSTRAINT "driver_shifts_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_statistics" ADD CONSTRAINT "driver_statistics_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
DECLARE
  next_val INT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING("ticketNumber" FROM 5) AS INTEGER)), 0
  ) + 1
  INTO next_val
  FROM support_tickets
  WHERE "ticketNumber" ~ '^TKT-[0-9]+$';
 
  EXECUTE format(
    'CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START %s',
    next_val
  );
END;
$$;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'AR');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'DRIVER', 'VENDOR_MEMBER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_ORDERS', 'MANAGE_PRODUCTS', 'MANAGE_VENDORS', 'MANAGE_DRIVERS', 'MANAGE_CUSTOMERS', 'MANAGE_TICKETS', 'MANAGE_CONVERSATIONS', 'VIEW_STATISTICS', 'MANAGE_SETTINGS', 'MANAGE_USERS', 'VIEW_FINANCIALS', 'MANAGE_FINANCE', 'MANAGE_PROMOTIONS', 'VIEW_AUDIT_LOGS');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_UPDATE', 'CHAT_MESSAGE', 'PROMOTION', 'SYSTEM', 'PAYMENT', 'TICKET_UPDATE');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'LOCATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('ORDER', 'SUPPORT');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('CLOSED', 'OPEN', 'PAUSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VendorMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY', 'ON_DELIVERY', 'ON_BREAK', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DriverShiftStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'MISSED');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('DELIVERY_FEE', 'CASH_COLLECTED', 'CASH_HANDED_TO_VENDOR', 'PAYOUT', 'PENALTY', 'BONUS', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "VendorTransactionType" AS ENUM ('ORDER_REVENUE', 'COMMISSION_DEDUCTION', 'CASH_COLLECTED', 'PAYOUT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "StatisticPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'LOOKING_FOR_DRIVER', 'DRIVER_ASSIGNED', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'MOBILE_WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('GENERAL', 'ORDER_ISSUE', 'PAYMENT_ISSUE', 'TECHNICAL_ISSUE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'OTHER');

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "defaultCommissionRate" DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    "defaultTaxRate" DECIMAL(10,2) NOT NULL DEFAULT 14.00,
    "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "baseDeliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    "pricePerKm" DECIMAL(10,2) NOT NULL DEFAULT 3.00,
    "maxDeliveryRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "driverSearchRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "autoCancelPendingMins" INTEGER NOT NULL DEFAULT 15,
    "driverAcceptTimeoutSecs" INTEGER NOT NULL DEFAULT 30,
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "androidMinVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "androidLatestVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "androidForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "androidStoreUrl" TEXT,
    "iosMinVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "iosLatestVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "iosForceUpdate" BOOLEAN NOT NULL DEFAULT false,
    "iosStoreUrl" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "supportWhatsapp" TEXT,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "boundary" geometry(Polygon, 4326) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "baseDeliveryFeeOverride" DECIMAL(10,2),
    "minOrderAmountOverride" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "title" TEXT,
    "titleAr" TEXT,
    "permissions" "Permission"[],
    "avatar" TEXT,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "userId" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedRt" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "body" TEXT,
    "bodyAr" TEXT,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "chatMessages" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "ticketUpdates" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL DEFAULT 'ORDER',
    "orderId" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "mediaUrl" TEXT,
    "metadata" JSONB,
    "replyToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "orderId" TEXT,
    "vendorId" TEXT,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canOrder" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_vendors" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_products" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "details" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_verticals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_verticals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeNameAr" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "taxId" TEXT,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 10.0,
    "status" "VendorStatus" NOT NULL DEFAULT 'CLOSED',
    "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "verticalId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_members" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "VendorMemberRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "location" geometry(Point, 4326) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "zoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_wallet_transactions" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "VendorTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_statistics" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalCommission" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalTax" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "avgPrepTimeMins" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_statistics" (
    "id" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalAdminRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "totalDeliveryFees" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "activeCustomers" INTEGER NOT NULL DEFAULT 0,
    "activeDrivers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionAr" TEXT,
    "imageUrl" TEXT,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "basePrice" DECIMAL(10,2),
    "comparePrice" DECIMAL(10,2),
    "sku" TEXT,
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "sku" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "stock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_groups" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "product_option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_options" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "priceAdded" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "specialRequest" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item_options" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "cart_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "driverId" TEXT,
    "zoneId" TEXT,
    "driverShiftId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLocation" geometry(Point, 4326) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "specialRequest" TEXT,
    "estimatedPrepTime" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "preparedAt" TIMESTAMP(3),
    "driverAssignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "actualDeliveryTime" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "specialRequest" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_options" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "optionId" TEXT,
    "optionName" TEXT NOT NULL,
    "priceAdded" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "nationalId" TEXT,
    "licenseNumber" TEXT,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'MOTORCYCLE',
    "vehiclePlate" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "currentLocation" geometry(Point, 4326),
    "lastLocationUpdate" TIMESTAMP(3),
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 5.0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_shifts" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "zoneId" TEXT,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "startingLocation" geometry(Point, 4326),
    "endingLocation" geometry(Point, 4326),
    "status" "DriverShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "breakMinutes" INTEGER,
    "totalEarnings" DECIMAL(10,2),
    "totalDeliveries" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_wallet_transactions" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "orderId" TEXT,
    "driverShiftId" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_statistics" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "period" "StatisticPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelledOrders" INTEGER NOT NULL DEFAULT 0,
    "onlineHours" DOUBLE PRECISION,
    "totalDispatchesReceived" INTEGER NOT NULL DEFAULT 0,
    "dispatchesAccepted" INTEGER NOT NULL DEFAULT 0,
    "dispatchesRejected" INTEGER NOT NULL DEFAULT 0,
    "dispatchesExpired" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_dispatches" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverShiftId" TEXT,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "distanceKm" DOUBLE PRECISION,
    "estimatedEarnings" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT,
    "actionType" "AuditActionType" NOT NULL DEFAULT 'OTHER',
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zones_isActive_idx" ON "zones"("isActive");

-- CreateIndex
CREATE INDEX "zones_boundary_idx" ON "zones" USING GIST ("boundary");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "devices_token_key" ON "devices"("token");

-- CreateIndex
CREATE INDEX "devices_userId_idx" ON "devices"("userId");

-- CreateIndex
CREATE INDEX "devices_userId_platform_idx" ON "devices"("userId", "platform");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE INDEX "conversations_orderId_idx" ON "conversations"("orderId");

-- CreateIndex
CREATE INDEX "conversations_vendorId_idx" ON "conversations"("vendorId");

-- CreateIndex
CREATE INDEX "conversations_createdAt_idx" ON "conversations"("createdAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_replyToId_idx" ON "messages"("replyToId");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_conversationId_key" ON "support_tickets"("conversationId");

-- CreateIndex
CREATE INDEX "support_tickets_creatorId_idx" ON "support_tickets"("creatorId");

-- CreateIndex
CREATE INDEX "support_tickets_assigneeId_idx" ON "support_tickets"("assigneeId");

-- CreateIndex
CREATE INDEX "support_tickets_vendorId_idx" ON "support_tickets"("vendorId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_orderId_idx" ON "support_tickets"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");

-- CreateIndex
CREATE INDEX "customers_createdAt_idx" ON "customers"("createdAt");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- CreateIndex
CREATE INDEX "favorite_vendors_customerId_idx" ON "favorite_vendors"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_vendors_customerId_vendorId_key" ON "favorite_vendors"("customerId", "vendorId");

-- CreateIndex
CREATE INDEX "favorite_products_customerId_idx" ON "favorite_products"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_products_customerId_productId_key" ON "favorite_products"("customerId", "productId");

-- CreateIndex
CREATE INDEX "addresses_customerId_idx" ON "addresses"("customerId");

-- CreateIndex
CREATE INDEX "addresses_location_idx" ON "addresses" USING GIST ("location");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_verticals_slug_key" ON "vendor_verticals"("slug");

-- CreateIndex
CREATE INDEX "vendor_verticals_isActive_sortOrder_idx" ON "vendor_verticals"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "vendors_createdAt_idx" ON "vendors"("createdAt");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendors_verticalId_idx" ON "vendors"("verticalId");

-- CreateIndex
CREATE INDEX "vendors_deletedAt_idx" ON "vendors"("deletedAt");

-- CreateIndex
CREATE INDEX "vendor_members_userId_idx" ON "vendor_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_members_vendorId_userId_key" ON "vendor_members"("vendorId", "userId");

-- CreateIndex
CREATE INDEX "vendor_branches_vendorId_idx" ON "vendor_branches"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_branches_zoneId_idx" ON "vendor_branches"("zoneId");

-- CreateIndex
CREATE INDEX "vendor_branches_vendorId_isOpen_idx" ON "vendor_branches"("vendorId", "isOpen");

-- CreateIndex
CREATE INDEX "vendor_branches_location_idx" ON "vendor_branches" USING GIST ("location");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_vendorId_idx" ON "vendor_wallet_transactions"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_orderId_idx" ON "vendor_wallet_transactions"("orderId");

-- CreateIndex
CREATE INDEX "vendor_wallet_transactions_createdAt_idx" ON "vendor_wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "vendor_statistics_vendorId_period_idx" ON "vendor_statistics"("vendorId", "period");

-- CreateIndex
CREATE INDEX "vendor_statistics_startDate_endDate_idx" ON "vendor_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_statistics_vendorId_period_startDate_key" ON "vendor_statistics"("vendorId", "period", "startDate");

-- CreateIndex
CREATE INDEX "app_statistics_period_idx" ON "app_statistics"("period");

-- CreateIndex
CREATE INDEX "app_statistics_startDate_endDate_idx" ON "app_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "app_statistics_period_startDate_key" ON "app_statistics"("period", "startDate");

-- CreateIndex
CREATE INDEX "menu_categories_vendorId_isActive_idx" ON "menu_categories"("vendorId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_vendorId_isActive_idx" ON "products"("vendorId", "isActive");

-- CreateIndex
CREATE INDEX "products_vendorId_isActive_isFeatured_idx" ON "products"("vendorId", "isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_isActive_idx" ON "product_variants"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_option_groups_productId_idx" ON "product_option_groups"("productId");

-- CreateIndex
CREATE INDEX "product_option_groups_variantId_idx" ON "product_option_groups"("variantId");

-- CreateIndex
CREATE INDEX "product_options_groupId_idx" ON "product_options"("groupId");

-- CreateIndex
CREATE INDEX "carts_customerId_idx" ON "carts"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "carts_customerId_vendorId_key" ON "carts"("customerId", "vendorId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_item_options_cartItemId_idx" ON "cart_item_options"("cartItemId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_vendorId_idx" ON "orders"("vendorId");

-- CreateIndex
CREATE INDEX "orders_zoneId_idx" ON "orders"("zoneId");

-- CreateIndex
CREATE INDEX "orders_vendorId_status_idx" ON "orders"("vendorId", "status");

-- CreateIndex
CREATE INDEX "orders_driverId_idx" ON "orders"("driverId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_deletedAt_idx" ON "orders"("deletedAt");

-- CreateIndex
CREATE INDEX "orders_deliveryLocation_idx" ON "orders" USING GIST ("deliveryLocation");

-- CreateIndex
CREATE INDEX "order_status_events_orderId_createdAt_idx" ON "order_status_events"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_item_options_orderItemId_idx" ON "order_item_options"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_createdAt_idx" ON "drivers"("createdAt");

-- CreateIndex
CREATE INDEX "drivers_deletedAt_idx" ON "drivers"("deletedAt");

-- CreateIndex
CREATE INDEX "driver_shifts_driverId_idx" ON "driver_shifts"("driverId");

-- CreateIndex
CREATE INDEX "driver_shifts_zoneId_idx" ON "driver_shifts"("zoneId");

-- CreateIndex
CREATE INDEX "driver_shifts_driverId_status_idx" ON "driver_shifts"("driverId", "status");

-- CreateIndex
CREATE INDEX "driver_shifts_shiftDate_idx" ON "driver_shifts"("shiftDate");

-- CreateIndex
CREATE INDEX "driver_shifts_status_idx" ON "driver_shifts"("status");

-- CreateIndex
CREATE INDEX "driver_shifts_startingLocation_idx" ON "driver_shifts" USING GIST ("startingLocation");

-- CreateIndex
CREATE INDEX "driver_shifts_endingLocation_idx" ON "driver_shifts" USING GIST ("endingLocation");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_driverId_idx" ON "driver_wallet_transactions"("driverId");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_orderId_idx" ON "driver_wallet_transactions"("orderId");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_createdAt_idx" ON "driver_wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "driver_wallet_transactions_driverShiftId_idx" ON "driver_wallet_transactions"("driverShiftId");

-- CreateIndex
CREATE INDEX "driver_statistics_driverId_period_idx" ON "driver_statistics"("driverId", "period");

-- CreateIndex
CREATE INDEX "driver_statistics_startDate_endDate_idx" ON "driver_statistics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "driver_statistics_driverId_period_startDate_key" ON "driver_statistics"("driverId", "period", "startDate");

-- CreateIndex
CREATE INDEX "order_dispatches_orderId_idx" ON "order_dispatches"("orderId");

-- CreateIndex
CREATE INDEX "order_dispatches_driverId_idx" ON "order_dispatches"("driverId");

-- CreateIndex
CREATE INDEX "order_dispatches_driverShiftId_idx" ON "order_dispatches"("driverShiftId");

-- CreateIndex
CREATE INDEX "order_dispatches_status_idx" ON "order_dispatches"("status");

-- CreateIndex
CREATE INDEX "order_dispatches_createdAt_idx" ON "order_dispatches"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_vendorId_idx" ON "audit_logs"("vendorId");

-- CreateIndex
CREATE INDEX "audit_logs_actionType_idx" ON "audit_logs"("actionType");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_vendors" ADD CONSTRAINT "favorite_vendors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_vendors" ADD CONSTRAINT "favorite_vendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_products" ADD CONSTRAINT "favorite_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_verticalId_fkey" FOREIGN KEY ("verticalId") REFERENCES "vendor_verticals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_members" ADD CONSTRAINT "vendor_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_branches" ADD CONSTRAINT "vendor_branches_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_branches" ADD CONSTRAINT "vendor_branches_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_wallet_transactions" ADD CONSTRAINT "vendor_wallet_transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_wallet_transactions" ADD CONSTRAINT "vendor_wallet_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_statistics" ADD CONSTRAINT "vendor_statistics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item_options" ADD CONSTRAINT "cart_item_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_shifts" ADD CONSTRAINT "driver_shifts_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_shifts" ADD CONSTRAINT "driver_shifts_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_wallet_transactions" ADD CONSTRAINT "driver_wallet_transactions_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_statistics" ADD CONSTRAINT "driver_statistics_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dispatches" ADD CONSTRAINT "order_dispatches_driverShiftId_fkey" FOREIGN KEY ("driverShiftId") REFERENCES "driver_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
DECLARE
  next_val INT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING("ticketNumber" FROM 5) AS INTEGER)), 0
  ) + 1
  INTO next_val
  FROM support_tickets
  WHERE "ticketNumber" ~ '^TKT-[0-9]+$';
 
  EXECUTE format(
    'CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START %s',
    next_val
  );
END;
$$;

INSERT INTO "users" (
  "id",
  "email",
  "phone",
  "password",
  "name",
  "role",
  "language",
  "isEmailVerified",
  "isPhoneVerified",
  "isBanned",
  "permissions",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'superadmin@otlob.com',
  '+201000000000',
  '$2b$10$X7aBR3GKGOBXakRc3r5GH.DXaFSLh8B.RuUxCXhqkWQDh.rrXXEIy',
  'Super Administrator',
  'SUPER_ADMIN'::"Role",
  'EN'::"Language",
  true,
  true,
  false,
  ARRAY[]::"Permission"[],
  NOW()
)