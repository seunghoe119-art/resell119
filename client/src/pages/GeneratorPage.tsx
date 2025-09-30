import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import ProductForm from "@/components/ProductForm";
import PreviewPane from "@/components/PreviewPane";
import AiDraftForm from "@/components/AiDraftForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const [aiPreview, setAiPreview] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    purchaseDate: "",
    usageCount: "",
    condition: "",
    additionalDescription: "",
    basicAccessories: [] as string[],
    otherAccessories: "",
    features: "",
    originalPrice: "",
    sellingPrice: "",
    transactionMethods: [] as string[],
    directLocation: "",
    negotiable: "",
  });

  const { data: loadedPost } = useQuery<Post>({
    queryKey: ["/api/posts", postId],
    enabled: !!postId,
  });

  useEffect(() => {
    if (loadedPost) {
      setFormData({
        productName: loadedPost.productName || "",
        brand: loadedPost.brand || "",
        purchaseDate: loadedPost.purchaseDate || "",
        usageCount: loadedPost.usageCount?.toString() || "",
        condition: loadedPost.condition || "",
        additionalDescription: loadedPost.additionalDescription || "",
        basicAccessories: loadedPost.basicAccessories || [],
        otherAccessories: loadedPost.otherAccessories || "",
        features: loadedPost.features || "",
        originalPrice: loadedPost.originalPrice?.toString() || "",
        sellingPrice: loadedPost.sellingPrice?.toString() || "",
        transactionMethods: loadedPost.transactionMethods || [],
        directLocation: loadedPost.directLocation || "",
        negotiable: loadedPost.negotiable || "",
      });
    }
  }, [loadedPost]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const postData = {
        productName: formData.productName || "AI 생성 판매글",
        brand: formData.brand || null,
        purchaseDate: formData.purchaseDate || null,
        usageCount: formData.usageCount ? parseInt(formData.usageCount) : null,
        condition: formData.condition || null,
        additionalDescription: aiPreview || formData.additionalDescription || null,
        basicAccessories: formData.basicAccessories.length > 0 ? formData.basicAccessories : null,
        otherAccessories: formData.otherAccessories || null,
        features: formData.features || null,
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        sellingPrice: formData.sellingPrice ? parseInt(formData.sellingPrice) : null,
        transactionMethods: formData.transactionMethods.length > 0 ? formData.transactionMethods : null,
        directLocation: formData.directLocation || null,
        negotiable: formData.negotiable || null,
      };

      if (postId) {
        return apiRequest("PATCH", `/api/posts/${postId}`, postData);
      } else {
        return apiRequest("POST", "/api/posts", postData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "저장 완료",
        description: "판매글이 성공적으로 저장되었습니다.",
      });
      setLocation("/saved");
    },
    onError: () => {
      toast({
        title: "저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleReset = () => {
    setFormData({
      productName: "",
      brand: "",
      purchaseDate: "",
      usageCount: "",
      condition: "",
      additionalDescription: "",
      basicAccessories: [],
      otherAccessories: "",
      features: "",
      originalPrice: "",
      sellingPrice: "",
      transactionMethods: [],
      directLocation: "",
      negotiable: "",
    });
    setLocation("/");
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Draft Form - always first on mobile, first in left column on desktop */}
          <div className="order-1 lg:col-span-1">
            <AiDraftForm onPreviewUpdate={setAiPreview} />
          </div>

          {/* Preview Pane - second on mobile, right column (sticky) on desktop */}
          <div className="order-2 lg:order-3 lg:row-span-2 lg:sticky lg:top-24 lg:h-fit">
            <PreviewPane
              formData={formData}
              aiPreview={aiPreview}
              onSave={() => saveMutation.mutate()}
              onReset={handleReset}
              isSaving={saveMutation.isPending}
            />
          </div>

          {/* Product Form - third on mobile, second in left column on desktop */}
          <div className="order-3 lg:order-2 lg:col-span-1">
            <ProductForm formData={formData} onChange={setFormData} />
          </div>
        </div>
      </div>
    </div>
  );
}
