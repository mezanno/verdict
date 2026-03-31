import json
import csv
import os

input_file = '../public/eval_questions092025_v4.jsonl'
output_dir = '../public/generated_csvs'
session_id = 1 # Update this if needed

os.makedirs(output_dir, exist_ok=True)

questions_csv = os.path.join(output_dir, 'questions.csv')
sources_csv = os.path.join(output_dir, 'sources.csv')
sources_questions_csv = os.path.join(output_dir, 'sources_questions.csv')

questions = []
sources = {} # id -> {title, content}
sources_questions = []

with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        data = json.loads(line)
        
        q_id = str(data.get('unique_id', ''))
        q_label = data.get('question', '')
        q_generated_answer = data.get('generated_answer', '')
        
        if not q_id:
            continue

        questions.append({
            'id': q_id,
            'label': q_label,
            'generated_answer': q_generated_answer,
            'session_id': session_id
        })
        
        # Sources parsing (id_1, source_1, doc_1 and id_2, source_2, doc_2)
        for i in range(1, 10): # Handle potential future growth too
            s_id_key = f'id_{i}'
            s_title_key = f'source_{i}'
            s_content_key = f'doc_{i}'
            
            if s_id_key in data:
                s_id = str(data[s_id_key])
                s_title = data.get(s_title_key, '')
                s_content = data.get(s_content_key, '')
                
                if s_id:
                    if s_id not in sources:
                        sources[s_id] = {
                            'id': s_id,
                            'title': s_title,
                            'content': s_content
                        }
                    
                    sources_questions.append({
                        'question_id': q_id,
                        'source_id': s_id
                    })

# Write Questions CSV
with open(questions_csv, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'label', 'generated_answer', 'session_id'])
    writer.writeheader()
    writer.writerows(questions)

# Write Sources CSV
with open(sources_csv, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'title', 'content'])
    writer.writeheader()
    writer.writerows(sources.values())

# Write Sources_Questions CSV
with open(sources_questions_csv, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['question_id', 'source_id'])
    writer.writeheader()
    writer.writerows(sources_questions)

print(f"Generated CSVs in {output_dir}")
print(f"Questions: {len(questions)}")
print(f"Sources: {len(sources)}")
print(f"Sources-Questions links: {len(sources_questions)}")
