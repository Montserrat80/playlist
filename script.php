<?php
$myPost = file_get_contents('php://input');
$myFile = fopen('katalog.json', 'w');
fwrite($myFile,$myPost);
fclose($myFile);

echo "Alles klar! File erstellt";
?>