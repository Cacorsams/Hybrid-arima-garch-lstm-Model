import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
    try {
        const response = await fetch(`${PYTHON_API_URL}/api/train`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            // The training might take a while
            signal: AbortSignal.timeout(300000)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Python API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Train API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
