import React from 'react'
import { useAuth } from './use-auth-client'
import SwipeToRevealActions from 'react-swipe-to-reveal-actions'
import { set, get } from 'idb-keyval'
import AddChild from './components/AddChild'

function ChildList() {
  const [actor, setActor] = React.useState(null)
  const [children, setChildren] = React.useState(null)
  const [newChild, setNewChild] = React.useState(null)

  const initActor = () => {
    import('../declarations/backend').then((module) => {
      const actor = module.createActor(module.canisterId, {})
      setActor(actor)
    })
  }

  React.useEffect(() => {
    initActor()
  }, [])

  React.useEffect(() => {
    getChildren()
  }, [actor])

  function getChildren() {
    // Check if IndexedDB already has childList values before calling IC
    // set("balance-2vxsx-fae-3", 100);
    get('childList').then(async (val) => {
      if (val === undefined) {
        actor?.getChildren().then(async (returnedChilren) => {
          if ('ok' in returnedChilren) {
            const children = Object.values(returnedChilren)
            const updatedChildrenData = await Promise.all(
              children[0].map(async (child) => {
                const balance = await getBalance(child.id)
                return {
                  ...child,
                  balance: balance
                }
              })
            )

            setChildren(updatedChildrenData)
            set('childList', updatedChildrenData)
          } else {
            console.error(returnedChilren.err)
          }
        })
      } else {
        const updatedChildrenData = await Promise.all(
          val.map(async (child) => {
            const balance = await getBalance(child.id)
            return {
              ...child,
              balance: balance
            }
          })
        )
        setChildren(updatedChildrenData)
      }
    })
  }

  async function getBalance(childID) {
    return new Promise((resolve, reject) => {
      let bal
      get('balance-' + childID)
        .then((val) => {
          if (val === undefined) {
            actor?.getBalance(childID).then((returnedBalance) => {
              set('balance-' + childID, parseInt(returnedBalance))
              resolve(returnedBalance)
            })
          } else {
            bal = val
            resolve(bal)
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  function handleAddChild(e) {
    e.preventDefault()
    const inputs = e.target.querySelectorAll('input')
    const child_name = e.target.querySelector('input[name="child_name"]').value
    const child_object = { name: child_name }
    // API call addChild
    actor?.addChild(child_object).then((returnedAddChild) => {
      if ('ok' in returnedAddChild) {
        setNewChild(child_name)
        // update indexedDB childList
        // update children variable with setChildren
        inputs.forEach((input) => {
          input.value = ''
        })
      } else {
        console.error(returnedAddChild.err)
      }
    })
    return false
  }

  const { whoamiActor, logout } = useAuth()

  const me = async () => {
    const whoami = await whoamiActor.whoami()
    console.log(whoami)
  }

  function handleDelete(id) {
    console.log('delete clicked for child ' + id)
  }

  function handleUpdate(id) {
    console.log('edit clicked for child ' + id)
  }

  const getActions = (id) => [
    {
      content: (
        <div className='action-btn edit'>
          <span>EDIT</span>
        </div>
      ),
      onClick: () => handleUpdate(id)
    },
    {
      content: (
        <div className='action-btn delete'>
          <span>DELETE</span>
        </div>
      ),
      onClick: () => handleDelete(id)
    }
  ]

  const swipeContainerStyles = {
    backgroundColor: '#FFF',
    paddingLeft: '1rem'
  }

  return (
    <div className="container">

<button id="logout" onClick={logout}>
        log out
      </button>

      <h2>My Children</h2>
      {/* <button onClick={me}>
        Me
      </button> */}



{children ? 
  <div className="example">
      <ul className="child-list">
      {children.length > 0 &&
          children.map(child => (
          <li key={child.id} className="child-list-item">
          <div>{child.name} {child.balance}</div>
            <SwipeToRevealActions
              actionButtons={getActions(child.id)}
              actionButtonMinWidth={70}
              containerStyle={swipeContainerStyles}
              hideDotsButton={true}
              // hideDotsButton={item.index > 5}
              // onOpen={() => console.log('Item opened')}
              // onClose={() => console.log('Item closed')}
            >
            </SwipeToRevealActions>

          </li>
        ))}
      </ul>
</div>
    : <p>Loading...</p>}

      <h4>Add a child</h4>
        <AddChild 
          handleAddChild = {handleAddChild} 
          // childID = {selectedChild}
        />
    </div>



  );
  }

export default ChildList;