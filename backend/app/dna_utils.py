import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from scipy.signal import find_peaks
from sklearn.cluster import KMeans
import pandas as pd
import time
import io
import base64

# === Configuration ===
peak_height = 0.1
peak_distance = 1
red_threshold = 30
green_threshold = 30
blue_threshold = 30

# === Load Image ===
def load_image(image_data):
    """Load image from binary data"""
    nparr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        try:
            image = np.array(Image.open(io.BytesIO(image_data)).convert("RGB"))
        except Exception as e:
            raise ValueError(f"Could not read image: {e}")
    else:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image

# === Extract Lane and RGB Signals ===
def extract_signals(image):
    lane_row = image.shape[0] // 2
    lane = image[lane_row, :, :]
    red = lane[:, 0].astype(float)
    green = lane[:, 1].astype(float)
    blue = lane[:, 2].astype(float)
    positions = np.arange(len(red))
    red = red / np.max(red) if np.max(red) > 0 else red
    green = green / np.max(green) if np.max(green) > 0 else green
    blue = blue / np.max(blue) if np.max(blue) > 0 else blue
    # Guanine: Mix of red and green to mimic yellow
    guanine = (red + green) / 2
    guanine = guanine / np.max(guanine) if np.max(guanine) > 0 else guanine
    return red, green, blue, guanine, positions

# === Peak Detection ===
def detect_peaks(red, green, blue, guanine):
    peak_r, _ = find_peaks(red, height=peak_height, distance=peak_distance)
    peak_g, _ = find_peaks(green, height=peak_height, distance=peak_distance)
    peak_b, _ = find_peaks(blue, height=peak_height, distance=peak_distance)
    peak_y, _ = find_peaks(guanine, height=peak_height, distance=peak_distance)  # Guanine peaks based on red + green
    all_peaks = np.unique(np.sort(np.concatenate((peak_r, peak_g, peak_b, peak_y))))
    return peak_r, peak_g, peak_b, peak_y, all_peaks

# === Assign Nucleotides for Peaks ===
def assign_nucleotides(all_peaks, red, green, blue, guanine):
    sequence = []
    for p in all_peaks:
        r, g, b, y = red[p], green[p], blue[p], guanine[p]
        values = [r, g, b, y]
        idx = np.argmax(values)
        base = ['A', 'T', 'C', 'G'][idx]
        sequence.append(base)
    return ''.join(sequence)

# === Intensity-based Classification ===
def classify_nucleotides(image, red_th, green_th, blue_th):
    red_channel = image[:, :, 0]
    green_channel = image[:, :, 1]
    blue_channel = image[:, :, 2]
    nucleotide_map = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
    # Adenine: Red dominant
    adenine = (red_channel > red_th) & (red_channel > green_channel) & (red_channel > blue_channel)
    # Thymine: Green dominant
    thymine = (green_channel > green_th) & (green_channel > red_channel) & (green_channel > blue_channel)
    # Cytosine: Blue dominant
    cytosine = (blue_channel > blue_th) & (blue_channel > red_channel) & (blue_channel > green_channel)
    # Guanine: Else
    nucleotide_map[adenine] = 1
    nucleotide_map[thymine] = 2
    nucleotide_map[cytosine] = 3
    nucleotide_map[~adenine & ~thymine & ~cytosine] = 4
    return nucleotide_map

def nucleotide_map_to_string(nucleotide_map):
    nucleotide_dict = {1: 'A', 2: 'T', 3: 'C', 4: 'G'}
    flattened = nucleotide_map.flatten()
    return ''.join(nucleotide_dict[val] for val in flattened if val != 0)

def compute_accuracy(predicted, reference):
    if not reference or not predicted:
        return 0.0
    min_len = min(len(predicted), len(reference))
    if min_len == 0:
        return 0.0
    matches = sum(1 for p, r in zip(predicted[:min_len], reference[:min_len]) if p == r)
    return (matches / min_len) * 100

def generate_chromatogram_plot(red, green, blue, guanine, positions, peak_r, peak_g, peak_b, peak_y):
    plt.figure(figsize=(10, 6))
    plt.plot(positions, red, 'r-', label="A (Red)")
    plt.plot(positions, green, 'g-', label="T (Green)")
    plt.plot(positions, blue, 'b-', label="C (Blue)")
    plt.plot(positions, guanine, '#FFFF00', label="G (Yellow)")
    plt.scatter(peak_r, red[peak_r], color='r', s=50)
    plt.scatter(peak_g, green[peak_g], color='g', s=50)
    plt.scatter(peak_b, blue[peak_b], color='b', s=50)
    plt.scatter(peak_y, guanine[peak_y], color='#FFFF00', s=50)
    plt.title("Peak-based Chromatogram")
    plt.xlabel("Position")
    plt.ylabel("Normalized Intensity")
    plt.legend()
    plt.grid(True)
    
    # Convert plot to base64 image
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return base64.b64encode(buf.read()).decode('utf-8')

