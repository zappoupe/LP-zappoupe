import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // O Webhook envia o registro inserido
    const { record } = await req.json()

    if (!record || !record.email) throw new Error('E-mail não encontrado no registro.')

    console.log(`Convidando: ${record.email}`)

    // 1. Cria o usuário e envia o e-mail de convite automaticamente
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      record.email,
      {
        data: {
          full_name: record.nome,
          phone: record.telefone,
          invited_by: record.dono_id,
          is_family_member: true
        }
      }
    )

    if (inviteError) throw inviteError

    // 2. Vincula o ID do novo usuário ao registro da família
    await supabaseAdmin
      .from('membros_familia')
      .update({ convidado_id: inviteData.user.id })
      .eq('id', record.id)

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400 
    })
  }
})