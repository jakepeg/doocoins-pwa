import React, {useState} from 'react'

function ImageUpload(props) {
  // const childID = 'ashasdkjahsd'
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const uploadImage = async e => {
    const files = e.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'doozone')
    // data.append('allowed_formats', 'jpg')
    // data.append('format', 'jpg')
    data.append("public_id", props.selectedChild)
    setLoading(true)
    const res = await fetch(
      'https://api.cloudinary.com/v1_1/jakepeg/image/upload',
      {
        method: 'POST',
        body: data
      }
    )
    const file = await res.json()

    setImage(file.secure_url)
    setLoading(false)
  }

  function addDefaultSrc(ev){
    ev.target.src = 'https://res.cloudinary.com/jakepeg/image/upload/c_scale,r_15,w_30/profile_e96gd0.png';
  }

  return (
    <div className="image-upload">


<label htmlFor="file">
<img onError={addDefaultSrc} alt="profile pic" className="profile-img-header" src={`https://res.cloudinary.com/jakepeg/image/upload/c_scale,r_15,w_30/doozone/${props.selectedChild}.jpg`}/>
</label>

      <input 
        type="file"
        name="file"
        id="file"
        onChange={uploadImage} />

      {loading ? (
        <h3>LOADING IMAGE...</h3>
      ) : (
        <h3>LOADED</h3>
      )}

    </div>
  )
}

export default ImageUpload