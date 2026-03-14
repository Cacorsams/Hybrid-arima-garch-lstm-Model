import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/app/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        let allData: any[] = [];
        let hasMore = true;
        const pageSize = 1000;

        while (hasMore && allData.length < limit) {
            const start = allData.length;
            const end = Math.min(start + pageSize - 1, limit - 1);

            const { data, error } = await supabase
                .from('exchange_rates')
                .select('*')
                .order('date', { ascending: false })
                .range(start, end);

            if (error) throw error;

            if (!data || data.length === 0) {
                hasMore = false;
            } else {
                allData = [...allData, ...data];
                // If we got fewer than requested, we've reached the end of the table
                if (data.length < (end - start + 1)) {
                    hasMore = false;
                }
            }
        }

        // Return ascending for charts
        return NextResponse.json(allData.reverse());
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
