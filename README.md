# Novel Scraper
A simple Node.js module for scraping novels from Webnovel.com, Fanmtl.com and more

# Installation
```
npm install novel-scraper
```

# Basic Documentation
Each function requires at least two parameters:
1. A link to chapter 1 of the novel.
2. The path where the novel will be saved locally.
3. "Optional" If you want to split the content into several txt files, the number is passed in KB.
3. The path to the Ublock folder, which is needed for bypassing site restrictions.

- fanmtl(), firenovel(), wtrlab() functions requires a third parameter:
You can download the Ublock folder from this link:
https://drive.google.com/drive/folders/1_bQ0g131S9xgkAfMhTJqjV1j-WAtWUw2?usp=drive_link

# Example
```
const { webnovel, fanmtl, fanfiction, firenovel, wtrlab } = require("novel-scraper");

// We define variables as parameters for functions.
const link = "httos://example/Chapter-1.com";   // Link to the first chapter of the novel to scrape
const path = "C:/Users/folder to save novel";   // Path to the folder where the novel will be saved, "/" is used by default
const Ublock = "C:/Users/folder of Ublock";     // Path to the folder where Ublock was downloaded ("It is downloaded from the Google Drive provided above")
const divide = 100;                             // If you want to split the result into multiple txt files, this sets a KB limit to split into several txts

// In all functions, the last parameter is optional, "divide". If you want the entire text in a single txt, do not include it.
await webnovel(link, path, divide) // Last parameter divide to split the content by size in KB


// Webnovel function
await webnovel(link, path)

// Fanfiction function
await fanfiction(link, path)

// Fanmtl function, this function *requires* Ublock to avoid errors
await fanmtl(link, path, Ublock)

// Firenovel function, this function *requires* Ublock to avoid errors
await firenovel(link, path, Ublock)

// Wtr-lab function, this function *requires* Ublock to avoid errors
await wtrlab(link, path, Ublock)
```

# Requirements
- Node.js
- Ublock folder required only for Fanmtl, Firenove, and Wtr-lab scraping