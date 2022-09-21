/* ----------------------------

	Project:	Symphonius
	Version:	1.1.0
	Author:     Nika Vasilyeva
	Website:    http://themeforest.net/user/the-nika/

-------------------------------

	Table of Contents:

	01. Preloader
	02. Add Class on Touch Devices
	03. Top Panel Show/Hide
	04. Navigation Scrollspy
	05. Hide Offcanvas Navigation by Click to Link
	06. Intro Title Modification
	07. Audio Player
	08. Video Player
	09. Video and News Slider Controls Stick to Window Width
	10. Form Validation

---------------------------- */

'use strict';

	/* ----------------------------

		01. Preloader

	---------------------------- */

function hidePreloader(){
	jQuery(document).ready(function($) {
		$('.preloader').delay(1000).fadeOut(500);
		setTimeout(function(){
			$('body.loading').removeClass('loading');
		}, 1000);
	});
}
window.addEventListener('load', hidePreloader, false);

	/* ----------------------------

		End Preloader

	---------------------------- */


// Start Manipulations When JQuery is Ready
jQuery(document).ready(function($) {
	const breakpoint = {
		s: 640,
		m: 960,
		l: 1200,
		xl: 1600
	};
	var wnd = $(window),
		isTouch = 'ontouchstart' in window;


	/* ----------------------------

		02. Add Class on Touch Devices

	---------------------------- */

	if (isTouch) {
		$('body').addClass('is-touch');
	}


	/* ----------------------------

		03. Top Panel Show/Hide

	---------------------------- */

	var panelHidden = false;
	wnd.on('load scroll resize', function() {
		if (wnd[0].innerWidth >= breakpoint.m) {
			if (wnd.scrollTop() > wnd[0].innerHeight) {
				if (!panelHidden) {
					$('.panel').fadeIn();
					panelHidden = true;
				} else {
					panelHidden = false;
				}
			} else {
				if (!panelHidden) {
					$('.panel').fadeOut();
					panelHidden = true;
				} else {
					panelHidden = false;
				}
			}
		} else {
			if (!panelHidden){
				$('.panel').fadeIn();
				panelHidden = true;
			} else {
				panelHidden = false;
			}
		}
	});


	/* ----------------------------

		04. Navigation Scrollspy

	---------------------------- */

	UIkit.scrollspyNav('.js-scrollspy-nav', {
		closest: 'li',
		scroll: true,
		offset: (wnd[0].innerWidth >= breakpoint.m) ? 80 : 20
	});


	/* ----------------------------

		05. Hide Offcanvas Navigation by Click to Link

	---------------------------- */

	$('.js-offcanvas-nav').on('click', 'a', function() {
		UIkit.offcanvas('#offcanvas-nav').hide();
	});


	/* ----------------------------

		06. Intro Title Modification

	---------------------------- */

	if ($('.js-intro-title').length){
		var slide = $('.uk-slideshow-items li'),
			title = slide.find('.js-intro-title'),
			words = '',
			title_new = '';
		for (var i = 0; i < title.length; i++){
			words = title.eq(i).text().split(' ');
			for (var j = 0; j < words.length; j++)
				title_new += '<span>'+words[j]+'</span>';
			title.eq(i).after(title_new);
			title_new = '';
		}
	}


	/* ----------------------------

		07. Audio Player

	---------------------------- */

	// Start Work with Audio
	var audio_player = null,
		track_index = 0,
		current_audio = $('.js-audio'),
		albums = $('.albums--list .albums__item'),
		panel_play = $('.js-panel-play'),
		audio_play = $('.js-audio-play'),
		audio_volume = $('.js-audio-volume, .js-panel-volume');

	// Scroll to Tracklist When Click Album
	UIkit.util.on('.playlist__wrap .uk-switcher', 'show', function() {
		$('html, body').animate({ 
			'scrollTop': $('.music').offset().top - ((wnd[0].innerWidth >= breakpoint.m) ? 80 : 20) 
		}, 500);
	});

	// Set Audio Duration
	function getDuration(src, cb) {
		var audio = new Audio();
		audio.preload = 'metadata';
		$(audio).on('loadedmetadata', function(){
			cb(audio.duration);
		});
		audio.src = src;
	}
	function readableDuration(seconds) {
		var sec = Math.floor( seconds ),
			min = Math.floor( sec / 60 );
		min = min >= 10 ? min : '0' + min;    
		sec = Math.floor( sec % 60 );
		sec = sec >= 10 ? sec : '0' + sec;    
		return min + ':' + sec;
	}

	// Set First Track for Player
	current_audio.attr('src', $('.js-audio-items .list__item').eq(0).data('audio') );
	// Initialize MediaElement.js
	current_audio.mediaelementplayer({
		startVolume: 1,
		features: [],
		success: function(mediaElement, originalNode, instance) {
			audio_player = mediaElement;
			var showCurrentTime = null,
				current = $('.list__item--active'),
				currentSrc = current.data('audio');
			// Audio Playing Event
			mediaElement.addEventListener('playing', function() {
				var cur_time = mediaElement.getCurrentTime();
				if (cur_time < 1)
					$('.list__item--active .js-audio-time').text( readableDuration( cur_time ) );
				else
					$('.list__item--active .js-audio-time').text( readableDuration( cur_time+1 ) );
				showCurrentTime = setInterval(function(){
					if (mediaElement.getCurrentTime() > mediaElement.duration)
						clearInterval(showCurrentTime);
					$('.list__item--active .js-audio-time').text( readableDuration( mediaElement.getCurrentTime()+1 ) );
				}, 1000);
				var index = $('.list__item--active').parents('.playlist').index();
				albums.removeClass('albums--playing').eq(index).addClass('albums--playing');
				setTimeout(function(){
					albums.removeClass('albums--paused');
					if (panel_play.hasClass('icon--play'))
						panel_play.removeClass('icon--play').addClass('icon--pause');
				}, 100);
			}, true);
			// Audio Pause Event
			mediaElement.addEventListener('pause', function() {
				clearInterval(showCurrentTime);
				$('.albums--playing').addClass('albums--paused');
				if (panel_play.hasClass('icon--pause'))
					panel_play.removeClass('icon--pause').addClass('icon--play');
			});
			// Audio Ended Event
			mediaElement.addEventListener('ended', function() {
				var current = $('.list__item--active'),
					next = current.next();
				clearInterval(showCurrentTime);
				current.find('.js-audio-play, .js-panel-play').removeClass('icon--pause').addClass('icon--play');
				$('.list__item').removeClass('list__item--active');
				albums.removeClass('albums--playing');
				current.find('.js-audio-time').text('');
				if (next.length != 0){
					audio_player.setSrc(next.data('audio'));
					audio_player.play();
					next.addClass('list__item--active');
					next.find('.js-audio-play').removeClass('icon--play').addClass('icon--pause');
				}
			}, true);
		},
		// Audio Loading Event
		error: function() {
			UIkit.modal.dialog('<p class="uk-modal-body c-dark">Error of audio file</p>');
		}
	});
	if (audio_player) {
		// Top Panel Play-Pause Control Settings
		panel_play.on('click', function(e) {
			e.preventDefault();
			var btn = $(this);
			if (audio_player.paused){
				if ($('.list__item').hasClass('list__item--active')) {
					$('.list__item--active .js-audio-play').removeClass('icon--play').addClass('icon--pause');
				} else {
					$('.list__item').eq(0).find('.js-audio-play').removeClass('icon--play').addClass('icon--pause');
				}
				btn.removeClass('icon--play').addClass('icon--pause');
				$('.list__item--active .icon--play').removeClass('icon--play').addClass('icon--pause');
				audio_player.play();
				if (!$('.js-audio-items .list__item').hasClass('list__item--active'))
					$('.js-audio-items .list__item').eq(0).addClass('list__item--active');
			} else {
				btn.removeClass('icon--pause').addClass('icon--play');
				$('.js-audio-play.icon--pause').removeClass('icon--pause').addClass('icon--play');
				audio_player.pause();
			}
		});
		// Audio Play-Pause Control Settings
		audio_play.on('click', function(e) {
			e.preventDefault();
			var btn = $(this),
				prev = $('.list__item--active'),
				current = btn.parent('.list__item'),
				currentSrc = current.data('audio');
			$('.list__item').removeClass('list__item--active');
			current.addClass('list__item--active');
			if (audio_player.paused){
				if (current_audio.attr('src') !== currentSrc){
					prev.find('.js-audio-time').text('');
					audio_player.setSrc(currentSrc);
				}
				btn.add(panel_play).removeClass('icon--play').addClass('icon--pause');
				audio_player.play();			
			} else {
				$('.js-audio-play.icon--pause').add(panel_play).removeClass('icon--pause').addClass('icon--play');
				audio_player.pause();
				if (current_audio.attr('src') !== currentSrc) {
					prev.find('.js-audio-time').text('');
					audio_player.setSrc(currentSrc);
					btn.add(panel_play).removeClass('icon--play').addClass('icon--pause');
					audio_player.play();
					$('.list__item--active').removeClass('list__item--active');
					current.addClass('list__item--active');
				}
			}
		});
		// Top Panel Volume Control Settings
		function setPanelVolume(e) {
			var target_elem = $(e.target),
				btn = target_elem.hasClass('mejs__horizontal-volume-total') ? target_elem : (target_elem.hasClass('mejs__horizontal-volume-slider') ? target_elem.find('.mejs__horizontal-volume-total') : target_elem.parents('.mejs__horizontal-volume-slider').find('.mejs__horizontal-volume-total')),
				width = btn.width(),
				offset = btn.offset(),
				offsetX = (typeof e.pageX !== 'undefined') ? e.pageX - offset.left : 0,
				volume = offsetX / width;
			$('.mejs__horizontal-volume-current').css({
				left: 0,
				width: (volume * 100) + '%',
			});
			audio_player.setVolume(volume);
		}
		audio_volume
			.on('mousedown', function(e) {
				window.panelVolumeSlide = $(this).on('mousemove', { e: event }, setPanelVolume);
			})
			.on('mouseup', function() {
				if (typeof panelVolumeSlide !== 'undefined')
					panelVolumeSlide.off('mousemove');
			})
			.on('mouseleave', function() {
				if (typeof panelVolumeSlide !== 'undefined')
					panelVolumeSlide.off('mousemove');
			})
			.on('click', { e: event }, setPanelVolume);
	} else {
		UIkit.modal.dialog('<p class="uk-modal-body c-dark">Error of audio file</p>');
	}


	/* ----------------------------

		08. Video Player

	---------------------------- */

	// Create Modal Window with Video Created by Target Link
	function openVideoModal(e) {
		e.preventDefault();
		$('.modal__video video').remove();
		var video_src = $(this).data('video-src'),
			video_type = $(this).data('video-type');
		$('.modal__video').append('<video controls preload="auto"><source src="" type=""></video>');
		$('.modal__video source').attr({
			src: video_src,
			type: video_type
		});
		UIkit.modal('#modal-video').show();

		// Initialize MediaElement.js
		$('.modal__video video').mediaelementplayer({
			startVolume: 1,
			alwaysShowControls: true,
			stretching: 'responsive',
			videoVolume: 'horizontal',
			iconSprite: '../img/icons/play.svg',
			success: function(mediaElement, originalNode, instance) {
				if (!audio_player.paused)
					audio_player.pause();
				mediaElement.play();
			},
			// Video Loading Event
			error: function(a, b, c) {
				UIkit.modal.dialog('<p class="uk-modal-body c-dark">Error of video file</p>');
			}
		});
	}
	UIkit.util.on('#modal-video', 'hidden', function() {
		// Destroy Video Container when Modal Window Hidden
		$('#modal-video .mejs__video').remove();
	});

	// Video Slider Adaptation
	var videoInColumn = 3;
	function rebuildVideo() {
		function rebuild(n){
			var vslider = $('.js-video-slider'),
				vcol = vslider.find('.video__column:not(:first-child)'),
				vvid = vcol.find('.video__placeholder'),
				newvgrid = '';
			vvid.each(function(index, el) {
				if (index == 0)
					newvgrid += '<li class="video__column">';
				newvgrid += el.outerHTML;
				if (((index+1) % n == 0)){
				newvgrid += '</li><li class="video__column">';
				}
				if (index == vvid.length)
					newvgrid += '</li>';
			});
			vcol.remove();
			vslider.find('.uk-slider-items').append(newvgrid);
			$('.js-video-target').off('click', openVideoModal);
			$('.js-video-target').on('click', openVideoModal);
		}
		// set 1 video in column
		if (wnd[0].innerWidth < 767) {
			if (videoInColumn != 1){
				rebuild(1);
				videoInColumn = 1;
			}
		}
		// set 2 video in column
		else if (wnd[0].innerWidth >= 768 && wnd[0].innerWidth < breakpoint.l) {
			if (videoInColumn != 2){
				rebuild(2);
				videoInColumn = 2;
			}
		}
		// set 3 video in column
		else {
			if (videoInColumn != 3){
				rebuild(3);
				videoInColumn = 3;
			}
		}
		$('.js-video-target').off('click', openVideoModal);
		$('.js-video-target').on('click', openVideoModal);
	}
	rebuildVideo();
	wnd.on('resize', rebuildVideo);


	/* ----------------------------

		09. Video and News Slider Controls Stick to Window Width

	---------------------------- */

	function stickControls() {
		$('.video, .news').each(function(index, el) {
			var slider = $(el).find('.uk-slider'),
				next = $(el).find('.uk-slidenav-next'),
				prev = $(el).find('.uk-slidenav-previous');
			if (wnd[0].innerWidth >= 1920) {
				var translate = (wnd[0].innerWidth - slider.innerWidth()) / 2;
				next.css('right', (next.width() - translate));
				prev.css('left', (prev.width() - translate));
			} else {
				next.css('right', 0);
				prev.css('left', 0);
			}
		});
	}
	stickControls();
	wnd.on('resize', stickControls);


	/* ----------------------------

		10. Form Validation

	---------------------------- */

	function subForm(f){
		var $form = f,
			hasErrors = false,
			msg = {
				success: 'Your message was successfully sent!',
				fail: 'Can not send message, mail server configutation bug, please try again later',
				empty: 'Please enter fields and try again',
				error: 'Please enter require field(s)',
				unknown: 'Unknown error'
			},
			$respond = '';

		$form.find('input:not([type="submit"]), textarea').each(function(index, el) {
			var field = $(this);
			if (field.attr('data-require') !== undefined && field.attr('data-require') === 'true' && field.val() === ''){
				$respond = msg.error;
				field.addClass('js-field-error');
				hasErrors = true;
			}
		});

		if (!hasErrors) {
			$.post('mail.php', $form.serialize(), function(data){
				if (data === 'success') 
					$respond = msg.success;
				else if (data === 'fail')
					$respond = msg.fail;
				else if (data === 'empty')
					$respond = msg.empty;
				else
					$respond = msg.unknown;
				$form.find('.js-respond').text( $respond );
			}).fail(function(response) {
				console.error(response);
				UIkit.modal.dialog('<p class="uk-modal-body c-dark">'+msg.unknown+'</p>');
			});
		}
		$form.find('.js-respond').text( $respond );
		return false;
	};

	$('.js-form').submit(function(){
		subForm($(this)); 
		return false;
	});

	$('.js-form').find('input:not([type="submit"]), textarea').bind('change paste keyup', function(){ 
		var field = $(this),
			respondBlock = field.parents('.js-form').find('.js-respond');
		if ($(this).hasClass('js-field-error')) 
			$(this).removeClass('js-field-error');
		if (respondBlock.text() !== '')
			respondBlock.text('');
	});

});