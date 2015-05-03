
"use strict";

//dev mode omits animations, 'cause they get annoying after a while... 
var animations = true;
var image_search = false;


//elements
var $prompt;
var $text;
var $images;

//running vars
var segments = [0]; //indices of split points between text segments (not including 0)
var image_store = {}; //hashmap of string to image urls (prevents duplicate queries)


/*
	Utils
*/

function clean_array(arr)
{
	var cleaned = [];
	arr.forEach(function(e) {
		if(e) cleaned.push(e);
	});
	return cleaned;
}

function random_range(min, max)
{
    return Math.random() * (max - min) + min;
}

function scroll_to_bottom()
{
	window.scrollTo(0, document.body.scrollHeight);
}

/*
	Buffer Operations
*/

function last_split()
{
	return segments[segments.length - 1];
}

function clean(str)
{
	var words = clean_array(str.toLowerCase().split(' '));
	var output = "";

	for(var i = 0; i < words.length; i++)
	{
		var word = words[i].replace(punctuation, "");

		if(word && !blacklist.test(word))
		{
			if(output.length > 0) output += " ";
			output += word;
		}
	}

	return output;
}


/*
	Image Search API
*/

function query_url_for(str)
{
	return query_url + "Query=%27" + encodeURIComponent(str) + "%27";
}

function image_for_str(str, img)
{
	if(image_store.hasOwnProperty(str))
	{
		//no AJAX query needed, we've done this before
		img.src = image_store[str];
	}
	else
	{
		$.ajax({
			url: query_url_for(str),
			method: 'GET',
			dataType: "json",
			success: function(data) {
				if(data.d.results.length > 0)
				{
					//take the first image result
					img.onload = function() {
						img.className = ""; //remove the "loading" class
						scroll_to_bottom();
					};
					img.src = data.d.results[0].Thumbnail.MediaUrl;
					image_store[str] = img.src; //save the source, so we don't query twice
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
}


/*
	UI
*/


function write_intro(done)
{
	function write_char(c, wait)
	{
		setTimeout(function() {
			$prompt.append(c);
		}, wait);
	}

	intro_text.forEach(function(e) {
		write_char(e.key, (intro_delay + e.time));
	});

	//report ready once the last animation frame has been triggered
	var t = (intro_delay + intro_text[intro_text.length - 1].time);
	setTimeout(done, t);
}

//automated key-pusher
function write_text(str)
{
	function write_char(c, wait)
	{
		setTimeout(function() {
			$text.text($text.text() + c);
			text_added(c);
		}, wait);
	}

	var total_time = 0;

	for(var i = 0; i < str.length; i++)
	{
		total_time += random_range(20, 300);
		write_char(str[i], total_time);
	}
}


function text_added(key)
{
	if(splitlist.test(key))
	{
		var buffer = $text.text().substring(last_split());
		var query = clean(buffer);

		if(query.length > 0)
		{
			var img = new Image();
			img.className = "loading";
			img.src = "loading.gif";
			$images.append(img);

			scroll_to_bottom();

			//query the image for the now-completed segment
			if(image_search)
				image_for_str(query, img);

			console.log(buffer + " --> " + query);

			//advance by storing this index as a segment split-point
			segments.push($text.text().length);
		}
	}
}

function text_removed()
{
	//if we just deleted a split point, pop it
	if($text.text().length < last_split())
	{
		if(segments.length > 1)
		{
			segments.pop();
			$images.children().last().remove();
		}
	}
}


function on_key(e)
{
	var t = $text.text();

	if((e.keyCode == 0) &&
	   (e.ctrlKey == false) &&
	   (e.altKey == false)) //normal keys
	{
		e.preventDefault();

		if((e.key == ' ') && (t[t.length - 1] == ' '))
			return; //prevent more than one space in a row (consistent with HTML)

		$text.text(t + e.key);

		text_added(e.key);
	}
	else if(e.keyCode == 8) //backspace
	{
		e.preventDefault(); //prevent backspace from doing page history

		if(e.ctrlKey) //because it's annoying when ctrl+backspace isn't implemented
			$text.text(t.substring(0, t.lastIndexOf(' ')));
		else
			$text.text(t.substring(0, t.length - 1));

		text_removed();
	}
}

$(function(e) {
	$prompt = $("#prompt");
	$text = $("#text");
	$images = $("#images");

	function main()
	{
		//finished animating the prompt, attach relevant event handlers
		window.onkeypress = on_key;
		//write_text(sample);
	}

	if(animations)
		write_intro(main);
	else
		main();
});
