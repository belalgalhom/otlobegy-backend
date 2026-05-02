export const CommonErrors = {
  VALIDATION_ERROR: 'common.error.validation',
  SERVER_ERROR: 'common.error.server_error',
  UNKNOWN_ERROR: 'common.error.unknown',
  FORBIDDEN: 'common.error.forbidden',
  UNAUTHORIZED: 'common.error.unauthorized',
  TOO_MANY_REQUESTS: 'common.error.too_many_requests',
};

export const CommonSuccess = {
  OPERATION_SUCCESS: 'common.success.operation',
  RESOURCE_CREATED: 'common.success.resource_created',
  RESOURCE_UPDATED: 'common.success.resource_updated',
  RESOURCE_DELETED: 'common.success.resource_deleted',
};

export const AuthErrors = {
  USER_EXISTS: 'auth.error.user_exists',
  INVALID_CREDENTIALS: 'auth.error.invalid_credentials',
  UNVERIFIED: 'auth.error.unverified',
  BANNED: 'auth.error.banned',
  USER_NOT_FOUND: 'auth.error.user_not_found',
  OTP_INVALID: 'auth.error.otp_invalid',
  OTP_EXPIRED: 'auth.error.otp_expired',
  SESSION_EXPIRED: 'auth.error.session_expired',
};

export const UserErrors = {
  USER_NOT_FOUND: 'user.error.user_not_found',
  PROFILE_UPDATE_FAILED: 'user.error.profile_update_failed',
  AVATAR_UPLOAD_FAILED: 'user.error.avatar_upload_failed',
  INVALID_PASSWORD: 'user.error.invalid_password',
  PASSWORD_SAME_AS_OLD: 'user.error.password_same_as_old',
  NOTIFICATION_SETTINGS_NOT_FOUND: 'user.error.notification_settings_not_found',
  ACCOUNT_DELETION_FAILED: 'user.error.account_deletion_failed',
};

export const ChatErrors = {
  CONVERSATION_NOT_FOUND: 'chat.error.conversation_not_found',
  NOT_A_PARTICIPANT: 'chat.error.not_a_participant',
  CONVERSATION_CLOSED: 'chat.error.conversation_closed',
  CONVERSATION_NOT_OPEN: 'chat.error.conversation_not_open',
  MESSAGE_NOT_FOUND: 'chat.error.message_not_found',
  NOT_MESSAGE_SENDER: 'chat.error.not_message_sender',
  TEXT_REQUIRED: 'chat.error.text_required',
  MEDIA_URL_REQUIRED: 'chat.error.media_url_required',
  ORDER_NOT_FOUND: 'chat.error.order_not_found',
  VENDOR_NOT_FOUND: 'chat.error.vendor_not_found',
  NOT_SUPPORT_AGENT: 'chat.error.not_support_agent',
  INVALID_MESSAGE_ID: 'chat.error.invalid_message_id',
  NOT_AUTHORIZED: 'chat.error.not_authorized',
  CANNOT_SEND_SYSTEM_MESSAGE: 'chat.error.cannot_send_system_message',
  CANNOT_DELETE_SYSTEM_MESSAGE: 'chat.error.cannot_delete_system_message',
  LOCATION_REQUIRED: 'chat.error.location_required',
  REPLY_TO_NOT_FOUND: 'chat.error.reply_to_not_found',
  REPLY_TO_DELETED: 'chat.error.reply_to_deleted',
};

export const ChatMediaErrors = {
  UNSUPPORTED_TYPE: 'chat.media.error.unsupported_type',
  EXTENSION_MISMATCH: 'chat.media.error.extension_mismatch',
  FILE_TOO_LARGE: 'chat.media.error.file_too_large',
  NO_FILE: 'chat.media.error.no_file',
};

export const NotificationErrors = {
  NOT_FOUND: 'notification.error.not_found',
};

export const CustomerErrors = {
  CUSTOMER_NOT_FOUND: 'customer.error.not_found',
  ADDRESS_NOT_FOUND: 'customer.error.address_not_found',
  FAVORITE_VENDOR_NOT_FOUND: 'customer.error.favorite_vendor_not_found',
  FAVORITE_PRODUCT_NOT_FOUND: 'customer.error.favorite_product_not_found',
  CANNOT_ORDER: 'customer.error.cannot_order',
};

export const TicketErrors = {
  NOT_FOUND: 'ticket.error.not_found',
  CANNOT_CREATE: 'ticket.error.cannot_create',
  CANNOT_VIEW: 'ticket.error.cannot_view',
  CANNOT_UPDATE: 'ticket.error.cannot_update',
  CANNOT_DELETE: 'ticket.error.cannot_delete',
  ASSIGNEE_MUST_BE_ADMIN: 'ticket.error.assignee_must_be_admin',
  ORDER_NOT_FOUND: 'ticket.error.order_not_found',
  VENDOR_NOT_FOUND: 'ticket.error.vendor_not_found',
};

export const ZoneErrors = {
  NOT_FOUND: 'zone.error.not_found',
  INVALID_BOUNDARY: 'zone.error.invalid_boundary_polygon',
  OVERLAPPING_ZONE: 'zone.error.overlapping_zone',
};

export const VendorVerticalErrors = {
  NOT_FOUND: 'vendor_vertical.error.not_found',
  SLUG_TAKEN: 'vendor_vertical.error.slug_taken',
};

export const VendorErrors = {
  NOT_FOUND: 'vendor.error.not_found',
  SLUG_TAKEN: 'vendor.error.slug_taken',
  LOGO_UPLOAD_FAILED: 'vendor.error.logo_upload_failed',
};

export const VendorMemberErrors = {
  NOT_FOUND: 'vendor_member.error.not_found',
  ALREADY_MEMBER: 'vendor_member.error.already_member',
  USER_NOT_FOUND: 'vendor_member.error.user_not_found',
  CANNOT_REMOVE_SELF: 'vendor_member.error.cannot_remove_self',
  OWNER_REQUIRED: 'vendor_member.error.owner_required',
};

export const VendorBranchErrors = {
  NOT_FOUND: 'vendor_branch.error.not_found',
};

export const MenuCategoryErrors = {
  NOT_FOUND: 'menu_category.error.not_found',
  BELONGS_TO_OTHER_VENDOR: 'menu_category.error.belongs_to_other_vendor',
};

export const ProductErrors = {
  NOT_FOUND: 'product.error.not_found',
  VARIANT_NOT_FOUND: 'product.error.variant_not_found',
  OPTION_GROUP_NOT_FOUND: 'product.error.option_group_not_found',
  OPTION_NOT_FOUND: 'product.error.option_not_found',
  SKU_TAKEN: 'product.error.sku_taken',
  PRICE_REQUIRED: 'product.error.base_price_required_without_variants',
  CATEGORY_NOT_FOUND: 'product.error.category_not_found',
  IMAGE_UPLOAD_FAILED: 'product.error.image_upload_failed',
};
