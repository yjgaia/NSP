<!DOCTYPE html>
<html>
	<body>
		<h1>My first PHP page</h1>
		<?php
			$msg = 'Hello World!';
		?>
		<p><?php echo $msg; ?></p>
		<p><?=$msg ?></p>
		<a href="/">Home</a>
	</body>
</html>