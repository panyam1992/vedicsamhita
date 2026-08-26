
const fs = require('fs');

// We will inject the logic to loop over days from 2028-01-01 to 2031-12-31 and track the masam name
// To do this, we can load panchangam-v18.js, stub out the window/document stuff, and use getLunarCalendar
// Actually, it's easier to just read the file and eval it, or use JSDOM. 
// But an even simpler way is to grep or modify the script to run standalone.

