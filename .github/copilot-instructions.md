<!-- Copilot / AI agent instructions for the Life_ai-os repo -->
# Quick orientation

This repository runs a small Flask + SocketIO app (entry: `app.py`) that acts as the HARP collective. The app uses the Google Gemini (google-generativeai) SDK and stores RLHF session archives in `harp_rlhf_models/wisdom_logs/`.

# What matters most to be immediately productive

- Primary runtime: `app.py` (Flask app with SocketIO). Key flows: connect -> `handle_connect`, user commands -> `handle_ezra_command` -> background task `gemini_background_task`.
- Model configuration: `system/HARP_Model_Ground_Truth.md` documents the exact Gemini model names used (`gemini-2.5-pro`, `gemini-2.5-flash`). See `app.py` constants at the top (PRIMARY_PRO_MODEL, PRIMARY_FLASH_MODEL).
- Deployment: `render.yaml` contains the canonical production start command (gunicorn + geventwebsocket worker). Use that command for production-like runs.
- Local debugging helpers: `debug_models.py` and `test_models.py` are small scripts to list/test available Gemini models. Run them to validate API key + model availability.

# Conventions and patterns specific to this repo

- Gevent-first: `gevent.monkey.patch_all()` must be imported and run before other network or threading libraries (see top of `app.py`). Do not reorder.
- SocketIO background tasks: async work uses `socketio.start_background_task(...)` which expects plain functions (not coroutines). Keep compatibility with gevent workers.
- File/attachment flow: attachments are saved into `uploads/` with a SID-prefixed filename; cleaned up after processing in `gemini_background_task`.
- Wisdom logs are Markdown files in `harp_rlhf_models/wisdom_logs/` and follow the naming convention `wisdom_log_YYYY-MM-DD_HH-MM-SS.md` (see `handle_archive_session`).

# Typical developer workflows

- Local dev server (quick):
  - Ensure `GOOGLE_API_KEY` env var is set.
  - Install dependencies from `requirements.txt` (pip install -r requirements.txt).
  - Run `python app.py` for quick debugging (Flask dev server). Note: production uses gunicorn (below).
- Production-like run (exact from `render.yaml`):
  - gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker -b 0.0.0.0:10000 app:app
- Validate Gemini configuration:
  - `python debug_models.py` or `python test_models.py` to list models and test the configured names.

# Files to inspect when changing behavior

- `app.py` — core application logic and everything related to intent classification (`classify_intent`), prompt composition, model selection/fallback, image placeholder flow, and archiving.
- `harp_rlhf_models/README.md` — documents the purpose and where wisdom logs live.
- `system/HARP_Model_Ground_Truth.md` — authoritative list of model names used in this deployment.
- `templates/index.html` — client-side UI; useful if updating events, IDs, or expected SocketIO messages (open it when changing events emitted in `app.py`).

# Examples and quick patterns to follow (copy-paste friendly)

- Emit updated state after changes to `app_state`:
  - socketio.emit('os_update', {'state': app_state}, room=sid)
- Create a safe filename from user input: use `get_safe_filename(name)` which strips unsafe characters.
- Add a new SocketIO event handler: keep logic small and push heavy work to `socketio.start_background_task(...)`.

# Integration and external dependencies

- Google Gemini SDK (`google-generativeai`) - configured using `GOOGLE_API_KEY`. Many functions rely on `genai.GenerativeModel` and `genai.upload_file`.
- SocketIO client protocol: the client expects `os_update`, `wisdom_categories_update`, `wisdom_content_update`, and `system_notification` events. Maintain these names if changing behavior.

# Edge cases and gotchas discovered in the codebase

- Model availability: code falls back from `PRIMARY_PRO_MODEL` to `FALLBACK_PRO_MODEL` if a quick `generate_content` check fails. When adding models, update `system/HARP_Model_Ground_Truth.md` and test with `debug_models.py`.
- File cleanup: temporary uploads are removed after use; ensure background tasks always delete the local file to avoid disk growth.
- Gevent ordering: importing or initializing other async/event libs before gevent monkey patching can cause subtle issues. Keep the patch at the top.

# What not to change lightly

- The `gevent.monkey.patch_all()` placement and the Gunicorn worker class in `render.yaml` — these are required for production stability.
- Socket event names and payload shapes — the frontend (templates/index.html) expects specific event names and state shape.

# Where to add tests and smoke checks

- Add small unit tests around filename sanitization and wisdom-log read/write in `harp_rlhf_models/`.
- Add integration smoke scripts similar to `debug_models.py` that validate the full `gemini_background_task` flow using a short prompt and mocked genai responses.

# Closing

If anything in these notes is unclear or you want a different level of detail (event contract table, example client messages, or automated smoke tests), tell me which part to expand.
