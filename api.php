<?php
/**
 * API Backend de Ejemplo para el Registro y Gestión de Ganado
 * 
 * Este archivo demuestra cómo estructurar los endpoints en PHP para recibir
 * peticiones desde el frontend en React, conectarse a una base de datos MySQL 
 * y retornar respuestas JSON.
 * 
 * ESTRUCTURA DE TABLAS RECOMENDADA (SQL):
 * 
 * -- 1. Tabla de Ganado
 * CREATE TABLE cattle (
 *     id VARCHAR(50) PRIMARY KEY, -- Arete/Código de identificación
 *     name VARCHAR(100),
 *     breed VARCHAR(50) NOT NULL,
 *     dob DATE,
 *     gender ENUM('Macho', 'Hembra') NOT NULL,
 *     status ENUM('Activo', 'Enfermo', 'Vendido', 'Muerto') DEFAULT 'Activo',
 *     notes TEXT,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * -- 2. Tabla de Pesajes
 * CREATE TABLE weights (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     cattle_id VARCHAR(50),
 *     date DATE NOT NULL,
 *     weight DECIMAL(6,2) NOT NULL,
 *     notes VARCHAR(255),
 *     FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE
 * );
 * 
 * -- 3. Tabla de Vacunas
 * CREATE TABLE vaccines (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     cattle_id VARCHAR(50),
 *     date DATE NOT NULL,
 *     vaccine_name VARCHAR(100) NOT NULL,
 *     dosage VARCHAR(50),
 *     batch VARCHAR(50),
 *     next_dose_date DATE,
 *     vet VARCHAR(100),
 *     FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE
 * );
 * 
 * -- 4. Tabla de Medicamentos
 * CREATE TABLE medications (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     cattle_id VARCHAR(50),
 *     date DATE NOT NULL,
 *     medication_name VARCHAR(100) NOT NULL,
 *     dosage VARCHAR(50),
 *     reason VARCHAR(255),
 *     duration_days INT DEFAULT 1,
 *     withdrawal_days INT DEFAULT 0,
 *     vet VARCHAR(100),
 *     FOREIGN KEY (cattle_id) REFERENCES cattle(id) ON DELETE CASCADE
 * );
 */

// 1. Cabeceras CORS (Indispensable para desarrollo local con React corriendo en otro puerto/servidor dev)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Responder inmediatamente a peticiones preflight OPTIONS de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Configuración y Conexión de Base de Datos (Modifica con tus credenciales reales)
$host = "localhost";
$db_name = "rancho_db";
$username = "root";
$password = "";
$conn = null;

/* 
// HABILITA ESTE BLOQUE CUANDO CONECTES TU BASE DE DATOS REAL
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos: " . $exception->getMessage()]);
    exit();
}
*/

// 3. Obtener Acción y Método de la Petición
$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper para leer el cuerpo JSON de peticiones POST/PUT
function getJSONBody() {
    $json = file_get_contents("php://input");
    return json_decode($json, true);
}

