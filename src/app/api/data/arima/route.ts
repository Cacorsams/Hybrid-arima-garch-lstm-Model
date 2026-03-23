import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/app/lib/supabaseAdmin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'forecast';
        const steps = parseInt(searchParams.get('steps') || '30', 10);

        if (action === 'forecast') {
            const { data, error } = await supabase
                .from('arima_predictions')
                .select('*')
                .order('forecast_date', { ascending: false })
                .limit(steps);

            if (error) throw error;

            const rows = (data || []).reverse();

            const price_preds = rows.map((r: any) => r.predicted_rate);
            const price_lower = rows.map((r: any) => r.confidence_interval_lower);
            const price_upper = rows.map((r: any) => r.confidence_interval_upper);
            
            let arima_order = [0, 0, 0];
            if (rows.length > 0 && rows[0].arima_order) {
                arima_order = rows[0].arima_order.replace(/[\[\]\(\)]/g, '').split(',').map(Number);
            }

            return NextResponse.json({
                steps: rows.length,
                arima_order,
                predictions: price_preds,
                confidence_lowers: price_lower,
                confidence_uppers: price_upper,
            });
        }
        
        if (action === 'metrics') {
            const { data, error } = await supabase
                .from('arima_predictions')
                .select('mae, rmse, mape, arima_order')
                .order('forecast_date', { ascending: false })
                .limit(1);

            if (error) throw error;

            const row = data?.[0] || {};
            let arima_order = [0, 0, 0];
            if (row.arima_order) {
                arima_order = row.arima_order.replace(/[\[\]\(\)]/g, '').split(',').map(Number);
            }

            return NextResponse.json({
                mae: row.mae || 0,
                rmse: row.rmse || 0,
                mape: row.mape || 0,
                order: arima_order,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
