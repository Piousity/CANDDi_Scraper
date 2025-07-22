const cheerio = require('cheerio'); // parsing html
const Knwl = require('knwl.js'); // for getting company info
const axios = require('axios'); // for https requests

const phonesFromHTML = [];
const addressesFromHTML = [];
const mediaLinksFromHTML = [];


// REGEX
const addressRegex = /(?:\b\d+\s+[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)*\s+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Way|Boulevard|Blvd\.?|Place|Pl\.?|Court|Ct\.?|Circle|Cir\.?|Parkway|Pkwy\.?|Terrace|Ter\.?|Square|Sq\.?)\b)|(?:\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b)/gi;
const phoneRegex = /(?:\+44\s?|\(?0)\d{3,5}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}/g;
const mediaRegex = /https?:\/\/(?:www\.)?(?:facebook\.com|instagram\.com|twitter\.com|x\.com|youtube\.com)\/[A-Za-z0-9_.-]+/gi;



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
    const emails = knwlInstance.get('emails'); // finding emails


    // run through all elements, exclude if it is script or style
    // ADDRESSES
    $('body').find('*').each((i, el) => {
      if ($(el).is('script, style')) return; // skip script & style tags

      const elText = $(el).text().trim();
      // ignore very short, empty text or text containing { or :
      if (elText.length < 10 || elText.includes('{') || elText.includes(':')) return;
      const match = elText.match(addressRegex);
      if (match) {
        addressesFromHTML.push(match[0].trim());
      }});
  

    // PHONES
    $('body').find('*').each((i, el) => {
      if ($(el).is('script, style')) return;

      const elText = $(el).text().trim();
      if (elText.length < 11 || elText.includes('#') || elText.includes(':') || elText.includes("'") || elText.length > 12) return;
      
      const matches = elText.match(phoneRegex);
      if (matches) {
        matches.forEach(phone => phonesFromHTML.push(phone.trim()));
      }
    });

    // MEDIA LINKS
    $('body').find('*').each((i, el) => {
      if ($(el).is('script, style')) return;

      // check text 
      const elText = $(el).text().trim();
      if (elText) {
        const textMatches = elText.match(mediaRegex);
        if (textMatches) {
          textMatches.forEach(link => mediaLinksFromHTML.push(link.trim()));
        }
      }

      // check href
      const href = $(el).attr('href');
      if (href) {
        const hrefMatches = href.match(mediaRegex);
        if (hrefMatches) {
          hrefMatches.forEach(link => mediaLinksFromHTML.push(link.trim()));
        }
      }
    });


    // remove duplicates
    const uniqueAddresses = [...new Set(addressesFromHTML)];
    const uniquePhones = [...new Set(phonesFromHTML)];
    const uniqueEmails = [...new Set(emails.map(e => e.address))];
    const uniqueMedia = [...new Set(mediaLinksFromHTML)];
  
    console.log("Phones:", uniquePhones);
    console.log("Emails:", uniqueEmails);
    console.log("Addresses/Postcodes:", uniqueAddresses);
    console.log("Social Media Links:", uniqueMedia);

  } catch (err) {
    console.error(`Failed to connect to ${url}`, err.response?.status || err.message);
  }
})();