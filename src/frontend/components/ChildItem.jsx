import React from 'react'
import SwipeToRevealActions from 'react-swipe-to-reveal-actions'
import EditIcon from '/edit.svg'
import DeleteIcon from '/delete.svg'

const ChildItem = ({ child, handleUpdateOpenItemId, openItemId, index }) => {
  const [showBalance, setShowBalance] = React.useState(true)
  const isItemOpen = openItemId === child.id

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // :r0: format from library
      const actionsElement = document.getElementById(`:r${index}:`)
      if (!isItemOpen && actionsElement) {
        setShowBalance(true)
      }
    }
  }, [isItemOpen])
  
  function handleDelete(id) {
    console.log('delete clicked for child ' + id)
    setShowBalance(true)
  }

  function handleUpdate(id) {
    console.log('edit clicked for child ' + id)
    setShowBalance(true)
  }

  const getActions = (id) => [
    {
      content: (
        <div className='action-btn edit'>
          <img src={EditIcon} alt="edit" />
        </div>
      ),
      onClick: () => handleUpdate(id)
    },
    {
      content: (
        <div className='action-btn delete'>
          <img src={DeleteIcon} alt="delete" />
        </div>
      ),
      onClick: () => handleDelete(id)
    }
  ]

  const toggleBalance = (isOpen) => {
    setShowBalance(!isOpen)
    handleUpdateOpenItemId(isOpen ? child.id : null)
  }

  const swipeContainerStyles = {
    backgroundColor: '#FFF',
    paddingLeft: '1rem'
  }

  return (
    <li className='child-list-item'>
      <div style={{ flex: 1 }}>{child.name}</div>
      {showBalance && <div className='child-balance'>{child.balance}</div>}
        <SwipeToRevealActions
          actionButtons={getActions(child.id)}
          actionButtonMinWidth={120}
          containerStyle={swipeContainerStyles}
          hideDotsButton={true}
          onOpen={() => toggleBalance(true)}
          onClose={() => toggleBalance(false)}
        />
    </li>
  )
}

export default ChildItem
