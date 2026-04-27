CREATE TABLE `refresh_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_sessions_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `permission` (
	`key` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	CONSTRAINT `permission_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `role_permission` (
	`role_key` varchar(255) NOT NULL,
	`permission_key` varchar(255) NOT NULL,
	CONSTRAINT `role_permission_role_key_permission_key_pk` PRIMARY KEY(`role_key`,`permission_key`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`key` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	CONSTRAINT `roles_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `app_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_refiller` (
	`product` varchar(36) NOT NULL,
	`refiller` varchar(255) NOT NULL,
	CONSTRAINT `product_refiller_product_refiller_pk` PRIMARY KEY(`product`,`refiller`)
);
--> statement-breakpoint
CREATE TABLE `shelf` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shelf_id` PRIMARY KEY(`id`),
	CONSTRAINT `shelf_product_id_unique` UNIQUE(`product_id`)
);
--> statement-breakpoint
CREATE TABLE `store_room` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_room_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section` (
	`id` varchar(36) NOT NULL,
	`store_room_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `section_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section_product` (
	`id` varchar(36) NOT NULL,
	`section_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `section_product_id` PRIMARY KEY(`id`),
	CONSTRAINT `section_product_product_id_unique` UNIQUE(`product_id`)
);
--> statement-breakpoint
ALTER TABLE `refresh_sessions` ADD CONSTRAINT `refresh_sessions_user_id_app_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_role_key_roles_key_fk` FOREIGN KEY (`role_key`) REFERENCES `roles`(`key`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permission_key_permission_key_fk` FOREIGN KEY (`permission_key`) REFERENCES `permission`(`key`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_user` ADD CONSTRAINT `app_user_role_key_roles_key_fk` FOREIGN KEY (`role_key`) REFERENCES `roles`(`key`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_refiller` ADD CONSTRAINT `product_refiller_product_product_id_fk` FOREIGN KEY (`product`) REFERENCES `product`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_refiller` ADD CONSTRAINT `product_refiller_refiller_app_user_id_fk` FOREIGN KEY (`refiller`) REFERENCES `app_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shelf` ADD CONSTRAINT `shelf_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `section` ADD CONSTRAINT `section_store_room_id_store_room_id_fk` FOREIGN KEY (`store_room_id`) REFERENCES `store_room`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `section_product` ADD CONSTRAINT `section_product_section_id_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `section_product` ADD CONSTRAINT `section_product_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `refresh_sessions_user_id_idx` ON `refresh_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `shelf_product_id_idx` ON `shelf` (`product_id`);--> statement-breakpoint
CREATE INDEX `section_store_room_id_idx` ON `section` (`store_room_id`);--> statement-breakpoint
CREATE INDEX `section_product_section_id_idx` ON `section_product` (`section_id`);--> statement-breakpoint
CREATE INDEX `section_product_product_id_idx` ON `section_product` (`product_id`);