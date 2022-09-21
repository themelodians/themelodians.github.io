<?php

// Replace "yourdomain.com" to your real domain name

if (!empty($_POST)) {

	$receive_email = '';
	$subject = 'New message from yourdomain.com';
	$reply_to_email = 'info@yourdomain.com';
	$message = '';
		
	$headers = array(
		'MIME-Version: 1.0',
		'From: ' . $reply_to_email,
		'Reply-To: ' . $reply_to_email,   
		'Content-Type: text/html; charset=utf-8'
	);

	// Letter's body generate in foreach cycle
	foreach ($_POST as $key => $value)
		$message .= htmlspecialchars($value).' <br>';

	// Send the letter
	if (mail($receive_email, $subject, $message, implode("\r\n", $headers)))
		echo 'success';
	else
		echo 'fail';
} else {
	echo 'empty';
}
