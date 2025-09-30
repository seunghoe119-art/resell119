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
        productName: formData.productName,
        brand: formData.brand || null,
        purchaseDate: formData.purchaseDate || null,
        usageCount: formData.usageCount ? parseInt(formData.usageCount) : null,
        condition: formData.condition || null,
        additionalDescription: formData.additionalDescription || null,
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

  const handleAiDraftGenerated = (draft: any) => {
    setFormData({
      productName: draft.productName || "",
      brand: draft.brand || "",
      purchaseDate: "",
      usageCount: "",
      condition: draft.condition || "",
      additionalDescription: draft.additionalDescription || "",
      basicAccessories: draft.basicAccessories || [],
      otherAccessories: draft.otherAccessories || "",
      features: draft.features || "",
      originalPrice: draft.originalPrice?.toString() || "",
      sellingPrice: draft.sellingPrice?.toString() || "",
      transactionMethods: draft.transactionMethods || [],
      directLocation: draft.directLocation || "",
      negotiable: draft.negotiable || "",
    });
    
    toast({
      title: "AI 초안 생성 완료",
      description: "아래 폼에서 내용을 수정할 수 있습니다.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="overflow-y-auto">
            <AiDraftForm onDraftGenerated={handleAiDraftGenerated} />
            <ProductForm formData={formData} onChange={setFormData} />
          </div>
          <div className="lg:sticky lg:top-24 h-fit">
            <PreviewPane
              formData={formData}
              onSave={() => saveMutation.mutate()}
              onReset={handleReset}
              isSaving={saveMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
