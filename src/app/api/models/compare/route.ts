import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

export async function GET() {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/evaluate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Python API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        // Handle "Model not trained yet" gracefully
        if (error.message && error.message.includes("not trained yet")) {
            return NextResponse.json({
                metrics: null,
                trained: false,
                message: "Model not trained yet."
            });
        }

        console.error('Evaluate API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
