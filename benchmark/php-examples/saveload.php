<?php
	// Start the session
	session_start();
?>
<!DOCTYPE html>
<html>
	<body>
		<h1>Save/Load Example</h1>
		<?php
			$_SESSION['sample'] = 'this is example.';
		?>
		<p><?=$_SESSION['sample'] ?></p>
		<?php
			$_SESSION['sample'] = null;
		?>
		<p><?=$_SESSION['sample'] ?></p>
		<a href="/">Home</a>
	</body>
</html>