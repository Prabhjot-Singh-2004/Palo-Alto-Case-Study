import os
import io
import re
from flask import Flask, request, jsonify
from PyPDF2 import PdfReader

app = Flask(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF bytes using PyPDF2."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"PDF parsing failed: {str(e)}")


def clean_text(text):
    """Clean extracted text - remove excessive whitespace, normalize."""
    # Remove non-printable characters except newlines
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)
    # Collapse multiple spaces
    text = re.sub(r' +', ' ', text)
    # Collapse multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


@app.route('/parse', methods=['POST'])
def parse_pdf():
    """Parse uploaded PDF and return extracted text."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are accepted'}), 400

    try:
        pdf_bytes = file.read()

        if len(pdf_bytes) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large (max 5MB)'}), 400

        raw_text = extract_text_from_pdf(pdf_bytes)
        cleaned_text = clean_text(raw_text)

        if not cleaned_text:
            return jsonify({'error': 'Could not extract text from PDF. The file may be image-based or corrupted.'}), 400

        return jsonify({
            'success': True,
            'text': cleaned_text,
            'pages': len(PdfReader(io.BytesIO(pdf_bytes)).pages),
            'charCount': len(cleaned_text)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'pdf-parser'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
