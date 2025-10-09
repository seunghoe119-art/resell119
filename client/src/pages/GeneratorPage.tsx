import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import PreviewPane from "@/components/PreviewPane";
import AiDraftForm from "@/components/AiDraftForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post } from "@shared/schema";
import { formatAdditionalInfo } from "@/lib/formatAdditionalInfo";

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const [aiDraft, setAiDraft] = useState("");
  const [mergedContent, setMergedContent] = useState("");
  const [briefDescription, setBriefDescription] = useState("");

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
    deliveryFee: "",
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
        deliveryFee: "",
      });
      if (loadedPost.productName && loadedPost.productName !== "AI 생성 판매글") {
        setBriefDescription(loadedPost.productName);
      }
      if (loadedPost.additionalDescription) {
        setAiDraft(loadedPost.additionalDescription);
      }
    }
  }, [loadedPost]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const postData = {
        productName: briefDescription || formData.productName || "AI 생성 판매글",
        brand: formData.brand || null,
        purchaseDate: formData.purchaseDate || null,
        usageCount: formData.usageCount ? parseInt(formData.usageCount) : null,
        condition: formData.condition || null,
        additionalDescription: mergedContent || aiDraft || formData.additionalDescription || null,
        basicAccessories: formData.basicAccessories.length > 0 ? formData.basicAccessories : null,
        otherAccessories: formData.otherAccessories || null,
        features: formData.features || null,
        originalPrice: formData.originalPrice || null,
        sellingPrice: formData.sellingPrice || null,
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
      deliveryFee: "",
    });
    setAiDraft("");
    setMergedContent("");
    setBriefDescription("");
    setLocation("/");
  };

  const mergeMutation = useMutation({
    mutationFn: async () => {
      const additionalInfo = formatAdditionalInfo(formData);
      return apiRequest("POST", "/api/modify-content", {
        existingContent: aiDraft,
        additionalInfo: additionalInfo,
      });
    },
    onSuccess: (data: any) => {
      if (data.content) {
        setMergedContent(data.content);
        toast({
          title: "병합 완료",
          description: "AI 초안과 추가 정보가 성공적으로 병합되었습니다.",
        });
      }
    },
    onError: () => {
      toast({
        title: "병합 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  // Reset merged content when AI draft or form data changes
  useEffect(() => {
    if (mergedContent) {
      setMergedContent("");
    }
  }, [aiDraft, formData]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="space-y-8">
          {/* AI Draft Form */}
          <AiDraftForm 
            briefDescription={briefDescription}
            onPreviewUpdate={setAiDraft}
            onBriefDescriptionChange={setBriefDescription}
          />

          {/* Mobile Preview - Shows after AI form on mobile only */}
          <div className="lg:hidden">
            <PreviewPane
              formData={formData}
              aiDraft={aiDraft}
              mergedContent={mergedContent}
              onSave={() => saveMutation.mutate()}
              onReset={handleReset}
              onMerge={() => mergeMutation.mutate()}
              isSaving={saveMutation.isPending}
              isMerging={mergeMutation.isPending}
            />
          </div>

          {/* Desktop Preview */}
          <div className="hidden lg:block">
            <PreviewPane
              formData={formData}
              aiDraft={aiDraft}
              mergedContent={mergedContent}
              onSave={() => saveMutation.mutate()}
              onReset={handleReset}
              onMerge={() => mergeMutation.mutate()}
              isSaving={saveMutation.isPending}
              isMerging={mergeMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}