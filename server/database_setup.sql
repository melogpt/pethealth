-- AI Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  microchip_number VARCHAR(50) NOT NULL,
  sender ENUM('user', 'ai') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_microchip (microchip_number),
  INDEX idx_created (created_at)
);

-- Doctor Messages Table (Pet Owner'dan Doctor'a gönderilen mesajlar)
CREATE TABLE IF NOT EXISTS doctor_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  microchip_number VARCHAR(50) NOT NULL,
  owner_name VARCHAR(255),
  owner_contact VARCHAR(50),
  pet_name VARCHAR(255),
  pet_type VARCHAR(100),
  summary TEXT NOT NULL,
  pet_info JSON,
  status ENUM('pending', 'read') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

