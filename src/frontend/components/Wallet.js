import * as React from "react";
import dc from '../images/dc-thin.svg';
import microchip from '../images/microchip.svg';

const Wallet = (props) => {

  return (
      <>
      {props.balance >= 0 &&
        <p className="balance"><img src={dc} className="dc-img-big" alt="DooCoins symbol" />{props.balance}</p>
      }
        <div className="wallet-footer">
          <p className="wallet-name">{props.name}</p>
          <img src={microchip} className="microchip" alt="DooCoins microchip" />
        </div>
      </>
  );
};

export default Wallet;