import PreviewPane from '../PreviewPane'

export default function PreviewPaneExample() {
  const sampleData = {
    productName: '아이폰 15 Pro',
    brand: 'Apple',
    purchaseDate: '2024-01-15',
    usageCount: '5',
    condition: '신품급',
    additionalDescription: '거의 사용하지 않아 상태가 매우 좋습니다',
    basicAccessories: ['본체', '제품 박스', '충전기'],
    otherAccessories: '보호필름, 케이스',
    features: '5G 지원\n고성능 카메라\n긴 배터리 수명',
    originalPrice: '1500000',
    sellingPrice: '1200000',
    transactionMethods: ['직거래', '택배거래'],
    directLocation: '서울 강남구',
    negotiable: '네고 가능',
  }

  return (
    <div className="p-6 h-[600px]">
      <PreviewPane 
        formData={sampleData} 
        onSave={() => console.log('Save clicked')}
        onReset={() => console.log('Reset clicked')}
      />
    </div>
  )
}
