
"use strict";

//dev mode omits animations, 'cause they get annoying after a while... 
var dev_mode = true;

//search API
var query_url = "https://api.datamarket.azure.com/Bing/Search/Image?";

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
var $main;
var $prompt;
var $text;


function query_url_for(str)
{
	return query_url + "Query=%27" + encodeURIComponent(str) + "%27";
}

function write_intro(done)
{
	function write_char(c, wait)
	{
		setTimeout(function() {
			$prompt.append(c);
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
		// $text.append(document.createTextNode(e.key));
	}
	else if(e.keyCode == 8) //backspace
	{
		e.preventDefault(); //prevent backspace from going back in page history

		if(e.ctrlKey)
		{
			//because it's annoying when ctrl+backspace isn't implemented
			//delete last word
			var t = $text.text();
			$text.text(t.substring(0, t.lastIndexOf(' ')));			
		}
		else
		{
			//delete last character
			var t = $text.text();
			$text.text(t.substring(0, t.length - 1));
		}
	}
}

function image_for_str(str, done)
{
	$.ajax({
		url: query_url_for(str),
		method: 'GET',
		dataType: "json",
		success: function(data) {
			if(data.d.results.length > 0)
			{
				//take the first image result
				var img = new Image();
				img.onload = function() {
					done(img);
				};
				img.src = data.d.results[0].Thumbnail.MediaUrl;
			}
			else
			{
				done(null);
			}
		},
		beforeSend: function(xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(API_key + ":" + API_key));
		},
		error: function(xhr) {
			console.log("API error:");
			console.log(xhr);
		}
	});
}

$(function(e) {
	$main = $("#main");
	$prompt = $("#prompt");
	$text = $("#text");

	write_intro(function() {

		//finished animating the prompt, attach relevant event handlers
		window.onkeypress = on_key;
	});

	// image_for_str("red car", function(data) {
	// 	console.log(data);
	// });
});
