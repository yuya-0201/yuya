<?php
require_once 'db_connect.php';

$sql = "SELECT Name, Price FROM Product ORDER BY Price DESC";
$stmt = $pdo->query($sql);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>問題3</title>
</head>
<body>
<table border="1">
<tr>
<th>商品名</th>
<th>単価</th>
</tr>
<?php while ($row = $stmt->fetch(PDO::FETCH_ASSOC)): ?>
<tr>
<td><?= htmlspecialchars($row['Name']) ?></td>
<td><?= htmlspecialchars($row['Price']) ?></td>
</tr>
<?php endwhile; ?>
</table>
</body>
</html>
