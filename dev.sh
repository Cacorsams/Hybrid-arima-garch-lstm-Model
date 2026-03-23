#!/bin/bash

# Start the Python Flask backend on port 5000 with auto-restart
echo "Starting Python ML Backend..."
cd python-backend
source venv/bin/activate

# Auto-restart loop: restarts the backend if it crashes
(
  while true; do
    echo "[backend] Starting Flask app..."
    python3 app.py
    EXIT=$?
    echo "[backend] Flask exited with code $EXIT. Restarting in 3s..."
    sleep 3
  done
) &
PYTHON_PID=$!
cd ..

# Wait for backend to be ready before starting Next.js
echo "Waiting for Flask backend to be ready on port 5000..."
for i in $(seq 1 20); do
  if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  echo "  Attempt $i/20..."
  sleep 2
done

# Start the Next.js frontend on port 3000
echo "Starting Next.js Frontend..."
npm run dev

# When Next.js process stops (e.g. user hits Ctrl+C), kill the python backend too
kill $PYTHON_PID 2>/dev/null
wait $PYTHON_PID 2>/dev/null
echo "All processes stopped."
