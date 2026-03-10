#!/bin/bash

# Start the Python Flask backend on port 5000 in the background
echo "Starting Python ML Backend..."
cd python-backend
source venv/bin/activate
python3 app.py &
PYTHON_PID=$!
cd ..

# Start the Next.js frontend on port 3000
echo "Starting Next.js Frontend..."
npm run dev

# When Next.js process stops (e.g. user hits Ctrl+C), kill the python backend too
kill $PYTHON_PID
