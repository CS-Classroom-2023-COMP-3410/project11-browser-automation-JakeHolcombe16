const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    // 1. Read credentials
    const { username, password } = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: false, // set to true if you prefer headless mode
      defaultViewport: null
    });
    const page = await browser.newPage();

    // Helper function to wait (mimics page.waitForTimeout on old Puppeteer versions)
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 3. Log in to GitHub
    console.log("Navigating to GitHub login page...");
    await page.goto('https://github.com/login', { waitUntil: 'networkidle2' });
    
    console.log("Entering credentials...");
    await page.waitForSelector('#login_field');
    await page.type('#login_field', username);
    
    await page.waitForSelector('#password');
    await page.type('#password', password);
    
    console.log("Signing in...");
    await page.click('[name="commit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Successfully logged in!");

    // 4. Star the specified repositories
    const reposToStar = [
      'cheeriojs/cheerio',
      'axios/axios',
      'puppeteer/puppeteer'
    ];

    for (const repo of reposToStar) {
      console.log(`Starring repository: ${repo} ...`);
      await page.goto(`https://github.com/${repo}`, { waitUntil: 'networkidle2' });

      /* 
        We look for the button that has a <span> child containing the exact text "Star".
        (normalize-space() is used to handle extra whitespace.)
      */
      const starButtonXPath = '//button[.//span[normalize-space(.)="Star"]]';
      try {
        // If it's already starred, this XPath won't be found (the button typically reads "Unstar").
        await page.waitForXPath(starButtonXPath, { timeout: 5000 });
        const [starButton] = await page.$x(starButtonXPath);
        await starButton.click();
        console.log(`Starred: ${repo}`);
      } catch (err) {
        console.log(`${repo} is likely already starred or the selector failed. Skipping...`);
      }

      // Wait briefly to avoid rapid requests
      await wait(2000);
    }

    // 5. Create a new starred repository list (using your new <summary> markup)
    console.log('Creating a new starred list named "Node Libraries"...');

    // Navigate to your "Stars" page
    await page.goto(`https://github.com/${username}?tab=stars`, { waitUntil: 'networkidle2' });
    
    try {
      // Wait for the "Create list" summary. It's the button with class="btn-primary btn" and role="button"
      // Adjust the selector if needed. For example, if there's more than one summary.btn-primary.btn on the page,
      // you might need to be more specific or use XPath to match its text "Create list".
      await page.waitForSelector('summary.btn-primary.btn[role="button"]', { timeout: 5000 });
      
    //   // Click the summary to open the "Create list" dialog
    //   await page.click('summary.btn-primary.btn[role="button"]');
    //   await wait(1000);

    //   // Now a form or modal should appear to enter the new list name.
    //   // Inspect the page to find the correct selector for the text input.
    //   // Example (you'll need to verify the real selector):
    //   const listNameInputSelector = 'input[name="list_name"]';
    //   await page.waitForSelector(listNameInputSelector, { timeout: 5000 });
    //   await page.type(listNameInputSelector, 'Node Libraries');
    //   await wait(500);

    //   // Click a "Create" button. Adjust this selector if GitHub’s markup is different.
    //   // For instance, if there's a button with text "Create" or "Save", find its exact selector.
    //   const createButtonSelector = 'button.btn-primary[type="submit"]';
    //   await page.click(createButtonSelector);
    //   console.log('List "Node Libraries" created.');
    // This snippet assumes you've already navigated to your starred repos page
// and clicked the "Create list" <summary> element.
// Replace or integrate with your existing code as needed.

// If you're starting fresh at this step, be sure you're on the correct page:
// await page.goto(`https://github.com/${username}?tab=stars`, { waitUntil: 'networkidle2' });

// Wait for the "Create list" summary to appear and click it
await page.waitForSelector('summary.btn-primary.btn[role="button"]', { timeout: 5000 });
await page.click('summary.btn-primary.btn[role="button"]');

// Short pause to let the dropdown or modal open
await wait(1000);

// 1. Wait for the text input element
// Your HTML snippet shows: <input type="text" name="user_list[name]" ... >
const listNameInputSelector = 'input[name="user_list[name]"]';
await page.waitForSelector(listNameInputSelector, { timeout: 5000 });

// 2. Type your desired list name
await page.type(listNameInputSelector, 'Node Libraries');

// 3. Click the "Create" or "Save" button
// Inspect the DOM to confirm this button's selector. 
// It might be: button[type="submit"].btn-primary, or something similar.
await wait(1000);
// Wait for the button to appear:
const createButtonSelector = 'button.Button--primary.Button--medium.Button.Button--fullWidth.mt-2[type="submit"]';
await page.waitForSelector(createButtonSelector, { timeout: 5000 });

// If the button is initially disabled, wait for it to become enabled
await page.waitForFunction((sel) => {
  const btn = document.querySelector(sel);
  return btn && !btn.disabled;
}, { timeout: 5000 }, createButtonSelector);

// Click the button once it's enabled
await page.click(createButtonSelector);

// Optional: wait for GitHub to finish creating the list
await wait(1000);

console.log('List "Node Libraries" created.');


// Optional: wait a moment for GitHub to process creation
await wait(1000);

// If everything goes well, your list "Node Libraries" is now created.

    } catch (err) {
      console.log('It looks like "Node Libraries" list may already exist or the selector changed. Skipping creation step.');
    }

    // 6. Add the starred repositories to "Node Libraries" (same approach as before)
    // 6. Add a repository to "Node Libraries" by navigating via "Explore" -> "3 starred repositories" -> details dropdown -> checkbox
console.log("Step 6: Adding repository to 'Node Libraries' via the described navigation...");

try {
  // 1) Click "Explore repositories." link
  console.log("Clicking on 'Explore repositories.' link...");
  const exploreLinkSelector = 'a.Link--inTextBlock[href="/explore"]';
  await page.waitForSelector(exploreLinkSelector, { timeout: 5000 });
  await page.click(exploreLinkSelector);
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // 2) On the Explore page, click "3 starred repositories" link
  console.log("Clicking on '3 starred repositories' link...");
  const starredReposLinkSelector = 'a.h4[href="/stars"]';
  await page.waitForSelector(starredReposLinkSelector, { timeout: 5000 });
  await page.click(starredReposLinkSelector);
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 3) Expand the "Add this repository to a list" dropdown
  console.log("Expanding the dropdown to add the repo to a list...");
  const detailsDropdownSelector = 'details#details-user-list-90796663-starred[openable] summary[aria-label="Add this repository to a list"]';
  await page.waitForSelector(detailsDropdownSelector, { timeout: 5000 });
  await page.click(detailsDropdownSelector);
  
  // 6. Add the starred repository to "Node Libraries" by directly clicking the checkbox
console.log("Step 6: Adding repository to 'Node Libraries' by directly clicking the checkbox...");

try {
  // Wait for the checkbox to appear
  // Make sure you are on the correct page before this step.
  const nodeLibrariesCheckbox = 'input.js-user-list-menu-item[name="list_ids[]"][value="5471581"]';
  await page.waitForSelector(nodeLibrariesCheckbox, { timeout: 5000, visible: true });
  
  // Click it to (un)check
  await page.click(nodeLibrariesCheckbox);
  
  // If GitHub auto-saves after checking, you're done.
  // If you need to click an additional "Save" or "Apply" button, do that here.
  await wait(1000);

  console.log("Repository added to 'Node Libraries'!");
} catch (err) {
  console.error("Failed to add repository to 'Node Libraries':", err);
}


  // If GitHub auto-saves on check, we’re done.
  // If you need extra time for the request or a final "Submit," add a short wait:
  await wait(1500);

  console.log("Repository added to 'Node Libraries' successfully!");
} catch (err) {
  console.error("Step 6 failed to add the repo to 'Node Libraries':", err);
}

    
    // All done
    console.log('All tasks complete. Closing browser.');
    await browser.close();

  } catch (error) {
    console.error("An error occurred:", error);
  }
})();