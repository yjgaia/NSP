<!DOCTYPE html>
<html>
	<body>
		<h1>My first PHP page</h1>
		<?php
			$arr = [1, 2, 3, 4, 5];
		?>
		<?php foreach($arr as $v) { ?>
			<?= $v ?>
		<?php } ?>
		<?php
			$data = [a => 1, b => 2, c => 3];
		?>
		<?php foreach($data as $n => $v) { ?>
			<p><?= $n ?> : <?= $v ?></p>
		<?php } ?>
		<?php for ($v = 0; $v < 5; $v += 1) { ?>
			<?= $v ?>
		<?php } ?>
		<a href="/">Home</a>
	</body>
</html>