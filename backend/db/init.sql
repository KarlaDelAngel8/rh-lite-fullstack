-- Create database
CREATE DATABASE rh_system;
GO

-- Use the database
USE rh_system;
GO

-- Create areas table
CREATE TABLE areas (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description TEXT,
    status BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create branches table
CREATE TABLE branches (
    id INT PRIMARY KEY IDENTITY(1,1),
    areaId INT,
    name NVARCHAR(255) NOT NULL,
    description TEXT,
    status BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (areaId) REFERENCES areas(id)
);

-- Create departments table
CREATE TABLE departments (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description TEXT,
    status BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create candidate_states table
CREATE TABLE candidate_states (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    description TEXT,
    status BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);

-- Create indexes
CREATE INDEX idx_areas_status ON areas(status);
CREATE INDEX idx_branches_areaId ON branches(areaId);
CREATE INDEX idx_branches_status ON branches(status);
CREATE INDEX idx_departments_status ON departments(status);
CREATE INDEX idx_candidate_states_status ON candidate_states(status);

-- Insert sample data
INSERT INTO areas (name, description, status) VALUES
('Ventas', 'Area de ventas', 1),
('Recursos Humanos', 'Area de recursos humanos', 1),
('Tecnologia', 'Area de tecnologia', 1),
('Operaciones', 'Area de operaciones', 1);

INSERT INTO branches (areaId, name, description, status) VALUES
(1, 'Sucursal Central', 'Oficina central de ventas', 1),
(1, 'Sucursal Norte', 'Oficina norte de ventas', 1),
(2, 'RRHH Principal', 'Oficina principal de RRHH', 1);

INSERT INTO departments (name, description, status) VALUES
('Desarrollo', 'Departamento de desarrollo', 1),
('QA', 'Departamento de calidad', 1),
('DevOps', 'Departamento de infraestructura', 1);

INSERT INTO candidate_states (name, description, status) VALUES
('Nuevo', 'Candidato nuevo', 1),
('En Revision', 'En proceso de revision', 1),
('Entrevista', 'Pasó a entrevista', 1),
('Rechazado', 'Candidato rechazado', 1),
('Contratado', 'Candidato contratado', 1);
