'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hasSupabaseEnv } from '@/lib/supabase/env'

const VID_KEY = 'mersao:vid'
const SENT_KEY = 'mersao:visita-enviada'

function novoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* segue para o plano B */
  }
  // plano B (navegadores antigos): UUID v4 simples
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function idDoVisitante(): string {
  try {
    const guardado = localStorage.getItem(VID_KEY)
    if (guardado && /^[0-9a-f-]{36}$/i.test(guardado)) return guardado
    const id = novoId()
    localStorage.setItem(VID_KEY, id)
    return id
  } catch {
    return novoId() // sem localStorage: conta como visitante novo a cada abertura
  }
}

function descobrirOrigem(): string {
  try {
    const ua = navigator.userAgent || ''
    const params = new URLSearchParams(window.location.search)
    const utm = (params.get('utm_source') || params.get('src') || '').toLowerCase()
    const ref = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''
    const junto = `${utm} ${ref}`

    if (/instagram/.test(junto) || /Instagram/i.test(ua)) return 'instagram'
    if (/whatsapp|wa\.me/.test(junto)) return 'whatsapp'
    if (/facebook|fb\.com/.test(junto) || params.has('fbclid') || /FBAN|FBAV/.test(ua)) return 'facebook'
    if (/tiktok/.test(junto) || /musical_ly|TikTok/i.test(ua)) return 'tiktok'
    if (/google|gclid/.test(junto) || params.has('gclid')) return 'google'
    if (!ref && !utm) return 'direto'
    if (ref && ref.endsWith(window.location.hostname)) return 'direto'
    return 'outro'
  } catch {
    return 'direto'
  }
}

function descobrirAparelho(): string {
  try {
    const ua = navigator.userAgent || ''
    if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet'
    if (/Mobi|iPhone|Android/i.test(ua)) return 'celular'
    return 'computador'
  } catch {
    return 'outro'
  }
}

/**
 * Conta a visita (sem cookies de terceiros e sem dados pessoais).
 * - 1 aviso por sessão do navegador (recarregar a página não conta de novo);
 * - o banco guarda no máximo 1 visitante por dia e ignora o administrador logado;
 * - qualquer falha é silenciosa: contar visita nunca pode atrapalhar o site.
 */
export default function VisitTracker() {
  useEffect(() => {
    if (!hasSupabaseEnv) return
    try {
      if (sessionStorage.getItem(SENT_KEY)) return
    } catch {
      /* sem sessionStorage: segue */
    }

    const enviar = () => {
      try {
        const sb = createClient()
        void Promise.resolve(
          sb.rpc('registrar_visita', {
            p_visitante: idDoVisitante(),
            p_origem: descobrirOrigem(),
            p_dispositivo: descobrirAparelho(),
          }),
        )
          .then((r) => {
            if (!r?.error) {
              try {
                sessionStorage.setItem(SENT_KEY, '1')
              } catch {
                /* ok */
              }
            }
          })
          .catch(() => undefined)
      } catch {
        /* contar visita nunca pode derrubar o site */
      }
    }

    // espera um instante para não competir com o carregamento do site
    const t = window.setTimeout(enviar, 1500)
    return () => window.clearTimeout(t)
  }, [])

  return null
}
