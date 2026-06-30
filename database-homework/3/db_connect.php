<?php
$dsn = 'mysql:host=localhost;dbname=your_database;charset=utf8mb4';
$user = 'your_username';
$pass = 'your_password';

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit('接続エラー: ' . $e->getMessage());
}
