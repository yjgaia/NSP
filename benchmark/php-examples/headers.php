<!DOCTYPE html>
<html>
	<body>
		<h1>Headers Example</h1>
		<p><?php
			foreach (getallheaders() as $name => $value) {
				echo $name.': '.$value.' ';
			}
		?></p>
		<a href="/">Home</a>
	</body>
</html>