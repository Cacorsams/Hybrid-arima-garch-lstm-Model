import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/app/lib/supabaseAdmin';

const ALLOWED_TABLES = [
  'exchange_rates',
  'arima_predictions',
  'garch_volatility',
  'lstm_predictions',
  'hybrid_predictions',
  'macro_indicators',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'exchange_rates';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const search = searchParams.get('search') || '';

  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get paginated data
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from(table)
      .select('*')
      .order('id', { ascending: false })
      .range(start, end);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
