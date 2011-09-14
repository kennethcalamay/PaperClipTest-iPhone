// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

//host
var host = 'http://localhost:3001';

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

var spinner = Ti.UI.createActivityIndicator({
	style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
	width : 'auto',
	height : 'auto'
});

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
	title : 'Photo',
	backgroundColor : '#fff'
});
var tab1 = Titanium.UI.createTab({
	icon : 'KS_nav_views.png',
	title : 'Show',
	window : win1
});

var label1 = Titanium.UI.createLabel({
	color : '#999',
	text : 'I am Window 1',
	font : {
		fontSize : 20,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : 'center',
	width : 'auto'
});

win1.add(label1);

//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({
	title : 'Photo Upload',
	backgroundColor : '#fff'
});
var tab2 = Titanium.UI.createTab({
	icon : 'KS_nav_ui.png',
	title : 'Upload',
	window : win2
});

var locationLabel = Titanium.UI.createLabel({
	color : '#999',
	text : 'Your Location:',
	font : {
		fontSize : 14,
		fontFamily : 'Helvetica Neue',
		fontWeight : 'bold'
	},
	textAlign : 'center',
	width : 100,
	left : 10,
	top : 10,
	height : 30
});

var locationData = Titanium.UI.createLabel({
	color : '#999',
	font : {
		fontSize : 14,
		fontFamily : 'Helvetica Neue'
	},
	textAlign : 'center',
	width : 200,
	top : 10,
	left : 120,
	height : 30
});

var photoButton = Titanium.UI.createButton({
	title : 'Select Photo',
	height : 50,
	top : 80,
	width : '90%'
});

var image;

var photoFrame = Titanium.UI.createImageView({
	width : 100,
	height : 100,
	top : 150
});

var descField = Titanium.UI.createTextField({
	hintText : 'Photo Description',
	height : 50,
	width : '95%',
	bottom : 60,
	borderColor : '#000'
});

var saveButton = Titanium.UI.createButton({
	title : 'Save',
	bottom : 10,
	height : 30,
	width : 50,
	right : 10
});

win2.add(locationLabel);
win2.add(locationData);
win2.add(photoButton);
win2.add(spinner);
win2.add(descField);
win2.add(saveButton);
//
//  add tabs
//
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);

// open tab group
tabGroup.open();

//actions
win2.addEventListener('focus', function() {
	spinner.show();
	locationData.text = 'location not found';
	if(Titanium.Geolocation.locationServicesEnabled) {
		Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.purpose = "User Current location,"

		Titanium.Geolocation.getCurrentPosition(function(e) {
			if(!e.success || e.error) {
				alert("Can't find current location");
				spinner.hide();
			} else {
				var longitude = e.coords.longitude;
				// var longitude = '-117.2403416';
				var latitude = e.coords.latitude;
				// var latitude = '33.1287888';

				Titanium.Geolocation.reverseGeocoder(latitude, longitude, function(e) {
					address = e.places[0].address;
					locationData.text = address;
					spinner.hide();
				});
			}
		});
	} else {
		Ti.API.warn('Geolocation turned off.');
		spinner.hide();
		alert('Geolocation turned off.');
	}
});

win2.addEventListener('click', function() {
	descField.blur();
});

photoButton.addEventListener('click', function() {
	Titanium.Media.openPhotoGallery({
		allowEditing : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
		success : saveImage
	});
});
var saveImage = function(event) {
	var cropRect = event.cropRect;
	image = event.media;
	photoFrame.image = image;
	win2.add(photoFrame);
	photoButton.title = 'Done';
}

saveButton.addEventListener('click', function() {
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onload = function(e) {
		alert('photo uploaded');
		tabGroup.setActiveTab(tab1);
	};
	xhr.open('POST', host + '/photos.json?photo[location]=' + locationData.text + '&photo[description]=' + descField.value);
	xhr.send({
		Filedata : image
	});
});