def process_dna_image(image_data, filename):
    """Process a DNA image and extract sequence"""
    # Load image
    image = load_image(image_data)
    
    # Extract signals
    red, green, blue, guanine, positions = extract_signals(image)
    
    # Peak detection
    peak_r, peak_g, peak_b, peak_y, all_peaks = detect_peaks(red, green, blue, guanine)
    
    # Assign nucleotides
    dna_sequence = assign_nucleotides(all_peaks, red, green, blue, guanine)
    
    # Generate chromatogram plot
    chromatogram = generate_chromatogram_plot(red, green, blue, guanine, positions, peak_r, peak_g, peak_b, peak_y)
    
    # Intensity-based classification
    nucleotide_map = classify_nucleotides(image, red_threshold, green_threshold, blue_threshold)
    intensity_sequence = nucleotide_map_to_string(nucleotide_map)
    
    # Nucleotide counts
    adenine_count = np.sum(nucleotide_map == 1)
    thymine_count = np.sum(nucleotide_map == 2)
    cytosine_count = np.sum(nucleotide_map == 3)
    guanine_count = np.sum(nucleotide_map == 4)
    
    return {
        "filename": filename,
        "dna_sequence": dna_sequence,
        "intensity_sequence": intensity_sequence,
        "chromatogram": chromatogram,
        "nucleotide_counts": {
            "A": int(adenine_count),
            "T": int(thymine_count),
            "C": int(cytosine_count),
            "G": int(guanine_count)
        }
    }

# === String Matching Algorithms ===
def kmp_search(pattern, text):
    """
    Knuth-Morris-Pratt algorithm for string matching
    Returns: (matches, time_taken)
    """
    start_time = time.time()
    
    # Compute LPS array
    def compute_lps(pattern):
        m = len(pattern)
        lps = [0] * m
        length = 0
        i = 1
        
        while i < m:
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps
    
    if not pattern or not text:
        end_time = time.time()
        return [], end_time - start_time
    
    n, m = len(text), len(pattern)
    if m > n:
        end_time = time.time()
        return [], end_time - start_time
    
    lps = compute_lps(pattern)
    
    matches = []
    i = j = 0
    
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1
        
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    
    end_time = time.time()
    return matches, end_time - start_time

def rabin_karp_search(pattern, text):
    """
    Rabin-Karp algorithm for string matching
    Returns: (matches, time_taken)
    """
    start_time = time.time()
    
    if not pattern or not text:
        end_time = time.time()
        return [], end_time - start_time
    
    n, m = len(text), len(pattern)
    if m > n:
        end_time = time.time()
        return [], end_time - start_time
    
    # Prime number for hash calculation
    q = 101
    d = 256  # Number of characters in the input alphabet
    
    # Calculate hash value for pattern and first window of text
    pattern_hash = 0
    text_hash = 0
    h = 1
    
    # The value of h would be "pow(d, m-1) % q"
    for i in range(m - 1):
        h = (h * d) % q
    
    # Calculate hash value for pattern and first window of text
    for i in range(m):
        pattern_hash = (d * pattern_hash + ord(pattern[i])) % q
        text_hash = (d * text_hash + ord(text[i])) % q
    
    matches = []
    
    # Slide the pattern over text one by one
    for i in range(n - m + 1):
        # Check the hash values of current window of text and pattern
        # If the hash values match then only check for characters one by one
        if pattern_hash == text_hash:
            # Check for characters one by one
            for j in range(m):
                if text[i + j] != pattern[j]:
                    break
            else:  # If all characters match
                matches.append(i)
        
        # Calculate hash value for next window of text
        if i < n - m:
            text_hash = (d * (text_hash - ord(text[i]) * h) + ord(text[i + m])) % q
            
            # We might get negative value of text_hash, converting it to positive
            if text_hash < 0:
                text_hash = text_hash + q
    
    end_time = time.time()
    return matches, end_time - start_time

def compare_sequences(seq1, seq2):
    """Compare two DNA sequences using KMP and Rabin-Karp algorithms"""
    # Basic similarity percentage
    min_len = min(len(seq1), len(seq2))
    if min_len == 0:
        basic_match = 0
    else:
        matches = sum(1 for a, b in zip(seq1[:min_len], seq2[:min_len]) if a == b)
        basic_match = (matches / min_len) * 100
    
    # KMP search
    kmp_matches, kmp_time = kmp_search(seq2, seq1)
    
    # Rabin-Karp search
    rk_matches, rk_time = rabin_karp_search(seq2, seq1)
    
    # Calculate match percentages
    kmp_match = len(kmp_matches) * len(seq2) / len(seq1) * 100 if len(seq1) > 0 else 0
    rk_match = len(rk_matches) * len(seq2) / len(seq1) * 100 if len(seq1) > 0 else 0
    
    return {
        "basic_match_percentage": basic_match,
        "kmp": {
            "matches": kmp_matches,
            "match_percentage": kmp_match,
            "time_taken": kmp_time,
            "complexity": "O(n+m)"
        },
        "rabin_karp": {
            "matches": rk_matches,
            "match_percentage": rk_match,
            "time_taken": rk_time,
            "complexity": "O(n*m) worst case, O(n+m) average case"
        }
    }
