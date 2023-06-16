import * as React from "react";
// import { get } from "idb-keyval";
import dc from "../assets/images/dc-thin-white.svg";

const Balance = (props) => {

  // const childName = get("selectedChildName");
  // const childID = get("selectedChild");
  // const childBalance = get("balance-" + childID);

  // const childName = "Jake";
  // const childID = "abc-123";
  // const childBalance = "147";

  return (
      <>
        <p className="name">{props.childName}</p>
        {props.childBalance >= 0 &&
          <p className="balance"><img src={dc} className="dc-img-big" alt="DooCoins symbol" />{props.childBalance}</p>
        }
      </>
  );
};

export default Balance;