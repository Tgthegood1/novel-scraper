const { webnovel, fanmtl, fanfiction, firenovel, wtrlab } = require("./src/index.js")

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
