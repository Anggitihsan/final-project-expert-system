import json

# Membaca kasus dari file JSON
def load_cases(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

# Fungsi untuk menghitung similarity
def calculate_similarity(case1, case2):

    total_criteria = 7  # Sesuaikan dengan jumlah kriteria

    # Kriteria kategori
    category_criteria = ['cpu', 'gpu', 'gaming', 'storage']
    similarity = 0  # Initialize similarity variable
    for criterion in category_criteria:
        if case1[criterion] == case2[criterion]:
            similarity += 1

    # Kriteria numerik
    numeric_criteria = ['ram', 'ukuran_layar', 'berat']
    for criterion in numeric_criteria:
        if criterion == 'ram':
            similarity += 1 - abs((case1[criterion] - case2[criterion]) / (16 - 4))
        elif criterion == 'ukuran_layar':
            similarity += 1 - abs((case1[criterion] - case2[criterion]) / (16 - 10))
        elif criterion == 'berat':
            similarity += 1 - abs((case1[criterion] - case2[criterion]) / (4 - 1))    
    # Mengembalikan nilai similarity
    return similarity / total_criteria

# Memuat kasus dari file JSON
cases = load_cases('laptop_cases.json')

# Masalah baru yang diberikan oleh pengguna
new_problem = {
    "cpu": "AMD",
    "gpu": "Yes",
    "ram": 12,
    "storage": 1000,
    "ukuran_layar": 12,
    "berat": 4,
    "gaming": "No",
}

# Menemukan kasus yang paling mirip
best_match = None
highest_similarity = -1

for case in cases:
    point_similarity = calculate_similarity(case, new_problem)
    if point_similarity > highest_similarity:
        highest_similarity = point_similarity
        best_match = case

print(f"Rekomendasi laptop terbaik: {best_match['laptop_model']} dengan similarity {highest_similarity}")