const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Membaca kasus dari file JSON
function loadCases(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Fungsi untuk menghitung similarity
function calculateSimilarity(case1, case2) {
    const totalCriteria = 7; // Sesuaikan dengan jumlah kriteria

    // Kriteria kategori
    const categoryCriteria = ['cpu', 'gpu', 'gaming', 'storage'];
    let similarity = 0; // Initialize similarity variable

    for (const criterion of categoryCriteria) {
        if (case1[criterion] === case2[criterion]) {
            similarity += 1;
        }
    }

    // Kriteria numerik
    const numericCriteria = ['ram', 'ukuran_layar', 'berat'];
    for (const criterion of numericCriteria) {
        if (criterion === 'ram') {
            similarity += 1 - Math.abs((case1[criterion] - case2[criterion]) / (16 - 4));
        } else if (criterion === 'ukuran_layar') {
            similarity += 1 - Math.abs((case1[criterion] - case2[criterion]) / (16 - 10));
        } else if (criterion === 'berat') {
            similarity += 1 - Math.abs((case1[criterion] - case2[criterion]) / (4 - 1));
        }
    }

    // Mengembalikan nilai similarity
    return similarity / totalCriteria;
}

// Memuat kasus dari file JSON
const cases = loadCases('laptop_cases.json');

// Route to handle form submission
app.post('/recommend', (req, res) => {
    const newProblem = req.body;
    newProblem.ram = parseInt(newProblem.ram);
    newProblem.storage = parseInt(newProblem.storage);
    newProblem.ukuran_layar = parseFloat(newProblem.ukuran_layar);
    newProblem.berat = parseFloat(newProblem.berat);

    // Menemukan kasus yang paling mirip
    let bestMatch = null;
    let highestSimilarity = -1;

    for (const caseItem of cases) {
        const pointSimilarity = calculateSimilarity(caseItem, newProblem);
        if (pointSimilarity > highestSimilarity) {
            highestSimilarity = pointSimilarity;
            bestMatch = caseItem;
        }
    }

    res.json({
        laptop_model: bestMatch.laptop_model,
        similarity: highestSimilarity
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});