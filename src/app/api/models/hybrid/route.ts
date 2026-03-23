import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/app/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const steps = body.steps || 30;

        // Fetch ARIMA
        const { data: arimaData } = await supabase
            .from('arima_predictions')
            .select('*')
            .order('forecast_date', { ascending: false })
            .limit(steps);
            
        // Fetch GARCH
        const { data: garchData } = await supabase
            .from('garch_volatility')
            .select('*')
            .order('forecast_date', { ascending: false })
            .limit(steps);
            
        // Fetch LSTM (Final Hybrid Output)
        const { data: lstmData } = await supabase
            .from('lstm_predictions')
            .select('*')
            .order('forecast_date', { ascending: false })
            .limit(steps);
            
        const arimaRows = (arimaData || []).reverse();
        const garchRows = (garchData || []).reverse();
        const lstmRows = (lstmData || []).reverse();
        
        if (lstmRows.length === 0) {
            return NextResponse.json({
                forecast: null,
                trained: false,
                message: "No forecast data found in database. Please run pipeline first."
            });
        }
        
        const arima_preds = arimaRows.map((r: any) => r.predicted_rate);
        const garch_vol = garchRows.map((r: any) => r.forecast_volatility || 0);
        const lstm_preds = lstmRows.map((r: any) => r.predicted_rate);
        const confidence_lowers = arimaRows.map((r: any) => r.confidence_interval_lower);
        const confidence_uppers = arimaRows.map((r: any) => r.confidence_interval_upper);
        
        // Single metric values (latest prediction)
        const final_arima = arima_preds[0] || 0;
        const final_garch = garch_vol[0] || 0;
        const final_combined = lstm_preds[0] || 0; 
        
        return NextResponse.json({
            forecast: {
                combined_predictions: lstm_preds,
                confidence_lowers: confidence_lowers,
                confidence_uppers: confidence_uppers,
                arima_component: final_arima,
                garch_volatility: final_garch,
                lstm_component: final_combined - final_arima,
                combined_prediction: final_combined
            },
            trained: true
        });
    } catch (error: any) {
        console.error('Hybrid API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
