import * as React from "react";
// import play from '../images/play.svg';
import LoadingSpinner from "./LoadingSpinner";

const ChildList = (props) => {
  const [actor, setActor] = React.useState(null);
  const [children, setChildren] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const initActor = () => {
    import("../declarations/backend")
    .then((module) => {
      const actor = module.createActor(module.canisterId, {
        agentOptions: {
          identity: props.authClient?.getIdentity(),
        },
      });
      setActor(actor);
    })
  };

  function getChildren() {
    console.log("loading children");
    setIsLoading(true);
    actor?.getChildren().then((returnedChilren) => {
      if ("ok" in returnedChilren) {
        const children = Object.values(returnedChilren);
        setChildren(children);
        console.log("children loaded");
        setIsLoading(false);
      } else {
        console.error(returnedChilren.err);
      }
    });
  }

  
  function addDefaultSrc(ev){
    ev.target.src = 'https://res.cloudinary.com/jakepeg/image/upload/c_scale,r_25,w_50/profil_pic_ktj7w8.jpg';
  }

  React.useEffect(() => {
    if (props.isAuthenticated) initActor();
  }, [props.isAuthenticated]);

  React.useEffect(() => {
    getChildren();
  }, [actor, props.newChild]);

  return (
      <>
      {isLoading ? <LoadingSpinner /> : null}
        {children.length > 0 &&
          children[0].map(child => (
            <div role="button" className={props.selectedChild === child.id ? "active-row" : "row"} key={child.id} onClick={() => props.getChild(child.id, child.name)} onKeyDown={() => props.getChild(child.id, child.name)}>
              {/* <div className="col-small"><img onError={addDefaultSrc} alt="profile pic" className="profile-img blaa" src={`https://res.cloudinary.com/jakepeg/image/upload/c_scale,r_25,w_50/doozone/${child.id}.jpg`}/></div> */}
              <div className="col-medium"><p className="col-p">{child.name}</p></div>
              {/* <div className="col-small"><img src={play} className="play-img" alt="right arrow" /></div> */}
            </div>
          ))
        }
      </>
  );
};

export default ChildList;