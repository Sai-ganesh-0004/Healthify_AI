import json
from app import app as flask_app

client = flask_app.test_client()

results = []


def record(name, response, ok_statuses=(200,)):
    status = response.status_code
    ok = status in ok_statuses
    body = None
    try:
        body = response.get_json(silent=True)
    except Exception:
        body = None
    details = ""
    if isinstance(body, dict):
        if 'error' in body:
            details = f"error={body['error']}"
        elif name == 'GET /diseases':
            details = f"total={body.get('total')}"
        elif name == 'GET /symptoms':
            details = f"total={body.get('total')}"
        elif name == 'POST /predict/health':
            details = f"keys={','.join(sorted(body.keys()))}" if body else ""
        elif name == 'POST /predict':
            details = f"disease={body.get('disease')}"
    outcome = 'PASS' if ok else 'FAIL'
    print(f"{name}: status={status} {outcome}" + (f" ({details})" if details else ""))
    results.append((name, ok, status, details))
    return body

record('GET /', client.get('/'))
record('GET /health', client.get('/health'))

diseases_body = record('GET /diseases', client.get('/diseases'))
symptoms_body = record('GET /symptoms', client.get('/symptoms'))

health_payload = {
    'age': 30,
    'gender': 1,
    'height': 175,
    'weight': 72,
    'sleep': 7,
    'exercise': 4,
    'smoker': 0,
    'alcohol': 0,
    'diabetic': 0,
    'heart_disease': 0
}
record('POST /predict/health', client.post('/predict/health', json=health_payload))

symptom_list = []
if isinstance(symptoms_body, dict):
    symptom_list = symptoms_body.get('symptoms') or []
if not symptom_list:
    symptom_list = ['fever']

predict_payload = {
    'symptoms': [symptom_list[0]],
    'age': 30,
    'gender': 'Male',
    'blood_pressure': 'Normal',
    'cholesterol': 'Normal',
    'duration': '3 days'
}
record('POST /predict', client.post('/predict', json=predict_payload))

passed = sum(1 for _, ok, _, _ in results if ok)
print(f"Summary: {passed}/{len(results)} passed")
