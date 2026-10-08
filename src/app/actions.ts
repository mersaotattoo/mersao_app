'use server'
import { revalidatePath } from 'next/cache'

// O painel chama isto depois de salvar, para o site público atualizar na hora.
export async function revalidateSite() {
  revalidatePath('/')
}
