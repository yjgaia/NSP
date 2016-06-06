<?php
	setcookie('sample-cookie', 'this is example.', time() + 1);
?>
<!DOCTYPE html>
<html>
	<body>
		<h1>Cookies Example</h1>
		<a href="cookies.php">Refresh</a>
		<p><?=$_COOKIE['sample-cookie'] ?></p>
		<p></p>
		<a href="/">Home</a>
	</body>
</html>