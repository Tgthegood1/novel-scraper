let { connect } = require("puppeteer-real-browser");
let path = require("path")
let fs = require('fs');
let { divide_text_by_size, eliminate_tgthegood, sleep_seconds, sleep_miliseconds, support_message, text_kb_size } = require("./Modules.js");

function default_path(){
    return __dirname;
}
function path_sanitize(inputPath) {
let sanitized = inputPath.replace(/\//g, '/');
  sanitized = path.normalize(sanitized);
  if (!fs.existsSync(sanitized)) {
    throw new Error(`The path does not Exist: ${sanitized}, Example C:/user/pathToNovel`);
  }
  return sanitized;
}
function save_text(book, path_novel, name_novel, divide_text, tgthegood) {
    try {
        if(divide_text == 0){
            let final_path = path.join(path_novel, `${name_novel}.txt`);
            book = eliminate_tgthegood(book);
            fs.writeFileSync(final_path, book, "utf-8");
            console.log(`${name_novel} was correctly scanned on ${final_path}`);
        } else {
            let book_divided = divide_text_by_size(book, divide_text, tgthegood);
            let i = 1;
            for (const chunk of book_divided){
                let final_path = path.join(path_novel, `${name_novel} ${i}.txt`)
                fs.writeFileSync(final_path, chunk, "utf-8");
                i+=1;
                console.log(`${name_novel} was correctly scanned on ${final_path}`);
            }
        }
    } catch (error) {
        console.error(`${name_novel} failed, reason not found`);
    }
}
async function cloudflare_wait(page, selector) {
    while (true){
        let flag = await page.$(selector)
        if(flag){
            await sleep_seconds(1);
            break;
        }
        await sleep_seconds(2)
    }
}
async function captcha_cloudflare_wait(page, parametro) {
    while(true){
        alert_cloudflare_p = await page.evaluate((parametro) => {
            let el = document.querySelector(parametro);
            return el
                ? el.textContent
                    .trim()
                    .replace(/[*?"<>|:/\\]/g, '')
                : "Aproved";
        }, parametro);

        if(alert_cloudflare_p == "We've detected unusual reading activity from your IP address. Please complete the challenge below to continue reading."){
            console.log("Await for Cloudflare...")
            await page.evaluate(() => {
            window.__bloqueoDeClicks = true;

            document.addEventListener('click', (e) => {
                if (window.__bloqueoDeClicks) {
                e.stopImmediatePropagation();
                e.preventDefault();
                }
            }, true);
            });

            await sleep_seconds(15)
            await page.evaluate(() => {
            window.__bloqueoDeClicks = false;
            });
        } else{
            break;
        }
    }
}

//Webnovel Async Functions only for Webnovel
async function webnovel_scroll(page, parrafosSelector, paragraph_loading) {
    let prevParrafosCount = 0;
    let parrafosLoaded = true;
    let lastScrollTime = Date.now();

    while (parrafosLoaded) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight*2);
        });

        await sleep_miliseconds(200);
        if (paragraph_loading) {
        const progressText = await page.evaluate(selector => {
            const el = document.querySelector(selector);
            return el?.textContent?.trim() || null;
        }, paragraph_loading);
        if (progressText) {
            process.stdout.write(`\rProgress: ${progressText}`);
        };
        };

        if (Date.now() - lastScrollTime >= 30000) {
            const newParrafosCount = await page.evaluate(parrafosSelector => {
                const parrafos = document.querySelectorAll(parrafosSelector);
                return parrafos.length;
            }, parrafosSelector);

            if (newParrafosCount == prevParrafosCount) {
                parrafosLoaded = false;
            } else {
                prevParrafosCount = newParrafosCount;
            }
            lastScrollTime = Date.now();
        }
    }
}
//Webnovel Async Functions only for Webnovel


