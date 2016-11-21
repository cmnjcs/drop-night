function generate() {
	console.log('generating stuff');
	var base = $('#base').val();
	var unit = $('#unit').val();
	var password = $('#password').val();

	var jsonObject = {
		base: base,
		unit: unit
	};

	var encodedJson = sjcl.json.encode(jsonObject);

	var ciphertext = sjcl.encrypt(password, encodedJson);

	$('#ciphertext').val(encodeURI(ciphertext));
}