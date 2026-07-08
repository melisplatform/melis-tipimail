-- --------------------------------------------------------
-- MelisTipimail — API credentials storage
--
-- Single-row table holding the Tipimail REST API credentials
-- (X-Tipimail-ApiUser / X-Tipimail-ApiKey) used by the native
-- React tool (Dashboard KPIs + Message log). Entered via the
-- tool's "Connection" settings screen; never committed to git.
-- --------------------------------------------------------

DROP TABLE IF EXISTS `melis_tipimail_config`;
CREATE TABLE `melis_tipimail_config` (
  `tpc_id` int NOT NULL AUTO_INCREMENT,
  `tpc_api_user` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tpc_api_key` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`tpc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
