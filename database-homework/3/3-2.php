<?php
require_once 'db_connect.php';

$sql = "SELECT Code, Name, Category, Price, Price * 12 AS DozenPrice FROM Product";
$stmt = $pdo->query($sql);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>問題2</title>
</head>
<body>
<table border="1">
<tr>
<th>商品番号</th>
<th>商品名</th>
<th>種別</th>
<th>単価</th>
<th>1ダース価格</th>
</tr>
<?php while ($row = $stmt->fetch(PDO::FETCH_ASSOC)): ?>
<tr>
<td><?= htmlspecialchars($row['Code']) ?></td>
<td><?= htmlspecialchars($row['Name']) ?></td>
<td><?= htmlspecialchars($row['Category']) ?></td>
<td><?= htmlspecialchars($row['Price']) ?></td>
<td><?= htmlspecialchars($row['DozenPrice']) ?></td>
</tr>
<?php endwhile; ?>
</table>
</body>
</html>
