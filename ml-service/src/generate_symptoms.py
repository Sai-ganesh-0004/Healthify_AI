import nltk
nltk.download('wordnet')
nltk.download('omw-1.4')
from nltk.corpus import wordnet
import json

symptoms = [
    'itching', 'fatigue', 'cough', 'headache', 'nausea',
    'vomiting', 'dizziness', 'breathlessness', 'chills',
    'sweating', 'fever', 'rash', 'pain', 'weakness'
]

synonyms_dict = {}
for symptom in symptoms:
    syns = set()
    for syn in wordnet.synsets(symptom):
        for lemma in syn.lemmas():
            syns.add(lemma.name().replace('_', ' ').lower())
    synonyms_dict[symptom] = list(syns)
    print(f"{symptom}: {list(syns)[:5]}")

with open('synonyms.json', 'w') as f:
    json.dump(synonyms_dict, f, indent=2)

print("Saved to synonyms.json!")