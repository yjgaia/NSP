<!DOCTYPE html>
<html>
	<body>
		<h1>My first PHP page</h1>
		<?php
		    $a = true;
		    $b = false;
		?>
		<?php if ($a) { ?>
		    <p>I'm printed.</p>
		<?php } ?>
		<?php if ($b) { ?>
		    <p>I'm not printed.</p>
		<?php } else { ?>
		    <p>I'm printed.</p>
		<?php } ?>
		<a href="/">Home</a>
	</body>
</html>