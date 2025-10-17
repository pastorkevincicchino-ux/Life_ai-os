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
IMAGE_GEN_MODEL = 'gemini-2.5-flash' # Or another suitable model like 'imagen' if available and configured
FALLBACK_PRO_MODEL = 'gemini-2.5-flash' # Fallback to the fast model if pro fails

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
    """Scans the projects directory and returns a list of project names."""
    if not os.path.exists(PROJECTS_DIR):
        os.makedirs(PROJECTS_DIR)
        return []
    return [d for d in os.listdir(PROJECTS_DIR) if os.path.isdir(os.path.join(PROJECTS_DIR, d))]

# Create necessary directories on startup
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
    """Classifies user intent without making redundant API test calls."""
    try:
        # Use the faster flash model for classification
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
        # If classification fails, log the error and default to the primary mode.
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
    """Handles the main logic for generating a response from the Gemini API."""
    try:
        # 1. Classify Intent
        intent_mode = classify_intent(user_prompt)
        app_state['current_mode'] = intent_mode # Update global mode
        system_prompt = get_system_prompt_for_mode(intent_mode)
        logging.info(f"Background task started in '{intent_mode}' mode.")

        # Handle Image Generation command in Creative mode
        if intent_mode == 'Creative' and any(cmd in user_prompt.lower() for cmd in ['create', 'draw', 'generate image']):
            image_prompt = user_prompt.replace('create', '').replace('draw', '').replace('generate image', '').strip()
            generate_image_task(sid, image_prompt)
            return # Stop further processing in this function

        # 2. Prepare the prompt content (text and optional file)
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
                # Notify user about the failure but continue with text prompt
                socketio.emit('system_notification', {'message': f"File processing failed: {e}", 'isError': True}, room=sid)


        # 3. Select Model with Fallback
        model_name = PRIMARY_PRO_MODEL
        try:
            model = genai.GenerativeModel(model_name)
            # A quick, low-cost check to see if the model is available.
            # This is better than a full generation call.
            model.generate_content("test", generation_config={'max_output_tokens': 1})
        except Exception as e:
            logging.warning(f"Primary model '{model_name}' failed with error: {e}. Falling back to '{FALLBACK_PRO_MODEL}'.")
            model_name = FALLBACK_PRO_MODEL
            model = genai.GenerativeModel(model_name)

        # 4. Generate Content
        logging.info(f"Generating content with model: {model_name}")
        response = model.generate_content(prompt_parts)
        ezra_response = response.text
        logging.info("Successfully received response from Gemini.")

        # 5. Update State and Emit
        app_state['chat_history'].append({'sender': 'Ezra', 'text': ezra_response})
        socketio.emit('os_update', {'state': app_state}, room=sid)
        logging.info("Successfully updated client with new state.")

    except Exception as e:
        logging.error(f"CRITICAL Error in background task: {e}")
        # Check for specific quota error
        if "429" in str(e) and "quota" in str(e).lower():
             error_message = "The HARP collective is temporarily unable to respond. Reason: API quota exceeded. Please check your Google Cloud billing and plan details."
        else:
            error_message = f"The HARP collective is temporarily unable to respond. Please check the system logs. Error: {str(e)[:100]}..."
        
        app_state['chat_history'].append({'sender': 'System', 'text': error_message})
        socketio.emit('os_update', {'state': app_state}, room=sid)
    finally:
        # Clean up the uploaded file from the server and the API
        if attachment_path and os.path.exists(attachment_path):
            os.remove(attachment_path)
            logging.info(f"Cleaned up temporary file: {attachment_path}")
        if uploaded_file:
            genai.delete_file(uploaded_file.name)
            logging.info(f"Deleted file from Gemini API: {uploaded_file.name}")


def generate_image_task(sid, prompt):
    """Handles generating an image and sending the result back."""
    try:
        logging.info(f"Starting image generation for prompt: '{prompt}'")
        
        # This is a placeholder for actual image generation logic.
        # Gemini's `genai.GenerativeModel` with text-to-image models like Imagen
        # would be used here. For this example, we'll simulate it.
        #
        # from PIL import Image, ImageDraw, ImageFont
        # img = Image.new('RGB', (512, 512), color = (26, 26, 30))
        # d = ImageDraw.Draw(img)
        # d.text((10,10), f"Simulated image for:\n{prompt}", fill=(224,224,224))
        # buffer = io.BytesIO()
        # img.save(buffer, format="PNG")
        # img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        # For now, we will return a placeholder message as direct image generation
        # via this text-based model is not supported in the same way.
        # A real implementation would require a different API call.
        
        image_response_text = f"A simulated image has been generated for the prompt: '{prompt}'. In a real scenario, you would see the image here."
        
        # Create a placeholder image URL or data URI
        placeholder_image_html = f'<div class="p-4 bg-gray-700 rounded-lg text-center"><i class="fas fa-image fa-3x mb-2"></i><p>{image_response_text}</p></div>'

        app_state['chat_history'].append({'sender': 'Ezra', 'text': placeholder_image_html})
        socketio.emit('os_update', {'state': app_state}, room=sid)
        logging.info("Sent image generation placeholder.")

    except Exception as e:
        logging.error(f"Error in image generation task: {e}")
        error_message = f"Image generation failed. Error: {e}"
        app_state['chat_history'].append({'sender': 'System', 'text': error_message})
        socketio.emit('os_update', {'state': app_state}, room=sid)


