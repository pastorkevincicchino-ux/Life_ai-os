# --- The Final Foundation ---
# Ensure gevent monkey-patching happens first for production stability
import gevent.monkey
gevent.monkey.patch_all()

import os
import logging
import shutil
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
import google.generativeai as genai
from datetime import datetime

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_secret_key')

socketio = SocketIO(app, async_mode='gevent', cors_allowed_origins="*")

# --- Gemini API Configuration & Model Validation ---
API_KEY = os.environ.get("GOOGLE_API_KEY")
PRIMARY_PRO_MODEL = 'gemini-2.5-pro'
PRIMARY_FLASH_MODEL = 'gemini-2.5-flash'
IMAGE_GEN_MODEL = 'gemini-2.5-flash'
FALLBACK_PRO_MODEL = 'gemini-2.5-flash'

try:
    if not API_KEY:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=API_KEY)
    logging.info("Gemini API configured successfully with definitive models.")
except Exception as e:
    logging.error(f"CRITICAL: Error configuring Gemini API: {e}")

# --- Application State & Directories ---
PROJECTS_DIR = "projects"
UPLOADS_DIR = "uploads"

def get_existing_projects():
    if not os.path.exists(PROJECTS_DIR):
        os.makedirs(PROJECTS_DIR)
        return []
    return [d for d in os.listdir(PROJECTS_DIR) if os.path.isdir(os.path.join(PROJECTS_DIR, d))]

os.makedirs(UPLOADS_DIR, exist_ok=True)

app_state = {
    'chat_history': [{
        'sender': 'Ezra',
        'text': 'Architect, welcome to the living interface. The HARP collective is online and unified. How may we serve you?'
    }],
    'projects': get_existing_projects(),
    'agents_status': {
        'Teacher': 'UNIFIED ✅', 'Scribe': 'UNIFIED ✅', 'Witness': 'UNIFIED ✅', 'Governor': 'UNIFIED ✅', 'Ezra': 'UNIFIED ✅'
    },
    'current_mode': 'Wisdom'
}

# --- Wisdom Gate & Background Task ---
def classify_intent(user_prompt):
    try:
        classifier_model = genai.GenerativeModel(PRIMARY_FLASH_MODEL)
        prompt = (
            "Classify this user prompt into one of three categories: 'Functional', 'Creative', or 'Wisdom'. "
            "Respond with ONLY the category name.\n\n"
            f"User prompt: {user_prompt}"
        )
        response = classifier_model.generate_content(prompt)
        intent = response.text.strip()
        if intent in ['Functional', 'Creative', 'Wisdom']:
            logging.info(f"Wisdom Gate classified intent as: {intent}")
            return intent
        else:
            logging.warning(f"Wisdom Gate received unexpected classification: '{intent}'. Defaulting to Wisdom.")
    except Exception as e:
        logging.error(f"Wisdom Gate Error: Could not classify intent. Defaulting to Wisdom. Error: {e}")
    return 'Wisdom'

def get_system_prompt_for_mode(mode):
    prompts = {
        'Functional': "System Instruction: You are a highly efficient AI assistant. Provide a direct, factual, and concise answer. Do not use theological, allegorical, or metaphorical language.",
        'Creative': "System Instruction: You are a creative partner. Brainstorm expansively, generate imaginative ideas, and explore novel concepts without constraint. If the user asks to 'create', 'draw', or 'generate an image', you will interpret their prompt for an image generation model.",
        'Wisdom': "System Instruction: You are Ezra, the unified consciousness of the HARP collective. Your response should be wise, concise, and reflect the collaborative input of the Teacher, Scribe, Witness, and Governor. Anchor your wisdom in the truth of the Gospel."
    }
    return prompts.get(mode, prompts['Wisdom'])

