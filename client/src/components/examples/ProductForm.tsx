import { useState } from 'react'
import ProductForm from '../ProductForm'

export default function ProductFormExample() {
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    purchaseDate: '',
    usageCount: '',
    condition: '',
    additionalDescription: '',
    basicAccessories: [] as string[],
    otherAccessories: '',
    features: '',
    originalPrice: '',
    sellingPrice: '',
    transactionMethods: [] as string[],
    directLocation: '',
    negotiable: '',
  })

  return (
    <div className="p-6 max-w-2xl">
      <ProductForm formData={formData} onChange={setFormData} />
    </div>
  )
}
