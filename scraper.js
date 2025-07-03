const cheerio = require('cheerio'); // parsing html
const Knwl = require('knwl.js'); // for getting company info
const axios = require('axios'); // for https requests

// user inputs email, then the email has input validation and checks if it includes @
const emailInput = process.argv[2];
if (!emailInput || !emailInput.includes('@')) {
  console.error("Please provide a valid email address");
  process.exit(1);
}

const website = emailInput.split('@')[1]; // extracting email domain
const url = `https://${website}`; // creating url using email domain

// anonymous function to load the webpage
axios.get(url).then(res => {
  const $ = cheerio.load(res.data); // receiving the data and parsing it
  const text = $('body').text(); // extracts all plain text from the body tag

  const knwlInstance = new Knwl('english'); // setting language as english for HTML
  knwlInstance.init(text); // scans page for common info types (phone, email, etc)

  // company details
  const emails = knwlInstance.get('emails');
  const addresses = knwlInstance.get('places');
  const phones = knwlInstance.get('phones');

  // mapping information found as a dictionary / output
  console.log("Phones:", phones.map(p => p.phone));
  console.log("Emails:", emails.map(e => e.address));
  console.log("Addresses:", addresses.map(a => a.place));

}).catch(err => {
  console.error('Error fetching site', err.message);
});
