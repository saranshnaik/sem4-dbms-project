CREATE DATABASE  IF NOT EXISTS `tutor_booking_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tutor_booking_system`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: tutor_booking_system
-- ------------------------------------------------------
-- Server version	8.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_requests`
--

DROP TABLE IF EXISTS `booking_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `tutor_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text,
  `date` datetime NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('pending','accepted','declined','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `booking_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_requests_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_requests`
--

LOCK TABLES `booking_requests` WRITE;
/*!40000 ALTER TABLE `booking_requests` DISABLE KEYS */;
INSERT INTO `booking_requests` VALUES (1,1,3,'Mathematics','Need help with calculus problems','2025-04-05 00:00:00','2025-04-05 10:00:00','2025-04-05 11:00:00','pending','2025-03-31 17:36:30'),(2,2,4,'Physics','Want to understand quantum mechanics basics','2025-04-06 00:00:00','2025-04-06 14:00:00','2025-04-06 15:30:00','accepted','2025-03-31 17:36:30'),(3,5,3,'Hindi','Require guidance for Hindi literature','2025-04-07 00:00:00','2025-04-07 16:00:00','2025-04-07 17:00:00','completed','2025-03-31 17:36:30'),(5,10,3,'Mathematics',NULL,'2025-04-11 00:00:00','2025-07-04 04:00:00','2025-07-04 04:00:00','pending','2025-04-05 18:00:48'),(6,10,15,'Hindi','Optional description','2025-04-22 00:00:00','2025-07-15 04:00:00','2025-07-15 04:00:00','accepted','2025-04-05 18:21:06'),(7,10,15,'Business Studies','test desc','2025-04-08 00:00:00','2025-04-08 10:00:00','2025-04-08 14:00:00','declined','2025-04-05 19:15:18'),(8,10,15,'Business Studies','test desc','2025-04-07 00:00:00','2025-04-07 10:00:00','2025-04-07 14:00:00','pending','2025-04-05 19:25:14');
/*!40000 ALTER TABLE `booking_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (4,'Biology'),(10,'Business Studies'),(3,'Chemistry'),(5,'Computer Science'),(9,'Economics'),(6,'English'),(8,'Geography'),(11,'Hindi'),(7,'History'),(1,'Mathematics'),(2,'Physics'),(13,'Political Science'),(12,'Sanskrit');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_profiles`
--

DROP TABLE IF EXISTS `tutor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bio` text NOT NULL,
  `hourly_rate` float NOT NULL,
  `years_of_experience` int DEFAULT NULL,
  `education` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tutor_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_profiles`
--

LOCK TABLES `tutor_profiles` WRITE;
/*!40000 ALTER TABLE `tutor_profiles` DISABLE KEYS */;
INSERT INTO `tutor_profiles` VALUES (1,3,'Experienced Mathematics tutor with 5 years of experience.',500,5,'M.Sc. in Mathematics'),(2,4,'Physics expert with a passion for teaching.',600,7,'Ph.D. in Physics'),(4,15,'test bio',100,4,'BTech in printing engineering');
/*!40000 ALTER TABLE `tutor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutor_subjects`
--

DROP TABLE IF EXISTS `tutor_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutor_subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tutor_profile_id` int NOT NULL,
  `subject_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tutor_profile_id` (`tutor_profile_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `tutor_subjects_ibfk_1` FOREIGN KEY (`tutor_profile_id`) REFERENCES `tutor_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tutor_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutor_subjects`
--

LOCK TABLES `tutor_subjects` WRITE;
/*!40000 ALTER TABLE `tutor_subjects` DISABLE KEYS */;
INSERT INTO `tutor_subjects` VALUES (1,1,1),(2,2,2),(3,1,3),(7,4,10),(8,4,11),(9,4,6);
/*!40000 ALTER TABLE `tutor_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `role` enum('student','tutor') NOT NULL,
  `avatar_url` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'rahul123','hashedpassword1','rahul.sharma@example.com','Rahul','Sharma','student',NULL),(2,'priya92','hashedpassword2','priya.agarwal@example.com','Priya','Agarwal','student',NULL),(3,'amit_tutor','hashedpassword3','amit.verma@example.com','Amit','Verma','tutor',NULL),(4,'neha_tutor','hashedpassword4','neha.kapoor@example.com','Neha','Kapoor','tutor',NULL),(5,'vishal_99','hashedpassword5','vishal.patel@example.com','Vishal','Patel','student',NULL),(10,'test','$2b$10$djRAPWhFRSnA8PvoFaKcj.2sxF63GNFZunhIFPeu/tCr17B2pMk7e','test@test.com','test','test','student',NULL),(15,'tutor','$2b$10$J7tF4xGYBrGdwVc.H4c.bONRNF53oymzc7fjgGFtgXhvw7D2ueqdu','tutor@test.com','tutor','test','tutor',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-06  1:18:08
