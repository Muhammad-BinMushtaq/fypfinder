from http.server import BaseHTTPRequestHandler
import json
import re
try:
    import fitz  # PyMuPDF
except ImportError:
    pass

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "Empty request body")
                return
                
            pdf_bytes = self.rfile.read(content_length)
            
            try:
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            except Exception as e:
                self.send_error(400, f"Invalid PDF file: {str(e)}")
                return
            
            max_pages = 15
            
            if len(doc) > max_pages:
                self.send_error(413, f"PDF must be {max_pages} pages or fewer.")
                return

            text_pages = []
            for i in range(len(doc)):
                page = doc.load_page(i)
                text = page.get_text("text").strip()
                if text:
                    text_pages.append(text)

            full_text = "\n\n".join(text_pages)
            
            full_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', ' ', full_text)
            full_text = re.sub(r'[ \t]+', ' ', full_text)
            full_text = re.sub(r'\n{3,}', '\n\n', full_text)
            full_text = full_text.strip()
            
            if len(full_text) < 80:
                self.send_error(400, "This PDF appears to contain images only or has no usable text.")
                return

            response_data = {
                "text": full_text,
                "pageCount": len(doc)
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            self.send_error(500, str(e))
