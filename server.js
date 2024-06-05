const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Membaca kasus dari file JSON
function loadCases(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Fungsi untuk menghitung similarity (CBR)
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

// Memuat kasus dari file JSON (CBR)
const cases = loadCases('laptop_cases.json');

// Route for Case-Based Reasoning recommendation
app.post('/recommend', (req, res) => {
    const newProblem = req.body;
    newProblem.ram = parseInt(newProblem.ram);
    newProblem.storage = parseInt(newProblem.storage);
    newProblem.ukuran_layar = parseFloat(newProblem.ukuran_layar);
    newProblem.berat = parseFloat(newProblem.berat);

    // Menemukan 3 kasus yang paling mirip
    const similarities = cases.map(caseItem => ({
        laptop_model: caseItem.laptop_model,
        similarity: calculateSimilarity(caseItem, newProblem)
    }));

    // Urutkan berdasarkan similarity tertinggi
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Ambil 3 kasus terbaik
    const top3 = similarities.slice(0, 3);

    res.json({
        laptops: top3
    });
});

// Route for Rule-Based recommendation
app.post('/recommendation', (req, res) => {
    const { GPU, Gaming, Ram, Storage, UkuranLayar } = req.body;
    let laptop_model = 'tidak ada laptop sesuai keinginan anda';

    if (GPU === 'Yes') {
        if (Gaming === 'Yes') {
            if (Ram > 9) {
                if (UkuranLayar >= 13) {
                    laptop_model = 'Legion';
                } else if (UkuranLayar < 13) {
                    laptop_model = 'ROG';
                }
            } else if (Ram <= 9) {
                if (Storage == 1000) {
                    laptop_model = 'Legion';
                } else if (Storage == 256 || Storage == 512) {
                    laptop_model = 'MSI';
                }
            }
        } else if (Gaming === 'No') {
            if (Ram > 9) {
                laptop_model = 'Asus Zenbook';
            } else if (Ram <= 9) {
                if (Storage >= 512) {
                    laptop_model = 'Lenovo Yoga';
                } else if (Storage < 512) {
                    laptop_model = 'Dell Latitude';
                }
            }
        }
    } else if (GPU === 'No') {
        if (Ram > 9) {
            if (Storage >= 512) {
                laptop_model = 'Lenovo Yoga';
            } else if (Storage < 512) {
                laptop_model = 'Acer Aspire';
            }
        } else if (Ram <= 9) {
            if (Storage >= 512) {
                laptop_model = 'Dell Latitude';
            } else if (Storage < 512) {
                if (UkuranLayar >= 12) {
                    laptop_model = 'Acer Aspire';
                } else if (UkuranLayar < 12) {
                    laptop_model = 'Chromebook';
                }
            }
        }
    }

    res.send({ recommendation: laptop_model });
});

// Serve the form.html file
app.get('/rule-based', (req, res) => {
    res.sendFile(path.join(__dirname, 'rule-based.html'));
});

// Serve the cbr.html file
app.get('/cbr', (req, res) => {
    res.sendFile(path.join(__dirname, 'cbr.html'));
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