//Init functions for novel scrapping
async function webnovel(link=false, path_novel=default_path(), divide_text=0, tgthegood) {
    support_message()
    path_sanitize(path_novel)
    if(!link){throw new Error("You need to provide a valid Webnovel link")}

    const { browser, page } = await connect({
        headless: false,
        protocolTimeout: 120000,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    });
    page.setDefaultNavigationTimeout(0);
    await page.goto(link, {waitUntil:"load"});
    await page.waitForSelector(".cha-page-in")

    let name_novel = await page.evaluate(() => {
        let el = document.querySelector("header.cha-header span.cha-hd-mn-text a");
        return el
            ? el.textContent
                .trim()
                .replace(/[*?"<>|:/\\]/g, '')
                .replace(/[\u0000-\u001F]/g, '')
            : "Title was not Found";
    });

    //Selectors in the novel
    let paragraph_selector = '.cha-page-in p:not(.creators-thought)';
    let paragraph_loading = "strong.cha-hd-progress.j_progress.fr"
    if(!paragraph_selector){throw new Error("Selector was not Found, please contact with Tgthegood")};

    await webnovel_scroll(page, paragraph_selector, paragraph_loading);

    let content_webnovel = await page.evaluate(() => {
        let container = document.querySelector('.cha-page-in');
        if (!container) return null;

        let elements = container.querySelectorAll('.cha-page-in h1,.cha-page-in p:not(.creators-thought)');
        let content = '';

        elements.forEach(el => {
            let text = el.textContent?.trim();
            if (!text) return;

            text = text.replace(/[^\x09\x0A\x0D\x20-\x7E¡-ÿ\u00A0-\uFFFF]/g, '');

            if (el.tagName.toLowerCase() === 'h1') {
                content += 'Tgthegood\n';
            }

            content += `${text}\n`;
        });

        return content;
    });
    if (!content_webnovel) {
        throw new Error("Content was not Found, please contact with Tgthegood");
    }

    console.log("\n\nWaiting for confirmation...");

    save_text(content_webnovel, path_novel, name_novel, divide_text, tgthegood);
    await browser.close();
};

//Fanfiction
async function fanfiction(link=false, path_novel=default_path(), divide_text=0, tgthegood) {
    support_message()
    path_sanitize(path_novel)
    if(!link){throw new Error("You need to provide a valid fanfiction link")}

    const { browser, page } = await connect({
        headless: false,
        protocolTimeout: 120000,
        args: [],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    });

    await page.goto(link);

    let name_novel;
    let content_fanfiction = ""

    while(true){
        await cloudflare_wait(page, "#storytext");

        name_novel = await page.evaluate(() => {
            let el = document.querySelector("#profile_top b.xcontrast_txt");
            return el
                ? el.textContent
                    .trim()
                    .replace(/[*?"<>|:/\\]/g, '')
                : "Title was not Found";
        });

        const content = await page.$$("#storytext p");
        const texts = await Promise.all(content.map(p => page.evaluate(el => el.innerText, p)));

        const full_chapter = '\n' + "Tgthegood" + texts.join('\n');
        content_fanfiction+=full_chapter;

        const buttonTexts = await page.$$eval("div button.btn", buttons =>
            buttons.map(btn => btn.innerText)
        );
        const indexNext = buttonTexts.findIndex(text => text.includes("Next"));
        if (indexNext !== -1) {
            const buttons = await page.$$("div button.btn");
            await Promise.all([
                buttons[indexNext].click(),
                page.waitForNavigation({ waitUntil: "domcontentloaded" })
            ]);
        } else{
            break;
        }
    }

    save_text(content_fanfiction, path_novel, name_novel, divide_text, tgthegood);
    await browser.close();
};

//Init FanMtl functions
async function fanmtl(link=false, path_novel=default_path(), ublock=false, divide_text=0, tgthegood) {
    support_message()
    path_sanitize(path_novel)
    if(!link){throw new Error("You need to provide a valid FanMtl link")}
    if(!ublock){throw new Error("You need to provide a valid Ublock Origin Path, Example C:/user/pathUblock")}

    const { browser, page } = await connect({
        headless: false,
        protocolTimeout: 120000,
        args: [
            '--disable-extensions-except=' + ublock,
            '--load-extension=' + ublock,
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    });

    await page.goto(link, {waitUntil:"load"});

    let name_novel = await page.evaluate(() => {
        let el = document.querySelector("div.content-wrap div.titles h1 a");
        return el
            ? el.getAttribute("title")
                .trim()
                .replace(/[*?"<>|:/\\]/g, '')
            : "Title was not Found";
    });

    let content_fanmtl = ""
    let i = 1
    while(true){
        let chapter_selector = await page.$(".chapter-content");

        if(chapter_selector){
            let chapter_content = await page.evaluate(() => {
                let content = document.querySelector(".chapter-content");
                if (!content) return '';

                let chapter_trash = content.querySelectorAll("script, div, iframe, .ob-smartfeed-wrapper");
                chapter_trash.forEach(a => a.remove());

                let chapter_elements = Array.from(content.querySelectorAll("p"));
                let chapter_sanitize = chapter_elements.filter(el => el.textContent.trim().length > 0);

                if (chapter_sanitize.length > 0) {
                    let chapter_set = new Set(chapter_sanitize.map(el => el.textContent.trim()));
                    return Array.from(chapter_set).join("\n");
                } else {
                    let chapter_alternative = content.innerHTML.replace(/<br\s*\/?>/gi, '\n').trim();
                    return chapter_alternative;
                }
            });
            content_fanmtl += 'Tgthegood\n'+chapter_content+'\n';
            process.stdout.write(`\rChapter: ${i} Obtained`);
            i+=1

            let chapter_next_button = await page.$(".nextchap");
                if (chapter_next_button) {
                    let click_succes = false;
                    for (let attempt = 0; attempt < 5; attempt++) {
                        try {
                            await Promise.all([
                                chapter_next_button.click(),
                                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 })
                            ]);
                            await sleep_seconds(1)
                            click_succes = true;
                            break;
                        } catch (error) {}
                    }
                    if (!click_succes) {
                        break;
                    }
                } else {break}
        }
    }

    console.log("\n\nWaiting for confirmation...");
    save_text(content_fanmtl, path_novel, name_novel, divide_text, tgthegood);
    await browser.close();
}

//Init Firenovel
async function firenovel(link=false, path_novel=default_path(), ublock=false, divide_text=0, tgthegood) {
    support_message();
    path_sanitize(path_novel);
    if(!link){throw new Error("You need to provide a valid fanfiction link")}

    const { browser, page } = await connect({
        headless: false,
        protocolTimeout: 120000,
        args: [
            '--disable-extensions-except=' + ublock,
            '--load-extension=' + ublock,
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    });

    await page.goto(link, {waitUntil:"load"});
    page.setDefaultNavigationTimeout(0);
    let content_firenovel = ""
    let name_novel = await page.evaluate(() => {
        let el = document.querySelector("a.booktitle");
        return el
            ? el.textContent
                .trim()
                .replace(/[*?"<>|:/\\]/g, '')
            : "Title was not Found";
    });
    let i = 1

    while(true){
        const content = await page.$$("#chapter-article div.titles span.chapter-title, #chapter-article #content p");
        const text = await Promise.all(content.map(p => page.evaluate(el => el.innerText.trim(), p)));
        const full_chapter = '\n' + "Tgthegood" + '\n' + `[Chapter ${i}]` +'\n' + text.join('\n') + '\n';
        content_firenovel+=full_chapter;

        while(true){
            try {
                await page.waitForSelector("a.button.nextchap", { timeout: 10000 });
                break;
            } catch (error) {
                await sleep_seconds(30);
                await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
            }
        }

        const button = await page.$("a.button.nextchap");
        const button_disabled = await page.evaluate((i)=>{
            return i.classList.contains("isDisabled")
        }, button);
        if(!button_disabled){
            await Promise.all([
                button.click(),
                page.waitForNavigation({ waitUntil: "domcontentloaded" })
            ])
        }else{
            break;
        }
        i+=1
    }

    console.log("\n\nWaiting for confirmation...");
    save_text(content_firenovel, path_novel, name_novel, divide_text, tgthegood);
    await browser.close();
}

//Init wtrlab
async function wtrlab(link=false, path_novel=default_path(), ublock=false, divide_text=0, tgthegood) {
    support_message();
    path_sanitize(path_novel);
    if(!link){throw new Error("You need to provide a valid fanfiction link")};
    if(!link.endsWith("?service=web")){link+"?service=web"};

    const { browser, page } = await connect({
        headless: false,
        protocolTimeout: 120000,
        args: [
            '--disable-extensions-except=' + ublock,
            '--load-extension=' + ublock,
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
    });

    await page.goto(link, { waitUntil: 'domcontentloaded' });
    page.setDefaultNavigationTimeout(0);
    await page.waitForSelector('[id^="chapter-"] .chapter-body p');

    let content_wtrlab = "";
    let break_bucle = false;
    let name_novel = await page.evaluate(() => {
        let el = document.querySelector("div.header ol.breadcrumb a");
        return el
            ? el.textContent
                .trim()
                .replace(/[*?"<>|:/\\]/g, '')
            : "Title was not Found";
    });
    let i = 1

    while(true){
        await captcha_cloudflare_wait(page, "div.text-center.card-body p.mb-4");

        const url = page.url();
        const match_url = url.match(/chap(?:ter)?[\/\-_]?(\d+)/i);
        if(i !== parseInt(match_url[1])){
            const pre_url = url.match(/^(.*\/chapter[-_\/]?)/i);
            const new_url= pre_url[1] + i + "?service=web";
            await page.goto(new_url, {waitUntil:"load"});
            await captcha_cloudflare_wait(page, "div.text-center.card-body p.mb-4");
        }

        const timeout = 10000;
        const start = Date.now();
        const reload = false;
        while (true) {
            let content = await page.$$('div.chapter-tracker.active [id^="chapter-"] h3 b, div.chapter-tracker.active [id^="chapter-"] .chapter-body p');
            let text = await Promise.all(content.map(p => page.evaluate(el => el.innerText.trim(), p)));
            let flag = text.join('\n');
            if (flag.includes("We've detected unusual reading activity from your IP address")) {
                reload=true;
                break;
            }
            if (text_kb_size(flag) >= 3) {
                break;
            }
            if (Date.now() - start > timeout) {
                break;
            }
            await new Promise(r => setTimeout(r, 100));
            await sleep_miliseconds(500);
        }
        if(reload){continue}

        let content = await page.$$('div.chapter-tracker.active  [id^="chapter-"] h3 b, div.chapter-tracker.active [id^="chapter-"] .chapter-body p');
        const text = await Promise.all(content.map(p => page.evaluate(el => el.innerText.trim(), p)));
        const full_chapter = '\n' + "Tgthegood" + '\n' + text.join('\n') + '\n';
        content_wtrlab+=full_chapter;

        while(true){
            try {
                await page.waitForSelector("div.tab-content button.btn", { timeout: 10000 });
                break;
            } catch (error) {
                await sleep_seconds(30);
                await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
            }
        }

        const buttons = await page.$$("div.tab-content button.btn");
        for (const button of buttons) {
            const { text, isDisabled } = await page.evaluate(el => ({
                text: el.textContent.trim(),
                isDisabled: el.hasAttribute('disabled')
            }), button);

            if (text.includes("Next")) {
                if (isDisabled) {
                    break_bucle = true
                } else {
                    await Promise.all([
                        button.click(),
                    ])
                    await captcha_cloudflare_wait(page, "div.text-center.card-body p.mb-4")
                }
                break;
            }
        }
        i+=1
        if(break_bucle){
            break;
        }
    }

    console.log("\n\nWaiting for confirmation...");
    save_text(content_wtrlab, path_novel, name_novel, divide_text, tgthegood);
    await browser.close();
}

module.exports = {
    webnovel,
    fanmtl,
    fanfiction,
    firenovel,
    wtrlab
};