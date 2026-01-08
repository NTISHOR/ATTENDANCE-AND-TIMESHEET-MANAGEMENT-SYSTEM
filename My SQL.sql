-- 1. Create the database
CREATE DATABASE IF NOT EXISTS attendance_system;

-- 2. Use the database
USE attendance_system;

-- 3. Create table for Lecturers
CREATE TABLE IF NOT EXISTS lecturers (
  lecturer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL
);

-- 4. Create table for Supervisors
CREATE TABLE IF NOT EXISTS supervisors (
  supervisor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL
);

-- 5. Create table for Classes
CREATE TABLE IF NOT EXISTS classes (
  class_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  lecturer_id INT NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE CASCADE
);

-- 6. Create table for Class Records (attendance submissions)
CREATE TABLE IF NOT EXISTS class_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  actual_start TIME NOT NULL,
  actual_end TIME NOT NULL,
  notes TEXT,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  remarks TEXT,
  FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);
