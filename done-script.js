const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Let's assume your HTML is stored in a file or string
const html = `
<table>
<tbody>
    <tr>
        <td><strong>IATA </strong> – 999</td>
        <td><strong>IATA </strong> – CA</td>
        <td>Air China</td>
    </tr>
</tbody>

</table>
`;

const $ = cheerio.load(html);

// Get all IATA airline codes from second <td> of each <tr>
const iataCodes = $('tbody tr')
    .map((i, tr) => {
        const secondTdText = $(tr).find('td').eq(1).text(); // second <td>
        const codeMatch = secondTdText.match(/–\s*([A-Z0-9]+)/); // Match "– CA"
        return codeMatch ? codeMatch[1] : null;
    })
    .get();

const baseUrl = 'https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/';
const downloadDir = path.join(__dirname, 'airlines');

// Create folder if it doesn't exist
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// Function to download an image
function downloadImage(code) {
    const url = `${baseUrl}${code}.png`;
    const filePath = path.join(downloadDir, `${code}.png`);

    https
        .get(url, (res) => {
            if (res.statusCode === 200) {
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`Downloaded: ${code}.png`);
                });
            } else {
                console.warn(`❌ Failed to download ${code}.png — Status Code: ${res.statusCode}`);
            }
        })
        .on('error', (err) => {
            console.error(`Error downloading ${code}.png: ${err.message}`);
        });
}

// Start downloading all logos
iataCodes.forEach(downloadImage);
