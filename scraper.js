const cheerio = require('cheerio'); // parsing html
const Knwl = require('knwl.js'); // for getting company info
const axios = require('axios'); // for https requests

// User inputs email, then the email has input validation and checks if it includes '@'
const emailInput = process.argv[2];
if (!emailInput || !emailInput.includes('@')) {
  console.error("Please provide a valid email address");
  process.exit(1);
}

const website = emailInput.split('@')[1]; // extracting email domain
const url = `https://${website}`; // creating url using email domain - can be switched to http if needed

// asynchronous function to allow await
(async function host() {
  try {
    const res = await axios.get(url, { // waits for a response form webpage
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // header to mimic a real user's activity, and so the website authorises the HTTPS request
      },
      timeout: 5000 // 5 second time to prevent scraper from continuing endlessly if a website has a slow response
    });
    console.log(`Successfully fetched ${url}`);

    const $ = cheerio.load(res.data); // receiving the data and parsing it
    const text = $('body').text(); // extracts all plain text from the body tag

    const knwlInstance = new Knwl('english'); // setting language as English
    knwlInstance.init(text); // scans page for common info types (phone, email, etc)

    // Extract arrays of detected info using Knwl
    const emails = knwlInstance.get('emails');
    const phones = knwlInstance.get('phones');
    //const addresses = knwlInstance.get('places');
    

    const addressesFromHTML = [];

    // extract addresses from <address> tags
    $('address').each((i, el) => {
      addressesFromHTML.push($(el).text().trim());
    });

    // run through all elements, exlude if it is script or style
    $('body').find('*').each((i, el) => {
      if ($(el).is('script, style')) return; // skip script & style tags

      const elText = $(el).text().trim();

      // ignore very short, empty text or text containing { or :
      if (elText.length < 10 || elText.includes('{') || elText.includes(':')) return;

      // pattern for addresses
      const addressPattern = /\b\d+\s+[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)*\s+(Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Way|Boulevard|Blvd\.?|Place|Pl\.?|Court|Ct\.?|Circle|Cir\.?|Parkway|Pkwy\.?|Terrace|Ter\.?|Square|Sq\.?)\b[^\n,]*/i;


      const match = elText.match(addressPattern);

      if (match) {
        addressesFromHTML.push(match[0].trim());
      }
    });

    // remove duplicates
    const uniqueAddresses = [...new Set(addressesFromHTML)];
    const uniqueEmails = [...new Set(emails.map(e => e.address))];
    const uniquePhones = [...new Set(phones.map(p => phone))];

    console.log("Phones:", uniquePhones);
    console.log("Emails:", uniqueEmails);
    console.log("Addresses:", uniqueAddresses);

  } catch (err) {
    console.error(`Failed to connect to ${url}`, err.response?.status || err.message);
  }
})();