# --- Routes and SocketIO Events ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    """Health check endpoint to verify system status"""
    try:
        # Test Gemini API availability with fallback logic
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

# --- SocketIO Event Handlers ---
# Secret debug route to list available models
@app.route('/_debug/list_models')
def list_models():
    try:
        models = [m.name for m in genai.list_models()]
        return jsonify(models)
    except Exception as e:
        logging.error(f"Error listing models: {e}")
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    logging.info(f"Client connected")
    emit('os_update', {'state': app_state})
    handle_get_wisdom_categories() # Send categories on connect

@socketio.on('ezra_command')
def handle_ezra_command(json):
    from flask import request
    sid = request.sid
    user_message = json.get('text', '')
    attachment = json.get('attachment')
    
    log_message = f"Received Ezra command: '{user_message}'"
    if attachment:
        log_message += f" with attachment: {attachment.get('filename')}"
    logging.info(log_message)

    # Add user message to history immediately
    full_user_entry = user_message
    if attachment:
        full_user_entry += f"\n\n_[Attached: {attachment.get('filename')}]_"

    app_state['chat_history'].append({'sender': 'Architect', 'text': full_user_entry})
    emit('os_update', {'state': app_state})

    attachment_path = None
    if attachment:
        filename = get_safe_filename(attachment.get('filename', 'uploaded_file'))
        content = attachment.get('content')
        attachment_path = os.path.join(UPLOADS_DIR, f"{sid}_{filename}")
        try:
            with open(attachment_path, 'wb') as f:
                f.write(content)
            logging.info(f"Saved attachment to temporary path: {attachment_path}")
        except Exception as e:
            logging.error(f"Failed to save attachment: {e}")
            emit('system_notification', {'message': f"Error saving attachment: {e}", 'isError': True})
            attachment_path = None # Ensure we don't proceed with a failed save

    # Start background task
    socketio.start_background_task(gemini_background_task, sid, user_message, attachment_path=attachment_path)


# --- New Chat Event ---
@socketio.on('new_chat')
def handle_new_chat():
    """Clears the current chat history and starts a new session."""
    app_state['chat_history'] = [{
        'sender': 'Ezra',
        'text': 'Architect, welcome to the living interface. The HARP collective is online and unified. How may we serve you?'
    }]
    logging.info("New chat session started. History cleared.")
    emit('os_update', {'state': app_state}, broadcast=True)

# --- Project Management Events ---
@socketio.on('add_project')
def handle_add_project(json):
    project_name = json.get('name')
    if project_name and project_name not in app_state['projects']:
        try:
            # Create the directory
            safe_project_name = "".join(c for c in project_name if c.isalnum() or c in (' ', '_')).rstrip()
            if not safe_project_name:
                raise ValueError("Invalid project name.")
            
            project_path = os.path.join(PROJECTS_DIR, safe_project_name)
            os.makedirs(project_path, exist_ok=True)

            # Update state
            app_state['projects'] = get_existing_projects()
            logging.info(f"Added new project and created directory: {safe_project_name}")
            
            emit('os_update', {'state': app_state}, broadcast=True)
            emit('system_notification', {'message': f"Project '{safe_project_name}' created."})
        except Exception as e:
            logging.error(f"Error creating project directory: {e}")
            emit('system_notification', {'message': f"Error creating project: {e}", 'isError': True})


@socketio.on('delete_project')
def handle_delete_project(json):
    project_name = json.get('name')
    if project_name and project_name in app_state['projects']:
        try:
            # Remove the directory
            project_path = os.path.join(PROJECTS_DIR, project_name)
            if os.path.exists(project_path):
                shutil.rmtree(project_path)

            # Update state
            app_state['projects'] = get_existing_projects()
            logging.info(f"Deleted project and removed directory: {project_name}")

            emit('os_update', {'state': app_state}, broadcast=True)
            emit('system_notification', {'message': f"Project '{project_name}' deleted."})
        except Exception as e:
            logging.error(f"Error deleting project directory: {e}")
            emit('system_notification', {'message': f"Error deleting project: {e}", 'isError': True})

