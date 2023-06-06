import React from 'react';
import SwipeToRevealActions from "react-swipe-to-reveal-actions";

const Swiper = (children) => {

console.log(children);

  const getActions = (index) => [
    {
      content: (
        <div className="action-button-content action-button-content--edit">
          <span>EDIT</span>
        </div>
      ),
      onClick: () => alert(`Pressed the EDIT button of item #${index}`),
    },
    {
      content: (
        <div className="action-button-content action-button-content--delete">
          <span>DELETE</span>
        </div>
      ),
      onClick: () => alert(`Pressed the DELETE button of item #${index}`),
    },
  ];

  const kids = [
    {id: '2vxsx-fae-4', name: 'Emma'},
    {id: '2vxsx-fae-3', name: 'Quin'},
    {id: '2vxsx-fae-2', name: 'Jake'},
    {id: '2vxsx-fae-1', name: 'Jake'}
  ];



  return (



    <div className="example">
      <ul className="example-list">
      {children.length > 0 &&
          children[0].map(child => (
          <li className="example-list__item" key={child.id}>
            <SwipeToRevealActions
              actionButtons={getActions(child.id)}
              actionButtonMinWidth={70}
              // containerStyle={swipeContainerStyles}
              // hideDotsButton={item.index > 5}
              onOpen={() => console.log('Item opened')}
              onClose={() => console.log('Item closed')}
            >
            </SwipeToRevealActions>
            {child.name}
          </li>
        ))}
      </ul>
    </div>


  );
};

export default Swiper;
