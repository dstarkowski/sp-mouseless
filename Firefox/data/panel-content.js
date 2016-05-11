var input = document.getElementById('spm-input');
input.addEventListener('keyup', function onkeyup(event) {
	if (event.keyCode == 13) {
		text = input.value;
		self.port.emit('text-entered', text);
		input.value = '';
	}
}, false);

self.port.on('show', function onShow() {
	input.focus();
	input.select();
});