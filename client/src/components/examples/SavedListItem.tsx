import SavedListItem from '../SavedListItem'

export default function SavedListItemExample() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <SavedListItem
        id="1"
        productName="아이폰 15 Pro"
        createdAt={new Date(Date.now() - 1000 * 60 * 30)}
        onClick={() => console.log('Item 1 clicked')}
      />
      <SavedListItem
        id="2"
        productName="삼성 갤럭시 워치 6"
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2)}
        onClick={() => console.log('Item 2 clicked')}
      />
      <SavedListItem
        id="3"
        productName="맥북 프로 14인치"
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24)}
        onClick={() => console.log('Item 3 clicked')}
      />
    </div>
  )
}
