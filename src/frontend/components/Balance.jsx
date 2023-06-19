import * as React from "react";
import dc from "../assets/images/dc-thin-white.svg";

const Balance = (props) => {

  return (
      <div className={props.isModalOpen}>
        <p className={"name"}>{props.childName}</p>
        {props.childBalance >= 0 &&
          <p className="balance"><img src={dc} className="dc-img-big" alt="DooCoins symbol" />{props.childBalance}</p>
        }
      </div>
  );
};

export default Balance;