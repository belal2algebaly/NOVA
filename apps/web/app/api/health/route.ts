import { NextResponse } from 'next/server'; import { isSupabaseConfigured } from '../../../lib/config';
export function GET(){return NextResponse.json({service:'nova-web',phase:2,status:'ok',supabaseConfigured:isSupabaseConfigured,timestamp:new Date().toISOString()});}
