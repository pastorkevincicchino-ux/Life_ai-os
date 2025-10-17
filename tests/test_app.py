import pytest
import os
import shutil
from datetime import datetime
from app import app, socketio, get_safe_filename, app_state

# --- Fixtures ---

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="function")
def wisdom_log_setup_teardown():
    """Set up a temporary wisdom log directory for testing and tear it down after."""
    test_log_dir = "tests/temp_wisdom_logs"
    # Ensure the directory exists and is clean before the test
    if os.path.exists(test_log_dir):
        shutil.rmtree(test_log_dir)
    os.makedirs(test_log_dir)
    
    # Monkeypatch the WISDOM_LOG_DIR in the app for the duration of the test
    original_dir = "harp_rlhf_models/wisdom_logs"
    import app as main_app
    main_app.WISDOM_LOG_DIR = test_log_dir
    
    yield test_log_dir # The test runs at this point
    
    # Teardown: clean up the directory and restore original config
    shutil.rmtree(test_log_dir)
    main_app.WISDOM_LOG_DIR = original_dir

# --- Tests for get_safe_filename ---

def test_get_safe_filename_basic():
    """Tests basic sanitization of filenames."""
    assert get_safe_filename("My Test File") == "My Test File"
    assert get_safe_filename("file_with_underscores") == "file_with_underscores"
    assert get_safe_filename("file-with-hyphens") == "filewithhyphens" # Hyphens are removed
    assert get_safe_filename("file with spaces") == "file with spaces"

def test_get_safe_filename_special_chars():
    """Tests removal of special characters."""
    assert get_safe_filename("file/with/slashes") == "filewithslashes"
    assert get_safe_filename("file*?<>|:") == "file"
    assert get_safe_filename("!@#$%^&*()") == ""
    assert get_safe_filename("..\\path\\traversal") == "pathtraversal"

def test_get_safe_filename_empty_and_whitespace():
    """Tests handling of empty or whitespace-only strings."""
    assert get_safe_filename("") == ""
    assert get_safe_filename("   ") == ""
    assert get_safe_filename("  leading_and_trailing  ") == "leading_and_trailing"

# --- Tests for Wisdom Log Archiving ---

def test_archive_session_creates_log_file(client, wisdom_log_setup_teardown):
    """Tests if handle_archive_session creates a new wisdom log file."""
    log_dir = wisdom_log_setup_teardown
    
    # Simulate chat history
    app_state['chat_history'] = [
        {'sender': 'Architect', 'text': 'Hello Ezra.'},
        {'sender': 'Ezra', 'text': 'Hello Architect.'}
    ]
    
    # Use the test client's socketio instance to emit the event
    socketio_test_client = socketio.test_client(app, namespace='/')
    socketio_test_client.emit('archive_session')
    
    # Check if a file was created
    files = os.listdir(log_dir)
    assert len(files) == 1
    assert files[0].startswith("wisdom_log_")
    assert files[0].endswith(".md")

def test_archive_session_writes_correct_content(client, wisdom_log_setup_teardown):
    """Tests if the archived log file contains the correct chat history."""
    log_dir = wisdom_log_setup_teardown
    
    chat_history = [
        {'sender': 'Architect', 'text': 'This is a test.'},
        {'sender': 'Ezra', 'text': 'This is only a test.'}
    ]
    app_state['chat_history'] = chat_history
    
    socketio_test_client = socketio.test_client(app, namespace='/')
    socketio_test_client.emit('archive_session')
    
    # Read the created file and verify its content
    log_file_path = os.path.join(log_dir, os.listdir(log_dir)[0])
    with open(log_file_path, "r") as f:
        content = f.read()
        
    assert "# Wisdom Log" in content
    assert "**Architect:**\nThis is a test." in content
    assert "**Ezra:**\nThis is only a test." in content
    assert "---\n\n" in content

def test_archive_to_wisdom_category(client, wisdom_log_setup_teardown):
    """Tests archiving a single message to a specific category."""
    log_dir = wisdom_log_setup_teardown
    
    category = "Test Category"
    message = {'sender': 'Ezra', 'text': 'A piece of wisdom.'}
    
    socketio_test_client = socketio.test_client(app, namespace='/')
    socketio_test_client.emit('archive_to_wisdom_category', {'category': category, 'message': message})
    
    # Check if the file was created and has the correct content
    expected_filename = os.path.join(log_dir, "Test Category.md")
    assert os.path.exists(expected_filename)
    
    with open(expected_filename, "r") as f:
        content = f.read()
        
    assert "## Archived on" in content
    assert "**Ezra:**\nA piece of wisdom." in content
    assert "---\n\n" in content
