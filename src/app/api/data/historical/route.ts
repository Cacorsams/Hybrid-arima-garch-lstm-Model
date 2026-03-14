import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/app/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Return ascending for charts
        return NextResponse.json(data.reverse());
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
