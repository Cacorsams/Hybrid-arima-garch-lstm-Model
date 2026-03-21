import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

export async function POST() {
    try {
        const res = await fetch(`${PYTHON_API_URL}/api/garch/train`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'forecast';
        const steps = searchParams.get('steps') || '30';

        let endpoint = `${PYTHON_API_URL}/api/garch/forecast?steps=${steps}`;
        if (action === 'metrics') {
            endpoint = `${PYTHON_API_URL}/api/garch/metrics`;
        }

        const res = await fetch(endpoint, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
