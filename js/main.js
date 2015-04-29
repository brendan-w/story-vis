
//animation for the prompt
var intro_delay = 1200;
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
	{ time: 2615, key:'y' },
	{ time: 3300, key:'<br>' },
	{ time: 3700, key:'<br>' }
];

//elements
var $text;

//search API
var query_url = "https://api.datamarket.azure.com/Bing/Search/v1/Image?Query="

function query_url_for(words)
{
	return query_url + "%27" + "%20".join(words) + "%27";
}

function write_intro(done)
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

	//report ready once the last animation frame has been triggered
	setTimeout(done, intro_text[intro_text.length - 1].time + intro_delay);
}

function on_key(e)
{
	if(e.keyCode == 0) //normal keys
	{
		$text.text($text.text() + e.key);
	}
	else if(e.keyCode == 8) //backspace
	{
		var t = $text.text();
		$text.text(t.substring(0, t.length - 1));
	}
}

$(function(e) {
	$text = $("#text");

	write_intro(function() {

		//finished animating the prompt, attach relevant event handlers
		window.onkeypress = on_key;
	});
});
