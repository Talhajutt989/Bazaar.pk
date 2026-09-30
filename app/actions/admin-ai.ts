'use server';

import { getSession } from '@/lib/auth';
import { queryAIGrowthAdvisor, getSellerGrowthAnalytics } from '@/lib/ai-seller-analytics';
import { supabaseAdmin } from '@/lib/supabase';
import { safeRevalidatePath } from '@/lib/server-utils';

export type AIAdvisorResponse = 
  | { success: true; answer: string; recommendedAction: string; relevantSellers: string[] }
  | { success: false; error: string; answer?: never; recommendedAction?: never; relevantSellers?: never };

export async function askAIGrowthAdvisor(userPrompt: string): Promise<AIAdvisorResponse> {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      throw new Error('Unauthorized: Super Admin access required');
    }

    if (!userPrompt || userPrompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    const response = await queryAIGrowthAdvisor(userPrompt);
    return {
      success: true,
      answer: response.answer,
      recommendedAction: response.recommendedAction,
      relevantSellers: response.relevantSellers,
    };
  } catch (error: any) {
    console.error('Error in AI Growth Advisor action:', error);
    return { success: false, error: error.message || 'Failed to query AI Growth Advisor' };
  }
}

export async function applySellerGrowthBoost(storeId: string, boostType: 'COMMISSION_DISCOUNT' | 'FEATURED_BADGE' | 'SPONSORED_SLOT') {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      throw new Error('Unauthorized: Super Admin access required');
    }

    if (boostType === 'COMMISSION_DISCOUNT') {
      // Temporarily lower commission to 5% to incentivize growth
      await supabaseAdmin
        .from('stores')
        .update({ commission_rate: 0.05, updated_at: new Date().toISOString() })
        .eq('id', storeId);
    } else {
      await supabaseAdmin
        .from('stores')
        .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
        .eq('id', storeId);
    }

    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/vendors');
    return { success: true, message: `Successfully applied ${boostType.replace('_', ' ')} for merchant store.` };
  } catch (error: any) {
    console.error('Error applying seller growth boost:', error);
    return { success: false, error: error.message || 'Failed to apply boost' };
  }
}
