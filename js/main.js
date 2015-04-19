
//animation for the prompt
var intro_delay = 800;
var intro_text = [
	{ time: 0,    key:'T' },
	{ time: 150,  key:'e' },
	{ time: 359,  key:'l' },
	{ time: 720,  key:'l' },
	{ time: 1040, key:' ' },
	{ time: 1367, key:'m' },
	{ time: 1511, key:'e' },
	{ time: 1599, key:' ' },
	{ time: 1727, key:'a' },
	{ time: 1871, key:' ' },
	{ time: 2039, key:'s' },
	{ time: 2263, key:'t' },
	{ time: 2391, key:'o' },
	{ time: 2535, key:'r' },
	{ time: 2615, key:'y' }
];

window.onkeypress = function(e) {
	var text = document.querySelector("#text");
	text.innerHTML += e.key;
	console.log(e);
};


function write_intro()
{
	var text = document.querySelector("#text");

	function write_char(c, wait)
	{
		setTimeout(function() {
			text.innerHTML += c;
		}, intro_delay + wait);
	}

	intro_text.forEach(function(e) {
		write_char(e.key, e.time);
	});
}

window.onload = function(e) {

	write_intro();
};