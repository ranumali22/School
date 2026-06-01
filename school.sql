-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 01, 2026 at 01:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `status` varchar(20) DEFAULT 'Active',
  `delete_status` varchar(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `school_id`, `title`, `banner_image`, `display_order`, `status`, `delete_status`, `created_at`) VALUES
(1, 1, 'Sports Activity', '1778307520828-213890097.png', 5, 'Active', 'show', '2026-05-09 06:18:40');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `category` varchar(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `category`, `delete_status`, `display_order`, `created_at`, `updated_at`, `school_id`, `status`) VALUES
(1, 'OBC', 'show', 1, '2026-05-08 05:12:24', '2026-05-08 05:12:24', 1, 'Active'),
(2, 'SC', 'show', 2, '2026-05-08 05:12:32', '2026-05-08 05:12:32', 1, 'Active'),
(3, 'ST', 'show', 3, '2026-05-08 05:12:39', '2026-05-08 05:12:39', 1, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `class`
--

CREATE TABLE `class` (
  `id` int(11) NOT NULL,
  `class_name` char(20) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class`
--

INSERT INTO `class` (`id`, `class_name`, `display_order`, `delete_status`, `status`, `create_at`, `update_at`, `school_id`) VALUES
(1, '1st', 1, 'show', 'Active', '2026-05-08 05:13:51', '2026-05-08 05:13:51', 1),
(2, '2nd', 2, 'show', 'Active', '2026-05-08 05:13:58', '2026-05-08 05:13:58', 1),
(3, '3rd', 3, 'show', 'Active', '2026-05-08 05:14:04', '2026-05-08 05:14:04', 1),
(4, '4th', 4, 'show', 'Active', '2026-05-08 05:14:12', '2026-05-08 05:14:12', 1);

-- --------------------------------------------------------

--
-- Table structure for table `classfee`
--

CREATE TABLE `classfee` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `feehead_id` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delete_status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classfee`
--

INSERT INTO `classfee` (`id`, `class_id`, `feehead_id`, `date`, `display_order`, `session_id`, `school_id`, `amount`, `status`, `created_at`, `updated_at`, `delete_status`) VALUES
(1, 1, 1, '2026-05-08', 1, 2, 1, 1000, 'Active', '2026-05-08 06:06:40', '2026-05-08 06:06:40', 'show'),
(2, 1, 2, '2026-05-07', 2, 2, 1, 1000, 'Active', '2026-05-08 06:06:58', '2026-05-08 06:06:58', 'show'),
(3, 1, 3, '2026-05-09', 3, 2, 1, 1000, 'Active', '2026-05-08 06:07:13', '2026-05-08 06:07:13', 'show'),
(4, 1, 1, '2026-05-08', 1, 1, 1, 1000, 'Active', '2026-05-08 08:05:10', '2026-05-08 08:05:10', 'show'),
(5, 1, 2, '2026-05-07', 2, 1, 1, 1000, 'Active', '2026-05-08 08:05:29', '2026-05-08 08:05:29', 'show'),
(6, 1, 3, '2026-05-09', 3, 1, 1, 1000, 'Active', '2026-05-08 08:05:41', '2026-05-08 08:05:41', 'show'),
(7, 2, 1, '2026-05-08', 2, 1, 1, 3000, 'Active', '2026-05-19 11:00:38', '2026-05-19 11:00:38', 'show'),
(8, 3, 1, '2026-05-08', 3, 1, 1, 3000, 'Active', '2026-05-19 11:01:44', '2026-05-19 11:01:44', 'show'),
(9, 4, 1, '2026-05-08', 4, 1, 1, 3000, 'Active', '2026-05-19 11:02:50', '2026-05-19 11:02:50', 'show');

-- --------------------------------------------------------

--
-- Table structure for table `class_detail`
--

CREATE TABLE `class_detail` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `room_number` char(30) DEFAULT NULL,
  `teacher_id` varchar(5) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_detail`
--

INSERT INTO `class_detail` (`id`, `class_id`, `room_number`, `teacher_id`, `display_order`, `delete_status`, `status`, `create_at`, `update_at`, `school_id`) VALUES
(1, 1, '0001', '1', 1, 'show', 'Active', '2026-05-08 05:37:28', '2026-05-08 05:37:28', 1),
(2, 2, '0001', '1', 2, 'show', 'Active', '2026-05-08 05:37:56', '2026-05-08 05:37:56', 1);

-- --------------------------------------------------------

--
-- Table structure for table `class_section`
--

CREATE TABLE `class_section` (
  `id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `section` char(3) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_section`
--

INSERT INTO `class_section` (`id`, `class_id`, `section`, `display_order`, `delete_status`, `status`, `create_at`, `update_at`, `school_id`) VALUES
(1, 1, 'A', 1, 'show', 'Active', '2026-05-08 05:14:27', '2026-05-08 05:14:27', 1),
(2, 2, 'A', 2, 'show', 'Active', '2026-05-08 05:14:39', '2026-05-08 05:14:39', 1),
(3, 3, 'A', 3, 'show', 'Active', '2026-05-08 05:14:47', '2026-05-08 05:14:47', 1),
(4, 4, 'A', 4, 'show', 'Active', '2026-05-08 05:14:55', '2026-05-08 05:14:55', 1),
(5, 4, 'b', 5, 'show', 'Active', '2026-05-19 09:07:56', '2026-05-19 09:07:56', 1),
(6, 4, 'c', 6, 'show', 'Active', '2026-05-19 09:10:30', '2026-05-19 09:10:30', 1);

-- --------------------------------------------------------

--
-- Table structure for table `class_test`
--

CREATE TABLE `class_test` (
  `id` int(11) NOT NULL,
  `test_name` varchar(50) NOT NULL,
  `test_type` varchar(50) NOT NULL DEFAULT 'class test',
  `display_order` int(11) DEFAULT 0,
  `session_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `test_date` date NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_test`
--

INSERT INTO `class_test` (`id`, `test_name`, `test_type`, `display_order`, `session_id`, `school_id`, `test_date`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'may 1st test', 'class test', 1, 1, 1, '2026-04-01', 'Active', 'show', '2026-05-28 08:21:30', '2026-05-28 10:06:09', NULL),
(2, 'may 2nd test', 'class test', 2, 1, 1, '2026-04-15', 'Inactive', 'show', '2026-05-28 08:24:53', '2026-05-28 10:36:41', NULL),
(3, 'may 3rd test', 'class test', 3, 1, 1, '2026-05-18', 'Inactive', 'show', '2026-05-28 08:25:02', '2026-05-28 10:36:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `department_name` char(20) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`id`, `department_name`, `display_order`, `delete_status`, `status`, `create_at`, `update_at`, `school_id`) VALUES
(1, 'HR', 1, 'show', 'Active', '2026-05-08 05:13:29', '2026-05-08 05:13:29', 1),
(2, 'Driver', 2, 'show', 'Active', '2026-05-08 05:13:38', '2026-05-08 05:13:38', 1);

-- --------------------------------------------------------

--
-- Table structure for table `division`
--

CREATE TABLE `division` (
  `id` int(11) NOT NULL,
  `division` varchar(20) NOT NULL,
  `from_percent` int(11) NOT NULL,
  `to_percent` int(11) NOT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `school_id` int(11) NOT NULL,
  `status` varchar(10) DEFAULT 'Active',
  `delete_status` varchar(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `division`
--

INSERT INTO `division` (`id`, `division`, `from_percent`, `to_percent`, `remark`, `display_order`, `school_id`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '1st', 60, 100, 'EXCELLENT', 1, 1, 'Active', 'show', '2026-05-08 05:42:54', '2026-05-08 05:42:54', NULL),
(2, '2nd', 45, 60, 'GOOD', 2, 1, 'Active', 'show', '2026-05-08 05:43:12', '2026-05-08 05:43:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(11) NOT NULL,
  `employeePhoto` varchar(255) DEFAULT NULL,
  `employeeFullName` varchar(150) NOT NULL,
  `fatherName` varchar(150) DEFAULT NULL,
  `motherName` varchar(150) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `mobileNumber` varchar(20) DEFAULT NULL,
  `alternateNumber` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `maritalStatus` varchar(50) DEFAULT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `reference` varchar(150) DEFAULT NULL,
  `currentAddress` text DEFAULT NULL,
  `currentCity` varchar(100) DEFAULT NULL,
  `currentState` varchar(100) DEFAULT NULL,
  `currentPincode` varchar(10) DEFAULT NULL,
  `permanentAddress` text DEFAULT NULL,
  `permanentCity` varchar(100) DEFAULT NULL,
  `permanentState` varchar(100) DEFAULT NULL,
  `permanentPincode` varchar(10) DEFAULT NULL,
  `bankName` varchar(150) DEFAULT NULL,
  `accountNumber` varchar(50) DEFAULT NULL,
  `ifscCode` varchar(20) DEFAULT NULL,
  `bankPassbookOrCheckbookPhoto` varchar(255) DEFAULT NULL,
  `addressProofPhoto` varchar(255) DEFAULT NULL,
  `idProofPhoto` varchar(255) DEFAULT NULL,
  `idProofType` varchar(100) DEFAULT NULL,
  `idProofNumber` varchar(100) DEFAULT NULL,
  `addressProofType` varchar(100) DEFAULT NULL,
  `addressProof` varchar(255) DEFAULT NULL,
  `joinDate` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `Times` varchar(50) DEFAULT NULL,
  `Hours` varchar(50) DEFAULT NULL,
  `paidLeave` int(11) DEFAULT NULL,
  `starttime` time DEFAULT NULL,
  `endtime` time DEFAULT NULL,
  `breaktime` time DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `loginId` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `employee_d` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `employee_id` int(11) DEFAULT NULL,
  `stu_prefix` char(10) DEFAULT NULL,
  `status` char(10) DEFAULT 'active',
  `fcm_token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `employeePhoto`, `employeeFullName`, `fatherName`, `motherName`, `dob`, `gender`, `email`, `mobileNumber`, `alternateNumber`, `department`, `maritalStatus`, `qualification`, `experience`, `reference`, `currentAddress`, `currentCity`, `currentState`, `currentPincode`, `permanentAddress`, `permanentCity`, `permanentState`, `permanentPincode`, `bankName`, `accountNumber`, `ifscCode`, `bankPassbookOrCheckbookPhoto`, `addressProofPhoto`, `idProofPhoto`, `idProofType`, `idProofNumber`, `addressProofType`, `addressProof`, `joinDate`, `salary`, `Times`, `Hours`, `paidLeave`, `starttime`, `endtime`, `breaktime`, `religion`, `category`, `nationality`, `loginId`, `password`, `created_at`, `updated_at`, `session_id`, `school_id`, `employee_d`, `delete_status`, `employee_id`, `stu_prefix`, `status`, `fcm_token`) VALUES
(1, '1778218438341-535936328.jpg', 'demo staff', 'demo father', 'demo mother', '2026-05-07', '2', 'demostaff@gmail.com', '1234567890', '1234567890', '1', 'Married', 'Btech', '4', 'refrence', 'kardhani', 'Jaipur', 'Rajasthan', '302012', 'kardhani', 'Jaipur', 'Rajasthan', '302012', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', '1', '1', '1000001', '07052026', '2026-05-08 05:33:58', '2026-05-29 08:14:00', 2, 1, NULL, 'show', 1000001, 'demo', 'active', 'd4xWWb95vG5qpeK7yrqf43:APA91bGoLqt25c7r_IJEmWQAl8OOKsbbUmRdYTgi9FheG05r1elosWtw1P0qg0OmMhptrO4fHaDTOe-P7xMjHqlMQd9TJIIm3i8HyrRPulloXWE5KN0otNE');

-- --------------------------------------------------------

--
-- Table structure for table `exam_timetable`
--

CREATE TABLE `exam_timetable` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `exam_date` date DEFAULT NULL,
  `start_time` varchar(20) DEFAULT NULL,
  `end_time` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_timetable`
--

INSERT INTO `exam_timetable` (`id`, `school_id`, `session_id`, `class_id`, `exam_id`, `subject_id`, `exam_date`, `start_time`, `end_time`, `status`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 1, 1, 3, '2026-05-09', '00:58', '02:58', 'Active', '2026-05-08 06:29:22', '2026-05-08 06:29:22'),
(3, 1, 2, 1, 1, 2, '2026-05-13', '03:59', '04:59', 'Active', '2026-05-08 06:29:22', '2026-05-08 06:29:22');

-- --------------------------------------------------------

--
-- Table structure for table `feefrequency`
--

CREATE TABLE `feefrequency` (
  `id` int(11) NOT NULL,
  `feefrequency` char(20) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feehead`
--

CREATE TABLE `feehead` (
  `id` int(11) NOT NULL,
  `feehead` varchar(150) NOT NULL,
  `feehead_date` date DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delete_status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feehead`
--

INSERT INTO `feehead` (`id`, `feehead`, `feehead_date`, `display_order`, `school_id`, `status`, `created_at`, `updated_at`, `delete_status`) VALUES
(1, 'tuition fee', '2026-05-08', 1, 1, 'Active', '2026-05-08 06:05:52', '2026-05-08 06:05:52', 'show'),
(2, 'exam fee', '2026-05-07', 2, 1, 'Active', '2026-05-08 06:06:03', '2026-05-08 06:06:03', 'show'),
(3, 'practical exam fee', '2026-05-09', 3, 1, 'Active', '2026-05-08 06:06:15', '2026-05-08 06:06:15', 'show');

-- --------------------------------------------------------

--
-- Table structure for table `gender`
--

CREATE TABLE `gender` (
  `id` int(11) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gender`
--

INSERT INTO `gender` (`id`, `gender`, `delete_status`, `display_order`, `created_at`, `updated_at`, `school_id`, `status`) VALUES
(1, 'Female', 'show', 1, '2026-05-08 05:11:52', '2026-05-08 05:11:52', 1, 'Active'),
(2, 'Male', 'show', 2, '2026-05-08 05:12:01', '2026-05-08 05:12:01', 1, 'Active'),
(3, 'Other', 'show', 3, '2026-05-08 05:12:08', '2026-05-08 05:12:08', 1, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `grade`
--

CREATE TABLE `grade` (
  `id` int(11) NOT NULL,
  `grade_name` varchar(20) NOT NULL,
  `from_percent` int(11) NOT NULL,
  `to_percent` int(11) NOT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `school_id` int(11) NOT NULL,
  `status` varchar(10) DEFAULT 'Active',
  `delete_status` varchar(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grade`
--

INSERT INTO `grade` (`id`, `grade_name`, `from_percent`, `to_percent`, `remark`, `display_order`, `school_id`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'A', 90, 95, 'VERY GOOD', 1, 1, 'Active', 'show', '2026-05-08 05:42:00', '2026-05-08 05:42:00', NULL),
(2, 'A++', 95, 100, 'EXCELLENT', 2, 1, 'Active', 'show', '2026-05-08 05:42:29', '2026-05-08 05:42:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `holiday_master`
--

CREATE TABLE `holiday_master` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `holiday_name` varchar(255) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `remark` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','delete') DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holiday_master`
--

INSERT INTO `holiday_master` (`id`, `school_id`, `session_id`, `holiday_name`, `from_date`, `to_date`, `remark`, `display_order`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 2, 'Christmas', '2026-05-07', '2026-05-11', '', 1, 'Active', 'show', '2026-05-08 05:45:30', '2026-05-08 05:45:30', NULL),
(2, 1, 2, 'holi', '2026-05-19', '2026-05-21', '', 2, 'Active', 'show', '2026-05-08 05:45:54', '2026-05-08 05:45:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `main_exam`
--

CREATE TABLE `main_exam` (
  `id` int(11) NOT NULL,
  `exam_name` varchar(50) NOT NULL,
  `exam_type` varchar(50) NOT NULL DEFAULT 'main exam',
  `display_order` int(11) DEFAULT 0,
  `session_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `exam_date` date NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_exam`
--

INSERT INTO `main_exam` (`id`, `exam_name`, `exam_type`, `display_order`, `session_id`, `school_id`, `exam_date`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'half yearly', 'main exam', 1, 2, 1, '2026-05-08', 'Active', 'show', '2026-05-08 05:44:48', '2026-05-08 05:44:48', NULL),
(2, 'yearly', 'main exam', 2, 2, 1, '2026-05-09', 'Active', 'show', '2026-05-08 05:45:01', '2026-05-08 05:45:01', NULL),
(3, 'yearly', 'main exam', 1, 1, 1, '2026-05-01', 'Active', 'show', '2026-05-28 11:26:26', '2026-05-28 11:26:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medium`
--

CREATE TABLE `medium` (
  `id` int(11) NOT NULL,
  `medium` varchar(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medium`
--

INSERT INTO `medium` (`id`, `medium`, `delete_status`, `display_order`, `created_at`, `updated_at`, `school_id`, `status`) VALUES
(1, 'Hindi', 'show', 1, '2026-05-08 05:11:32', '2026-05-08 05:11:32', 1, 'Active'),
(2, 'English', 'show', 2, '2026-05-08 05:11:38', '2026-05-08 05:11:38', 1, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `nationality`
--

CREATE TABLE `nationality` (
  `id` int(11) NOT NULL,
  `nationality` varchar(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nationality`
--

INSERT INTO `nationality` (`id`, `nationality`, `delete_status`, `display_order`, `created_at`, `updated_at`, `school_id`, `status`) VALUES
(1, 'indian', 'show', 1, '2026-05-08 05:13:13', '2026-05-08 05:13:13', 1, 'Active'),
(2, 'UK', 'show', 2, '2026-05-08 05:13:21', '2026-05-08 05:13:21', 1, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `Send_to` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message_type` varchar(50) DEFAULT 'general',
  `class_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `Schedule_date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `messages` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `delete_status` varchar(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` varchar(10) DEFAULT 'active',
  `notification_status` varchar(20) DEFAULT 'Draft',
  `read_status` varchar(20) DEFAULT 'unread',
  `student_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `school_id`, `session_id`, `Send_to`, `title`, `message_type`, `class_id`, `department_id`, `date`, `Schedule_date`, `time`, `messages`, `display_order`, `delete_status`, `created_at`, `updated_at`, `status`, `notification_status`, `read_status`, `student_id`) VALUES
(9, 1, 2, 'Student', 'notification demo', 'general', 1, NULL, '2026-05-18', '2026-05-11', '20:50:00', 'notification demo', 1, 'show', '2026-05-08 09:20:18', '2026-05-18 08:31:32', 'Active', 'Sent', 'read', NULL),
(10, 1, 2, 'All', 'demooooooooo', 'general', NULL, NULL, '2026-05-18', '2026-05-14', '12:22:00', 'demooooooooo', 1, 'show', '2026-05-09 05:51:43', '2026-05-18 08:31:43', 'Active', 'Sent', 'read', NULL),
(11, 1, 2, 'All', 'Title of notify', 'general', NULL, NULL, '2026-05-18', '2026-05-20', '15:02:00', 'Title of notify', 1, 'show', '2026-05-18 08:32:23', '2026-05-18 08:37:41', 'Active', 'Sent', 'read', NULL),
(12, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 09:53:57', '2026-05-19 09:53:57', 'Draft', 'Draft', 'unread', 21),
(13, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 09:56:32', '2026-05-19 09:56:32', 'Draft', 'Draft', 'unread', 21),
(14, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 10:31:29', '2026-05-19 10:31:29', 'Draft', 'Draft', 'unread', 21),
(15, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 11:06:04', '2026-05-19 11:06:04', 'Draft', 'Draft', 'unread', 22),
(16, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 11:06:46', '2026-05-19 11:06:46', 'Draft', 'Draft', 'unread', 23),
(17, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-19', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-19 11:07:21', '2026-05-19 11:07:21', 'Draft', 'Draft', 'unread', 24),
(18, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-29', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-29 08:38:24', '2026-05-29 08:38:24', 'Draft', 'Draft', 'unread', 21),
(19, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-29', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-29 09:32:23', '2026-05-29 09:32:23', 'Draft', 'Draft', 'unread', 22),
(20, 1, 1, 'Single', 'Fee Submitted 💰', 'general', NULL, NULL, '2026-05-29', NULL, NULL, 'Your fee has been successfully deposited', 0, 'show', '2026-05-29 09:33:01', '2026-05-29 09:33:01', 'Draft', 'Draft', 'unread', 21);

-- --------------------------------------------------------

--
-- Table structure for table `period`
--

CREATE TABLE `period` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `period` varchar(255) NOT NULL,
  `start_time` varchar(10) DEFAULT NULL,
  `end_time` varchar(10) DEFAULT NULL,
  `display_order` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `period`
--

INSERT INTO `period` (`id`, `school_id`, `period`, `start_time`, `end_time`, `display_order`, `status`, `delete_status`, `created_date`, `updated_date`) VALUES
(1, 1, '1st period', '08:30', '09:30', 1, 'Active', 'show', '2026-05-08 05:53:46', '2026-05-08 05:53:46'),
(2, 1, '2nd period', '09:30', '10:30', 2, 'Active', 'show', '2026-05-08 05:54:14', '2026-05-08 05:54:14'),
(3, 1, '3rd period', '', '', 3, 'Active', 'show', '2026-05-08 05:55:03', '2026-05-08 05:55:03');

-- --------------------------------------------------------

--
-- Table structure for table `religion`
--

CREATE TABLE `religion` (
  `id` int(11) NOT NULL,
  `religion` varchar(10) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `status` char(10) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `religion`
--

INSERT INTO `religion` (`id`, `religion`, `delete_status`, `display_order`, `created_at`, `updated_at`, `school_id`, `status`) VALUES
(1, 'hindu', 'show', 1, '2026-05-08 05:12:48', '2026-05-08 05:12:48', 1, 'Active'),
(2, 'mushlim', 'show', 2, '2026-05-08 05:12:56', '2026-05-08 05:12:56', 1, 'Active'),
(3, 'ishai', 'show', 3, '2026-05-08 05:13:05', '2026-05-08 05:13:05', 1, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `school_account`
--

CREATE TABLE `school_account` (
  `id` int(11) NOT NULL,
  `school_prefix` char(10) DEFAULT NULL,
  `school_name` char(255) DEFAULT NULL,
  `registration_no` char(30) DEFAULT NULL,
  `affiliation_no` char(30) DEFAULT NULL,
  `affiliated` char(50) DEFAULT NULL,
  `phone` char(55) DEFAULT NULL,
  `mobile_no` char(55) DEFAULT NULL,
  `helpLine_no` char(55) DEFAULT NULL,
  `established_from` char(10) DEFAULT NULL,
  `address` char(200) DEFAULT NULL,
  `username` char(20) DEFAULT NULL,
  `password` char(10) DEFAULT NULL,
  `upload_logo` text DEFAULT NULL,
  `delete_status` char(7) DEFAULT 'show',
  `create_at` datetime DEFAULT current_timestamp(),
  `update_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email` char(100) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `session_create_status` char(5) DEFAULT 'NO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_account`
--

INSERT INTO `school_account` (`id`, `school_prefix`, `school_name`, `registration_no`, `affiliation_no`, `affiliated`, `phone`, `mobile_no`, `helpLine_no`, `established_from`, `address`, `username`, `password`, `upload_logo`, `delete_status`, `create_at`, `update_at`, `email`, `school_id`, `session_create_status`) VALUES
(1, 'demo', 'demo senior sec. school', '20001', '20001', 'CBSE', '1234567890', '1234567890', '1234567890', '2026-05-07', 'Uattam Nagar', 'demo', '123456', 'school_logos/demo_senior_sec__school/1778224792827-27150878.jpeg', 'show', '2026-05-08 05:06:53', '2026-05-08 07:19:52', 'demo@gmail.com', NULL, 'yes');

-- --------------------------------------------------------

--
-- Table structure for table `school_homework`
--

CREATE TABLE `school_homework` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `delete_status` varchar(50) DEFAULT 'show'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_session`
--

CREATE TABLE `school_session` (
  `id` int(11) NOT NULL,
  `session_name` char(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `session_status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_session`
--

INSERT INTO `school_session` (`id`, `session_name`, `start_date`, `end_date`, `display_order`, `delete_status`, `session_status`, `create_at`, `update_at`, `school_id`) VALUES
(1, '2025-26', '2025-04-01', '2026-03-31', 1, 'show', 'Active', '2026-05-08 05:09:21', '2026-05-08 05:09:21', 1),
(2, '2026-27', '2024-04-01', '2025-03-31', 2, 'show', 'Active', '2026-05-08 05:10:20', '2026-05-19 08:49:39', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sms_template`
--

CREATE TABLE `sms_template` (
  `id` int(11) NOT NULL,
  `school_id` char(20) DEFAULT NULL,
  `otp` char(8) DEFAULT '000000',
  `sms_username` char(255) DEFAULT NULL,
  `sms_api_key` char(255) DEFAULT NULL,
  `sms_sender_id` char(255) DEFAULT NULL,
  `route` char(10) DEFAULT NULL,
  `sms_message` text DEFAULT NULL,
  `sms_template_id` char(255) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `status` char(10) DEFAULT 'show',
  `delete_status` char(10) DEFAULT 'show',
  `create_at` datetime DEFAULT current_timestamp(),
  `update_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_period_allot`
--

CREATE TABLE `staff_period_allot` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `room_no` varchar(100) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `created_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `studentName` varchar(100) NOT NULL,
  `fatherName` varchar(100) DEFAULT NULL,
  `motherName` varchar(100) DEFAULT NULL,
  `primaryNo` varchar(255) DEFAULT NULL,
  `secondaryNo` varchar(255) DEFAULT NULL,
  `medium` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `currentAddress` text DEFAULT NULL,
  `currentCity` varchar(50) DEFAULT NULL,
  `currentState` varchar(50) DEFAULT NULL,
  `currentPinCode` varchar(10) DEFAULT NULL,
  `permanentAddress` text DEFAULT NULL,
  `permanentCity` varchar(50) DEFAULT NULL,
  `permanentState` varchar(50) DEFAULT NULL,
  `permanentPinCode` varchar(10) DEFAULT NULL,
  `registerNo` varchar(50) DEFAULT NULL,
  `registrationEnrollNo` varchar(50) DEFAULT NULL,
  `registerAdmissionDate` date DEFAULT NULL,
  `registerClass` varchar(50) DEFAULT NULL,
  `previousSchoolName` varchar(150) DEFAULT NULL,
  `previousSrNo` varchar(50) DEFAULT NULL,
  `previousClass` varchar(50) DEFAULT NULL,
  `busRoute` varchar(100) DEFAULT NULL,
  `busStand` varchar(100) DEFAULT NULL,
  `busFare` decimal(10,2) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL,
  `student_ids` int(11) DEFAULT NULL,
  `session_id` char(20) DEFAULT NULL,
  `stu_prefix` char(10) DEFAULT NULL,
  `rte` char(5) DEFAULT 'No',
  `loginid` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `bloodgroup` varchar(10) DEFAULT NULL,
  `fcm_token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `studentName`, `fatherName`, `motherName`, `primaryNo`, `secondaryNo`, `medium`, `email`, `dob`, `gender`, `category`, `photo`, `religion`, `nationality`, `currentAddress`, `currentCity`, `currentState`, `currentPinCode`, `permanentAddress`, `permanentCity`, `permanentState`, `permanentPinCode`, `registerNo`, `registrationEnrollNo`, `registerAdmissionDate`, `registerClass`, `previousSchoolName`, `previousSrNo`, `previousClass`, `busRoute`, `busStand`, `busFare`, `delete_status`, `status`, `createdAt`, `updatedAt`, `school_id`, `student_ids`, `session_id`, `stu_prefix`, `rte`, `loginid`, `password`, `bloodgroup`, `fcm_token`) VALUES
(1, 'demo student', 'demo father', 'demo mother', '1234567890', '1234567890', 'Hindi', 'demostudent@gmail.com', '2026-05-07', 'Female', 'OBC', '1778224656801-739216055.jpg', 'hindu', 'indian', 'Uattam Nagar', 'Bhilwara', 'Rajasthan', '311404', 'Uattam Nagar', 'Bhilwara', 'Rajasthan', '311404', '123456', '123456', '2026-05-08', '1', 'Bright Future School', '123456', '8', 'jaipur junction', '', 0.00, 'show', 'active', '2026-05-08 06:10:21', '2026-05-09 08:22:52', 1, 1000001, '2', 'demo', 'Yes', 'demo1000001', '07052026', 'A+', 'd4xWWb95vG5qpeK7yrqf43:APA91bGoLqt25c7r_IJEmWQAl8OOKsbbUmRdYTgi9FheG05r1elosWtw1P0qg0OmMhptrO4fHaDTOe-P7xMjHqlMQd9TJIIm3i8HyrRPulloXWE5KN0otNE'),
(2, 'demo student1', 'demo father1', 'demo mother1', '1234567890', '1234567890', 'Hindi', 'demostudent@gmail.com', '2026-05-07', 'Female', 'OBC', '1778226784142-635370862.png', 'hindu', 'indian', 'Uattam Nagar', 'Bhilwara', 'Rajasthan', '311404', 'Uattam Nagar', 'Bhilwara', 'Rajasthan', '311404', '123456', '123456', '2026-05-08', '1', 'Bright Future School', '123456', '8', 'jaipur junction', 'jaipur junction', 12.00, 'show', 'active', '2026-05-08 07:53:04', '2026-05-08 07:53:04', 1, 1000002, '2', 'demo', 'Yes', 'demo1000002', '07052026', 'A+', NULL),
(3, 'Aarav Sharma', 'Rajesh Sharma', 'Sunita Sharma', '9876543210', '9123456780', 'English', NULL, '0000-00-00', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 13:29:51', 1, 1000003, '2', 'demo', 'Yes', 'demo1000003', '01011970', 'A+', 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(4, 'Vivaan Singh', 'Amit Singh', 'Pooja Singh', '9876543211', '9123456781', 'English', NULL, '0000-00-00', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302013', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302013', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000004, '2', 'demo', 'No', 'demo1000004', '01011970', 'B+', NULL),
(5, 'Aditya Verma', 'Suresh Verma', 'Neha Verma', '9876543212', '9123456782', 'English', NULL, '0000-00-00', 'Other', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302014', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302014', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000005, '2', 'demo', 'Yes', 'demo1000005', '01011970', 'O+', NULL),
(6, 'Reyansh Gupta', 'Manoj Gupta', 'Kavita Gupta', '9876543213', '9123456783', 'English', NULL, '2004-09-27', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302015', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302015', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000006, '2', 'demo', 'Yes', 'demo1000006', '01011970', 'AB+', NULL),
(7, 'Krish Patel', 'Rakesh Patel', 'Meena Patel', '9876543214', '9123456784', 'English', NULL, '2004-08-16', 'male', 'OBC', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302016', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302016', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000007, '2', 'demo', 'No', 'demo1000007', '01011970', 'A-', NULL),
(8, 'Ananya Mishra', 'Deepak Mishra', 'Shalini Mishra', '9876543215', '9123456785', 'English', NULL, '2004-03-12', 'female', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302017', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302017', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000008, '2', 'demo', 'No', 'demo1000008', '01011970', 'B-', NULL),
(9, 'Diya Kapoor', 'Vikram Kapoor', 'Priya Kapoor', '9876543216', '9123456786', 'English', NULL, '0000-00-00', 'female', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302018', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302018', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000009, '2', 'demo', 'No', 'demo1000009', '01011970', 'O-', NULL),
(10, 'Siya Yadav', 'Sanjay Yadav', 'Rekha Yadav', '9876543217', '9123456787', 'English', NULL, '0000-00-00', 'female', 'OBC', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302019', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302019', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000010, '2', 'demo', 'Yes', 'demo1000010', '01011970', 'AB-', NULL),
(11, 'Kavya Joshi', 'Mahesh Joshi', 'Anjali Joshi', '9876543218', '9123456788', 'English', NULL, '0000-00-00', 'female', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302020', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302020', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000011, '2', 'demo', 'Yes', 'demo1000011', '01011970', 'A+', NULL),
(12, 'Riya Mehta', 'Kunal Mehta', 'Sangeeta Mehta', '9876543219', '9123456789', 'English', NULL, '2004-12-10', 'female', 'OBC', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302021', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302021', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000012, '2', 'demo', 'No', 'demo1000012', '01011970', 'O+', NULL),
(13, 'Willmsss', '', '', '', '', '', '', NULL, '', '', NULL, '', '', '', '', '', '', '', '', '', '', '', '', NULL, '2', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-11 05:54:32', '2026-05-11 05:54:32', 1, 1000013, '2', 'demo', 'No', 'demo1000013', NULL, '', NULL),
(14, 'Riya Mehta', 'Kunal Mehta', 'Sangeeta Mehta', '9876543219', '9123456789', 'English', NULL, '2004-12-10', 'female', 'OBC', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302021', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302021', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 05:53:52', '2026-05-11 05:53:52', 1, 1000012, '1', 'demo', 'No', 'demo1000012', '01011970', 'O+', NULL),
(15, 'Annu soni', 'Rajesh Sharma', 'Sunita Sharma', '9876543210', '9123456780', 'English', NULL, '2010-03-11', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 06:27:37', '2026-05-11 06:27:37', 1, 1000014, '2', 'demo', 'Yes', 'demo1000014', '11032010', 'A+', NULL),
(16, 'Annu soni', 'Rajesh Sharma', 'Sunita Sharma', '9876556218', '9123453589', 'English', NULL, '2010-03-11', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 06:28:36', '2026-05-11 06:28:36', 1, 1000015, '2', 'demo', 'Yes', 'demo1000015', '11032010', 'A+', NULL),
(17, 'Annu soni', 'Rajesh Sharma', 'Sunita Sharma', '6375789370', '6375789370', 'English', NULL, '2010-03-11', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 06:29:25', '2026-05-11 06:29:25', 1, 1000016, '2', 'demo', 'Yes', 'demo1000016', '11032010', 'A+', NULL),
(18, 'Annu soni', 'Rajesh Sharma', 'Sunita Sharma', '6564614112', '9949642316', 'English', NULL, '2010-03-11', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 06:30:23', '2026-05-11 06:30:23', 1, 1000017, '2', 'demo', 'Yes', 'demo1000017', '11032010', 'A+', NULL),
(19, 'Annu soni', 'Rajesh Sharma', 'Sunita Sharma', '6564614112', '9949642316', 'English', NULL, '2010-03-11', 'male', 'General', NULL, 'HINDU', 'indian', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '302012', 'kardhani,jaipur,302012', 'jaipur', 'Rajasthan', '', NULL, NULL, NULL, '3', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-11 06:30:55', '2026-05-11 06:30:55', 1, 1000018, '2', 'demo', 'Yes', 'demo1000018', '11032010', 'A+', NULL),
(20, 'Willmsss', '', '', '', '', '', '', NULL, '', '', NULL, '', '', '', '', '', '', '', '', '', '', '', '', NULL, '4', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-11 06:31:26', '2026-05-11 06:31:26', 1, 1000019, '2', 'demo', 'No', 'demo1000019', NULL, '', NULL),
(21, 'John Doe', 'Richard Doe', 'Jane Doe', '9876543210', '9876543211', 'hindi', NULL, NULL, 'Other', 'OBC', NULL, 'HINDUs', 'indian', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-19 09:04:07', '2026-05-19 09:04:07', 1, 1000020, '1', 'demo', 'Yes', 'demo1000020', NULL, 'O+', NULL),
(22, 'John Doe', 'Richard Doe', 'Jane Doe', '9876543210', '9876543211', 'hindi', '', '0000-00-00', 'Other', 'OBC', NULL, 'HINDUs', 'indian', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '1', '', '0000-00-00', '2', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-19 09:04:17', '2026-05-29 09:26:00', 1, 1000021, '1', 'demo', 'Yes', 'demo1000021', NULL, 'O+', NULL),
(23, 'John Doe', 'Richard Doe', 'Jane Doe', '9876543210', '9876543211', 'hindi', NULL, NULL, 'Other', 'OBC', NULL, 'HINDUs', 'indian', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', NULL, NULL, NULL, '3', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-19 09:04:26', '2026-05-19 09:04:26', 1, 1000022, '1', 'demo', 'Yes', 'demo1000022', NULL, 'O+', NULL),
(24, 'John Doe', 'Richard Doe', 'Jane Doe', '9876543210', '9876543211', 'hindi', NULL, NULL, 'Other', 'OBC', NULL, 'HINDUs', 'indian', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', NULL, NULL, NULL, '4', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-19 09:04:35', '2026-05-19 09:04:35', 1, 1000023, '1', 'demo', 'Yes', 'demo1000023', NULL, 'O+', NULL),
(25, 'Ranu', 'Richard Doe', 'Jane Doe', '9876543210', '8954516355', 'English', NULL, NULL, 'Other', 'ST', NULL, 'ishai', 'UK', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-28 08:19:35', '2026-05-28 08:19:35', 1, 1000024, '1', 'demo', 'Yes', 'demo1000024', NULL, 'O+', NULL),
(26, 'Pradeep', 'Richard Doe', 'Jane Doe', '6895745239', '9966885475', 'English', NULL, NULL, 'Male', 'ST', NULL, 'ishai', 'UK', '124 Main St', 'Jaipur', 'Rajasthan', '302002', '124 Main St', 'Jaipur', 'Rajasthan', '302002', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-28 08:19:35', '2026-05-28 08:19:35', 1, 1000025, '1', 'demo', 'Yes', 'demo1000025', NULL, 'O+', NULL),
(27, 'annu', 'Richard Doe', 'Jane Doe', '6699885547', '9585456789', 'English', NULL, NULL, 'Female', 'ST', NULL, 'ishai', 'UK', '125 Main St', 'Jaipur', 'Rajasthan', '302003', '125 Main St', 'Jaipur', 'Rajasthan', '302003', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-28 08:19:35', '2026-05-28 08:19:35', 1, 1000026, '1', 'demo', 'Yes', 'demo1000026', NULL, 'O+', NULL),
(28, 'sinu', 'Richard Doe', 'Jane Doe', '9874563215', '6894561236', 'English', NULL, NULL, 'Female', 'ST', NULL, 'ishai', 'UK', '126 Main St', 'Jaipur', 'Rajasthan', '302004', '126 Main St', 'Jaipur', 'Rajasthan', '302004', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-28 08:19:35', '2026-05-29 06:13:38', 1, 1000027, '1', 'demo', 'Yes', 'demo1000027', NULL, 'O+', NULL),
(29, 'tina', 'Richard Doe', 'Jane Doe', '9988552356', '9636852741', 'English', NULL, NULL, 'Female', 'ST', NULL, 'ishai', 'UK', '127 Main St', 'Jaipur', 'Rajasthan', '302005', '127 Main St', 'Jaipur', 'Rajasthan', '302005', NULL, NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-28 08:19:35', '2026-05-28 08:19:35', 1, 1000028, '1', 'demo', 'Yes', 'demo1000028', NULL, 'O+', NULL),
(30, 'Ranu', 'Richard Doe', 'Jane Doe', '9876543210', '8954516355', 'English', NULL, NULL, 'Other', 'ST', NULL, 'ishai', 'UK', '123 Main St', 'Jaipur', 'Rajasthan', '302001', '123 Main St', 'Jaipur', 'Rajasthan', '302001', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-29 07:10:43', '2026-05-29 07:10:43', 1, 1000029, '1', 'demo', 'Yes', 'demo1000029', NULL, 'O+', NULL),
(31, 'Pradeep', 'Richard Doe', 'Jane Doe', '6895745239', '9966885475', 'English', NULL, NULL, 'Male', 'ST', NULL, 'ishai', 'UK', '124 Main St', 'Jaipur', 'Rajasthan', '302002', '124 Main St', 'Jaipur', 'Rajasthan', '302002', NULL, NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL, NULL, 'show', 'active', '2026-05-29 07:10:43', '2026-05-29 07:10:43', 1, 1000030, '1', 'demo', 'Yes', 'demo1000030', NULL, 'O+', NULL),
(32, 'annu', 'Richard Doe', 'Jane Doe', '6699885547', '9585456789', 'English', '', '0000-00-00', 'Female', 'ST', NULL, 'ishai', 'UK', '125 Main St', 'Jaipur', 'Rajasthan', '302003', '125 Main St', 'Jaipur', 'Rajasthan', '302003', '15', '', '0000-00-00', '2', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-29 07:10:43', '2026-05-29 08:51:04', 1, 1000031, '1', 'demo', 'Yes', 'demo1000031', NULL, 'O+', NULL),
(33, 'sinu', 'Richard Doe', 'Jane Doe', '9874563215', '6894561236', 'English', '', '0000-00-00', 'Female', 'ST', NULL, 'ishai', 'UK', '126 Main St', 'Jaipur', 'Rajasthan', '302004', '126 Main St', 'Jaipur', 'Rajasthan', '302004', '12', '', '0000-00-00', '2', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-29 07:10:43', '2026-05-29 08:50:56', 1, 1000032, '1', 'demo', 'Yes', 'demo1000032', NULL, 'O+', NULL),
(34, 'tina', 'Richard Doe', 'Jane Doe', '9988552356', '9636852741', 'English', '', '0000-00-00', 'Female', 'ST', NULL, 'ishai', 'UK', '127 Main St', 'Jaipur', 'Rajasthan', '302005', '127 Main St', 'Jaipur', 'Rajasthan', '302005', '12', '453453', '0000-00-00', '2', '', '', '', '', '', 0.00, 'show', 'active', '2026-05-29 07:10:43', '2026-05-29 07:18:36', 1, 1000033, '1', 'demo', 'Yes', 'demo1000033', NULL, 'O+', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students_submit_fee`
--

CREATE TABLE `students_submit_fee` (
  `id` int(11) NOT NULL,
  `fee_head_id` int(11) NOT NULL,
  `fee_date` date DEFAULT NULL,
  `fee_amount` decimal(10,2) DEFAULT 0.00,
  `fee_pay` decimal(10,2) DEFAULT 0.00,
  `fee_discount` decimal(10,2) DEFAULT 0.00,
  `pay_date` date DEFAULT NULL,
  `next_pay` date DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` char(10) DEFAULT 'show',
  `student_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `receiptNo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students_submit_fee`
--

INSERT INTO `students_submit_fee` (`id`, `fee_head_id`, `fee_date`, `fee_amount`, `fee_pay`, `fee_discount`, `pay_date`, `next_pay`, `delete_status`, `display_order`, `created_at`, `updated_at`, `status`, `student_id`, `session_id`, `school_id`, `receiptNo`) VALUES
(1, 3, '2026-05-08', 0.00, 500.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:15:59', '2026-05-08 06:15:59', 'show', 1, 2, 1, 1),
(2, 1, '2026-05-08', 0.00, 500.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:15:59', '2026-05-08 06:15:59', 'show', 1, 2, 1, 1),
(3, 2, '2026-05-08', 0.00, 500.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:15:59', '2026-05-08 06:15:59', 'show', 1, 2, 1, 1),
(4, 3, '2026-05-08', 0.00, 5000.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:21:38', '2026-05-08 06:21:38', 'show', 1, 2, 1, 2),
(5, 2, '2026-05-08', 0.00, 500.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:21:38', '2026-05-08 06:21:38', 'show', 1, 2, 1, 2),
(6, 1, '2026-05-08', 0.00, 500.00, 0.00, '2026-05-08', '2026-05-08', 'show', 0, '2026-05-08 06:21:38', '2026-05-08 06:21:38', 'show', 1, 2, 1, 2),
(7, 3, '2026-05-19', 0.00, 100.00, 0.00, '2026-05-19', '2026-05-19', 'hide', 0, '2026-05-19 09:53:57', '2026-05-19 09:56:03', 'show', 21, 1, 1, 1),
(8, 1, '2026-05-19', 0.00, 100.00, 0.00, '2026-05-19', '2026-05-19', 'hide', 0, '2026-05-19 09:53:57', '2026-05-19 09:56:03', 'show', 21, 1, 1, 1),
(9, 2, '2026-05-19', 0.00, 100.00, 0.00, '2026-05-19', '2026-05-19', 'hide', 0, '2026-05-19 09:53:57', '2026-05-19 09:56:03', 'show', 21, 1, 1, 1),
(10, 3, '2026-05-19', 0.00, 1000.00, 0.00, '2026-05-19', '2026-05-19', 'hide', 0, '2026-05-19 09:56:32', '2026-05-19 09:56:41', 'show', 21, 1, 1, 1),
(11, 3, '2026-05-19', 0.00, 1000.00, 0.00, '2026-05-19', '2026-05-19', 'show', 0, '2026-05-19 10:31:29', '2026-05-19 10:31:29', 'show', 21, 1, 1, 1),
(12, 1, '2026-05-19', 0.00, 1000.00, 0.00, '2026-05-19', '2026-05-19', 'show', 0, '2026-05-19 11:06:04', '2026-05-19 11:06:04', 'show', 22, 1, 1, 1),
(13, 1, '2026-05-19', 0.00, 1000.00, 0.00, '2026-05-19', '2026-05-19', 'show', 0, '2026-05-19 11:06:46', '2026-05-19 11:06:46', 'show', 23, 1, 1, 1),
(14, 1, '2026-05-19', 0.00, 1000.00, 0.00, '2026-05-19', '2026-05-19', 'show', 0, '2026-05-19 11:07:21', '2026-05-19 11:07:21', 'show', 24, 1, 1, 1),
(15, 1, '2026-05-29', 0.00, 500.00, 0.00, '2026-05-29', '2026-05-29', 'show', 0, '2026-05-29 08:38:24', '2026-05-29 08:38:24', 'show', 21, 1, 1, 2),
(16, 2, '2026-05-29', 0.00, 500.00, 0.00, '2026-05-29', '2026-05-29', 'show', 0, '2026-05-29 08:38:24', '2026-05-29 08:38:24', 'show', 21, 1, 1, 2),
(17, 1, '2026-05-29', 0.00, 200.00, 0.00, '2026-05-29', '2026-05-29', 'show', 0, '2026-05-29 09:32:23', '2026-05-29 09:32:23', 'show', 22, 1, 1, 2),
(18, 2, '2026-05-29', 0.00, 500.00, 0.00, '2026-05-29', '2026-05-29', 'show', 0, '2026-05-29 09:33:01', '2026-05-29 09:33:01', 'show', 21, 1, 1, 3),
(19, 1, '2026-05-29', 0.00, 500.00, 0.00, '2026-05-29', '2026-05-29', 'show', 0, '2026-05-29 09:33:01', '2026-05-29 09:33:01', 'show', 21, 1, 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `student_attendance`
--

CREATE TABLE `student_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `school_id` bigint(20) UNSIGNED NOT NULL,
  `attendance_status` varchar(10) DEFAULT 'no',
  `in_status` varchar(5) NOT NULL DEFAULT 'false',
  `out_status` varchar(5) NOT NULL DEFAULT 'false',
  `in_time` time DEFAULT NULL,
  `out_time` time DEFAULT NULL,
  `attendance_date` date DEFAULT NULL,
  `sms_status` varchar(20) DEFAULT NULL,
  `delete_status` varchar(10) DEFAULT 'show',
  `status` varchar(10) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `student_name` char(100) DEFAULT NULL,
  `father_name` char(100) DEFAULT NULL,
  `class_name` char(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_attendance`
--

INSERT INTO `student_attendance` (`id`, `student_id`, `session_id`, `class_id`, `school_id`, `attendance_status`, `in_status`, `out_status`, `in_time`, `out_time`, `attendance_date`, `sms_status`, `delete_status`, `status`, `created_at`, `updated_at`, `student_name`, `father_name`, `class_name`) VALUES
(1, 1, 2, 1, 1, 'Present', '1', '1', '12:09:00', '12:10:00', '2026-05-08', '', 'show', 'active', '2026-05-08 06:39:39', '2026-05-08 06:40:07', 'demo student', 'demo father', '1');

-- --------------------------------------------------------

--
-- Table structure for table `student_class_test`
--

CREATE TABLE `student_class_test` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `test_id` int(11) DEFAULT NULL,
  `subject_head_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `marks` int(11) DEFAULT NULL,
  `student_marks` int(11) DEFAULT NULL,
  `student_name` char(100) DEFAULT NULL,
  `father_name` char(100) DEFAULT NULL,
  `status` char(10) DEFAULT 'active',
  `delete_status` char(10) DEFAULT 'show',
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `classsection_id` int(11) DEFAULT NULL,
  `exam_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_class_test`
--

INSERT INTO `student_class_test` (`id`, `student_id`, `session_id`, `school_id`, `test_id`, `subject_head_id`, `subject_id`, `marks`, `student_marks`, `student_name`, `father_name`, `status`, `delete_status`, `create_at`, `update_at`, `classsection_id`, `exam_date`) VALUES
(3, 29, 1, 1, 1, 1, 3, 30, 20, 'tina', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(4, 27, 1, 1, 1, 1, 3, 30, 22, 'annu', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(5, 28, 1, 1, 1, 1, 3, 30, 15, 'sinu', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(6, 21, 1, 1, 1, 1, 3, 30, 25, 'John Doe', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(7, 26, 1, 1, 1, 1, 3, 30, 22, 'Pradeep', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(8, 25, 1, 1, 1, 1, 3, 30, 30, 'Ranu', 'Richard Doe', 'active', 'show', '2026-05-28 08:22:57', '2026-05-28 08:22:57', 1, '2026-05-28'),
(9, 27, 1, 1, 1, 2, 4, 30, 15, 'annu', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28'),
(10, 25, 1, 1, 1, 2, 4, 30, 20, 'Ranu', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28'),
(11, 26, 1, 1, 1, 2, 4, 30, 25, 'Pradeep', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28'),
(12, 21, 1, 1, 1, 2, 4, 30, 15, 'John Doe', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28'),
(13, 28, 1, 1, 1, 2, 4, 30, 14, 'sinu', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28'),
(14, 29, 1, 1, 1, 2, 4, 30, 10, 'tina', 'Richard Doe', 'active', 'show', '2026-05-28 09:03:27', '2026-05-28 09:03:27', 1, '2026-05-28');

-- --------------------------------------------------------

--
-- Table structure for table `student_fee_allot`
--

CREATE TABLE `student_fee_allot` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `feehead` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `feehead_id` int(11) DEFAULT NULL,
  `frequency_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_fee_allot`
--

INSERT INTO `student_fee_allot` (`id`, `student_id`, `school_id`, `session_id`, `feehead`, `display_order`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`, `feehead_id`, `frequency_date`, `amount`, `class_id`) VALUES
(1, 1, 1, 2, NULL, 0, 'Active', 'show', '2026-05-08 06:15:26', '2026-05-08 06:15:26', NULL, 3, '2026-05-08', 1000.00, 1),
(2, 1, 1, 2, NULL, 0, 'Active', 'show', '2026-05-08 06:15:26', '2026-05-08 06:15:26', NULL, 2, '2026-05-06', 1000.00, 1),
(3, 1, 1, 2, NULL, 0, 'Active', 'show', '2026-05-08 06:15:26', '2026-05-08 06:15:26', NULL, 1, '2026-05-07', 1000.00, 1),
(4, 21, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 09:53:40', '2026-05-19 09:53:40', NULL, 3, '2026-05-08', 1000.00, 1),
(5, 21, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 09:53:40', '2026-05-19 09:53:40', NULL, 1, '2026-05-07', 1000.00, 1),
(6, 21, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 09:53:40', '2026-05-19 09:53:40', NULL, 2, '2026-05-06', 1000.00, 1),
(7, 22, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 11:04:03', '2026-05-19 11:04:03', NULL, 1, '2026-05-07', 3000.00, 2),
(8, 23, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 11:04:41', '2026-05-19 11:04:41', NULL, 1, '2026-05-07', 3000.00, 3),
(9, 24, 1, 1, NULL, 0, 'Active', 'show', '2026-05-19 11:05:17', '2026-05-19 11:05:17', NULL, 1, '2026-05-07', 3000.00, 4),
(10, 27, 1, 1, NULL, 0, 'Active', 'show', '2026-05-29 09:21:05', '2026-05-29 09:21:05', NULL, 3, '2026-05-08', 1000.00, 1),
(11, 27, 1, 1, NULL, 0, 'Active', 'show', '2026-05-29 09:21:05', '2026-05-29 09:21:05', NULL, 2, '2026-05-06', 1000.00, 1),
(12, 27, 1, 1, NULL, 0, 'Active', 'show', '2026-05-29 09:21:05', '2026-05-29 09:21:05', NULL, 1, '2026-05-07', 1000.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `student_main_exam`
--

CREATE TABLE `student_main_exam` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `test_id` int(11) DEFAULT NULL,
  `subject_head_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `marks` int(11) DEFAULT NULL,
  `viva` int(11) DEFAULT NULL,
  `practical` int(11) DEFAULT NULL,
  `student_marks` int(11) DEFAULT NULL,
  `student_name` char(100) DEFAULT NULL,
  `father_name` char(100) DEFAULT NULL,
  `status` char(10) DEFAULT 'active',
  `delete_status` char(10) DEFAULT 'show',
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `classsection_id` int(11) DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `student_viva` decimal(4,2) DEFAULT NULL,
  `student_practical` decimal(4,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_main_exam`
--

INSERT INTO `student_main_exam` (`id`, `student_id`, `session_id`, `school_id`, `test_id`, `subject_head_id`, `subject_id`, `marks`, `viva`, `practical`, `student_marks`, `student_name`, `father_name`, `status`, `delete_status`, `create_at`, `update_at`, `classsection_id`, `exam_date`, `student_viva`, `student_practical`) VALUES
(1, 1, 2, 1, 1, 1, 3, 60, 20, 20, 40, 'demo student', 'demo father', 'active', 'show', '2026-05-08 06:26:43', '2026-05-08 06:48:22', 1, NULL, 20.00, 20.00),
(2, 29, 1, 1, 3, 1, 3, 60, 20, 20, 10, 'tina', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 19.00, 17.00),
(3, 21, 1, 1, 3, 1, 3, 60, 20, 20, 55, 'John Doe', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 12.00, 12.00),
(4, 26, 1, 1, 3, 1, 3, 60, 20, 20, 39, 'Pradeep', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 16.00, 15.00),
(5, 25, 1, 1, 3, 1, 3, 60, 20, 20, 44, 'Ranu', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 18.00, 10.00),
(6, 28, 1, 1, 3, 1, 3, 60, 20, 20, 50, 'sinu', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 15.00, 12.00),
(7, 27, 1, 1, 3, 1, 3, 60, 20, 20, 12, 'annu', 'Richard Doe', 'active', 'show', '2026-05-28 11:36:49', '2026-05-28 11:46:36', 1, NULL, 12.00, 20.00);

-- --------------------------------------------------------

--
-- Table structure for table `student_subject_allot`
--

CREATE TABLE `student_subject_allot` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subjectgroup_id` int(11) NOT NULL,
  `subject_id` varchar(255) DEFAULT NULL,
  `session_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `delete_status` enum('show','deleted') DEFAULT 'show',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_subject_allot`
--

INSERT INTO `student_subject_allot` (`id`, `student_id`, `subjectgroup_id`, `subject_id`, `session_id`, `school_id`, `display_order`, `delete_status`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, '3,2,1', 2, 1, 0, 'show', 'Active', '2026-05-08 06:43:09', '2026-05-08 06:43:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int(11) NOT NULL,
  `subject_name` char(50) DEFAULT NULL,
  `subject_short_name` char(30) DEFAULT NULL,
  `subject_code` char(10) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `delete_status` char(10) DEFAULT 'show',
  `status` char(10) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `school_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`id`, `subject_name`, `subject_short_name`, `subject_code`, `display_order`, `delete_status`, `status`, `create_at`, `update_at`, `school_id`) VALUES
(1, 'English', 'EN', '0001', 1, 'show', 'Active', '2026-05-08 05:38:43', '2026-05-08 05:38:43', 1),
(2, 'Hindi', 'HD', '0002', 2, 'show', 'Active', '2026-05-08 05:39:05', '2026-05-08 05:39:05', 1),
(3, 'Biology', 'Bio', '0003', 3, 'show', 'Active', '2026-05-08 05:39:36', '2026-05-08 05:39:36', 1),
(4, 'mathematics', 'Math', '0004', 4, 'show', 'Active', '2026-05-08 05:39:59', '2026-05-08 05:39:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `subject_group`
--

CREATE TABLE `subject_group` (
  `id` int(11) NOT NULL,
  `subject_ids` varchar(255) NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `school_id` int(11) NOT NULL,
  `status` varchar(10) DEFAULT 'Active',
  `delete_status` varchar(10) DEFAULT 'show',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subject_group`
--

INSERT INTO `subject_group` (`id`, `subject_ids`, `group_name`, `display_order`, `school_id`, `status`, `delete_status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '1,2,3', '12th bio', 1, 1, 'Active', 'show', '2026-05-08 05:40:21', '2026-05-08 05:40:21', NULL),
(2, '1,2,4', '12th Maths', 2, 1, 'Active', 'show', '2026-05-08 05:40:40', '2026-05-08 05:40:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_device_tokens`
--

CREATE TABLE `user_device_tokens` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `fcm_token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_device_tokens`
--

INSERT INTO `user_device_tokens` (`id`, `school_id`, `user_id`, `role`, `fcm_token`) VALUES
(6, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(7, NULL, NULL, NULL, 'd4xWWb95vG5qpeK7yrqf43:APA91bGoLqt25c7r_IJEmWQAl8OOKsbbUmRdYTgi9FheG05r1elosWtw1P0qg0OmMhptrO4fHaDTOe-P7xMjHqlMQd9TJIIm3i8HyrRPulloXWE5KN0otNE'),
(8, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(9, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(10, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(11, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(12, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(13, NULL, NULL, NULL, 'dmRywe4c3nS1npHxg2ZB6s:APA91bFpwVvABP0Pe6Uc0T57_AzbAbZCOG_NHS2gROTMsLPQaiOG637hcPotectMt6N4yeprFG3UhgXNL6dQMRtBJF8wSfz6yS8hYIlEgmz19AUGBKd7-iI'),
(14, NULL, NULL, NULL, 'eyTq7iLfCEakdOE2UCa5wx:APA91bHUn5iwFwYUgjywDqu93PW3svJWI-DF6mbq9-IbCgFfBPso2UlXYWREAAVwEm7jhZSqpeq4SjUybhEKt81_tmEHjea4FUeiSbcjAfyNUwH4InMfq1E'),
(15, NULL, NULL, NULL, 'dJWD1EY6_BhXXDn5dD9uI5:APA91bG1JiAfc71BjvJtBZyDcKuQC-EE0I9vL8wXh-tfo_ds6cc-ccLfgqYFVmbfN05fpSn5k8RIUdHDmav6hrISDQrM1rqDJBY8YAM2gq6Q8ib1CXw0cKM'),
(16, NULL, NULL, NULL, 'eyTq7iLfCEakdOE2UCa5wx:APA91bHUn5iwFwYUgjywDqu93PW3svJWI-DF6mbq9-IbCgFfBPso2UlXYWREAAVwEm7jhZSqpeq4SjUybhEKt81_tmEHjea4FUeiSbcjAfyNUwH4InMfq1E'),
(17, NULL, NULL, NULL, 'eyTq7iLfCEakdOE2UCa5wx:APA91bHUn5iwFwYUgjywDqu93PW3svJWI-DF6mbq9-IbCgFfBPso2UlXYWREAAVwEm7jhZSqpeq4SjUybhEKt81_tmEHjea4FUeiSbcjAfyNUwH4InMfq1E'),
(18, NULL, NULL, NULL, 'eyTq7iLfCEakdOE2UCa5wx:APA91bHUn5iwFwYUgjywDqu93PW3svJWI-DF6mbq9-IbCgFfBPso2UlXYWREAAVwEm7jhZSqpeq4SjUybhEKt81_tmEHjea4FUeiSbcjAfyNUwH4InMfq1E'),
(19, NULL, NULL, NULL, 'd4xWWb95vG5qpeK7yrqf43:APA91bGoLqt25c7r_IJEmWQAl8OOKsbbUmRdYTgi9FheG05r1elosWtw1P0qg0OmMhptrO4fHaDTOe-P7xMjHqlMQd9TJIIm3i8HyrRPulloXWE5KN0otNE');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `classfee`
--
ALTER TABLE `classfee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class_detail`
--
ALTER TABLE `class_detail`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class_section`
--
ALTER TABLE `class_section`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class_test`
--
ALTER TABLE `class_test`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `division`
--
ALTER TABLE `division`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_timetable`
--
ALTER TABLE `exam_timetable`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feefrequency`
--
ALTER TABLE `feefrequency`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feehead`
--
ALTER TABLE `feehead`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gender`
--
ALTER TABLE `gender`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `holiday_master`
--
ALTER TABLE `holiday_master`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `main_exam`
--
ALTER TABLE `main_exam`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medium`
--
ALTER TABLE `medium`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nationality`
--
ALTER TABLE `nationality`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `period`
--
ALTER TABLE `period`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `religion`
--
ALTER TABLE `religion`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `school_account`
--
ALTER TABLE `school_account`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `school_homework`
--
ALTER TABLE `school_homework`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `school_session`
--
ALTER TABLE `school_session`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sms_template`
--
ALTER TABLE `sms_template`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_period_allot`
--
ALTER TABLE `staff_period_allot`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students_submit_fee`
--
ALTER TABLE `students_submit_fee`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_attendance`
--
ALTER TABLE `student_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`attendance_date`,`class_id`);

--
-- Indexes for table `student_class_test`
--
ALTER TABLE `student_class_test`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_fee_allot`
--
ALTER TABLE `student_fee_allot`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_main_exam`
--
ALTER TABLE `student_main_exam`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_subject_allot`
--
ALTER TABLE `student_subject_allot`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject_group`
--
ALTER TABLE `subject_group`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_device_tokens`
--
ALTER TABLE `user_device_tokens`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `class`
--
ALTER TABLE `class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `classfee`
--
ALTER TABLE `classfee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `class_detail`
--
ALTER TABLE `class_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `class_section`
--
ALTER TABLE `class_section`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `class_test`
--
ALTER TABLE `class_test`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `division`
--
ALTER TABLE `division`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `exam_timetable`
--
ALTER TABLE `exam_timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `feefrequency`
--
ALTER TABLE `feefrequency`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feehead`
--
ALTER TABLE `feehead`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gender`
--
ALTER TABLE `gender`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `grade`
--
ALTER TABLE `grade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `holiday_master`
--
ALTER TABLE `holiday_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `main_exam`
--
ALTER TABLE `main_exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medium`
--
ALTER TABLE `medium`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `nationality`
--
ALTER TABLE `nationality`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `period`
--
ALTER TABLE `period`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `religion`
--
ALTER TABLE `religion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `school_account`
--
ALTER TABLE `school_account`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `school_homework`
--
ALTER TABLE `school_homework`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_session`
--
ALTER TABLE `school_session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sms_template`
--
ALTER TABLE `sms_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_period_allot`
--
ALTER TABLE `staff_period_allot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `students_submit_fee`
--
ALTER TABLE `students_submit_fee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `student_attendance`
--
ALTER TABLE `student_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_class_test`
--
ALTER TABLE `student_class_test`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `student_fee_allot`
--
ALTER TABLE `student_fee_allot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `student_main_exam`
--
ALTER TABLE `student_main_exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `student_subject_allot`
--
ALTER TABLE `student_subject_allot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `subject_group`
--
ALTER TABLE `subject_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_device_tokens`
--
ALTER TABLE `user_device_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
