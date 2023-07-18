const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const { writeFile } = require("./func");

async function scrapeTableData() {
  let logs = fs.readFileSync("logs.txt", "utf-8").split("\n");
  let CurrentId = 1;
  if (logs[0]) {
    CurrentId = Number(logs[0]);
  }
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
  );
  await page.setViewport({ width: 1366, height: 768 });
  await page.setDefaultNavigationTimeout(0); // Disable navigation timeout
  let tableData = [];

  try {
    for (let index = CurrentId; index < 170; index++) {
      await page.goto(
        "https://www.appsruntheworld.com/customers-database/products/view/sap-r-3/name/asc/10/" +
          index
      );
      const pageTableData = await page.evaluate(() => {
        const table = document.querySelector("table#table_purchases");

        const headers = Array.from(table.querySelectorAll("thead th")).map(
          (header) => header.textContent.trim()
        );

        const rows = Array.from(table.querySelectorAll("tbody tr")).map(
          (row) => {
            const rowData = Array.from(row.querySelectorAll("td")).map((cell) =>
              cell.textContent.trim()
            );
            return rowData;
          }
        );

        return rows;
      });
      // Append the current page's table data to the overall table data
      tableData = tableData.concat(pageTableData);
      CurrentId = CurrentId+1;
      await writeFile("logs.txt", `${CurrentId + "\n"}`);
    }
  } catch (error) {
    const jsonData = JSON.stringify(tableData, null, 2); // Convert array of arrays to JSON string with indentation

    fs.appendFile("output2.json", jsonData, "utf8", (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been written successfully.");
      }
    });
    // write index in logs.txt

    console.log(tableData.length);
    await browser.close();

    scrapeTableData();
  }

  await browser.close();

  return tableData;
}

scrapeTableData();
