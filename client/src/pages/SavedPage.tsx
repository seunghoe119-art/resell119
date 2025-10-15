import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import SavedListItem from "@/components/SavedListItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Post } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function SavedPage() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resell_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(row => ({
        id: row.id,
        createdAt: new Date(row.created_at),
        productName: row.product_name,
        brand: row.brand,
        purchaseDate: row.purchase_date,
        usageCount: row.usage_count,
        condition: row.condition,
        conditionNote: row.condition_note,
        baseItems: row.base_items,
        extraItems: row.extra_items,
        features: row.features,
        purchasePrice: row.purchase_price,
        askingPrice: row.asking_price,
        secretPurchasePrice: row.secret_purchase_price,
        tradeTypes: row.trade_types,
        tradeArea: row.trade_area,
        nego: row.nego,
        aiDraft: row.ai_draft,
        pendingDraft: row.pending_draft,
        finalDraft: row.final_draft,
      })) as Post[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">저장된 글</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12" data-testid="loading-saved">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <SavedListItem
                  key={post.id}
                  id={post.id}
                  productName={post.productName}
                  createdAt={new Date(post.createdAt)}
                  onClick={() => setLocation(`/?id=${post.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4" data-testid="text-empty-state">
                저장된 판매글이 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                새로운 판매글을 작성해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
