
"use strict";

//dev mode omits animations, 'cause they get annoying after a while... 
var dev_mode = true;

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


/*
	Buffer Operations
*/

function last_split()
{
	return segments[segments.length - 1];
}

function clean(str)
{
	var words = clean_array(str.split(' '));
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
		var t = dev_mode ? 0 : (intro_delay + e.time);
		write_char(e.key, (intro_delay + e.time));
	});

	//report ready once the last animation frame has been triggered
	var t = (intro_delay + intro_text[intro_text.length - 1].time);
	setTimeout(done, t);
}

function log(msg)
{
	console.log(msg);
	console.log(segments);
	console.log(images);
}

function text_added(key)
{
	if(splitlist.test(key))
	{
		var start_i = last_split();
		var end_i = $text.text().length;
		var buffer = $text.text().substring(start_i);
		var query = clean(buffer);

		var img = new Image();
		$images.append(img);

		//query the image for the now-completed segment
		image_for_str(query, img);

		console.log(buffer + " --> " + query);
		// log("added");

		//advance by storing this index as a segment split-point
		segments.push(end_i);
	}
}

function text_removed()
{
	//if we just deleted a split point, pop it
	if($text.text().length < last_split())
	{
		if(segments.length > 1)
		{
			// log("removed");
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
	}

	if(!dev_mode)
		write_intro(main);
	else
		main();
});