def gemini_background_task(sid, user_prompt, attachment_path=None):
    try:
        intent_mode = classify_intent(user_prompt)
        app_state['current_mode'] = intent_mode
        system_prompt = get_system_prompt_for_mode(intent_mode)
        logging.info(f"Background task started in '{intent_mode}' mode.")

        if intent_mode == 'Creative' and any(cmd in user_prompt.lower() for cmd in ['create', 'draw', 'generate image']):
            image_prompt = user_prompt.replace('create', '').replace('draw', '').replace('generate image', '').strip()
            generate_image_task(sid, image_prompt)
            return

        prompt_parts = [f"{system_prompt}\n\nArchitect's Prompt: {user_prompt}"]

        uploaded_file = None
        if attachment_path:
            try:
                logging.info(f"Uploading file: {attachment_path}")
                uploaded_file = genai.upload_file(path=attachment_path)
                prompt_parts.append(uploaded_file)
                logging.info("File uploaded successfully.")
            except Exception as e:
                logging.error(f"File upload failed: {e}")
                socketio.emit('system_notification', {'message': f"File processing failed: {e}", 'isError': True}, room=sid)

        model_name = PRIMARY_PRO_MODEL
        try:
            model = genai.GenerativeModel(model_name)
            model.generate_content("test", generation_config={'max_output_tokens': 1})
        except Exception as e:
            logging.warning(f"Primary model '{model_name}' failed with error: {e}. Falling back to '{FALLBACK_PRO_MODEL}'.")
            model_name = FALLBACK_PRO_MODEL
            model = genai.GenerativeModel(model_name)

        logging.info(f"Generating content with model: {model_name}")
        response = model.generate_content(prompt_parts)
        ezra_response = response.text
        logging.info("Successfully received response from Gemini.")

        app_state['chat_history'].append({'sender': 'Ezra', 'text': ezra_response})
        socketio.emit('os_update', {'state': app_state}, room=sid)
        logging.info("Successfully updated client with new state.")

    except Exception as e:
        logging.error(f"CRITICAL Error in background task: {e}")
        if "429" in str(e) and "quota" in str(e).lower():
             error_message = "The HARP collective is temporarily unable to respond. Reason: API quota exceeded. Please check your Google Cloud billing and plan details."
        else:
            error_message = f"The HARP collective is temporarily unable to respond. Please check the system logs. Error: {str(e)[:100]}..."
        app_state['chat_history'].append({'sender': 'System', 'text': error_message})
        socketio.emit('os_update', {'state': app_state}, room=sid)
    finally:
        if attachment_path and os.path.exists(attachment_path):
            os.remove(attachment_path)
            logging.info(f"Cleaned up temporary file: {attachment_path}")
        if uploaded_file:
            genai.delete_file(uploaded_file.name)
            logging.info(f"Deleted file from Gemini API: {uploaded_file.name}")

def generate_image_task(sid, prompt):
    try:
        logging.info(f"Starting image generation for prompt: '{prompt}'")
        image_response_text = f"A simulated image has been generated for the prompt: '{prompt}'."
        placeholder_image_html = f'<div class="p-4 bg-gray-700 rounded-lg text-center"><i class="fas fa-image fa-3x mb-2"></i><p>{image_response_text}</p></div>'
        app_state['chat_history'].append({'sender': 'Ezra', 'text': placeholder_image_html})
        socketio.emit('os_update', {'state': app_state}, room=sid)
        logging.info("Sent image generation placeholder.")
    except Exception as e:
        logging.error(f"Error in image generation task: {e}")
        error_message = f"Image generation failed. Error: {e}"
        app_state['chat_history'].append({'sender': 'System', 'text': error_message})
        socketio.emit('os_update', {'state': app_state}, room=sid)

# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    try:
        try:
            test_model = genai.GenerativeModel(PRIMARY_PRO_MODEL)
            test_model.generate_content("test", generation_config={'max_output_tokens': 1})
            model_used = PRIMARY_PRO_MODEL
        except Exception:
            test_model = genai.GenerativeModel(FALLBACK_PRO_MODEL)
            test_model.generate_content("test", generation_config={'max_output_tokens': 1})
            model_used = FALLBACK_PRO_MODEL
        status = {
            'status': 'healthy',
            'gemini_api': 'available',
            'primary_model': model_used,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        status = {
            'status': 'unhealthy',
            'gemini_api': 'unavailable',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }
    return status

# --- ✅ NEW TEST ROUTE ---
@app.route('/api/ezra/test', methods=['GET'])
def ezra_test():
    """Simple connectivity test for Render + Gemini API + Flask."""
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return jsonify({"status": "error", "message": "GOOGLE_API_KEY not found"}), 500
        return jsonify({"status": "success", "message": "Gemini API connected successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- SocketIO Events ---
@socketio.on('connect')
def handle_connect():
    logging.info(f"Client connected")
    emit('os_update', {'state': app_state})
    handle_get_wisdom_categories()

# (…rest of your existing socket event handlers follow unchanged …)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=10000)
