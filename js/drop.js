// this adds a function to arrays that will let them
// be shuffled.
Array.prototype.shuffle = function() {
    var i = this.length,
        j, temp;
    if (i === 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

// this is the list of available tracks we have that can be played
var availableSounds = [
    'modem-dialing-01.mp3',
    'dial-up-modem-02.mp3',
    'modem-dialing-02.mp3',
    'R2 taking the comlink.mp3'
];

function infoSubmitted() {
    console.log('button clicked');
    $('#submitButton').prop('disabled', true);
    // fade out the input section, and fade in the progress bar
    $('#inputSection').fadeOut(1200);
    // this tells jquery to call the grabInfoAndStartProgressBar function
    // once the progress bar has faded in
    $('#progressBarSection').fadeIn(1200, grabInfoAndStartProgressBar);
}

// these variables are hoisted here so it can be accessed
// later on in the code
var audio;
var unit;
var base;

function grabInfoAndStartProgressBar() {
    // this pulls the info that's been typed in so we can then decrypt it
    ciphertext = $('#ciphertext').val();
    password = $('#password').val();

    startProgressBar();

    // this is here for "performance" reasons
    // (aka I think this will save a few milliseconds
    // somewhere in the process)
    decryptInfo(ciphertext, password);

    // let's play some interesting stuff!
    // we'll shuffle the list of available sources, then
    // pick the first one--this way we don't get the same 
    // tracks over and over
    availableSounds.shuffle();
    var firstTrack = availableSounds.shift();
    audio = new Audio('media/' + firstTrack);
    audio.play();
}

// this function updates the progress bar with random increments
function startProgressBar() {
    var width = 0;
    var i = setInterval(function() {
        width += Math.random() * 10;
        // width += 51;
        // no need to go past 100
        width = Math.min(width, 100);


        var bar = $('#progressBar');
        // actual width of the bar
        bar.css({ width: width + '%' });
        // this is relevant for user accessibility (think screenreaders and the like)
        bar.attr({ 'aria-valuenow': width });
        // change the text
        $('#percentageComplete').text(width.toFixed(0) + '%');

        // if we're 70% complete, make the progress bar red
        // for added drama
        if (width >= 70) {
            bar.addClass('red');
        }

        // if we've hit 100%, we're done updating the bar, so kick
        // off the next part of the process
        if (width == 100) {
            clearTimeout(i);
            prepForDisplay();
            audio.pause();
            return;
        }

        // skip ahead if we're that close. not functionally important
        if (width > 90) {
            width = 100;
        }

        // check to see if the audio has stopped. if so,
        // start up another track (but only if we have
        // sounds left to pick from)
        if (audio.ended) {
            if (availableSounds.length >= 0) {
                var nextTrack = availableSounds.shift();
                audio = new Audio('media/' + nextTrack);
                audio.play();
            }
        }

    }, 500);
}

// this will actually decrypt all the necessary info,
// and assign the results to the global variables (which
// are back towards the top of the file)
function decryptInfo(ciphertext, password) {
    base = "Maxwell Air Force Base";
    unit = "26th Network Operations Squadron";

    console.log(ciphertext);

    var deencodedJson = JSON.parse(ciphertext);
    console.log(deencodedJson);
    var decrypted = sjcl.decrypt(password, deencodedJson);
    console.log(decrypted);
    var parsed = sjcl.json.decode(decrypted);
    base = parsed.base;
    unit = parsed.unit;
}

function prepForDisplay() {
    $('#progressBarSection h1').text('DECRYPTED');
    $('#progressBarSection').animate({ top: '-30vh' }, 1500);
    $('#results').fadeIn(1500, displayTheInfo);
}

function displayTheInfo() {
    putText('#base', base, 0, 250);
    putText('#unit', unit, 0, 250);
}

// displays like a typewriter
function putText(target, message, index, interval) {
	var typingCharacter = '█';
    if (index < message.length) {
    	var current = $(target).text().substr(0, index);
		current += message[index++];
    	if( index <= message.length - 1) {
    		current += typingCharacter;
    	}
        $(target).text(current);
        // we use a random interval each time so it's a little
        // uneven
        var newInterval = Math.random() * 500;
        setTimeout(function() {
        	// this is what a recursive function looks like
        	// kind of, anyway
        	putText(target, message, index, newInterval);
        }, interval);
    }
}

function reset() {
    $('#progressBar').css({ width: '0%' });
}
