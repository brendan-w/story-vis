
"use strict";

//dev mode omits animations, 'cause they get annoying after a while... 
var dev_mode = true;

//elements
var $main;
var $prompt;
var $text;

//running vars
var segments = [0]; //indices of split points between text segments (not including 0)
var images = [];
var image_store = {}; //hashmap of string to images (prevents duplicate queries)


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
		if(word)
		{
			var word = words[i].replace(punctuation, "");
			if(!blacklist.test(word))
			{
				if(output.length > 0) output += " ";
				output += word;
			}
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

function image_for_str(str, done)
{
	if(image_store.hasOwnProperty(str))
	{
		//no AJAX query needed, we've done this before
		done(image_store[str]);
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
					var img = new Image();
					img.onload = function() { done(img); };
					img.src = data.d.results[0].Thumbnail.MediaUrl;
					image_store[str] = img; //save a ref, so we don't query twice
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

function on_segment()
{
	var i = last_split();
	var buffer = $text.text().substring(i);
	var c = clean(buffer);

	//query the image

	// console.log(buffer);
	// console.log(c);
}

function text_added(key)
{

	if(splitlist.test(key))
	{
		//placeholder element, will get overwritten upon img_loaded()
		images.push(null); 

		//query the image for the now-completed segment
		on_segment();
		log("added");

		//advance by storing this index as a segment split-point
		segments.push($text.text().length);
	}
}

function text_removed()
{
	log("removed");

	//if we just deleted a split point, pop it
	if($text.text().length < last_split())
	{
		if(images.length > 0)
		{
			segments.pop();
			var img = images.pop();
		}
	}
}


function on_key(e)
{
	var t = $text.text();

	if(e.keyCode == 0) //normal keys
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
	$main = $("#main");
	$prompt = $("#prompt");
	$text = $("#text");

	function main()
	{
		//finished animating the prompt, attach relevant event handlers
		window.onkeypress = on_key;
	}

	if(!dev_mode)
		write_intro(main);
	else
		main();

	// image_for_str("red car", function(data) {
	// 	console.log(data);
	// });
});
