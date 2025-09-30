import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import SavedListItem from "@/components/SavedListItem";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function SavedPage() {
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
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
