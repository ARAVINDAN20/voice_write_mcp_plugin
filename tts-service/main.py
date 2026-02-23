from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import logging
import asyncio
import io
import edge_tts
import tempfile
import os
import subprocess
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("tts-service")

app = FastAPI(title="VoiceWrite TTS Service", version="4.0.0")

# --- TTS State ---
TTS_AVAILABLE = True
AUDIO_QUEUE = asyncio.Queue()

# Edge TTS voices (Microsoft Neural voices - high quality, cloud-based)
EDGE_VOICES = [
    "en-US-AriaNeural",      # Female, warm (af_heart equivalent)
    "en-US-JennyNeural",     # Female, friendly (af_bella equivalent)
    "en-US-GuyNeural",       # Male, professional (af_nicole equivalent)
    "en-US-DavisNeural",      # Male, clear (af_nova equivalent)
    "en-US-TonyNeural",       # Male, deep (af_river equivalent)
    "en-US-ChristopherNeural",# Male, authoritative (am_adam equivalent)
    "en-US-EricNeural",       # Male, casual (am_michael equivalent)
    "en-US-BrandonNeural",    # Male, young (am_onyx equivalent)
    "en-US-JasonNeural",      # Male, mature (am_echo equivalent)
    "en-US-SteffanNeural",    # Male, energetic (am_puck equivalent)
]

# Voice mapping for user-friendly names
VOICE_MAP = {
    "af_heart": "en-US-AriaNeural",
    "af_bella": "en-US-JennyNeural",
    "af_nicole": "en-US-GuyNeural",
    "af_nova": "en-US-DavisNeural",
    "af_river": "en-US-TonyNeural",
    "am_adam": "en-US-ChristopherNeural",
    "am_michael": "en-US-EricNeural",
    "am_onyx": "en-US-BrandonNeural",
    "am_echo": "en-US-JasonNeural",
    "am_puck": "en-US-SteffanNeural",
}

DEFAULT_VOICE = "en-US-AriaNeural"

async def play_audio_file(filepath: str):
    """Play audio file through system speakers using ffplay or aplay"""
    try:
        # Try ffplay first (better quality)
        result = subprocess.run(
            ['ffplay', '-nodisp', '-autoexit', '-loglevel', 'quiet', filepath],
            capture_output=True,
            timeout=30
        )
        logger.info(f"✅ Audio played via ffplay")
    except FileNotFoundError:
        try:
            # Fallback to aplay
            result = subprocess.run(
                ['aplay', '-q', filepath],
                capture_output=True,
                timeout=30
            )
            logger.info(f"✅ Audio played via aplay")
        except FileNotFoundError:
            logger.warning("⚠️ No audio player found (ffplay/aplay)")
    except Exception as e:
        logger.error(f"❌ Audio playback error: {e}")

async def audio_player_worker():
    """Background worker to play audio from queue"""
    while True:
        try:
            filepath = await AUDIO_QUEUE.get()
            if filepath is None:
                break
            await play_audio_file(filepath)
            AUDIO_QUEUE.task_done()
        except Exception as e:
            logger.error(f"Worker error: {e}")

@app.on_event("startup")
async def startup_event():
    logger.info("="*60)
    logger.info("🎙️ VoiceWrite TTS Service Starting...")
    logger.info("="*60)
    logger.info("🔊 Using Edge TTS (Microsoft Neural Voices)")
    logger.info("🌐 Cloud-based, high-quality, no model downloads")
    logger.info(f"🎤 Available voices: {len(EDGE_VOICES)}")
    logger.info("🚀 Service ready!")
    
    # Start background audio player
    asyncio.create_task(audio_player_worker())

class TTSRequest(BaseModel):
    text: str
    voice: str = "af_heart"
    speed: float = 1.0

@app.get("/health")
def health_check():
    return {
        "status": "ready",
        "tts_available": TTS_AVAILABLE,
        "engine": "Edge TTS (Microsoft Neural)",
        "voices": list(VOICE_MAP.keys()),
        "offline": False,
        "model_size": "0 MB (cloud-based)"
    }

@app.get("/voices")
def list_voices():
    return {
        "voices": list(VOICE_MAP.keys()),
        "default": "af_heart",
        "tts_available": TTS_AVAILABLE,
        "engine": "Edge TTS",
        "offline": False,
        "description": "Microsoft Azure Neural TTS - High quality cloud voices"
    }

@app.post("/speak")
async def speak_endpoint(request: TTSRequest):
    """Generate speech asynchronously (non-blocking)"""
    if not TTS_AVAILABLE:
        raise HTTPException(status_code=503, detail="TTS unavailable")

    # Validate text
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Empty text")
    
    # Truncate if too long
    text = request.text[:500] if len(request.text) > 500 else request.text
    
    # Map voice
    voice = VOICE_MAP.get(request.voice, DEFAULT_VOICE)

    logger.info(f"🎤 Generating TTS: '{text[:50]}...' voice={voice}")

    try:
        # Generate audio using Edge TTS
        communicate = edge_tts.Communicate(text, voice)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        temp_filepath = temp_file.name
        temp_file.close()
        
        await communicate.save(temp_filepath)
        
        file_size = os.path.getsize(temp_filepath)
        logger.info(f"✅ Generated {file_size} bytes of audio")
        
        # Queue for playback (play asynchronously)
        await AUDIO_QUEUE.put(temp_filepath)
        logger.info(f"🔊 Audio queued for playback through speakers")
        
        # Return success immediately (audio plays in background)
        return Response(
            content=b"",
            media_type="application/json",
            headers={
                "X-Audio-File": temp_filepath,
                "X-Audio-Size": str(file_size),
                "X-Voice": voice
            }
        )
        
    except Exception as e:
        logger.error(f"❌ TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speak-sync")
async def speak_endpoint_sync(request: TTSRequest):
    """Generate speech and wait for playback to complete (blocking)"""
    if not TTS_AVAILABLE:
        raise HTTPException(status_code=503, detail="TTS unavailable")

    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Empty text")
    
    text = request.text[:500] if len(request.text) > 500 else request.text
    voice = VOICE_MAP.get(request.voice, DEFAULT_VOICE)

    logger.info(f"🎤 Generating TTS (sync): '{text[:50]}...' voice={voice}")

    try:
        # Generate audio
        communicate = edge_tts.Communicate(text, voice)
        
        # Save to temp file
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        temp_filepath = temp_file.name
        temp_file.close()
        
        await communicate.save(temp_filepath)
        
        file_size = os.path.getsize(temp_filepath)
        logger.info(f"✅ Generated {file_size} bytes, playing now...")
        
        # Play synchronously (wait for completion)
        await play_audio_file(temp_filepath)
        
        # Cleanup
        try:
            os.unlink(temp_filepath)
        except:
            pass
        
        return {
            "status": "played",
            "size": file_size,
            "voice": voice,
            "engine": "Edge TTS"
        }
        
    except Exception as e:
        logger.error(f"❌ TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
