-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `app_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `permission` (
	`permission` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	CONSTRAINT `permission_permission` PRIMARY KEY(`permission`)
);
--> statement-breakpoint
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
CREATE TABLE `role` (
	`role` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	CONSTRAINT `role_role` PRIMARY KEY(`role`)
);
--> statement-breakpoint
CREATE TABLE `role_permission` (
	`role` varchar(255) NOT NULL,
	`permission` varchar(255) NOT NULL,
	CONSTRAINT `role_permission_role_permission` PRIMARY KEY(`role`,`permission`)
);
--> statement-breakpoint
ALTER TABLE `app_user` ADD CONSTRAINT `users_role_roles_role_fk` FOREIGN KEY (`role`) REFERENCES `role`(`role`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_sessions` ADD CONSTRAINT `refresh_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permissions_permission_permissions_permission_fk` FOREIGN KEY (`permission`) REFERENCES `permission`(`permission`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permissions_role_roles_role_fk` FOREIGN KEY (`role`) REFERENCES `role`(`role`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `refresh_sessions_user_id_idx` ON `refresh_sessions` (`user_id`);
*/