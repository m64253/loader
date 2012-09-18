# LoaderJS
A javascript AND stylesheet loader nothing more, nothing less.

## Goal
Create a loader that is just a loader, not a module spec or dependency manager.
It should just be a loader, the other stuff can be added on later by 3rd party libs.

### Support
 * Internet Explorer (>= 6 +mobile -old winmob)
 * Opera (latest +mobile)
 * Firefox (latest +mobile)
 * Chrome (latest +mobile)
 * Safari (latest +ios)
 * Android Browser ()

## Usage
```
loader.js('file.js', function (err) {
	if (!err) {
		// File has been load without errors
	}
});

loader.css('file.css', function (err) {
	if (!err) {
		// File has been load without errors
	}
});
``