// 4. Enrutamiento de Acciones
switch ($action) {

    // === ACCIONES DE GANADO ===
    case 'getCattle':
        if ($method === 'GET') {
            // Ejemplo de consulta PDO:
            // $stmt = $conn->prepare("SELECT * FROM cattle ORDER BY created_at DESC");
            // $stmt->execute();
            // echo json_encode($stmt->fetchAll());
            
            // Retorno simulado temporal:
            echo json_encode(["message" => "Conexión exitosa. Aquí retornarías SELECT * FROM cattle en PHP real."]);
        }
        break;

    case 'getCattleById':
        if ($method === 'GET' && isset($_GET['id'])) {
            $id = $_GET['id'];
            // $stmt = $conn->prepare("SELECT * FROM cattle WHERE id = ?");
            // $stmt->execute([$id]);
            // echo json_encode($stmt->fetch());
            echo json_encode(["message" => "Retornar animal con ID: " . $id]);
        }
        break;

    case 'createCattle':
        if ($method === 'POST') {
            $data = getJSONBody();
            // $stmt = $conn->prepare("INSERT INTO cattle (id, name, breed, dob, gender, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
            // $stmt->execute([$data['id'], $data['name'], $data['breed'], $data['dob'], $data['gender'], $data['status'], $data['notes']]);
            // echo json_encode(["success" => true, "data" => $data]);
            echo json_encode(["message" => "Registrar nuevo animal.", "data_recibida" => $data]);
        }
        break;

    case 'updateCattle':
        if ($method === 'PUT' && isset($_GET['id'])) {
            $id = $_GET['id'];
            $data = getJSONBody();
            // $stmt = $conn->prepare("UPDATE cattle SET name = ?, breed = ?, dob = ?, gender = ?, status = ?, notes = ? WHERE id = ?");
            // $stmt->execute([$data['name'], $data['breed'], $data['dob'], $data['gender'], $data['status'], $data['notes'], $id]);
            // echo json_encode(["success" => true]);
            echo json_encode(["message" => "Actualizar animal " . $id, "data_recibida" => $data]);
        }
        break;

    case 'deleteCattle':
        if ($method === 'DELETE' && isset($_GET['id'])) {
            $id = $_GET['id'];
            // Las relaciones se borrarán automáticamente si usaste ON DELETE CASCADE en llaves foráneas.
            // $stmt = $conn->prepare("DELETE FROM cattle WHERE id = ?");
            // $stmt->execute([$id]);
            // echo json_encode(["success" => true]);
            echo json_encode(["message" => "Eliminado animal " . $id]);
        }
        break;


    // === ACCIONES DE PESO ===
    case 'getWeights':
        if ($method === 'GET' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            // $stmt = $conn->prepare("SELECT * FROM weights WHERE cattle_id = ? ORDER BY date ASC");
            // $stmt->execute([$cattleId]);
            // echo json_encode($stmt->fetchAll());
            echo json_encode(["message" => "Retornar historial de pesajes para el animal " . $cattleId]);
        }
        break;

    case 'addWeight':
        if ($method === 'POST' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            $data = getJSONBody();
            // $stmt = $conn->prepare("INSERT INTO weights (cattle_id, date, weight, notes) VALUES (?, ?, ?, ?)");
            // $stmt->execute([$cattleId, $data['date'], $data['weight'], $data['notes']]);
            // echo json_encode(["success" => true]);
            echo json_encode(["message" => "Añadido peso a " . $cattleId, "data" => $data]);
        }
        break;


    // === ACCIONES DE VACUNAS ===
    case 'getVaccines':
        if ($method === 'GET' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            // $stmt = $conn->prepare("SELECT * FROM vaccines WHERE cattle_id = ? ORDER BY date DESC");
            // $stmt->execute([$cattleId]);
            // echo json_encode($stmt->fetchAll());
            echo json_encode(["message" => "Retornar vacunas aplicadas a " . $cattleId]);
        }
        break;

    case 'addVaccine':
        if ($method === 'POST' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            $data = getJSONBody();
            // $stmt = $conn->prepare("INSERT INTO vaccines (cattle_id, date, vaccine_name, dosage, batch, next_dose_date, vet) VALUES (?, ?, ?, ?, ?, ?, ?)");
            // $stmt->execute([$cattleId, $data['date'], $data['vaccineName'], $data['dosage'], $data['batch'], $data['nextDoseDate'], $data['vet']]);
            // echo json_encode(["success" => true]);
            echo json_encode(["message" => "Aplicada vacuna a " . $cattleId, "data" => $data]);
        }
        break;


    // === ACCIONES DE MEDICAMENTOS ===
    case 'getMedications':
        if ($method === 'GET' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            // $stmt = $conn->prepare("SELECT * FROM medications WHERE cattle_id = ? ORDER BY date DESC");
            // $stmt->execute([$cattleId]);
            // echo json_encode($stmt->fetchAll());
            echo json_encode(["message" => "Retornar tratamientos médicos de " . $cattleId]);
        }
        break;

    case 'addMedication':
        if ($method === 'POST' && isset($_GET['cattleId'])) {
            $cattleId = $_GET['cattleId'];
            $data = getJSONBody();
            // $stmt = $conn->prepare("INSERT INTO medications (cattle_id, date, medication_name, dosage, reason, duration_days, withdrawal_days, vet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            // $stmt->execute([$cattleId, $data['date'], $data['medicationName'], $data['dosage'], $data['reason'], $data['durationDays'], $data['withdrawalDays'], $data['vet']]);
            // echo json_encode(["success" => true]);
            echo json_encode(["message" => "Tratamiento registrado para " . $cattleId, "data" => $data]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Ruta de API no encontrada."]);
        break;
}
?>