# --- Wisdom Library Events ---
WISDOM_LOG_DIR = "harp_rlhf_models/wisdom_logs"

def get_safe_filename(name):
    """Sanitizes a string to be a safe filename."""
    return "".join(c for c in name if c.isalnum() or c in (' ', '_')).strip()

@socketio.on('get_wisdom_categories')
def handle_get_wisdom_categories():
    """Scans for and returns a list of existing wisdom categories."""
    try:
        os.makedirs(WISDOM_LOG_DIR, exist_ok=True)
        categories = [f.replace('.md', '') for f in os.listdir(WISDOM_LOG_DIR) if f.endswith('.md')]
        emit('wisdom_categories_update', {'categories': sorted(categories)})
    except Exception as e:
        logging.error(f"Error getting wisdom categories: {e}")
        emit('system_notification', {'message': f'Error loading categories: {e}', 'isError': True})

@socketio.on('get_wisdom_content')
def handle_get_wisdom_content(data):
    """Fetches the content of a specific wisdom category file."""
    try:
        category_name = data.get('category')
        if not category_name:
            raise ValueError("Category name is required.")
        
        safe_category = get_safe_filename(category_name)
        filename = os.path.join(WISDOM_LOG_DIR, f"{safe_category}.md")

        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                content = f.read()
            emit('wisdom_content_update', {'category': category_name, 'content': content})
        else:
            emit('wisdom_content_update', {'category': category_name, 'content': '# Not Found\n\nThis wisdom log does not exist.'})
    except Exception as e:
        logging.error(f"Error getting wisdom content for '{data.get('category')}': {e}")
        emit('system_notification', {'message': f"Error loading wisdom content: {e}", 'isError': True})

@socketio.on('delete_wisdom_category')
def handle_delete_wisdom_category(data):
    """Deletes a wisdom category file."""
    try:
        category_name = data.get('category')
        if not category_name:
            raise ValueError("Category name is required.")

        safe_category = get_safe_filename(category_name)
        filename = os.path.join(WISDOM_LOG_DIR, f"{safe_category}.md")

        if os.path.exists(filename):
            os.remove(filename)
            logging.info(f"Deleted wisdom category: {category_name}")
            handle_get_wisdom_categories() # Refresh the list for all clients
            emit('system_notification', {'message': f"Category '{category_name}' deleted."})
        else:
            raise FileNotFoundError("Category file not found.")
    except Exception as e:
        logging.error(f"Error deleting wisdom category '{data.get('category')}': {e}")
        emit('system_notification', {'message': f"Error deleting category: {e}", 'isError': True})

@socketio.on('archive_to_wisdom_category')
def handle_archive_to_wisdom_category(data):
    """Archives a specific message to a given wisdom category."""
    try:
        category = data.get('category')
        message = data.get('message')
        
        if not category or not message:
            raise ValueError("Category and message are required.")

        # Basic sanitization for filename
        safe_category = get_safe_filename(category)
        if not safe_category:
            raise ValueError("Invalid category name.")

        filename = os.path.join(WISDOM_LOG_DIR, f"{safe_category}.md")
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(filename, "a", encoding="utf-8") as f:
            f.write(f"## Archived on {timestamp}\n\n")
            f.write(f"**{message['sender']}:**\n")
            f.write(f"{message['text']}\n\n")
            f.write("---\n\n")
        
        logging.info(f"Archived message to wisdom category: {safe_category}")
        emit('system_notification', {'message': f"Saved to '{safe_category}' wisdom log."})

    except Exception as e:
        logging.error(f"Error archiving to wisdom category: {e}")
        emit('system_notification', {'message': f'Error saving wisdom: {e}', 'isError': True})


# --- NEW RLHF ARCHIVING FUNCTION ---
@socketio.on('archive_session')
def handle_archive_session():
    """Saves the current chat history as a Wisdom Log."""
    try:
        log_dir = "harp_rlhf_models/wisdom_logs"
        os.makedirs(log_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = os.path.join(log_dir, f"wisdom_log_{timestamp}.md")

        with open(filename, "w") as f:
            f.write(f"# Wisdom Log - {timestamp}\n\n")
            for msg in app_state['chat_history']:
                f.write(f"**{msg['sender']}:**\n{msg['text']}\n\n---\n\n")
        
        logging.info(f"Session successfully archived to {filename}")
        emit('system_notification', {'message': f'Session archived as {filename}'})

    except Exception as e:
        logging.error(f"Error archiving session: {e}")
        emit('system_notification', {'message': f'Error archiving session: {e}'})
