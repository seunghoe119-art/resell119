import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import ProductForm from "@/components/ProductForm";
import PreviewPane from "@/components/PreviewPane";
import AiDraftForm from "@/components/AiDraftForm";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, FormData } from "@shared/schema";
import { formatAdditionalInfo } from "@/lib/formatAdditionalInfo";
import { extractPriceFromDescription } from "@/lib/extractPriceFromDescription";

export default function GeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const [aiDraft, setAiDraft] = useState("");
  const [mergedContent, setMergedContent] = useState("");
  const [briefDescription, setBriefDescription] = useState("");

  const [formData, setFormData] = useState<FormData>({
    productName: "",
    brand: "",
    purchaseDate: "",
    usageCount: 0,
    condition: "",
    conditionNote: "",
    baseItems: "" as string | string[],
    extraItems: "" as string | string[],
    features: "" as string | string[],
    purchasePrice: 0,
    askingPrice: 0,
    secretPurchasePrice: 0,
    tradeTypes: [],
    tradeArea: "",
    nego: "",
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
        usageCount: loadedPost.usageCount || 0,
        condition: loadedPost.condition || "",
        conditionNote: loadedPost.conditionNote || "",
        baseItems: loadedPost.baseItems || [],
        extraItems: loadedPost.extraItems || [],
        features: loadedPost.features || [],
        purchasePrice: loadedPost.purchasePrice || 0,
        askingPrice: loadedPost.askingPrice || 0,
        secretPurchasePrice: loadedPost.secretPurchasePrice || 0,
        tradeTypes: loadedPost.tradeTypes || [],
        tradeArea: loadedPost.tradeArea || "",
        nego: loadedPost.nego || "",
      });
      if (loadedPost.productName && loadedPost.productName !== "AI 생성 판매글") {
        setBriefDescription(loadedPost.productName);
      }
      if (loadedPost.aiDraft) {
        setAiDraft(loadedPost.aiDraft);
      }
    }
  }, [loadedPost]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const postData = {
        productName: briefDescription || formData.productName || "AI 생성 판매글",
        brand: formData.brand || null,
        purchaseDate: formData.purchaseDate || null,
        usageCount: formData.usageCount || null,
        condition: formData.condition || null,
        conditionNote: formData.conditionNote || null,
        baseItems: formData.baseItems.length > 0 ? formData.baseItems : null,
        extraItems: formData.extraItems.length > 0 ? formData.extraItems : null,
        features: formData.features.length > 0 ? formData.features : null,
        purchasePrice: formData.purchasePrice || null,
        askingPrice: formData.askingPrice || null,
        secretPurchasePrice: formData.secretPurchasePrice || null,
        tradeTypes: formData.tradeTypes.length > 0 ? formData.tradeTypes : null,
        tradeArea: formData.tradeArea || null,
        nego: formData.nego || null,
        aiDraft: mergedContent || aiDraft || null,
        pendingDraft: null,
        finalDraft: null,
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
      usageCount: 0,
      condition: "",
      conditionNote: "",
      baseItems: [],
      extraItems: [],
      features: [],
      purchasePrice: 0,
      askingPrice: 0,
      secretPurchasePrice: 0,
      tradeTypes: [],
      tradeArea: "",
      nego: "",
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

  // Extract price from briefDescription when it changes
  useEffect(() => {
    if (briefDescription) {
      const { cleanedDescription, price } = extractPriceFromDescription(briefDescription);
      
      // Update askingPrice if price was found
      if (price !== null && price !== formData.askingPrice) {
        setFormData(prev => ({
          ...prev,
          askingPrice: price
        }));
      }
    }
  }, [briefDescription]);

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

          {/* Two Column Layout for Form and Preview (Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Form */}
            <div>
              <ProductForm 
                formData={formData} 
                onChange={setFormData}
                aiPreview={aiDraft}
                onPreviewUpdate={setAiDraft}
              />
            </div>

            {/* Right Column - Preview (Desktop only) */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:h-fit">
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
    </div>
  );
}