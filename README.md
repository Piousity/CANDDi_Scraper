# CANDDi_Scraper
CANDDi Technical Task - for scraping a website taken from an email domain. ONLY picks up British phone numbers and postcodes.

# Technologies Used
- Javascript
- Node.js (JS runtime)
- Axios (for http requests)
- Cheerio (to find data like emails/phones)
- Regular Expression (for pattern matching)

# Installation
```bash 
git clone https://github.com/piousity/CANDDi_Scraper.git
cd CANDDI_Scraper
npm install
```

# Usage
```node scraper.js someone@example.com```
- You MUST input a valid email as an argument.

# Output
```bash
Successfully fetched https://example.com
Phones: [ '01111 111111` }
Emails: [ 'example@example.com' }
Addresses/Postcodes: [ '123 Example, M1 1OO' }
Social Media Links: Set { 'https://www.facebook.com/example.com' }
```

# Notes
Only works on static pages. Only picks up British phone numbers
